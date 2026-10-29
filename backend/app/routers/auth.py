"""
MandiSetu — Module 1: User & Role Management Router
Endpoints: register, login, profile, list-users (admin)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user_payload
from app.models import User, UserRole
from app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Module 1 — Auth & Users"])


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
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
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
    )


@router.get("/me", response_model=UserOut)
async def get_me(payload=Depends(get_current_user_payload), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users", response_model=List[UserOut])
async def list_users(payload=Depends(get_current_user_payload), db: AsyncSession = Depends(get_db)):
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    result = await db.execute(select(User))
    return result.scalars().all()


@router.patch("/users/{user_id}/verify")
async def verify_user(user_id: str, payload=Depends(get_current_user_payload), db: AsyncSession = Depends(get_db)):
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    return {"message": "User verified successfully"}
