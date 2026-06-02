"""Context-aware AI chatbot for plot agents and buyers."""

import json
from typing import Any, List, Optional
from sqlalchemy.orm import Session

from backend.models.plot import Plot
from backend.services.ai_service import active_ai_provider, ai_configured, generate_text, parse_json_from_ai
def _format_inr(amount: float) -> str:
    if amount >= 10000000:
        return f"₹{amount / 10000000:.2f} Cr"
    if amount >= 100000:
        return f"₹{amount / 100000:.2f} L"
    return f"₹{amount:,.0f}"


def _plots_context(db: Session, user_id: int, limit: int = 25) -> str:
    plots = (
        db.query(Plot)
        .filter(Plot.user_id == user_id)
        .order_by(Plot.created_at.desc())
        .limit(limit)
        .all()
    )
    if not plots:
        return "No plots in inventory yet."
    lines = []
    for p in plots:
        price = _format_inr(p.price)
        lines.append(
            f"- ID {p.id}: {p.name} | {p.location} | {price} | {p.sq_yards} sq yd | "
            f"{p.facing} | {p.status} | amenities: {p.amenities or 'N/A'}"
        )
    return "\n".join(lines)


def chat_response(
    db: Session,
    user_id: int,
    message: str,
    history: Optional[List[dict]] = None,
) -> dict[str, Any]:
    """Return assistant reply and optional recommended plot IDs."""
    inventory = _plots_context(db, user_id)
    hist_text = ""
    if history:
        for h in history[-6:]:
            role = h.get("role", "user")
            content = h.get("content", "")
            hist_text += f"{role.upper()}: {content}\n"

    fallback = (
        "I'm your PlotCRM assistant. Add plots to your inventory first, or configure "
        "GROQ_API_KEY in backend/.env for full AI answers. You can browse Plots and "
        "use AI Search for natural-language queries."
    )

    if not ai_configured():
        return {
            "reply": fallback,
            "plot_ids": [],
            "source": "template_fallback",
        }

    system = (
        "You are PlotCRM AI, an expert assistant for Indian plot real-estate agents. "
        "Your goal is to answer client queries in clear, highly professional English. "
        "You are Vastu friendly, knowledgeable about DTCP/HMDA approvals, local developments, "
        "pricing in Lakhs/Crores (INR), and connectivity like highways and metros. "
        "Use bullet points and short paragraphs to keep answers readable. "
        "Always base recommendations strictly on the provided plot inventory."
    )
    prompt = (
        f"Conversation History:\n{hist_text}\n"
        f"Client Query: {message}\n\n"
        f"Agent's Real Estate Plot Inventory (Available listings):\n{inventory}\n\n"
        f"Deliver a professional response. If recommending specific plots, cite their details (price, location, size, facing) "
        f"and include their exact plot ID integers in the 'plot_ids' array of the output JSON.\n\n"
        f"Format the output as raw JSON ONLY with these exact keys:\n"
        f"{{\n"
        f"  \"reply\": \"your structured answer with rich spacing and expert guidance\",\n"
        f"  \"plot_ids\": [list of integers representing recommended plot IDs, or empty array]\n"
        f"}}"
    )

    try:
        raw = generate_text(prompt, system=system, max_tokens=800)
        data = parse_json_from_ai(raw)
        plot_ids = data.get("plot_ids") or []
        if isinstance(plot_ids, list):
            plot_ids = [int(x) for x in plot_ids if str(x).isdigit()][:5]
        return {
            "reply": data.get("reply", raw),
            "plot_ids": plot_ids,
            "source": f"{active_ai_provider() or 'ai'}_api",
        }
    except Exception:
        return {
            "reply": (
                f"Based on your inventory, you have plots listed. For '{message[:80]}', "
                "try the AI Search on the Plots page or filter by location and price. "
                "Configure GROQ_API_KEY for smarter recommendations."
            ),
            "plot_ids": [],
            "source": "api_error_fallback",
        }
