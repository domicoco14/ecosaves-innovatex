from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field


class SavingsPlanCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    target_amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    contribution_amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    frequency: Literal["weekly", "bi-weekly", "monthly"]
    start_date: date
    maturity_date: date


class SavingsEntryCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    idempotency_key: str = Field(min_length=8, max_length=100)
    note: str | None = Field(default=None, max_length=200)


class SavingsEntryResponse(BaseModel):
    id: str
    goal_id: str
    amount: Decimal
    status: str
    source: str
    note: str | None = None
    created_at: datetime


class SavingsEntryResult(BaseModel):
    entry: SavingsEntryResponse
    saved_amount: Decimal


class SavingsPlanResponse(BaseModel):
    id: str
    name: str
    target_amount: Decimal
    contribution_amount: Decimal
    frequency: str
    start_date: date
    maturity_date: date
    status: str
    saved_amount: Decimal
    entries: list[SavingsEntryResponse] = Field(default_factory=list)