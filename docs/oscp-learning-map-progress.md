# OSCP learning map progress
Plan: docs/superpowers/plans/2026-10-17-oscp-learning-map.md
Base: 25281cf
Execution: Native, following user's standing request to proceed without repeated confirmations.
Design: preserve original content; add guided learning and graph navigation. User selected guided topic map with optional full graph.
Task 1: complete — 946 resources indexed, privacy/coverage/backlink tests pass
Task 2: complete — guided/full graph, pan/zoom, selection, search and filters
Task 3: complete — learning home, 11 concept guides, contextual links and exact-section navigation
Task 4: complete — 115 tests pass; production build passes; Chrome desktop/mobile checked; production alias verified

Review: fixed custom machine hash navigation after asynchronous sync and private Knowledge Vault reader aliases/backlinks. Both have regression tests.
Production: https://oscp-exam-notes.vercel.app/mindmap
Release: 6f207c7 (learning map), 7d63943 (pending update survives account remount).
Vercel: dpl_C4NfaE2BG6Ssq5An9ij7yRB1Ciwx — READY, canonical production alias assigned.
Chrome: guided/full map, topic selection and concept-reader navigation verified. Screenshot: /tmp/oscp-mindmap-live.png. Private notes appear only in the signed-in graph; account isolation also covered by automated tests.
During production verification, the update banner vanished on auth remount because readiness existed only in component state. Added a failing regression test, retained readiness in the PWA module, and reran the full suite and build.

Follow-up research: reviewed all 11 repositories listed on the supplied GitHub page 5. OSCP-Tricks-2023 and PEN-200-OSCP are the direct OSCP sources; all-rag-techniques and Hands-On-Large-Language-Models support OSAI foundations. Recommended practice progression: focused drills, guided labs, independent machines, multi-host scenarios, then report writing. Research recommendations do not imply these additional repositories were imported or their commands executed.
