#!/usr/bin/env bash
# One-time Firebase setup for the oscp-notes project.
# Run it on your own computer from the repo root:   bash setup-firebase.sh
#
# It signs you in to the Firebase CLI, makes sure a Firestore database exists
# (Standard edition, Singapore), tests the security rules in the local emulator,
# then turns on Email/Password sign-in and deploys the rules.
# The web app is already registered; its config is in firebase-config.js.
set -euo pipefail
cd "$(dirname "$0")"

FB="npx -y firebase-tools@latest"
PROJECT="oscp-notes"
LOCATION="asia-southeast1"   # Singapore

echo "1/4  Signing in to Firebase (a browser window opens if you aren't signed in yet)"
$FB login
$FB use "$PROJECT"

echo "2/4  Checking for a Firestore database"
has_default_db() {
  $FB firestore:databases:list --project "$PROJECT" --json 2>/dev/null | node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
      try { const dbs = JSON.parse(s).result || [];
            process.exit(dbs.some(d => String(d.name).endsWith("/databases/(default)")) ? 0 : 1); }
      catch (e) { process.exit(1); } });'
}
if has_default_db; then
  echo "     Found the (default) database, so using it."
else
  echo "     Creating a Standard edition database in $LOCATION (Singapore). Its location can't be changed later."
  $FB firestore:databases:create "(default)" --location "$LOCATION" --edition standard --project "$PROJECT"
fi

echo "3/4  Testing the security rules in the Firestore emulator"
java_major=$(java -version 2>&1 | sed -nE 's/.*version "([0-9]+).*/\1/p' | head -1 || true)
if [ -z "${java_major}" ] || [ "${java_major}" -lt 21 ]; then
  echo "     The emulator needs Java 21 or newer, and it isn't installed."
  echo "     Install it with:  brew install openjdk@21   then run this script again."
  read -r -p "     Deploy the rules without testing them? [y/N] " answer
  [[ "${answer:-}" =~ ^[Yy]$ ]] || exit 1
else
  npm --prefix tests install --no-audit --no-fund --silent
  $FB emulators:exec --only firestore --project "$PROJECT" "npm --prefix tests test"
fi

echo "4/4  Turning on Email/Password sign-in and deploying the Firestore rules"
$FB deploy --only auth,firestore --project "$PROJECT"

echo
echo "Done. Open the app, press Create account, and your notes sync to Firebase."
echo "Then stop strangers creating accounts: Firebase console > Authentication > Settings >"
echo "User actions > untick 'Enable create (sign-up)'."
