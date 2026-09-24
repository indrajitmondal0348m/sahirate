import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, Text, JSON
from app.core.database import Base

class Lot(Base):
    __tablename__ = "lots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    collector_id = Column(String(36), index=True, nullable=True)
    material_id = Column(String(50), nullable=False)
    approx_weight_kg = Column(Float, nullable=False)
    estimated_value = Column(Float, nullable=False)
    photo_reference = Column(Text, nullable=True)
    status = Column(String(30), default="AVAILABLE", index=True) 
    # Status lifecycle: AVAILABLE -> ACCEPTED -> VERIFIED -> QR_GENERATED -> COLLECTOR_CONFIRMED -> COMPLETED
    accepted_by = Column(String(36), nullable=True, index=True)
    accepted_at = Column(DateTime, nullable=True)
    
    # Recycler yard adjustments
    recycler_verified_material = Column(String(50), nullable=True)
    recycler_weight_kg = Column(Float, nullable=True)
    
    # Geolocation / Metadata
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    extra_data = Column(JSON, nullable=True)

    created_at_local = Column(String(50), nullable=True)
    synced_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
