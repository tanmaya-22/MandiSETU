"""
MandiSetu — Module 7: Sale-Window Recommendations (ML)
Module 10: Quality Grading via Image Upload
Module 11: Weather-Integrated Risk Advisory
Module 8: Buyer Verification & Reliability Scoring
Module 12: Analytics / Admin Dashboard
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models import User, ProduceLot, Transaction, Dispute, MandiPrice
from app.schemas import (
    SaleWindowRequest, SaleWindowOut,
    WeatherRiskOut, BuyerScoreOut, DashboardStatsOut,
)
from app.services.ml_forecaster import forecast_prices
from app.services.price_service import get_price_history
from app.services.weather_service import get_weather_risk
from app.services.grading_service import grade_produce_image

# ══════════════════════ MODULE 7 — Sale-Window ════════════════════════════════

sale_window_router = APIRouter(prefix="/sale-window", tags=["Module 7 — Sale-Window Recommendations"])


@sale_window_router.post("/recommend", response_model=SaleWindowOut)
async def recommend_sale_window(
    req: SaleWindowRequest,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Forecasts price trend and combines with perishability curve
    to recommend the optimal sell date.
    """
    history = await get_price_history(db=db, commodity=req.commodity, mandi_name=req.mandi_name, days=180)
    if len(history) < 10:
        raise HTTPException(status_code=404, detail="Insufficient historical data")

    forecast = await forecast_prices(
        history=history,
        horizon_days=req.perishability_days + 7,
        commodity=req.commodity,
        mandi_name=req.mandi_name,
    )

    from app.services.sale_window_service import compute_sale_window
    result = compute_sale_window(
        forecast=forecast,
        harvest_date=req.harvest_date,
        perishability_days=req.perishability_days,
        commodity=req.commodity,
        mandi_name=req.mandi_name,
        quantity_kg=req.quantity_kg,
    )
    return result


# ══════════════════════ MODULE 8 — Buyer Scoring ══════════════════════════════

buyer_scoring_router = APIRouter(prefix="/buyers", tags=["Module 8 — Buyer Verification & Reliability"])


@buyer_scoring_router.get("/{buyer_id}/score", response_model=BuyerScoreOut)
async def get_buyer_score(
    buyer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Compute buyer reliability score from transaction history."""
    result = await db.execute(select(User).where(User.id == buyer_id))
    buyer = result.scalar_one_or_none()
    if not buyer or buyer.role.value not in ("buyer", "fpo"):
        raise HTTPException(status_code=404, detail="Buyer not found")

    txns_result = await db.execute(
        select(Transaction).where(Transaction.buyer_id == buyer_id)
    )
    txns = txns_result.scalars().all()

    total = len(txns)
    completed = sum(1 for t in txns if t.status.value == "completed")
    disputed_against = await db.execute(
        select(func.count(Dispute.id)).join(
            Transaction, Dispute.transaction_id == Transaction.id
        ).where(Transaction.buyer_id == buyer_id)
    )
    dispute_count = disputed_against.scalar() or 0

    # Score formula: base 50, +3 per completed txn, -10 per dispute, +20 if verified
    score = 50.0 + (completed * 3) - (dispute_count * 10)
    if buyer.is_verified:
        score += 20
    score = max(0.0, min(100.0, score))

    # Update the stored score
    buyer.buyer_reliability_score = score

    badge = "Unrated"
    if score >= 80:
        badge = "Gold"
    elif score >= 60:
        badge = "Silver"
    elif score >= 40:
        badge = "Bronze"

    return BuyerScoreOut(
        buyer_id=buyer.id,
        full_name=buyer.full_name,
        business_name=buyer.business_name,
        reliability_score=score,
        total_transactions=total,
        completed_on_time=completed,
        disputes_filed_against=dispute_count,
        avg_payment_days=0.0,  # TODO: compute from payment_date - created_at
        verified=buyer.is_verified,
        badge=badge,
    )


@buyer_scoring_router.get("", response_model=List[BuyerScoreOut])
async def list_verified_buyers(
    commodity: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List verified buyers, optionally filtered by commodity interest."""
    result = await db.execute(
        select(User).where(User.role == "buyer", User.is_verified == True)
    )
    buyers = result.scalars().all()
    # For now return basic profiles; full scoring needs individual calls
    return [
        BuyerScoreOut(
            buyer_id=b.id,
            full_name=b.full_name,
            business_name=b.business_name,
            reliability_score=b.buyer_reliability_score or 0,
            total_transactions=0,
            completed_on_time=0,
            disputes_filed_against=0,
            avg_payment_days=0.0,
            verified=b.is_verified,
            badge="Gold" if (b.buyer_reliability_score or 0) >= 80 else "Silver",
        )
        for b in buyers
    ]


# ══════════════════════ MODULE 10 — Quality Grading ══════════════════════════

grading_router = APIRouter(prefix="/grading", tags=["Module 10 — Quality Grading (CV)"])


@grading_router.post("/grade")
async def grade_produce(
    lot_id: uuid.UUID,
    file: UploadFile = File(...),
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Upload produce image → CV model returns quality grade + score."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files accepted")

    image_bytes = await file.read()
    grading_result = await grade_produce_image(image_bytes)

    # Update lot if lot_id is provided
    lot_result = await db.execute(select(ProduceLot).where(ProduceLot.id == lot_id))
    lot = lot_result.scalar_one_or_none()
    if lot:
        lot.grade = grading_result["grade"]
        lot.quality_score = grading_result["score"]
        lot.quality_notes = grading_result["notes"]

    return grading_result


# ══════════════════════ MODULE 11 — Weather Risk ══════════════════════════════

weather_router = APIRouter(prefix="/weather", tags=["Module 11 — Weather Risk Advisory"])


@weather_router.get("/risk", response_model=WeatherRiskOut)
async def weather_risk(
    lat: float,
    lng: float,
    commodity: str,
    auth=Depends(get_current_user_payload),
):
    """Real-time weather + risk advisory for a location and commodity."""
    return await get_weather_risk(lat=lat, lng=lng, commodity=commodity)


# ══════════════════════ MODULE 12 — Analytics ════════════════════════════════

analytics_router = APIRouter(prefix="/analytics", tags=["Module 12 — Analytics Dashboard"])


@analytics_router.get("/dashboard", response_model=DashboardStatsOut)
async def dashboard_stats(
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Admin / platform-level analytics."""
    farmers = await db.execute(select(func.count(User.id)).where(User.role == "farmer"))
    buyers = await db.execute(select(func.count(User.id)).where(User.role == "buyer"))
    total_lots = await db.execute(select(func.count(ProduceLot.id)))
    active_lots = await db.execute(select(func.count(ProduceLot.id)).where(ProduceLot.status == "active"))
    total_txns = await db.execute(select(func.count(Transaction.id)))
    total_value = await db.execute(select(func.sum(Transaction.total_amount)))
    open_disputes = await db.execute(select(func.count(Dispute.id)).where(Dispute.status == "open"))
    avg_net = await db.execute(select(func.avg(Transaction.net_realization)))

    # Top commodities
    top_comm_result = await db.execute(
        select(ProduceLot.commodity, func.count(ProduceLot.id).label("count"))
        .group_by(ProduceLot.commodity)
        .order_by(func.count(ProduceLot.id).desc())
        .limit(5)
    )
    top_commodities = [{"commodity": r[0], "lots": r[1]} for r in top_comm_result.fetchall()]

    return DashboardStatsOut(
        total_farmers=farmers.scalar() or 0,
        total_buyers=buyers.scalar() or 0,
        total_lots=total_lots.scalar() or 0,
        active_lots=active_lots.scalar() or 0,
        total_transactions=total_txns.scalar() or 0,
        total_trade_value=float(total_value.scalar() or 0),
        open_disputes=open_disputes.scalar() or 0,
        avg_net_realization=float(avg_net.scalar() or 0),
        top_commodities=top_commodities,
        price_trends_summary=[],
    )
