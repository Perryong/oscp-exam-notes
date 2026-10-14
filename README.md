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
