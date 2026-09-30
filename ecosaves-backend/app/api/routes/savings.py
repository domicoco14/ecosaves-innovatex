from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.db.supabase_client import get_supabase
from app.schemas.savings import SavingsEntryCreate, SavingsEntryResult, SavingsPlanCreate, SavingsPlanResponse

router = APIRouter()


def _plan_response(plan: dict, entries: list[dict] | None = None) -> SavingsPlanResponse:
    plan_entries = entries or []
    response_status = plan["status"]
    if plan.get("status") == "active" and plan.get("maturity_date") and str(plan["maturity_date"])[:10] <= date.today().isoformat():
        response_status = "matured"
    return SavingsPlanResponse(
        id=plan["id"],
        name=plan["name"],
        target_amount=plan["target_amount"],
        contribution_amount=plan["contribution_amount"],
        frequency=plan["frequency"],
        start_date=plan["start_date"],
        maturity_date=plan["maturity_date"],
        status=response_status,
        saved_amount=plan["saved_amount"],
        entries=plan_entries,
    )


@router.post("/", response_model=SavingsPlanResponse, status_code=status.HTTP_201_CREATED)
def create_savings_plan(payload: SavingsPlanCreate, user_id: str = Depends(get_current_user_id)):
    if payload.maturity_date <= payload.start_date:
        raise HTTPException(status_code=422, detail="Maturity date must be after the start date")
    if payload.start_date < date.today():
        raise HTTPException(status_code=422, detail="Start date cannot be in the past")

    result = get_supabase().table("personal_savings_goals").insert({
        "user_id": user_id,
        "name": payload.name.strip(),
        "target_amount": str(payload.target_amount),
        "contribution_amount": str(payload.contribution_amount),
        "frequency": payload.frequency,
        "start_date": payload.start_date.isoformat(),
        "maturity_date": payload.maturity_date.isoformat(),
        "status": "active",
        "saved_amount": "0",
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create savings plan")
    return _plan_response(result.data[0])


@router.get("/", response_model=list[SavingsPlanResponse])
def list_savings_plans(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    result = (
        supabase.table("personal_savings_goals")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    plans = result.data or []
    if not plans:
        return []

    entries_result = (
        supabase.table("personal_savings_entries")
        .select("id, goal_id, amount, status, source, note, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    entries_by_goal: dict[str, list[dict]] = {}
    for entry in entries_result.data or []:
        entries_by_goal.setdefault(entry["goal_id"], []).append(entry)
    return [_plan_response(plan, entries_by_goal.get(plan["id"], [])) for plan in plans]


@router.post("/{goal_id}/entries", response_model=SavingsEntryResult, status_code=status.HTTP_201_CREATED)
def add_savings_entry(
    goal_id: str,
    payload: SavingsEntryCreate,
    user_id: str = Depends(get_current_user_id),
):
    if payload.amount <= 0:
        raise HTTPException(status_code=422, detail="Entry amount must be greater than zero")
    try:
        result = get_supabase().rpc("record_personal_savings_entry", {
            "p_goal_id": goal_id,
            "p_user_id": user_id,
            "p_amount": str(payload.amount),
            "p_idempotency_key": payload.idempotency_key,
            "p_note": payload.note,
        }).execute()
    except Exception as exc:
        error_text = str(exc)
        if "goal_not_found" in error_text:
            raise HTTPException(status_code=404, detail="Savings plan not found") from exc
        if "goal_matured" in error_text:
            raise HTTPException(status_code=409, detail="This savings plan has matured") from exc
        if "goal_not_started" in error_text:
            raise HTTPException(status_code=409, detail="This savings plan has not started yet") from exc
        if "duplicate_entry" in error_text:
            raise HTTPException(status_code=409, detail="This entry was already recorded") from exc
        if "goal_target_exceeded" in error_text:
            raise HTTPException(status_code=409, detail="This entry exceeds the remaining plan target") from exc
        if "record_personal_savings_entry" in error_text:
            raise HTTPException(
                status_code=503,
                detail="Savings storage is not ready. Apply the personal savings Supabase migration and redeploy the backend.",
            ) from exc
        raise HTTPException(status_code=500, detail="Could not record savings entry") from exc

    if not isinstance(result.data, dict):
        raise HTTPException(status_code=500, detail="Could not record savings entry")
    refreshed = (
        get_supabase().table("personal_savings_goals")
        .select("saved_amount")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if not refreshed.data:
        raise HTTPException(status_code=404, detail="Savings plan not found")
    return {"entry": result.data, "saved_amount": refreshed.data[0]["saved_amount"]}