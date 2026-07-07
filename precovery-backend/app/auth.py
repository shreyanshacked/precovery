from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import get_settings
from app.schemas import TokenData, DoctorRole

# ── Password hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Bearer token scheme ───────────────────────────────────────────────────────
bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> TokenData:
    settings = get_settings()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        doctor_id: str = payload.get("sub")
        role: str = payload.get("role", "doctor")
        if doctor_id is None:
            raise credentials_exception
        return TokenData(doctor_id=doctor_id, role=role)
    except JWTError:
        raise credentials_exception


# ── Dependency: get current doctor from JWT ───────────────────────────────────

async def get_current_doctor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenData:
    return decode_token(credentials.credentials)


async def require_doctor(
    token_data: TokenData = Depends(get_current_doctor),
) -> TokenData:
    """Any authenticated doctor can access."""
    return token_data


async def require_admin(
    token_data: TokenData = Depends(get_current_doctor),
) -> TokenData:
    """Only admin role can access."""
    if token_data.role != DoctorRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return token_data


# ── Patient ownership check ───────────────────────────────────────────────────

def assert_patient_access(doctor_id: str, patient_doctor_id: str):
    """Raise 403 if doctor does not own this patient."""
    if doctor_id != patient_doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this patient",
        )
