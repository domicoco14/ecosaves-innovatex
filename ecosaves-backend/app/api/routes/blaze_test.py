from fastapi import APIRouter

from app.services.blaze_client import blaze_client, BlazeApiError

router = APIRouter()


@router.get("/test-token")
def test_token():
    try:
        token = blaze_client._get_token("ACCOUNT_SERVICE")
        return {"success": True, "token_preview": token[:20] + "..."}
    except BlazeApiError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": f"Unexpected error: {str(e)}"}