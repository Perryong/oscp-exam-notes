# Vercel + Firestore deployment

## External prerequisites

The local implementation uses the emulated Standard edition. Live Firebase inspection previously returned authentication required, so the production project's database edition and access are not yet verified. Run `npx firebase login`, then inspect `npx firebase firestore:databases:list --project oscp-notes --json` before deployment. Do not infer a missing database from an authentication/network/JSON error.

Confirm the `(default)` database is Standard edition. If it does not exist, choose a location deliberately in Firebase Console; this choice is not reversible. `setup-firebase.sh` stops on missing or unconfirmed databases and never creates one automatically.

In Firebase Console, enable Email/Password sign-in, provision the personal account, and add the deployed hostname to Authentication → Settings → Authorized domains. The app uses existing accounts; it does not implement public account administration. Configure password-reset email settings there too.

## Build configuration

Vercel uses `npm ci`, `npm run build`, and output directory `dist` from `vercel.json`. SPA rewrites support direct `/notes/:id` navigation. Only built assets are deployed; tests, fixtures, scripts and source files are not copied into `dist`.

Set these independently for Production and Preview:

| Variable | Production | Preview |
|---|---|---|
| `VITE_FIREBASE_MODE` | `production` | `test` |
| `VITE_FIREBASE_PROJECT_ID` | `oscp-notes` | Separate test project |
| `VITE_FIREBASE_API_KEY` | Firebase web API key | Test web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Project auth domain | Test auth domain |
| `VITE_FIREBASE_APP_ID` | Registered web app ID | Test web app ID |
| `VITE_PRODUCTION_FIREBASE_PROJECT_ID` | Production project ID if renamed | Same production ID, used to block previews |

Vercel's `VERCEL_ENV` is read at build time and injected into the client guard. Preview builds reject production mode, the known production project, and emulator mode. Hosted emulator builds are rejected. Web configuration is public; never place service-account JSON, private keys or Admin SDK credentials in `VITE_*` variables.

See the official [Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite) and [Vercel environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

## Verification and release order

1. Run `npm ci` and `npm --prefix tests ci` with Node 24, Java 21+, and Chrome available.
2. Run `npm test`, `npm run typecheck`, `npm run format:check`, and `npm run build`.
3. Run `npm run test:emulators` (rules, transaction integrations and development browser checks).
4. Build with `VITE_FIREBASE_MODE=emulator npm run build`, then run `npx firebase emulators:exec --project demo-oscp-notebook --only auth,firestore 'npm run test:release'`. These tests use the built app, verify private-file exclusion and mobile layout, and reload an edited note offline.
5. Export legacy browser sources on the old origin and keep a private backup. Deploy tested rules and indexes to the separate test project first: `npx firebase deploy --only firestore:rules,firestore:indexes --project YOUR_TEST_PROJECT`.
6. After a preview smoke test, deploy rules/indexes to production **before** publishing the frontend. Keep legacy collections and rules during migration. Check sign-in, creation, reload, screenshots and export on a disposable note after publishing.

No live deployment, live account provisioning or production smoke test has been performed by this implementation task. The local validation record will be updated after final review.

## Operational limits and recovery

Notes have a 600 KiB combined UTF-8 editor/text/source payload limit. Screenshots are compressed below Firestore's per-document limit; large images are rejected before upload. Previous note history retains 20 versions. Full backup import validates before writes, allocates new IDs and keeps a device-local resume mapping. To resume on another device, transfer a fresh backup rather than expecting the original import session to be present.

Offline downloads describe a captured revision snapshot, not perpetual freshness. Service workers cache the static shell only. Browser cache eviction may remove downloaded data; missing notes/images are explicitly reported. An initial visit with no connection cannot install the app.

Conflict decisions and competing local drafts remain recoverable in Settings. Clearing device data requires no unexported pending/recovery drafts and no other open notebook tabs. Screenshot deletion is deliberately deferred; the explicit storage-total action reads all image payloads and may incur Firestore read charges.

## Rollback

Before rolling back the frontend, export new-format notes with a full JSON backup. Restore the previous Vercel deployment while retaining `notebookNotes`, `machines`, `noteHistory`, migration/deletion markers and images. The old app cannot edit new-format notes; do not delete the new collections or deploy rules that remove access before backups are verified. Original weekly notes and browser sources are preserved by migration.

## Local validation record (2026-10-15)

Before independent review: unit tests 45/45, rules tests 11/11, emulator integration tests 14/14, development browser tests 8/8, production-preview tests 4/4. Typecheck, production build, formatting and diff whitespace checks passed. The built directory contains only static assets; no private-key PEM, service-account configuration or legacy fixture was found. Runtime dependency audit: zero reported vulnerabilities after pinning the patched transitive gRPC package. The remaining large-bundle warning reflects the embedded reference material plus editor/Firebase dependencies.

Live project preflight still returned “Failed to authenticate”; no production resources were changed.
