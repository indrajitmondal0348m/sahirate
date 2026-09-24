import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.rate import MaterialRate
from app.models.user import User, Profile
from app.models.admin import AdminAlert, VerificationRequest, AuditLog
from app.models.lot import Lot
from app.models.handover import Handover
from app.models.payment import Payment
from app.core.security import get_password_hash

def seed_database(db: Session):
    now = datetime.now(timezone.utc)

    # 1. Seed Material Rates
    rates_data = [
        {"material_id": "BATTERY", "label": "Battery", "price_min": 80.0, "price_max": 100.0, "unit": "kg", "unit_label": "kg"},
        {"material_id": "DISPLAY", "label": "Display", "price_min": 450.0, "price_max": 520.0, "unit": "piece", "unit_label": "display"},
        {"material_id": "MOTOR", "label": "Motor", "price_min": 450.0, "price_max": 580.0, "unit": "kg", "unit_label": "kg"},
        {"material_id": "PCB", "label": "PCB", "price_min": 90.0, "price_max": 110.0, "unit": "piece", "unit_label": "board"},
        {"material_id": "WIRE", "label": "Wire", "price_min": 980.0, "price_max": 1050.0, "unit": "kg", "unit_label": "kg"},
        {"material_id": "CABLE", "label": "Wire", "price_min": 980.0, "price_max": 1050.0, "unit": "kg", "unit_label": "kg"},
        {"material_id": "METAL", "label": "Metal", "price_min": 120.0, "price_max": 175.0, "unit": "kg", "unit_label": "kg"},
        {"material_id": "PLASTIC", "label": "Plastic", "price_min": 75.0, "price_max": 90.0, "unit": "kg", "unit_label": "kg"},
    ]
    for r in rates_data:
        existing = db.query(MaterialRate).filter(MaterialRate.material_id == r["material_id"]).first()
        if not existing:
            db.add(MaterialRate(**r, updated_at=now))

    # 2. Seed Demo Users
    demo_users = [
        {
            "id": "demo-collector-1",
            "phone": "9876543210",
            "email": "collector@sahirate.in",
            "location": "Ward 14, Nagpur",
            "full_name": "Ramesh Kumar (Collector)",
            "role": "COLLECTOR",
            "is_verified": True
        },
        {
            "id": "demo-recycler-123",
            "phone": "9876543211",
            "email": "recycler@ecorecycle.in",
            "location": "MIDC Hingna, Nagpur",
            "full_name": "EcoRecycle Yard Ltd (Recycler)",
            "role": "RECYCLER",
            "is_verified": True
        },
        {
            "id": "demo-admin-1",
            "phone": "9876543212",
            "email": "admin@sahirate.in",
            "location": "Central Directorate, New Delhi",
            "full_name": "Super Admin (SahiRate)",
            "role": "ADMIN",
            "is_verified": True
        }
    ]
    for u in demo_users:
        existing_u = db.query(User).filter(User.id == u["id"]).first()
        if not existing_u:
            new_u = User(
                id=u["id"],
                phone=u["phone"],
                email=u.get("email"),
                location=u.get("location"),
                full_name=u["full_name"],
                role=u["role"],
                hashed_password=get_password_hash("sahirate123"),
                is_active=True,
                is_verified=u["is_verified"],
                created_at=now
            )
            db.add(new_u)
            prof = Profile(
                user_id=u["id"],
                organization_name=u["full_name"],
                address=u.get("location"),
                verification_status="APPROVED",
                updated_at=now
            )
            db.add(prof)
        else:
            if not existing_u.email and u.get("email"):
                existing_u.email = u.get("email")
            if not existing_u.location and u.get("location"):
                existing_u.location = u.get("location")

    # 3. Seed Sample Verification Requests
    if db.query(VerificationRequest).count() == 0:
        verifications = [
            VerificationRequest(
                id="vr-01",
                user_id="user-rec-201",
                user_name="GreenPulse Smelters Pvt Ltd",
                role="RECYCLER",
                document_type="PCB/CTO License",
                document_number="MH-PCB-2026-99182",
                facility_name="Dharavi E-Waste Yard 4",
                location="Mumbai, MH",
                status="PENDING",
                submitted_at=now - timedelta(hours=3)
            ),
            VerificationRequest(
                id="vr-02",
                user_id="user-rec-202",
                user_name="Apex Battery Reclaimers",
                role="RECYCLER",
                document_type="Hazardous Waste Authorization",
                document_number="GJ-HAZ-2025-44110",
                facility_name="GIDC Industrial Plot 12",
                location="Surat, GJ",
                status="PENDING",
                submitted_at=now - timedelta(hours=6)
            ),
            VerificationRequest(
                id="vr-03",
                user_id="user-col-301",
                user_name="Sanjay Scrap Aggregator",
                role="COLLECTOR",
                document_type="Aadhaar & Trade License",
                document_number="XXXX-XXXX-4819",
                facility_name="Sanjay Scrap Hub",
                location="Pune, MH",
                status="APPROVED",
                submitted_at=now - timedelta(days=2),
                reviewed_at=now - timedelta(days=1)
            )
        ]
        for v in verifications:
            db.add(v)

    # 4. Seed Sample Admin Alerts
    if db.query(AdminAlert).count() == 0:
        alerts = [
            AdminAlert(
                id="alt-01",
                severity="HIGH",
                title="Weight Discrepancy > 25%",
                description="Lot LOT-9481 entered by collector as 15.0kg, yard weighed at 9.2kg (-38.6%).",
                entity_id="lot-discrepancy-1",
                status="OPEN",
                created_at=now - timedelta(hours=1)
            ),
            AdminAlert(
                id="alt-02",
                severity="MEDIUM",
                title="Unusual Wire Surge Volume",
                description="High volume wire lots (over 250kg) submitted within 2 hours in Kurla zone.",
                entity_id="lot-surge-2",
                status="OPEN",
                created_at=now - timedelta(hours=4)
            ),
            AdminAlert(
                id="alt-03",
                severity="LOW",
                title="Stale Handover QR Code",
                description="QR session expired after 45 minutes without collector confirmation.",
                entity_id="handover-timeout-3",
                status="RESOLVED",
                created_at=now - timedelta(days=1)
            )
        ]
        for a in alerts:
            db.add(a)

    # 5. Seed Sample Lots and Completed Handovers (so Recycler & Admin dashboards look great!)
    if db.query(Lot).count() == 0:
        sample_lots = [
            {
                "id": "lot-sample-1",
                "collector_id": "demo-collector-1",
                "material_id": "PLASTIC",
                "approx_weight_kg": 25.0,
                "estimated_value": 2062.0,
                "status": "AVAILABLE",
                "created_at_local": (now - timedelta(hours=2)).isoformat(),
            },
            {
                "id": "lot-sample-2",
                "collector_id": "demo-collector-1",
                "material_id": "WIRE",
                "approx_weight_kg": 12.0,
                "estimated_value": 12180.0,
                "status": "AVAILABLE",
                "created_at_local": (now - timedelta(hours=1)).isoformat(),
            },
            {
                "id": "lot-sample-3",
                "collector_id": "demo-collector-1",
                "material_id": "BATTERY",
                "approx_weight_kg": 35.0,
                "estimated_value": 3150.0,
                "status": "ACCEPTED",
                "accepted_by": "demo-recycler-123",
                "accepted_at": now - timedelta(minutes=40),
                "created_at_local": (now - timedelta(hours=3)).isoformat(),
            },
            {
                "id": "lot-sample-4",
                "collector_id": "demo-collector-1",
                "material_id": "PCB",
                "approx_weight_kg": 18.0,
                "estimated_value": 1800.0,
                "status": "COMPLETED",
                "accepted_by": "demo-recycler-123",
                "accepted_at": now - timedelta(days=1),
                "recycler_verified_material": "PCB",
                "recycler_weight_kg": 18.2,
                "created_at_local": (now - timedelta(days=1)).isoformat(),
            }
        ]
        for s in sample_lots:
            l = Lot(**s, synced_at=now)
            db.add(l)

        # Add completed handover and payment for sample-4
        h4 = Handover(
            id="ho-sample-4",
            lot_id="lot-sample-4",
            recycler_id="demo-recycler-123",
            collector_id="demo-collector-1",
            verified_weight_kg=18.2,
            final_rate=100.0,
            final_amount=1820.0,
            status="COMPLETED",
            qr_reference="SR-9921A",
            collector_confirmed_at=now - timedelta(days=1),
            recycler_confirmed_at=now - timedelta(days=1),
            completed_at=now - timedelta(days=1),
            created_at=now - timedelta(days=1)
        )
        db.add(h4)

        p4 = Payment(
            id="pay-sample-4",
            handover_id="ho-sample-4",
            amount=1820.0,
            payment_mode="UPI",
            status="PAID",
            paid_at=now - timedelta(days=1),
            created_at=now - timedelta(days=1)
        )
        db.add(p4)

    # 6. Seed initial audit log if empty
    if db.query(AuditLog).count() == 0:
        db.add(AuditLog(
            event_type="SYSTEM_INITIALIZED",
            actor_role="SYSTEM",
            details={"version": "M12-FastAPI", "message": "Backend database initialized and seeded"},
            timestamp=now
        ))

    db.commit()
