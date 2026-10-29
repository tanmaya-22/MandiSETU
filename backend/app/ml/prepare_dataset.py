"""
MandiSetu — Agmarknet Seed Dataset Generator
Downloads and prepares historical mandi price data for seeding the database.

Data Sources:
  1. data.gov.in Agmarknet daily prices (public domain)
     Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
  2. eNAM portal price data (public CSVs)

Run: python app/ml/prepare_dataset.py
Output: app/ml/datasets/agmarknet_seed.csv
"""
import os
import csv
import random
import math
from datetime import datetime, timedelta

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "datasets/agmarknet_seed.csv")

# Synthetic price generation for prototyping
# Based on actual 2023-2024 Agmarknet price ranges (₹/Quintal)
COMMODITY_PROFILES = {
    "Wheat": {
        "mandis": [
            ("Hapur", "Uttar Pradesh", "Hapur"),
            ("Khanna", "Punjab", "Ludhiana"),
            ("Indore", "Madhya Pradesh", "Indore"),
            ("Karnal", "Haryana", "Karnal"),
        ],
        "base_price": 2100, "volatility": 80, "seasonal_amp": 150,
        "peak_month": 4,  # April (harvest)
    },
    "Tomato": {
        "mandis": [
            ("Kolar", "Karnataka", "Kolar"),
            ("Nashik", "Maharashtra", "Nashik"),
            ("Madanapalle", "Andhra Pradesh", "Chittoor"),
            ("Solan", "Himachal Pradesh", "Solan"),
        ],
        "base_price": 1500, "volatility": 600, "seasonal_amp": 800,
        "peak_month": 12,  # December
    },
    "Onion": {
        "mandis": [
            ("Lasalgaon", "Maharashtra", "Nashik"),
            ("Pimpalgaon", "Maharashtra", "Nashik"),
            ("Hubli", "Karnataka", "Dharwad"),
            ("Alwar", "Rajasthan", "Alwar"),
        ],
        "base_price": 1200, "volatility": 400, "seasonal_amp": 600,
        "peak_month": 10,
    },
    "Potato": {
        "mandis": [
            ("Agra", "Uttar Pradesh", "Agra"),
            ("Farrukhabad", "Uttar Pradesh", "Farrukhabad"),
            ("Hooghly", "West Bengal", "Hooghly"),
            ("Jalandhar", "Punjab", "Jalandhar"),
        ],
        "base_price": 900, "volatility": 200, "seasonal_amp": 300,
        "peak_month": 2,
    },
    "Rice": {
        "mandis": [
            ("Amritsar", "Punjab", "Amritsar"),
            ("Nizamabad", "Telangana", "Nizamabad"),
            ("Cuttack", "Odisha", "Cuttack"),
            ("Patna", "Bihar", "Patna"),
        ],
        "base_price": 2800, "volatility": 100, "seasonal_amp": 200,
        "peak_month": 11,
    },
    "Maize": {
        "mandis": [
            ("Davangere", "Karnataka", "Davangere"),
            ("Gulbarga", "Karnataka", "Kalaburagi"),
            ("Warangal", "Telangana", "Warangal"),
            ("Ganjam", "Odisha", "Ganjam"),
        ],
        "base_price": 1700, "volatility": 150, "seasonal_amp": 250,
        "peak_month": 10,
    },
}


def generate_price_series(commodity: str, profile: dict, days: int = 730) -> list:
    """Generate realistic synthetic price series with trend + seasonality + noise."""
    rows = []
    start_date = datetime.now() - timedelta(days=days)
    random.seed(42)

    for mandi_name, state, district in profile["mandis"]:
        price = profile["base_price"]
        trend = random.uniform(-0.05, 0.10)  # annual trend fraction

        for d in range(days):
            date = start_date + timedelta(days=d)

            # Seasonal component (sinusoidal)
            month_rad = (date.month - profile["peak_month"]) * math.pi / 6
            seasonal = profile["seasonal_amp"] * math.cos(month_rad)

            # Random walk noise
            noise = random.gauss(0, profile["volatility"] * 0.1)

            # Long-term trend
            daily_trend = profile["base_price"] * trend / 365

            price = max(
                profile["base_price"] * 0.3,
                price + daily_trend + noise + seasonal * 0.01
            )

            modal = round(price + seasonal * 0.5 + noise, 2)
            min_p = round(modal * 0.92, 2)
            max_p = round(modal * 1.08, 2)

            rows.append({
                "Commodity": commodity,
                "Variety": "Mixed",
                "State": state,
                "District": district,
                "Market": mandi_name,
                "Arrival_Date": date.strftime("%d/%m/%Y"),
                "Min_Price": max(100, min_p),
                "Max_Price": max_p,
                "Modal_Price": max(100, modal),
            })

    return rows


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    all_rows = []

    print("Generating synthetic Agmarknet price dataset...")
    for commodity, profile in COMMODITY_PROFILES.items():
        rows = generate_price_series(commodity, profile, days=730)
        all_rows.extend(rows)
        print(f"  {commodity}: {len(rows)} records")

    # Write CSV
    fieldnames = ["Commodity", "Variety", "State", "District", "Market",
                  "Arrival_Date", "Min_Price", "Max_Price", "Modal_Price"]

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"\nDataset written: {OUTPUT_PATH}")
    print(f"Total records: {len(all_rows)}")
    print("\nCommodities:", list(COMMODITY_PROFILES.keys()))
    print("\nTo seed the database:")
    print("  1. Start the backend server")
    print("  2. The database seeds automatically on startup from this CSV")


if __name__ == "__main__":
    main()
