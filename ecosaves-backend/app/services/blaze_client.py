import time
import requests

from app.core.config import settings
from app.services.blaze_signing import new_request_id, build_request_token, build_secure_hash


class BlazeApiError(Exception):
    pass


class BlazeClient:
    def __init__(self):
        self._tokens: dict[str, dict] = {}

    def _get_token(self, service_code: str) -> str:
        cached = self._tokens.get(service_code)
        if cached and time.time() < cached["expires_at"]:
            return cached["token"]

        request_id = new_request_id()
        request_type = "GET_API_TOKEN"
        request_token = build_request_token(request_id, request_type)
        secure_hash = build_secure_hash(request_id, request_type, request_token, extra_fields=[service_code])

        body = {
            "headerRequest": {
                "affiliateCode": settings.BLAZE_AFFILIATE_CODE,
                "clientId": settings.BLAZE_CLIENT_ID,
                "sourceCode": settings.BLAZE_SOURCE_CODE,
                "requestId": request_id,
                "ipAddress": settings.BLAZE_IP_ADDRESS,
                "requestType": request_type,
                "requestToken": request_token,
            },
            "publicKey": settings.BLAZE_PUBLIC_KEY,
            "serviceCode": service_code,
            "secureHash": secure_hash,
        }

        response = requests.post(
            f"{settings.BLAZE_BASE_URL}/auth/app/token",
            json=body,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )
        data = response.json()

        header = data.get("headerResponse", {})
        if header.get("responseCode") != "000":
            raise BlazeApiError(f"Token request failed: {header.get('responseDesc')}")

        token_data = data["data"]
        access_token = token_data["access_token"]
        expires_in = token_data.get("expires_in", 3000)

        self._tokens[service_code] = {
            "token": access_token,
            "expires_at": time.time() + expires_in - 30,
        }
        return access_token


blaze_client = BlazeClient()