from abc import ABC, abstractmethod
from dataclasses import dataclass
import uuid


@dataclass
class LockResult:
    success: bool
    lock_reference: str | None
    message: str


class BlazeLockService(ABC):
    @abstractmethod
    def lock_funds(self, blaze_account_id: str, amount: float) -> LockResult:
        raise NotImplementedError

    @abstractmethod
    def release_funds(self, lock_reference: str) -> LockResult:
        raise NotImplementedError


class MockBlazeLockService(BlazeLockService):
    def lock_funds(self, blaze_account_id: str, amount: float) -> LockResult:
        return LockResult(
            success=True,
            lock_reference=f"mock-lock-{uuid.uuid4().hex[:12]}",
            message="Funds locked (mocked - not a real Blaze call).",
        )

    def release_funds(self, lock_reference: str) -> LockResult:
        return LockResult(
            success=True,
            lock_reference=lock_reference,
            message="Funds released (mocked - not a real Blaze call).",
        )


class RealBlazeLockService(BlazeLockService):
    # TODO: implement once the real Blaze hold/lien or goal-savings endpoint is confirmed
    def lock_funds(self, blaze_account_id: str, amount: float) -> LockResult:
        raise NotImplementedError("Real Blaze lock endpoint not yet confirmed.")

    def release_funds(self, lock_reference: str) -> LockResult:
        raise NotImplementedError("Real Blaze lock endpoint not yet confirmed.")


def get_blaze_lock_service() -> BlazeLockService:
    return MockBlazeLockService()