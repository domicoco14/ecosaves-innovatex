from datetime import date
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field, field_validator
from pydantic import AliasChoices


class CircleCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    contribution_amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    frequency: Literal["weekly", "bi-weekly", "monthly"]
    member_limit: int = Field(ge=3, le=30)
    start_date: date

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Circle name must contain at least two non-space characters")
        return value

    @field_validator("start_date")
    @classmethod
    def require_current_or_future_start(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("Start date cannot be in the past")
        return value


class CircleMemberResponse(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    payout_position: int
    payout_date: date | None = None


class CircleInvitePreview(BaseModel):
    name: str
    contribution_amount: Decimal
    frequency: str
    member_limit: int
    members_count: int
    start_date: date
    status: str


class CircleResponse(BaseModel):
    id: str
    invite_code: str
    invite_slug: str
    name: str
    contribution_amount: Decimal
    frequency: str
    member_limit: int
    start_date: date
    schedule_start_date: date | None = None
    status: str
    created_by: str
    members_count: int
    my_payout_position: int | None = None
    members: list[CircleMemberResponse] = Field(default_factory=list)


class CircleJoinRequest(BaseModel):
    invite_code: str = Field(
        min_length=8,
        max_length=120,
        validation_alias=AliasChoices("invite_code", "circle_id"),
    )