from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON
from app.core.database import Base

class SyncEventLog(Base):
    __tablename__ = "sync_events_log"

    id = Column(String(36), primary_key=True) # event_id from client
    idempotency_key = Column(String(100), unique=True, index=True, nullable=False)
    event_type = Column(String(50), nullable=False)
    payload = Column(JSON, nullable=True)
    status = Column(String(20), default="PROCESSED") # PROCESSED, REJECTED
    processed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
