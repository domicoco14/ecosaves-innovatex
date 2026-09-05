# ecosaves-innovatex
Digitizing ajo/esusu group savings through Ecobank Blaze — built for InnovateX 2026 by Team 4Ge

## Backend Overview

The backend is a FastAPI service that handles user accounts, savings circles, contributions, and payouts. It talks to Supabase (Postgres) for storage and Resend for email delivery.

### Tech stack
- **Framework**: FastAPI
- **Database**: Supabase (Postgres), accessed via the `supabase-py` client using the service role key
- **Auth**: Custom JWT-based auth (not Supabase Auth), passwords hashed with bcrypt
- **Email**: Resend, used for OTP verification codes
- **Scheduled cleanup**: Supabase's `pg_cron` extension, runs daily jobs to sweep expired data

### Project structure

app/
main.py # App entrypoint, route registration, CORS
core/
config.py # Settings loaded from .env
security.py # Password hashing, JWT creation/verification
db/
supabase_client.py # Supabase client setup
schemas/ # Pydantic request/response models
services/
otp_service.py # OTP generation, hashing, verification, rate limiting
blaze_lock.py # Abstraction over locking funds in a user's Blaze account
api/routes/
users.py # Auth, onboarding, account deletion
circles.py, contributions.py, payouts.py


### Onboarding flow
1. `POST /api/v1/users/signup` — user submits first name, last name, email. A user record is created and a 4-digit OTP is emailed via Resend.
2. `POST /api/v1/users/verify-otp` — user submits the code. On success, `email_verified` is set to true.
3. `POST /api/v1/users/set-password` — user sets their password (only allowed after email verification). Stored as a bcrypt hash.
4. `POST /api/v1/users/login` — returns a JWT access token, used to authenticate all subsequent requests via the `Authorization: Bearer <token>` header.
5. `POST /api/v1/users/connect-blaze` or `POST /api/v1/users/create-blaze-account` — links or creates the user's Blaze account. **Currently stubbed**, pending confirmation of Ecobank's Blaze API capabilities for InnovateX participants.

### OTP security
OTP codes are never stored in plaintext, only their SHA-256 hash. Codes expire after 5 minutes, allow a maximum of 5 verification attempts before being invalidated, and are single-use. A rate limit caps how many OTPs a single email can request per hour, to prevent abuse. Expired OTP rows are automatically deleted daily (kept for 3 days after expiry first, to allow abuse pattern review).

### Account deletion
Deletion is a two-stage process rather than an immediate hard delete, to preserve an audit trail while still protecting user privacy:
1. `DELETE /api/v1/users/me` — soft-deletes the account (`deleted_at` timestamp set). The account can no longer log in, and the email becomes available again for a fresh signup.
2. After 30 days, a scheduled job anonymizes the row (name, email, password hash, and Blaze link are wiped/replaced), while keeping the row itself intact for any circles/contributions/payouts tied to it. The exact long-term retention period beyond that is still being confirmed against applicable financial data retention requirements.

### Fund locking (Blaze integration)
Whether EcoSaves can place a real hold/lien on funds inside a user's own Blaze account depends on what Ecobank's Blaze API exposes to InnovateX participants, this is still unconfirmed. To avoid blocking development, the locking logic is isolated behind an interface in `app/services/blaze_lock.py`. A mock implementation currently simulates success so the rest of the app (circles, contributions, payouts) can be built and demoed without waiting on it. Once the real endpoint is confirmed, only this file needs to change.

### Setup
See `ecosaves-backend/README.md` for local setup instructions (Windows/VS Code).

Adjust the last line's path if your backend folder ends up named differently, or if you want the setup steps duplicated here instead of linked.