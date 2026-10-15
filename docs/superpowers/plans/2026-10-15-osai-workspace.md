# OSAI Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an OSAI learning library and personal notebook alongside OSCP without losing or mixing existing data.

**Architecture:** Keep the existing owner-scoped Firestore collections, IndexedDB stores, editor, and account-wide synchronization. Add explicit workspace metadata, route-aware presentation, versioned transfer compatibility, and an independently loaded static OSAI library. Missing legacy workspace metadata means OSCP.

**Tech Stack:** Existing React, TypeScript, Vite, Tiptap, Firebase Auth/Firestore, IndexedDB, Vitest, Playwright, and Firebase emulators; Node 24 and Java 21 for local verification. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-15-osai-workspace-design.md`

**Execution:** Preserve the user's earlier Native preference: implement sequentially in this session using executing-plans, then one independent whole-change review. This document requires user review before execution.

## Global Constraints

- WorkspaceId = oscp | osai; missing means OSCP. New records always write an explicit workspace.
- Retain note schemaVersion 1 for this additive change.
- Workspace changes are not supported in this release.
- Keep the existing IndexedDB name and keys so pending drafts and cached notes remain accessible.
- Legacy browser/cloud migrations always land in OSCP regardless of the currently selected UI workspace.
- Export a version 2 full-account backup containing both workspaces, their histories, linked targets, images, and recovery drafts.
- Continue accepting version 1 backups as OSCP-only.
- Settings, account identity, full backup, recovery, and device management remain account-wide and are explicitly labeled accordingly.
- Preserve existing OSCP URLs. No new external project or paid service is required.
- Static references are original writing with attribution; do not bulk copy Kongsec HTML/images or execute source scripts.
- No automated exploit execution, model API calls, AI assistant, or API-key storage is part of this release.
- Work in `/Users/perry/.codex/worktrees/oscp-notebook/oscp-exam-notes`, branch `codex/oscp-notebook`; do not modify the original main checkout.
- Do not deploy partial tasks. Product code execution begins only after plan review.

## Review Focus

1. Old clients stripping workspace from OSAI records must fail safely, preserving data (Task 2).
2. Workspace switching during a failed local save must stay on the editor with a recoverable error (Task 5).
3. Legacy backups with mixed or forged workspace metadata must be rejected before any writes (Task 3).
4. A direct note link in the wrong workspace must resolve correctly without showing unrelated notes (Task 5).
5. Offline drafts and conflict/history snapshots must retain membership through switching, reload, and restore (Tasks 3, 4, 8).

## File and interface map

- `src/workspaces/model.ts`: workspace type, normalization, immutable-membership checks.
- `src/workspaces/routes.ts`: URL classification and canonical paths.
- `src/workspaces/WorkspaceSwitcher.tsx`: guarded selection using the existing editor leave guard.
- `src/notebook/model.ts`, `validation.ts`: additive legacy-compatible fields and versioned backup types.
- `src/notebook/repository.ts`, `NotebookContext.tsx`, `seeds.ts`: workspace-safe creation, membership selectors, and seed integration while retaining account-wide data.
- `src/firebase/notes.ts`, `firestore.rules`: immutable membership, link validation, and history behavior.
- `src/transfer/backup.ts`, `legacy.ts`, `src/firebase/migration.ts`: normalization, version 2 export, version 1 compatibility, canonical link remapping.
- `src/osai/catalog.ts`, `content/*.json`: static lesson metadata and original article content.
- `src/osai/Library.tsx`, `Reader.tsx`, `StudyPlan.tsx`, `templates.ts`, `seeds.ts`: OSAI reading and personal study flows.
- Existing notebook views, shell, transfer panels, recovery panels, and styles: targeted adaptations, no editor/repository duplication.

## Task 1: Workspace contracts and legacy-safe validation

**Files:** Create `src/workspaces/model.ts`, `model.test.ts`, `routes.ts`, `routes.test.ts`; modify `src/notebook/model.ts`, `validation.ts`, `validation.test.ts`.

**Interfaces:** Export `type WorkspaceId = 'oscp' | 'osai'`, `workspaceOf(value: {workspace?: WorkspaceId}): WorkspaceId`, `sameWorkspace(a: {workspace?: WorkspaceId}, b: {workspace?: WorkspaceId}): boolean`; export `workspaceFromPath(path: string): WorkspaceId` and `workspacePath(workspace: WorkspaceId, page: 'study-plan' | 'notes' | 'topics' | 'targets' | 'trash' | 'library', id?: string): string`. Add `workspace?: WorkspaceId` to note/machine content; `emptyNote(workspace: WorkspaceId = 'oscp'): NoteContent` writes it explicitly. Route targets to /machines or /osai/labs; library to /walkthroughs or /osai/library.

- [ ] Add failing tests with these assertions:
  ```ts
  expect(workspaceOf({})).toBe('oscp');
  expect(workspaceOf({workspace:'osai'})).toBe('osai');
  expect(emptyNote('osai').workspace).toBe('osai');
  expect(workspacePath('osai','notes','abc')).toBe('/osai/notes/abc');
  expect(workspaceFromPath('/osaiish/notes')).toBe('oscp');
  ```
  Validate legacy exact field sets and those sets plus workspace; reject null, uppercase, unknown workspace, and unknown fields.
- [ ] Run `npx vitest run src/workspaces src/notebook/validation.test.ts`; confirm failures correspond to missing contracts, not setup errors.
- [ ] Implement the interfaces and validator alternatives. Do not silently convert invalid workspace values to OSCP. Avoid adding metadata in raw history reads where original revision contents must be preserved.
- [ ] Rerun the targeted tests and `npm run typecheck`; expect zero failures.
- [ ] Commit these files as `feat: define backward-compatible notebook workspaces`.

## Task 2: Enforce membership and target links in writes and rules

**Files:** Modify `src/firebase/notes.ts`, `src/notebook/repository.ts`, `firestore.rules`, `tests/notebook-rules.test.mjs`, `tests/integration/cloud.test.ts`; create `src/osai/seeds.ts` and `src/osai/seeds.test.ts`.

**Interfaces:** Consume Task 1 contracts. Export `osaiSeedMachines: Saved<MachineContent>[]` and `isOsaiSeedId(id: string): boolean`. IDs are exactly `osai-module-foundations`, `osai-module-prompt-output`, `osai-module-retrieval`, `osai-module-agents`, `osai-module-models-data`, `osai-module-infrastructure`, `osai-module-assessment`. Platform is `AI-300`, OS is empty, tags include `curriculum`, legacyKey/week are null, progress is `not-started`, workspace is `osai`. Create shared `validateTargetWorkspace(uid: string, workspace: WorkspaceId, machineId: string | null): Promise<void>` in the repository for local creation/link edits; cloud transaction and rules independently enforce persisted links.

- [ ] Add tests: missing → explicit oscp update succeeds; osai → missing/oscp and oscp → osai fail; invalid fields and other-user writes fail; equal-workspace persisted target links succeed; cross-workspace links fail. A nonexistent target is rejected except a valid virtual seed. Preserve the existing OSCP seed ID convention, inspecting its actual IDs before coding rules; reserve the seven exact OSAI IDs to OSAI. Include old-client-style write stripping osai metadata.
- [ ] Run `PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH npx firebase emulators:exec --project demo-oscp-notebook --only auth,firestore "npm run test:rules && npm run test:integration"`; confirm new assertions fail under current rules.
- [ ] Implement additive rule validation and immutable membership, preserving revision checks, limits, owner checks, tombstones, and history access. Validate target links in transactions before writes; support virtual seeds without inventing arbitrary target IDs. Keep legacy OSCP IDs unchanged.
- [ ] Rerun emulator tests plus `npx vitest run src/osai/seeds.test.ts`; expect all pass. Fix any existing integration fixtures that were invalid dangling-target data, preserving their original test purpose.
- [ ] Commit as `feat: enforce workspace membership across notebook writes`.

## Task 3: Versioned backups and legacy migration

**Files:** Modify `src/notebook/model.ts`, `src/transfer/backup.ts`, `backup.test.ts`, `legacy.ts`, `legacy.test.ts`, `src/firebase/migration.ts`, `src/transfer/BackupPanel.tsx`, `BackupPanel.test.tsx`, `tests/integration/backup.test.ts`, `migration.test.ts`.

**Interfaces:** Preserve existing public backup function names. `NotebookBundle.version` accepts 1 or 2 for input; `collectBackup` and `exportBackup` produce version 2. `validateBundle(input: unknown): NotebookBundle` accepts v1 only when membership is absent/OSCP; v2 requires explicit valid membership on notes, targets, history, and recovery. Normalize valid v1 input before restore. `remapBundle` preserves membership and remaps both note URL forms.

- [ ] Add failing assertions for v1 import → OSCP, v1 carrying OSAI → reject, and v2 export/restore retaining both workspaces and screenshots. Reject mismatched history, linked target, and recovery membership before write calls. Assert source URLs survive remapping; `/osai/notes/old` becomes `/osai/notes/new`, while legacy OSCP links retain their route. Include conflict/recovery records and a partial-backup missing-image failure.
- [ ] Run `npx vitest run src/transfer/backup.test.ts src/transfer/legacy.test.ts src/transfer/BackupPanel.test.tsx`; confirm expected new failures.
- [ ] Implement v1/v2 validation and normalization, preserve restore resume mapping, include both seed catalogs where referenced, and keep exported legacy sources. Ensure browser/cloud migration explicitly creates OSCP even if OSAI is active. Label backup and recovery operations as covering both workspaces; keep current partial-export warnings.
- [ ] Run targeted unit tests and the emulator integration suite; expect pass, including a simulated failure/resume restore with original workspace retained.
- [ ] Commit as `feat: preserve workspaces in backups and legacy imports`.

## Task 4: Workspace-aware repository, targets, history, and offline state

**Files:** Modify `src/notebook/repository.ts`, `NotebookContext.tsx`, `seeds.ts`, `seeds.test.ts`, `src/persistence/ConflictPanel.tsx`, `RecoveryPanel.tsx`, `RecoveryPanel.test.tsx`, `src/transfer/markdown.ts`, `markdown.test.ts`; create `src/notebook/workspaces.test.ts`; extend `tests/integration/sync.test.ts` and `src/persistence/offline.test.ts`.

**Interfaces:** Keep `useNotebook()` account-wide; add `useWorkspaceNotebook(workspace: WorkspaceId)` returning filtered notes and machines. Extend `createNote(uid: string, machineId: string | null = null, workspace: WorkspaceId = 'oscp', initial?: Pick<NoteContent,'title'|'contentJson'|'text'|'tags'|'attachmentIds'>): Promise<string>`. `withSeedMachines` merges both seed catalogs with persisted overrides; views filter by workspace. New custom targets explicitly receive the current workspace.

- [ ] Add tests proving legacy records appear only in OSCP, OSAI sees its seven seed targets but no OSCP seeds, persisted progress overrides seeds, and unknown workspace inputs are rejected. Creating an OSAI note from an OSCP target rejects. History/conflict restoration retains membership. Account-wide offline snapshots include both and do not clear another workspace's cached records. Markdown note links retain canonical OSAI paths.
- [ ] Run `npx vitest run src/notebook src/persistence src/transfer/markdown.test.ts`; verify meaningful failures.
- [ ] Implement selectors and creation signatures. Retain current IndexedDB schema and account-wide listeners. Preserve fields through synchronization, trash/restore, recovery and history actions; normalize old snapshots to OSCP without switching an existing note's workspace. Display workspace labels in account-wide recovery lists.
- [ ] Run targeted units plus emulator integration tests; expect pass. Verify invalid cross-workspace history restore makes no write.
- [ ] Commit as `feat: scope notebook data while preserving shared sync`.

## Task 5: Workspace navigation and scoped notebook screens

**Files:** Modify `src/app/App.tsx`, `styles.css`, `AccountPanel.tsx`, `src/notebook/NotebookView.tsx`, `MachineView.tsx`, `TrashView.tsx`, `src/editor/NoteEditor.tsx`; create `src/workspaces/WorkspaceSwitcher.tsx`, `WorkspaceSwitcher.test.tsx`, `e2e/workspaces.spec.ts`.

**Interfaces:** `WorkspaceSwitcher({workspace}: {workspace: WorkspaceId})` consumes route helpers and `beforeLeaveEditor(): Promise<boolean>`. Shared note/target/trash views take `workspace: WorkspaceId` with OSCP default. Editor receives only same-workspace targets. Settings remain at /settings; no duplicate authentication context.

- [ ] Add tests for unsaved successful switch, failed persistence blocking navigation, wrong-workspace deep-link canonicalization, unavailable note state, separate note/topic/trash results, OSCP seed preservation, and account switch clearing previous data. Use two distinct emulator accounts for isolation.
- [ ] Run `npx vitest run src/workspaces` and the workspace browser spec under emulators; confirm new tests fail before UI implementation.
- [ ] Add accessible workspace selection and route-aware navigation. OSAI Labs uses shared target UI with appropriate labels. Use the existing leave guard; do not bypass or clear pending work. Route selection is authoritative; local last-selection preference is optional and omitted initially. Keep existing OSCP navigation and reference routes unchanged. Canonicalize a note route only after its actual metadata loads.
- [ ] Run targeted tests under emulators and verify mobile navigation at 390px; expect no horizontal overflow or clipped selector.
- [ ] Commit as `feat: add OSCP and OSAI workspace navigation`.

## Task 6: Original OSAI reference library

**Files:** Create `src/osai/catalog.ts`, `catalog.test.ts`, `Library.tsx`, `Reader.tsx`, `content/*.json`, `public/osai/diagrams/*.svg`; modify `src/app/App.tsx`, `styles.css`; create `e2e/osai-library.spec.ts`.

**Interfaces:** Export `type OsaiArticle = {slug:string; title:string; group:string; summary:string; sources:{title:string;url:string;kind:'official'|'community'}[]; checkedAt:string; owasp:string[]; html:string}` and `osaiCatalog: Omit<OsaiArticle,'html'>[]`. Export `loadOsaiArticle(slug: string): Promise<OsaiArticle | null>` using Vite lazy imports. Stable lesson slugs match the seven seed suffixes; additional slugs: glossary, owasp-2025, resources, exam-preparation. Article renderer accepts only curated local sanitized HTML; reuse existing sanitization approach at content generation, and strip active attributes/scripts.

- [ ] Add catalog tests for unique stable slugs, valid dates and HTTPS source URLs, exactly seven overview lessons, required lesson sections, no script/on-event/javascript URL content, and correct 2025 risk identifiers. Browser assertions: search opens a lesson, headings/contents links work, unknown slug is recoverable, code copy works, source links and original diagrams render on desktop/mobile.
- [ ] Run catalog tests and public browser tests; verify expected failures.
- [ ] Recheck the listed primary sources. Write original content for the seven overview lessons plus glossary, OWASP cross-reference, resources, and exam-preparation pages. Each overview contains objectives, explanation, trust-boundary diagram where useful, bounded practice steps, expected observations, mitigation, sources and checked date. Link Kongsec for further reading; do not import its text or images. Correct the 24-hour practical/24-hour reporting distinction from current official guidance. Include explicit source classification and avoid unsupported course-completeness claims.
- [ ] Implement library/reader with lazy article bodies, searchable catalog metadata, source attribution, empty/error states, semantic headings, copy buttons, and responsive diagrams. Do not run snippets or add model API calls. Public reads must work signed out.
- [ ] Run catalog/browser tests, inspect each article and diagram, and verify source links (record blocked external requests separately from actual broken links). Confirm no offline availability promise.
- [ ] Commit as `feat: add attributed OSAI study reference library`.

## Task 7: Study progress, lab templates, and bookmarks

**Files:** Create `src/osai/StudyPlan.tsx`, `templates.ts`, `templates.test.ts`, `e2e/osai-study.spec.ts`; modify `src/osai/Reader.tsx`, `src/notebook/MachineView.tsx`, `src/app/App.tsx`, `styles.css`.

**Interfaces:** Export `createOsaiLabTemplate(source?: {title:string;url:string}): JSONContent` using the editor's existing Tiptap type. StudyPlan shows seven seed groups with existing progress states. Reader's Create note links to its curriculum target; supplementary articles link to assessment. Bookmark creates a source-linked OSAI note tagged `bookmark`; it is not a separate stored entity type.

- [ ] Add assertions that lab templates contain objective, environment/model version, prerequisites, numbered steps, prompts/commands, expected/observed results, screenshots, repeated trials, impact, mitigations, and references. Test a source-linked note creation, bookmark filtering, progress update surviving reload, and no progress leakage into OSCP. Signed-out creation routes to sign-in without silently creating local private records.
- [ ] Run template tests and study browser tests under emulators; verify expected failures.
- [ ] Implement template generation and wire lesson creation to Task 4 createNote. Include source URLs as editor links; no pasted foreign HTML. Reuse existing target persistence for progress and personal lab creation. Keep curriculum entries distinguishable from custom labs by seed membership, not mutable display tags alone.
- [ ] Run tests, then create a disposable emulator lab note with a screenshot and verify reload/export preserve it in OSAI.
- [ ] Commit as `feat: connect OSAI lessons to personal lab notes and progress`.

## Task 8: Release regression, documentation, and independent review

**Files:** Extend `e2e/offline.spec.ts`, `e2e/release.spec.ts`, `tests/integration/backup.test.ts`; modify `docs/deployment.md`; create `docs/osai-workspace.md`.

**Interfaces:** No new product interfaces. Exercise Tasks 1–7 through public UI and existing data APIs.

- [ ] Add a regression starting from a legacy cached OSCP draft: edit OSAI offline, switch workspaces, reload, reconnect, and verify both notes and their memberships. Add account-wide backup round trip including history, recovery, screenshots, and canonical links. Verify public build excludes credentials/source fixtures and still serves OSCP walkthrough JSON.
- [ ] Run `npm test`, `npm run typecheck`, `npm run format:check`, `npm run build`, and `PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH npm run test:emulators`; require exit 0 throughout. Tests must fail visibly if the new workspace metadata is dropped, not merely snapshot the current implementation.
- [ ] Build with `VITE_FIREBASE_MODE=emulator npm run build`, then run `PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH npx firebase emulators:exec --project demo-oscp-notebook --only auth,firestore "npm run test:release"`. Require all production-preview checks to pass.
- [ ] Document new routes, content provenance/check dates, backup v2 behavior, old-client limitations, rule-before-frontend release order, account-wide offline scope, and compatible rollback requirements. Record actual checks and any limitations; do not claim owner-authenticated production verification based on emulator evidence.
- [ ] Request one independent whole-change review under the Native workflow, addressing workspace compatibility, data preservation, rules, content attribution, and scoped UI. Fix material findings with regression tests, then rerun affected checks.
- [ ] Run `git diff --check`, inspect intended diff and clean status after committing as `docs: record OSAI workspace validation and release procedure`.

## Release boundary

The plan ends with a verified, reviewable implementation. Production publication is a separate step after implementation review; earlier deployment authorization concerned the OSCP release. When publication is requested, deploy compatible Firestore rules first, then rebuild/deploy production with existing public Firebase configuration. Preserve both workspaces and do not perform bulk data migration. Verify both public study areas, source assets, and sign-in domain; perform authenticated notebook checks only with an appropriate owner session.

## Self-review and handoff

Coverage: navigation and separation (1,4,5); immutable metadata/security (1,2); backup/history/recovery/migration (2,3,4,8); OSAI lessons and source policy (6); templates/bookmarks/progress (7); offline/account isolation (4,5,8); rollout/rollback (8 and release boundary). All five Review Focus risks have specific test owners. Shared interfaces are named once and consumed consistently. No product changes have been made by this planning task.

Next: user reviews this plan. Preserve Native execution unless the user changes that preference; after approval invoke superpowers:executing-plans and implement in task order.
