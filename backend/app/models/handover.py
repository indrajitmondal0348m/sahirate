import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float
from app.core.database import Base

class Handover(Base):
    __tablename__ = "handovers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lot_id = Column(String(36), index=True, nullable=False)
    recycler_id = Column(String(36), index=True, nullable=False)
    collector_id = Column(String(36), index=True, nullable=True)
    
    verified_weight_kg = Column(Float, nullable=False)
    final_rate = Column(Float, nullable=False)
    final_amount = Column(Float, nullable=False)
    
    status = Column(String(30), default="QR_GENERATED", index=True)
    # QR_GENERATED -> COLLECTOR_CONFIRMED -> COMPLETED
    qr_reference = Column(String(36), unique=True, index=True, nullable=False)

    created_at_local = Column(String(50), nullable=True)
    collector_confirmed_at = Column(DateTime, nullable=True)
    recycler_confirmed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
