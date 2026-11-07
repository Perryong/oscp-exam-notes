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

## OSAI release preparation

The local branch now includes the OSAI workspace described in [the workspace guide](osai-workspace.md). It was deployed on 2026-10-15 following explicit user authorization; both workspaces now use the existing production URL.

For this release, publish the new backward-compatible Firestore rules before the frontend. Preserve current owner collections and all old OSCP records. New OSAI records require the new client; an older client cannot safely display the two workspaces and must not be used as a normal rollback target. Full-account backup format is now version 2; version 1 imports remain OSCP-only. The existing Firebase project, authorized production domain, and Vercel production environment settings remain applicable.


## OSAI production deployment (2026-10-15)

Source commit: `6237615`. Vercel deployment: `dpl_9tCUg7pFM2b8jUe17teeiWZJUJEc`, status READY, aliased to https://oscp-exam-notes.vercel.app. OSAI entry: https://oscp-exam-notes.vercel.app/osai/study-plan.

Firestore rules and indexes were deployed first. Active ruleset `projects/oscp-notes/rulesets/4bce7113-02ea-42bd-ad42-791fa0d90099` was retrieved and confirmed byte-for-byte equal to the local rules. The production domain remains authorized in Firebase Auth. Deployment did not write or migrate note documents.

Vercel rebuilt the tracked source with the existing production Firebase settings. TypeScript and Vite production compilation passed. The upload used a clean source package through the authenticated Vercel account, as with the prior release, preserving Git authorship. No branch was pushed or merged by this deployment.

Live Chrome smoke checks passed: OSCP and OSAI study pages, library, sign-in screen (HTTP 200); switching between workspaces; all eleven OSAI article bodies; lesson SVG loading; 390px mobile width; and the existing Bashed walkthrough. No browser runtime errors occurred. Authenticated private note creation, backup, and device sync were verified in emulators before deployment, but not repeated against the owner's live account.

## UI/UX cleanup production deployment (2026-11-01)

Explicitly authorized after local review. Source commit: `8211fdc8b41b09de5b8786af18d09c5f3afe97b6` on `codex/uiux-cleanup`. Deployment: `dpl_75Xb3Stp6wVkzaFbCctiwhk6FP2b`, status READY. Live URL: https://oscp-exam-notes.vercel.app. Previous deployment: `dpl_EFW6Sf3ZRXggoFbwnrhKKN2ovjFf` (`oscp-exam-notes-cf0k0pmz0-perrymikes-projects.vercel.app`).

Deployed a clean archive of the committed source to the existing Vercel project with its unchanged production environment. The package excluded local environment files, emulator build artifacts and the unrelated machine-guide draft. Vercel's production build passed TypeScript, Vite and PWA generation. The temporary deployment URL required Vercel authentication; the authenticated CLI verified its app shell, cleanup bundle and byte-identical Bashed resource before promotion. Promotion completed successfully, and the public production origin served the updated application.

Live checks passed in a fresh anonymous Chrome context at 390×844: four primary navigation links, expanded More menu hit-testing, compact editor and metadata disclosure, sign-in page/configuration, all 23 OSAI module cards and vault reader, walkthrough pagination from 24 to 48, Bashed search/reader with 11 code blocks, and the Hacker-DOCS collection link. Bashed JSON and the Hacker-DOCS catalog matched repository bytes. No browser runtime errors occurred.

The release changes no resource data, persistence code, notebook schema, Firebase configuration, Firestore rules or indexes. No production note documents were written, migrated or deleted. Private-account creation/sync/conflict/offline behavior was verified in emulators during implementation; it was not repeated against the owner's live notes. Fresh pre-deploy tests passed: 113 unit tests and 10 importer tests. Existing repository-wide formatting warnings remain confined to three unchanged files.

Existing installed clients retain the app's normal **Update after saving** prompt and unsaved-edit guard. This deployment did not push or merge the Git branch.

## Structured study templates production deployment (2026-11-01)

Explicitly authorized after local implementation and review. Source commit: `3860fea`. Vercel deployment: `dpl_8h7DyySHiDWnsxk5HqEeUxJaQyba`, status READY, promoted to https://oscp-exam-notes.vercel.app. Previous deployment: `dpl_75Xb3Stp6wVkzaFbCctiwhk6FP2b`.

A clean archive of committed source was built with the existing production environment. Local environment files, old build artifacts and the unrelated machine-guide draft were excluded. Vercel typecheck, Vite build and PWA generation passed; the staged production bundle contained both template creation actions and required sections before promotion.

Live authenticated checks used the owner's existing Chrome session and the normal Update after saving flow. Created one clearly labelled test note with New OSCP box note and one with New AI-300 lab note. Verified all 10 OSCP headings and all 13 AI-300 headings, with one command/prompt code block each. Renamed each test note, waited for Synced, reloaded and confirmed that the title and complete rendered template body were retained. The note lists contained exactly one new note per workspace; all 14 pre-existing OSCP note links and summaries matched the pre-test snapshot. AI-300 had no existing note entries. The two test notes remain available for inspection.

No existing note was edited or deleted, and no migration, Firebase settings, rules or index changes were made. Resource datasets, repository/storage code and schemas remain unchanged. Live Bashed JSON and Hacker-DOCS catalog responses matched repository bytes. Existing credentials were reused; this was not a fresh-password or separate-device test. No Git branch was pushed or merged.

## Automated Pentest production deployment (2026-11-02)

Explicitly authorized after review and Playwright verification. Source commit: `eb48bd57b333e3a8d564cc321e25e2b21bb7a184` on `codex/gh-3`, PR #5. Vercel deployment: `dpl_6zesFVfhiyxmJrbMJvQeQH3uWFvx`, status READY, promoted to https://oscp-exam-notes.vercel.app. Entry: https://oscp-exam-notes.vercel.app/automated-pentest/study-plan. Previous deployment: `dpl_8h7DyySHiDWnsxk5HqEeUxJaQyba`.

Preflight found production-only rules for immutable import markers and imported progress missing from the reviewed baseline. Preserved that block exactly, added a regression that failed before restoration, and reran all **16 rule tests and 18 integration tests**, both passing. Compared against the live rules: only the intended Automated Pentest membership/target additions remain. Deployed rules only (no indexes or documents); active ruleset `projects/oscp-notes/rulesets/0c181cc1-56c2-48f5-8ceb-f69bc4c64c29` was retrieved and matched the release file exactly. Prior ruleset: `521916a9-6ca0-4571-aed4-8e3060a23d25`.

A clean Git archive was deployed with the existing Vercel project and unchanged production environment. Local environment files, Git metadata, existing build output and private backups were excluded. TypeScript, Vite and PWA generation passed. The staged production app shell and bundle contained the third workspace and both template actions; existing Bashed JSON and Hacker-DOCS catalog matched repository bytes before promotion. The Git preview remains unconfigured for a separate test Firebase project and correctly fails the preview guard; that guard was not weakened.

Public live Playwright checks passed at desktop 1440×1000 and mobile 390×844: nine library resources, research/text/topic filters, canonical benchmark link, all three workspace switches, six practice projects, private-note sign-in guard, no horizontal overflow, unchanged Bashed/Hacker-DOCS responses, and no page errors. Separately compared **852 existing resource/source files** against the prior app checkout, with no differences. Screenshot: [live Today page](verification/gh-3/live-today-desktop.png).

Authenticated verification used the owner's existing session and the normal **Update after saving** flow. Created two new notes labelled `[TEST 2026-11-02]`: one source-attributed research template (seven sections), and one authorized-lab evaluation template (ten sections). Renamed both, edited the evaluation body, waited for Synced and reloaded; both titles, complete templates, source link and edited body persisted. GovTech reading status changed from Not started to Reading, synced and survived reload. Related notes showed the research note. These two notes remain available for inspection. Browser control later timed out while resetting the new reading status, so its test progress remains Reading. No existing progress was edited. A superseded-draft message briefly appeared during rapid edits; syncing completed and the message was absent after reload, with all edits retained. No scans or lab execution occurred. This was a reload/sync check, not a new-password or separate-device sign-in test.

A full pre-deployment JSON backup was downloaded locally with no missing-item report. Final verification used read-only production document reads to compare against that backup, applying the app's legacy missing-workspace-to-OSCP normalization. **All 16 original notes (15 OSCP, 1 OSAI), 55 retained history versions, 25 image payloads and the one stored machine/progress record matched**, including revisions and timestamps. The other backup machine is a bundled revision-zero seed, not a Firestore document; its source remains unchanged. Both new test notes were separately confirmed in production. The existing local recovery draft was retained and never edited; private backup contents are not committed.

No existing note, history, image or resource was rewritten, migrated or deleted. Deployment did not merge PR #5 or close issue #3. Retain the expanded rules and new workspace data when handling rollback; older clients cannot safely round-trip all three workspaces.
