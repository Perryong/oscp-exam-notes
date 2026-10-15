# OSCP and OSAI workspaces in Fieldnotes

Date: 2026-10-15
Status: Proposed design for user review; implementation has not started.

## Intent and approved direction

The user wants a personal OSAI study notebook informed by Kongsec's OSAI Training Vault, OffSec AI-300, and OWASP educational resources. They selected separate OSCP and OSAI workspaces inside the existing deployed Fieldnotes application and approved the proposed feature scope. Success means reading organized OSAI material, recording reproducible lab work with screenshots, and syncing personal notes across devices without mixing them with existing OSCP study data.

Keep the existing Vercel application, Firebase project, authentication, editor, and synchronization engine. Workspace separation organizes one owner's data; it is not a new authorization boundary between different people. No new external project or paid service is required.

## User experience

Add a visible OSCP / OSAI workspace selector to the shared shell. The selected workspace controls the title, navigation, study plan, reference pages, notes, topics, study targets, and trash. Settings, account identity, full backup, recovery, and device management remain account-wide and are explicitly labeled accordingly.

Preserve existing OSCP URLs, including /study-plan, /notes, /notes/:id, /machines, /topics, /cheat-sheet, and /walkthroughs. OSAI uses /osai/study-plan, /osai/topics, /osai/notes, /osai/notes/:id, /osai/labs, /osai/library, /osai/library/:slug, and /osai/trash. URLs determine workspace; a local last-selection preference may help navigation but cannot override a deep link. Switching workspace saves the current editor draft before navigation, preserving existing conflict handling.

An existing /notes/:id link to an OSAI note resolves to its canonical OSAI route after loading metadata. An OSAI route pointing to an OSCP note redirects to the OSCP route. Unknown or unavailable notes show the existing recoverable not-found state. Private data still requires authentication.

## OSAI content and first-release scope

Provide an original, attributed study library organized into seven groups:

1. Foundations: AI/ML concepts, LLM application architecture, and trust boundaries.
2. Prompt and output security: direct/indirect injection, jailbreak distinctions, disclosure, and output handling.
3. Retrieval: embeddings, vector stores, document provenance, and RAG security.
4. Agents: tool permissions, excessive agency, multi-agent boundaries, and evaluation.
5. Models and data: extraction concepts, poisoning, and supply-chain security.
6. Infrastructure: APIs, serving environments, credentials, deployment boundaries, and case-study analysis.
7. Assessment: lab practice, reproducibility, mitigations, evidence, and reporting.

Ship one substantial overview lesson per group, a glossary, an OWASP 2025 cross-reference, a curated resources page, and an exam-preparation page. This is a starter library, not a claim to reproduce the full official course. Each lesson includes objectives, explanation, relevant architecture or flow, a bounded practice checklist, expected observations, remediation, further reading, and verification date. Add original diagrams where they clarify trust boundaries. Include links to Kongsec sections without importing its complete HTML, images, or scripts.

References are build-time static content, served on demand. Personal annotations and screenshots are private synced notes. No automated exploit execution, model API calls, AI assistant, or API-key storage is part of this release. Code snippets are inert text with copy controls. External links are labeled; their availability is not required for the notebook to load.

Each reference has a stable slug, title, group, summary, source URLs, source classification (official/community), checked date, and explicit OWASP edition where applicable. Research observations are distinguished from verified exam requirements. Do not copy speculative exam scoring or priorities from community notes.

## Learning progress and lab records

Reuse the existing study-target machinery and progress states: not started, in progress, completed. OSAI presents this as learning progress and labs, while OSCP retains Machines.

Use stable, workspace-prefixed seed IDs for the seven OSAI learning groups. These are virtual seed records until edited, following the existing OSCP seed pattern. Seed membership identifies curriculum entries; other OSAI target records are personal labs. Never seed OSCP machines into an OSAI view. Keep the existing stored machine entity name to avoid an unrelated collection rename.

Creating a note from a lesson links it to the corresponding learning target and includes the source URL. Lab-note templates contain objective/scope, environment and model version, prerequisites, numbered steps, prompts/commands, expected versus observed results, screenshots, repeated-trial results, impact, mitigations, and references. Users can edit all template content. Bookmarking is a personal note tagged bookmark with a source link; avoid a second persistence subsystem. Search remains scoped to the selected workspace and includes titles, tags, and note text.

## Data compatibility and rules

Introduce WorkspaceId = oscp | osai on note and machine content. The workspace field is optional only for legacy records: missing means OSCP. New records always write an explicit workspace. Retain note schemaVersion 1 for this additive change; validators explicitly accept the original field set or that set plus a valid workspace. Unknown fields and invalid workspace values remain rejected. Normalization must preserve workspace on edit, conflict recovery, history restoration, migration, and import.

Keep current owner-scoped Firestore collections and globally unique entity IDs. No collection move, database wipe, or bulk rewrite is required. Keep the existing IndexedDB name and keys so pending drafts and cached notes remain accessible. Apply the same defaulting rule to local records and history snapshots. Workspace changes are not supported in this release: a missing/OSCP record may acquire explicit oscp, but records cannot move between workspaces. Firestore rules enforce this immutability on updates, including rejecting removal of osai by an older client.

Validate linked note/target workspace agreement at creation and linking, and during backup validation. Cross-workspace links are rejected. Firestore checks the linked target's workspace when it exists; virtual seed references must be restricted to the known seed-ID convention for the note's workspace. Preserve owner checks, size limits, revision checks, attachment constraints, and deletion tombstones.

The shared subscription/sync layer continues handling all owner records. Filter for display through a workspace selector rather than replacing the account-wide cache with a partial workspace query. This avoids losing cached records and keeps pending background synchronization and account-wide backup correct. Images remain owner-scoped and are resolved through their note attachments.

## Backup, restore, offline, and migration

Export a version 2 full-account backup containing both workspaces, their histories, linked targets, images, and recovery drafts. Record workspace on all exported entities, including normalized legacy records. Clearly label the export as covering both workspaces.

Continue accepting version 1 backups as OSCP-only. Reject a version 1 document that attempts to introduce OSAI workspace data. Version 2 validates workspace membership, history consistency, cross-workspace references, and all existing limits before writing. Restore retains workspace while remapping IDs and links. Support both legacy /notes/:id and new /osai/notes/:id internal links during remapping. Legacy browser/cloud migrations always land in OSCP regardless of the currently selected UI workspace.

Offline download and full backup remain account-wide for this release. Existing completeness and missing-item reporting remain in place. OSAI references may be read after successful retrieval only if explicitly cached; do not advertise offline reference availability without a verified download workflow. Private offline drafts keep the existing behavior. Workspace switching must not discard pending edits, conflicts, or recovery copies.

## Components and boundaries

- Workspace configuration: IDs, route helpers, labels, seed selection, and legacy defaulting.
- Shared notebook: editor, sync, cache, history, recovery, and owner authorization.
- Workspace views: filtered notes, topics, targets, trash, and progress.
- OSAI reference library: static catalog, lesson reader, source metadata, and original diagrams.
- Transfer compatibility: versioned validation, normalization, ID remapping, and scope labels.

Avoid duplicating the editor or repository layer. Do not rename the whole application, replace its framework, or refactor unrelated OSCP reference material.

## Verification and release

Test legacy workspace defaulting; strict allowed fields; immutable workspace; same-workspace linking; unauthorized writes; seed separation; recovery/history preservation; version 1 import; version 2 round trips; link remapping; and legacy migration while OSAI is selected.

Browser checks cover switching with unsaved edits, direct links, separate search/trash/progress, OSAI lesson-to-note creation, screenshots, mobile layout, sign-out isolation, and offline edits in both workspaces. Existing OSCP tests must continue passing. Run typecheck, formatting, production build, unit tests, Firestore emulator rules/integration tests, and relevant browser/release tests. Check reference links and render diagrams on desktop and mobile.

Publish compatible rules before the frontend. Use emulator validation before any live rule changes. A production release needs a smoke check of both study areas and the sign-in page; authenticated create/sync/export verification requires the owner's session. No production notes are created or deleted merely to migrate workspace metadata.

Rollback must preserve the database and both workspaces. After OSAI records exist, the previous frontend is not a safe normal client because it cannot distinguish the new workspace. Prefer a corrective forward release; any rollback needs a compatibility build that hides OSAI data and retains the new rules. Export a full version 2 backup before a rollback operation. Deployment is a later execution step, not part of this design-only change.

## Research basis and corrections

Checked 2026-10-15:

- OffSec AI-300: https://www.offsec.com/courses/ai-300/
- Official exam guide: https://help.offsec.com/hc/en-us/articles/46593096734612-OSAI-Exam-Guide
- Kongsec source: https://github.com/kongsec/OSAINotesResearch
- Kongsec site: https://kongsec.github.io/OSAINotesResearch/
- OWASP educational resources: https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/wiki/Educational-Resources
- OWASP risk taxonomy: https://genai.owasp.org/llm-top-10/

OffSec specifies a 24-hour practical exam and a further 24 hours for documentation. Kongsec's 48-hour practical claim conflicts with this. Its numbered sections 00–22 total 23, despite a 22-module label. These inconsistencies make source review necessary. The repository has no declared license at inspection; the proposed library uses original writing and source links rather than wholesale republication. Recheck exam information before release and display the verification date.

## Self-review

This design specifies first-release content, compatibility defaults, storage boundaries, transfer versions, user-visible scope, failure behavior, tests, and rollout ordering. It does not add a separate website or promise full official-course coverage. Implementation planning follows user review of this document.
