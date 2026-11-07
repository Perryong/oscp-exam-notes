#!/usr/bin/env bash
# Validate the existing project and deploy only reviewed rules/indexes.
set -euo pipefail
cd "$(dirname "$0")"
PROJECT="${FIREBASE_PROJECT_ID:-oscp-notes}"
FB=(npx --no-install firebase)
"${FB[@]}" login
listing=$(mktemp)
trap 'rm -f "$listing"' EXIT
# A CLI/auth/network failure exits here. It must never be treated as no database.
"${FB[@]}" firestore:databases:list --project "$PROJECT" --json > "$listing"
node --input-type=module - "$listing" <<'JS'
import {readFileSync} from 'node:fs';
const result=JSON.parse(readFileSync(process.argv[2],'utf8'));
if(result.status!=='success')throw Error('Database listing was unsuccessful');
const databases=Array.isArray(result.result)?result.result:result.result?.databases;
if(!Array.isArray(databases))throw Error('Unexpected database listing structure');
const db=databases.find(d=>String(d.name).endsWith('/databases/(default)'));
if(!db)throw Error('Create the default Standard-edition Firestore database in the Firebase console, then rerun. Choose the location deliberately.');
const edition=db.databaseEdition||db.edition;
if(edition!=='STANDARD')throw Error('Standard edition was not confirmed. Inspect the project in the console before continuing.');
console.log('Confirmed default Standard-edition database.');
JS
java -version
npm ci
npm --prefix tests ci
"${FB[@]}" emulators:exec --project demo-oscp-notebook --only auth,firestore "npm run test:rules && npm run test:integration"
echo 'Enable Email/Password in Firebase Console > Authentication > Sign-in method.'
echo 'Provision your personal account in the console and add your production/test domains.'
read -r -p "Deploy the tested Firestore rules and indexes to $PROJECT? [y/N] " answer
[[ "${answer:-}" =~ ^[Yy]$ ]] || exit 0
"${FB[@]}" deploy --only firestore:rules,firestore:indexes --project "$PROJECT"
