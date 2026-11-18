# TRIKAL — Implementation roadmap

Status of this file is updated as phases land. "Done" means the code is in the repo and the check for that phase was run. It does not mean the feature is production-ready.

## Website

The Expo app is unchanged. The site is `web/`.

- [x] Separate Vite project, Tailwind theme, English and Hindi landing page
- [x] Navigation to Kundli, guide, horoscope, compatibility, pricing, and login without invented results
- [x] Manifest, icons, production service worker, offline page
- [x] Birth-detail unit tests and production build
- [x] In-browser Lahiri chart for a listed city and an exact time. Yoni, Vashya, horoscope text, AI, and payments stay withheld.
- [x] SQL migration and Auth client. Not applied: Docker and the Supabase CLI are absent.
- [ ] Lint on this machine: Windows Application Control blocks oxlint’s native binary. The TypeScript check inside the production build passed.
- [ ] Supabase project, RLS, and real sign-in
- [ ] Ephemeris, guide, horoscope publication, Guna Milan
- [ ] Billing
- [ ] Phone install check on the deployed HTTPS URL

## Audit summary

- Next.js starter at the repo root. Left in place.
- Expo SDK 58 blank app in `mobile/`, previously a WebView of that starter. Replaced with the TRIKAL Expo Router app.
- No backend, database, billing, or ephemeris yet.
- React 19.3 is shared by Next.js 16 and Expo SDK 58, so the mobile app stays on SDK 58.

## Phase 1 — Foundation

- [x] Audit the workspace
- [x] Product, architecture, design, schema, API, security, and this roadmap
- [x] TRIKAL branding in the mobile app
- [x] `app/` routes and `src/` modules
- [x] Retire the WebView entry without removing the Next.js app

## Phase 2 — First visual product

- [x] Theme tokens, type, and reusable components
- [x] Splash
- [x] Onboarding and language
- [x] Auth screens with validation and a labelled device preview
- [x] Birth profile form, edit, and multiple local profiles
- [x] Home dashboard
- [ ] Cloud authentication

## Phase 3 — Primary navigation surfaces

- [x] Five-tab navigation
- [x] Kundli screen that refuses to invent a chart
- [x] Horoscope catalog without unpublished predictions
- [x] Guide screen that does not fake an answer
- [x] Profile, draft legal pages, device data deletion
- [ ] Server-backed chat history

## Phase 4 — Calculation and AI

- [ ] NestJS service
- [ ] Supabase project, migrations, and RLS
- [ ] Ephemeris integration and golden-chart tests
- [ ] Chart, horoscope, and guide routes
- [ ] OpenAI interpreter behind the server interface
- [ ] Usage limits

## Phase 5 — Depth and revenue

- [ ] Compatibility calculation
- [ ] Reports and PDF
- [ ] Google Play Billing and server verification
- [ ] Restore and cancellation copy tied to live products

## Phase 6 — Release hardening

- [ ] The test list in the product brief
- [ ] Android production build
- [ ] Security review of RLS and the purchase verifier
- [ ] Replace the template store icon
- [ ] Legal review of privacy policy and terms

## Checks

| Phase | Check |
| --- | --- |
| 1–3 | `npm run typecheck` and `npm run test` in `mobile/`. Android bundle compiled. |
| 4 | API tests, chart golden files, quota tests |
| 5 | Billing verifier tests against fixtures, not a live charge |
| 6 | Full suite and a release build |

## Open decisions

1. Swiss Ephemeris commercial license versus another maintained ephemeris.
2. Final free-tier question count and prices, set in server config and Play Console together.
3. Whether email OTP or magic link is the first auth method. Supabase can do both. The UI collects email and password so either can be attached.
