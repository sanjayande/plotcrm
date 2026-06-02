"""Natural-language plot search via Groq + SQL filters."""

import re
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.models.plot import Plot
from backend.services.ai_service import ai_configured, generate_text, parse_json_from_ai


def _parse_filters_rule_based(query: str) -> dict[str, Any]:
    """Fallback parser when Groq is unavailable."""
    q = query.lower()
    filters: dict[str, Any] = {}
    lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)\b", q)
    cr_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:crore|cr)\b", q)
    if lakh_match:
        filters["price_max"] = float(lakh_match.group(1)) * 100000
    if cr_match:
        filters["price_max"] = float(cr_match.group(1)) * 10000000
    facings = ["east", "west", "north", "south", "north-east", "north-west", "south-east", "south-west"]
    for f in facings:
        if f in q or f.replace("-", " ") in q:
            filters["facing"] = f.title().replace("-", "-").replace("East", "East")
            parts = f.split("-")
            filters["facing"] = "-".join(p.capitalize() for p in parts) if "-" in f else f.capitalize()
            break
    if "east" in q and "facing" in q:
        filters["facing"] = "East"
    if "under" in q or "below" in q or "less than" in q:
        pass
    loc_match = re.search(r"(?:in|at|near)\s+([a-zA-Z\s]+?)(?:\s+with|\s+under|$)", q)
    if loc_match:
        filters["location"] = loc_match.group(1).strip().title()
    keywords = []
    for kw in [
        "dtcp", "water", "electricity", "highway", "gated", "tar road", "approved",
        "school", "hospital", "metro", "it park", "ring road", "bhk",
    ]:
        if kw in q:
            keywords.append(kw)
    if "near school" in q or "schools" in q:
        keywords.append("school")
    if "hospital" in q:
        keywords.append("hospital")
    if keywords:
        filters["amenities_keywords"] = list(set(keywords))
    return filters


def parse_nl_query(query: str) -> dict[str, Any]:
    if ai_configured():
        prompt = (
            f"Parse the following Indian real-estate plot search query into a raw JSON object only. Do not include markdown blocks, notes, or explanations.\n"
            f"Query: \"{query}\"\n\n"
            f"JSON Keys & Formatting Requirements:\n"
            f"- price_min: minimum price in INR (integer or null). Parse 'Lakh'/'Lakhs'/'L' as *100,000 and 'Crore'/'Crores'/'Cr' as *10,000,000.\n"
            f"- price_max: maximum price in INR (integer or null). For 'under X lakhs' or 'below Y cr', set price_max accordingly.\n"
            f"- facing: standard facing direction (e.g. 'East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West' or null). Capitalize correctly.\n"
            f"- location: extracted city, area, or locality name (string or null). Capitalize first letters.\n"
            f"- status: status of the plot (one of: 'Available', 'Reserved', 'Sold' or null).\n"
            f"- amenities_keywords: array of specific features mentioned (e.g. ['dtcp', 'water', 'electricity', 'highway', 'gated', 'school', 'hospital', 'metro', 'it park']). Extract as lowercased keywords.\n"
            f"- search_text: general keywords from the query to double-check matching if location or facing doesn't match perfectly (string or null).\n\n"
            f"Example:\n"
            f"Input: \"East-facing plots near highway in Hyderabad under 40 lakhs with water\"\n"
            f"Output: {{\"price_min\": null, \"price_max\": 4000000, \"facing\": \"East\", \"location\": \"Hyderabad\", \"status\": \"Available\", \"amenities_keywords\": [\"highway\", \"water\"], \"search_text\": \"highway water\"}}"
        )
        try:
            raw = generate_text(prompt, system="You are a real-estate search parser. Return raw valid JSON only.", max_tokens=400)
            return parse_json_from_ai(raw)
        except Exception:
            pass
    return _parse_filters_rule_based(query)


def apply_plot_filters(query: Session, user_id: int, filters: dict[str, Any]):
    q = query.filter(Plot.user_id == user_id)
    if filters.get("price_min") is not None:
        q = q.filter(Plot.price >= float(filters["price_min"]))
    if filters.get("price_max") is not None:
        q = q.filter(Plot.price <= float(filters["price_max"]))
    if filters.get("facing"):
        q = q.filter(Plot.facing.ilike(f"%{filters['facing']}%"))
    if filters.get("location"):
        q = q.filter(Plot.location.ilike(f"%{filters['location']}%"))
    if filters.get("status"):
        q = q.filter(Plot.status == filters["status"])
    for kw in filters.get("amenities_keywords") or []:
        q = q.filter(
            or_(
                Plot.amenities.ilike(f"%{kw}%"),
                Plot.description.ilike(f"%{kw}%"),
                Plot.name.ilike(f"%{kw}%"),
                Plot.location.ilike(f"%{kw}%"),
            )
        )
    text = filters.get("search_text")
    if text:
        sf = f"%{text}%"
        q = q.filter(
            or_(
                Plot.name.like(sf),
                Plot.location.like(sf),
                Plot.amenities.like(sf),
                Plot.description.like(sf),
            )
        )
    return q.order_by(Plot.created_at.desc())
