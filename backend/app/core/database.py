import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

def normalize_database_url(url: str) -> str:
    """
    Ensure DATABASE_URL uses the postgresql+psycopg2 dialect driver.
    Supabase and cloud providers often provide 'postgres://' or 'postgresql://' URLs.
    """
    if not url:
        return "sqlite:///./sahirate.db"
    clean_url = url.strip().strip("'\"")
    if clean_url.startswith("postgres://"):
        return "postgresql+psycopg2://" + clean_url[len("postgres://"):]
    elif clean_url.startswith("postgresql://") and not clean_url.startswith("postgresql+"):
        return "postgresql+psycopg2://" + clean_url[len("postgresql://"):]
    return clean_url

DATABASE_URL = normalize_database_url(settings.DATABASE_URL)

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

if DATABASE_URL.startswith("sqlite"):
    # SQLite requires check_same_thread=False for multithreaded requests
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL (e.g., Supabase Session or Transaction pooler)
    # Set connect_timeout to prevent the network handshake from hanging indefinitely
    connect_args["connect_timeout"] = 10
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
    })

logger.info(f"Database engine configured for dialect: {DATABASE_URL.split(':', 1)[0]}")

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

