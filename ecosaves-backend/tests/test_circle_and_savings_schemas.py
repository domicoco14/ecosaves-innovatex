import unittest
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch

from pydantic import ValidationError

from app.api.routes.circles import _payout_date, _circle_response, create_circle
from app.schemas.circle import CircleCreate, CircleJoinRequest
from app.schemas.savings import SavingsEntryCreate, SavingsPlanCreate


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, table):
        self.table_name = table
        self.filters = {}
        self.values = None

    def select(self, *_args):
        _ = _args
        return self

    def eq(self, key, value):
        self.filters[key] = value
        return self

    def in_(self, key, values):
        self.filters[key] = values
        return self

    def order(self, *_args, **_kwargs):
        _ = (_args, _kwargs)
        return self

    def limit(self, *_args):
        _ = _args
        return self

    def insert(self, values):
        self.values = values
        return self

    def execute(self):
        if self.table_name == "circle_members":
            return FakeResponse([{"user_id": "user-1", "payout_position": 1}])
        if self.table_name == "users":
            return FakeResponse([{"id": "user-1", "first_name": "Amina", "last_name": "Test"}])
        return FakeResponse([])


class FakeRpc:
    def __init__(self, response):
        self.response = response

    def execute(self):
        return FakeResponse(self.response)


class FakeSupabase:
    def __init__(self):
        self.rpc_calls = []
        self.circle = {
            "id": "circle-1",
            "invite_code": "a" * 32,
            "name": "Test circle",
            "contribution_amount": "1250.50",
            "frequency": "monthly",
            "member_limit": 3,
            "start_date": (date.today() + timedelta(days=1)).isoformat(),
            "status": "forming",
            "created_by": "user-1",
            "created_at": "2026-01-01T00:00:00+00:00",
            "activated_at": None,
        }

    def rpc(self, name, params):
        self.rpc_calls.append((name, params))
        return FakeRpc(self.circle)

    def table(self, name):
        return FakeQuery(name)


class CircleAndSavingsSchemaTests(unittest.TestCase):
    def test_monthly_schedule_clamps_at_month_end(self):
        start = date(2026, 1, 31)
        self.assertEqual(_payout_date(start, "monthly", 2), date(2026, 2, 28))
        self.assertEqual(_payout_date(start, "monthly", 3), date(2026, 3, 31))

    def test_weekly_frequencies_are_calculated_from_position(self):
        start = date(2026, 10, 1)
        self.assertEqual(_payout_date(start, "weekly", 3), date(2026, 10, 15))
        self.assertEqual(_payout_date(start, "bi-weekly", 3), date(2026, 10, 29))

    def test_circle_amount_uses_decimal_and_creator_limit_bounds(self):
        payload = CircleCreate(
            name="  A circle  ",
            contribution_amount="1250.50",
            frequency="monthly",
            member_limit=3,
            start_date=date.today() + timedelta(days=1),
        )
        self.assertEqual(payload.name, "A circle")
        self.assertEqual(payload.contribution_amount, Decimal("1250.50"))

    def test_circle_rejects_past_date_and_space_only_name(self):
        base = {
            "name": "Valid name",
            "contribution_amount": "100",
            "frequency": "weekly",
            "member_limit": 3,
            "start_date": date.today() - timedelta(days=1),
        }
        with self.assertRaises(ValidationError):
            CircleCreate(**base)
        with self.assertRaises(ValidationError):
            CircleCreate(**{**base, "name": "   ", "start_date": date.today() + timedelta(days=1)})

    def test_join_accepts_invite_code_and_legacy_field_alias(self):
        code = "a" * 32
        self.assertEqual(CircleJoinRequest(invite_code=code).invite_code, code)
        self.assertEqual(CircleJoinRequest(circle_id=code).invite_code, code)

    def test_personal_savings_amounts_are_decimal_and_positive(self):
        plan = SavingsPlanCreate(
            name="School fees",
            target_amount="100000.00",
            contribution_amount="10000.00",
            frequency="monthly",
            start_date=date.today(),
            maturity_date=date.today() + timedelta(days=365),
        )
        self.assertEqual(plan.target_amount, Decimal("100000.00"))
        with self.assertRaises(ValidationError):
            SavingsEntryCreate(amount="0", idempotency_key="request-123456")

    def test_create_circle_passes_creator_to_atomic_rpc_and_counts_creator(self):
        fake = FakeSupabase()
        payload = CircleCreate(
            name="Test circle",
            contribution_amount="1250.50",
            frequency="monthly",
            member_limit=3,
            start_date=date.today() + timedelta(days=2),
        )
        with patch("app.api.routes.circles.get_supabase", return_value=fake):
            result = create_circle(payload, "user-1")

        self.assertEqual(fake.rpc_calls[0][0], "create_circle_with_creator")
        self.assertEqual(fake.rpc_calls[0][1]["p_created_by"], "user-1")
        self.assertEqual(result.members_count, 1)
        self.assertEqual(result.my_payout_position, 1)
        self.assertEqual(result.invite_code, "a" * 32)

    def test_inactive_circle_does_not_publish_a_schedule_start(self):
        fake = FakeSupabase()
        with patch("app.api.routes.circles.get_supabase", return_value=fake):
            result = _circle_response(fake.circle, "user-1")
        self.assertIsNone(result.schedule_start_date)


if __name__ == "__main__":
    unittest.main()
