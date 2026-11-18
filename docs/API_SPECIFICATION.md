# TRIKAL — API specification

The website and the Expo app share this contract. The website calls Supabase Edge Functions. The Expo app uses the same paths through `EXPO_PUBLIC_API_URL`. All bodies are JSON. Authenticated routes require `Authorization: Bearer <supabase access token>`. These routes are specified and not deployed yet.

Errors use one shape:

```json
{ "error": { "code": "BIRTH_TIME_REQUIRED", "message": "Birth time is required for this chart." } }
```

Codes are stable. Messages may be localised by the app. Validation failures return `400` and `code: "VALIDATION"`. Unknown resources return `404`. Someone else's resource returns `404`, not `403`, so existence does not leak. Rate and quota failures return `429` with `code: "LIMIT"`.

List routes take `cursor` and `limit` (max 50) and return `{ "items": [], "nextCursor": null }`.

## Auth

Supabase Auth owns email, OTP, and password reset. The API does not reimplement passwords.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/me` | Profile, plan, today's remaining guide questions |
| PATCH | `/v1/me` | Display name, language, notification flags, timezone |
| DELETE | `/v1/me` | Start account deletion |

## Birth profiles

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/birth-profiles` | Own profiles |
| POST | `/v1/birth-profiles` | Create. Body validated with the same rules as the app schema |
| PATCH | `/v1/birth-profiles/:id` | Edit |
| DELETE | `/v1/birth-profiles/:id` | Delete |
| POST | `/v1/birth-profiles/:id/primary` | Mark primary |

Location autocomplete, when a geocoder key exists:

`GET /v1/places?q=` returns `{ id, label, countryCode, timeZone, latitude, longitude }`. No result is invented. If the geocoder is down, the route returns `503` with `code: "PLACES_UNAVAILABLE"`.

## Charts

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/birth-profiles/:id/chart` | Calculate or return the stored chart |
| GET | `/v1/charts/:id` | Own chart |

`POST` returns `409` with `code: "CHART_NOT_READY"` when time or coordinates are missing. The body explains which fields are missing. It never returns estimated degrees.

The chart payload:

```json
{
  "id": "uuid",
  "ayanamsa": "lahiri",
  "houseSystem": "whole-sign",
  "lagna": { "sign": "kanya", "degree": 12.45 },
  "planets": [
    { "name": "moon", "longitude": 134.2, "sign": "simha", "house": 12, "retrograde": false }
  ],
  "nakshatra": { "name": "magha", "pada": 2 },
  "dasha": null
}
```

`dasha` stays `null` until that calculation has golden tests. The app shows "not available" for a null dasha.

## Horoscope

`GET /v1/horoscopes?rashi=mesha&period=daily&date=2026-11-18&language=hi`

Returns one published entry or `404` with `code: "HOROSCOPE_UNPUBLISHED"`. The app must not replace that with generated prose.

## Guide

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/conversations` | Own conversations |
| POST | `/v1/conversations` | Start one. Optional `birthProfileId` |
| GET | `/v1/conversations/:id/messages` | Page of messages |
| POST | `/v1/conversations/:id/messages` | Send a question |
| POST | `/v1/messages/:id/save` | Save an answer |

Send body: `{ "text": "...", "language": "hi" }`.

The server loads the chart if a birth profile is attached. It rejects the provider call when the chart is required and missing. The stored assistant message then asks only for the missing fields.

Quota is checked first. `429` does not call the model.

Streaming, if enabled later, is `POST /v1/conversations/:id/messages?stream=1` as server-sent events. Until then the client uses the JSON response.

## Compatibility

`POST /v1/compatibility`

```json
{ "profileAId": "uuid", "profileBId": "uuid" }
```

Response is the Ashtakoota breakdown and total, or `409` `CHART_NOT_READY`. No total is returned without the eight kootas.

## Reports

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/reports` | Own reports |
| POST | `/v1/reports` | Request one. Entitlement checked |
| GET | `/v1/reports/:id` | Detail. `body` null when not entitled |
| GET | `/v1/reports/:id/pdf` | Short-lived signed URL |

## Billing

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/billing/plans` | Active plan ids and display prices from the server config |
| POST | `/v1/billing/google/verify` | Body: purchase token and product id. Server verifies with Google |
| POST | `/v1/billing/restore` | Re-check the store identity and refresh `subscriptions` |
| GET | `/v1/billing/history` | Own payment rows |

`verify` is the only path that can set a subscription to `active`.

## Health

`GET /v1/health` returns `{ "ok": true }` and does not touch the ephemeris or the model.

## Not built yet

No route in this document is deployed. The mobile app must not call a fictional host and treat the failure as a reading.
