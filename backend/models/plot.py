from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base

class Plot(Base):
    __tablename__ = "plots"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    sq_yards = Column(Float, nullable=False)
    facing = Column(String, nullable=False) # e.g., East, West, North-East
    amenities = Column(String, nullable=True) # comma-separated list of amenities (e.g., Water, Power, Gated)
    description = Column(Text, nullable=True)
    google_maps_link = Column(String, nullable=True)
    status = Column(String, default="Available") # Available, Reserved, Sold
    images = Column(Text, nullable=True) # comma-separated filenames or paths
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="plots")
    site_visits = relationship("SiteVisit", back_populates="plot")
