"""
MandiSetu — Sale Window Service (Module 7)
Combines price forecast with perishability/spoilage curve
to recommend optimal sell date.
"""
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List


# Perishability profiles — daily quality loss fraction
PERISHABILITY_PROFILES = {
    # commodity_lower: daily_loss_pct
    "tomato": 0.08,
    "onion": 0.02,
    "potato": 0.015,
    "wheat": 0.003,
    "rice": 0.003,
    "maize": 0.005,
    "apple": 0.04,
    "banana": 0.07,
    "mango": 0.06,
    "default": 0.03,
}


def spoilage_score(commodity: str, days_since_harvest: int) -> float:
    """Returns spoilage fraction (0 = fresh, 1 = fully spoiled)."""
    rate = PERISHABILITY_PROFILES.get(commodity.lower(), PERISHABILITY_PROFILES["default"])
    return min(1.0, rate * days_since_harvest)


def spoilage_risk_label(score: float) -> str:
    if score < 0.3:
        return "low"
    elif score < 0.6:
        return "medium"
    elif score < 0.85:
        return "high"
    return "critical"


def compute_sale_window(
    forecast: Dict[str, Any],
    harvest_date: datetime,
    perishability_days: int,
    commodity: str,
    mandi_name: str,
    quantity_kg: float,
) -> Dict[str, Any]:
    """
    Optimal sell date = argmax(price × (1 - spoilage_fraction))
    within the perishability window.
    """
    forecast_dates = forecast.get("forecast_dates", [])
    forecast_prices = forecast.get("forecast_prices", [])

    today = datetime.now(timezone.utc)
    best_date = None
    best_score = -1.0
    best_price = 0.0
    best_spoilage = 0.0

    chart_dates: List[str] = []
    chart_prices: List[float] = []
    chart_spoilage: List[float] = []

    for date_str, price in zip(forecast_dates, forecast_prices):
        try:
            sell_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            continue
        days_from_harvest = (sell_date - harvest_date).days
        if days_from_harvest < 0:
            continue
        if days_from_harvest > perishability_days:
            break

        sp = spoilage_score(commodity, days_from_harvest)
        effective_value = price * (1 - sp)
        chart_dates.append(date_str)
        chart_prices.append(price)
        chart_spoilage.append(round(sp, 3))

        if effective_value > best_score:
            best_score = effective_value
            best_date = date_str
            best_price = price
            best_spoilage = sp

    if not best_date:
        # Default: sell tomorrow
        best_date = (today + timedelta(days=1)).strftime("%Y-%m-%d")
        best_price = forecast_prices[0] if forecast_prices else 0.0
        best_spoilage = 0.0

    spoilage_risk = spoilage_risk_label(best_spoilage)
    trend = forecast.get("trend", "stable")

    if trend == "rising" and best_spoilage < 0.3:
        reason = f"Price is trending upward. Waiting until {best_date} captures peak value before quality degrades."
    elif trend == "falling":
        reason = f"Price is declining. Sell as early as {best_date} to avoid further loss."
    else:
        reason = f"{best_date} balances stable price (₹{best_price:.1f}/qtl) with manageable spoilage risk ({int(best_spoilage*100)}%)."

    return {
        "commodity": commodity,
        "mandi_name": mandi_name,
        "recommended_sell_date": best_date,
        "recommended_sell_date_reason": reason,
        "expected_price_on_date": round(best_price, 2),
        "spoilage_risk_by_date": spoilage_risk,
        "price_trend": trend,
        "forecast_chart": {
            "dates": chart_dates,
            "prices": chart_prices,
            "spoilage_scores": chart_spoilage,
        },
        "confidence_score": round(forecast.get("confidence", 0.7), 2),
    }
