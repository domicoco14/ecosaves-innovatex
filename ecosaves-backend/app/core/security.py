from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.db.supabase_client import get_supabase

bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def hash_pin(pin: str) -> str:
    return hash_password(pin)


def verify_pin(pin: str, pin_hash: str) -> bool:
    return verify_password(pin, pin_hash)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    current_user = (
        get_supabase().table("users")
        .select("id, deleted_at")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    if not current_user.data or current_user.data[0].get("deleted_at") is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is unavailable")
    return user_id

def create_email_verification_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {"email": email, "purpose": "email_verification", "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_email_verification_token(token: str, expected_email: str) -> bool:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return False
    return payload.get("purpose") == "email_verification" and payload.get("email") == expected_email