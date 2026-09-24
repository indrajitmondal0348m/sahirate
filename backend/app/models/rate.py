from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float
from app.core.database import Base

class MaterialRate(Base):
    __tablename__ = "material_rates"

    material_id = Column(String(50), primary_key=True)
    label = Column(String(100), nullable=False)
    price_min = Column(Float, nullable=False)
    price_max = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    unit_label = Column(String(20), default="kg")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
