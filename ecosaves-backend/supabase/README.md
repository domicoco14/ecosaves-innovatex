# Supabase migrations

Apply these SQL files in order in the Supabase SQL Editor before deploying the backend:

1. `migrations/20260928_circle_membership_rpc.sql`
2. `migrations/20260929_personal_savings.sql`
3. `migrations/20260930_production_followups.sql`

The circle migrations add private invite codes, activation-time scheduling, uniqueness constraints, and transactional circle creation/join functions. The personal-savings migration adds plans and self-reported entry storage. All database functions are executable only by `service_role`; FastAPI calls them using `SUPABASE_SERVICE_KEY`.

Before applying the circle migration to a database with existing circle memberships, check for duplicate `(circle_id, user_id)` rows. The migration reassigns existing payout positions in join-time order and sets circles with a full membership roster to `active`.

After both migrations succeed, deploy/restart the FastAPI backend, then set the mobile build's `EXPO_PUBLIC_API_URL` to that backend's `/api/v1` URL. The app falls back to the hosted EcoSaves API only when that variable is not set.

Personal savings entries are explicitly user-reported tracking records. They are not verified deposits, held funds, withdrawals, or Blaze transactions. Do not market the maturity date as a legally or technically enforced lock until a custody/payment integration provides that capability.
