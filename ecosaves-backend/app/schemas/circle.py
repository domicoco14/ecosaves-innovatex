from datetime import date
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, Field


class CircleCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    contribution_amount: float = Field(gt=0)
    frequency: Literal["weekly", "bi-weekly", "monthly"]
    member_limit: int = Field(ge=3, le=30)
    start_date: date


class CircleMemberResponse(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    payout_position: int
    payout_date: date


class CircleResponse(BaseModel):
    id: str
    name: str
    contribution_amount: float
    frequency: str
    member_limit: int
    start_date: date
    status: str
    created_by: str
    members_count: int
    my_payout_position: int | None = None
    members: list[CircleMemberResponse] = Field(default_factory=list)


class CircleJoinRequest(BaseModel):
    circle_id: UUID