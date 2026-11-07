# Implementation review — personal OSCP notebook

Date: 2026-10-15. Branch: `codex/oscp-notebook`. Implementation reviewed at `927d380`, against base `6a77bd8`.

One independent reviewer inspected the full branch, spec, plan, ledger, and durability edge cases. It found three Critical issues, five Important issues, and two Minor issues. The author accepted the eight substantive findings and completed one regression-tested fix pass. No second review was requested, following the approved Superpowers inline workflow.

## Findings resolved

| Finding | Resolution and regression evidence |
|---|---|
| History restore discarded pending edits | Flush/guard live edits, then atomically archive the displaced draft before replacement. RecoveryPanel regression failed before and passes after. |
| Older backup could acknowledge newer unexported drafts | Capture acknowledgment with each blob; the download UI writes only that artifact's revisions. Export ownership regression failed before; UI regression verifies the cross-tab case. |
| Unsupported link paste could lose unsaved text | Apply one URI policy to parser/autolinker and validation, preserve unsupported links as text; retain raw live document for error export and register navigation protection. Parser and editor regressions failed before and pass after. |
| Cached queries could certify empty exports/downloads | Server-only reads for backup collections, history and offline downloads. Local fallback is explicitly incomplete. Offline regressions failed before and pass after. |
| Historical seed-machine association omitted | Collect dependencies across current/history/recovery notes and validate complete exports. Historical-only association regression failed before and passes after. |
| Recovery screenshots lost after backup import/export | Structured, validated recovery records with remapped IDs, local recovery restoration and image dependency collection. Round-trip plus retry regression failed before and passes after. |
| Durable stale-tab copy blocked navigation indefinitely | Separate successful recovery persistence from failure; allow navigation and provide reload action with editing disabled. Regression failed before and passes after. |
| Custom machines lacked week/tags | Add validated controls and links from assigned study weeks. Regression failed before and passes after. |

The fix pass exposed a browser regression: Tiptap `setEditable` emits an update by default, causing a stale document write while resolving a conflict. Calling it with `emitUpdate=false` restored the two-device test; the full suite then passed.

## Final validation

- Unit: **56/56**, 19 files.
- Firestore rules: **11/11**.
- Emulator integration: **14/14**, 5 files.
- Development browser: **8/8**.
- Built production-preview browser: **4/4**, including offline reload and mobile/desktop layout.
- Typecheck, build, formatting, and whitespace checks: passed.
- Runtime dependency audit from the same unchanged lockfiles: zero reported vulnerabilities.

Commands: `npm test`, `npm run format:check`, `VITE_FIREBASE_MODE=emulator npm run build`, and Java-21 `firebase emulators:exec` running rules, integration, development-browser and release suites. Total: **93 passing tests**. Local emulator project only. No live deployment, push or merge.

## Deferred minors

- Topics currently includes machine notes; standalone-note filtering remains a follow-up.
- History list refreshes on note mount; refreshing on opening/saving remains a follow-up.

## Limits of this review

Live Firebase edition/Auth/rules and actual Vercel deployment/domain migration were not verified. Firebase CLI authentication is required. Destructive image cleanup and bundle splitting remain deferred by design. OS-level IME, mobile keyboard and screen-reader behavior still require manual testing; browser text insertion does not establish that coverage.

## Rulings I made

These are all ledger rulings, in their original order. Earlier decisions remain part of the record even where the final fix pass improves their implementation.

- Ruling: Work in the approved plan's isolated worktree without another permission prompt — approved execution includes isolation — no main changes.
- Task 1: Ruling: Dependencies installed together to avoid repeated slow registry resolution; versions locked — no runtime scope change. Cost: larger first install.
- Task 1: Ruling: Live Firebase inspection returned authentication required. Continue local Standard-edition emulator implementation; production verification remains blocked until CLI login. Cost: live project incompatibility must be checked before deploy.
- Task 1: Ruling: Use installed Chrome for Playwright rather than downloading another browser — same browser-engine checks; CI needs Chrome or PLAYWRIGHT_CHANNEL override.
- Task 1: Ruling: Existing port 8080 is occupied; move this project's emulator to 8180 and Auth to 9199, leaving the other process untouched — task 5 configuration brought forward.
- Task 3: Ruling: Keep acknowledged draft rows with pending=false to retain local revision continuity; listDrafts exposes pending rows only — prevents stale tabs restarting revisions. Cost: small local metadata retention.
- Task 4: Ruling: Use real keyboard insertion in browser tests rather than replacing ProseMirror's root DOM via fill; root replacement bypassed its document structure. Test waits for committed IDB content before reload. Cost: browser tests model supported editor input, not arbitrary DOM replacement.
- Task 4: Ruling: Draft export available during local-save errors; screenshot completion after unmount persists against its originating draft. Local demo is isolated under demo-local and never syncs.
- Task 5: Ruling: Validate screenshot ID lists using join/split round-trip equality plus a bounded ASCII regex, because 100 individually expanded predicates exceed Firestore's 1000-expression budget. Emulator tests reject nonstrings, separators, duplicates, empty/long IDs, and oversized lists; maximum supported lists pass. Cost: depends on documented rules List/String operations.
- Task 6: Ruling: Browser conflict scenarios depend on account and notebook routes from Tasks 7–8; carry that browser gate into Task 8. Coordinator tests run now against IndexedDB plus mocked cloud (5) and real emulator transactions (2). Cost: UI wiring verification occurs after routes exist.
- Task 7: Ruling: Device-data clearing uses a shared Web Lock held by each tab and an exclusive nonblocking clear lock; clients without Web Locks must retain device data. Recovery drafts block clearing until resolved/exported. Cost: conservative clearing availability.
- Task 8: Ruling: Permanent deletion writes an immutable purgedNotes marker atomically, preventing an old base-zero retry from resurrecting the ID. Concurrent pending local edits move to recovery storage during cache cleanup. Cost: small permanent marker per purged note.
- Task 8: Ruling: Firestore history rules can reject a racing transaction before the SDK retries its precondition. On permission/aborted errors, reread and return conflict only if the revision changed; otherwise propagate the failure. Concurrent integration test failed before this fix and passes after.
- Task 8: Ruling: Clean editors refresh from newer snapshots; once typing begins, defer replacement. An asynchronous refresh rechecks the edit guard before applying. Avoid state updates during input capture, which reset controlled input before change handling in the browser test. Cost: edited views may require explicit conflict/reopen to load newer cloud text.
- Task 8: Ruling: Removed external font stylesheet import to avoid network-dependent page loading; system font fallbacks retained. Cost: typography differs when preferred fonts are absent.
- Task 9: Ruling: Legacy conversion uses an inert DOM parser, a formatting allowlist, and the editor schema; unsupported originals are preserved in sourceHtml. Inline images use content-digest IDs. Oversized source notes stop preview with an explicit error and remain exportable. Cost: users must split oversized sources manually.
- Task 9: Ruling: Integration config deduplicates Firebase SDK imports to the root version; legacy standalone rule tests retain their separate locked SDK. Mixing test-directory and app Firestore instances caused false adapter failures. Cost: integration tests intentionally test the app SDK only.
- Task 10: Ruling: Persist original import IDs, revisions/timestamps and mapping as portable source metadata, rather than duplicating the entire imported image payload inside each later backup. Cost: original content is represented by the remapped current/history records, not a byte-identical copy of the input file.
- Task 10: Ruling: Backup validation rejects IDs shared across entity kinds to avoid ambiguous remapping. App-generated UUID/digest/seed IDs are distinct. Cost: hand-edited backups with cross-kind ID reuse must rename those IDs before import.
- Task 11: Ruling: First-ever offline navigation cannot load an uninstalled shell; explain the online-first requirement in Settings/docs. Once installed, the service worker precaches only static app assets, never authenticated network responses. Cost: first use requires connectivity.
- Task 12: Ruling: Separate production-preview browser configuration runs offline/deployment tests against dist; the default browser suite uses Vite development. Repository-file exclusion is asserted only on production output because development intentionally serves source files. Cost: both browser commands are required for release verification.
- Task 12: Ruling: Vercel build-time guards read VERCEL_ENV directly and require test mode/separate project for previews. setup-firebase.sh only validates an existing confirmed Standard database, stops on CLI/JSON failures and never creates one automatically. Auth setup is documented in Console. Cost: manual provisioning is required.
- Task 12: Ruling: Pinned @grpc/grpc-js 1.14.6 in root and legacy-test dependency trees to remove known transitive advisories without downgrading Firebase. Runtime audit reports zero vulnerabilities; rules/integration/browser suites passed after the override. Cost: override must be revisited with future Firebase upgrades.
- Task 12: Ruling: Kept embedded reference data intact and retained the current 1.7 MB JavaScript bundle warning rather than splitting subsystems during migration. Cost: initial load is about 506 KB gzipped, then shell-cached offline.
- Final: Ruling: Live Firebase edition/Auth/rules and Vercel/domain migration remain unverified — no authenticated production access or deployment performed, so release documentation keeps these explicit prerequisites — cost: deployment remains a separate verification step.
- Final: Ruling: Destructive screenshot garbage collection remains deferred by design — preserve recoverable screenshot bytes — cost: unused images consume storage.
- Final: Ruling: Further bundle splitting remains deferred under the measured bundle-size decision — no new measured regression — cost: initial download remains about 506 KB gzip.
- Final: Ruling: OS-level IME/mobile-keyboard/screen-reader behavior remains unverified — existing desktop browser text and responsive layout checks are narrower — cost: manual accessibility and device testing is still needed.
