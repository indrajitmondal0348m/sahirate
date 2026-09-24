import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token
from app.models.user import User, Profile
from app.models.admin import VerificationRequest, AuditLog
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, RecyclerRegisterRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    email_clean = user_in.email.strip().lower() if user_in.email else None
    phone_clean = user_in.phone.strip() if user_in.phone else None

    if email_clean:
        existing_email = db.query(User).filter(User.email.ilike(email_clean)).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="This email is already registered. Please sign in or use another email.")

    if phone_clean:
        existing_phone = db.query(User).filter(User.phone == phone_clean).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="This phone number is already registered.")

    user_id = str(uuid.uuid4())
    if not user_in.password:
        raise HTTPException(status_code=400, detail="Password is required")
    hashed_pwd = get_password_hash(user_in.password)
    phone_val = phone_clean or f"col-{user_id[:8]}"

    new_user = User(
        id=user_id,
        phone=phone_val,
        email=email_clean,
        full_name=user_in.full_name.strip() if user_in.full_name else None,
        location=user_in.location.strip() if user_in.location else None,
        role=user_in.role.upper(),
        hashed_password=hashed_pwd,
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    
    profile = Profile(
        user_id=user_id,
        organization_name=user_in.full_name,
        address=user_in.location,
        verification_status="APPROVED"
    )
    db.add(profile)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/register-recycler", response_model=UserResponse)
def register_recycler(req: RecyclerRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == req.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this phone number already exists")

    now = datetime.now(timezone.utc)
    user_id = str(uuid.uuid4())
    hashed_pwd = get_password_hash(req.password)

    new_user = User(
        id=user_id,
        phone=req.phone,
        full_name=req.full_name,
        role="RECYCLER",
        hashed_password=hashed_pwd,
        is_active=True,
        is_verified=False,
        created_at=now
    )
    db.add(new_user)

    # Profile
    profile = Profile(
        user_id=user_id,
        organization_name=req.organization_name,
        license_number=req.pcb_license,
        address=req.address,
        verification_status="PENDING",
        updated_at=now
    )
    db.add(profile)

    # Verification request listed in Admin portal
    verif = VerificationRequest(
        id=f"vr-{uuid.uuid4().hex[:8]}",
        user_id=user_id,
        user_name=req.organization_name,
        phone=req.phone,
        role="RECYCLER",
        document_type="Pollution Control Board (PCB) Authorization",
        document_number=req.pcb_license,
        facility_name=req.organization_name,
        location=req.location,
        details={
            "contact_person": req.full_name,
            "phone": req.phone,
            "email": req.email,
            "address": req.address,
            "gst_number": req.gst_number,
            "pcb_license": req.pcb_license,
            "facility_type": req.facility_type,
            "daily_capacity_kg": req.daily_capacity_kg,
            "location": req.location,
        },
        status="PENDING",
        submitted_at=now
    )
    db.add(verif)

    # Audit log
    audit = AuditLog(
        event_type="RECYCLER_REGISTRATION_SUBMITTED",
        actor_id=user_id,
        actor_role="RECYCLER",
        entity_id=verif.id,
        details={"organization": req.organization_name, "license": req.pcb_license},
        timestamp=now
    )
    db.add(audit)

    db.commit()
    db.refresh(new_user)
    
    resp = UserResponse.model_validate(new_user)
    resp.verification_status = "PENDING"
    return resp

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    identifier = login_data.email or login_data.phone or login_data.username
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or phone is required")

    identifier_clean = identifier.strip()

    user = db.query(User).filter(
        (User.phone == identifier_clean) | (User.email.ilike(identifier_clean))
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="No registered account found with this email or phone number. Please check your credentials or register a new collector account."
        )

    if not user.hashed_password or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password. Please verify and try again.")

    # Get verification status from profile
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    verif_status = profile.verification_status if profile else ("APPROVED" if user.is_verified else "PENDING")

    token = create_access_token(
        subject=user.id,
        extra_claims={"role": user.role, "phone": user.phone, "email": user.email, "verified": user.is_verified}
    )
    user_resp = UserResponse.model_validate(user)
    user_resp.verification_status = verif_status
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_me(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    verif_status = profile.verification_status if profile else ("APPROVED" if user.is_verified else "PENDING")
    
    user_resp = UserResponse.model_validate(user)
    user_resp.verification_status = verif_status
    return user_resp
