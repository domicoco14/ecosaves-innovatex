import hashlib
import uuid

from app.core.config import settings


def new_request_id() -> str:
    return f"REQ{uuid.uuid4().hex[:12].upper()}"


def sha512(value: str) -> str:
    return hashlib.sha512(value.encode("utf-8")).hexdigest()


def build_request_token(request_id: str, request_type: str) -> str:
    token_string = (
        settings.BLAZE_CLIENT_ID
        + settings.BLAZE_AFFILIATE_CODE
        + settings.BLAZE_SOURCE_CODE
        + request_id
        + request_type
        + settings.BLAZE_IP_ADDRESS
        + settings.BLAZE_SECRET_KEY
    )
    return sha512(token_string)


def build_secure_hash(request_id: str, request_type: str, request_token: str, extra_fields: list[str]) -> str:
    hash_string = (
        settings.BLAZE_CLIENT_ID
        + settings.BLAZE_AFFILIATE_CODE
        + settings.BLAZE_SOURCE_CODE
        + request_id
        + request_type
        + settings.BLAZE_IP_ADDRESS
        + request_token
        + "".join(extra_fields)
        + settings.BLAZE_SECRET_KEY
    )
    return sha512(hash_string)