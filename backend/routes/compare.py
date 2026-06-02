from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.plot import Plot
from backend.models.user import User
from backend.auth.deps import get_current_user
from backend.routes.plots import format_indian_currency

router = APIRouter(prefix="/api/plots", tags=["compare"])


class CompareRequest(BaseModel):
    plot_ids: List[int]


@router.post("/compare")
def compare_plots(
    body: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(body.plot_ids) < 2 or len(body.plot_ids) > 3:
        raise HTTPException(400, "Select 2 to 3 plots to compare")

    plots = (
        db.query(Plot)
        .filter(Plot.user_id == current_user.id, Plot.id.in_(body.plot_ids))
        .all()
    )
    if len(plots) != len(body.plot_ids):
        raise HTTPException(404, "One or more plots not found")

    order = {pid: i for i, pid in enumerate(body.plot_ids)}
    plots.sort(key=lambda p: order.get(p.id, 99))

    rows = []
    for p in plots:
        per_sq = p.price / (p.sq_yards or 1)
        rows.append({
            "id": p.id,
            "name": p.name,
            "location": p.location,
            "price": p.price,
            "formatted_price": format_indian_currency(p.price),
            "price_per_sq_yard": format_indian_currency(per_sq),
            "sq_yards": p.sq_yards,
            "facing": p.facing,
            "amenities": p.amenities,
            "status": p.status,
            "google_maps_link": p.google_maps_link,
            "description_snippet": (p.description or "")[:200],
        })

    # Highlight best price (lowest) and largest size
    if len(rows) >= 2:
        best_price_id = min(rows, key=lambda r: r["price"])["id"]
        best_size_id = max(rows, key=lambda r: r["sq_yards"])["id"]
        for r in rows:
            r["highlights"] = []
            if r["id"] == best_price_id:
                r["highlights"].append("best_price")
            if r["id"] == best_size_id:
                r["highlights"].append("largest_plot")

    return {"plots": rows, "fields": ["name", "location", "formatted_price", "sq_yards", "facing", "amenities", "status", "price_per_sq_yard"]}
