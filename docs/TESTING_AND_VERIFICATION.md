# Testing and verification

Run on 18 November 2026 from this machine. Node is the version already used by the repo (v24). No dependencies were installed for this handover.

## Website

Command, from `web/`: `npm test`

Result: 20 passed, 0 failed.

| File | What it covers |
| --- | --- |
| `web/src/domain/birth.test.ts` | Valid city, future date, unknown time, clock value with unknown time, mismatched coordinates, coordinates without a city. |
| `web/src/domain/profiles.test.ts` | Save, edit, delete, and rejection of a stored row whose latitude was altered. |
| `web/src/astrology/chart.test.ts` | Mean Lahiri versus published values, Kolkata and London offsets including British Summer Time, nakshatra, navamsa, dasha balance, Sun near 16° sidereal Sagittarius at 2000-01-01 00:00 UTC, ascendant motion, rejected coordinates, six kootas with no total. |
| `web/src/services/authConfig.test.ts` | `authConfigured()` is false when the public env values are absent. |
| `web/src/security/secrets.test.ts` | `web/src` except tests does not contain `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, or `VITE_OPENAI`. |

Command: `npm run build` (`tsc -b` then Vite 8.3.8). Result: success. Output is `web/dist`, which is gitignored.

Command: `npm run lint` (`oxlint`). Result: exit 0, three warnings.

- `web/src/state/Profiles.tsx` and `web/src/i18n/I18n.tsx`: fast-refresh warning because the file exports a hook as well as a component.
- `web/src/components/BirthForm.tsx`: `Date` during render for the date input max.

These warnings were not changed during the handover.

## Mobile

From `mobile/`:

- `npm run typecheck` (`tsc --noEmit`): passed.
- `npm test` (`tsx --test src/domain/birthProfile.test.ts`): 6 passed, 0 failed.

## Not run

- Next.js `npm run lint` and `npm run build` at the repo root. The starter was not part of this change.
- A browser click-through of the website.
- PWA install on a phone.
- Supabase Auth against a real project. There is no project.
- The SQL migration against Postgres.
- `supabase/functions/guide` under the Supabase CLI.

An earlier session found Windows Application Control blocking oxlint's native binary. On this run oxlint started and finished.
