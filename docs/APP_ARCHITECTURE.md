# TRIKAL — Application architecture

The launch surface is the website in `web/`. Read `docs/WEB_ARCHITECTURE.md` for that system. This file keeps the native-client notes. Where it names NestJS as the only API, the website decision replaces that with Supabase and Edge Functions.

## What exists today

| Area | State |
| --- | --- |
| `web/` | Independent Vite, React, and TypeScript site. Public landing page and honest pending screens. |
| `mobile/` | Expo SDK 58 TRIKAL app. Left intact. It is not the website. |
| Repository root | Next.js 16 starter. Left intact. It is not the TRIKAL site. |
| Backend | Not connected. Supabase and OpenAI credentials are not in the repo. |

Working configuration that stays:

- The Next.js app, its `src/app` routes, and root `npm run dev`.
- Expo SDK 58, the mobile TypeScript config, and `npm run mobile`.
- Root ESLint ignores `mobile/**` so the Next linter does not parse React Native.
- Root `tsconfig.json` excludes `mobile`.

The WebView shell is retired as the mobile entry. It showed the Next starter page. It is not the TRIKAL product. Next.js remains available as a later web client.

## Decision: one mobile app, one privileged API

```
Expo app (mobile/)
  screens, local draft state, Play Billing client
        |
        | HTTPS, user access token
        v
NestJS API
  validation, rate limits, ephemeris, AI, Play Billing verification
        |
        +--> PostgreSQL via Supabase (RLS for user-owned rows)
        +--> Swiss Ephemeris (server process)
        +--> OpenAI (server process only)
```

The phone never receives the service-role key, the ephemeris license file, or the OpenAI key.

### Why NestJS and Supabase together

Supabase Auth and Postgres with row-level security fit user-owned rows: profiles, chats, reports. NestJS fits the work that must be privileged and testable: chart calculation, prompt assembly, usage limits, and purchase verification. Putting OpenAI or the ephemeris in the Expo app is rejected.

### Why the chart is not calculated on the phone

A Kundli needs a maintained ephemeris, a named ayanamsa, and a house system. Shipping that inside the store binary makes updates and licensing harder, and it is easy to drift from the server. One server calculator is the source of truth. The phone renders the result.

### Astrology engine

Target engine: Swiss Ephemeris, sidereal mode, Lahiri ayanamsa, whole-sign houses as the default Vedic house framing. Placidus is not the default.

Swiss Ephemeris is AGPL or commercially licensed. A proprietary store app needs the commercial license, or a written decision to comply with AGPL. That license is an open business decision before production calculation ships. Until the engine is installed and checked against published charts, the app shows no degrees, no nakshatra, no dasha, and no compatibility score.

`astronomy-engine` (MIT) may be used as a cross-check for tropical planetary longitudes. It is not, by itself, a Vedic Kundli.

### AI

A single `AstrologyInterpreter` interface. The first implementation calls OpenAI. Prompts live in versioned files on the server. The chart JSON is attached as data, not re-derived by the model. Responses are parsed with Zod. If the chart is missing, the only allowed reply is a request for the missing birth fields.

Token counts and daily limits are stored per user. Limits are checked before the provider is called.

### Payments

`BillingService` in the app talks to Google Play Billing. `PurchaseVerifier` in NestJS validates the token with Google and writes the subscription. The app treats the server record as entitlement. A failed or missing verification leaves the user on Free.

No sandbox button may set `premium: true`.

### Mobile structure

```
mobile/
  app/                 Expo Router screens
  src/components/      Design-system components
  src/theme/           Colour, type, spacing
  src/i18n/            English, Hindi, Hinglish
  src/domain/          Validation and reference data with no UI
  src/state/           On-device state until the API exists
  assets/
```

Navigation:

- Stack: splash, onboarding, auth, birth profile, plans, legal, report detail.
- Tabs: Home, Kundli, Ask, Horoscope, Profile.

On-device state is a labelled preview store in AsyncStorage. It is not an account. When the API arrives, that store becomes a cache, not the source of truth.

### Configuration

Server: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `GOOGLE_PLAY_SERVICE_ACCOUNT`, ephemeris path.

App: `EXPO_PUBLIC_API_URL` only. Public values are still not secrets, but the API URL is acceptable. No `EXPO_PUBLIC_` key may hold a provider secret.

### Logging

Structured logs on the server. Birth date, birth time, coordinates, and message bodies are not logged. Log an id and an error code.

### What is intentionally unimplemented

Phases 4 and 5 own the API, database migrations, ephemeris, AI calls, and Play Billing. The current mobile build must keep those doors closed rather than imitate them.
