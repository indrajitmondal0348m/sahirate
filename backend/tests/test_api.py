import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.services.seed import seed_database

from sqlalchemy import text

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        cols = [row[1] for row in conn.execute(text("PRAGMA table_info(users)"))]
        if cols and "email" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(100)"))
        if cols and "location" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN location VARCHAR(150)"))
        conn.commit()

    db = SessionLocal()
    seed_database(db)
    db.close()

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_get_rates(client):
    response = client.get("/api/v1/rates")
    assert response.status_code == 200
    rates = response.json()
    assert len(rates) >= 5
    materials = [r["material_id"] for r in rates]
    assert "PLASTIC" in materials
    assert "BATTERY" in materials

def test_sync_lot_creation_and_idempotency(client):
    import uuid
    uid = str(uuid.uuid4())[:8]
    event_id = f"test-evt-{uid}"
    idemp_key = f"idemp-key-{uid}"
    event_payload = {
        "id": event_id,
        "type": "LOT_CREATED",
        "idempotency_key": idemp_key,
        "created_at_local": "2026-09-22T10:00:00Z",
        "payload": {
            "material_id": "PLASTIC",
            "approx_weight_kg": 15.5,
            "estimated_value": 1240.0,
            "collector_id": "collector-test-1"
        }
    }

    # 1. First sync submission
    resp1 = client.post("/api/v1/sync/events", json=event_payload)
    assert resp1.status_code == 200
    res_data1 = resp1.json()
    assert res_data1["success"] is True
    assert res_data1["results"][0]["status"] == "synced"

    # 2. Second sync submission (Idempotency test)
    resp2 = client.post("/api/v1/sync/events", json=event_payload)
    assert resp2.status_code == 200
    res_data2 = resp2.json()
    assert res_data2["results"][0]["status"] == "already_processed"

    # 3. Verify lot is in database
    get_lot = client.get(f"/api/v1/lots/{event_id}")
    assert get_lot.status_code == 200
    lot_data = get_lot.json()
    assert lot_data["material_id"] == "PLASTIC"
    assert lot_data["approx_weight_kg"] == 15.5
    assert lot_data["status"] == "AVAILABLE"

def test_lot_lifecycle_and_handover_flow(client):
    # 1. Create a lot directly
    create_resp = client.post("/api/v1/lots", json={
        "material_id": "WIRE",
        "approx_weight_kg": 10.0,
        "estimated_value": 10000.0,
        "collector_id": "col-lifecycle-1"
    })
    assert create_resp.status_code == 200
    lot = create_resp.json()
    lot_id = lot["id"]
    assert lot["status"] == "AVAILABLE"

    # 2. Recycler accepts lot
    accept_resp = client.post(f"/api/v1/lots/{lot_id}/accept", json={"recycler_id": "rec-lifecycle-1"})
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "ACCEPTED"
    assert accept_resp.json()["accepted_by"] == "rec-lifecycle-1"

    # 3. Recycler generates handover & QR
    handover_resp = client.post("/api/v1/handovers", json={
        "lot_id": lot_id,
        "recycler_id": "rec-lifecycle-1",
        "verified_weight_kg": 10.2,
        "final_rate": 1020.0,
        "final_amount": 10404.0
    })
    assert handover_resp.status_code == 200
    handover = handover_resp.json()
    handover_id = handover["id"]
    assert handover["status"] == "QR_GENERATED"
    assert len(handover["qr_reference"]) > 0

    # 4. Collector scans QR and confirms
    confirm_resp = client.post(f"/api/v1/handovers/{handover_id}/confirm")
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["status"] == "COLLECTOR_CONFIRMED"

    # 5. Recycler completes handover
    complete_resp = client.post(f"/api/v1/handovers/{handover_id}/complete")
    assert complete_resp.status_code == 200
    assert complete_resp.json()["status"] == "COMPLETED"

    # 6. Recycler records payment
    payment_resp = client.post("/api/v1/payments", json={
        "handover_id": handover_id,
        "amount": 10404.0,
        "payment_mode": "UPI"
    })
    assert payment_resp.status_code == 200
    assert payment_resp.json()["status"] == "PAID"

def test_recycler_registration_and_admin_verification(client):
    import uuid
    uid = str(uuid.uuid4())[:8]
    phone = f"99{uid[:8]}"
    
    # 1. Register Recycler
    reg_resp = client.post("/api/v1/auth/register-recycler", json={
        "phone": phone,
        "password": "securepassword123",
        "full_name": "Vikram Patel",
        "organization_name": f"Patel Metals & Smelters {uid}",
        "email": f"vikram_{uid}@patelmetals.com",
        "address": "Plot 42, GIDC Industrial Estate",
        "gst_number": "24ABCDE1234F1Z5",
        "pcb_license": f"PCB-GUJ-{uid.upper()}",
        "facility_type": "Authorized Dismantler / Smelter",
        "daily_capacity_kg": 5000.0,
        "location": "Ahmedabad, Gujarat"
    })
    assert reg_resp.status_code == 200
    user_data = reg_resp.json()
    assert user_data["phone"] == phone
    assert user_data["is_verified"] is False
    assert user_data["verification_status"] == "PENDING"

    # 2. Login as pending recycler
    login_resp = client.post("/api/v1/auth/login", json={
        "phone": phone,
        "password": "securepassword123"
    })
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert token_data["user"]["verification_status"] == "PENDING"

    # 3. Check that it appears in admin verification queue
    verif_resp = client.get("/api/v1/admin/verification?status=PENDING")
    assert verif_resp.status_code == 200
    verifs = verif_resp.json()
    matching = [v for v in verifs if v["user_name"] == f"Patel Metals & Smelters {uid}"]
    assert len(matching) == 1
    req_id = matching[0]["id"]
    assert matching[0]["details"]["contact_person"] == "Vikram Patel"

    # 4. Admin approves
    approve_resp = client.post(f"/api/v1/admin/verification/{req_id}/approve")
    assert approve_resp.status_code == 200

def test_collector_registration_and_login_with_email_and_location(client):
    import uuid
    uid = str(uuid.uuid4())[:6]
    email = f"collector_{uid}@sahirate.in"
    password = "collectorpass123"

    # 1. Register new collector with email, name, location, and password
    reg_resp = client.post("/api/v1/auth/register", json={
        "full_name": f"Sunil Mehra {uid}",
        "email": email,
        "location": "Ward 9, Raipur",
        "password": password,
        "role": "COLLECTOR"
    })
    assert reg_resp.status_code == 200
    data = reg_resp.json()
    assert data["email"] == email
    assert data["full_name"] == f"Sunil Mehra {uid}"
    assert data["location"] == "Ward 9, Raipur"
    assert data["is_verified"] is True

    # 2. Login with email and password
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == email

def test_login_unregistered_email_fails(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "notregistered@example.com",
        "password": "randompassword123"
    })
    assert resp.status_code == 401
    assert "No registered account found" in resp.json()["detail"]

def test_duplicate_registration_fails(client):
    import uuid
    uid = str(uuid.uuid4())[:6]
    email = f"dup_{uid}@sahirate.in"
    # First registration
    resp1 = client.post("/api/v1/auth/register", json={
        "full_name": "Test Collector",
        "email": email,
        "location": "Nagpur",
        "password": "password123",
        "role": "COLLECTOR"
    })
    assert resp1.status_code == 200

    # Second registration with same email
    resp2 = client.post("/api/v1/auth/register", json={
        "full_name": "Test Collector 2",
        "email": email,
        "location": "Nagpur",
        "password": "password123",
        "role": "COLLECTOR"
    })
    assert resp2.status_code == 400
    assert "already registered" in resp2.json()["detail"]
