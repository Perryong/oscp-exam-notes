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

The frontend and Firestore rules are deployed; see the live deployment record below. Live account provisioning and an authenticated production notebook smoke test remain unperformed.

## Operational limits and recovery

Notes have a 600 KiB combined UTF-8 editor/text/source payload limit. Screenshots are compressed below Firestore's per-document limit; large images are rejected before upload. Previous note history retains 20 versions. Full backup import validates before writes, allocates new IDs and keeps a device-local resume mapping. To resume on another device, transfer a fresh backup rather than expecting the original import session to be present.

Offline downloads describe a captured revision snapshot, not perpetual freshness. Service workers cache the static shell only. Browser cache eviction may remove downloaded data; missing notes/images are explicitly reported. An initial visit with no connection cannot install the app.

Conflict decisions and competing local drafts remain recoverable in Settings. Full backups include structured recovery copies and their screenshots; restoring a backup remaps and restores those copies. Completed exports require a confirmed server snapshot; offline fallback exports are explicitly partial. Clearing device data requires no unexported pending/recovery drafts and no other open notebook tabs. Screenshot deletion is deliberately deferred; the explicit storage-total action reads all image payloads and may incur Firestore read charges.

## Rollback

Before rolling back the frontend, export new-format notes with a full JSON backup. Restore the previous Vercel deployment while retaining `notebookNotes`, `machines`, `noteHistory`, migration/deletion markers and images. The old app cannot edit new-format notes; do not delete the new collections or deploy rules that remove access before backups are verified. Original weekly notes and browser sources are preserved by migration.

## Local validation record (2026-10-15)

After independent review and one regression-tested fix pass: unit tests 56/56, rules tests 11/11, emulator integration tests 14/14, development browser tests 8/8, production-preview tests 4/4 (93 total). See [the review record](implementation-review.md) for fixes, decisions and deferred minors. Typecheck, production build, formatting and diff whitespace checks passed. The built directory contains only static assets; no private-key PEM, service-account configuration or legacy fixture was found. Runtime dependency audit: zero reported vulnerabilities after pinning the patched transitive gRPC package. The remaining large-bundle warning reflects the embedded reference material plus editor/Firebase dependencies.

At the time of this local validation, live authentication was unavailable. The later deployment record below supersedes that preflight status.


## Live deployment progress (2026-10-15)

Firebase authentication completed. The existing `(default)` database in `oscp-notes` is Standard edition in `asia-southeast1`. Email/password authentication is enabled. The old deployed rules matched the legacy rules in behavior; rollback ruleset: `projects/oscp-notes/rulesets/02a9cd6e-067c-4878-8700-e90278b71965`.

The latest emulator checks passed: 11 rules tests, 14 integration tests, and 10 browser tests. `firebase deploy --only firestore:rules,firestore:indexes --project oscp-notes --non-interactive` succeeded. No note documents were modified by deployment.

Production frontend: https://oscp-exam-notes.vercel.app

Vercel deployment `dpl_FsD68X8a6aGu7TP45GfidjBcPnVP` completed with status READY. The existing `perrymikes-projects/oscp-exam-notes` project uses the six production Firebase environment variables listed above. The build ran `npm ci`, TypeScript checking, Vite, and PWA generation successfully. Firebase authorized domains now include `oscp-exam-notes.vercel.app`, preserving the previous entries.

Live Chrome verification: study plan, walkthrough library, and sign-in page returned HTTP 200 and rendered their expected headings. Bashed loaded 11 code blocks and 11 image elements; the first remote screenshot loaded successfully. Article JSON returned HTTP 200, the reader fit a 390px mobile viewport, and no browser runtime errors were observed. Authenticated note creation/sync/export still needs a check using the owner's notebook account; deployment does not provision or change account passwords.

The first repository upload was blocked by Vercel's commit-author membership check. The successful deployment used a clean source package of the tracked worktree files through the authenticated Vercel account, without changing Git authorship. Future Git-triggered deployments require an authorized Git author. The source remains on local branch `codex/oscp-notebook`; this deployment did not push or merge it.

Vercel CLI and the Codex Vercel plugin are installed. The Vercel MCP entry exists, but its separate OAuth connection has not been verified; CLI deployment does not depend on it.
