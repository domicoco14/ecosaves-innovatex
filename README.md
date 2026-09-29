# EcoSaves

EcoSaves is a savings-circle and personal-savings tracking app. The current app can work without Ecobank Blaze: users sign up, create or join a circle, view its member order and estimated schedule, and track personal savings entries they report themselves.

**No bank or wallet funds are held, transferred, debited, locked, or paid out by this version.** Savings-plan entries are user-reported and unverified. Circle schedules are estimates, not payment promises. Do not describe this build as providing custody, guaranteed payouts, interest, or automated banking.

## Components

- `frontend/`: Expo React Native app.
- `ecosaves-backend/`: FastAPI API with JWT authentication and Supabase Postgres persistence.
- `ecosaves-backend/supabase/migrations/`: SQL setup and upgrade migrations.

## Backend and database setup

1. Configure `ecosaves-backend/.env` from `.env.example` with the Supabase URL, service-role key, JWT secret, and email settings required for signup.
2. In the Supabase SQL Editor, apply the migrations in order as documented in [the Supabase setup guide](ecosaves-backend/supabase/README.md). The circle and personal-savings APIs depend on the tables, constraints, row-level-security policies, and RPC functions in those files.
3. Run the FastAPI service from `ecosaves-backend/` with `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
4. Set `frontend/.env`'s `EXPO_PUBLIC_API_URL` to the reachable backend `/api/v1` URL. A physical phone needs the computer's current LAN IP and the same network; a deployed app needs a public HTTPS backend URL.
5. Start the app from `frontend/` with `npm start`.

The backend uses a privileged Supabase service key. Keep it server-side; never add it to the Expo app. API routes must derive the user from the verified EcoSaves JWT and scope database reads/writes to that user.

## Current API capabilities

- Email OTP signup and login.
- Authenticated circle create/list/detail/join, with creators counted as members and joins assigned in order.
- Unique invitation codes; only circle members can read private circle details.
- Derived estimated payout dates after the circle fills.
- Authenticated personal savings goals and idempotent, self-reported savings entries.

Contributions, disbursements, payment verification, a cash wallet, and enforced maturity locks are not implemented. Blaze linking/account creation is intentionally not part of the current client flow until a verified integration is available.

## Before production launch

Apply and verify the Supabase migrations, configure a stable HTTPS API URL, rotate any credentials that have ever been committed or shared, test with separate user accounts, and review authentication, privacy, backup/recovery, legal, and operational requirements. The screens and bundle builds alone do not establish that the live Supabase deployment is ready.