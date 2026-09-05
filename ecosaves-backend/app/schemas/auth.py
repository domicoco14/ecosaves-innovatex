from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr


class SignupResponse(BaseModel):
    message: str
    user_id: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str


class VerifyOtpResponse(BaseModel):
    message: str
    verified: bool


class SetPasswordRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


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