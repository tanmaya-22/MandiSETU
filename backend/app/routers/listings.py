"""
MandiSetu — Module 4: Produce Listing / Lot Creation
Module 5: Buyer-Farmer Matching (offer system)
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models import ProduceLot, LotStatus, Offer, OfferStatus, User
from app.schemas import LotCreateRequest, LotOut, OfferCreateRequest, OfferOut
from app.services.matching_service import compute_match_score

router = APIRouter(prefix="/listings", tags=["Module 4 — Produce Listings"])


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
    lot = ProduceLot(
        owner_id=auth["sub"],
        **payload.model_dump(exclude_none=True),
    )
    db.add(lot)
    await db.flush()
    await db.refresh(lot)
    return lot


@router.get("/lots", response_model=List[LotOut])
async def list_lots(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Public browse — active lots available for buying."""
    query = select(ProduceLot)
    if commodity:
        query = query.where(ProduceLot.commodity.ilike(f"%{commodity}%"))
    if state:
        query = query.where(ProduceLot.state.ilike(f"%{state}%"))
    if status_filter:
        query = query.where(ProduceLot.status == status_filter)
    else:
        query = query.where(ProduceLot.status == LotStatus.ACTIVE)
    query = query.order_by(desc(ProduceLot.created_at)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/lots/{lot_id}", response_model=LotOut)
async def get_lot(lot_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProduceLot).where(ProduceLot.id == lot_id))
    lot = result.scalar_one_or_none()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return lot


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
    return {"message": "Lot activated", "lot_id": str(lot_id)}


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
    await db.flush()
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
