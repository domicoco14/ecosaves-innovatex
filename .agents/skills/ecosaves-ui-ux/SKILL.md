---
name: ecosaves-ui-ux
description: Design system and UI/UX conventions for all EcoSaves screens. Use this whenever building, styling, or editing any screen, component, or layout in the app.
---

# EcoSaves Design System

## Colors
- Primary: #00597C (deep teal) — headers, primary buttons, balance cards
- Accent: #E98591 (coral) — CTAs, active states, "your turn" badges
- Dark text: #161C20
- Muted gray: #737980
- Backgrounds: #F6F9F9 (light) / #FFFFFF (cards)
- Success/green: #29875A with #E6F5EB background tint
- Card shadow: soft, offset y:2-8, low opacity (0.06-0.25), never harsh

## Typography
- Font: Inter (Bold/Extra Bold for headlines, Semi Bold for buttons/labels, Regular for body)
- Headlines: 22-24px bold
- Body: 13-14px regular, gray

## Components
- Buttons: full-width, 14-16px corner radius, 16px vertical padding, bold white text
- Cards: 16-22px corner radius, white bg, soft shadow, 16-20px padding
- Input fields: light gray bg, rounded 12px, teal border on focus
- Status badges: pill-shaped, colored bg tint + matching text color
- Avatars/member stacks: overlapping circles with white 2px stroke
- Progress bars: rounded track + rounded fill, color matches context (accent/green/gold)
- Bottom nav: 4 tabs (Home, Groups, Wallet, Profile), active tab gets filled pill background

## Rules
- Every screen needs a clear visual hierarchy: header → key content → CTA
- Use real Naira formatting: ₦45,000 (comma-separated, no decimals unless needed)
- Keep consistent 20px horizontal screen padding
- Never leave a screen without a primary action or clear next step
