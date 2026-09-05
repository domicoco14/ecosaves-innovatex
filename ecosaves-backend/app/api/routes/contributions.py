from fastapi import APIRouter, HTTPException, status

from app.schemas.contribution import ContributionCreate, ContributionResponse

router = APIRouter()


@router.post("/", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
def create_contribution(payload: ContributionCreate):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/circle/{circle_id}", response_model=list[ContributionResponse])
def list_contributions_for_circle(circle_id: str):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/me", response_model=list[ContributionResponse])
def list_my_contributions():
    raise HTTPException(status_code=501, detail="Not implemented yet")