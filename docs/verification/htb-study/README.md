# React HTB schedule and calendar verification

Date: 7 November 2026. Branch: `codex/structured-study-templates`, PR #4.

The existing main-branch HTB plan is ported to `/htb-study` and `/calendar`: 51 weeks, 27 remaining modules, 348 course hours, 10 hours per week, seven checkpoint weeks, and the original dated allocations. Source JSON and all 13 Learning Process asset files (12 diagrams plus provenance) match the legacy source. The source snapshot is 7 November; there is no automatic HTB account sync or fixed exam deadline.

Verified before commit:

- 164 unit tests and 10 importer tests passed, including reserved-week backup retention and cold-cache imported-note reuse under remapped IDs.
- 16 Firestore rules tests, 18 sync integration tests and all 22 browser tests passed using local demo-project emulators.
- TypeScript, Vite and PWA build passed with emulator configuration.
- New browser coverage verifies all 51 week links, old HTML/deep links, week/month navigation, mobile overflow, diagram loading, completion across repeated module allocations, editable weekly templates, reuse of the same note, a fresh browser's cloud progress/notes, and workspace isolation.
- Review found a cold-cache duplicate-note risk; fixed by querying remote notes by reserved week before creating a new note or requesting legacy import. Four regression cases cover imported IDs, retained browser/cloud HTML and imported trash.
- New and modified code passes formatting. Repository-wide formatting still reports three unchanged files: `src/oscp/PracticeTracks.test.tsx`, `src/oscp/resources.json`, and `src/walkthroughs/study-guides.json`.

No schema, Firestore rules, indexes, Firebase settings, resource datasets or existing note documents are changed. HTB progress uses normal revisioned OSCP progress records, excluded from machine UI and attachment choices. Weekly notes use weeks 201–251 with no machine link. Existing notes are reused; unimported legacy notes require the existing explicit Settings import. Trash/purge and account identity checks remain in force. Browser-only module completion uses the original keys and stays separate from signed-in completion.

Deployment uses a clean archive of the committed branch with the existing Vercel Production environment and current Firebase project `oscp-notes`. Stage with `--prod --skip-domain`, verify built routes/assets, then promote. Automatic Git Preview continues to require a separate test project; its guard is unchanged. Local environment files, unrelated drafts and private backups are excluded. Production verification uses public read-only checks; no live private note is created or edited for this release.
