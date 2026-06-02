from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    office_address = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    plots = relationship("Plot", back_populates="owner", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="owner", cascade="all, delete-orphan")
    site_visits = relationship("SiteVisit", back_populates="owner", cascade="all, delete-orphan")
