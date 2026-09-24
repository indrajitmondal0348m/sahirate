import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, Text, JSON
from app.core.database import Base

class AdminAlert(Base):
    __tablename__ = "admin_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    severity = Column(String(20), default="MEDIUM") # HIGH, MEDIUM, LOW
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    entity_id = Column(String(36), nullable=True)
    status = Column(String(20), default="OPEN") # OPEN, RESOLVED, DISMISSED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String(50), nullable=False, index=True) # LOT_CREATED, HANDOVER_COMPLETED, etc.
    actor_id = Column(String(36), nullable=True)
    actor_role = Column(String(20), nullable=True)
    entity_id = Column(String(36), nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    user_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), nullable=False) # RECYCLER, COLLECTOR
    document_type = Column(String(50), nullable=False)
    document_number = Column(String(100), nullable=True)
    facility_name = Column(String(150), nullable=True)
    location = Column(String(150), nullable=True)
    details = Column(JSON, nullable=True)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime, nullable=True)
