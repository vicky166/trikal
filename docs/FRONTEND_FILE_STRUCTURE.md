# TRIKAL website — file structure

Package root: `web/`. Do not import from `mobile/` or from the Next.js `src/`.

```text
web/
  index.html                 HTML shell, theme-color, manifest link
  vite.config.ts             React and Tailwind plugins
  tsconfig.json              project references
  tsconfig.app.json          app compiler options; tests excluded
  package.json               scripts dev, build, lint, preview, test
  .env.example               empty variable names
  public/
    manifest.webmanifest
    sw.js
    offline.html
    _redirects
    favicon.svg
    icon-192.png
    icon-512.png
  src/
    main.tsx                 fonts, render, production service worker
    App.tsx                  providers and routes
    index.css                Tailwind v4 theme tokens
    pages/                   one screen per file
    components/              Mark, Button, PageShell, SiteHeader, SiteFooter, BirthForm, ChartView
    domain/                  birth schema, cities, local profile store
    astrology/               ephemeris, ayanamsa, time, dasha, navamsa, guna, names
    i18n/                    copy.ts and I18n.tsx
    services/                authConfig.ts, supabase.ts, useSession.ts
    state/Profiles.tsx       local birth profiles
    security/secrets.test.ts source scan for forbidden key names
```

## Route map

Defined only in `web/src/App.tsx`.

| Path | Component | Loaded |
| --- | --- | --- |
| `/` | `LandingPage` | eager |
| `/charts` | `ChartsPage` | eager |
| `/birth`, `/birth/:id` | `BirthPage` | eager |
| `/ask` | `AskPage` | eager |
| `/pricing` | `PricingPage` | eager |
| `/privacy`, `/terms` | `StatusPage` | eager |
| `/kundli`, `/kundli/:id` | `KundliPage` | lazy |
| `/report/:id` | `ReportPage` | lazy |
| `/horoscope` | `HoroscopePage` | lazy |
| `/compatibility` | `MatchPage` | lazy |
| `/login`, `/signup`, `/forgot`, `/reset` | `AuthPages.tsx` | lazy |
| `/account` | `AccountPage` | lazy |

Kundli, horoscope, compatibility, and report import `chartFromProfile`, which pulls Astronomy Engine. Auth and account import `@supabase/supabase-js` through `useSession.ts`. The landing chunk does not include those modules.

## Local storage keys

| Key | Owner |
| --- | --- |
| `trikal.profiles.v1` | `web/src/domain/profiles.ts` |
| `trikal.language` | `web/src/i18n/I18n.tsx` |

There is no other persistence on the website.
