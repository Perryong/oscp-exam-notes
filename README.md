# OSCP Fieldnotes

A personal OSCP study notebook: preserved study ladder and cheat sheet, machine progress, rich notes and command blocks, screenshots, private device sync, conflict recovery, history, migration, JSON backups and Markdown exports.

The app is a React/Vite static SPA deployed to Vercel. Firebase Authentication and Standard-edition Cloud Firestore provide private cloud storage. IndexedDB saves drafts first; online transactions compare revisions before publishing changes. Offline edits remain local until reconciliation.

## Local development

Use Node 24 and Java 21+ for Firebase emulators.

```sh
npm ci
npm --prefix tests ci
cp .env.example .env.local
npx firebase emulators:start --project demo-oscp-notebook --only auth,firestore
# In another terminal:
npm run dev
```

Create an email/password test account in the Auth emulator UI. `/demo` is a local-only editor that needs no Firebase account. Do not use production accounts/data in tests.

```sh
npm test
npm run typecheck
npm run build
npm run format:check
npm run test:emulators
# Build with VITE_FIREBASE_MODE=emulator for the production-preview tests:
VITE_FIREBASE_MODE=emulator npm run build
npx firebase emulators:exec --project demo-oscp-notebook --only auth,firestore 'npm run test:release'
```

Playwright uses installed Chrome; override `PLAYWRIGHT_CHANNEL` if needed. Auth runs on 9199 and Firestore on 8180. The production-preview tests run on 4174; development browser tests use 4173.

## Deploy and migrate

Read [deployment instructions](docs/deployment.md) before publishing. Enable Email/Password and provision your personal account in Firebase Console. Preview deployments require a separate Firebase test project. Production and preview web configurations are build-time environment variables; no Admin SDK credentials belong in the frontend.

Preserve the old origin and export browser-only notes before changing domains. See [legacy export instructions](docs/legacy-export.md). Imports are explicit and preserve source HTML. JSON backups include current notes, trash and retained history; Markdown ZIPs contain readable notes and relative image files. Missing data produces an explicitly partial export.

Use Settings → Download for offline before relying on an offline session. The first visit requires a connection. Browser storage can be evicted; maintain cloud sync and portable backups. Screenshot bodies are retained even after notes are deleted; Settings can calculate their total stored size on request.

The design and implementation plan live under `docs/superpowers/`. No live Firebase or Vercel deployment is performed by building locally.

## HTB Academy schedule and calendar

The public [Getting Started study guide](public/getting-started.html) covers all 23 module lessons with original explanations, 20 command/code blocks, practice checkpoints and four credited course figures. Open `/getting-started.html`, or use the links on Today and the HTB calendar. Image provenance is recorded in [the source manifest](public/assets/getting-started/sources.json). Personal note contents and progress are not included in this reference.

Open `/htb-study` for the full 51-week plan or `/calendar?week=1` for week and month views. The OSCP Today page and More menu link to both. The original progress snapshot (7 November 2026), module allocations, checkpoint weeks and 10-hour weekly budget are preserved. This is a planning baseline, with no automatic HTB account synchronization.

Signed-in module completion uses the existing revisioned notebook sync and backup system. Signed-out completion uses the original browser progress keys and remains separate from cloud progress. Course progress records are hidden from the machine ladder and note attachment picker. Weekly notes use weeks 201–251, distinct from the machine ladder, and include goals, attempts, lessons, blockers, progress and the Penetration Testing Process stages. Opening a week reuses its existing active note, including an explicitly imported legacy note; trashed and permanently deleted records are protected.

If a previous site's weekly note exists locally or in the current Firebase project, import it through Settings before opening that week's new note. Original data is not migrated or overwritten automatically. Old `/index.html?htb-week=N` links open the corresponding calendar week. The Learning Process reference, testing guide and 12 source diagrams remain available at `/learning-process.html`.

The superseded standalone schedule source is retained at `tests/fixtures/legacy-htb-study-schedule.html`; `/htb-study-schedule.html` is now a React redirect. Legacy calendar security rules and their owner-access tests are retained alongside the React notebook rules when integrating main.
