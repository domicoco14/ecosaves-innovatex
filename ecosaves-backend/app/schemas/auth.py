from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RequestOtpRequest(BaseModel):
    email: EmailStr


class RequestOtpResponse(BaseModel):
    message: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str


class VerifyOtpResponse(BaseModel):
    message: str
    verified: bool
    verification_token: str | None = None


class CompleteSignupRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: str
    last_name: str
    email: EmailStr
    pin: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
    verification_token: str


class CompleteSignupResponse(BaseModel):
    message: str
    user_id: str
    access_token: str


class ResendOtpRequest(BaseModel):
    email: EmailStr


class ResendOtpResponse(BaseModel):
    message: str


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    pin: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ConnectBlazeRequest(BaseModel):
    blaze_account_identifier: str


class CreateBlazeAccountRequest(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    email: EmailStr


class DeleteAccountRequest(BaseModel):
    confirm: bool


class DeleteAccountResponse(BaseModel):
    message: str