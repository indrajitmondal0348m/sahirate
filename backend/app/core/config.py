import os
import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

DEFAULT_DEV_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173", 
]

class Settings(BaseSettings):
    PROJECT_NAME: str = "SahiRate Backend API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sahirate-secret-key-super-secure-change-in-prod-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"

    # SQLite by default for simple zero-config local run, supports PostgreSQL via env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sahirate.db")

    # CORS settings allowing Collector frontend and Recycler/Admin frontendRA
    CORS_ORIGINS: Union[List[str], str] = DEFAULT_DEV_ORIGINS

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return DEFAULT_DEV_ORIGINS
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            origins = [origin.strip() for origin in v.split(",") if origin.strip()]
            # Always ensure dev origins are included if in development
            return origins if origins else DEFAULT_DEV_ORIGINS
        elif isinstance(v, (list, tuple)):
            return [str(item).strip() for item in v if str(item).strip()]
        return DEFAULT_DEV_ORIGINS

    model_config = {"case_sensitive": True, "extra": "ignore"}

settings = Settings()

