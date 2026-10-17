import { test } from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { JSDOM } from "jsdom";
import { importArchive } from "./import-hacker-docs.mjs";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { marked } from "marked";

test("preserves code and tables, resolves image case/root paths and internal notes", () => {
  const markdown =
    "# Test\n\n```html\n<script>alert(1)</script>\n```\n\n| A | B |\n|---|---|\n| one | two |\n\n![Proof](./Images/Img1.png)\n![Again](content/Topic/Images/img1.png)\n[Next](Other.md)";
  const result = importArchive(
    zipSync({
      "sample/content/Topic/Note.md": strToU8(markdown),
      "sample/content/Topic/Other.md": strToU8("# Other"),
      "sample/content/Topic/Images/img1.png": new Uint8Array([
        137, 80, 78, 71, 13, 10, 26, 10,
      ]),
    }),
  );
  assert.equal(result.catalog.notes.length, 2);
  const note = result.catalog.notes.find((n) => n.path.endsWith("Note.md"));
  const doc = new JSDOM(result.articles[note.id].html).window.document;
  assert.equal(
    doc.querySelector("pre code").textContent,
    "<script>alert(1)</script>\n",
  );
  assert.equal(doc.querySelectorAll("table").length, 1);
  assert.equal(doc.querySelectorAll("script").length, 0);
  assert.equal(doc.querySelectorAll("img").length, 2);
  assert.ok(doc.querySelector("img").src.startsWith("/hacker-docs/images/"));
  assert.ok(
    doc
      .querySelector("a")
      .getAttribute("href")
      .startsWith("/knowledge-vault/hacker-docs--source-"),
  );
  assert.equal(new TextDecoder().decode(result.markdown[note.id]), markdown);
  assert.equal(result.catalog.repairs.length, 1);
});
test("source HTML is displayed as text, never executed", () => {
  const result = importArchive(
    zipSync({
      "sample/content/Test.md": strToU8(
        "<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert)",
      ),
    }),
  );
  const html = Object.values(result.articles)[0].html;
  const doc = new JSDOM(html).window.document;
  assert.equal(
    doc.querySelectorAll("script,[onerror],a[href^='javascript:']").length,
    0,
  );
  assert.ok(doc.body.textContent.includes("<script>alert(1)</script>"));
});
test("rejects traversal paths and reports absent images without inventing them", () => {
  assert.throws(
    () =>
      importArchive(
        zipSync({ "sample/content/../../escape.md": strToU8("bad") }),
      ),
    /Unsafe/,
  );
  const result = importArchive(
    zipSync({ "sample/content/Test.md": strToU8("![Missing](absent.png)") }),
  );
  assert.equal(result.catalog.missingImages.length, 1);
  assert.ok(
    Object.values(result.articles)[0].html.includes(
      "Image not included in supplied archive",
    ),
  );
});

test("shipped collection retains every source file, code block, table and local image", () => {
  const root = new URL("../public/hacker-docs/", import.meta.url);
  const catalog = JSON.parse(readFileSync(new URL("catalog.json", root)));
  assert.equal(catalog.notes.length, 167);
  assert.equal(catalog.imageCount, 76);
  assert.deepEqual(catalog.missingImages, []);
  let blocks = 0,
    tables = 0,
    references = 0;
  for (const note of catalog.notes) {
    const original = readFileSync(new URL(`${note.id}.md`, root));
    assert.equal(
      createHash("sha256").update(original).digest("hex"),
      note.sha256,
    );
    const source = new JSDOM(marked.parse(original.toString())).window.document;
    const page = new JSDOM(
      JSON.parse(readFileSync(new URL(`${note.id}.json`, root))).html,
    ).window.document;
    const expected = [...source.querySelectorAll("pre code")].map(
      (n) => n.textContent,
    );
    assert.deepEqual(
      [...page.querySelectorAll("pre code")].map((n) => n.textContent),
      expected,
      note.path,
    );
    assert.equal(
      page.querySelectorAll("table").length,
      source.querySelectorAll("table").length,
      note.path,
    );
    assert.equal(
      page.querySelectorAll("script,iframe,[onerror],[onclick]").length,
      0,
    );
    blocks += expected.length;
    tables += page.querySelectorAll("table").length;
    for (const image of page.querySelectorAll("img")) {
      assert.ok(image.getAttribute("src").startsWith("/hacker-docs/images/"));
      assert.ok(
        readFileSync(
          new URL(`../public${image.getAttribute("src")}`, import.meta.url),
        ).length,
      );
      references++;
    }
  }
  assert.deepEqual(
    { blocks, tables, references },
    { blocks: 657, tables: 67, references: 79 },
  );
});
