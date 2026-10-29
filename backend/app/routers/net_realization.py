"""
MandiSetu — Module 3: Net-Realization Calculator
Computes true farmer take-home value after all deductions.

Formula per market:
  net_per_kg = modal_price
              - transport_cost_per_kg
              - commission_per_kg
              - storage_cost_per_kg

Transport cost model:
  cost/kg = (distance_km × rate_per_km_per_tonne) / 1000
  rate varies by vehicle type: truck ≈ ₹15/km/tonne baseline
"""
import math
from typing import List
from fastapi import APIRouter, Depends
from app.core.security import get_current_user_payload
from app.schemas import NetRealizationRequest, NetRealizationResponse, MarketRealizationResult

router = APIRouter(prefix="/calculator", tags=["Module 3 — Net-Realization Calculator"])

# Freight rate constants (₹ per km per tonne, baseline India avg)
RATE_PER_KM_PER_TONNE = 15.0      # ₹15 per km per tonne (truck)
FUEL_SURCHARGE_PCT = 0.08          # 8% fuel surcharge on freight
MANDI_COMMISSION_DEFAULT_PCT = 0.02  # 2% commission if not specified
HANDLING_PER_KG = 0.50             # ₹0.50/kg loading/unloading


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in kilometres."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def compute_transport_cost_per_kg(distance_km: float) -> float:
    base = (distance_km * RATE_PER_KM_PER_TONNE) / 1000  # per kg
    return round(base * (1 + FUEL_SURCHARGE_PCT) + HANDLING_PER_KG, 3)


def compute_commission_per_kg(price_per_kg: float, commission_pct: float) -> float:
    return round(price_per_kg * commission_pct, 3)


@router.post("/net-realization", response_model=NetRealizationResponse)
async def calculate_net_realization(
    req: NetRealizationRequest,
    payload=Depends(get_current_user_payload),
):
    """
    Given a list of candidate markets (with location & price data),
    compute and rank each by true net realization for the farmer.
    """
    results: List[MarketRealizationResult] = []

    for market in req.markets:
        market_lat = market.get("lat", 0)
        market_lng = market.get("lng", 0)
        market_price = market.get("modal_price", req.listed_price_per_kg)
        commission_pct = market.get("commission_pct", MANDI_COMMISSION_DEFAULT_PCT)
        market_name = market.get("name", "Unknown Market")

        dist_km = haversine_km(req.origin_lat, req.origin_lng, market_lat, market_lng)
        transport_cost = compute_transport_cost_per_kg(dist_km)
        commission = compute_commission_per_kg(market_price, commission_pct)
        storage_cost = (req.storage_days or 0) * (req.storage_cost_per_kg_per_day or 0)

        net_per_kg = market_price - transport_cost - commission - storage_cost
        total_net = net_per_kg * req.quantity_kg

        results.append(MarketRealizationResult(
            market_name=market_name,
            distance_km=round(dist_km, 1),
            listed_price_per_kg=market_price,
            transport_cost_per_kg=transport_cost,
            commission_per_kg=commission,
            storage_cost_per_kg=storage_cost,
            net_realization_per_kg=round(net_per_kg, 2),
            total_net_realization=round(total_net, 2),
            rank=0,  # filled below
        ))

    # Rank by net realization descending
    results.sort(key=lambda r: r.net_realization_per_kg, reverse=True)
    for i, r in enumerate(results):
        r.rank = i + 1

    best = results[0]
    reason = (
        f"{best.market_name} gives the highest net realization of "
        f"₹{best.net_realization_per_kg}/kg despite being {best.distance_km} km away, "
        f"outweighing transport cost of ₹{best.transport_cost_per_kg}/kg."
    )

    return NetRealizationResponse(
        commodity=req.commodity,
        quantity_kg=req.quantity_kg,
        results=results,
        recommended_market=best.market_name,
        recommended_market_reason=reason,
    )


@router.get("/freight-estimate")
async def estimate_freight(
    distance_km: float,
    quantity_kg: float,
    payload=Depends(get_current_user_payload),
):
    """Quick freight estimate for a given distance and quantity."""
    cost_per_kg = compute_transport_cost_per_kg(distance_km)
    return {
        "distance_km": distance_km,
        "quantity_kg": quantity_kg,
        "freight_cost_per_kg": cost_per_kg,
        "total_freight_cost": round(cost_per_kg * quantity_kg, 2),
        "basis": f"₹{RATE_PER_KM_PER_TONNE}/km/tonne + {int(FUEL_SURCHARGE_PCT*100)}% surcharge + ₹{HANDLING_PER_KG}/kg handling",
    }
