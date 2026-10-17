# Hacker-DOCS study collection implementation plan

> Use superpowers:executing-plans, following the user's established Native workflow and instruction to proceed without confirmation.

**Goal:** Improve OSCP notes with an ordered, readable collection informed by Hacker-DOCS.

**Architecture:** Add 12 original lessons inside the existing Knowledge Vault, with static typed content, React-rendered diagrams, pinned source links, search and previous/next navigation. Reuse the existing note creation API for editable private copies. Preserve Discord notes and all existing routes.

**Tech stack:** React, TypeScript, existing TipTap document encoding and Firestore note repository. No new dependencies.

**Design:** The repository covers network and web pentesting. No license was present at snapshot c430f79ecfae0e9875935e61d979d0274cd1a1b5. Use original teaching text and diagrams; link to source documents rather than redistributing lab answers or screenshots. Cover discovery, services, DNS, SMB, HTTP, fingerprinting, proxy comparisons, fuzzing validation, authentication, SQL, file integrity and evidence. Include safe illustrative commands where useful, expected observations, caveats and troubleshooting. This is a curated foundation collection, not a full repository import.

## Constraints and review focus

- Public study material must remain distinct from private saved notes.
- Unknown lesson IDs must display a recoverable not-found state.
- Search must find concepts within lesson bodies.
- Note creation failures must be visible; repeated clicks while saving must not duplicate writes.
- Existing Discord image rendering and note editing must remain functional.

## Task 1: Collection and reader

Files: `src/notebook/HackerDocs.tsx`, `hackerDocsContent.ts`, `hacker-docs.json`, `HackerDocs.test.tsx`; update `KnowledgeVault.tsx`.

- [x] Add failing tests for collection discovery, body search, lesson display and invalid IDs.
- [x] Author original lessons with source paths pinned to the reviewed commit.
- [x] Render searchable cards, accessible diagrams, examples, observations, troubleshooting and navigation inside Knowledge Vault.
- [x] Add editable-copy action using `createNote` and `encodeEditor`; test document preservation and failure state.
- [x] Run focused tests, full unit suite and production build.
- [x] Review diff, inspect browser rendering, commit and deploy under existing deployment authorization; check production assets and Chrome.

## Verification ledger

- 90 unit tests and 3 OSAI source-conversion tests passed; typecheck and production build passed. Existing large-bundle advisory remains.
- Fresh review found a scroll-position issue; fixed on lesson navigation and covered by a regression test.
- Ruling: bundled lessons are readable signed out, matching the app’s other study references. Private vault topics are explicitly empty without a uid, and creating an editable copy still requires sign-in. Reviewer checked the auth boundary and found no exposure.
- Local browser verified all 12 cards, full HTTP lesson and diagram.
- Commit/deployment/live verification pending below.
