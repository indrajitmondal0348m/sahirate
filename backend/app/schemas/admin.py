from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class AdminStatsResponse(BaseModel):
    totalTransactions: int
    activeCollectors: int
    verifiedRecyclers: int
    monthlyVolumeKg: float
    pendingVerifications: int
    activeAlerts: int

class AdminAlertResponse(BaseModel):
    id: str
    severity: str
    title: str
    description: str
    entity_id: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class VerificationResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    phone: Optional[str] = None
    role: str
    document_type: str
    document_number: Optional[str] = None
    facility_name: Optional[str] = None
    location: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    status: str
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: str
    event_type: str
    actor_id: Optional[str] = None
    actor_role: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
