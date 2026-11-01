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
            
            # Auto-seed live initial produce lots and escrow transactions if DB empty
            try:
                from sqlalchemy import select, func
                from app.models import ProduceLot, Transaction, Offer, OfferStatus, LotStatus, TransactionStatus, User, GradeLevel
                import uuid
                from datetime import datetime, timezone

                lot_count = (await db.execute(select(func.count(ProduceLot.id)))).scalar()
                first_u = (await db.execute(select(User).limit(1))).scalar_one_or_none()
                if first_u and lot_count == 0:
                    owner_id = first_u.id
                    seed_lots = [
                        ProduceLot(
                            id=uuid.UUID("1a2b3c4d-0001-4000-8000-000000000001"),
                            owner_id=owner_id,
                            commodity="Wheat",
                            variety="Sharbati HD-2967",
                            quantity_kg=2500,
                            min_price_per_kg=24.5,
                            expected_price_per_kg=26.0,
                            grade=GradeLevel.A_PLUS,
                            quality_score=0.92,
                            status=LotStatus.ACTIVE,
                            state="Madhya Pradesh",
                            district="Sehore",
                            mandi_name="Sehore Krishi Mandi",
                            latitude=23.2032,
                            longitude=77.0844,
                            is_aggregated=False,
                        ),
                        ProduceLot(
                            id=uuid.UUID("1a2b3c4d-0002-4000-8000-000000000002"),
                            owner_id=owner_id,
                            commodity="Tomato",
                            variety="Hybrid Round",
                            quantity_kg=1800,
                            min_price_per_kg=16.0,
                            expected_price_per_kg=18.5,
                            grade=GradeLevel.A,
                            quality_score=0.84,
                            status=LotStatus.ACTIVE,
                            state="Karnataka",
                            district="Kolar",
                            mandi_name="Kolar APMC Market",
                            latitude=13.1367,
                            longitude=78.1291,
                            is_aggregated=True,
                        ),
                        ProduceLot(
                            id=uuid.UUID("1a2b3c4d-0003-4000-8000-000000000003"),
                            owner_id=owner_id,
                            commodity="Onion",
                            variety="Nashik Red (Garva)",
                            quantity_kg=5000,
                            min_price_per_kg=18.5,
                            expected_price_per_kg=21.0,
                            grade=GradeLevel.B,
                            quality_score=0.74,
                            status=LotStatus.ACTIVE,
                            state="Maharashtra",
                            district="Nashik",
                            mandi_name="Lasalgaon APMC",
                            latitude=20.1466,
                            longitude=74.2259,
                            is_aggregated=True,
                        ),
                        ProduceLot(
                            id=uuid.UUID("1a2b3c4d-0004-4000-8000-000000000004"),
                            owner_id=owner_id,
                            commodity="Rice",
                            variety="Basmati 1121",
                            quantity_kg=3200,
                            min_price_per_kg=34.0,
                            expected_price_per_kg=36.5,
                            grade=GradeLevel.A_PLUS,
                            quality_score=0.95,
                            status=LotStatus.ACTIVE,
                            state="Punjab",
                            district="Amritsar",
                            mandi_name="Amritsar Grain Market",
                            latitude=31.6340,
                            longitude=74.8723,
                            is_aggregated=False,
                        ),
                    ]
                    db.add_all(seed_lots)
                    await db.commit()
                    print(f"[MandiSetu] Seeded {len(seed_lots)} live produce lots to PostgreSQL")

                # Seed demo transaction if none exist
                txn_count = (await db.execute(select(func.count(Transaction.id)))).scalar()
                if first_u and txn_count == 0:
                    first_lot = (await db.execute(select(ProduceLot).limit(1))).scalar_one_or_none()
                    if first_lot:
                        demo_offer = Offer(
                            id=uuid.UUID("1a2b3c4d-0001-5000-8000-000000000001"),
                            lot_id=first_lot.id,
                            buyer_id=first_u.id,
                            offered_price_per_kg=first_lot.min_price_per_kg,
                            quantity_kg=first_lot.quantity_kg,
                            message="Procurement order via MandiSetu Escrow",
                            status=OfferStatus.ACCEPTED,
                        )
                        db.add(demo_offer)
                        await db.commit()

                        tot = round((first_lot.quantity_kg or 2500) * (first_lot.min_price_per_kg or 24.5), 2)
                        demo_txn = Transaction(
                            id=uuid.UUID("99014401-8801-4000-8000-000000000001"),
                            lot_id=first_lot.id,
                            offer_id=demo_offer.id,
                            seller_id=first_lot.owner_id,
                            buyer_id=first_u.id,
                            final_price_per_kg=first_lot.min_price_per_kg or 24.5,
                            quantity_kg=first_lot.quantity_kg or 2500,
                            total_amount=tot,
                            transport_cost=1200.0,
                            commission_cost=round(tot * 0.02, 2),
                            storage_cost=0.0,
                            net_realization=round(tot - 1200.0 - (tot * 0.02), 2),
                            status=TransactionStatus.IN_TRANSIT,
                            status_history=[
                                {"status": "initiated", "timestamp": datetime.now(timezone.utc).isoformat(), "note": "Trade contract generated"},
                                {"status": "payment_received", "timestamp": datetime.now(timezone.utc).isoformat(), "note": "Buyer escrow funded"},
                                {"status": "in_transit", "timestamp": datetime.now(timezone.utc).isoformat(), "note": "Dispatched via Tata 407"}
                            ],
                            logistics_provider="MandiSetu AgriLogistics (Tata 407)",
                            tracking_id="TRK-IND-9281",
                        )
                        db.add(demo_txn)
                        await db.commit()
                        print("[MandiSetu] Seeded live escrow demo transaction connected to lot")
            except Exception as e_seed:
                print(f"[MandiSetu DB Seed Notice]: {e_seed}")
            except Exception as e_seed:
                print(f"[MandiSetu DB Seed Notice]: {e_seed}")
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
