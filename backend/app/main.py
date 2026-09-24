from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
import app.models # Register all models with Base
from app.services.seed import seed_database

from app.api.v1.auth import router as auth_router
from app.api.v1.sync import router as sync_router
from app.api.v1.lots import router as lots_router
from app.api.v1.handovers import router as handovers_router
from app.api.v1.payments import router as payments_router
from app.api.v1.rates import router as rates_router
from app.api.v1.admin import router as admin_router

from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and seed demo data
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        cols = [row[1] for row in conn.execute(text("PRAGMA table_info(users)"))]
        if cols and "email" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(100)"))
        if cols and "location" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN location VARCHAR(150)"))
        conn.commit()

    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown: Nothing to clean up

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
api_v1_str = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_str)
app.include_router(sync_router, prefix=api_v1_str)
app.include_router(lots_router, prefix=api_v1_str)
app.include_router(handovers_router, prefix=api_v1_str)
app.include_router(payments_router, prefix=api_v1_str)
app.include_router(rates_router, prefix=api_v1_str)
app.include_router(admin_router, prefix=api_v1_str)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "database": "connected"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to SahiRate Backend API",
        "docs": "/docs",
        "health": "/health"
    }
