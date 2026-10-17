# OSCP Learning Map Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement inline, followed by a fresh whole-change review.

**Goal:** Connect the existing OSCP content through a simpler learning home, concept pages and interactive Mindmap.
**Architecture:** Static metadata index plus account-scoped runtime graph. React pages share pure graph helpers and topic definitions; existing content remains the source of truth.
**Tech Stack:** React, TypeScript, native SVG, existing Vite/Firebase; no new dependencies.
**Spec:** docs/superpowers/specs/2026-10-17-oscp-learning-map.md

## Global constraints
- Preserve full source content and existing URLs.
- OSCP only. Private graph nodes are runtime-only, current account, non-deleted OSCP data.
- No new dependencies or Firestore schema changes.
- Every indexed resource is reachable; suggested topic connections are distinguished from explicit references.

## Review focus
- Signed-out or switched account: no stale private graph nodes (task 1).
- Unclassified and duplicate-title resources: reachable and stable unique IDs (task 1).
- Large graph and narrow screens: focus view, bounded labels and accessible results list (task 2).
- Direct links, reload and browser navigation: exact content selected (task 3).
- Existing progress, full reference files and OSAI navigation: unaffected (task 4).

## Task 1: Shared content index and learning topics
Files: scripts/build-oscp-index.mjs; src/oscp/topics.ts, resources.json, graph.ts, graph.test.ts.
Interfaces: Topic definitions with id/title/summary/prerequisites/explanation/observations/exercise/misconceptions; Resource with id/title/kind/href/collection/topicIds; buildGraph(resources, notes, machines, signedIn) -> nodes/edges.
- [ ] Write failing coverage/privacy/backlink tests, run and inspect failure.
- [ ] Generate metadata for every reference, guide, practice week and machine. Add curated topic learning content and provenance-labelled graph edges.
- [ ] Add runtime private notes and machine connections without altering persisted content.
- [ ] Run targeted tests and commit.

## Task 2: Mindmap
Files: src/oscp/Mindmap.tsx, GraphCanvas.tsx, useGraph.ts, Mindmap.test.tsx, oscp.css.
Interfaces: `/mindmap?node=<graph-id>` deep link; shared Graph model from task 1.
- [ ] Write failing tests for root view, selection, search and full graph.
- [ ] Build guided/full graph with pan, zoom, keyboard node selection, legend and reset. Add resource search/filter and detail panel with direct links/backlinks; collection nodes expose unclassified resources.
- [ ] Test results and responsive layout; commit.

## Task 3: Easier OSCP learning flow
Files: src/oscp/LearningHome.tsx, Topics.tsx, ResourceContext.tsx; src/reference/StudyPlan.tsx, CheatSheet.tsx; src/app/App.tsx; reader components as needed.
Interfaces: `/topics/:topicId?`; preserve `/study-plan` and weekly content; `/notes?view=tags`; cheat section URL parameters select collection and section.
- [ ] Test topic descriptions and relevant resource results, cheat deep links and public/private separation.
- [ ] Add learning-home sequence, resource discovery and study guidance. Group OSCP navigation into Learn, Practise and Reference. Add reader links back to relevant Mindmap nodes.
- [ ] Verify previous routes/content/progress and OSAI remain functional; commit.

## Task 4: Release verification
- [ ] Run npm test, npm run build, generated-index integrity checks.
- [ ] Fresh reviewer checks whole change; fix actionable issues with regression tests.
- [ ] Push approved working branch and deploy production Vercel.
- [ ] Verify Chrome guided map, topic selection, exact source link, private isolation and mobile layout; save screenshot.
