from sqlalchemy import Column, Integer, String, Text, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base


class SiteVisit(Base):
    __tablename__ = "site_visits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plot_id = Column(Integer, ForeignKey("plots.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    visit_date = Column(Date, nullable=False)
    visit_time = Column(String, nullable=True)  # e.g. "10:30 AM"
    notes = Column(Text, nullable=True)
    status = Column(String, default="Scheduled")  # Scheduled, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="site_visits")
    plot = relationship("Plot", back_populates="site_visits")
    customer = relationship("Customer", back_populates="site_visits")
