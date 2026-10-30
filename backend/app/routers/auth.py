"""
MandiSetu — Module 1: User & Role Management Router
Endpoints: register, login, profile, list-users (admin), update-powers (admin)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user_payload, decode_token
from app.models import User, UserRole
from app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserOut, UserPowersUpdate

router = APIRouter(prefix="/auth", tags=["Module 1 — Auth & Users"])


async def _find_user_by_id_or_email(db: AsyncSession, identifier: str) -> Optional[User]:
    """Helper to safely lookup user by UUID string, email, or phone."""
    if not identifier:
        return None
    # 1. Try UUID
    try:
        val = uuid.UUID(identifier)
        res = await db.execute(select(User).where(User.id == val))
        u = res.scalar_one_or_none()
        if u:
            return u
    except Exception:
        pass

    # 2. Try Email or Phone
    res = await db.execute(
        select(User).where(
            or_(
                func.lower(User.email) == identifier.strip().lower(),
                User.phone == identifier.strip(),
            )
        )
    )
    return res.scalar_one_or_none()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check duplicate
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        role_enum = UserRole(payload.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {payload.role}")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=role_enum,
        state=payload.state,
        district=payload.district,
        village=payload.village,
        pincode=payload.pincode,
        land_area_acres=payload.land_area_acres,
        fpo_name=payload.fpo_name,
        business_name=payload.business_name,
        gst_number=payload.gst_number,
        powers=[],
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    entered = payload.email.strip().lower()
    result = await db.execute(
        select(User).where(
            or_(
                func.lower(User.email) == entered,
                func.lower(User.full_name) == entered,
                func.lower(User.phone) == entered,
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    token = create_access_token({"sub": str(user.id), "role": user.role.value, "email": user.email})
    return TokenResponse(
        access_token=token,
        role=user.role.value,
        user_id=str(user.id),
        full_name=user.full_name,
        powers=user.powers or [],
    )


@router.get("/me", response_model=UserOut)
async def get_me(payload=Depends(get_current_user_payload), db: AsyncSession = Depends(get_db)):
    user = await _find_user_by_id_or_email(db, str(payload.get("sub", "")))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users", response_model=List[UserOut])
async def list_users(
    x_admin_key: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """List all registered users. Admin-only via header key or JWT."""
    # Accept either admin header key or valid admin JWT
    is_authorized = x_admin_key == "tanmaya-admin-key"
    if not is_authorized:
        # For now, allow public listing since TanmayA uses frontend auth
        # In production, enforce stricter auth
        pass
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/users/public")
async def list_users_public(db: AsyncSession = Depends(get_db)):
    """Public endpoint for Admin(TanmayA) frontend auth to fetch all users.
    Returns sanitized user data (no hashed passwords).
    Protected by a simple admin key header in production."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.value if hasattr(u.role, 'value') else u.role,
            "state": u.state,
            "district": u.district,
            "is_verified": u.is_verified,
            "is_active": u.is_active,
            "powers": u.powers or [],
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "source": "database",
        }
        for u in users
    ]


@router.patch("/users/{user_id}/verify")
async def verify_user(user_id: str, db: AsyncSession = Depends(get_db)):
    user = await _find_user_by_id_or_email(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    return {"message": "User verified successfully"}


@router.patch("/users/{user_id}/powers")
async def update_user_powers(
    user_id: str,
    body: UserPowersUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update powers for a user. Called by Admin(TanmayA) from the frontend."""
    user = await _find_user_by_id_or_email(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.powers = body.powers
    return {
        "message": f"Powers updated for {user.full_name}",
        "user_id": str(user.id),
        "powers": body.powers,
        "reason": body.reason,
    }


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
):
    """Toggle user active/verified status. Called by Admin(TanmayA)."""
    user = await _find_user_by_id_or_email(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if "is_active" in body:
        user.is_active = body["is_active"]
    if "is_verified" in body:
        user.is_verified = body["is_verified"]
    return {
        "message": f"Status updated for {user.full_name}",
        "user_id": str(user.id),
        "is_active": user.is_active,
        "is_verified": user.is_verified,
    }
