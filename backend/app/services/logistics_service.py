"""
MandiSetu — Logistics Service (Module 8b)
Distance-based freight cost estimation using Haversine + rate tables.
"""
import math
from app.schemas import LogisticsEstimateRequest, LogisticsEstimateOut

# Vehicle selection by quantity
VEHICLE_TIERS = [
    (500, "Auto-Rickshaw/Mini-Tempo", 25.0),    # < 500 kg
    (2000, "Tata Ace / Mini-Truck", 18.0),       # 500 – 2000 kg
    (10000, "Medium Truck (4-tonne)", 15.0),     # 2 – 10 tonne
    (float("inf"), "Large Truck (10-tonne)", 12.0),  # > 10 tonne
]


def _haversine(lat1, lng1, lat2, lng2) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


async def estimate_logistics(req: LogisticsEstimateRequest) -> LogisticsEstimateOut:
    dist_km = _haversine(req.origin_lat, req.origin_lng, req.dest_lat, req.dest_lng)
    # Road distance ≈ 1.3× great-circle (India average factor)
    road_km = dist_km * 1.3

    vehicle_name, rate = VEHICLE_TIERS[-1][1], VEHICLE_TIERS[-1][2]
    for capacity_kg, name, r in VEHICLE_TIERS:
        if req.quantity_kg <= capacity_kg:
            vehicle_name, rate = name, r
            break

    # Cost per tonne per km; convert to per kg
    freight_per_kg = (road_km * rate) / 1000
    freight_per_kg *= 1.08  # 8% fuel surcharge
    freight_per_kg += 0.50  # handling

    total_freight = freight_per_kg * req.quantity_kg
    avg_speed_kmh = 50.0
    estimated_hours = road_km / avg_speed_kmh

    return LogisticsEstimateOut(
        distance_km=round(road_km, 1),
        estimated_hours=round(estimated_hours, 1),
        freight_cost_per_kg=round(freight_per_kg, 3),
        total_freight_cost=round(total_freight, 2),
        recommended_vehicle=vehicle_name,
    )
