"""
MandiSetu — Module 2: Price Discovery & Trend Engine
Endpoints:
  GET /prices/live          — live mandi prices (Agmarknet / data.gov.in)
  GET /prices/history       — historical prices from DB cache
  GET /prices/trend         — ML forecast (Prophet)
  GET /prices/markets       — list top markets for a commodity
"""
import httpx
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.config import settings
from app.core.redis_client import cache_get, cache_set
from app.models import MandiPrice
from app.schemas import MandiPriceOut, PriceTrendOut
from app.services.price_service import fetch_agmarknet_prices, get_price_history
from app.services.ml_forecaster import forecast_prices

router = APIRouter(prefix="/prices", tags=["Module 2 — Price Discovery"])


@router.get("/live", response_model=List[MandiPriceOut])
async def get_live_prices(
    commodity: str = Query(..., description="e.g. Wheat, Tomato, Onion"),
    state: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Fetch latest mandi prices — Redis-cached for 1 hour."""
    cache_key = f"live_prices:{commodity}:{state}:{limit}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    # Try Agmarknet API
    prices = await fetch_agmarknet_prices(commodity=commodity, state=state, limit=limit)

    if not prices:
        # Fallback to DB cache
        query = select(MandiPrice).where(MandiPrice.commodity.ilike(f"%{commodity}%"))
        if state:
            query = query.where(MandiPrice.state.ilike(f"%{state}%"))
        query = query.order_by(desc(MandiPrice.arrival_date)).limit(limit)
        result = await db.execute(query)
        prices = [p.__dict__ for p in result.scalars().all()]

    await cache_set(cache_key, prices)
    return prices


@router.get("/history", response_model=List[MandiPriceOut])
async def get_price_history_endpoint(
    commodity: str = Query(...),
    mandi_name: str = Query(...),
    days: int = Query(90, le=365),
    db: AsyncSession = Depends(get_db),
):
    """Return historical price data for trend charts."""
    prices = await get_price_history(db=db, commodity=commodity, mandi_name=mandi_name, days=days)
    return prices


@router.get("/trend", response_model=PriceTrendOut)
async def get_price_trend(
    commodity: str = Query(...),
    mandi_name: str = Query(...),
    horizon_days: int = Query(14, ge=7, le=60),
    db: AsyncSession = Depends(get_db),
):
    """Return historical + ML forecast (Prophet) for a commodity-mandi pair."""
    cache_key = f"trend:{commodity}:{mandi_name}:{horizon_days}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    history = await get_price_history(db=db, commodity=commodity, mandi_name=mandi_name, days=180)
    if len(history) < 10:
        raise HTTPException(status_code=404, detail="Insufficient historical data for this commodity/mandi pair")

    result = await forecast_prices(history=history, horizon_days=horizon_days, commodity=commodity, mandi_name=mandi_name)
    await cache_set(cache_key, result, ttl=3600)
    return result


@router.get("/markets")
async def list_top_markets(
    commodity: str = Query(...),
    state: Optional[str] = Query(None),
    limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
):
    """List top mandis for a commodity ranked by modal price (last 7 days)."""
    from sqlalchemy import func
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    query = (
        select(
            MandiPrice.mandi_name,
            MandiPrice.state,
            MandiPrice.district,
            func.avg(MandiPrice.modal_price).label("avg_price"),
            func.max(MandiPrice.arrival_date).label("last_seen"),
        )
        .where(MandiPrice.commodity.ilike(f"%{commodity}%"))
        .where(MandiPrice.arrival_date >= cutoff)
    )
    if state:
        query = query.where(MandiPrice.state.ilike(f"%{state}%"))
    query = query.group_by(MandiPrice.mandi_name, MandiPrice.state, MandiPrice.district)
    query = query.order_by(desc("avg_price")).limit(limit)

    result = await db.execute(query)
    rows = result.fetchall()
    return [
        {
            "mandi_name": r.mandi_name,
            "state": r.state,
            "district": r.district,
            "avg_modal_price": round(r.avg_price, 2),
            "last_seen": r.last_seen.isoformat() if r.last_seen else None,
        }
        for r in rows
    ]
