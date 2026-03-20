from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.db.convex_client import convex
from app.models.schemas import AuthResponse, SignInRequest, UserCreate, UserOut

router = APIRouter(prefix="/api/users", tags=["users"])


def _to_user_out(user: dict) -> UserOut:
    sanitized = {
        "id": str(user.get("_id") or user.get("id")),
        "email": user.get("email"),
        "name": user.get("name"),
        "phone_number": user.get("phone_number"),
        "dob": user.get("dob"),
        "role": user.get("role"),
        "target_role": user.get("target_role"),
        "experience_years": user.get("experience_years", 0),
        "github_url": user.get("github_url"),
        "linkedin_url": user.get("linkedin_url"),
        "education_profile": user.get("education_profile"),
        "coding_profiles": user.get("coding_profiles"),
        "bio": user.get("bio"),
        "created_at": user.get("created_at") or datetime.now(timezone.utc).isoformat(),
    }
    return UserOut(**sanitized)


@router.post("", response_model=AuthResponse)
def create_user(payload: UserCreate) -> AuthResponse:
    now = datetime.now(timezone.utc).isoformat()
    try:
        user = convex.mutation(
            "users:createUser",
            {
                **payload.model_dump(),
                "created_at": now,
                "updated_at": now,
            },
        )
    except HTTPException:
        raise
    except Exception as exc:
        message = str(exc)
        if "Email already registered" in message:
            raise HTTPException(status_code=400, detail="Email already registered") from exc
        raise

    token = f"tok_{uuid4().hex[:20]}"
    convex.mutation("users:createSession", {"token": token, "user_id": user["_id"], "created_at": now})
    return AuthResponse(token=token, user=_to_user_out(user))


@router.post("/signin", response_model=AuthResponse)
def sign_in(payload: SignInRequest) -> AuthResponse:
    user: Optional[dict] = convex.query("users:findByEmail", {"email": payload.email})

    if not user or user.get("password") != payload.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    now = datetime.now(timezone.utc).isoformat()
    token = f"tok_{uuid4().hex[:20]}"
    convex.mutation("users:createSession", {"token": token, "user_id": user["_id"], "created_at": now})
    return AuthResponse(token=token, user=_to_user_out(user))


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str) -> UserOut:
    user = convex.query("users:getById", {"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _to_user_out(user)


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: str, payload: UserCreate) -> UserOut:
    existing = convex.query("users:getById", {"user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    updated_payload = {
        **payload.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    updated = convex.mutation("users:updateUser", {"user_id": user_id, "user": updated_payload})
    return _to_user_out(updated)
