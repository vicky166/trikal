# TRIKAL — Database schema

PostgreSQL, hosted with Supabase. Row-level security is on for every user-owned table. The website reaches this database through Supabase Auth and Edge Functions. The service role is used only inside those functions, for calculation results, usage counters, and verified payments. It is not a browser variable.

Identifiers are `uuid`. Timestamps are `timestamptz`. Money is integer minor units plus an ISO currency code, never a float.

## Tables

### users

Mirrors the auth user. Created by a trigger on `auth.users`.

| Column | Notes |
| --- | --- |
| id | Primary key, same as auth user id |
| email | Unique, nullable for a future phone-only account |
| created_at, updated_at | |
| deleted_at | Soft delete. Personal rows are removed by the deletion job |

### user_profiles

| Column | Notes |
| --- | --- |
| user_id | Primary key, references users |
| display_name | |
| language | `en`, `hi`, or `hinglish` |
| notification_horoscope | boolean |
| notification_guide | boolean |
| timezone | IANA name, default `Asia/Kolkata` |

### birth_profiles

| Column | Notes |
| --- | --- |
| id | |
| user_id | Indexed |
| full_name | |
| birth_date | date |
| birth_time | time, nullable |
| time_precision | `exact` or `unknown` |
| city_label | What the person typed or picked |
| country_code | ISO 3166-1 alpha-2 |
| time_zone | IANA, required before calculation |
| latitude, longitude | numeric(8,5), nullable until geocoded |
| location_source | `gazetteer`, `geocoder`, or `unresolved` |
| gender | `female`, `male`, `other`, `unspecified` |
| is_primary | one true per user, partial unique index |
| created_at, updated_at | |

Index: `(user_id, created_at desc)`.

A profile with `time_precision = unknown` or null coordinates cannot produce a lagna chart.

### astrology_charts

One row per successful calculation of a birth profile and ayanamsa.

| Column | Notes |
| --- | --- |
| id | |
| birth_profile_id | Indexed |
| user_id | Indexed, for RLS |
| engine | for example `swiss-ephemeris` |
| engine_version | |
| ayanamsa | `lahiri` |
| house_system | `whole-sign` |
| lagna_sign | nullable if time is unknown |
| moon_sign, sun_sign, nakshatra, nakshatra_pada | |
| planets | jsonb array of name, longitude, sign, house, retrogression |
| houses | jsonb |
| dasha | jsonb, nullable until that calculation is tested |
| calculated_at | |

Unique `(birth_profile_id, engine, engine_version, ayanamsa, house_system)`.

### conversations

| Column | Notes |
| --- | --- |
| id | |
| user_id | Indexed |
| birth_profile_id | nullable |
| title | |
| language | |
| created_at, updated_at | |

### messages

| Column | Notes |
| --- | --- |
| id | |
| conversation_id | Indexed |
| user_id | for RLS |
| role | `user`, `assistant`, or `system` |
| body | text |
| chart_id | nullable. Set when the reply was grounded in a chart |
| prompt_version | nullable |
| input_tokens, output_tokens | integers, nullable |
| created_at | |

Index: `(conversation_id, created_at)`.

### horoscope_entries

Editorial or generated copy that has passed review. Not computed on the phone.

| Column | Notes |
| --- | --- |
| id | |
| rashi | one of the 12 |
| period | `daily`, `weekly`, `monthly` |
| period_start | date in `Asia/Kolkata` unless `timezone` says otherwise |
| timezone | |
| language | |
| career, love, health, finance | text |
| lucky_number | smallint |
| lucky_colour | text |
| source | `editor` or `model` |
| published_at | |

Unique `(rashi, period, period_start, language)`.

### astrology_reports

| Column | Notes |
| --- | --- |
| id | |
| user_id | |
| birth_profile_id | |
| chart_id | required |
| kind | `birth`, `career`, `marriage`, `relationship`, `finance`, `yearly` |
| title | |
| preview | text shown to free users |
| body | text. Empty until entitled |
| pdf_path | private storage path, nullable |
| created_at | |

### subscriptions

| Column | Notes |
| --- | --- |
| id | |
| user_id | Indexed |
| plan | `free`, `monthly`, `yearly` |
| status | `active`, `grace`, `expired`, `cancelled` |
| provider | `google_play` or `none` |
| provider_token_hash | hash only, not the raw purchase token |
| current_period_end | |
| updated_at | |

### payments

| Column | Notes |
| --- | --- |
| id | |
| user_id | |
| subscription_id | nullable for a one-off report |
| report_id | nullable |
| amount_minor | integer |
| currency | `INR` |
| status | `pending`, `paid`, `failed`, `refunded` |
| provider_reference | |
| created_at | |

A row becomes `paid` only after server verification.

### usage_limits

| Column | Notes |
| --- | --- |
| user_id | |
| day | date in the user's profile timezone |
| guide_questions | integer |
| primary key | `(user_id, day)` |

### saved_insights

| Column | Notes |
| --- | --- |
| id | |
| user_id | |
| message_id | |
| created_at | |

### notifications

| Column | Notes |
| --- | --- |
| id | |
| user_id | |
| kind | `horoscope` or `guide` |
| title, body | |
| read_at | nullable |
| created_at | |

## Access

- `users`, `user_profiles`, `birth_profiles`, `astrology_charts`, `conversations`, `messages`, `astrology_reports`, `subscriptions`, `payments`, `usage_limits`, `saved_insights`, `notifications`: `user_id = auth.uid()` for select, insert, and update where the person owns the row.
- The client cannot insert into `astrology_charts`, `horoscope_entries`, `payments`, or `usage_limits`. Those writes are server-only.
- `horoscope_entries` are readable by any signed-in user, and by guests only through the API's public horoscope route.

## Deletion

Account deletion removes birth profiles, charts, messages, reports, saved insights, and notifications. Payment rows keep amount, currency, status, and a detached id for accounting, with name and birth data removed. The auth user is deleted last.
