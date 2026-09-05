from fastapi import APIRouter, HTTPException, status

from app.schemas.payout import PayoutResponse

router = APIRouter()


@router.get("/circle/{circle_id}", response_model=list[PayoutResponse])
def list_payouts_for_circle(circle_id: str):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/{payout_id}/release", response_model=PayoutResponse)
def release_payout(payout_id: str):
    raise HTTPException(status_code=501, detail="Not implemented yet")