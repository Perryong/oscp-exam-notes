# Personal OSCP notebook design

Date: 2026-10-13
Status: Ready for user review; architecture selected, implementation not started.

## 1. Purpose and decisions

Build a personal OSCP study notebook that preserves the current practice ladder while making machines, notes, and progress editable and searchable across the user's devices. The user selected personal use with device sync and approved the recommended React + Vite + TypeScript frontend, Vercel hosting, Firebase Authentication, and Firestore architecture.

Success means the user can write formatted technical notes with screenshots, find commands quickly, recover interrupted edits, and continue on another device after synchronization. Existing weekly notes, progress, walkthrough links, and the cheat sheet must survive migration.

First-release assumptions:

- Keep the existing `oscp-notes` Firebase project and default database, subject to read-only verification of its edition and configuration before implementation of database access. The repository describes Standard edition; live configuration has not been verified.
- Keep compressed screenshots in Firestore. This preserves the existing approach without introducing Cloud Storage or requiring a billing-plan change. This is a bounded personal-use attachment strategy, not unlimited file storage.
- Each account can access only its own data. The intended product is personal; shared notebooks, account administration, collaboration, public publishing, AI services, and a separate application server are excluded.
- No automatic deployment or cloud configuration changes are part of this design-review stage.

## 2. Architecture and alternatives

Use a browser application built with React, Vite, and TypeScript. Vercel serves the generated `dist` folder. The Firebase browser SDK handles authentication and database access, protected by Firestore Security Rules. IndexedDB stores recoverable drafts and pending edits. A service worker caches the application shell for subsequent offline visits.

The current vanilla JavaScript implementation is a viable smaller option for basic weekly notes, but its single-file UI, editor, persistence, and migration code are already coupled. Extracting those concerns into React components and focused modules supports the approved notebook expansion.

Next.js would add server rendering and server-side application features. Those are not required for a private editor with direct Firestore access. Reconsider it only if public indexed content or substantial server functionality becomes a requirement.

Application boundaries:

| Area | Responsibility |
| --- | --- |
| App shell and routes | Navigation, account state, mobile layout, offline availability |
| Notebook views | Machines, topics, weekly ladder, search, trash |
| Note editor | Tiptap document, formatting, templates, attachment insertion |
| Local persistence | UID-scoped drafts, cached attachment data, pending changes |
| Sync module | Cloud reads, revision checks, acknowledged writes, conflicts |
| Firebase adapter | Authentication and typed Firestore operations |
| Import/export | Legacy migration, portable backup, Markdown export |
| Reference data | Existing ladder, walkthroughs, chapter outlines, cheat sheet |

Do not introduce a generic backend abstraction or a global state framework unless implementation demonstrates a concrete need. React state handles transient UI; persistence modules own durable state.

## 3. User experience

Primary navigation: Study plan, Machines, Topics, All notes, Cheat sheet, and Settings. Trash is accessible from All notes. Desktop uses a list beside the editor; small screens show one pane at a time with an obvious back action. Notes have stable URLs and browser navigation preserves local drafts.

Machines have a name, platform, operating system, tags, optional study week, and a progress state: not started, in progress, or completed. The bundled ladder remains the default schedule. User-created machines appear in Machines and may be assigned to an existing week; editing the entire schedule is outside the first release.

Notes have a title, tags, optional machine association, and optional week association. A topic is a standalone note. Weekly notes remain first-class notes rather than being automatically split between machines. A note can link to another note by its stable ID; missing or trashed targets show a clear unavailable state.

The initial machine template contains Enumeration, Initial access, Privilege escalation, Evidence, and Lessons learned. Topic notes start blank. Choosing a template applies only to a new note and never overwrites existing content.

Use Tiptap's open-source editor components for headings, paragraphs, emphasis, lists, checklists, code blocks, links, and screenshot nodes. Code blocks preserve whitespace and support copying. Imported or pasted content passes through an explicit schema; arbitrary HTML and executable URL schemes are rejected. Screenshot nodes store attachment IDs rather than embedded base64 strings. Store an editor schema version to support future upgrades.

Account access retains email/password sign-in and password reset. A signed-out visitor can browse bundled reference content but cannot create new cloud notes. Existing anonymous browser notes are detected and offered for explicit import after sign-in. Offline editing is available for an already authenticated, previously opened account on a trusted device; authentication failure preserves drafts without uploading them.

## 4. Firestore data model

Retain legacy `users/{uid}/notes/week-{n}` and `users/{uid}/images/{id}` during migration and rollback. Use new collections so old and new clients do not interpret each other's note schemas.

| Path below `users/{uid}` | Contents |
| --- | --- |
| `notebookNotes/{noteId}` | Title, serialized editor JSON, plain text, tags, nullable machine ID and week, attachment IDs, schema version, revision, last mutation ID, server timestamps, nullable deletion timestamp |
| `machines/{machineId}` | Name, platform, OS, tags, optional legacy key, nullable week, progress state, revision and timestamps |
| `noteHistory/{noteId}/versions/{versionId}` | Previous note content and revision saved during acknowledged content replacement; supports recovery |
| `images/{imageId}` | Existing immutable base64 image data and creation timestamp |
| `migrationItems/{itemId}` | Source type and digest, destination ID, completion timestamp |

Use a serialized JSON string for editor content to avoid Firestore's nested-array restrictions and keep the stored representation explicit. Validate the decoded editor schema before rendering. Plain text is derived from that content for local search. Notes and history documents must each fit within the document-size limit; cap the combined UTF-8 content and text payload at 600 KiB and independently bound metadata. Enforce matching field limits in security rules and test non-ASCII boundary cases.

New image uploads use the existing supported raster formats and compression pipeline with a base64 payload below 1,000,000 bytes. New uploads have a 20 MiB input-file limit and a 25-megapixel decoded-image limit before canvas processing. Explain compression or size failures without discarding the draft. First release supports screenshots, not arbitrary file attachments.

Use explicit ownership rules, allowed field lists, types, bounded values, and server timestamps for every collection. Note revision checks require exactly one increment per accepted replacement; creation begins at revision one. Rules prevent a client from bypassing stale-revision checks. History creation must match the previous note revision and content in the same transaction. Test this with the emulator.

Exclude large content, plain text, and base64 image fields from indexing. Search is local to the user's cached notebook; Firestore is not a full-text search engine. Load private notes and machine metadata after sign-in, and fetch image bodies only when viewed, exported, or explicitly downloaded for offline use. Do not load all history during normal navigation. This whole-notebook search approach is intentionally scoped to a personal collection; larger datasets would require pagination and a separate search design.

## 5. Saving, offline use, and conflicts

Persist each editor update to a UID-scoped IndexedDB draft before reporting it as locally saved. If local persistence fails, retain the in-memory text, show an error, and offer an immediate export. Never display a successful save state when local or remote persistence failed.

Each draft retains its base cloud revision, stable mutation ID, content, and local modification time. Debounce online cloud saves by approximately one second. Serialize saves per note; an earlier save acknowledgment cannot clear a newer local draft.

The online sync operation uses a Firestore transaction to compare the base revision, archive the previous content, and write the replacement with the next revision and mutation ID. If a retry sees its own mutation ID already accepted, treat it as acknowledged rather than creating a duplicate revision. Since transactions require connectivity, offline edits remain in IndexedDB until an online transaction can run. Retain the latest 20 acknowledged previous versions per note; prune older versions only after successful acknowledgment. Expose those versions through a recovery view; restoring a version creates a new revision rather than rewriting history.

Machine edits and progress changes use the same local-draft and revision-check protocol, without note-history documents. Conflicting progress edits remain pending until the user selects the desired state.

If the cloud revision changed independently, retain both versions and show a conflict panel. The user can retain the remote version, replace it with the local version after a fresh revision check, or save the local version as a separate note. Never silently overwrite either copy. Snapshot updates do not replace a dirty editor document.

Use a browser lock per note during synchronization to coordinate tabs. IndexedDB draft updates also compare local revisions so two tabs cannot silently replace each other's pending work. A second editor with a stale local revision preserves its content as a conflict draft.

Save states: Unsaved, Saved locally, Syncing, Synced, Conflict, and Save failed. Closing or navigating away is safe only after a recoverable local draft exists. Sign-out stops listeners and prevents queued work from being uploaded under another UID; retained drafts remain scoped to the original account. Offer a clear-device-data action after pending work is synced or exported, and clear Firebase persistence through its supported lifecycle.

Offline availability means the shell was previously loaded and the requested data is cached. External walkthroughs and uncached notes or screenshots remain unavailable. Provide a Download for offline action that caches all current notes and referenced screenshots, reports missing items or storage failures, and records the last completed download. Browser storage can be evicted, so cloud sync and exports remain necessary backups. Service-worker updates never force a reload while drafts are unsafe.

## 6. Search, deletion, and backups

Search titles, tags, machine names, and extracted note text. Update the search index whenever note content changes, including same-length edits. Search works offline over cached content and indicates when the notebook has not fully downloaded.

Deleting a note moves it to trash with a revisioned write. Restoring it follows the same conflict checks. Permanently deleting a trashed note removes its history after explicit confirmation. Removing a screenshot from a note does not immediately delete shared image data.

Retain image documents in the first release, even after their notes are permanently deleted. Safe image cleanup must account for legacy notes, history, and unpublished drafts on other devices; a simple scan can race another device's save. Defer destructive attachment cleanup to a separate design instead of adding a reference-tracking subsystem to this migration. Show the total stored screenshot payload size in Settings so the retention cost is visible. This explicitly leaves the existing unused-image storage issue unresolved in the first release.

Export Markdown as a ZIP with relative image files. Export a separate versioned JSON backup containing machines, notes, progress, and referenced images for lossless re-import; include trash and retained history in full backups. Missing images cause a clearly reported incomplete export, not a success message. Validate backup schema and sizes on import; imported items get new IDs, internal links and attachment references are remapped, and existing notes are not overwritten. Preserve unsupported legacy source markup in the full backup even when the editor conversion cannot represent it.

## 7. Migration and rollback

1. Extract the existing ladder and cheat-sheet data without changing their contents or links. Keep a tested legacy version available for rollback through the previous Vercel deployment and Git history.
2. Sign in to the existing Firebase project and offer an import preview for legacy cloud notes, legacy browser notes, and browser completion flags. Show the destination account before importing.
3. Preserve every weekly note as a single note titled Week N notes, with its week association. Do not guess which machine owns a paragraph. Convert supported formatting and preserve screenshot IDs.
4. Use deterministic migration IDs, source digests, and transactional create-if-absent writes. A repeated import does not overwrite an edited destination, resurrect a deleted destination, or duplicate completed items. If a source changes after import, offer it as a separate recovered note.
5. When cloud and browser versions of a week differ, preserve both as separate notes and label their source. Upload browser-embedded images before marking that item's import complete. Recover safely from partial image uploads and retry failed items without duplicating acknowledged work.
6. Convert the old `platform|name` progress key through an explicit mapping to stable machine IDs. Preserve unmatched entries in the backup and report them rather than silently discarding them. Keep default machine IDs stable across title edits and builds.
7. Keep the original cloud collections and local-storage entries intact. Mark a completed browser import as claimed by its UID on that browser; another UID must explicitly request importing the retained data. An import failure never receives a completion marker.

Browser local storage belongs to an origin. Notes on another domain, a file URL, or a different device cannot be read by the new deployment automatically. Preserve the current production domain where possible; otherwise provide a legacy export helper that runs on the old origin and produces the portable backup before changing that origin. The existing Markdown-only export is not sufficient for guaranteed lossless migration.

After cutover, the legacy app does not receive new notebook edits. Rollback restores the old interface but not edits made in the new format; retain the new data and export it before any operational rollback. Do not dual-write the two formats.

## 8. Deployment and verification

Vercel builds only the application and publishes `dist`, with a route fallback for browser navigation. Repository documents, tests, and setup scripts are not public assets. Firebase web configuration is public application configuration; no admin credentials or private service-account keys enter the browser bundle. Configure preview builds so they do not silently write to production data; default previews to emulator/local demo mode unless explicitly configured for a test Firebase project.

Deploy Firestore rules and indexes separately from Vercel. Validate Firebase project/database settings and authentication setup before deployment. Do not create a new database automatically when a listing request fails. Add relevant deployed domains to authentication configuration where required by enabled flows.

Verification must cover:

- Unit tests for conversion, size validation, local draft persistence, failed saves, stale search entries, import mapping, and export/import round trips.
- Firestore emulator tests for ownership, schemas, non-ASCII size limits, revisions, immutable images, history validation and retention, and migration idempotency.
- Browser tests for offline typing and refresh recovery, two-tab editing, two-device conflict simulation, account switching, expired authentication, rejected writes, screenshot failures, and migration interruption/retry.
- Mobile and desktop editor use, keyboard navigation, labels, visible focus, and code-block whitespace preservation.
- Production build and preview checks, deep-link refresh, offline shell loading, complete/incomplete offline downloads, and absence of private runtime credentials.
- A representative legacy fixture containing code, non-ASCII notes, screenshots, checkboxes, and conflicting local/cloud content, verified before and after migration.

The previous review verified inline JavaScript syntax and reproduced failed-save closing and stale-search behavior. It did not verify live Firebase configuration or emulator rules; this machine currently has no Java runtime. Install or provide the emulator's supported Java runtime during implementation validation, or report that validation as blocked. Never mark rules verified without a successful emulator run.

## 9. Delivery boundaries and acceptance

Implement in reviewable increments: foundation and reference-data preservation; note editor and safe local drafts; authenticated sync and conflicts; migration; exports and offline availability; deployment verification. This order is a delivery outline, not the detailed implementation plan.

The first release is accepted when the user can create/edit machine and topic notes, retain the weekly ladder and cheat sheet, synchronize notes and completion state between devices, recover offline drafts, resolve competing edits without silent loss, export/import a complete notebook with screenshots, and migrate existing data without overwriting originals.

The architecture recommendation has been accepted in chat. This written design is the next review artifact. After its approval, create the detailed implementation plan and select its execution method under the Superpowers workflow.

## References

- Vite on Vercel: https://vercel.com/docs/frameworks/frontend/vite
- Firebase offline behavior: https://firebase.google.com/docs/firestore/manage-data/enable-offline
- Firestore limits: https://firebase.google.com/docs/firestore/quotas
- Firestore indexing guidance: https://firebase.google.com/docs/firestore/best-practices
- Tiptap extensions: https://tiptap.dev/docs/editor/extensions/overview
