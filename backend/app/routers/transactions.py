"""
MandiSetu — Module 6: Transaction Tracking
Module 8b: Logistics Coordination
Module 9: Dispute Resolution
"""
import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user_payload
from app.models import Transaction, TransactionStatus, Dispute, DisputeStatus, DisputeCategory
from app.schemas import (
    TransactionOut, TransactionStatusUpdate,
    DisputeCreateRequest, DisputeOut,
    LogisticsEstimateRequest, LogisticsEstimateOut,
)
from app.services.logistics_service import estimate_logistics

# ═══════════════════════════ MODULE 6 — Transactions ═════════════════════════

transactions_router = APIRouter(prefix="/transactions", tags=["Module 6 — Transaction Tracking"])

VALID_TRANSITIONS = {
    TransactionStatus.INITIATED: [TransactionStatus.PAYMENT_PENDING, TransactionStatus.CANCELLED],
    TransactionStatus.PAYMENT_PENDING: [TransactionStatus.PAYMENT_RECEIVED, TransactionStatus.CANCELLED],
    TransactionStatus.PAYMENT_RECEIVED: [TransactionStatus.PICKUP_SCHEDULED],
    TransactionStatus.PICKUP_SCHEDULED: [TransactionStatus.IN_TRANSIT],
    TransactionStatus.IN_TRANSIT: [TransactionStatus.DELIVERED],
    TransactionStatus.DELIVERED: [TransactionStatus.COMPLETED, TransactionStatus.DISPUTED],
    TransactionStatus.COMPLETED: [],
    TransactionStatus.CANCELLED: [],
    TransactionStatus.DISPUTED: [TransactionStatus.COMPLETED, TransactionStatus.CANCELLED],
}


@transactions_router.get("", response_model=List[TransactionOut])
async def list_transactions(
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    if auth.get("role") == "admin":
        result = await db.execute(select(Transaction))
    else:
        from sqlalchemy import or_
        result = await db.execute(
            select(Transaction).where(
                or_(
                    Transaction.seller_id == auth["sub"],
                    Transaction.buyer_id == auth["sub"],
                )
            )
        )
    return result.scalars().all()


@transactions_router.get("/{txn_id}", response_model=TransactionOut)
async def get_transaction(txn_id: uuid.UUID, auth=Depends(get_current_user_payload), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Transaction).where(Transaction.id == txn_id))
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


@transactions_router.patch("/{txn_id}/status")
async def update_transaction_status(
    txn_id: uuid.UUID,
    payload: TransactionStatusUpdate,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """State-machine controlled status update with full audit trail."""
    result = await db.execute(select(Transaction).where(Transaction.id == txn_id))
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    try:
        new_status = TransactionStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {payload.status}")

    allowed = VALID_TRANSITIONS.get(txn.status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from {txn.status.value} to {new_status.value}",
        )

    txn.status = new_status
    history = list(txn.status_history or [])
    history.append({
        "status": new_status.value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": payload.note,
        "updated_by": auth["sub"],
    })
    txn.status_history = history
    return {"message": f"Status updated to {new_status.value}", "history_entry_count": len(history)}


@transactions_router.patch("/{txn_id}/logistics")
async def update_logistics(
    txn_id: uuid.UUID,
    logistics_provider: str,
    tracking_id: str,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Transaction).where(Transaction.id == txn_id))
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    txn.logistics_provider = logistics_provider
    txn.tracking_id = tracking_id
    return {"message": "Logistics info updated"}


# ═══════════════════════════ MODULE 8b — Logistics ═══════════════════════════

logistics_router = APIRouter(prefix="/logistics", tags=["Module 8b — Logistics Coordination"])


@logistics_router.post("/estimate", response_model=LogisticsEstimateOut)
async def get_logistics_estimate(
    req: LogisticsEstimateRequest,
    auth=Depends(get_current_user_payload),
):
    """Distance-based freight cost estimation."""
    return await estimate_logistics(req)


# ═══════════════════════════ MODULE 9 — Disputes ════════════════════════════

disputes_router = APIRouter(prefix="/disputes", tags=["Module 9 — Dispute Resolution"])


@disputes_router.post("", response_model=DisputeOut, status_code=status.HTTP_201_CREATED)
async def raise_dispute(
    payload: DisputeCreateRequest,
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    # Validate transaction
    txn_result = await db.execute(select(Transaction).where(Transaction.id == payload.transaction_id))
    txn = txn_result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if str(txn.seller_id) != auth["sub"] and str(txn.buyer_id) != auth["sub"]:
        raise HTTPException(status_code=403, detail="Not party to this transaction")

    try:
        cat = DisputeCategory(payload.category)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid category: {payload.category}")

    dispute = Dispute(
        transaction_id=payload.transaction_id,
        filer_id=auth["sub"],
        category=cat,
        description=payload.description,
        evidence_urls=payload.evidence_urls or [],
    )
    db.add(dispute)

    # Mark transaction as disputed
    txn.status = TransactionStatus.DISPUTED
    await db.flush()
    await db.refresh(dispute)
    return dispute


@disputes_router.get("", response_model=List[DisputeOut])
async def list_disputes(
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    if auth.get("role") == "admin":
        result = await db.execute(select(Dispute))
    else:
        result = await db.execute(select(Dispute).where(Dispute.filer_id == auth["sub"]))
    return result.scalars().all()


@disputes_router.patch("/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: uuid.UUID,
    resolution: str,
    admin_notes: str = "",
    auth=Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    if auth.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    result = await db.execute(select(Dispute).where(Dispute.id == dispute_id))
    dispute = result.scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    dispute.status = DisputeStatus.RESOLVED
    dispute.resolution = resolution
    dispute.admin_notes = admin_notes
    dispute.resolved_at = datetime.now(timezone.utc)
    return {"message": "Dispute resolved"}
