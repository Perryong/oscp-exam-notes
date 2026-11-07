import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { renderCheatsheet } from "./import-cheatsheet.mjs";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

test("shipped source matches the supplied archive and preserves all 111 fenced blocks", () => {
  const bytes = readFileSync("public/oscp-cheatsheet/README.md");
  const catalog = JSON.parse(
    readFileSync("src/reference/imported-cheatsheet.json", "utf8"),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "e58931a72d6814741e466a9c0d6b7b6bb998b2711abc8f2a2822bfa37d6914ed",
  );
  assert.equal(catalog.sections.length, 61);
  const doc = new JSDOM(catalog.sections.map((s) => s.html).join("")).window
    .document;
  const expected = [];
  let indent = null,
    lines = [];
  for (const line of bytes.toString().split("\n")) {
    const match = line.match(/^(\s*)```/);
    if (match && indent === null) {
      indent = match[1];
      lines = [];
    } else if (match) {
      expected.push(lines.join("\n").replace(/\n*$/, "\n"));
      indent = null;
    } else if (indent !== null)
      lines.push(line.startsWith(indent) ? line.slice(indent.length) : line);
  }
  assert.equal(expected.length, 111);
  assert.deepEqual(
    [...doc.querySelectorAll("pre code")].map((n) => n.textContent),
    expected,
  );
  assert.equal(doc.querySelectorAll(".copy-command").length, 111);
});

test("keeps fenced commands intact, handles source details and retains duplicate headings in separate topics", () => {
  const source =
    "# Reference\nIntro\n# Windows\n## Basic\n<details>\n<summary>Paths</summary>\n    ```text\n    C:/Windows\n    # command comment\n    ```\n</details>\n# Linux\n## Basic\n```sh\nid\n```\n";
  const sections = renderCheatsheet(source);
  assert.equal(sections.filter((s) => s.title === "Basic").length, 2);
  assert.equal(new Set(sections.map((s) => s.id)).size, sections.length);
  const doc = new JSDOM(sections.map((s) => s.html).join("")).window.document;
  assert.deepEqual(
    [...doc.querySelectorAll("pre code")].map((n) => n.textContent),
    ["C:/Windows\n# command comment\n", "id\n"],
  );
  assert.match(doc.body.textContent, /Paths/);
});

test("source HTML is inert and unsafe links never become executable", () => {
  const result = renderCheatsheet(
    '# Topic\n<script>alert(1)</script>\n\n[click](javascript:alert)\n\n<iframe src="https://example.com"></iframe>',
  );
  const doc = new JSDOM(result.map((s) => s.html).join("")).window.document;
  assert.equal(
    doc.querySelectorAll('script,iframe,[onclick],a[href^="javascript:"]')
      .length,
    0,
  );
  assert.match(doc.body.textContent, /<script>/);
});
