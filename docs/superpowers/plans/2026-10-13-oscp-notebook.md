# Personal OSCP Notebook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-file app with a personal OSCP notebook that preserves existing study material and safely synchronizes notes, screenshots, and progress between devices.

**Architecture:** A React/Vite browser application on Vercel accesses Firestore through Firebase Authentication and owner-only rules. UID-scoped IndexedDB drafts persist before online revision-checked transactions; the service worker caches only the application shell. Existing cloud collections remain readable for migration and rollback.

**Tech Stack:** React, TypeScript, Vite, React Router, open-source Tiptap, Firebase modular browser SDK, IndexedDB through `idb`, `fflate` for ZIP export, Vitest/Testing Library, Playwright, Firebase emulators. Use `vite-plugin-pwa` with an explicit update prompt. Select mutually compatible stable package versions when executing Task 1 and commit the lockfile; no paid editor extensions, state framework, server runtime, or storage service.

**Spec:** [Approved design](../specs/2026-10-13-oscp-notebook-design.md).

## Global Constraints

- Keep the existing `oscp-notes` Firebase project and default database, subject to read-only verification of its edition and configuration before implementation of database access.
- Keep compressed screenshots in Firestore. Each account can access only its own data.
- Keep legacy `users/{uid}/notes/week-{n}` and `users/{uid}/images/{id}` intact during migration. No dual-writing new notes into the legacy schema.
- Cap the combined UTF-8 content and text payload at 600 KiB and independently bound metadata.
- New uploads have a 20 MiB input-file limit and a 25-megapixel decoded-image limit before canvas processing; base64 payload below 1,000,000 bytes.
- Debounce online cloud saves by approximately one second. Retain the latest 20 acknowledged previous versions per note.
- Save states: Unsaved, Saved locally, Syncing, Synced, Conflict, and Save failed.
- Retain image documents in the first release, even after their notes are permanently deleted.
- Preserve weekly notes, ladder, walkthrough links, chapter outlines, cheat sheet, and completion flags. Never invent a machine association for an existing weekly note.
- Publish only `dist`. Preview environments must not default to production Firebase. Never put admin credentials in browser code.
- Shared editing, AI, public publishing, schedule redesign, arbitrary file uploads, and destructive image cleanup are excluded.

## Review Focus

- Account changes during an outstanding save must never upload or expose one account's draft under another UID (Tasks 3, 6, 7).
- A lost acknowledgment followed by further edits must not duplicate history or clear the newer draft (Tasks 5, 6).
- Input methods and commands containing tabs, newlines, non-ASCII text, and backticks must survive editing and export (Tasks 2, 4, 10).
- Browser quota exhaustion, cache eviction, and missing screenshots must produce recoverable or explicitly incomplete results, never false success (Tasks 3, 4, 10, 11).
- Repeated migration after a destination was deleted, or after the source domain changed, must not resurrect data or imply inaccessible local notes were imported (Tasks 9, 12).

## Execution setup and file map

This is one integrated product migration, with sequential dependencies rather than independent subsystem projects. Every task has its own checks and commit. At execution time use the worktree skill to select/create an isolated checkout; read applicable repository instructions and the approved spec. Do not start implementation or spawn agents during plan preparation.

| Files | Responsibility |
| --- | --- |
| `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `index.html` | Build and test entry points |
| `src/main.tsx`, `src/app/{App,AccountPanel}.tsx`, `src/app/styles.css` | Routes, account lifecycle, responsive shell |
| `src/reference/{ladder,cheatsheet,machine-ids}.json`, `src/reference/StudyPlan.tsx`, `src/reference/CheatSheet.tsx` | Preserved reference content and stable identities |
| `src/notebook/{model,validation,repository,search}.ts`, `src/notebook/{NotebookView,MachineView,TrashView}.tsx` | Data contracts, collection views, search and deletion |
| `src/editor/{schema,templates,images}.ts`, `src/editor/{NoteEditor,ScreenshotNode}.tsx` | Editor, conversions, compressed image handling |
| `src/persistence/{local,sync,offline}.ts`, `src/persistence/{ConflictPanel,RecoveryPanel}.tsx` | Local drafts, coordination, sync and recovery |
| `src/firebase/{client,auth,notes,machines,images,migration}.ts` | Concrete Firebase operations, no generic backend framework |
| `src/transfer/{legacy,backup,markdown}.ts`, `src/transfer/TransferPanel.tsx` | Import previews, resumable migration, portable export |
| `src/settings/Settings.tsx`, `src/pwa.ts` | Offline download, storage totals, clear-device-data, update prompt |
| `tests/fixtures/`, `src/**/*.test.ts`, `src/**/*.test.tsx`, `tests/*.test.mjs`, `tests/integration/`, `e2e/` | Fixtures, unit/component, rules, integration and browser tests |
| `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `vercel.json`, `.env.example`, `README.md`, `setup-firebase.sh` | Explicit configuration and deployment guidance |

### Shared contracts

Define these in Task 2; later tasks import them rather than re-declaring alternate shapes:

- `NoteContent = {title: string; contentJson: string; text: string; tags: string[]; machineId: string|null; week: number|null; attachmentIds: string[]; schemaVersion: 1; deletedAt: number|null; sourceHtml: string|null}`. `sourceHtml` preserves unsupported imported markup; count it toward the 600 KiB payload budget too.
- `MachineContent = {name: string; platform: string; os: string; tags: string[]; legacyKey: string|null; week: number|null; progress: 'not-started'|'in-progress'|'completed'}`.
- `Saved<T> = {id: string; content: T; revision: number; lastMutationId: string; createdAt: number; updatedAt: number}`. Cloud adapters flatten `content` into allowed document fields and convert Firestore timestamps to/from milliseconds; no server timestamps originate from browser clock values.
- `EntityKind = 'note'|'machine'`; `Draft<T> = {uid: string; kind: EntityKind; id: string; content: T; baseRevision: number; localRevision: number; mutationId: string; modifiedAt: number}`. Revision zero means cloud creation. Each immutable save candidate gets a new mutation ID.
- `SaveResult<T> = {kind:'saved'; value:Saved<T>} | {kind:'conflict'; remote:Saved<T>|null}`; `LocalWriteResult<T> = {kind:'saved'; draft:Draft<T>} | {kind:'conflict'; draft:Draft<T>}`. The latter conflict draft is separately persisted, never a replacement of the winner.
- `ImageRecord = {id:string; data:string}`; `NotebookBundle = {version:1; notes:Saved<NoteContent>[]; machines:Saved<MachineContent>[]; history:Record<string,Saved<NoteContent>[]>; images:ImageRecord[]; legacySources:Record<string,string>; unmatchedProgress:Record<string,unknown>}`.
- `TransferReport = {completed:string[]; failed:{id:string; reason:string}[]; skipped:string[]}`; `OfflineReport = {complete:boolean; missing:string[]; completedAt:number|null}`; `MigrationItem = {id:string; digest:string; source:'cloud'|'browser'|'progress'; destinationId:string; payload:NoteContent|MachineContent}`.
- Persist all IDB keys with UID. Note IDs are UUIDs except deterministic migrated IDs; seed machine IDs live in the committed identity map and never depend on mutable titles at runtime.
- Shared test builders in `tests/fixtures/builders.ts`: `noteContent(overrides?)`, `machineContent(overrides?)`, `draft(overrides?)`, `bundle(overrides?)`, and `imageRecord(overrides?)` return valid instances. Builders supply valid defaults; each test alters only the behavior being checked.

## Task 1: Preserve the reference app inside a buildable shell

**Files:** Create root package/build/test configs, `.env.example`, `src/main.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/reference/*`, `scripts/extract-reference.mjs`, `src/reference/reference.test.ts`, `e2e/reference.spec.ts`, `tests/fixtures/legacy-index.html`; modify `index.html`, `.gitignore`.
**Interfaces:** Consume original `PLAN`, `CHEAT`, `PHASES`, and `platform|name` keys from the legacy page. Produce `ladder`, `cheatsheet`, `machineIds: Record<string,string>`, and `<App />` with reference routes `/study-plan` and `/cheat-sheet`. Export `extractLegacy(html)` from `scripts/extract-reference.mjs`, returning the parsed `PLAN` and `CHEAT` arrays; preserve phase labels as explicit reference constants checked against the legacy fixture.

- [ ] Preserve the original page as a non-public test fixture; record its SHA-256 before changing the root entry point. Inspect project/database read-only using the Firebase skill and CLI listing/get commands for `oscp-notes`; record edition/auth access or an explicit inability to verify. Never interpret a permissions error as a missing database. Local reference work can continue if access is unavailable; production configuration cannot be declared verified.
- [ ] Add minimal tooling and failing reference tests: `expect(ladder).toEqual(extractLegacy(fixture).PLAN)` and `expect(cheatsheet).toEqual(extractLegacy(fixture).CHEAT)`; assert each legacy machine key maps to one unique stable ID and all walkthrough URLs/chapter outlines remain intact. The extractor reads JSON literals, not arbitrary page execution.
- [ ] Run `npm test -- src/reference/reference.test.ts`; expect failure for missing reference modules, not a broken runner. Define `test` as `vitest run` with only unit/component files, `typecheck` as `tsc --noEmit`, `build` as typecheck then Vite, and `test:e2e` as Playwright. Install only the task's dependencies, lock them, and use a supported Node LTS compatible with those packages in `.nvmrc` and package engines.
- [ ] Implement extraction, stable identity mapping, the responsive shell, ladder, walkthrough panel, and cheat-sheet search/copy. Add React Router routes with clear placeholders for later features. Do not load the old Firebase script or auto-migration in the new shell.
- [ ] Run the reference unit test, `npm run build`, and `npm run test:e2e -- e2e/reference.spec.ts`; expect matching source data, working walkthrough/copy controls, and a built `dist/index.html`.
- [ ] Commit task-owned files with `feat: preserve study references in React shell`.

## Task 2: Define notebook data and editor validation

**Files:** Create `src/notebook/model.ts`, `src/notebook/validation.ts`, `src/notebook/validation.test.ts`, `src/editor/schema.ts`, `src/editor/templates.ts`, `src/editor/schema.test.ts`, `tests/fixtures/builders.ts`; update package lock for Tiptap.
**Interfaces:** Produce shared contracts; `validateNote(input: unknown): NoteContent`, `validateMachine(input: unknown): MachineContent`, `decodeEditor(json: string): JSONContent`, `encodeEditor(doc: JSONContent): Pick<NoteContent,'contentJson'|'text'|'attachmentIds'>`, `createMachineTemplate(): JSONContent`.

- [ ] Write failing tests: `expect(() => validateNote(noteContent({text:'你'.repeat(204801)}))).toThrow()`; assert a 614,400-byte combined payload passes and 614,401 fails using otherwise valid content. Assert template headings equal `['Enumeration','Initial access','Privilege escalation','Evidence','Lessons learned']`; unknown node types and `javascript:` links are rejected.
- [ ] Run `npm test -- src/notebook/validation.test.ts src/editor/schema.test.ts`; expect missing validator/schema failures.
- [ ] Implement the shared types and schema version 1. Set metadata limits: title/name 200 UTF-8 bytes, platform/OS 80 each, at most 30 unique tags of 40 bytes each, at most 100 unique attachment IDs of 128 bytes, week null or integer 1–500. IDs are nonempty path-safe strings up to 128 bytes. Plain text and attachment IDs are derived from editor content. Bound `sourceHtml` with content/text in the same 600 KiB budget. Permit only HTTPS/HTTP external links and internal note links; strip active HTML during import and never render preserved source HTML.
- [ ] Run both test files plus `npm run typecheck`; expect all boundary tests pass, including multibyte text, malformed JSON, and schema rejection. Ensure text and code whitespace round-trip unchanged.
- [ ] Commit with `feat: define notebook schema and editor validation`.

## Task 3: Persist drafts before any cloud writes

**Files:** Create `src/persistence/local.ts`, `src/persistence/local.test.ts`; add `idb` and test-only `fake-indexeddb`.
**Interfaces:** Produce `saveDraft<T>(draft:Draft<T>, expectedLocalRevision:number):Promise<LocalWriteResult<T>>`, `listDrafts<T>(uid:string, kind:EntityKind):Promise<Draft<T>[]>`, `acknowledge<T>(candidate:Draft<T>, saved:Saved<T>):Promise<void>`, `putLocalImage(uid:string,image:ImageRecord):Promise<void>`, `getLocalImage(uid:string,id:string):Promise<ImageRecord|null>`, `cacheSaved<T>(uid:string,kind:EntityKind,value:Saved<T>):Promise<void>`, `listCached<T>(uid:string,kind:EntityKind):Promise<Saved<T>[]>`, `clearAccountCache(uid:string):Promise<void>`.

- [ ] Write failing tests: after two competing `saveDraft` calls against local revision zero, `expect(results.map(r=>r.kind).sort()).toEqual(['conflict','saved'])`; the losing text remains in a separate conflict record. Assert acknowledging local revision 1 leaves local revision 2 present, advances its base revision, and does not change its content. Account B's reads must never return account A's draft or images.
- [ ] Run `npm test -- src/persistence/local.test.ts`; expect missing persistence failures.
- [ ] Implement IDB transactions for drafts, conflict drafts, acknowledged documents, images, and offline manifests. Check and increment local revision atomically. On acknowledgment, clear only the exact candidate; rebase its known local successor without discarding it. Unknown independent changes remain conflicts. Reject quota/write failures to callers and preserve the old stored record.
- [ ] Run the test file and `npm run typecheck`; simulate QuotaExceededError and reopen the database to prove committed drafts survive a reload. Assert a failed write never returns `kind:'saved'`.
- [ ] Commit with `feat: persist account-scoped recoverable drafts`.

## Task 4: Build the local editor and screenshot workflow

**Files:** Create `src/editor/NoteEditor.tsx`, `src/editor/ScreenshotNode.tsx`, `src/editor/images.ts`, `src/editor/images.test.ts`, `src/editor/NoteEditor.test.tsx`, `e2e/editor.spec.ts`; modify styles/routes.
**Interfaces:** Consume Tasks 2–3. Produce `<NoteEditor uid={uid} draft={draft} onDraft={callback} />`, `prepareImage(file:File):Promise<ImageRecord>`, and `beforeLeaveEditor():Promise<boolean>`; return false when local persistence has failed. Temporary demo identity is fixed to `demo-local` and never used for Firebase access.

- [ ] Write failing tests: `expect(await beforeLeaveEditor()).toBe(false)` after an injected IDB failure; the editor still contains typed text. Test rejection above `20*1024*1024` input bytes and `25_000_000` decoded pixels, plus compressed payload `>=1_000_000` bytes. Browser test asserts `expect(await codeBlock.textContent()).toBe('whoami\n\tsudo -l\n你好 `test`')` after editing and reopening.
- [ ] Run `npm test -- src/editor` and the focused editor browser test; expect missing editor/image behavior failures.
- [ ] Implement Tiptap formatting, checklists, code-copy, explicit note links, screenshots by ID, paste/drop/file input, and new-note-only templates. Reuse the existing compression sequence where it meets limits. Store image bytes in IDB before inserting its reference. Release decoded bitmaps and object URLs. Retain editor text on every failure; display local save state only after IDB commits.
- [ ] Run editor tests, typecheck, and `npm run test:e2e -- e2e/editor.spec.ts`; test IME composition, keyboard toolbar navigation, mobile pane navigation, same-note route changes, and late image completion after navigating away. A late result must remain attached to its originating draft, never the newly opened note.
- [ ] Commit with `feat: add recoverable note editor and screenshots`.

## Task 5: Enforce authenticated revisioned writes in Firestore

**Files:** Create `src/firebase/client.ts`, `src/firebase/notes.ts`, `src/firebase/machines.ts`, `src/firebase/images.ts`, `tests/notebook-rules.test.mjs`, `tests/integration/cloud.test.ts`, `vitest.integration.config.ts`; modify rules/indexes, `firebase.json`, existing rules tests and both package/lock files.
**Interfaces:** Produce `createFirebaseClient(mode:'production'|'test'|'emulator'):FirebaseApp`, `commitNote(uid:string,draft:Draft<NoteContent>):Promise<SaveResult<NoteContent>>`, `commitMachine(uid:string,draft:Draft<MachineContent>):Promise<SaveResult<MachineContent>>`, `ensureImage(uid:string,image:ImageRecord):Promise<void>`, `loadImage(uid:string,id:string):Promise<ImageRecord|null>`, `listHistory(uid:string,noteId:string):Promise<Saved<NoteContent>[]>`, `pruneHistory(uid:string,noteId:string):Promise<void>`.

- [ ] Read the applicable Firebase/rules skills; follow the rules-author delegation instruction only if that named role is available, otherwise use firestore-rules-creation. Resolve the live edition prerequisite from Task 1. Install/provide supported Java for local emulators; use project `demo-oscp-notebook` consistently in tests, never production. Enable local auth emulator configuration alongside Firestore.
- [ ] Add failing rules and integration assertions: a stale draft returns `kind:'conflict'`; retry of an acknowledged mutation returns the original revision; unauthorized reads/writes fail; malformed/oversize UTF-8 content fails; every replacement's history equals the previous stored note; revision jumps and changed creation timestamps fail. Existing legacy rules tests continue to pass.
- [ ] Run `npx firebase emulators:exec --project demo-oscp-notebook --only auth,firestore "npm run test:rules && npm run test:integration"`; expect new-rule/adapter failures. Root `test:rules` runs both `.test.mjs` files; `test:integration` uses the separate Vitest config. Install both root and existing `tests` package dependencies reproducibly; use compatible Firebase SDK/testing versions and lock both. Pin `firebase-tools` as a root development dependency so later emulator commands use the reviewed version.
- [ ] Implement transactional compare/revision/save and immutable previous-version creation. Use deterministic history IDs from revision numbers; preserve mutation IDs in history so a retry can recognize an accepted mutation even if a later device has already advanced the current note. All reads precede writes. Require matching history in replacement rules via `getAfter`, and validate history against the pre-write note. Allow recovery-import history only by replaying accepted revisions, never a permissive bypass.
- [ ] Enforce UTF-8 limits with `toUtf8().size()` in rules, metadata limits from Task 2, timestamp invariants, owner-only access, create-if-absent images, and default deny. A repeated image ID succeeds only when stored bytes match. Exempt contentJson/text/sourceHtml/image data from single-field indexes. Prune only versions older than the latest 20 after successful acknowledgment; never delete images.
- [ ] Run emulator tests again; expect all legacy/new cases pass, 21 replacements leave 20 previous versions after pruning, and an unknown old retry yields a preserved conflict instead of a new write. Commit with `feat: enforce private revisioned notebook storage`.

## Task 6: Coordinate online sync, conflicts, and device recovery

**Files:** Create `src/persistence/sync.ts`, `src/persistence/sync.test.ts`, `src/persistence/ConflictPanel.tsx`, `src/persistence/RecoveryPanel.tsx`, `tests/integration/sync.test.ts`, `e2e/conflicts.spec.ts`.
**Interfaces:** Consume local/cloud operations. Produce `startSync(uid:string):()=>void`, `syncDraft<T>(draft:Draft<T>):Promise<SaveResult<T>>`, and `resolveConflict(uid:string,kind:EntityKind,id:string,choice:'remote'|'local'|'copy'):Promise<void>`. Copy applies to notes; machines offer remote/local. Recovery submits historical content as a new draft/revision.

- [ ] Write failing tests: an acknowledgment for revision 1 cannot remove pending revision 2; network rejection leaves the draft; a newer remote revision results in `Conflict`; `expect(cloudWritesFor('bob')).toHaveLength(0)` when Alice signs out mid-flight. Simulate lost acknowledgment, another device's later write, and retry; neither duplicate history nor overwritten remote content is allowed.
- [ ] Run `npm test -- src/persistence/sync.test.ts`; expect missing coordinator failures.
- [ ] Implement one-second debounce, per-UID/entity Web Locks, and a UID/session generation token checked before starting work and applying async results. No Web Locks means local drafts remain available but auto-sync requires an explicit single-tab mode; never silently run uncoordinated workers. Upload referenced local images before committing notes. Queue work in IDB while offline; do not rely on Firestore's last-write-wins queue for note replacement.
- [ ] Implement conflict and recovery panels; choosing local rechecks the latest remote revision, choosing remote retains the displaced local copy until resolution is persisted, and copy creates a new note ID. Keep dirty editors untouched by snapshots. Expose all six specified save states and bounded retry with backoff for transient connectivity failures; permission/auth/size failures require action.
- [ ] Run unit, emulator integration, and `e2e/conflicts.spec.ts`; expect safe two-tab and two-context edits, recovery after refresh, and restored versions creating new history. Commit with `feat: synchronize drafts with explicit conflict recovery`.

## Task 7: Connect sign-in and the account lifecycle

**Files:** Create `src/firebase/auth.ts`, `src/app/AccountPanel.tsx`, `src/app/AccountPanel.test.tsx`, `e2e/accounts.spec.ts`; modify `src/app/App.tsx`, `src/firebase/client.ts`, `src/persistence/sync.ts`.
**Interfaces:** Produce `signIn(email:string,password:string):Promise<void>`, `resetPassword(email:string):Promise<void>`, `signOutSafely():Promise<void>`, `clearDeviceData(uid:string):Promise<void>`; the root supplies authenticated UID to all notebook modules.

- [ ] Write failing tests: signed-out users can read the ladder but cannot create cloud notes; invalid credentials retain drafts; account switch never renders the previous notebook; clearing data with unexported pending drafts is blocked. Assert production-project configuration throws when selected for a Vercel preview.
- [ ] Run `npm test -- src/app/AccountPanel.test.tsx`; expect missing lifecycle behavior failures.
- [ ] Implement email/password sign-in and reset, explicit trusted-device persistence choice, listener cleanup, and safe sign-out. Existing accounts are the primary path; document console account provisioning rather than introducing account administration. Stop sync before changing account state; retain pending drafts under their original UID. Clear-device-data coordinates all tabs, terminates the Firebase instance, clears its persistence through the SDK, and then clears local account caches only after sync/export acknowledgment.
- [ ] Run account tests and `npm run test:e2e -- e2e/accounts.spec.ts` under emulators; expect expired-auth recovery, no private-data flash during switching, and safe handling when another tab prevents cache clearing.
- [ ] Commit with `feat: connect private account and cache lifecycle`.

## Task 8: Complete machines, notebook navigation, search, and trash

**Files:** Create `src/notebook/repository.ts`, `src/notebook/search.ts`, `src/notebook/NotebookView.tsx`, `src/notebook/MachineView.tsx`, `src/notebook/TrashView.tsx`, `src/notebook/search.test.ts`, `e2e/notebook.spec.ts`; modify App and StudyPlan.
**Interfaces:** Produce `subscribeNotebook(uid:string,onChange:(notes:Saved<NoteContent>[],machines:Saved<MachineContent>[])=>void):()=>void`, `searchNotes(notes:Saved<NoteContent>[],machines:Saved<MachineContent>[],query:string):Saved<NoteContent>[]`, `trashNote(uid:string,id:string):Promise<void>`, `restoreNote(uid:string,id:string):Promise<void>`, `purgeNote(uid:string,id:string,expectedRevision:number):Promise<void>`.

- [ ] Write failing tests: `expect(searchNotes([updatedSameLengthNote], [], 'new')).toHaveLength(1)` after replacing `old` with `new`; machine progress appears in both views; trashed links display unavailable; a concurrent restore makes permanent deletion fail rather than delete the restored note.
- [ ] Run search tests and focused notebook browser tests; expect missing view/search/delete behavior failures.
- [ ] Implement private listeners and UID-scoped cached views, overlay local drafts, machine creation/editing, weekly associations, note titles/tags, all-notes/topic filters, stable `/notes/:id` URLs, and copyable links. Seed machine records lazily from stable reference IDs using create-if-absent writes. Progress changes use Task 6, not localStorage-only flags.
- [ ] Implement trash/restore through revisioned commits. Permanent deletion requires explicit UI confirmation and an online transaction checking the deleted state/revision; deny further edits to a missing document with a nonzero base revision. Delete history in resumable batches after the note is removed; do not recreate the note on cleanup failure, and keep images. Rules must deny new history for a removed parent. Retry incomplete history cleanup from Settings.
- [ ] Run unit, rules, and notebook browser tests; verify recent local drafts are searchable, incomplete cache status is visible, and no image bodies/history are fetched for ordinary list navigation. Commit with `feat: add machine notebook views search and trash`.

## Task 9: Migrate legacy notes and progress without overwrites

**Files:** Create `src/transfer/legacy.ts`, `src/firebase/migration.ts`, `src/transfer/TransferPanel.tsx`, `src/transfer/legacy.test.ts`, `tests/integration/migration.test.ts`, `tests/fixtures/legacy-data.json`, `scripts/legacy-export.mjs`, `docs/legacy-export.md`; extend rules/tests.
**Interfaces:** Produce `readLegacyBrowser(storage:Storage):{notes:Record<string,string>;progress:Record<string,unknown>}`, `planMigration(uid:string,browser:ReturnType<typeof readLegacyBrowser>,cloud:Record<string,string>):Promise<MigrationItem[]>`, `applyMigration(uid:string,items:MigrationItem[]):Promise<TransferReport>`. Export helper outputs the legacy-source portion of `NotebookBundle` without evaluating note markup.

- [ ] Write failing assertions: importing a fixture twice leaves the same destination count; editing/deleting a destination and importing again does not overwrite/resurrect it; differing cloud/browser sources produce two notes; `expect(report.failed).toHaveLength(1)` after one upload fails and its marker remains absent. Unknown progress keys remain in the backup.
- [ ] Run unit and emulator migration tests; expect missing mapper/marker failures.
- [ ] Implement explicit account/source preview, sanitized editor conversion, preserved `sourceHtml`, deterministic IDs from source namespace/week/digest, and stable progress-key mapping. Hash source bytes with Web Crypto. Use deterministic image IDs from content digests so retrying an interrupted upload does not duplicate images. Respect new-document size limits; oversized legacy notes remain untouched and exportable with an explicit import error.
- [ ] Implement transactional destination-and-marker creation. Persistent source claim markers bind browser imports to the selected UID; a different UID must explicitly select retained sources. For progress, apply only to missing machines, preserving existing progress. For changed legacy sources, create a separately labeled recovered note. Never remove original local/cloud data or mark failed items complete.
- [ ] Provide the reviewed old-origin export helper and instructions for running it on the user's existing app origin; do not promise cross-origin storage access. Its output preserves raw source HTML, embedded images and unmatched progress. Preserve legacy data in portable backups and retry records.
- [ ] Run conversion/migration tests including scripts in imported HTML, Chinese text, code whitespace, screenshots, interruption at every marker boundary, and deleted destinations. Commit with `feat: migrate legacy study data without overwriting originals`.

## Task 10: Add portable backups and Markdown with images

**Files:** Create `src/transfer/backup.ts`, `src/transfer/markdown.ts`, `src/transfer/backup.test.ts`, `src/transfer/markdown.test.ts`, `tests/integration/backup.test.ts`; extend TransferPanel.
**Interfaces:** Produce `exportBackup(uid:string):Promise<{blob:Blob;report:TransferReport}>`, `importBackup(uid:string,input:unknown):Promise<TransferReport>`, `exportMarkdown(uid:string):Promise<{blob:Blob;report:TransferReport}>`. Backup version is exactly 1; the export MIME types are application/json and application/zip respectively.

- [ ] Write failing tests: exported then reimported content/images/machine associations/internal links are semantically equal under the returned ID mapping; all destination IDs are new; missing image data yields a failed entry; duplicate IDs, unknown versions and oversized documents are rejected before writes. Assert Markdown preserves commands containing triple backticks by selecting longer fences.
- [ ] Run `npm test -- src/transfer/backup.test.ts src/transfer/markdown.test.ts`; expect missing transfer implementation failures.
- [ ] Implement full bundle validation with no arbitrary HTML rendering; include trash, retained history, unsupported original markup and unmatched progress. Import uses a persisted session mapping to resume failed items without regenerating IDs. Replay retained history chronologically through accepted revisioned writes before writing current content, preserving original revision/timestamp metadata in the portable source record rather than forging cloud server timestamps.
- [ ] Implement Markdown ZIP using `fflate`, safe generated filenames, relative screenshot paths, and internal note links remapped to exported filenames. Make completeness explicit before download; allow an explicitly labeled partial export but never imply it is complete. Track local draft revisions included in exports so clear-device-data cannot rely on an older backup acknowledgment.
- [ ] Run transfer tests plus emulator backup replay tests; simulate storage-full, missing image and permission-denied failures. Add UI cancellation between items without losing the resumable import map. Commit with `feat: export and restore portable notebook backups`.

## Task 11: Make offline availability explicit

**Files:** Create `src/persistence/offline.ts`, `src/persistence/offline.test.ts`, `src/settings/Settings.tsx`, `src/pwa.ts`, `e2e/offline.spec.ts`; modify Vite and App.
**Interfaces:** Produce `downloadOffline(uid:string):Promise<OfflineReport>`, `getOfflineReport(uid:string):Promise<OfflineReport>`, `getStoredImageBytes(uid:string):Promise<number>`. Settings composes these with clearDeviceData and transfer operations.

- [ ] Write failing tests: an uncached screenshot produces `{complete:false}`; quota failure never updates the last-complete timestamp; switching account cancels download results for the old account. Browser test refreshes an edited note offline and asserts the exact draft survives.
- [ ] Run offline unit/browser tests; expect missing cache/service-worker behavior failures.
- [ ] Implement explicitly requested snapshot download of current notes (including trash) and referenced images into IDB; history remains on-demand. Record the captured revisions and timestamp so completion means a verified snapshot, not a claim of perpetual freshness. Show missing items and external-link availability. Sum stored cloud image payloads on explicit Settings action, including unused images; disclose the download/read cost in that action and avoid doing it on every page load.
- [ ] Configure service-worker shell precache and update prompt; never cache authenticated Firebase network responses through service-worker runtime caching. Apply an update only after local drafts are safe. Quota eviction and unsupported offline storage show a clear limitation; no forced reload or silent data removal.
- [ ] Run offline tests, production build, and production-preview browser tests (service worker enabled); verify initial offline visit explains unavailability and previously downloaded content works with networking disabled. Commit with `feat: add verified offline notebook downloads`.

## Task 12: Verify migration and deployment readiness

**Files:** Create `vercel.json`, `e2e/release.spec.ts`, `docs/deployment.md`; modify README, setup script, package scripts, `.env.example`, and emulator configuration as needed.
**Interfaces:** Consume the complete application. Produce a reproducible build and documented deployment/rollback procedure; no new feature APIs.

- [ ] Add release tests: deep-linked note refresh succeeds; requests for `/tests/fixtures/legacy-index.html` or repository scripts do not return those files; preview mode refuses production Firebase; migrated fixtures retain all source content and screenshots. Verify intended keyboard focus and no horizontal clipping at 390px and 1440px widths.
- [ ] Run `npm run test:e2e -- e2e/release.spec.ts`; expect missing deployment configuration/acceptance failures.
- [ ] Configure Vercel build `npm run build`, output `dist`, and application route fallback without serving repository files. Document Firebase web config variables and explicit environment mode, account provisioning, required auth-domain configuration, separate rules/index deployment, and same-origin legacy export. Fix setup database detection to stop on CLI/auth/JSON errors instead of creating a database; remove any unverified promise that a CLI command configures authentication.
- [ ] Run `npm ci`, `npm --prefix tests ci`, `npm test`, `npm run typecheck`, `npm run build`, and `npx firebase emulators:exec --project demo-oscp-notebook --only auth,firestore "npm run test:rules && npm run test:integration && npm run test:e2e"`. Expect zero failures; Java/emulator/environment failures are blockers, not passing tests. Check `git diff --check` and review the bundle for accidental private credentials and non-public assets.
- [ ] Record actual results and remaining external prerequisites in deployment documentation. Check Firebase project/database read-only again before any later live deployment. If authorized to deploy in a subsequent step, deploy rules/indexes before exposing the new production frontend; verify sign-in/save/reload on a disposable note. Never upload test fixtures to production. Rollback must retain new collections and export new-format edits first.
- [ ] Commit with `chore: verify notebook deployment and migration readiness`; follow the requested code-review and development-branch finishing skills before integration. Do not claim deployment occurred based on a local build.

## Plan self-review and execution handoff

Coverage: spec architecture/reference preservation → Task 1; schema/editor → Tasks 2, 4; local durability → Task 3; private Firestore/revisions → Task 5; conflicts/history → Task 6; auth → Task 7; views/search/trash → Task 8; migration/old-origin recovery → Task 9; backups → Task 10; offline/storage visibility → Task 11; deployment and acceptance → Task 12. Deferred image deletion remains deferred. Every Review Focus condition is assigned a test above.

All commands and paths in this plan refer to the implementation checkout root. Test fixtures and helpers must stay outside the deployed asset directory. Use the fixtures specified in each task; no production credentials, data or accounts in automated tests. Where emulator access is unavailable, continue independent local work and record the blocker without marking dependent verification complete.

Recommended execution: **Native** (implement tasks sequentially in this chat, followed by a fresh whole-branch review). Draft, sync, schema, and migration interfaces are tightly coupled; keeping one implementer avoids repeated handoffs. **Subagent-driven** remains available for a fresh implementer and reviewer per task, at higher context cost. The user must review this plan and select the execution method before implementation, as required by the writing-plans skill.

Technical references verified during planning: [Tiptap React setup](https://tiptap.dev/docs/editor/getting-started/install/react), [Firestore transactions and offline limitations](https://firebase.google.com/docs/firestore/manage-data/transactions), [Firebase Rules string/byte APIs](https://firebase.google.com/docs/reference/rules).
