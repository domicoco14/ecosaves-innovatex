import calendar
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.db.supabase_client import get_supabase
from app.schemas.circle import CircleCreate, CircleJoinRequest, CircleMemberResponse, CircleResponse

router = APIRouter()


def _payout_date(start_date: date, frequency: str, position: int) -> date:
    offset = position - 1
    if frequency == "weekly":
        return start_date + timedelta(weeks=offset)
    if frequency == "bi-weekly":
        return start_date + timedelta(weeks=2 * offset)

    month_index = start_date.year * 12 + start_date.month - 1 + offset
    year, zero_based_month = divmod(month_index, 12)
    month = zero_based_month + 1
    day = min(start_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def _circle_response(circle: dict, user_id: str) -> CircleResponse:
    supabase = get_supabase()
    member_result = (
        supabase.table("circle_members")
        .select("user_id, payout_position")
        .eq("circle_id", circle["id"])
        .order("payout_position")
        .execute()
    )
    member_rows = member_result.data or []
    member_ids = [member["user_id"] for member in member_rows]
    users_by_id = {}

    if member_ids:
        users_result = (
            supabase.table("users")
            .select("id, first_name, last_name")
            .in_("id", member_ids)
            .execute()
        )
        users_by_id = {user["id"]: user for user in users_result.data or []}

    members = []
    my_position = None
    start_date = date.fromisoformat(str(circle["start_date"])[:10])
    for member in member_rows:
        profile = users_by_id.get(member["user_id"], {})
        position = member["payout_position"]
        if member["user_id"] == user_id:
            my_position = position
        if position is None:
            continue
        members.append(CircleMemberResponse(
            user_id=member["user_id"],
            first_name=profile.get("first_name", "Member"),
            last_name=profile.get("last_name", ""),
            payout_position=position,
            payout_date=_payout_date(start_date, circle["frequency"], position),
        ))

    return CircleResponse(
        id=circle["id"],
        name=circle["name"],
        contribution_amount=circle["contribution_amount"],
        frequency=circle["frequency"],
        member_limit=circle["member_limit"],
        start_date=start_date,
        status=circle["status"],
        created_by=circle["created_by"],
        members_count=len(member_rows),
        my_payout_position=my_position,
        members=members,
    )


@router.post("/", response_model=CircleResponse, status_code=status.HTTP_201_CREATED)
def create_circle(payload: CircleCreate, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    result = supabase.rpc("create_circle_with_creator", {
        "p_name": payload.name.strip(),
        "p_contribution_amount": payload.contribution_amount,
        "p_frequency": payload.frequency,
        "p_member_limit": payload.member_limit,
        "p_start_date": payload.start_date.isoformat(),
        "p_created_by": user_id,
    }).execute()

    if not isinstance(result.data, dict):
        raise HTTPException(status_code=500, detail="Could not create circle")
    return _circle_response(result.data, user_id)


@router.get("/", response_model=list[CircleResponse])
def list_circles(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    memberships = (
        supabase.table("circle_members")
        .select("circle_id")
        .eq("user_id", user_id)
        .execute()
    )
    circle_ids = list(dict.fromkeys(row["circle_id"] for row in memberships.data or []))
    if not circle_ids:
        return []

    circles = supabase.table("circles").select("*").in_("id", circle_ids).execute()
    return [_circle_response(circle, user_id) for circle in circles.data or []]


@router.get("/{circle_id}", response_model=CircleResponse)
def get_circle(circle_id: str, user_id: str = Depends(get_current_user_id)):
    result = get_supabase().table("circles").select("*").eq("id", circle_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Circle not found")
    return _circle_response(result.data[0], user_id)


@router.post("/join", status_code=status.HTTP_200_OK)
def join_circle(payload: CircleJoinRequest, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    circle_id = str(payload.circle_id)
    try:
        result = supabase.rpc("join_circle_atomic", {
            "p_circle_id": circle_id,
            "p_user_id": user_id,
        }).execute()
    except Exception as exc:
        error_text = str(exc)
        if "circle_not_found" in error_text:
            raise HTTPException(status_code=404, detail="Circle not found") from exc
        if "already_joined" in error_text:
            raise HTTPException(status_code=409, detail="You already joined this circle") from exc
        if "circle_full" in error_text:
            raise HTTPException(status_code=409, detail="This circle is full") from exc
        raise HTTPException(status_code=500, detail="Could not join circle") from exc

    if not isinstance(result.data, dict):
        raise HTTPException(status_code=500, detail="Could not join circle")
    return _circle_response(result.data, user_id)