# TRIKAL — Implementation status

Updated after the calculation, chart, and local-account work. A page existing is not treated as a finished feature.

## COMPLETE AND VERIFIED

| Feature | Where | How it was checked |
| --- | --- | --- |
| Separate website, Expo app, and Next starter | `/`, `mobile/`, `web/` | Expo `package.json` and `app.json` were not edited. Website tests and production build passed. |
| Birth validation | `web/src/domain/birth.ts` | Unit tests: future date, unknown time, coordinates that do not match a listed city. |
| Browser profile storage | `web/src/domain/profiles.ts` | Unit test saves, edits, deletes, and drops a tampered coordinate row. |
| Mean Lahiri ayanamsa | `web/src/astrology/ayanamsa.ts` | Within 0.01° of published mean values for 1900, 2000, and 2020. |
| Sidereal planets, nakshatra, pada, navamsa, Vimshottari, whole-sign houses | `web/src/astrology/` | Sun at 2000-01-01 00:00 UTC within 0.5° of 16° Sagittarius. Nakshatra and navamsa math tests. Ascendant moves forward with time. |
| Time zones, including British Summer Time | `web/src/astrology/time.ts` | Kolkata and London conversions. |
| Six Ashtakoota kootas, total withheld | `web/src/astrology/guna.ts` | Same-nakshatra nadi 0, adjacent signs bhakoot 0. Yoni and Vashya are not scored. |
| No service-role or OpenAI key in website source | `web/src` | Source scan test. |
| English and Hindi copy for the new screens | `web/src/i18n/copy.ts` | TypeScript requires every English key in Hindi. Language choice is stored in this browser. |
| Production build | `web/` | `npm test` (20 passing) and `npm run build`. |

## IMPLEMENTED BUT NEEDS VERIFICATION

| Feature | Where | Why it is not marked verified |
| --- | --- | --- |
| Kundli screens, North and South charts, dasha list | `web/src/pages/KundliPage.tsx`, `web/src/components/ChartView.tsx` | Calculation tests passed. The layout was not opened in a browser. |
| Birth form, device chart list, print report | `web/src/pages/BirthPage.tsx`, `ChartsPage.tsx`, `ReportPage.tsx` | Print uses the browser print dialog so Devanagari can render. No PDF library is bundled. |
| Horoscope Moon sign, compatibility screen, pricing buttons disabled | matching pages | Logic is covered by the calculation tests. The pages were not clicked through. |
| PWA manifest, service worker, offline page | `web/public/` | Cache name is `trikal-public-v2`. Same-origin public GET only. Install was not tried on a phone. |
| Auth screens when Supabase env is present | `web/src/pages/AuthPages.tsx` | The client calls Supabase Auth. No project was running, so sign-up, email, reset, and session restore were not exercised. |

## PARTIALLY IMPLEMENTED

| Feature | What exists | What is missing |
| --- | --- | --- |
| Authentication | Login, sign-up, forgot password, reset, and sign-out call Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. Otherwise the form stops and says no account was created. | A running Auth server. Email delivery. |
| Database | `supabase/migrations/20261118120000_init.sql` with RLS, the ownership policies, and `delete_own_account`. | It has not been applied. Docker and the Supabase CLI are not installed. |
| Birth place | 25 city centres. Unknown places are saved without coordinates. | Street-level search. Nominatim is not called. |
| Horoscope | Calculated Moon sign when a chart exists. Daily, weekly, and monthly text is explicitly unpublished. | Editorial or reviewed copy. Lucky numbers are not shown. |
| Compatibility | Varna, Tara, Gana, Graha Maitri, Bhakoot, Nadi. | Yoni and Vashya points, and therefore the total out of 36. |
| Reports | Printable report with the inputs, engine, ayanamsa, and placements. | A stored PDF file and a private storage bucket. |
| Account deletion | Browser charts can be deleted. The SQL function deletes that user’s rows and sets `deleted_at`. | Removing the Auth user needs the service role, which the browser does not have. |
| AI guide | The screen does not send a question. `supabase/functions/guide` returns 503 without a key and 501 if a key exists, and does not call a model. | Server-side recomputation, then a real provider. |
| Payments | Free, monthly, and yearly cards. Purchase buttons are disabled. | A payment provider. Nothing is marked paid. |

## NOT IMPLEMENTED

- Cloud sync of birth profiles. Charts stay in this browser even after a future sign-in, until a tested sync is added.
- True lunar node, nutation in the ayanamsa, and a Swiss Ephemeris comparison of the lagna.
- Divisional charts other than navamsa.
- Push notifications.
- Native Android and iOS builds beyond the existing Expo app.

## BLOCKED BY EXTERNAL CREDENTIALS

| Need | Name | Where it goes |
| --- | --- | --- |
| Supabase project | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | `web/.env` only. Public by design after RLS is on. |
| Privileged database and the Auth admin API | `SUPABASE_SERVICE_ROLE_KEY` | Edge Function secret. Never `VITE_`. |
| OpenAI | `OPENAI_API_KEY` | Edge Function secret. Paid. The function still refuses to call the model. |
| Payments | None chosen | Do not add a card form on the Cloudflare free plan. |

## BLOCKED BY LICENSE OR THIRD-PARTY REQUIREMENTS

- Swiss Ephemeris: AGPL, or a commercial licence. Not added. See `docs/CALCULATION.md`.
- Nominatim’s public server is not an unrestricted commercial geocoder, so it is not called.
- Ollama is not installed on this machine.
- Docker is not installed, so local Supabase cannot start.
- Windows Application Control blocks oxlint’s native binary. TypeScript still runs inside `npm run build`.

## Commands

```text
npm run site
npm run mobile
cd web
npm test
npm run build
```

The site is http://127.0.0.1:5173/ when the dev server is running.
