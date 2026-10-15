# OSAI workspace

OSAI is a second personal study area in Fieldnotes. Select OSCP or OSAI in the sidebar. Existing OSCP URLs and old notes retain their meaning.

## Routes and learning material

- `/osai/study-plan`: seven learning groups and synced progress.
- `/osai/library`: eleven original guides/resources with search, OWASP 2025 identifiers, source classification, and checked dates.
- `/osai/library/:slug`: lesson, checklist, original diagram, evidence worksheet, source links, and private note/bookmark creation.
- `/osai/notes`, `/osai/topics`, `/osai/labs`, `/osai/trash`: workspace-scoped personal data.
- `/settings`: account-wide sign-in, backup, offline download, recovery, and device controls.

The reference library is a starter curriculum, not a reproduction of the paid OffSec course or a complete exam syllabus. All prose and diagrams are original. Kongsec is linked as a community source, not copied. Sources were checked on 2026-10-15. OffSec specifies a 24-hour practical exam and another 24 hours for documentation, correcting the conflicting community claim. See each article's sources and the design document for the research record. Current exam restrictions and submission details must be read in the official guide.

The app does not execute snippets, connect model APIs, or store API keys. Lab templates provide headings for scope, environment/model version, steps, inputs, results, screenshots, trial counts, impact, mitigation, and sources. Bookmarks are ordinary private notes tagged `bookmark`.

## Compatibility and data handling

Missing workspace on legacy notes, targets, drafts, or snapshots means OSCP. New records explicitly store `oscp` or `osai`. Workspace membership cannot change after creation. Owner checks remain the security boundary; workspace is organizational separation within one account. Unknown metadata and cross-workspace target associations are rejected.

Firestore collections and IndexedDB keys are unchanged. Sync and cached data remain account-wide, while screens filter by workspace. A note link in the wrong workspace redirects to its canonical route once metadata is available. The workspace selector waits for local editor persistence and refuses navigation when saving fails.

Full JSON exports use version 2 and contain both workspaces, images, history, and recovery. Version 1 imports are OSCP-only. Version 2 imports validate explicit membership and references before writing, remap private IDs, and retain membership. Curriculum targets retain their canonical seed IDs so restored progress appears on the learning path; an existing curriculum target is reused without overwriting its current progress. Legacy migrations remain OSCP. Markdown exports include both workspaces and canonical internal links. Offline download covers both workspaces and retains the existing completeness checks. Reference content is shipped in lazy build chunks; external sources require internet. No claim is made that a fresh offline visit works.

## Verification record

During implementation, observed failing assertions were followed by passing regressions for membership, strict validation, rules, backup v2, local creation, route isolation, template structure, and source catalog integrity. OSCP study-plan custom-target leakage was caught by a regression and fixed. Final verification counts and independent review outcomes are recorded in the deployment/review record after completion.

## Release and rollback

Deploy compatible Firestore rules before the frontend. Do not remove workspace metadata, rewrite existing notes in bulk, or revert to the old unfiltered frontend after OSAI records exist. A rollback requires a compatibility build that understands or hides OSAI records, plus a version 2 backup. Prefer a corrective forward release.

The user subsequently authorized production deployment on 2026-10-15. The OSAI workspace is now published at https://oscp-exam-notes.vercel.app/osai/study-plan; see the deployment record for verification.

## Final checks and review (2026-10-15)

71 unit tests, 13 Firestore rules tests, 16 emulator integration tests, 13 development browser tests, and 5 built-app/offline browser tests passed (118 total). Typecheck, formatting, build, and diff whitespace checks passed. Desktop (1440px) and mobile (390px) screenshots were inspected. The existing large main-bundle warning remains; the OSAI article bodies load as separate chunks.

A fresh independent reviewer found one Important issue: restoring curriculum targets under random IDs detached their progress from the study path. A failing regression reproduced it; the fix preserves known seed IDs, reuses existing curriculum state without overwriting progress, and keeps notes associated with their targets. Unit and emulator tests now cover this behavior. The review's minor scope-label finding was also addressed in account/offline/recovery UI. No unresolved Critical or Important findings remain from that review.

All five distinct reference URLs were checked. Four returned HTTP 200 directly. The OffSec exam guide blocked direct automated fetch with HTTP 403, but its current content was successfully retrieved through the web research tool and its timing verified. Live account provisioning and production note writes were not performed.

Rulings: seed IDs are the exception to private-ID remapping because they represent shared curriculum identity, not private entities. Existing curriculum progress wins over imported progress when already present; a fresh account receives the imported value. The UI/reference tasks were committed together because they share routes and cannot be released independently. No new dependencies, separate database, or deployment was needed.

## OSAI Vault import — 2026-10-15

Added `/osai/library/osai-vault` using the user-supplied `index.html`, retained at
`scripts/sources/osai-vault.html`. All 23 modules and 70 preformatted code/text
blocks are preserved without summarization. The existing reader provides module
navigation, bookmarking, and lab-note creation. Source attribution remains visible.

`npm run import:osai-vault` regenerates the sanitized article and catalog entry.
Executable scripts and event handlers are excluded; escaped code remains text.
The original source's claims (including exam details) are preserved, not verified.
The original hero says “22 Modules”; the imported reference includes modules 00–22
and the app correctly labels the collection as 23 modules.

Validation: 71 unit tests and 3 import integrity/security tests pass, typecheck and
production build pass, and formatting passes. Browser inspection confirmed all 23
modules, 70 code blocks, working contents links, and no horizontal page overflow at
the inspected viewport. No Firestore schema or rules changes.
