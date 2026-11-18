# Environment configuration

No `.env` file is in the repository. `web/.env.example` contains empty names. Do not paste real values into docs or into git.

Root `.gitignore` ignores `.env*`. `web/.gitignore` ignores `.env` and `.env.*` and un-ignores `.env.example`.

| Name | Purpose | Configured now | Where it belongs | Exposure |
| --- | --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Project URL read by `web/src/services/authConfig.ts`. Vite inlines any `VITE_` value into the browser bundle. | Empty. Auth stays off. | `web/.env` for local dev. Cloudflare Pages environment for a deploy. | Public once RLS is on. Anyone can read it from the built JavaScript. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key, passed to `createClient` in `web/src/services/supabase.ts`. | Empty. | Same as the URL. | Public in the same way. RLS is what makes that safe. |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS. Needed later to delete `auth.users` or to run trusted jobs. | Not set. The website source does not read this name. | Edge Function secret or a server environment. Never `web/.env` if that file is loaded by Vite with a `VITE_` prefix. The example lists it without `VITE_`. | Secret. A service-role key in the browser can read every row. |
| `OPENAI_API_KEY` | Would authorize a model call. `supabase/functions/guide/index.ts` checks `Deno.env` and still returns 501 when the key exists. | Not set. | Edge Function secret only. | Secret. Paid API. |
| `OPENAI_MODEL` | Model name for a future server call. No code reads it today. | Not set. | Edge Function secret. | Not a credential by itself. Keep it with the server config so the browser cannot choose the model. |

The Expo app has no Supabase variables. Do not add `EXPO_PUBLIC_` copies of the service role or the OpenAI key.

After adding `web/.env`, restart `npm run site`. Vite does not reload env files by itself.
