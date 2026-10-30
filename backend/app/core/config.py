"""
MandiSetu — Core Configuration
Reads settings from environment variables with sensible defaults for local dev.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "MandiSetu"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_super_secret_key_mandisetu"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://mandisetu:mandisetu@localhost:5432/mandisetu_db"
    DATABASE_URL_SYNC: str = "postgresql://mandisetu:mandisetu@localhost:5432/mandisetu_db"

    # ── Redis ────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 3600  # 1 hour default cache

    # ── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",
        "https://mandisetu.vercel.app",
        "https://mandisetu-frontend.vercel.app",
        "https://mandisetu-tanmaya.vercel.app",
    ]
    # Set ALLOW_ALL_ORIGINS=True in Render env for wildcard Vercel preview URLs
    ALLOW_ALL_ORIGINS: bool = True

    # ── External APIs ────────────────────────────────────────────────────────
    OPENWEATHER_API_KEY: str = "YOUR_OPENWEATHER_API_KEY"
    DATA_GOV_IN_API_KEY: str = "YOUR_DATA_GOV_IN_API_KEY"
    AGMARKNET_BASE_URL: str = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

    # ── File Storage ─────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ── ML ───────────────────────────────────────────────────────────────────
    FORECAST_HORIZON_DAYS: int = 14
    MODEL_CACHE_DIR: str = "app/ml"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
