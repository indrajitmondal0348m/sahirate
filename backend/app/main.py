import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

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

logger = logging.getLogger("uvicorn.error")

def initialize_database():
    """
    Synchronous DB setup task executed in a background thread during startup.
    This guarantees Uvicorn immediately binds to PORT (e.g. 8080) for Cloud Run
    without waiting or hanging on network handshakes or slow DB poolers.
    """
    try:
        logger.info("Starting background database initialization and schema setup...")
        Base.metadata.create_all(bind=engine)

        if engine.dialect.name == "sqlite":
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
            logger.info("Database seeding completed.")
        except Exception as seed_err:
            logger.warning(f"Database seed skipped or non-fatal issue: {seed_err}")
        finally:
            db.close()

        logger.info("Database initialization completed successfully.")
    except Exception as e:
        logger.error(f"Non-fatal error during background database setup: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Non-blocking startup: Dispatch DB setup to a worker thread so Uvicorn
    # can immediately bind to $PORT (e.g. 8080) and pass Cloud Run health checks
    logger.info("FastAPI lifespan started: launching non-blocking DB initialization...")
    asyncio.create_task(asyncio.to_thread(initialize_database))
    yield
    # Shutdown: Nothing to clean up


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"degraded: {str(e)}"
        logger.warning(f"Health check DB probe notice: {e}")

    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "database": db_status
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to SahiRate Backend API",
        "docs": "/docs",
        "health": "/health"
    }
