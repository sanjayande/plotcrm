"""Analytics aggregations for dashboard."""

from collections import Counter
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models.plot import Plot
from backend.models.customer import Customer
from backend.models.site_visit import SiteVisit


def get_analytics(db: Session, user_id: int) -> dict:
    plots = db.query(Plot).filter(Plot.user_id == user_id).all()
    customers = db.query(Customer).filter(Customer.user_id == user_id).all()

    sold = [p for p in plots if p.status == "Sold"]
    available = [p for p in plots if p.status == "Available"]
    total_revenue = sum(p.price for p in sold)

    hot = sum(1 for c in customers if c.lead_priority == "Hot Lead")
    warm = sum(1 for c in customers if c.lead_priority == "Warm Lead")
    cold = sum(1 for c in customers if c.lead_priority == "Cold Lead")

    location_counts = Counter(p.location for p in plots if p.location)
    top_locations = [{"location": loc, "count": cnt} for loc, cnt in location_counts.most_common(5)]

    # Monthly plot additions (last 6 months)
    today = date.today()
    trends = []
    for i in range(5, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        label = month_start.strftime("%b %Y")
        count = sum(1 for p in plots if p.created_at and p.created_at.date() >= month_start)
        trends.append({"month": label, "plots": count})

    visits_scheduled = (
        db.query(SiteVisit)
        .filter(SiteVisit.user_id == user_id, SiteVisit.status == "Scheduled")
        .count()
    )

    conversion = round((len(sold) / len(plots) * 100), 1) if plots else 0

    return {
        "total_sales": len(sold),
        "total_revenue": total_revenue,
        "active_leads": len(customers),
        "available_plots": len(available),
        "lead_breakdown": {"hot": hot, "warm": warm, "cold": cold},
        "top_locations": top_locations,
        "plot_trends": trends,
        "conversion_rate": conversion,
        "visits_scheduled": visits_scheduled,
        "avg_plot_price": round(sum(p.price for p in plots) / len(plots), 0) if plots else 0,
    }
