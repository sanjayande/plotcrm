from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, index=True)
    phone_number = Column(String, nullable=False)
    interested_location = Column(String, nullable=True, index=True)
    budget = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)
    lead_priority = Column(String, default="Warm Lead")  # Hot Lead, Warm Lead, Cold Lead
    interested_plot_ids = Column(String, nullable=True)  # comma-separated plot IDs
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="customers")
    site_visits = relationship("SiteVisit", back_populates="customer")
