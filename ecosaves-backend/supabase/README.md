# Supabase migrations

Apply these SQL files in order in the Supabase SQL Editor before deploying the backend:

1. `migrations/20260928_circle_membership_rpc.sql`
2. `migrations/20260929_personal_savings.sql`
3. `migrations/20260930_production_followups.sql`
4. `migrations/20261001_circle_chat.sql`
5. `migrations/20261002_readable_circle_invites.sql`
6. `migrations/20261003_circle_schedule_and_user_integrity.sql`

The circle migrations add private invite codes, activation-time scheduling, uniqueness constraints, transactional membership, and readable invite URL slugs. The personal-savings migration adds plans and self-reported entry storage. The chat migration adds member-only persisted messages. The final migration refreshes the RPC definitions so slug invitations, membership limits, and savings-entry validation are consistently enforced. Database functions are executable only by `service_role`; FastAPI calls them using `SUPABASE_SERVICE_KEY`.

Before applying the circle migration to a database with existing circle memberships, check for duplicate `(circle_id, user_id)` rows. The migration reassigns existing payout positions in join-time order and sets circles with a full membership roster to `active`.

After all migrations succeed, deploy/restart the FastAPI backend, then set the mobile build's `EXPO_PUBLIC_API_URL` to that backend's `/api/v1` URL. The app falls back to the hosted EcoSaves API only when that variable is not set.

The new readable invitation migration (number 5 above) must be applied after the earlier migrations. It adds the readable, unique URL slug and updates the create/join RPCs. The link is `https://ecosaves.app/join/<invite-slug>`. Android/iOS open it directly in an installed app only after `ecosaves.app` serves the matching Android Digital Asset Links and Apple App Site Association files for the production app identifiers. Expo scheme URLs (`ecosaves://join/<invite-slug>`) also route to the app. Until domain association and a hosted join page are deployed, recipients can open the app and paste the link or slug into Groups → Join.

Personal savings entries are explicitly user-reported tracking records. They are not verified deposits, held funds, withdrawals, or Blaze transactions. Do not market the maturity date as a legally or technically enforced lock until a custody/payment integration provides that capability.
