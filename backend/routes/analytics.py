from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.auth.deps import get_current_user
from backend.services.analytics import get_analytics

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("")
def analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_analytics(db, current_user.id)
