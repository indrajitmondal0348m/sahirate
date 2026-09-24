import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.lot import Lot
from app.models.admin import AuditLog
from app.schemas.lot import LotCreate, LotResponse, LotAcceptRequest, LotVerifyRequest, LotOfferRequest, LotOfferResponseRequest

router = APIRouter(prefix="/lots", tags=["Lots"])

@router.get("", response_model=List[LotResponse])
def get_lots(
    status: Optional[str] = Query(None),
    collector_id: Optional[str] = Query(None),
    recycler_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Lot)
    if status:
        query = query.filter(Lot.status == status.upper())
    if collector_id:
        query = query.filter(Lot.collector_id == collector_id)
    if recycler_id:
        query = query.filter(Lot.accepted_by == recycler_id)
    
    return query.order_by(Lot.synced_at.desc()).all()

@router.get("/{id}", response_model=LotResponse)
def get_lot_by_id(id: str, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return lot

@router.post("", response_model=LotResponse)
def create_lot(lot_in: LotCreate, db: Session = Depends(get_db)):
    lot_id = lot_in.id or str(uuid.uuid4())
    existing = db.query(Lot).filter(Lot.id == lot_id).first()
    if existing:
        return existing

    now = datetime.now(timezone.utc)
    lot = Lot(
        id=lot_id,
        collector_id=lot_in.collector_id or "collector-demo-1",
        material_id=lot_in.material_id,
        approx_weight_kg=lot_in.approx_weight_kg,
        estimated_value=lot_in.estimated_value,
        photo_reference=lot_in.photo_reference,
        latitude=lot_in.latitude,
        longitude=lot_in.longitude,
        created_at_local=lot_in.created_at_local or str(now),
        status="AVAILABLE",
        synced_at=now,
        extra_data=lot_in.extra_data,
    )
    db.add(lot)
    
    audit = AuditLog(
        event_type="LOT_CREATED",
        entity_id=lot_id,
        details={"material": lot.material_id, "weight": lot.approx_weight_kg, "extra": lot.extra_data},
        timestamp=now
    )
    db.add(audit)
    db.commit()
    db.refresh(lot)
    return lot

@router.post("/{id}/offer", response_model=LotResponse)
def offer_lot_price(id: str, req: LotOfferRequest, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    extra = dict(lot.extra_data or {})
    extra["offered_price"] = req.offered_price
    extra["offer_status"] = "PENDING_COLLECTOR"
    extra["offered_by"] = req.recycler_id
    extra["offer_message"] = req.message
    extra["offered_at"] = datetime.now(timezone.utc).isoformat()

    lot.extra_data = extra
    lot.status = "PRICE_OFFERED"
    lot.accepted_by = req.recycler_id

    audit = AuditLog(
        event_type="LOT_PRICE_OFFERED",
        actor_id=req.recycler_id,
        actor_role="RECYCLER",
        entity_id=id,
        details={"offered_price": req.offered_price, "asking_price": extra.get("asking_price", lot.estimated_value)},
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()
    db.refresh(lot)
    return lot

@router.post("/{id}/respond-offer", response_model=LotResponse)
def respond_lot_offer(id: str, req: LotOfferResponseRequest, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    extra = dict(lot.extra_data or {})
    now = datetime.now(timezone.utc)

    if req.action.upper() == "ACCEPT":
        offered = extra.get("offered_price", lot.estimated_value)
        extra["offer_status"] = "ACCEPTED"
        extra["final_agreed_price"] = offered
        lot.extra_data = extra
        lot.estimated_value = offered
        lot.status = "ACCEPTED"
        lot.accepted_at = now
    else:
        extra["offer_status"] = "REJECTED"
        lot.extra_data = extra
        lot.status = "AVAILABLE"
        lot.accepted_by = None

    db.commit()
    db.refresh(lot)
    return lot

@router.post("/{id}/accept", response_model=LotResponse)
def accept_lot(id: str, req: LotAcceptRequest, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    if lot.status == "ACCEPTED":
        # Idempotent return if accepted by same recycler
        if lot.accepted_by == req.recycler_id:
            return lot
        raise HTTPException(status_code=409, detail="Lot has already been accepted by another recycler")
    
    if lot.status != "AVAILABLE":
        raise HTTPException(status_code=400, detail=f"Lot cannot be accepted in state {lot.status}")

    now = datetime.now(timezone.utc)
    lot.status = "ACCEPTED"
    lot.accepted_by = req.recycler_id
    lot.accepted_at = now

    audit = AuditLog(
        event_type="LOT_ACCEPTED",
        actor_id=req.recycler_id,
        actor_role="RECYCLER",
        entity_id=id,
        details={"recycler_id": req.recycler_id},
        timestamp=now
    )
    db.add(audit)
    db.commit()
    db.refresh(lot)
    return lot

@router.post("/{id}/verify", response_model=LotResponse)
def verify_lot(id: str, req: LotVerifyRequest, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    if lot.status not in ["ACCEPTED", "AVAILABLE"]:
        raise HTTPException(status_code=400, detail=f"Lot cannot be verified in state {lot.status}")

    lot.status = "VERIFIED"
    lot.recycler_verified_material = req.verified_material
    lot.recycler_weight_kg = req.verified_weight_kg
    lot.accepted_by = req.recycler_id

    audit = AuditLog(
        event_type="LOT_VERIFIED",
        actor_id=req.recycler_id,
        actor_role="RECYCLER",
        entity_id=id,
        details={
            "verified_material": req.verified_material,
            "verified_weight": req.verified_weight_kg,
            "final_rate": req.final_rate,
            "final_amount": req.final_amount
        },
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()
    db.refresh(lot)
    return lot
