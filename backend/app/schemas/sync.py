from pydantic import BaseModel
from typing import Optional, Any, Dict, List

class SyncEventItem(BaseModel):
    id: Optional[str] = None
    event_id: Optional[str] = None
    type: str # LOT_CREATED, LOT_ACCEPTED, HANDOVER_CREATED, HANDOVER_COLLECTOR_CONFIRMED, HANDOVER_COMPLETED, PAYMENT_RECORDED
    idempotency_key: Optional[str] = None
    created_at_local: Optional[str] = None
    payload: Dict[str, Any]

class SyncBatchRequest(BaseModel):
    events: List[SyncEventItem]

class SyncItemResult(BaseModel):
    id: str
    status: str # "synced", "already_processed", "error"
    message: Optional[str] = None

class SyncBatchResponse(BaseModel):
    success: bool
    results: List[SyncItemResult]
