# Supabase developer handover

The browser client and the SQL file already exist. A Supabase project does not. Do not rewrite the website auth screens. Connect the project, apply the migration, then prove the calls that are already written.

## Already implemented

| Piece | Path | Behaviour today |
| --- | --- | --- |
| Package | `web/package.json` | `@supabase/supabase-js` 2.119.0 |
| Public config check | `web/src/services/authConfig.ts` | Both `VITE_` values required |
| Single client | `web/src/services/supabase.ts` | Session persistence, refresh, URL detection |
| Session hook | `web/src/services/useSession.ts` | `getSession` and `onAuthStateChange` |
| Sign-up, sign-in, reset email, new password | `web/src/pages/AuthPages.tsx` | Real Auth API when configured; otherwise a stopped form |
| Log out and `delete_own_account` | `web/src/pages/AccountPage.tsx` | Rendered only when `configured && session` |
| SQL | `supabase/migrations/20261118120000_init.sql` | Tables, RLS, `handle_new_user`, `delete_own_account` |
| CLI config | `supabase/config.toml` | Local ports and `site_url` `http://127.0.0.1:5173` |
| Guide function | `supabase/functions/guide/index.ts` | Refuses to call a model |

## Planned in docs, not called by the website

`docs/API_SPECIFICATION.md` describes `/v1/...` routes. They are not implemented and the website does not fetch them.

`docs/DATABASE_SCHEMA.md` is the narrative version of the migration. Where they differ, trust the SQL file and record the difference. One known difference: the SQL uses `user_profiles` and `user_preferences` as two tables. The narrative doc uses `user_profiles` for language and notifications.

## Not implemented

- No Supabase project URL is configured. `web/.env` is absent.
- The migration has not been applied. Docker and the Supabase CLI were not present when the file was added.
- No `.from('birth_profiles')` or any other table query exists in `web/src`.
- No route is protected. `/account` and `/charts` render for everyone.
- `useSession` is not provided above the router, so a new page must call the hook itself. That is fine. Do not invent a second session store.
- Birth profiles stay in `localStorage` even after sign-in. Signing in does not upload them.
- `astrology_charts` has a select policy only. The browser cannot insert a chart under the current SQL.
- `delete_own_account` deletes rows in `public` and sets `users.deleted_at`. It does not delete `auth.users`. That needs the service role, outside the browser.
- Email delivery, confirmation, and the reset redirect have not been tested.
- The mobile app does not import Supabase. Its login screens are a device preview stored in AsyncStorage (`mobile/src/state/`).

## Recommended order

1. Read this file, `supabase/migrations/20261118120000_init.sql`, and `docs/DATABASE_SCHEMA.md`.
2. Read `web/src/pages/AuthPages.tsx` and `web/src/services/supabase.ts` before adding auth code.
3. Create a Supabase project, or install Docker and run `supabase start` from the repo root. Put the project URL and anon key in `web/.env`. Leave the service role and OpenAI key out of any `VITE_` name.
4. Apply `supabase/migrations/20261118120000_init.sql`. On the CLI this happens with `supabase start` or `supabase db reset`. On a hosted project, run the file in the SQL editor once.
5. In the Supabase SQL editor, sign in as two test users and confirm one cannot `select` the other's `birth_profiles`, `messages`, or `astrology_reports`. The policies are written. They are not proven.
6. Keep initialization in `getSupabase()`. Restart `npm run site`.
7. Sign up from `/signup`. If email confirmation is on, the page already shows the check-email state when Auth returns no session.
8. Sign in on `/login`, refresh, and confirm `useSession` still has the email. Sign out on `/account`.
9. Add a guard only where a page must require a session. Do not hide `/kundli`: chart calculation currently works without an account.
10. Decide whether `user_profiles` is edited from `/account` or left unused. The page does not update it today.
11. If cloud birth profiles are required, map `SavedProfile` in `web/src/domain/profiles.ts` onto `birth_profiles` and keep the Zod schema as the write check. Do not create a second form.
12. Confirm a user id on every private row and that the client never sees the service role.
13. Test sign-up, refresh, reset through `/reset`, local charts still loading, and a second user blocked by RLS.

## Tables in the migration

Status of every table below: written in `supabase/migrations/20261118120000_init.sql`, not applied, not queried by the website. Owner means the row's `user_id` or `id` must equal `auth.uid()` unless noted. `handle_new_user` inserts `users`, `user_profiles`, `user_preferences`, and a free `subscriptions` row after `auth.users` insert.

| Table | Purpose | Fields that matter | RLS in the file |
| --- | --- | --- | --- |
| `users` | Mirror of `auth.users`. | `id` PK and FK to `auth.users`, `email`, `deleted_at`. | Select and update own row. No client insert. |
| `user_profiles` | Display name, language, notification flags, IANA timezone. | `user_id` PK. Language `en`, `hi`, or `hinglish`. | All operations on own row. |
| `user_preferences` | Chart settings. | `ayanamsa` default `lahiri`, `house_system` default `whole-sign`. | All operations on own row. |
| `birth_profiles` | Private birth facts. | Name, date, time, `time_precision`, city label, country code, IANA zone, lat/long, `location_source`, gender, `is_primary`. Checks reject an unknown time that still has a clock, and a lone latitude. | All operations where `user_id = auth.uid()`. One primary per user. |
| `astrology_charts` | One stored calculation. | Engine, version, ayanamsa degrees, house system, node model, `instant_utc`, lagna longitude, `planets` jsonb, `dasha` jsonb. FK to `birth_profiles` and `users`. | Select own rows only. No insert, update, or delete policy. |
| `horoscope_entries` | Published sign text. No `user_id`. | Rashi, period, `period_start`, timezone, language, career, love, health, finance, `general_life`, source, `published_at`. | Select where `published_at` is not null. No write policy. |
| `conversations` | A guide thread. | `user_id`, optional `birth_profile_id`, title, language. | All operations on own rows. |
| `messages` | Turns in a thread. | `conversation_id`, `user_id`, role, body, optional `chart_id`, token counts. | All operations on own rows. |
| `astrology_reports` | Saved report text. | `user_id`, `birth_profile_id`, required `chart_id`, kind, title, preview, body. | Select own rows only. |
| `compatibility_reports` | Stored koota JSON. | `user_id`, two birth profile ids, `scores`, `total_withheld` default true. | All operations on own rows. |
| `subscriptions` | Plan state. | `plan` free/monthly/yearly, `status`, `provider` default `none`, `current_period_end`. | Select own rows. No client insert. The trigger inserts the free row. |
| `payments` | Money records in minor units. | `amount_minor`, `currency`, status including `paid`, provider reference. | Select own rows. No insert policy, so the browser cannot mark a payment paid. |
| `usage_limits` | Daily guide count. | PK (`user_id`, `day`), `guide_questions`. | Select own rows. No client write. |
| `saved_insights` | Bookmark of a message. | `user_id`, `message_id`. | All operations on own rows. |
| `notifications` | Horoscope or guide notices. | `user_id`, kind, title, body, `read_at`. | Select and update own rows. |
| `audit_events` | Deletion marker. | `user_id`, `kind`. | Select own rows. Insert is done inside `delete_own_account`. |

`delete_own_account` is `security definer`, granted to `authenticated`. It deletes that user's birth profiles, conversations, notifications, and saved insights, nulls the email, sets `deleted_at`, and writes an audit row. It does not remove the Auth user.

## Decisions the product owner must make

- Hosted project versus local CLI. Local config expects redirect `http://127.0.0.1:5173/reset`.
- Whether email confirmation is required before a session.
- Whether existing `localStorage` profiles are imported after the first sign-in or left on the device.
- Whether calculated charts remain in the browser or are inserted by an Edge Function. The current RLS does not allow a client insert into `astrology_charts`.
- Who may delete `auth.users`. The SQL function does not.

## Do not

- Put `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` in frontend code or in a `VITE_` variable.
- Mark a payment `paid` from the browser. `payments` has no insert policy.
- Call OpenAI from `guide` until that function recomputes the chart itself. It is written to return 501 on purpose.
- Duplicate the city list or the birth schema. The website and the mobile app each have a copy already; a third copy will drift.
