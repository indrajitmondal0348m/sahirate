from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    location: Optional[str] = None
    role: str = "COLLECTOR"

class UserCreate(UserBase):
    password: Optional[str] = "sahirate123"

class RecyclerRegisterRequest(BaseModel):
    phone: str
    password: str
    full_name: str
    organization_name: str
    email: Optional[str] = None
    address: str
    gst_number: Optional[str] = None
    pcb_license: str
    facility_type: Optional[str] = "Authorized Dismantler / Recycler"
    daily_capacity_kg: Optional[float] = 1000.0
    location: str

class UserLogin(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    verification_status: Optional[str] = "APPROVED"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
