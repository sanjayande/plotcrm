from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.site_visit import SiteVisit
from backend.models.user import User
from backend.auth.deps import get_current_user
from backend.services.activity_log import log_activity

router = APIRouter(prefix="/api/site-visits", tags=["site-visits"])


class SiteVisitBase(BaseModel):
    plot_id: Optional[int] = None
    customer_id: Optional[int] = None
    customer_name: str
    phone_number: str
    visit_date: date
    visit_time: Optional[str] = None
    notes: Optional[str] = None
    status: str = "Scheduled"


class SiteVisitOut(SiteVisitBase):
    id: int
    user_id: int
    plot_name: Optional[str] = None

    class Config:
        from_attributes = True


def _serialize(v: SiteVisit, plot_name: str = None) -> dict:
    d = {
        "id": v.id,
        "user_id": v.user_id,
        "plot_id": v.plot_id,
        "customer_id": v.customer_id,
        "customer_name": v.customer_name,
        "phone_number": v.phone_number,
        "visit_date": v.visit_date,
        "visit_time": v.visit_time,
        "notes": v.notes,
        "status": v.status,
        "plot_name": plot_name,
    }
    return d


@router.get("")
def list_visits(
    status: Optional[str] = None,
    upcoming_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(SiteVisit).filter(SiteVisit.user_id == current_user.id)
    if status:
        q = q.filter(SiteVisit.status == status)
    if upcoming_only:
        q = q.filter(SiteVisit.visit_date >= date.today(), SiteVisit.status == "Scheduled")
    visits = q.order_by(SiteVisit.visit_date.asc()).all()
    out = []
    for v in visits:
        pname = v.plot.name if v.plot else None
        out.append(_serialize(v, pname))
    return out


@router.post("")
def create_visit(
    data: SiteVisitBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = SiteVisit(**data.model_dump(), user_id=current_user.id)
    db.add(visit)
    db.commit()
    db.refresh(visit)
    log_activity(
        db, current_user.id, "visit",
        f"Site visit scheduled for {data.customer_name} on {data.visit_date}",
        visit.id,
    )
    return _serialize(visit, visit.plot.name if visit.plot else None)


@router.put("/{visit_id}")
def update_visit(
    visit_id: int,
    data: SiteVisitBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = db.query(SiteVisit).filter(SiteVisit.id == visit_id, SiteVisit.user_id == current_user.id).first()
    if not visit:
        raise HTTPException(404, "Visit not found")
    for k, val in data.model_dump().items():
        setattr(visit, k, val)
    db.commit()
    db.refresh(visit)
    return _serialize(visit, visit.plot.name if visit.plot else None)


@router.delete("/{visit_id}")
def cancel_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = db.query(SiteVisit).filter(SiteVisit.id == visit_id, SiteVisit.user_id == current_user.id).first()
    if not visit:
        raise HTTPException(404, "Visit not found")
    visit.status = "Cancelled"
    db.commit()
    return {"detail": "Visit cancelled"}
