# oscp-exam-notes

A week-by-week OSCP practice ladder built from the LainKusanagi OSCP-like list, ordered easiest to hardest, with at least 2 hours of practice per week.

- Tick off boxes as you root them.
- Every box links to a recognised walkthrough (0xdf, IppSec, OffSec official, VulnHub, community GitHub write-ups). HackTheBox boxes with an IppSec video show his chapter outline inside the app.
- Each week has a notes editor with headings, lists, code blocks for commands, and screenshots (paste, drag or the Image button).
- **All notes** lists every week you've written up, searches across notes, commands and box names, and exports everything as one Markdown file.

It's a static site: `index.html` plus `firebase-config.js`. Nothing needs building.

## Where notes are saved

| Situation | Where notes go |
|---|---|
| `firebase-config.js` left as `null` | This browser only (local storage) |
| Firebase configured, not signed in | This browser only |
| Firebase configured, signed in with Google | Your Firebase project, synced on every device |

The first time you sign in, notes already written in that browser are copied up to Firebase. A week that already exists in Firebase is never overwritten.

Screenshots are stored as Firestore documents (each one shrunk to under 1 MiB), so you don't need Firebase Storage or a paid plan.

## Set up Firebase (about 10 minutes)

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add project**. Google Analytics isn't needed.
2. **Build → Authentication → Get started → Sign-in method**: enable **Google**.
3. **Build → Firestore Database → Create database**: choose **production mode** and a nearby location (for Singapore, `asia-southeast1`).
4. **Firestore Database → Rules**: replace everything with the contents of [`firestore.rules`](firestore.rules). Put your Gmail address on the email line and remove the `//` in front of it, then click **Publish**.
5. **Project settings (gear icon) → Your apps → Web (`</>`)**: register an app (Firebase Hosting isn't needed), copy the `firebaseConfig` object, and paste it into [`firebase-config.js`](firebase-config.js) as `window.FIREBASE_CONFIG = { ... };`.
6. **Authentication → Settings → Authorized domains**: add your Vercel address, for example `oscp-exam-notes.vercel.app`.
7. Commit and push. Vercel redeploys on its own.

Open the site, click **Sign in with Google**, and your notes sync from then on.

## Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `Perryong/oscp-exam-notes`.
2. Keep the defaults. There's no build command or framework, and the output is the repo root.
3. Click **Deploy**. Every push to `main` redeploys.
