"""
MandiSetu — Pydantic Schemas (all modules)
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

# ─── Auth / Users ────────────────────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: str = "farmer"   # farmer | buyer | fpo | admin
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    land_area_acres: Optional[float] = None
    fpo_name: Optional[str] = None
    business_name: Optional[str] = None
    gst_number: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Username or Email address")
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str


class UserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: Optional[str]
    role: str
    state: Optional[str]
    district: Optional[str]
    is_verified: bool
    buyer_reliability_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Module 2 — Price Discovery ──────────────────────────────────────────────

class MandiPriceOut(BaseModel):
    commodity: str
    variety: Optional[str]
    state: str
    district: Optional[str]
    mandi_name: str
    arrival_date: datetime
    min_price: Optional[float]
    max_price: Optional[float]
    modal_price: float
    unit: str
    source: str

    class Config:
        from_attributes = True


class PriceTrendOut(BaseModel):
    dates: List[str]
    modal_prices: List[float]
    forecast_dates: List[str]
    forecast_prices: List[float]
    commodity: str
    mandi_name: str
    trend: str          # "rising" | "falling" | "stable"
    confidence: float   # 0-1


# ─── Module 3 — Net-Realization Calculator ───────────────────────────────────

class NetRealizationRequest(BaseModel):
    commodity: str
    quantity_kg: float
    listed_price_per_kg: float
    origin_lat: float
    origin_lng: float
    markets: List[Dict[str, Any]]   # [{name, lat, lng, modal_price, commission_pct}]
    storage_days: Optional[int] = 0
    storage_cost_per_kg_per_day: Optional[float] = 0.5


class MarketRealizationResult(BaseModel):
    market_name: str
    distance_km: float
    listed_price_per_kg: float
    transport_cost_per_kg: float
    commission_per_kg: float
    storage_cost_per_kg: float
    net_realization_per_kg: float
    total_net_realization: float
    rank: int


class NetRealizationResponse(BaseModel):
    commodity: str
    quantity_kg: float
    results: List[MarketRealizationResult]
    recommended_market: str
    recommended_market_reason: str


# ─── Module 4 — Produce Listings ─────────────────────────────────────────────

class LotCreateRequest(BaseModel):
    commodity: str
    variety: Optional[str] = None
    quantity_kg: float = Field(..., gt=0)
    min_price_per_kg: float = Field(..., gt=0)
    expected_price_per_kg: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    mandi_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    harvest_date: Optional[datetime] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None


class LotOut(BaseModel):
    id: uuid.UUID
    commodity: str
    variety: Optional[str]
    quantity_kg: float
    min_price_per_kg: float
    grade: Optional[str]
    quality_score: Optional[float]
    status: str
    state: Optional[str]
    district: Optional[str]
    mandi_name: Optional[str]
    is_aggregated: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Module 5 — Matching & Offers ────────────────────────────────────────────

class OfferCreateRequest(BaseModel):
    lot_id: uuid.UUID
    offered_price_per_kg: float = Field(..., gt=0)
    quantity_kg: float = Field(..., gt=0)
    message: Optional[str] = None
    logistics_responsibility: str = "buyer"


class OfferOut(BaseModel):
    id: uuid.UUID
    lot_id: uuid.UUID
    buyer_id: uuid.UUID
    offered_price_per_kg: float
    quantity_kg: float
    message: Optional[str]
    logistics_responsibility: str
    status: str
    match_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class MatchResultOut(BaseModel):
    lot_id: uuid.UUID
    commodity: str
    quantity_kg: float
    location: str
    listed_price: float
    match_score: float
    buyer_reliability: float
    distance_km: float
    estimated_net_realization: float


# ─── Module 6 — Transaction Tracking ─────────────────────────────────────────

class TransactionOut(BaseModel):
    id: uuid.UUID
    lot_id: uuid.UUID
    offer_id: uuid.UUID
    final_price_per_kg: float
    total_amount: float
    quantity_kg: float
    transport_cost: float
    commission_cost: float
    storage_cost: float
    net_realization: Optional[float]
    status: str
    status_history: List[Dict[str, Any]]
    logistics_provider: Optional[str]
    tracking_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


# ─── Module 7 — Sale-Window Recommendation ───────────────────────────────────

class SaleWindowRequest(BaseModel):
    commodity: str
    mandi_name: str
    quantity_kg: float
    harvest_date: datetime
    perishability_days: int = Field(..., ge=1)   # shelf life


class SaleWindowOut(BaseModel):
    commodity: str
    mandi_name: str
    recommended_sell_date: str
    recommended_sell_date_reason: str
    expected_price_on_date: float
    spoilage_risk_by_date: str   # "low" | "medium" | "high"
    price_trend: str             # "rising" | "falling" | "stable"
    forecast_chart: Dict[str, List]   # {dates, prices, spoilage_scores}
    confidence_score: float


# ─── Module 8 — Buyer Verification & Reliability ─────────────────────────────

class BuyerScoreOut(BaseModel):
    buyer_id: uuid.UUID
    full_name: str
    business_name: Optional[str]
    reliability_score: float     # 0-100
    total_transactions: int
    completed_on_time: int
    disputes_filed_against: int
    avg_payment_days: float
    verified: bool
    badge: str   # "Gold" | "Silver" | "Bronze" | "Unrated"


# ─── Module 8b — Logistics ────────────────────────────────────────────────────

class LogisticsEstimateRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    commodity: str
    quantity_kg: float


class LogisticsEstimateOut(BaseModel):
    distance_km: float
    estimated_hours: float
    freight_cost_per_kg: float
    total_freight_cost: float
    recommended_vehicle: str


# ─── Module 9 — Disputes ─────────────────────────────────────────────────────

class DisputeCreateRequest(BaseModel):
    transaction_id: uuid.UUID
    category: str
    description: str = Field(..., min_length=20)
    evidence_urls: Optional[List[str]] = []


class DisputeOut(BaseModel):
    id: uuid.UUID
    transaction_id: uuid.UUID
    category: str
    description: str
    status: str
    admin_notes: Optional[str]
    resolution: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Module 11 — Weather Risk Advisory ───────────────────────────────────────

class WeatherRiskOut(BaseModel):
    location: str
    commodity: str
    current_weather: Dict[str, Any]
    risk_level: str    # "low" | "medium" | "high" | "critical"
    risk_factors: List[str]
    advisory: str
    forecast_7day: List[Dict[str, Any]]


# ─── Module 12 — Analytics ───────────────────────────────────────────────────

class DashboardStatsOut(BaseModel):
    total_farmers: int
    total_buyers: int
    total_lots: int
    active_lots: int
    total_transactions: int
    total_trade_value: float
    open_disputes: int
    avg_net_realization: float
    top_commodities: List[Dict[str, Any]]
    price_trends_summary: List[Dict[str, Any]]
