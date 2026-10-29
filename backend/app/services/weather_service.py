"""
MandiSetu — Weather Risk Advisory Service (Module 11)
Integrates OpenWeatherMap for real-time data + risk scoring per commodity.
"""
import httpx
from typing import Dict, Any, List
from app.core.config import settings

# Commodity weather risk thresholds
COMMODITY_RISK_PROFILE = {
    "wheat":   {"rain_mm": 10, "temp_max": 35, "temp_min": 5,  "humidity_max": 80},
    "rice":    {"rain_mm": 50, "temp_max": 38, "temp_min": 15, "humidity_max": 90},
    "tomato":  {"rain_mm": 5,  "temp_max": 30, "temp_min": 10, "humidity_max": 75},
    "onion":   {"rain_mm": 8,  "temp_max": 35, "temp_min": 10, "humidity_max": 70},
    "potato":  {"rain_mm": 10, "temp_max": 30, "temp_min": 5,  "humidity_max": 80},
    "default": {"rain_mm": 15, "temp_max": 38, "temp_min": 5,  "humidity_max": 85},
}


def assess_risk(weather: Dict, profile: Dict) -> tuple:
    """Returns (risk_level, risk_factors)."""
    factors = []
    score = 0

    rain = weather.get("rain_1h", 0) or 0
    temp = weather.get("temp", 25)
    humidity = weather.get("humidity", 60)

    if rain > profile["rain_mm"]:
        factors.append(f"Heavy rain ({rain}mm/hr) exceeds safe limit ({profile['rain_mm']}mm)")
        score += 3
    if temp > profile["temp_max"]:
        factors.append(f"High temperature ({temp}°C) — spoilage risk elevated")
        score += 2
    if humidity > profile["humidity_max"]:
        factors.append(f"High humidity ({humidity}%) — fungal risk for stored produce")
        score += 2
    if temp < profile["temp_min"]:
        factors.append(f"Low temperature ({temp}°C) — frost/chilling injury risk")
        score += 1

    if score == 0:
        level = "low"
    elif score <= 2:
        level = "medium"
    elif score <= 4:
        level = "high"
    else:
        level = "critical"

    return level, factors


async def get_weather_risk(lat: float, lng: float, commodity: str) -> Dict[str, Any]:
    """Fetch real-time weather + 7-day forecast, return risk advisory."""
    profile = COMMODITY_RISK_PROFILE.get(commodity.lower(), COMMODITY_RISK_PROFILE["default"])

    current_weather = {}
    forecast_7day = []
    location = f"{lat:.2f},{lng:.2f}"

    if settings.OPENWEATHER_API_KEY and settings.OPENWEATHER_API_KEY != "YOUR_OPENWEATHER_API_KEY":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Current
                r = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={"lat": lat, "lon": lng, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"},
                )
                r.raise_for_status()
                wd = r.json()
                current_weather = {
                    "temp": wd["main"]["temp"],
                    "humidity": wd["main"]["humidity"],
                    "description": wd["weather"][0]["description"],
                    "rain_1h": wd.get("rain", {}).get("1h", 0),
                    "wind_speed": wd["wind"]["speed"],
                }
                location = wd.get("name", location)

                # 7-day forecast
                fr = await client.get(
                    "https://api.openweathermap.org/data/2.5/forecast",
                    params={"lat": lat, "lon": lng, "appid": settings.OPENWEATHER_API_KEY, "units": "metric", "cnt": 7},
                )
                fr.raise_for_status()
                fd = fr.json()
                forecast_7day = [
                    {
                        "dt": item["dt_txt"],
                        "temp": item["main"]["temp"],
                        "humidity": item["main"]["humidity"],
                        "description": item["weather"][0]["description"],
                    }
                    for item in fd.get("list", [])
                ]
        except Exception:
            pass

    # Mock data if API not configured
    if not current_weather:
        current_weather = {
            "temp": 28.0,
            "humidity": 65,
            "description": "partly cloudy (demo data)",
            "rain_1h": 0,
            "wind_speed": 8.5,
        }
        forecast_7day = [
            {"dt": f"2024-01-0{i+1} 12:00:00", "temp": 27 + i * 0.5, "humidity": 65, "description": "clear sky"}
            for i in range(7)
        ]

    risk_level, risk_factors = assess_risk(current_weather, profile)

    advisory_map = {
        "low": f"Conditions are favorable for {commodity}. Safe to transport and store.",
        "medium": f"Minor weather risks detected. Monitor storage conditions for {commodity}.",
        "high": f"High risk conditions — prioritize early sale of {commodity} to avoid losses.",
        "critical": f"CRITICAL: Extreme weather conditions. Immediate action required to protect {commodity} stock.",
    }

    return {
        "location": location,
        "commodity": commodity,
        "current_weather": current_weather,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "advisory": advisory_map[risk_level],
        "forecast_7day": forecast_7day,
    }
