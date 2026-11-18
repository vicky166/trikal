# TRIKAL — Web architecture

The website is a separate project in `web/`. It does not import the Expo app and it does not replace it.

## Why this shape

The repository already has three surfaces:

| Path | Role | Touch policy |
| --- | --- | --- |
| `mobile/` | Expo SDK 58 native client | Do not retarget it into a website. |
| `/` Next.js starter | Early scaffold | Leave it. It is not the product site. |
| `web/` | Launch website and PWA | Own package, own build. |

Moving Expo to the repository root would break the app that already runs. A second Vite app avoids sharing React Native dependencies with the browser bundle.

Root `tsconfig.json` and ESLint ignore `web/` and `mobile/`, so the Next.js checker does not parse either project.

## Runtime

```
Browser
  Vite React app
  Supabase Auth session (when configured)
        |
        | anon key, user JWT
        v
Supabase Postgres with row-level security
Supabase Edge Functions
  ephemeris, OpenAI, usage limits
```

The browser never receives the service-role key or the OpenAI key. `VITE_` variables are public. Only the project URL and the anon key may use that prefix, and only after RLS is tested.

Edge Functions are enough for the first API. A separate NestJS service is not introduced. If a calculation workload no longer fits the free invocation quota, that is a paid decision and gets written down before anyone adds a server.

## Astrology and AI

Calculation and interpretation stay apart.

- Chart math runs in an Edge Function with a named engine and ayanamsa.
- OpenAI receives the chart JSON as data. It does not recompute positions.
- If the chart is missing, the only allowed reply asks for the missing birth fields.
- The website shows no degrees, nakshatra, dasha, or Guna score until that function returns them.

Swiss Ephemeris needs a commercial license for a proprietary product, or a written AGPL decision. That choice is still open. Until it is made, the Kundli page states that calculation is not connected.

## Pages in this build

| Route | State |
| --- | --- |
| `/` | Premium landing page, English and Hindi |
| `/login` | Validated form. It does not create an account. |
| `/kundli`, `/ask`, `/horoscope`, `/compatibility`, `/pricing` | Designed screens that refuse invented results |
| `/privacy`, `/terms` | Drafts labelled for legal review |

Onboarding, dashboard, reports, and live chat wait for Supabase.

## Local commands

From `web/`:

- `npm run dev`
- `npm test`
- `npm run build`

From the repository root, `npm run site` starts the website. `npm run mobile` still starts Expo.
