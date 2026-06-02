from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
import datetime
from backend.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type = Column(String, nullable=False)  # plot, customer, visit, sale, follow_up
    title = Column(String, nullable=False)
    reference_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
