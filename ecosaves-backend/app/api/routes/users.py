from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.auth import (
    RequestOtpRequest, RequestOtpResponse,
    VerifyOtpRequest, VerifyOtpResponse,
    CompleteSignupRequest, CompleteSignupResponse,
    ResendOtpRequest, ResendOtpResponse,
    LoginRequest, TokenResponse,
    ConnectBlazeRequest, CreateBlazeAccountRequest,
    DeleteAccountRequest, DeleteAccountResponse,
)
from app.db.supabase_client import get_supabase
from app.core.security import (
    hash_password, verify_password, create_access_token, get_current_user_id,
    create_email_verification_token, verify_email_verification_token,
)
from app.services.otp_service import create_and_send_otp, verify_otp, OtpRateLimitExceeded

router = APIRouter()


@router.post("/request-otp", response_model=RequestOtpResponse, status_code=status.HTTP_201_CREATED)
def request_otp(payload: RequestOtpRequest):
    supabase = get_supabase()

    existing = supabase.table("users").select("id").eq("email", payload.email).is_("deleted_at", "null").execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        create_and_send_otp(payload.email)
    except OtpRateLimitExceeded as e:
        raise HTTPException(status_code=429, detail=str(e))

    return RequestOtpResponse(message="OTP sent to your email")


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp_route(payload: VerifyOtpRequest):
    is_valid = verify_otp(payload.email, payload.otp_code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    token = create_email_verification_token(payload.email)
    return VerifyOtpResponse(message="Email verified", verified=True, verification_token=token)


@router.post("/resend-otp", response_model=ResendOtpResponse)
def resend_otp(payload: ResendOtpRequest):
    supabase = get_supabase()

    existing = supabase.table("users").select("id").eq("email", payload.email).is_("deleted_at", "null").execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        create_and_send_otp(payload.email)
    except OtpRateLimitExceeded as e:
        raise HTTPException(status_code=429, detail=str(e))

    return ResendOtpResponse(message="A new OTP has been sent to your email")


@router.post("/complete-signup", response_model=CompleteSignupResponse, status_code=status.HTTP_201_CREATED)
def complete_signup(payload: CompleteSignupRequest):
    if not verify_email_verification_token(payload.verification_token, payload.email):
        raise HTTPException(status_code=400, detail="Email verification expired or invalid, please verify again")

    supabase = get_supabase()

    existing = supabase.table("users").select("id").eq("email", payload.email).is_("deleted_at", "null").execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = hash_password(payload.password)

    result = supabase.table("users").insert({
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "email": payload.email,
        "password_hash": password_hash,
        "email_verified": True,
    }).execute()

    user_row = result.data[0]
    token = create_access_token(user_id=user_row["id"], email=user_row["email"])

    return CompleteSignupResponse(message="Account created", user_id=user_row["id"], access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    supabase = get_supabase()
    user = supabase.table("users").select("*").eq("email", payload.email).is_("deleted_at", "null").execute()

    if not user.data or not user.data[0]["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_row = user.data[0]
    if not verify_password(payload.password, user_row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user_id=user_row["id"], email=user_row["email"])
    return TokenResponse(access_token=token)


@router.post("/connect-blaze", status_code=status.HTTP_200_OK)
def connect_blaze(payload: ConnectBlazeRequest, user_id: str = Depends(get_current_user_id)):
    raise HTTPException(status_code=501, detail="Not implemented yet - pending Blaze API confirmation")


@router.post("/create-blaze-account", status_code=status.HTTP_201_CREATED)
def create_blaze_account(payload: CreateBlazeAccountRequest, user_id: str = Depends(get_current_user_id)):
    raise HTTPException(status_code=501, detail="Not implemented yet - pending Blaze API confirmation")


@router.get("/me")
def get_current_user(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    user = supabase.table("users").select(
        "id, first_name, last_name, email, email_verified, blaze_linked, created_at"
    ).eq("id", user_id).execute()

    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")

    return user.data[0]


@router.delete("/me", response_model=DeleteAccountResponse)
def delete_account(payload: DeleteAccountRequest, user_id: str = Depends(get_current_user_id)):
    if not payload.confirm:
        raise HTTPException(status_code=400, detail="Confirmation required to delete account")

    supabase = get_supabase()
    user = supabase.table("users").select("id, deleted_at").eq("id", user_id).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    if user.data[0]["deleted_at"] is not None:
        raise HTTPException(status_code=400, detail="Account already deleted")

    supabase.table("users").update({
        "deleted_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", user_id).execute()

    return DeleteAccountResponse(message="Account scheduled for deletion")