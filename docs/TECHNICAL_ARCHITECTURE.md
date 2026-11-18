# TRIKAL — Technical architecture

## Website data flow

```text
BirthForm
  -> birthInputSchema (Zod)
  -> upsertProfile(localStorage)
  -> /kundli/:id

KundliPage / ReportPage / HoroscopePage / MatchPage
  -> loadProfiles(localStorage)
  -> chartFromProfile
       -> zonedLocalToUtc
       -> calculateChart (Astronomy Engine + mean Lahiri)
```

`chartFromProfile` returns null unless `chartReady` is `ready`. Ready means an exact clock time, a listed `cityId`, and coordinates that match that city. The form cannot submit invented coordinates: the schema rejects a latitude that does not equal the selected city.

`ProfilesProvider` in `web/src/state/Profiles.tsx` is the only shared birth-profile state. It is mounted in `web/src/App.tsx` around the router. It is not tied to the Supabase session.

## Auth flow that already exists

`web/src/services/authConfig.ts` reads `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Both must be non-empty or `getSupabase()` returns null.

`web/src/services/supabase.ts` creates one browser client with `persistSession: true`, `autoRefreshToken: true`, and `detectSessionInUrl: true`. That is the place to keep the client. Do not add a second `createClient`.

`web/src/services/useSession.ts` calls `getSession` and `onAuthStateChange`. It is used by `AuthPages.tsx` and `AccountPage.tsx` only. Other pages do not know whether someone is signed in. No route checks the session before rendering.

## Calculation boundary

Astronomy Engine 2.1.19 (MIT) supplies geocentric ecliptic longitudes. Mean Lahiri ayanamsa, mean lunar node, whole-sign houses, nakshatra, pada, navamsa, Vimshottari, and six Ashtakoota kootas are in `web/src/astrology/`. Swiss Ephemeris is not a dependency. The guide does not calculate positions.

`supabase/functions/guide/index.ts` is a Deno function that:

- returns 405 unless the method is POST
- returns 401 without a `Bearer` header
- returns 503 when `OPENAI_API_KEY` is absent
- returns 501 when the key is present, and does not call a model

The website never calls this function.

## What the planning docs still describe that the code does not do

`docs/API_SPECIFICATION.md` specifies JSON routes such as `/v1/me` and `/v1/birth-profiles`. No server implements those paths. The website does not call them. An older note in `docs/APP_ARCHITECTURE.md` mentioned NestJS; the website path is the Vite app plus the Supabase files in `supabase/`.

`docs/DATABASE_SCHEMA.md` matches the migration closely. The migration is the concrete SQL. It has not been applied.

## Hosting shape

The website build is static (`web/dist`). `web/public/_redirects` sends unknown paths to `index.html` for Cloudflare Pages. Authenticated data, if added, must stay on Supabase, not in the service-worker cache. The worker already ignores other origins and `Authorization` headers.
