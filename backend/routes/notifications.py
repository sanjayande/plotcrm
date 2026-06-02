from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.auth.deps import get_current_user
from backend.services.notifications import get_notifications

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = get_notifications(db, current_user.id)
    return {"notifications": items, "unread_count": sum(1 for n in items if n.get("urgent"))}
