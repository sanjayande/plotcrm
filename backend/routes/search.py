from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.models.plot import Plot
from backend.auth.deps import get_current_user
from backend.routes.plots import PlotOut, format_indian_currency
from backend.services.ai_search import parse_nl_query, apply_plot_filters

router = APIRouter(prefix="/api/search", tags=["search"])


class AISearchRequest(BaseModel):
    query: str
    language: Optional[str] = "en"


class AISearchResponse(BaseModel):
    query: str
    interpreted_filters: dict
    suggestions: List[str]
    results: List[PlotOut]


SEARCH_SUGGESTIONS = [
    "East-facing plots under 40 lakhs",
    "Plots near highway in Hyderabad",
    "DTCP approved plots with water and electricity",
    "Plots near schools and hospitals",
    "Investment plots under 50 lakhs in Bangalore",
    "Available plots with metro connectivity",
]


@router.get("/suggestions")
def search_suggestions(current_user: User = Depends(get_current_user)):
    return {"suggestions": SEARCH_SUGGESTIONS}


@router.post("/ai", response_model=AISearchResponse)
def ai_smart_search(
    body: AISearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = parse_nl_query(body.query.strip())
    q = apply_plot_filters(db.query(Plot), current_user.id, filters)
    plots = q.limit(50).all()
    for p in plots:
        p.formatted_price = format_indian_currency(p.price)
    return {
        "query": body.query,
        "interpreted_filters": filters,
        "suggestions": SEARCH_SUGGESTIONS[:3],
        "results": plots,
    }
