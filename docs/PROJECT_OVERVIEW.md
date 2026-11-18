# TRIKAL — Project overview

Inspection date: 18 November 2026. This describes the repository as it is on `master` at commit `dda8a33`, plus this handover. It is not a plan.

Remote: `https://github.com/vicky166/trikal` (private). Branch `master` tracks `origin/master`. Package manager for every app is npm. There is no workspace tool. Each app has its own `package-lock.json` and `node_modules`.

## Three applications

| Path | Role | Stack actually installed |
| --- | --- | --- |
| `/` | Next.js starter left in place. It is not the TRIKAL product. | Next.js 16.4.6, React 19.3.0, React DOM 19.3.0, Tailwind CSS 4.3.3, TypeScript 5. Entry: `src/app/page.tsx` through the App Router. Scripts: `dev`, `build`, `start`, `lint`, plus `mobile` and `site`. Config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`. |
| `mobile/` | Expo client named TRIKAL. | Expo SDK ~58.0.26, React Native 0.88.1, React 19.3.0, Expo Router ~58.0.32. Entry: `expo-router/entry` in `mobile/package.json`. Config: `mobile/app.json`. |
| `web/` | TRIKAL website, package name `trikal-web` 0.1.0. | Vite 8.3.8, React 19.3.1, TypeScript ~7.0.2, Tailwind CSS 4.3.5, React Router 7, Zod 4.6.7, `@supabase/supabase-js` 2.119.0, Astronomy Engine 2.1.19 (MIT). Entry: `web/index.html` loads `web/src/main.tsx`, which renders `web/src/App.tsx`. |

`docs/` holds product plans and this handover. `supabase/` holds one SQL migration, `config.toml`, and one Edge Function. Those files are not applied to a running project.

## How to start what exists

From the repository root:

- `npm run site` starts the website (`web` Vite dev server).
- `npm run mobile` starts Expo.
- `npm run dev` starts the Next.js starter, not TRIKAL.

No `.env` file is committed. `web/.env.example` lists empty variable names only.
