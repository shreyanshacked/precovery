from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import LoginRequest, TokenResponse, DoctorResponse, SuccessResponse
from app.auth import verify_password, create_access_token, get_current_doctor, decode_token
from app.database import get_supabase

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """
    RBAC Login — returns a JWT with doctor_id and role embedded.
    The frontend stores this token and sends it as: Authorization: Bearer <token>
    """
    db = get_supabase()

    # Look up doctor by email
    res = db.table("doctors").select("*").eq("email", body.email.lower().strip()).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    doctor = res.data[0]

    # Verify password
    if not verify_password(body.password, doctor["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create JWT
    token = create_access_token(data={
        "sub": doctor["id"],
        "role": doctor["role"],
        "name": doctor["name"],
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        doctor=DoctorResponse(
            id=doctor["id"],
            name=doctor["name"],
            initials=doctor["initials"],
            specialty=doctor["specialty"],
            clinic=doctor["clinic"],
            role=doctor["role"],
            email=doctor["email"],
            avatar_url=doctor.get("avatar_url"),
        ),
    )


@router.get("/me", response_model=DoctorResponse)
async def get_me(token_data=Depends(get_current_doctor)):
    """Returns the currently authenticated doctor's profile."""
    db = get_supabase()
    res = db.table("doctors").select("*").eq("id", token_data.doctor_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Doctor not found")
    d = res.data[0]
    return DoctorResponse(
        id=d["id"],
        name=d["name"],
        initials=d["initials"],
        specialty=d["specialty"],
        clinic=d["clinic"],
        role=d["role"],
        email=d["email"],
        avatar_url=d.get("avatar_url"),
    )


@router.post("/logout", response_model=SuccessResponse)
async def logout(token_data=Depends(get_current_doctor)):
    """
    Logout endpoint. Since JWTs are stateless, true invalidation requires a
    server-side token blacklist (Redis). For now, the frontend simply deletes
    the token from localStorage.
    TODO: Implement token blacklist with Redis for production.
    """
    return SuccessResponse(message="Logged out successfully")
