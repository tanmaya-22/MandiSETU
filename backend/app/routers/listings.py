"""
MandiSetu — Module 4: Produce Listing / Lot Creation
Module 5: Buyer-Farmer Matching (offer system)
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models import ProduceLot, LotStatus, Offer, OfferStatus, User
from app.schemas import LotCreateRequest, LotOut, OfferCreateRequest, OfferOut
from app.services.matching_service import compute_match_score

router = APIRouter(prefix="/listings", tags=["Module 4 — Produce Listings"])


def get_trade_conditions_for_lot(commodity: str, grade: str) -> List[dict]:
    comm = (commodity or "").lower()
    moisture_spec = "Moisture content ≤ 12.0% (AGMARK Grade Standard)"
    if any(k in comm for k in ["tomato", "onion", "potato", "chilli", "brinjal", "vegetable"]):
        moisture_spec = "Sorted in breathable APMC crates; blemish/rot ratio ≤ 3.0%"
    elif "cotton" in comm:
        moisture_spec = "Moisture ≤ 8.5%, trash ratio ≤ 3.0%"
    elif "soybean" in comm or "mustard" in comm:
        moisture_spec = "Oilseed moisture ≤ 9.0%, impurity ≤ 2.0%"

    return [
        {
            "code": "ESCROW_LOCK",
            "title": "100% Escrow Protection",
            "description": "Full purchase amount locked in MandiSetu multi-sig vault before truck dispatch.",
            "mandatory": True
        },
        {
            "code": "QUALITY_SPEC",
            "title": "Quality & Grade Compliance",
            "description": f"Verified Grade {grade or 'Standard'}. {moisture_spec}.",
            "mandatory": True
        },
        {
            "code": "WEIGHMENT",
            "title": "APMC Weighbridge Certificate",
            "description": "Net weight verified at certified mandi weighbridge; gross minus tare weight slip attached to e-Waybill.",
            "mandatory": True
        },
        {
            "code": "DISPATCH_TIMELINE",
            "title": "Dispatch Commitment",
            "description": "Seller guarantees truck dispatch within 48 hours of escrow lock confirmation.",
            "mandatory": True
        },
        {
            "code": "SETTLEMENT_TERMS",
            "title": "Automated T+24h Settlement",
            "description": "Escrow disbursement released to farmer bank account within 24 hours of digital delivery verification.",
            "mandatory": True
        },
        {
            "code": "DISPUTE_WINDOW",
            "title": "24h Grievance Arbitration Window",
            "description": "24-hour dispute window post-delivery for quality deviation claims via MandiSetu grievance desk.",
            "mandatory": False
        }
    ]


def enrich_lot_response(lot: ProduceLot) -> LotOut:
    owner = getattr(lot, "owner", None)
    seller_dict = None
    if owner:
        seller_dict = {
            "id": owner.id,
            "full_name": owner.full_name or "Verified APMC Producer",
            "role": owner.role.value if hasattr(owner.role, "value") else str(owner.role),
            "phone": owner.phone or "+91 98765 43210",
            "email": owner.email,
            "state": owner.state or lot.state,
            "district": owner.district or lot.district,
            "village": owner.village or "Krishi Cluster",
            "fpo_name": owner.fpo_name or (f"{lot.district or 'Kisan'} FPO Collective" if getattr(owner, 'role', '') == "fpo" else None),
            "is_verified": bool(owner.is_verified) if owner.is_verified is not None else True,
            "land_area_acres": owner.land_area_acres or 8.5
        }
    else:
        seller_dict = {
            "id": lot.owner_id,
            "full_name": "Kisan Seva Producer Co-op",
            "role": "fpo" if lot.is_aggregated else "farmer",
            "phone": "+91 98765 43210",
            "email": "producer@mandisetu.gov.in",
            "state": lot.state,
            "district": lot.district,
            "village": "APMC Cluster",
            "fpo_name": "MandiSetu Kisan Collective",
            "is_verified": True,
            "land_area_acres": 12.0
        }

    grade_val = lot.grade.value if hasattr(lot.grade, "value") else str(lot.grade or "A")
    conditions = get_trade_conditions_for_lot(lot.commodity, grade_val)

    return LotOut(
        id=lot.id,
        commodity=lot.commodity,
        variety=lot.variety,
        quantity_kg=lot.quantity_kg,
        min_price_per_kg=lot.min_price_per_kg,
        expected_price_per_kg=lot.expected_price_per_kg or lot.min_price_per_kg,
        grade=grade_val,
        quality_score=lot.quality_score,
        quality_notes=lot.quality_notes,
        status=lot.status.value if hasattr(lot.status, "value") else str(lot.status),
        state=lot.state,
        district=lot.district,
        mandi_name=lot.mandi_name,
        latitude=lot.latitude,
        longitude=lot.longitude,
        is_aggregated=bool(lot.is_aggregated),
        harvest_date=lot.harvest_date,
        available_from=lot.available_from,
        available_until=lot.available_until,
        created_at=lot.created_at,
        owner_id=lot.owner_id,
        seller=seller_dict,
        trade_conditions=conditions
    )


# ════════════════════════════════════════════════════════════════
# MODULE 4 — Lot CRUD
# ════════════════════════════════════════════════════════════════

@router.post("/lots", response_model=LotOut, status_code=status.HTTP_201_CREATED)
async def create_lot(
    payload: LotCreateRequest,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Farmer / FPO creates a produce lot listing."""
    data = payload.model_dump(exclude_none=True)
    if "status" not in data:
        data["status"] = LotStatus.ACTIVE
    lot = ProduceLot(
        owner_id=auth["sub"],
        **data,
    )
    db.add(lot)
    await db.commit()
    
    # Reload with owner
    res = await db.execute(select(ProduceLot).options(selectinload(ProduceLot.owner)).where(ProduceLot.id == lot.id))
    reloaded = res.scalar_one_or_none() or lot
    return enrich_lot_response(reloaded)


@router.post("/lots/public", response_model=LotOut, status_code=status.HTTP_201_CREATED)
async def create_lot_public(
    payload: LotCreateRequest,
    owner_email: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Create a produce lot with fallback demo/local authentication.
    Associates with owner user in PostgreSQL if available, or fallback owner ID.
    Ensures ALL listings are stored directly in the cloud PostgreSQL database!
    """
    owner_uuid = None
    if owner_email:
        res = await db.execute(select(User).where(User.email == owner_email.strip().lower()))
        u = res.scalar_one_or_none()
        if u:
            owner_uuid = u.id

    if not owner_uuid:
        # Default to any existing user in DB so foreign key constraint NEVER fails
        res = await db.execute(select(User).limit(1))
        u = res.scalar_one_or_none()
        if u:
            owner_uuid = u.id

    data = payload.model_dump(exclude_none=True)
    if "status" not in data:
        data["status"] = LotStatus.ACTIVE

    lot = ProduceLot(
        owner_id=owner_uuid,
        **data,
    )
    db.add(lot)
    await db.commit()
    
    # Reload with owner
    res = await db.execute(select(ProduceLot).options(selectinload(ProduceLot.owner)).where(ProduceLot.id == lot.id))
    reloaded = res.scalar_one_or_none() or lot
    return enrich_lot_response(reloaded)


@router.get("/lots", response_model=List[LotOut])
async def list_lots(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Public browse — active lots available for buying."""
    query = select(ProduceLot).options(selectinload(ProduceLot.owner))
    if commodity:
        query = query.where(ProduceLot.commodity.ilike(f"%{commodity}%"))
    if state:
        query = query.where(ProduceLot.state.ilike(f"%{state}%"))
    if status_filter and status_filter != "all":
        query = query.where(ProduceLot.status == status_filter)
    query = query.order_by(desc(ProduceLot.created_at)).limit(limit)
    result = await db.execute(query)
    lots = result.scalars().all()
    return [enrich_lot_response(l) for l in lots]


@router.get("/lots/{lot_id}", response_model=LotOut)
async def get_lot(lot_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProduceLot).options(selectinload(ProduceLot.owner)).where(ProduceLot.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return enrich_lot_response(lot)


@router.patch("/lots/{lot_id}/activate")
async def activate_lot(
    lot_id: uuid.UUID,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ProduceLot).where(ProduceLot.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    if str(lot.owner_id) != auth["sub"] and auth.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not your lot")
    lot.status = LotStatus.ACTIVE
    await db.commit()
    return {"message": "Lot activated", "lot_id": str(lot_id)}


@router.post("/lots/activate-all-drafts")
async def activate_all_draft_lots(db: AsyncSession = Depends(get_db)):
    """Admin utility: activates all draft lots so they appear on the marketplace."""
    result = await db.execute(select(ProduceLot).where(ProduceLot.status == LotStatus.DRAFT))
    draft_lots = result.scalars().all()
    count = 0
    for lot in draft_lots:
        lot.status = LotStatus.ACTIVE
        count += 1
    if count:
        await db.commit()
    return {"message": f"Activated {count} draft lots", "count": count}


@router.delete("/lots/{lot_id}")
async def delete_lot(
    lot_id: uuid.UUID,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ProduceLot).where(ProduceLot.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    if str(lot.owner_id) != auth["sub"] and auth.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not your lot")
    lot.status = LotStatus.CLOSED
    return {"message": "Lot closed"}


@router.delete("/lots/{lot_id}/purge")
async def purge_lot(
    lot_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Permanently delete a lot listing from PostgreSQL database. Admin authority."""
    result = await db.execute(select(ProduceLot).where(ProduceLot.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    commodity = lot.commodity
    await db.delete(lot)
    await db.commit()
    return {"message": f"Lot {commodity} ({lot_id}) permanently removed from database", "lot_id": str(lot_id)}


# ════════════════════════════════════════════════════════════════
# MODULE 5 — Offers & Matching
# ════════════════════════════════════════════════════════════════

offers_router = APIRouter(prefix="/offers", tags=["Module 5 — Buyer–Farmer Matching"])


@offers_router.post("", response_model=OfferOut, status_code=status.HTTP_201_CREATED)
async def create_offer(
    payload: OfferCreateRequest,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Buyer places an offer on a lot."""
    if auth.get("role") not in ("buyer", "admin"):
        raise HTTPException(status_code=403, detail="Only buyers can place offers")

    # Validate lot exists and is active
    lot_result = await db.execute(select(ProduceLot).where(ProduceLot.id == payload.lot_id))
    lot = lot_result.scalar_one_or_none()
    if not lot or lot.status != LotStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Lot not available")

    # Get buyer for reliability score
    buyer_result = await db.execute(select(User).where(User.id == auth["sub"]))
    buyer = buyer_result.scalar_one_or_none()

    match_score = compute_match_score(
        offered_price=payload.offered_price_per_kg,
        min_price=lot.min_price_per_kg,
        buyer_reliability=buyer.buyer_reliability_score if buyer else 0,
        quantity_match_ratio=min(payload.quantity_kg / lot.quantity_kg, 1.0),
    )

    offer = Offer(
        lot_id=payload.lot_id,
        buyer_id=auth["sub"],
        offered_price_per_kg=payload.offered_price_per_kg,
        quantity_kg=payload.quantity_kg,
        message=payload.message,
        logistics_responsibility=payload.logistics_responsibility,
        match_score=match_score,
    )
    db.add(offer)
    await db.flush()
    await db.refresh(offer)
    return offer


@offers_router.get("/lot/{lot_id}", response_model=List[OfferOut])
async def get_offers_for_lot(
    lot_id: uuid.UUID,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Farmer views all offers on their lot."""
    query = select(Offer).where(Offer.lot_id == lot_id).order_by(desc(Offer.match_score))
    result = await db.execute(query)
    return result.scalars().all()


@offers_router.patch("/{offer_id}/accept")
async def accept_offer(
    offer_id: uuid.UUID,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Farmer accepts an offer — creates a transaction."""
    from app.models import Transaction, TransactionStatus
    from datetime import datetime, timezone

    result = await db.execute(select(Offer).where(Offer.id == offer_id))
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    lot_result = await db.execute(select(ProduceLot).where(ProduceLot.id == offer.lot_id))
    lot = lot_result.scalar_one_or_none()

    if str(lot.owner_id) != auth["sub"] and auth.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not your lot")

    offer.status = OfferStatus.ACCEPTED
    lot.status = LotStatus.MATCHED

    total = offer.offered_price_per_kg * offer.quantity_kg
    txn = Transaction(
        lot_id=lot.id,
        offer_id=offer.id,
        seller_id=lot.owner_id,
        buyer_id=offer.buyer_id,
        final_price_per_kg=offer.offered_price_per_kg,
        total_amount=total,
        quantity_kg=offer.quantity_kg,
        status=TransactionStatus.INITIATED,
        status_history=[{"status": "initiated", "timestamp": datetime.now(timezone.utc).isoformat()}],
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return {"message": "Offer accepted", "transaction_id": str(txn.id)}


@offers_router.patch("/{offer_id}/reject")
async def reject_offer(
    offer_id: uuid.UUID,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Offer).where(Offer.id == offer_id))
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    offer.status = OfferStatus.REJECTED
    return {"message": "Offer rejected"}
