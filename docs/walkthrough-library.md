# Written walkthrough library

The public reference library imports 162 Markdown pages (articles and section introductions) from [Perryong/Writeups-and-Walkthroughs](https://github.com/Perryong/Writeups-and-Walkthroughs), a fork of [dev-angelist/Writeups-and-Walkthroughs](https://github.com/dev-angelist/Writeups-and-Walkthroughs). Original author attribution, captions and links are retained. Source snapshot: `dd03effbc624dbb8789fbd7775369769cec81a36`.

Open `/walkthroughs` to search titles, step headings and introductory text, or filter by platform. Matching machines in the study plan and machine list link to their written guide. Matching requires the platform and machine name; guides are never guessed for unrelated machines.

The reader preserves source order, headings, explanations, commands and tables. It provides a table of contents, command copying, keyboard-accessible screenshot expansion and the original source link. GitBook tabs, hints, code captions and attachment references are converted to readable content. It does not invent missing walkthrough steps or claim older lab instructions still match current machines.

## Content and images

`public/walkthroughs/*.json` contains sanitized, generated article HTML. `src/walkthroughs/catalog.json` is the small searchable index. Article bodies load on demand. The import strips executable HTML and unsafe URLs before generating the output.

Screenshots use immutable raw GitHub URLs at the same source revision. The 1,218 imported image references were checked against the snapshot tree. They load lazily when a page is read; network failure shows an explicit warning. The app does not preload the repository's approximately 274 MB of images or place public reference material in private Firestore notes.

An internet connection is required to load uncached article bodies and images. This library is not included in the personal notebook's offline-download feature. Existing private notes, sync, migration and backups are unchanged.

## Refreshing the snapshot

1. Select and review a source commit, then update `revision` in `scripts/import-walkthroughs.mjs`.
2. Run `npm run import:walkthroughs` with network access. This fetches Markdown only, renders it with `marked`, sanitizes it with `sanitize-html`, and writes the article files and catalog.
3. Run `npm test`, `npm run build`, and `npx playwright test e2e/walkthroughs.spec.ts e2e/reference.spec.ts`.
4. Review the generated diff and image references before deploying.

The Markdown parser and sanitizer are development dependencies used only during import; they are not shipped in the reader. Normal builds use the committed snapshot and need no GitHub API access.

## Verification (2026-10-15)

- 60 unit tests and 6 targeted browser tests passed (walkthrough library, study references and local editor).
- Typecheck, production build, formatting and diff whitespace checks passed. Runtime dependency audit: zero reported vulnerabilities.
- All 1,218 image references resolve to files present in the pinned repository tree; one real remote image was also loaded in Chrome. Desktop/mobile layouts were inspected.
- Independent read-only review found no Critical or Important issues. Generated internal article destinations were checked. Private database code was unchanged, so the Firebase emulator suites were not rerun for this change.
- Deferred minor: the source includes empty footnotes/anchors (22 unresolved fragment references were found). For example, RootMe retains an empty footnote marker. Generated contents links work; use the original source link for source-specific references.
- Historical exploitation accuracy, exhaustive visual comparison of every page, legal review, and future GitHub availability were outside verification. The source revision and author links make the provenance explicit.

## Illustrated study guides (2026-10-17)

The library also includes 119 original study outlines accompanying credited 0xdf articles, for 281 entries total. The Study track filter selects 71 OSCP entries or 72 Red Teaming entries (24 appear in both), based on the two LainKusanagi spreadsheet tabs. These are community list memberships, not an official exam syllabus.

These additions contain original reading guidance, short source section labels and selected remote images. They do not reproduce the full source articles; full commands and explanations remain linked to the author. Images require the source host to remain available. Existing repository walkthroughs remain unchanged.

Regenerate with `node scripts/import-study-guides.mjs`. Sources and spreadsheet cells are recorded in `scripts/study-guide-sources.json`; fetched articles are cached under `/tmp/oscp-study-guide-cache`. Review source changes and output before deploying. The generated index is `src/walkthroughs/study-guides.json`, with sanitized bodies in `public/walkthroughs`.
