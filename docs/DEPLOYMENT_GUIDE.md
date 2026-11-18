# TRIKAL — Deployment guide

Launch hosting is Cloudflare Pages on the free plan, from the `web/` directory. No custom domain is required. Pages assigns a `pages.dev` subdomain.

These limits were read from Cloudflare and Supabase’s public pricing and limits pages in November 2026. They are not a promise that the plans stay free or unchanged. Re-read the vendor pages before a public launch.

## Cloudflare Pages free plan

Observed limits:

- 500 builds a month, one build at a time, 20-minute build timeout.
- Up to 20,000 files and 25 MiB per file.
- 100 projects on an account, 100 custom domains on a project.
- Static requests are described by Cloudflare as unlimited. Functions are a separate Workers quota, about 100,000 requests a day on the free Workers allowance.
- The free terms bar collecting or processing credit-card data on the site. Do not add card forms.
- Community reading of the subscription terms finds no “non-commercial only” clause. Confirm the current terms anyway. There is no SLA and no paid support.
- Cloudflare may change a `pages.dev` hostname. A custom domain, when one is purchased later, is the stable name.

The TRIKAL site is static. It does not need Pages Functions for the current build, so it stays inside the static allowance.

Build settings:

| Setting | Value |
| --- | --- |
| Root directory | `web` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | 22 or newer |

`web/public/_redirects` sends unknown paths to `index.html` so client routes such as `/kundli` work on Pages.

Environment variables, only when Supabase exists:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not set the service-role key or the OpenAI key in the Pages project for this static site. Those belong in Edge Function secrets.

## Supabase free plan

Not connected yet. When it is:

- Two active free projects. A project pauses after one week without activity. A paused project does not serve production traffic.
- 500 MB database per project, 5 GB egress, 1 GB file storage.
- 50,000 monthly active users included.
- 500,000 Edge Function invocations a month. The free plan does not bill overage; over the quota the calls stop. Pro includes more, then about $2 per extra million.
- The published terms describe use for the customer’s own business. Read them again before collecting public user data. This guide does not treat the free plan as a permanent production contract.

OpenAI is a paid API. There is no free commercial allowance to assume. Each guide answer spends tokens. The Edge Function must count them and stop at the daily limit.

## Local Supabase on Windows

Docker and the Supabase CLI were not installed on the development machine, so Auth was not started. The migration and the guide function are in the repo and were not applied to a database.

1. Install Docker Desktop and leave it running.
2. Install the Supabase CLI: `winget install Supabase.CLI` or the current Windows package from the Supabase docs.
3. From the repository root: `supabase start`
4. Copy the local API URL and anon key into `web/.env`. Do not copy the service role into a `VITE_` variable.
5. Apply happens with `supabase start` because `supabase/migrations` is picked up by the CLI. On a hosted project, paste `supabase/migrations/20261118120000_init.sql` into the SQL editor instead.
6. Restart `npm run site`. Sign-up then uses that project. Email confirmation depends on the local Inbucket mailbox printed by `supabase start`, or on the hosted project’s auth settings.

The guide function is `supabase/functions/guide/index.ts`. It returns 503 when `OPENAI_API_KEY` is absent. When the key is present it still returns 501 and does not call a model, because the server does not yet recompute the chart. Deploy it only after that recomputation exists: `supabase functions deploy guide --no-verify-jwt` is the wrong flag. Use the default JWT check.

OpenAI is paid. Ollama was not installed here. Do not put either key in the website env.

## Local production check

```bash
cd web
npm test
npm run build
npm run preview
```

Open the preview URL, then the routes in the header, then `offline.html`.

## Expo

Deploying the website does not build or publish the Expo app. `mobile/` stays on its own release path.
