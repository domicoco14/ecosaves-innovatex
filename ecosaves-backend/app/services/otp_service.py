import hashlib
import random
from datetime import datetime, timedelta, timezone

import resend

from app.core.config import settings
from app.db.supabase_client import get_supabase

resend.api_key = settings.RESEND_API_KEY


class OtpRateLimitExceeded(Exception):
    pass


def generate_otp() -> str:
    return f"{random.randint(0, 9999):04d}"


def hash_otp(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def check_rate_limit(email: str) -> None:
    supabase = get_supabase()
    one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()

    recent = (
        supabase.table("otp_codes")
        .select("id", count="exact")
        .eq("email", email)
        .gte("created_at", one_hour_ago)
        .execute()
    )

    if recent.count is not None and recent.count >= settings.OTP_MAX_REQUESTS_PER_HOUR:
        raise OtpRateLimitExceeded(
            f"Too many OTP requests for this email. Try again later."
        )


def create_and_send_otp(email: str) -> None:
    check_rate_limit(email)

    supabase = get_supabase()
    code = generate_otp()
    code_hash = hash_otp(code)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    # invalidate any previous unused OTPs for this email so only the newest one works
    supabase.table("otp_codes").update({"used": True}).eq("email", email).eq("used", False).execute()

    supabase.table("otp_codes").insert({
        "email": email,
        "code_hash": code_hash,
        "expires_at": expires_at.isoformat(),
        "attempts": 0,
    }).execute()

    resend.Emails.send({
        "from": settings.RESEND_FROM_EMAIL,
        "to": email,
        "subject": "Your EcoSaves verification code",
        "html": f"<p>Your verification code is <strong>{code}</strong>. "
                f"It expires in {settings.OTP_EXPIRE_MINUTES} minutes.</p>",
    })


def verify_otp(email: str, submitted_code: str) -> bool:
    supabase = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    result = (
        supabase.table("otp_codes")
        .select("*")
        .eq("email", email)
        .eq("used", False)
        .gte("expires_at", now)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        return False

    otp_row = result.data[0]

    if otp_row["attempts"] >= settings.OTP_MAX_ATTEMPTS:
        supabase.table("otp_codes").update({"used": True}).eq("id", otp_row["id"]).execute()
        return False

    if hash_otp(submitted_code) != otp_row["code_hash"]:
        supabase.table("otp_codes").update({"attempts": otp_row["attempts"] + 1}).eq("id", otp_row["id"]).execute()
        return False

    supabase.table("otp_codes").update({"used": True}).eq("id", otp_row["id"]).execute()
    return True