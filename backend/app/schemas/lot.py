from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict
from datetime import datetime

class LotCreate(BaseModel):
    id: Optional[str] = None
    collector_id: Optional[str] = None
    material_id: str
    approx_weight_kg: float
    estimated_value: float
    photo_reference: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at_local: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None

class LotAcceptRequest(BaseModel):
    recycler_id: str

class LotVerifyRequest(BaseModel):
    recycler_id: str
    verified_material: str
    verified_weight_kg: float
    final_rate: float
    final_amount: float

class LotOfferRequest(BaseModel):
    recycler_id: str
    offered_price: float
    message: Optional[str] = None

class LotOfferResponseRequest(BaseModel):
    collector_id: Optional[str] = None
    action: str  # "ACCEPT" or "REJECT"

class LotResponse(BaseModel):
    id: str
    collector_id: Optional[str] = None
    material_id: str
    approx_weight_kg: float
    estimated_value: float
    photo_reference: Optional[str] = None
    status: str
    accepted_by: Optional[str] = None
    accepted_at: Optional[datetime] = None
    recycler_verified_material: Optional[str] = None
    recycler_weight_kg: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at_local: Optional[str] = None
    synced_at: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
