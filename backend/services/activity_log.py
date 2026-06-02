"""Persist and query user activity feed."""

from sqlalchemy.orm import Session
from backend.models.activity_log import ActivityLog


def log_activity(
    db: Session,
    user_id: int,
    activity_type: str,
    title: str,
    reference_id: int | None = None,
) -> None:
    entry = ActivityLog(
        user_id=user_id,
        activity_type=activity_type,
        title=title,
        reference_id=reference_id,
    )
    db.add(entry)
    db.commit()


def get_recent_activities(db: Session, user_id: int, limit: int = 15) -> list[dict]:
    rows = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": f"log_{r.id}",
            "type": r.activity_type,
            "title": r.title,
            "time": r.created_at.isoformat(),
            "reference_id": r.reference_id,
        }
        for r in rows
    ]
