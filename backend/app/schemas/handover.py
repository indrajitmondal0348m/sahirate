from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class HandoverCreate(BaseModel):
    id: Optional[str] = None
    lot_id: str
    recycler_id: str
    collector_id: Optional[str] = None
    verified_weight_kg: float
    final_rate: float
    final_amount: float
    created_at_local: Optional[str] = None

class HandoverResponse(BaseModel):
    id: str
    lot_id: str
    recycler_id: str
    collector_id: Optional[str] = None
    verified_weight_kg: float
    final_rate: float
    final_amount: float
    status: str
    qr_reference: str
    created_at_local: Optional[str] = None
    collector_confirmed_at: Optional[datetime] = None
    recycler_confirmed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
