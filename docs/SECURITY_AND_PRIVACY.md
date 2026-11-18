# TRIKAL — Security and privacy

## Website

The browser may hold only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and only after row-level security is tested. Those values are public by design. The service-role key and the OpenAI key are Edge Function secrets. They are never `VITE_` variables and never committed.

The service worker caches public GET responses only. It ignores requests with an Authorization header and must not be extended to cache charts or chats.

## Secrets

| Secret | Where it may live |
| --- | --- |
| OpenAI API key | Server environment only |
| Supabase service-role key | Server environment only |
| Database URL | Server environment only |
| Google Play service account | Server environment only |
| Swiss Ephemeris commercial license file | Server only |
| Supabase anon key | App env, only after RLS is tested |
| API base URL | App env |

The Expo app has no production secret today. Do not add one to `app.json`, source, or `EXPO_PUBLIC_*`.

## Identity and access

- A person reads and writes only their own rows. Enforced with row-level security and repeated in NestJS queries.
- Cross-user access returns not found.
- Guest preview on the device is not an account and is not sent to a server as one.
- Sessions expire with the auth provider. The app returns to login on `401`.

## Birth data

Birth date, time, and place are sensitive. They describe a person's life, not a password, but they are still private.

- Do not log them.
- Do not put them in analytics events.
- Do not send them to the AI provider except as the structured chart context for that person's own question.
- Delete them on account deletion.

On-device preview storage is AsyncStorage. It is not encrypted. Before real sign-in, tokens must move to the platform secure store. Birth profiles on a signed-in account live on the server, not as the only copy in AsyncStorage.

## AI

- The model is called only from the server.
- The prompt says the chart JSON is the only source of positions.
- The prompt forbids medical diagnosis, legal advice, investment instructions, and guaranteed marriage, money, or career outcomes.
- The prompt forbids fear, threats, and claims of curses or unavoidable harm.
- Output is validated. A response that includes planetary numbers not present in the chart JSON is discarded and replaced with a safe fallback.
- Questions and answers are stored for the owner's history and can be deleted.

## Payments

- The phone cannot set its own entitlement.
- Purchase tokens are verified with Google and then stored only as a hash, plus the provider reference needed for support.
- A restore re-runs verification. It does not trust a local flag.
- Prices shown in the app must match the Play product. Until products exist, the app shows no charge button.

## Abuse

- Guide routes are rate-limited per user and per IP.
- Daily question limits are counted on the server before the model call.
- Auth endpoints use the provider's throttling.
- Input length is capped (question body, names, city labels).

## App surface

- Release builds must not ship the dev preview banner's "create local preview" path as if it were signup. The current build labels device preview as device-only.
- Account deletion is a real control once accounts exist. In the current build, "Delete data on this device" clears the local store.
- Privacy policy and terms in the app are drafts for legal review. They are labelled as drafts.

## Still required before production

- RLS tests for every user-owned table
- A threat pass on the purchase verifier
- A decision on ephemeris licensing
- Legal review of the privacy policy, terms, and astrology disclaimer
- Encrypted storage for refresh tokens
- A support contact that is a real mailbox
