import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.handover import Handover
from app.models.lot import Lot
from app.models.admin import AuditLog
from app.schemas.handover import HandoverCreate, HandoverResponse

router = APIRouter(prefix="/handovers", tags=["Handovers"])

@router.get("", response_model=List[HandoverResponse])
def list_handovers(
    lot_id: Optional[str] = Query(None),
    recycler_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Handover)
    if lot_id:
        query = query.filter(Handover.lot_id == lot_id)
    if recycler_id:
        query = query.filter(Handover.recycler_id == recycler_id)
    if status:
        query = query.filter(Handover.status == status)
    return query.order_by(Handover.created_at.desc()).all()

@router.get("/{id_or_ref}", response_model=HandoverResponse)
def get_handover(id_or_ref: str, db: Session = Depends(get_db)):
    # Check by id, qr_reference, or lot_id
    handover = db.query(Handover).filter(
        (Handover.id == id_or_ref) | 
        (Handover.qr_reference == id_or_ref) | 
        (Handover.lot_id == id_or_ref)
    ).first()
    if not handover:
        raise HTTPException(status_code=404, detail="Handover session not found")
    return handover

@router.post("", response_model=HandoverResponse)
def create_handover(req: HandoverCreate, db: Session = Depends(get_db)):
    # Check if handover for this lot already exists
    existing = db.query(Handover).filter(Handover.lot_id == req.lot_id).first()
    if existing:
        return existing

    lot = db.query(Lot).filter(Lot.id == req.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Associated Lot not found")

    handover_id = req.id or str(uuid.uuid4())
    qr_ref = str(uuid.uuid4())[:8].upper()
    now = datetime.now(timezone.utc)

    handover = Handover(
        id=handover_id,
        lot_id=req.lot_id,
        recycler_id=req.recycler_id,
        collector_id=req.collector_id or lot.collector_id,
        verified_weight_kg=req.verified_weight_kg,
        final_rate=req.final_rate,
        final_amount=req.final_amount,
        status="QR_GENERATED",
        qr_reference=qr_ref,
        created_at_local=req.created_at_local or str(now),
        created_at=now
    )
    db.add(handover)

    # Update lot status
    lot.status = "QR_GENERATED"
    lot.recycler_weight_kg = req.verified_weight_kg

    audit = AuditLog(
        event_type="HANDOVER_CREATED",
        actor_id=req.recycler_id,
        actor_role="RECYCLER",
        entity_id=handover_id,
        details={
            "lot_id": req.lot_id,
            "qr_reference": qr_ref,
            "final_amount": req.final_amount
        },
        timestamp=now
    )
    db.add(audit)
    db.commit()
    db.refresh(handover)
    return handover

@router.post("/{id}/confirm", response_model=HandoverResponse)
def confirm_handover(id: str, db: Session = Depends(get_db)):
    handover = db.query(Handover).filter(
        (Handover.id == id) | (Handover.qr_reference == id)
    ).first()
    if not handover:
        raise HTTPException(status_code=404, detail="Handover session not found")

    if handover.status in ["COLLECTOR_CONFIRMED", "COMPLETED"]:
        return handover # Idempotent

    if handover.status != "QR_GENERATED":
        raise HTTPException(status_code=400, detail=f"Cannot confirm handover in status {handover.status}")

    now = datetime.now(timezone.utc)
    handover.status = "COLLECTOR_CONFIRMED"
    handover.collector_confirmed_at = now

    lot = db.query(Lot).filter(Lot.id == handover.lot_id).first()
    if lot:
        lot.status = "COLLECTOR_CONFIRMED"

    audit = AuditLog(
        event_type="HANDOVER_COLLECTOR_CONFIRMED",
        actor_id=handover.collector_id,
        actor_role="COLLECTOR",
        entity_id=handover.id,
        details={"qr_reference": handover.qr_reference},
        timestamp=now
    )
    db.add(audit)
    db.commit()
    db.refresh(handover)
    return handover

@router.post("/{id}/complete", response_model=HandoverResponse)
def complete_handover(id: str, db: Session = Depends(get_db)):
    handover = db.query(Handover).filter(
        (Handover.id == id) | (Handover.qr_reference == id)
    ).first()
    if not handover:
        raise HTTPException(status_code=404, detail="Handover session not found")

    if handover.status == "COMPLETED":
        return handover

    if handover.status != "COLLECTOR_CONFIRMED":
        raise HTTPException(
            status_code=400,
            detail="Handover must be confirmed by collector before completing"
        )

    now = datetime.now(timezone.utc)
    handover.status = "COMPLETED"
    handover.completed_at = now

    lot = db.query(Lot).filter(Lot.id == handover.lot_id).first()
    if lot:
        lot.status = "COMPLETED"

    audit = AuditLog(
        event_type="HANDOVER_COMPLETED",
        actor_id=handover.recycler_id,
        actor_role="RECYCLER",
        entity_id=handover.id,
        details={"final_amount": handover.final_amount},
        timestamp=now
    )
    db.add(audit)
    db.commit()
    db.refresh(handover)
    return handover
