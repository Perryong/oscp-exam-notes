# oscp-exam-notes

A week-by-week OSCP practice ladder built from the LainKusanagi OSCP-like list, ordered easiest to hardest, with at least 2 hours of practice per week.

- Tick off boxes as you root them.
- Every box links to a recognised walkthrough (0xdf, IppSec, OffSec official, VulnHub, community GitHub write-ups). HackTheBox boxes with an IppSec video show his chapter outline inside the app.
- Each week has a notes editor with headings, lists, code blocks for commands, and screenshots (paste, drag or the Image button).
- **All notes** lists every week you've written up, searches across notes, commands and box names, and exports everything as one Markdown file.
- **Cheat sheet** opens a searchable reference built from the [oscp_cheat_sheet_2025](https://github.com/Perryong/oscp_cheat_sheet_2025) repo: 19 sections (enumeration, reverse shells, privesc, Active Directory, tunnelling, and more), with collapsible sections and copy buttons on code blocks.

It's a static site: `index.html` plus `firebase-config.js`. Nothing needs building.

## Where notes are saved

Notes and screenshots are stored in the Firebase project **oscp-notes**, using Firebase Authentication (email and password) and Cloud Firestore.

| Situation | Where notes go |
|---|---|
| Signed in | Firestore, under `users/<your uid>/`, synced on every device |
| Not signed in | This browser only (local storage) |

The first time you sign in, notes already written in that browser are copied up to Firestore. A week that already exists in Firestore is never overwritten.

Data layout:

- `users/{uid}/notes/week-{n}`: `html`, `text` (for search), `week`, `updatedAt`
- `users/{uid}/images/{id}`: `data` (the screenshot as a base64 data URL, under 1 MiB), `createdAt`

Screenshots are Firestore documents, so the project doesn't need Cloud Storage or a paid plan. The rules in [`firestore.rules`](firestore.rules) only let a signed-in user read and write their own `users/<uid>/` data, and they check every field.

## One-time Firebase setup

The web app is already registered in `oscp-notes`, and its config is in [`firebase-config.js`](firebase-config.js). To finish, run this once on your own computer from the repo root:

```bash
bash setup-firebase.sh
```

It does four things:

1. Signs you in to the Firebase CLI (`npx -y firebase-tools@latest login`) and selects `oscp-notes`.
2. Uses the existing `(default)` Firestore database, or creates one (Standard edition, `asia-southeast1` Singapore).
3. Tests the security rules in the Firestore emulator ([`tests/rules.test.mjs`](tests/rules.test.mjs)). This needs Java 21 or newer (`brew install openjdk@21`).
4. Turns on Email/Password sign-in and deploys the rules (`deploy --only auth,firestore`).

Then open the site, enter your email and a password, and press **Create account**.

**Recommended:** once your account exists, stop anyone else from signing up. In the Firebase console, go to **Authentication → Settings → User actions** and untick **Enable create (sign-up)**.

To rerun only the rules tests:

```bash
npm --prefix tests install
npx -y firebase-tools@latest emulators:exec --only firestore "npm --prefix tests test"
```

## Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `Perryong/oscp-exam-notes`.
2. Keep the defaults. There's no build command or framework, and the output is the repo root.
3. Click **Deploy**. Every push to `main` redeploys.

## Firebase agent skills

The Firebase agent skills are installed in `.agents/skills` (with Claude Code links in `.claude/skills`), via `npx skills add firebase/agent-skills --agent=codex`. Use them for any Firebase work on this repo.
