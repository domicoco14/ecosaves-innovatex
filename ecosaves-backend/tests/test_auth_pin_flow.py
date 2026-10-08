import unittest

from pydantic import ValidationError

from app.schemas.auth import CompleteSignupRequest, LoginRequest


class AuthPinFlowTests(unittest.TestCase):
    def test_signup_accepts_a_six_digit_pin_and_rejects_password(self):
        payload = CompleteSignupRequest(
            first_name="Ada",
            last_name="Lovelace",
            email="ada@example.com",
            pin="123456",
            verification_token="verification-token",
        )

        self.assertEqual(payload.pin, "123456")
        with self.assertRaises(ValidationError):
            CompleteSignupRequest(
                first_name="Ada",
                last_name="Lovelace",
                email="ada@example.com",
                password="123456",
                verification_token="verification-token",
            )

    def test_login_accepts_a_six_digit_pin(self):
        payload = LoginRequest(email="ada@example.com", pin="123456")

        self.assertEqual(payload.pin, "123456")
        with self.assertRaises(ValidationError):
            LoginRequest(email="ada@example.com", password="123456")


if __name__ == "__main__":
    unittest.main()
