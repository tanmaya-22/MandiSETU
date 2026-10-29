"""
MandiSetu — ML Price Forecaster (Module 2 & 7)
Uses Facebook Prophet for short-term price trend forecasting.
Falls back to simple linear regression if Prophet not installed.
"""
import warnings
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone

warnings.filterwarnings("ignore")


def _simple_linear_forecast(dates: List[str], prices: List[float], horizon: int) -> tuple:
    """Fallback: simple linear extrapolation if Prophet unavailable."""
    import numpy as np
    n = len(prices)
    x = list(range(n))
    x_arr = np.array(x)
    y_arr = np.array(prices)
    # Least squares
    xm, ym = x_arr.mean(), y_arr.mean()
    slope = np.sum((x_arr - xm) * (y_arr - ym)) / (np.sum((x_arr - xm) ** 2) + 1e-9)
    intercept = ym - slope * xm

    last_date = datetime.fromisoformat(dates[-1].replace("Z", "+00:00"))
    forecast_dates = [
        (last_date + timedelta(days=i + 1)).strftime("%Y-%m-%d")
        for i in range(horizon)
    ]
    forecast_prices = [
        round(intercept + slope * (n + i), 2)
        for i in range(horizon)
    ]
    return forecast_dates, forecast_prices, slope


async def forecast_prices(
    history: List[Dict[str, Any]],
    horizon_days: int,
    commodity: str,
    mandi_name: str,
) -> Dict[str, Any]:
    """
    Forecast mandi prices using Prophet (preferred) or linear regression (fallback).
    Returns PriceTrendOut-compatible dict.
    """
    # Prepare series
    dates = [h["arrival_date"][:10] for h in history]
    prices = [float(h["modal_price"]) for h in history]

    forecast_dates: List[str] = []
    forecast_prices_list: List[float] = []
    slope = 0.0

    try:
        from prophet import Prophet
        import pandas as pd

        df = pd.DataFrame({"ds": pd.to_datetime(dates), "y": prices})
        df = df.groupby("ds", as_index=False)["y"].mean()  # deduplicate dates

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.1,
            interval_width=0.80,
        )
        model.fit(df)
        future = model.make_future_dataframe(periods=horizon_days)
        forecast = model.predict(future)

        future_only = forecast.tail(horizon_days)
        forecast_dates = [d.strftime("%Y-%m-%d") for d in future_only["ds"]]
        forecast_prices_list = [round(float(p), 2) for p in future_only["yhat"]]

        # Trend from slope of yhat over forecast period
        import numpy as np
        slope = float(np.polyfit(range(len(forecast_prices_list)), forecast_prices_list, 1)[0])

    except ImportError:
        # Fallback
        forecast_dates, forecast_prices_list, slope = _simple_linear_forecast(dates, prices, horizon_days)

    # Trend label
    if slope > 0.5:
        trend = "rising"
    elif slope < -0.5:
        trend = "falling"
    else:
        trend = "stable"

    # Confidence: proportional to data density (more history = higher confidence)
    confidence = min(0.95, 0.5 + len(history) / 400)

    return {
        "dates": dates,
        "modal_prices": prices,
        "forecast_dates": forecast_dates,
        "forecast_prices": forecast_prices_list,
        "commodity": commodity,
        "mandi_name": mandi_name,
        "trend": trend,
        "confidence": round(confidence, 2),
    }
