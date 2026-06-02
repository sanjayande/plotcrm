from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.models.plot import Plot
from backend.auth.deps import get_current_user
from backend.services.chatbot import chat_response
from backend.routes.plots import PlotOut, format_indian_currency

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    plot_ids: List[int] = []
    recommended_plots: List[dict] = []
    source: str


@router.post("", response_model=ChatResponse)
def ai_chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hist = [{"role": m.role, "content": m.content} for m in (body.history or [])]
    result = chat_response(db, current_user.id, body.message.strip(), hist)

    recommended = []
    if result.get("plot_ids"):
        plots = (
            db.query(Plot)
            .filter(Plot.user_id == current_user.id, Plot.id.in_(result["plot_ids"]))
            .all()
        )
        for p in plots:
            recommended.append({
                "id": p.id,
                "name": p.name,
                "location": p.location,
                "price": p.price,
                "formatted_price": format_indian_currency(p.price),
                "sq_yards": p.sq_yards,
                "facing": p.facing,
                "status": p.status,
            })

    return {
        "reply": result["reply"],
        "plot_ids": result.get("plot_ids", []),
        "recommended_plots": recommended,
        "source": result.get("source", "unknown"),
    }
