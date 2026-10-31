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
    await db.commit()
    return {"message": "Dispute resolved"}


# ═══════════════════════════ MODULE 14 — Feedback & Grievance Router ═════════

feedback_router = APIRouter(prefix="/feedback", tags=["Module 14 — Feedback & Grievances"])


@feedback_router.post("")
@feedback_router.post("/")
async def create_feedback(
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    """Submit user feedback or grievance. Saved persistently to PostgreSQL."""
    from app.models import FeedbackGrievance
    from app.core.database import create_all_tables

    try:
        fb = FeedbackGrievance(
            user_name=payload.get("user_name") or payload.get("name") or "Anonymous Farmer",
            user_email=payload.get("user_email") or payload.get("email"),
            user_role=payload.get("user_role") or payload.get("role") or "farmer",
            category=payload.get("category") or "General Feedback",
            subject=payload.get("subject") or "User Submitted Feedback",
            message=payload.get("message") or payload.get("feedback") or "",
            rating=int(payload.get("rating") or 5),
            status="open",
        )
        db.add(fb)
        await db.commit()
        await db.refresh(fb)
        return {
            "status": "success",
            "message": "Feedback securely submitted and synchronized with PostgreSQL database.",
            "feedback_id": str(fb.id),
        }
    except Exception as e:
        await db.rollback()
        # Self-heal table creation if missing
        await create_all_tables()
        fb = FeedbackGrievance(
            user_name=payload.get("user_name") or "Anonymous Farmer",
            user_email=payload.get("user_email"),
            user_role=payload.get("user_role") or "farmer",
            category=payload.get("category") or "General Feedback",
            subject=payload.get("subject") or "User Feedback",
            message=payload.get("message") or "",
            rating=int(payload.get("rating") or 5),
            status="open",
        )
        db.add(fb)
        await db.commit()
        await db.refresh(fb)
        return {
            "status": "success",
            "message": "Feedback saved to PostgreSQL.",
            "feedback_id": str(fb.id),
        }


@feedback_router.get("")
@feedback_router.get("/")
async def list_feedback(
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all feedback and grievances for Admin oversight from PostgreSQL."""
    from app.models import FeedbackGrievance
    from app.core.database import create_all_tables

    try:
        result = await db.execute(select(FeedbackGrievance).order_by(FeedbackGrievance.created_at.desc()))
        feedbacks = result.scalars().all()
    except Exception:
        await create_all_tables()
        result = await db.execute(select(FeedbackGrievance).order_by(FeedbackGrievance.created_at.desc()))
        feedbacks = result.scalars().all()

    return [
        {
            "id": str(f.id),
            "user_name": f.user_name,
            "user_email": f.user_email,
            "user_role": f.user_role,
            "category": f.category,
            "subject": f.subject,
            "message": f.message,
            "rating": f.rating,
            "status": f.status,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "source": "postgresql",
        }
        for f in feedbacks
    ]


@feedback_router.patch("/{feedback_id}/status")
async def update_feedback_status(
    feedback_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    """Update status of a feedback/grievance."""
    from app.models import FeedbackGrievance
    import uuid

    try:
        fid = uuid.UUID(feedback_id)
        result = await db.execute(select(FeedbackGrievance).where(FeedbackGrievance.id == fid))
        fb = result.scalar_one_or_none()
        if not fb:
            raise HTTPException(status_code=404, detail="Feedback not found")
        if "status" in payload:
            fb.status = payload["status"]
        if "admin_response" in payload:
            fb.admin_response = payload["admin_response"]
        await db.commit()
        return {"message": "Status updated successfully", "status": fb.status}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
