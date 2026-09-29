from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user_id
from app.db.supabase_client import get_supabase
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse

router = APIRouter()


def _require_membership(circle_id: str, user_id: str) -> None:
    membership = (
        get_supabase().table("circle_members")
        .select("id")
        .eq("circle_id", circle_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not membership.data:
        raise HTTPException(status_code=404, detail="Circle not found")


def _message_responses(rows: list[dict]) -> list[ChatMessageResponse]:
    if not rows:
        return []
    user_ids = list(dict.fromkeys(row["user_id"] for row in rows))
    profiles = (
        get_supabase().table("users")
        .select("id, first_name, last_name")
        .in_("id", user_ids)
        .execute()
    )
    profiles_by_id = {profile["id"]: profile for profile in profiles.data or []}
    return [
        ChatMessageResponse(
            id=row["id"],
            circle_id=row["circle_id"],
            user_id=row["user_id"],
            sender_name=" ".join(
                part for part in (
                    profiles_by_id.get(row["user_id"], {}).get("first_name", "Member"),
                    profiles_by_id.get(row["user_id"], {}).get("last_name", ""),
                ) if part
            ),
            content=row["content"],
            created_at=row["created_at"],
        )
        for row in rows
    ]


@router.get("/{circle_id}/messages", response_model=list[ChatMessageResponse])
def list_messages(
    circle_id: UUID,
    limit: int = Query(default=100, ge=1, le=200),
    before: datetime | None = None,
    user_id: str = Depends(get_current_user_id),
):
    circle_key = str(circle_id)
    _require_membership(circle_key, user_id)
    query = (
        get_supabase().table("circle_messages")
        .select("id, circle_id, user_id, content, created_at")
        .eq("circle_id", circle_key)
        .order("created_at", desc=True)
        .limit(limit)
    )
    if before:
        query = query.lt("created_at", before.astimezone(timezone.utc).isoformat())
    result = query.execute()
    return _message_responses(list(reversed(result.data or [])))


@router.post("/{circle_id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    circle_id: UUID,
    payload: ChatMessageCreate,
    user_id: str = Depends(get_current_user_id),
):
    circle_key = str(circle_id)
    _require_membership(circle_key, user_id)
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=422, detail="Message cannot be blank")

    now = datetime.now(timezone.utc).isoformat()
    result = get_supabase().table("circle_messages").insert({
        "id": str(uuid4()),
        "circle_id": circle_key,
        "user_id": user_id,
        "content": content,
        "created_at": now,
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Could not send message")
    return _message_responses(result.data)[0]