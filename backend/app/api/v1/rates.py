from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.rate import MaterialRate
from app.schemas.rate import MaterialRateResponse

router = APIRouter(prefix="/rates", tags=["Rates"])

@router.get("", response_model=List[MaterialRateResponse])
def get_rates(db: Session = Depends(get_db)):
    return db.query(MaterialRate).all()

@router.get("/{material_id}", response_model=MaterialRateResponse)
def get_rate_by_material(material_id: str, db: Session = Depends(get_db)):
    rate = db.query(MaterialRate).filter(MaterialRate.material_id == material_id.upper()).first()
    if not rate:
        raise HTTPException(status_code=404, detail="Material rate not found")
    return rate
