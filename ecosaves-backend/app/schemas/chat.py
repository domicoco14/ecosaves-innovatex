from datetime import datetime
from pydantic import BaseModel, Field


class ChatMessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class ChatMessageResponse(BaseModel):
    id: str
    circle_id: str
    user_id: str
    sender_name: str
    content: str
    created_at: datetime