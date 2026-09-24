import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.payment import Payment
from app.models.handover import Handover
from app.models.admin import AuditLog
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("", response_model=List[PaymentResponse])
def list_payments(
    handover_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Payment)
    if handover_id:
        query = query.filter(Payment.handover_id == handover_id)
    if status:
        query = query.filter(Payment.status == status)
    return query.order_by(Payment.paid_at.desc()).all()

@router.post("", response_model=PaymentResponse)
def record_payment(req: PaymentCreate, db: Session = Depends(get_db)):
    handover = db.query(Handover).filter(Handover.id == req.handover_id).first()
    if not handover:
        raise HTTPException(status_code=404, detail="Handover not found")

    if handover.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Handover must be completed before recording payment")

    existing = db.query(Payment).filter(Payment.handover_id == req.handover_id).first()
    if existing:
        return existing

    payment_id = req.id or str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    payment = Payment(
        id=payment_id,
        handover_id=req.handover_id,
        amount=req.amount,
        payment_mode=req.payment_mode,
        status="PAID",
        paid_at=now,
        created_at_local=req.created_at_local or str(now),
        created_at=now
    )
    db.add(payment)

    audit = AuditLog(
        event_type="PAYMENT_RECORDED",
        actor_id=handover.recycler_id,
        actor_role="RECYCLER",
        entity_id=payment_id,
        details={"handover_id": req.handover_id, "amount": req.amount, "mode": req.payment_mode},
        timestamp=now
    )
    db.add(audit)
    db.commit()
    db.refresh(payment)
    return payment
