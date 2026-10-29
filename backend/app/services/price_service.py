"""
MandiSetu — Price Service
Fetches data from data.gov.in Agmarknet API and falls back to bundled CSV.
"""
import httpx
import csv
import io
import os
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.config import settings
from app.models import MandiPrice

AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
AGMARKNET_API = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}"

# Bundled seed dataset path (committed to repo)
SEED_CSV_PATH = os.path.join(os.path.dirname(__file__), "../ml/datasets/agmarknet_seed.csv")


async def fetch_agmarknet_prices(
    commodity: str,
    state: Optional[str] = None,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    """
    Hit data.gov.in Agmarknet REST API.
    Falls back gracefully to empty list if API key not set or network fails.
    """
    if not settings.DATA_GOV_IN_API_KEY or settings.DATA_GOV_IN_API_KEY == "YOUR_DATA_GOV_IN_API_KEY":
        return []  # Caller will use DB cache instead

    params = {
        "api-key": settings.DATA_GOV_IN_API_KEY,
        "format": "json",
        "limit": limit,
        "filters[Commodity]": commodity,
    }
    if state:
        params["filters[State]"] = state

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(AGMARKNET_API, params=params)
            resp.raise_for_status()
            data = resp.json()
            records = data.get("records", [])
            return [
                {
                    "commodity": r.get("Commodity", commodity),
                    "variety": r.get("Variety", ""),
                    "state": r.get("State", ""),
                    "district": r.get("District", ""),
                    "mandi_name": r.get("Market", ""),
                    "arrival_date": r.get("Arrival_Date", datetime.now(timezone.utc).isoformat()),
                    "min_price": float(r.get("Min_x0020_Price", 0) or 0),
                    "max_price": float(r.get("Max_x0020_Price", 0) or 0),
                    "modal_price": float(r.get("Modal_x0020_Price", 0) or 0),
                    "unit": "Quintal",
                    "source": "agmarknet",
                }
                for r in records
                if float(r.get("Modal_x0020_Price", 0) or 0) > 0
            ]
    except Exception:
        return []


async def get_price_history(
    db: AsyncSession,
    commodity: str,
    mandi_name: str,
    days: int = 180,
) -> List[Dict[str, Any]]:
    """Fetch historical prices from DB for a commodity-mandi pair."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    query = (
        select(MandiPrice)
        .where(MandiPrice.commodity.ilike(f"%{commodity}%"))
        .where(MandiPrice.mandi_name.ilike(f"%{mandi_name}%"))
        .where(MandiPrice.arrival_date >= cutoff)
        .order_by(MandiPrice.arrival_date)
    )
    result = await db.execute(query)
    rows = result.scalars().all()
    return [
        {
            "arrival_date": r.arrival_date.isoformat(),
            "modal_price": r.modal_price,
            "min_price": r.min_price,
            "max_price": r.max_price,
            "mandi_name": r.mandi_name,
            "commodity": r.commodity,
            "state": r.state,
            "district": r.district,
            "variety": r.variety,
            "unit": r.unit,
            "source": r.source,
        }
        for r in rows
    ]


async def seed_database_from_csv(db: AsyncSession) -> int:
    """
    On first startup, seed MandiPrice table from bundled CSV.
    Returns number of rows inserted.
    """
    if not os.path.exists(SEED_CSV_PATH):
        return 0

    inserted = 0
    with open(SEED_CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                price = MandiPrice(
                    commodity=row.get("Commodity", ""),
                    variety=row.get("Variety", ""),
                    state=row.get("State", ""),
                    district=row.get("District", ""),
                    mandi_name=row.get("Market", row.get("Mandi", "")),
                    arrival_date=datetime.strptime(
                        row.get("Arrival_Date", "2024-01-01"), "%d/%m/%Y"
                    ).replace(tzinfo=timezone.utc),
                    min_price=float(row.get("Min_Price", 0) or 0),
                    max_price=float(row.get("Max_Price", 0) or 0),
                    modal_price=float(row.get("Modal_Price", 0) or 0),
                    unit="Quintal",
                    source="seed_csv",
                )
                db.add(price)
                inserted += 1
            except Exception:
                continue
    await db.commit()
    return inserted
