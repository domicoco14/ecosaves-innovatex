# EcoSaves — Project Context

You are building the frontend for EcoSaves, a React Native (Expo) mobile app
that digitizes ajo/esusu (rotating group savings) via Ecobank Blaze.

## Tech Stack
- Repository Structure: `/frontend` (React Native Expo app) and `/backend` (FastAPI + Supabase backend)
- Frontend: React Native + Expo (Expo Go for testing, located in `/frontend`)
- Navigation: React Navigation (manual stack/tab setup — not Expo Router)
- State: Zustand (auth store with persist middleware + AsyncStorage)
- Sensitive data (auth token): expo-secure-store, NEVER AsyncStorage
- Backend: FastAPI (Python), consumed via REST
- Database: Supabase (Postgres)

## Auth flow (confirmed)
Email/Password — NOT Phone+PIN. Flow: Onboarding → Signup → Verify Email → Create Password → Login

## Navigation structure
- RootNavigator: conditionally renders AuthStack or AppStack based on isAuthenticated
- AuthStack: Onboarding → Signup → Verify Email → Create Password → Login
- AppStack: root Stack.Navigator wrapping a Bottom Tab Navigator
  (Home, Groups, Wallet, Profile) + pushed screens (GroupDetail, CreateGroup flow [3-step wizard: Group Setup → Payout Schedule → Review], ContributionHistory)

## Rules
- Always check .agents/skills/ecosaves-ui-ux/SKILL.md before building any screen
- Never hardcode the Blaze account number or OTP in a way that logs it
- Match existing screens' visual style exactly — don't introduce new colors/fonts ad hoc
- Ask before installing new dependencies not already in package.json
