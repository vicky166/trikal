# Pending features

Status words: working means the behaviour is in the website or mobile app and covered by a test or by code that runs without a new service. Blocked means the next task cannot finish until a credential, a licence, or a product decision arrives.

| Feature | Status | Depends on | Next task |
| --- | --- | --- | --- |
| Supabase Auth | Client and screens exist. No project, so no account has been created. | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and the migration applied. | Follow `docs/SUPABASE_DEVELOPER_HANDOVER.md`. Do not add a second client. |
| Database | SQL file with RLS is in `supabase/migrations/20261118120000_init.sql`. Not applied. | Supabase project or local CLI plus Docker. | Apply the file. Prove two users cannot read each other's rows. |
| Birth profile onboarding | Website form and local save work for listed cities. Mobile has its own AsyncStorage form. | None for the current device behaviour. Cloud copy needs Auth and `birth_profiles`. | Map the existing Zod profile into `birth_profiles` after sign-in, or leave device storage and document that choice. |
| User dashboard | `/charts` lists device profiles. It is not account-aware. | Auth if it must show only the signed-in person. | Add session display without removing the local list until cloud sync exists. |
| Astrology calculation | Working in the browser: Astronomy Engine, mean Lahiri, nine grahas, lagna, houses, nakshatra, pada, navamsa, Vimshottari. | None. Swiss Ephemeris is a licence decision, not a code gap. | Keep calculation out of the AI function. If charts are stored, store the metadata already returned by `calculateChart`. |
| Kundli | Working from a ready local profile. North and South layouts render from that result. | A ready profile. | Optional: persist the result only after RLS allows a trusted insert. |
| Horoscope | Moon sign only. Written daily, weekly, and monthly text is absent on purpose. | An editor or a reviewed generator, plus `horoscope_entries`. | Insert published rows. The page should read `published_at is not null` and keep showing the calculated Moon sign separately. |
| AI astrologer | UI does not send. Edge Function returns 501 even with a key. | Server-side recompute, then `OPENAI_API_KEY` as a function secret. OpenAI is paid. | Do not forward a chart JSON from the browser to the model. |
| Compatibility | Six kootas work. Total out of 36 is withheld. | A verified Yoni and Vashya table before any total is shown. | Leave the total null until those two tables are sourced. |
| Reports and PDF | Browser print of the calculated chart. | None for print. A stored PDF needs private Storage and an `astrology_reports` row. | Keep print. Add storage only with an owner-only policy. |
| Subscriptions | SQL table and a free row inserted by `handle_new_user`. Pricing buttons disabled. | The migration. | Read the free row. Do not enable purchase. |
| Payments | Table exists. No client insert policy. No provider. | A provider decision. Cloudflare's free plan, as noted in `docs/DEPLOYMENT_GUIDE.md`, is a poor place for card forms. | Leave the buttons disabled. |
| PWA | Manifest, icons, production service worker, offline page. | An HTTPS deploy for a real install test. | Install once on Android Chrome and record the result. Do not cache Auth responses. |
| Internationalization | English and Hindi for the website screens in `copy.ts`. Mobile also has Hinglish in its own copy file. | None. | Add keys in both languages together. The Hindi object is typed as every English key. |
| Security | RLS is written, untested. No service-role key in `web/src`. Account page is public. | A live project. | Run the two-user RLS check before any birth data is uploaded. |
| Deployment | Guide is `docs/DEPLOYMENT_GUIDE.md`. The site has not been deployed from this repo. | Cloudflare Pages or another static host, plus the two public Supabase values when Auth is wanted. | Deploy `web/` only. Do not deploy the Expo app as part of that. |

Mobile screens under `mobile/app/` are a separate client: splash, onboarding, tabs (home, kundli, ask, horoscope, profile), birth profile, auth screens, plans, reports, compatibility, privacy, terms, about. They use device storage and do not call this website or Supabase. Their kundli does not use Astronomy Engine. Connecting mobile is out of scope for the first Supabase pass unless the owner asks for it.
