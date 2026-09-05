from datetime import datetime
from pydantic import BaseModel


class ContributionCreate(BaseModel):
    circle_id: str
    amount: float


class ContributionResponse(BaseModel):
    id: str
    circle_id: str
    user_id: str
    amount: float
    status: str
    lock_reference: str | None = None
    created_at: datetime