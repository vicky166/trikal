# TRIKAL — Current implementation status

A route that renders is not treated as a finished product feature. Status below is from the source on `master` and from the checks in `docs/TESTING_AND_VERIFICATION.md`.

## Website routes

| Route | File | What it shows | What works | What is not live |
| --- | --- | --- | --- | --- |
| `/` | `web/src/pages/LandingPage.tsx` | Brand landing in English or Hindi: hero, four feature cards, how it works, plans marked not for sale, FAQ, footer. | Navigation, language toggle, install button only when the browser fires `beforeinstallprompt`. | No account and no chart on this page. |
| `/charts` | `web/src/pages/ChartsPage.tsx` | Birth profiles saved in this browser. | Create link, edit, delete. Ready / missing time / missing place is decided by `chartReady`. | Not a signed-in dashboard. Data is `localStorage`, key `trikal.profiles.v1`. |
| `/birth`, `/birth/:id` | `web/src/pages/BirthPage.tsx`, `web/src/components/BirthForm.tsx` | Name, date, time or unknown, city search, gender, country. | Zod validation. A listed city copies that city's published centre coordinates and IANA zone. Save writes local storage and opens the kundli route. | An unlisted place is stored with no coordinates. Nothing is sent to Supabase. |
| `/kundli`, `/kundli/:id` | `web/src/pages/KundliPage.tsx`, `web/src/components/ChartView.tsx` | North Indian chart, South Indian chart, planet table, navamsa sign, Vimshottari periods. | Calculated in the browser when time is exact and the city is listed. | Unknown time or unlisted place shows an explanation and no degrees. Results are not saved to `astrology_charts`. |
| `/report/:id` | `web/src/pages/ReportPage.tsx` | Same chart plus inputs, UTC instant, engine name, ayanamsa degrees. | `window.print()` for a browser PDF. | No generated PDF file and no private storage object. |
| `/horoscope` | `web/src/pages/HoroscopePage.tsx` | Twelve rashis, daily/weekly/monthly tabs, and the calculated Moon sign when a ready local profile exists. | Tab selection and the Moon sign from the first ready profile. | The same sentence is shown for every period: no horoscope text is published. No lucky numbers. |
| `/compatibility` | `web/src/pages/MatchPage.tsx` | Two local profiles and six koota scores. | Varna, Tara, Gana, Graha Maitri, Bhakoot, and Nadi from the two Moon positions. | Yoni and Vashya are withheld, so the total out of 36 is not shown. Not written to `compatibility_reports`. |
| `/ask` | `web/src/pages/AskPage.tsx` | Suggested questions and a textarea. | Submit sets a local message that nothing was sent. | No network call. The Edge Function is not invoked. |
| `/pricing` | `web/src/pages/PricingPage.tsx` | Free, monthly, and yearly cards. | Buttons are `disabled`. | No checkout and no subscription row is read. |
| `/login`, `/signup`, `/forgot`, `/reset` | `web/src/pages/AuthPages.tsx` | Email and password fields, or email only for forgot, or a new password for reset. | If both public Supabase variables are non-empty, the page calls `signInWithPassword`, `signUp`, `resetPasswordForEmail`, or `updateUser`. Errors from Supabase are shown. | With empty env, submit stops and states that no account was created. This was not exercised against a project. |
| `/account` | `web/src/pages/AccountPage.tsx` | Language select, delete-local-charts, and, only when a session exists, cloud delete and log out. | Language persists in `localStorage` (`trikal.language`). Local delete clears `trikal.profiles.v1`. Log out calls `auth.signOut`. Cloud delete calls `rpc('delete_own_account')`. | The page is not protected. Profile fields are not loaded from `user_profiles`. |
| `/privacy`, `/terms` | `web/src/pages/StatusPage.tsx` | Short drafts labelled for legal review. | Text renders in both languages. | Not a lawyer-approved policy or contract. |

There is no separate dashboard route. `/charts` is the device chart list.

## Shared behaviour that is real

- English and Hindi copy live in `web/src/i18n/copy.ts`. The header toggle and the account select both use `web/src/i18n/I18n.tsx`.
- Header and footer links are React Router links. Mobile nav is the header menu below the `lg` breakpoint.
- Birth rules: `web/src/domain/birth.ts`. City list: `web/src/domain/places.ts` (25 city centres). Storage: `web/src/domain/profiles.ts`.
- Chart math: `web/src/astrology/`. Method notes: `docs/CALCULATION.md`.
- PWA files: `web/public/manifest.webmanifest`, `web/public/sw.js` (cache `trikal-public-v2`), `web/public/offline.html`, `web/public/icon-192.png`, `web/public/icon-512.png`, `web/public/favicon.svg`. The service worker is registered only in production (`web/src/main.tsx`). It skips non-GET requests, requests with an Authorization header, and other origins. Install on a phone was not tested.

## Backend data

No website page reads or writes a Supabase table. The only Supabase calls in `web/src` are Auth methods and `rpc('delete_own_account')`. Birth charts, horoscopes, compatibility, and reports are computed or stored in the browser.
