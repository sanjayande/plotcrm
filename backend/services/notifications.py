"""Build notification list from follow-ups, visits, and recent events."""

from datetime import date, timedelta
from sqlalchemy.orm import Session

from backend.models.customer import Customer
from backend.models.site_visit import SiteVisit
from backend.models.plot import Plot


def get_notifications(db: Session, user_id: int, limit: int = 20) -> list[dict]:
    today = date.today()
    items: list[dict] = []

    follow_ups = (
        db.query(Customer)
        .filter(
            Customer.user_id == user_id,
            Customer.follow_up_date != None,
            Customer.follow_up_date <= today + timedelta(days=3),
        )
        .order_by(Customer.follow_up_date.asc())
        .limit(5)
        .all()
    )
    for c in follow_ups:
        overdue = c.follow_up_date < today
        items.append({
            "id": f"followup_{c.id}",
            "type": "follow_up",
            "title": f"Follow-up {'overdue' if overdue else 'due'}: {c.name}",
            "message": c.phone_number,
            "urgent": overdue or c.follow_up_date == today,
            "link": f"/customers/{c.id}",
            "created_at": c.follow_up_date.isoformat(),
        })

    visits = (
        db.query(SiteVisit)
        .filter(
            SiteVisit.user_id == user_id,
            SiteVisit.status == "Scheduled",
            SiteVisit.visit_date >= today,
            SiteVisit.visit_date <= today + timedelta(days=7),
        )
        .order_by(SiteVisit.visit_date.asc())
        .limit(5)
        .all()
    )
    for v in visits:
        items.append({
            "id": f"visit_{v.id}",
            "type": "site_visit",
            "title": f"Site visit: {v.customer_name}",
            "message": f"{v.visit_date} {v.visit_time or ''}".strip(),
            "urgent": v.visit_date == today,
            "link": "/site-visits",
            "created_at": v.visit_date.isoformat(),
        })

    recent_customers = (
        db.query(Customer)
        .filter(Customer.user_id == user_id)
        .order_by(Customer.created_at.desc())
        .limit(3)
        .all()
    )
    for c in recent_customers:
        if (today - c.created_at.date()).days <= 2:
            items.append({
                "id": f"newcust_{c.id}",
                "type": "customer",
                "title": f"New customer: {c.name}",
                "message": c.interested_location or "No location set",
                "urgent": False,
                "link": f"/customers/{c.id}",
                "created_at": c.created_at.isoformat(),
            })

    sold = (
        db.query(Plot)
        .filter(Plot.user_id == user_id, Plot.status == "Sold")
        .order_by(Plot.created_at.desc())
        .limit(3)
        .all()
    )
    for p in sold:
        items.append({
            "id": f"sold_{p.id}",
            "type": "sale",
            "title": f"Plot sold: {p.name}",
            "message": p.location,
            "urgent": False,
            "link": f"/plots/{p.id}",
            "created_at": p.created_at.isoformat() if p.created_at else "",
        })

    items.sort(key=lambda x: (not x.get("urgent"), x.get("created_at", "")), reverse=True)
    return items[:limit]
