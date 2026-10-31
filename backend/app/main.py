"""
MandiSetu — FastAPI Application Entry Point
Registers all 12-module routers.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import create_all_tables

# ─── Import all routers ───────────────────────────────────────────────────────
from app.routers.auth import router as auth_router
from app.routers.prices import router as prices_router
from app.routers.net_realization import router as net_calc_router
from app.routers.listings import router as listings_router, offers_router
from app.routers.transactions import (
    transactions_router, logistics_router, disputes_router, feedback_router
)
from app.routers.misc_modules import (
    sale_window_router,
    buyer_scoring_router,
    grading_router,
    weather_router,
    analytics_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # Create tables on startup
    try:
        await create_all_tables()
        print(f"[MandiSetu] ✅ Database connected and all tables verified.")
        from app.core.database import AsyncSessionLocal
        from app.services.price_service import seed_database_from_csv
        async with AsyncSessionLocal() as db:
            seeded = await seed_database_from_csv(db)
            if seeded:
                print(f"[MandiSetu] Seeded {seeded} price records from CSV")
    except Exception as e:
        import traceback
        print(f"[MandiSetu] ⚠️ Database connection failed on startup: {e}")
        traceback.print_exc()

    # Create uploads directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print(f"[MandiSetu] 🌾 Server started — {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    print("[MandiSetu] Shutting down...")


app = FastAPI(
    title="MandiSetu API",
    description=(
        "Market-intelligence and transaction-enablement platform for smallholder farmers/FPOs and buyers. "
        "12 modules: Auth · Price Discovery · Net-Realization · Listings · Matching · "
        "Transaction Tracking · Sale Window · Buyer Scoring · Logistics · Disputes · "
        "Quality Grading · Weather Advisory · Analytics."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mandi-setu-two.vercel.app",
        "https://mandisetu.vercel.app",
        "https://mandisetu-frontend.vercel.app",
        "https://mandisetu-tanmaya.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ─── Static files (uploaded images) ──────────────────────────────────────────
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ─── Register all routers under /api/v1 ──────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth_router,          prefix=API_PREFIX)  # Module 1
app.include_router(prices_router,        prefix=API_PREFIX)  # Module 2
app.include_router(net_calc_router,      prefix=API_PREFIX)  # Module 3
app.include_router(listings_router,      prefix=API_PREFIX)  # Module 4
app.include_router(offers_router,        prefix=API_PREFIX)  # Module 5
app.include_router(transactions_router,  prefix=API_PREFIX)  # Module 6
app.include_router(sale_window_router,   prefix=API_PREFIX)  # Module 7
app.include_router(buyer_scoring_router, prefix=API_PREFIX)  # Module 8
app.include_router(logistics_router,     prefix=API_PREFIX)  # Module 8b
app.include_router(disputes_router,      prefix=API_PREFIX)  # Module 9
app.include_router(grading_router,       prefix=API_PREFIX)  # Module 10
app.include_router(weather_router,       prefix=API_PREFIX)  # Module 11
app.include_router(analytics_router,     prefix=API_PREFIX)  # Module 12
app.include_router(feedback_router,      prefix=API_PREFIX)  # Module 14


@app.get("/")
@app.get("/api/v1")
@app.get("/api/v1/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "modules": 12,
        "status": "running",
    }


@app.get("/health")
@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/debug/db")
@app.get("/api/v1/debug/db")
async def debug_db():
    from app.core.config import settings
    import re
    raw = settings.DATABASE_URL
    masked = re.sub(r"://([^:]+):([^@]+)@", r"://\1:****@", raw)
    is_local = "localhost" in raw or "127.0.0.1" in raw
    res = {
        "configured_database_url": masked,
        "is_localhost": is_local,
        "warning": "DATABASE_URL is pointing to localhost! Add DATABASE_URL to your Render Web Service environment variables with your Render PostgreSQL Internal Connection String." if is_local else None,
    }
    try:
        from app.core.database import AsyncSessionLocal, create_all_tables
        from sqlalchemy import text
        # Ensure tables exist
        await create_all_tables()
        async with AsyncSessionLocal() as session:
            r = await session.execute(text("SELECT count(*) FROM users;"))
            count = r.scalar()
            res["status"] = "connected"
            res["users_count"] = count
            r_users = await session.execute(text("SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 10;"))
            res["recent_users"] = [
                {"id": str(u[0]), "email": u[1], "full_name": u[2], "role": str(u[3]), "created_at": str(u[4])}
                for u in r_users.fetchall()
            ]
    except Exception as e:
        import traceback
        res["status"] = "error"
        res["error"] = str(e)
        res["traceback"] = traceback.format_exc()
    return res
