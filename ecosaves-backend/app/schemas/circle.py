from datetime import date
from pydantic import BaseModel


class CircleCreate(BaseModel):
    name: str
    contribution_amount: float
    frequency: str
    member_limit: int
    start_date: date


class CircleResponse(BaseModel):
    id: str
    name: str
    contribution_amount: float
    frequency: str
    member_limit: int
    start_date: date
    status: str
    created_by: str


class CircleJoinRequest(BaseModel):
    circle_id: str