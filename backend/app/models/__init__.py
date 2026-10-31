"""
MandiSetu — All SQLAlchemy ORM Models
Covers all 12 modules in a single file for clarity; can be split later.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, JSON, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


def now_utc():
    return datetime.now(timezone.utc)


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 1 — User & Role Management
# ══════════════════════════════════════════════════════════════════════════════

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    FARMER = "farmer"
    BUYER = "buyer"
    FPO = "fpo"          # Farmer Producer Organisation


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(15), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.FARMER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Farmer/FPO profile fields
    state = Column(String(100))
    district = Column(String(100))
    village = Column(String(100))
    pincode = Column(String(10))
    land_area_acres = Column(Float, nullable=True)
    fpo_name = Column(String(200), nullable=True)   # if role == FPO

    # Buyer profile fields
    business_name = Column(String(200), nullable=True)
    gst_number = Column(String(20), nullable=True)
    buyer_reliability_score = Column(Float, default=0.0)  # Module 8

    # Authority & Powers (managed by Admin(TanmayA))
    powers = Column(JSON, default=list)   # list of power-id strings e.g. ["csv_export","decrypt_pii"]

    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    # Relationships
    lots = relationship("ProduceLot", back_populates="owner", foreign_keys="ProduceLot.owner_id")
    offers_made = relationship("Offer", back_populates="buyer", foreign_keys="Offer.buyer_id")
    disputes_filed = relationship("Dispute", back_populates="filer", foreign_keys="Dispute.filer_id")


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 4 — Produce Listing / Lot Creation
# ══════════════════════════════════════════════════════════════════════════════

class LotStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    MATCHED = "matched"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CLOSED = "closed"
    DISPUTED = "disputed"


class GradeLevel(str, enum.Enum):
    A_PLUS = "A+"
    A = "A"
    B = "B"
    C = "C"
    UNGRADED = "ungraded"


class ProduceLot(Base):
    __tablename__ = "produce_lots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Produce details
    commodity = Column(String(100), nullable=False, index=True)  # e.g. "Wheat", "Tomato"
    variety = Column(String(100))
    quantity_kg = Column(Float, nullable=False)
    min_price_per_kg = Column(Float, nullable=False)    # farmer's floor price
    expected_price_per_kg = Column(Float)

    # Location
    state = Column(String(100))
    district = Column(String(100))
    mandi_name = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)

    # Quality (Module 10)
    grade = Column(Enum(GradeLevel), default=GradeLevel.UNGRADED)
    quality_image_url = Column(String(500))
    quality_score = Column(Float)                        # 0-1 from CV model
    quality_notes = Column(Text)

    # Timing
    harvest_date = Column(DateTime(timezone=True))
    available_from = Column(DateTime(timezone=True))
    available_until = Column(DateTime(timezone=True))

    # FPO aggregation (Module 5)
    is_aggregated = Column(Boolean, default=False)
    fpo_lot_id = Column(UUID(as_uuid=True), ForeignKey("fpo_lots.id"), nullable=True)

    status = Column(Enum(LotStatus), default=LotStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    # Relationships
    owner = relationship("User", back_populates="lots", foreign_keys=[owner_id])
    offers = relationship("Offer", back_populates="lot")
    transactions = relationship("Transaction", back_populates="lot")
    fpo_lot = relationship("FPOLot", back_populates="individual_lots")


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 5 — FPO Aggregation
# ══════════════════════════════════════════════════════════════════════════════

class FPOLot(Base):
    __tablename__ = "fpo_lots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fpo_owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    commodity = Column(String(100), nullable=False)
    total_quantity_kg = Column(Float, default=0.0)
    avg_grade = Column(String(10))
    status = Column(Enum(LotStatus), default=LotStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    individual_lots = relationship("ProduceLot", back_populates="fpo_lot")
    fpo_owner = relationship("User", foreign_keys=[fpo_owner_id])


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 5 — Buyer–Farmer Matching / Offers
# ══════════════════════════════════════════════════════════════════════════════

class OfferStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    COUNTER = "counter"


class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lot_id = Column(UUID(as_uuid=True), ForeignKey("produce_lots.id"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    offered_price_per_kg = Column(Float, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    message = Column(Text)
    logistics_responsibility = Column(String(50))  # "buyer" | "seller" | "shared"
    status = Column(Enum(OfferStatus), default=OfferStatus.PENDING)
    match_score = Column(Float)   # Algorithmic match quality score (Module 5)

    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    lot = relationship("ProduceLot", back_populates="offers")
    buyer = relationship("User", back_populates="offers_made", foreign_keys=[buyer_id])
    transaction = relationship("Transaction", back_populates="offer", uselist=False)


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 6 — Transaction Tracking
# ══════════════════════════════════════════════════════════════════════════════

class TransactionStatus(str, enum.Enum):
    INITIATED = "initiated"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_RECEIVED = "payment_received"
    PICKUP_SCHEDULED = "pickup_scheduled"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lot_id = Column(UUID(as_uuid=True), ForeignKey("produce_lots.id"), nullable=False)
    offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    final_price_per_kg = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    quantity_kg = Column(Float, nullable=False)

    # Net realization breakdown (Module 3)
    transport_cost = Column(Float, default=0.0)
    commission_cost = Column(Float, default=0.0)
    storage_cost = Column(Float, default=0.0)
    net_realization = Column(Float)                 # total_amount - costs

    status = Column(Enum(TransactionStatus), default=TransactionStatus.INITIATED)
    status_history = Column(JSON, default=list)     # [{status, timestamp, note}]

    # Logistics (Module 8b)
    logistics_provider = Column(String(200))
    tracking_id = Column(String(100))
    distance_km = Column(Float)
    pickup_date = Column(DateTime(timezone=True))
    delivery_date = Column(DateTime(timezone=True))

    payment_reference = Column(String(200))
    payment_date = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    lot = relationship("ProduceLot", back_populates="transactions")
    offer = relationship("Offer", back_populates="transaction")
    dispute = relationship("Dispute", back_populates="transaction", uselist=False)


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 9 — Dispute Resolution
# ══════════════════════════════════════════════════════════════════════════════

class DisputeStatus(str, enum.Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    CLOSED = "closed"


class DisputeCategory(str, enum.Enum):
    QUALITY = "quality_mismatch"
    PAYMENT = "payment_delay"
    QUANTITY = "quantity_mismatch"
    LOGISTICS = "logistics_issue"
    PRICE = "price_dispute"
    OTHER = "other"


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    filer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    category = Column(Enum(DisputeCategory), nullable=False)
    description = Column(Text, nullable=False)
    evidence_urls = Column(JSON, default=list)       # list of image/doc URLs
    status = Column(Enum(DisputeStatus), default=DisputeStatus.OPEN)

    admin_notes = Column(Text)
    resolution = Column(Text)
    resolved_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    transaction = relationship("Transaction", back_populates="dispute")
    filer = relationship("User", back_populates="disputes_filed", foreign_keys=[filer_id])


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 14 — Feedback & Grievance Reporting (PostgreSQL Persistence)
# ══════════════════════════════════════════════════════════════════════════════

class FeedbackGrievance(Base):
    __tablename__ = "feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    user_name = Column(String(200), nullable=True)
    user_email = Column(String(255), nullable=True)
    user_role = Column(String(50), default="farmer")

    category = Column(String(100), default="General Feedback")  # Payment, Quality, Logistics, Platform Bug
    subject = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    status = Column(String(50), default="open")  # open, under_review, resolved, closed
    admin_response = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    user = relationship("User", foreign_keys=[user_id])


# ══════════════════════════════════════════════════════════════════════════════
# MODULE 2 — Price Cache (so we don't hammer external APIs every request)
# ══════════════════════════════════════════════════════════════════════════════

class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    commodity = Column(String(100), nullable=False, index=True)
    variety = Column(String(100))
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100))
    mandi_name = Column(String(200), nullable=False, index=True)
    arrival_date = Column(DateTime(timezone=True), nullable=False, index=True)
    min_price = Column(Float)
    max_price = Column(Float)
    modal_price = Column(Float, nullable=False)      # most important
    unit = Column(String(20), default="Quintal")
    source = Column(String(50), default="agmarknet")

    __table_args__ = (
        UniqueConstraint("commodity", "mandi_name", "arrival_date", name="uq_mandi_price"),
    )
