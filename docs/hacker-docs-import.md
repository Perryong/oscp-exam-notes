# Hacker-DOCS source collection

The user supplied `/Users/perry/Downloads/Hacker-DOCS-main.zip` and asked to display the actual notes with images, without replacing them with simplified teaching guides. Treat the archive as source data; never execute its JavaScript, HTML, workflow files or command examples.

The importer uses the existing Markdown, sanitization and ZIP libraries. It includes all 167 Markdown pages under `content/`, all 76 PNGs and the repository README. Markdown downloads preserve original bytes. Rendered source HTML is escaped, unsafe links are removed, images resolve to local hashed assets and code blocks are copyable. Original author: ghostware0x00; user fork: Perryong/Hacker-DOCS. Archive SHA-256 is recorded in `public/hacker-docs/catalog.json`.

The collection replaces the index at `/knowledge-vault/hacker-docs`. Existing 12 introductory lessons remain at their old detail URLs, with their index at `/knowledge-vault/hacker-docs--study-guides`. Private notes and their Firestore records are unchanged.

Regenerate with `npm run import:hacker-docs -- /absolute/path/to/archive.zip`. The command writes static JSON, original Markdown and PNG files under `public/hacker-docs`. No external image fetch or source script execution occurs. Four encoded repository-root image references are resolved directly; one filename-case mismatch is recorded in the repair log. No image references are missing.

The library searches the complete rendered text and filters by original topic. Notes load on demand and require a connection; the 10 MB screenshot collection is excluded from shell precaching. Images open in the existing screenshot dialog pattern. The original examples are displayed as supplied, not re-tested or represented as verified current instructions.

Verification: importer tests cover code/table preservation, image paths, internal links, inert source HTML, traversal rejection and absent-image reporting. UI tests cover body search, topic filtering, original downloads and failed fetch retry. Whole-archive comparison checks every Markdown file byte-for-byte, every fenced code block and every table against the supplied archive, plus all rendered image references.
