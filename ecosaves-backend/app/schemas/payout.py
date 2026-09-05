from datetime import datetime
from pydantic import BaseModel


class PayoutResponse(BaseModel):
    id: str
    circle_id: str
    recipient_user_id: str
    amount: float
    status: str
    scheduled_for: datetime
    released_at: datetime | None = None