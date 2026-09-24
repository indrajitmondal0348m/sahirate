from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PaymentCreate(BaseModel):
    id: Optional[str] = None
    handover_id: str
    amount: float
    payment_mode: str = "CASH"
    created_at_local: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    handover_id: str
    amount: float
    payment_mode: str
    status: str
    paid_at: Optional[datetime] = None
    created_at_local: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
