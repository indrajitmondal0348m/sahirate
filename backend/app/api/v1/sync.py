import uuid
from datetime import datetime, timezone
from typing import Union, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.lot import Lot
from app.models.handover import Handover
from app.models.payment import Payment
from app.models.sync import SyncEventLog
from app.models.admin import AuditLog
from app.schemas.sync import SyncBatchRequest, SyncBatchResponse, SyncItemResult, SyncEventItem

router = APIRouter(prefix="/sync", tags=["Sync"])

def process_single_event(event: SyncEventItem, db: Session) -> SyncItemResult:
    event_id = event.id or event.event_id or str(uuid.uuid4())
    idempotency_key = event.idempotency_key or event_id

    # 1. Idempotency Check
    existing_log = db.query(SyncEventLog).filter(SyncEventLog.idempotency_key == idempotency_key).first()
    if existing_log:
        return SyncItemResult(
            id=event_id,
            status="already_processed",
            message="Event already processed idempotently"
        )

    try:
        now = datetime.now(timezone.utc)
        payload = event.payload or {}

        if event.type == "LOT_CREATED":
            lot_id = event_id # or payload.get("id") or event_id
            existing_lot = db.query(Lot).filter(Lot.id == lot_id).first()
            if not existing_lot:
                new_lot = Lot(
                    id=lot_id,
                    collector_id=payload.get("collector_id") or "collector-demo-1",
                    material_id=payload.get("material_id", "PLASTIC"),
                    approx_weight_kg=float(payload.get("approx_weight_kg", 0)),
                    estimated_value=float(payload.get("estimated_value", 0)),
                    photo_reference=payload.get("photo_reference"),
                    latitude=payload.get("latitude"),
                    longitude=payload.get("longitude"),
                    created_at_local=event.created_at_local or str(now),
                    status="AVAILABLE",
                    synced_at=now,
                    extra_data=payload.get("extra_data") or {
                        "items": payload.get("items"),
                        "asking_price": payload.get("asking_price"),
                        "estimated_min": payload.get("estimated_min"),
                        "estimated_max": payload.get("estimated_max"),
                    }
                )
                db.add(new_lot)
            
            # Audit log
            audit = AuditLog(
                event_type="LOT_CREATED",
                entity_id=lot_id,
                details=payload,
                timestamp=now
            )
            db.add(audit)

        elif event.type == "LOT_ACCEPTED":
            lot_id = payload.get("lot_id")
            recycler_id = payload.get("recycler_id", "demo-recycler-123")
            if lot_id:
                lot = db.query(Lot).filter(Lot.id == lot_id).first()
                if lot:
                    lot.status = "ACCEPTED"
                    lot.accepted_by = recycler_id
                    lot.accepted_at = now
            audit = AuditLog(
                event_type="LOT_ACCEPTED",
                actor_id=recycler_id,
                actor_role="RECYCLER",
                entity_id=lot_id,
                details=payload,
                timestamp=now
            )
            db.add(audit)

        elif event.type == "HANDOVER_CREATED":
            handover_id = payload.get("id") or str(uuid.uuid4())
            lot_id = payload.get("lot_id")
            existing_h = db.query(Handover).filter(Handover.id == handover_id).first()
            if not existing_h and lot_id:
                new_h = Handover(
                    id=handover_id,
                    lot_id=lot_id,
                    recycler_id=payload.get("recycler_id", "demo-recycler-123"),
                    collector_id=payload.get("collector_id"),
                    verified_weight_kg=float(payload.get("verified_weight_kg", 0)),
                    final_rate=float(payload.get("final_rate", 0)),
                    final_amount=float(payload.get("final_amount", 0)),
                    status="QR_GENERATED",
                    qr_reference=payload.get("qr_reference") or str(uuid.uuid4())[:8].upper(),
                    created_at_local=event.created_at_local or str(now),
                    created_at=now
                )
                db.add(new_h)
                
                # Update lot status
                lot = db.query(Lot).filter(Lot.id == lot_id).first()
                if lot:
                    lot.status = "QR_GENERATED"
                    lot.recycler_weight_kg = float(payload.get("verified_weight_kg", 0))

            audit = AuditLog(
                event_type="HANDOVER_CREATED",
                entity_id=handover_id,
                details=payload,
                timestamp=now
            )
            db.add(audit)

        elif event.type == "HANDOVER_COLLECTOR_CONFIRMED":
            handover_id = payload.get("handover_id")
            if handover_id:
                handover = db.query(Handover).filter(Handover.id == handover_id).first()
                if handover:
                    handover.status = "COLLECTOR_CONFIRMED"
                    handover.collector_confirmed_at = now
                    lot = db.query(Lot).filter(Lot.id == handover.lot_id).first()
                    if lot:
                        lot.status = "COLLECTOR_CONFIRMED"

            audit = AuditLog(
                event_type="HANDOVER_COLLECTOR_CONFIRMED",
                entity_id=handover_id,
                details=payload,
                timestamp=now
            )
            db.add(audit)

        elif event.type == "HANDOVER_COMPLETED":
            handover_id = payload.get("handover_id")
            if handover_id:
                handover = db.query(Handover).filter(Handover.id == handover_id).first()
                if handover:
                    handover.status = "COMPLETED"
                    handover.completed_at = now
                    lot = db.query(Lot).filter(Lot.id == handover.lot_id).first()
                    if lot:
                        lot.status = "COMPLETED"

            audit = AuditLog(
                event_type="HANDOVER_COMPLETED",
                entity_id=handover_id,
                details=payload,
                timestamp=now
            )
            db.add(audit)

        elif event.type == "PAYMENT_RECORDED":
            payment_id = payload.get("id") or str(uuid.uuid4())
            handover_id = payload.get("handover_id")
            existing_p = db.query(Payment).filter(Payment.id == payment_id).first()
            if not existing_p and handover_id:
                new_p = Payment(
                    id=payment_id,
                    handover_id=handover_id,
                    amount=float(payload.get("amount", 0)),
                    payment_mode=payload.get("payment_mode", "CASH"),
                    status=payload.get("status", "PAID"),
                    paid_at=now,
                    created_at_local=event.created_at_local or str(now),
                    created_at=now
                )
                db.add(new_p)

            audit = AuditLog(
                event_type="PAYMENT_RECORDED",
                entity_id=payment_id,
                details=payload,
                timestamp=now
            )
            db.add(audit)

        # Record into SyncEventLog
        log_entry = SyncEventLog(
            id=event_id,
            idempotency_key=idempotency_key,
            event_type=event.type,
            payload=payload,
            status="PROCESSED",
            processed_at=now
        )
        db.add(log_entry)
        db.commit()

        return SyncItemResult(id=event_id, status="synced", message="Success")

    except Exception as e:
        db.rollback()
        return SyncItemResult(id=event_id, status="error", message=str(e))

@router.post("/events", response_model=SyncBatchResponse)
def ingest_sync_events(
    request_data: Union[SyncBatchRequest, SyncEventItem, Dict[str, Any]] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Ingest offline outbox events. Accepts either a batch { "events": [...] }
    or a single event object { "id": "...", "type": "...", "payload": {...} }.
    """
    items_to_process: List[SyncEventItem] = []

    if isinstance(request_data, SyncBatchRequest):
        items_to_process = request_data.events
    elif isinstance(request_data, SyncEventItem):
        items_to_process = [request_data]
    elif isinstance(request_data, dict):
        if "events" in request_data and isinstance(request_data["events"], list):
            items_to_process = [SyncEventItem(**item) for item in request_data["events"]]
        else:
            items_to_process = [SyncEventItem(**request_data)]

    results: List[SyncItemResult] = []
    has_errors = False

    for item in items_to_process:
        res = process_single_event(item, db)
        results.append(res)
        if res.status == "error":
            has_errors = True

    return SyncBatchResponse(success=not has_errors, results=results)
