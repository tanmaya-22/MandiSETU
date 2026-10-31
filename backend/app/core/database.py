"""
MandiSetu — Async Database Engine (SQLAlchemy 2.x + asyncpg)
"""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# ── Async engine ──────────────────────────────────────────────────────────────
# Safely normalize connection strings from Render / cloud providers (postgres:// -> postgresql+asyncpg://)
import re

raw_url = settings.DATABASE_URL
if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+asyncpg://"):
    raw_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Asyncpg does not accept 'sslmode' in query params; strip it so it doesn't fail with TypeError
is_remote_host = "localhost" not in raw_url and "127.0.0.1" not in raw_url
if "sslmode=" in raw_url:
    raw_url = re.sub(r'[\?\&]sslmode=[^&]+', '', raw_url)
    if "&" in raw_url and "?" not in raw_url:
        raw_url = raw_url.replace("&", "?", 1)

connect_args = {}
# For remote cloud PostgreSQL (Render / Supabase / Neon / AWS), ensure SSL is enabled for asyncpg
if is_remote_host:
    connect_args["ssl"] = "require"

engine = create_async_engine(
    raw_url,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# ── Dependency for FastAPI routes ─────────────────────────────────────────────
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_all_tables():
    """Create all tables on startup (dev only — use Alembic in prod)."""
    async with engine.begin() as conn:
        from app import models
        from sqlalchemy import text
        await conn.run_sync(Base.metadata.create_all)
        # Resilient schema patch for existing PostgreSQL installations
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS powers JSON DEFAULT '[]'::json;"))
        except Exception as e:
            print(f"[MandiSetu DB] Column powers check notice: {e}")
