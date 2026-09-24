from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class MaterialRateBase(BaseModel):
    material_id: str
    label: str
    price_min: float
    price_max: float
    unit: str = "kg"
    unit_label: str = "kg"

class MaterialRateResponse(MaterialRateBase):
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
