from fastapi import APIRouter, HTTPException, status

from app.schemas.circle import CircleCreate, CircleResponse, CircleJoinRequest

router = APIRouter()


@router.post("/", response_model=CircleResponse, status_code=status.HTTP_201_CREATED)
def create_circle(payload: CircleCreate):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/", response_model=list[CircleResponse])
def list_circles():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{circle_id}", response_model=CircleResponse)
def get_circle(circle_id: str):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/join", status_code=status.HTTP_200_OK)
def join_circle(payload: CircleJoinRequest):
    raise HTTPException(status_code=501, detail="Not implemented yet")