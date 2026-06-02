from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date
from backend.database import get_db
from backend.models.customer import Customer
from backend.models.plot import Plot
from backend.models.site_visit import SiteVisit
from backend.models.user import User
from backend.auth.deps import get_current_user
from sqlalchemy import or_
from backend.services.activity_log import log_activity
from backend.services.groq_ai import generate_text, groq_configured

router = APIRouter(prefix="/api/customers", tags=["customers"])

LEAD_PRIORITIES = ["Hot Lead", "Warm Lead", "Cold Lead"]
PRIORITY_ORDER = {"Hot Lead": 0, "Warm Lead": 1, "Cold Lead": 2}


class CustomerBase(BaseModel):
    name: str
    phone_number: str
    interested_location: Optional[str] = None
    budget: Optional[float] = None
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None
    lead_priority: Optional[str] = "Warm Lead"
    interested_plot_ids: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


@router.get("", response_model=List[CustomerOut])
def list_customers(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all customers for the logged-in agent.
    Filter results by search keyword matching name, phone, location, or notes.
    """
    query = db.query(Customer).filter(Customer.user_id == current_user.id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.like(search_filter),
                Customer.phone_number.like(search_filter),
                Customer.interested_location.like(search_filter),
                Customer.notes.like(search_filter)
            )
        )
    if priority:
        query = query.filter(Customer.lead_priority == priority)
    customers = query.order_by(Customer.created_at.desc()).all()
    customers.sort(key=lambda c: PRIORITY_ORDER.get(c.lead_priority or "Warm Lead", 1))
    return customers


@router.get("/{customer_id}/detail")
def get_customer_detail(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id, Customer.user_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    plot_ids = []
    if customer.interested_plot_ids:
        plot_ids = [int(x) for x in customer.interested_plot_ids.split(",") if x.strip().isdigit()]
    interested_plots = []
    if plot_ids:
        interested_plots = db.query(Plot).filter(
            Plot.user_id == current_user.id, Plot.id.in_(plot_ids)
        ).all()

    visits = (
        db.query(SiteVisit)
        .filter(SiteVisit.customer_id == customer_id, SiteVisit.user_id == current_user.id)
        .order_by(SiteVisit.visit_date.desc())
        .all()
    )

    return {
        "customer": customer,
        "interested_plots": interested_plots,
        "site_visits": [
            {
                "id": v.id,
                "visit_date": v.visit_date.isoformat(),
                "visit_time": v.visit_time,
                "status": v.status,
                "notes": v.notes,
                "plot_id": v.plot_id,
                "plot_name": v.plot.name if v.plot else None,
            }
            for v in visits
        ],
    }


@router.post("/{customer_id}/suggest-priority")
def suggest_lead_priority(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id, Customer.user_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    suggestion = "Warm Lead"
    reason = "Based on follow-up date and budget information."
    if groq_configured():
        try:
            prompt = (
                f"Classify this real estate lead as exactly one of: Hot Lead, Warm Lead, Cold Lead.\n"
                f"Name: {customer.name}\nBudget: {customer.budget}\n"
                f"Location interest: {customer.interested_location}\n"
                f"Follow-up: {customer.follow_up_date}\nNotes: {customer.notes}\n"
                f"Reply JSON only: {{\"priority\": \"...\", \"reason\": \"one sentence\"}}"
            )
            raw = generate_text(prompt, max_tokens=120)
            import json
            data = json.loads(raw.strip().strip("`").replace("json", ""))
            suggestion = data.get("priority", suggestion)
            reason = data.get("reason", reason)
        except Exception:
            pass
    else:
        if customer.follow_up_date and customer.follow_up_date <= date.today():
            suggestion = "Hot Lead"
            reason = "Follow-up is due or overdue."
        elif customer.budget and customer.budget >= 3000000:
            suggestion = "Warm Lead"
            reason = "Healthy budget range for plot purchase."

    return {"suggested_priority": suggestion, "reason": reason}


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("", response_model=CustomerOut)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = Customer(
        **data.model_dump(),
        user_id=current_user.id
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    log_activity(db, current_user.id, "customer", f"Registered customer '{customer.name}'", customer.id)
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in data.model_dump().items():
        setattr(customer, key, value)
        
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    db.delete(customer)
    db.commit()
    return {"detail": "Customer deleted successfully"}
