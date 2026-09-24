import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Float, Text
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(20), unique=True, index=True, nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=True)
    location = Column(String(150), nullable=True)
    role = Column(String(20), nullable=False, default="COLLECTOR") # COLLECTOR, RECYCLER, ADMIN
    hashed_password = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), unique=True, index=True, nullable=False)
    organization_name = Column(String(150), nullable=True)
    license_number = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    verification_status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
