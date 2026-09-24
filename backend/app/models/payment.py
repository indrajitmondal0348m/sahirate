import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    handover_id = Column(String(36), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(20), default="CASH") # CASH, UPI, BANK
    status = Column(String(20), default="PAID", index=True) # PENDING, PAID, FAILED
    paid_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at_local = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
