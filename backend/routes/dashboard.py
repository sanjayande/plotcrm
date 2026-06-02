from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from backend.database import get_db
from backend.models.plot import Plot
from backend.models.customer import Customer
from backend.models.site_visit import SiteVisit
from backend.models.user import User
from backend.auth.deps import get_current_user
from backend.services.activity_log import get_recent_activities
from backend.services.analytics import get_analytics

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_plots = db.query(Plot).filter(Plot.user_id == current_user.id).count()
    available_plots = db.query(Plot).filter(Plot.user_id == current_user.id, Plot.status == "Available").count()
    sold_plots = db.query(Plot).filter(Plot.user_id == current_user.id, Plot.status == "Sold").count()
    reserved_plots = db.query(Plot).filter(Plot.user_id == current_user.id, Plot.status == "Reserved").count()
    total_customers = db.query(Customer).filter(Customer.user_id == current_user.id).count()
    hot_leads = db.query(Customer).filter(
        Customer.user_id == current_user.id, Customer.lead_priority == "Hot Lead"
    ).count()

    today = date.today()
    follow_ups = (
        db.query(Customer)
        .filter(Customer.user_id == current_user.id, Customer.follow_up_date >= today)
        .order_by(Customer.follow_up_date.asc())
        .limit(5)
        .all()
    )
    formatted_follow_ups = [
        {
            "id": c.id,
            "name": c.name,
            "phone_number": c.phone_number,
            "interested_location": c.interested_location,
            "follow_up_date": c.follow_up_date.isoformat() if c.follow_up_date else None,
            "notes": c.notes,
            "lead_priority": getattr(c, "lead_priority", "Warm Lead"),
        }
        for c in follow_ups
    ]

    upcoming_visits = (
        db.query(SiteVisit)
        .filter(
            SiteVisit.user_id == current_user.id,
            SiteVisit.status == "Scheduled",
            SiteVisit.visit_date >= today,
        )
        .order_by(SiteVisit.visit_date.asc())
        .limit(5)
        .all()
    )
    visits_out = [
        {
            "id": v.id,
            "customer_name": v.customer_name,
            "phone_number": v.phone_number,
            "visit_date": v.visit_date.isoformat(),
            "visit_time": v.visit_time,
            "plot_name": v.plot.name if v.plot else None,
        }
        for v in upcoming_visits
    ]

    recent_activities = get_recent_activities(db, current_user.id, 12)
    if not recent_activities:
        recent_plots = db.query(Plot).filter(Plot.user_id == current_user.id).order_by(Plot.created_at.desc()).limit(3).all()
        for p in recent_plots:
            recent_activities.append({
                "id": f"plot_{p.id}",
                "type": "plot",
                "title": f"Added plot '{p.name}' in {p.location}",
                "time": p.created_at.isoformat(),
            })

    analytics_summary = get_analytics(db, current_user.id)

    return {
        "stats": {
            "total_plots": total_plots,
            "available_plots": available_plots,
            "sold_plots": sold_plots,
            "reserved_plots": reserved_plots,
            "total_customers": total_customers,
            "hot_leads": hot_leads,
        },
        "upcoming_follow_ups": formatted_follow_ups,
        "upcoming_visits": visits_out,
        "recent_activities": recent_activities,
        "analytics_summary": {
            "total_revenue": analytics_summary["total_revenue"],
            "conversion_rate": analytics_summary["conversion_rate"],
            "lead_breakdown": analytics_summary["lead_breakdown"],
        },
    }
