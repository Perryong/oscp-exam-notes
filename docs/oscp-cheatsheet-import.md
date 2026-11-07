# Supplied OSCP cheat sheet

The OSCP `/cheat-sheet` page defaults to the full README from the user's
`OSCP-Cheatsheet-main.zip`, supplied on 2026-10-17. The previous reference
remains available in the collection selector. Personal notes are unaffected.

The archive contains only a README, with no images. Its source credits and
links are retained, including s4thv1k's original page. The source is available
as a byte-for-byte Markdown download. Source SHA-256:
`e58931a72d6814741e466a9c0d6b7b6bb998b2711abc8f2a2822bfa37d6914ed`.

The import contains 61 sections in 9 original top-level groups (including
the introduction) and 111 fenced code blocks. It preserves content rather
than summarising it. Commands are source material and have not been executed
or re-tested. Presentation-only aside/details wrappers become normal content
and summary headings; indented fences are normalized for readable code.
Other raw HTML is escaped and rendered output is allowlist-sanitized.

Regenerate with:

```sh
npm run import:cheatsheet -- /absolute/path/OSCP-Cheatsheet-main.zip
```

Run `npm test` and `npm run build`. Import tests check the source hash,
all 111 code blocks in order, unsafe markup, and duplicate heading IDs.
UI tests cover collection switching, full-text search, copying one block,
and empty results.
