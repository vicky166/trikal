# TRIKAL — PWA configuration

The site in `web/` is an installable web app. It is not a store binary.

## Files

| File | Role |
| --- | --- |
| `web/public/manifest.webmanifest` | Name TRIKAL, standalone display, theme `#090814` |
| `web/public/icon-192.png`, `icon-512.png` | Install icons, the three-arc mark |
| `web/public/favicon.svg` | Browser tab |
| `web/public/sw.js` | Public shell cache and offline fallback |
| `web/public/offline.html` | Page shown when a navigation cannot be fetched |
| `web/src/main.tsx` | Registers the worker only in production builds |

## Caching

The worker handles same-origin GET requests that do not carry an `Authorization` header.

- A successful response is stored.
- A failed navigation falls back to the cached page, then to `offline.html`.
- Authenticated API calls are not cached. There is no API in this build.

Do not later cache Supabase responses, chart JSON, or chat history in this worker. Those belong to the signed-in session, not the public shell.

## Install behaviour

- Android Chrome and desktop Chromium can fire `beforeinstallprompt`. The site shows an Install control only when the browser offers that event.
- iOS Safari does not fire that event. A person uses Share, then Add to Home Screen. The FAQ says this.
- Installation still needs HTTPS. `localhost` counts during development. A `pages.dev` URL counts after deploy.
- The worker is not registered in `npm run dev`, so local reloads are not stuck behind an old shell.

## What was checked

The production build emits the manifest, icons, worker, and offline page. A full install test on a phone needs the deployed HTTPS URL. It has not been claimed as done on a device.
