import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { convertVault } from "./import-osai-vault.mjs";
const source = readFileSync(
  new URL("./sources/osai-vault.html", import.meta.url),
  "utf8",
);
const doc = (html) => new JSDOM(html).window.document;
test("preserves all 23 modules, every code example and table without summarization", () => {
  const original = doc(source),
    result = doc(convertVault(source).html);
  assert.equal(result.querySelectorAll(".module").length, 23);
  for (const module of original.querySelectorAll(".module")) {
    const imported = result.getElementById(module.id);
    assert.ok(imported, module.id);
    assert.equal(
      imported.textContent.replace(/\s+/g, " ").trim(),
      module.textContent.replace(/\s+/g, " ").trim(),
    );
  }
  for (const selector of ["pre", "table", "a"]) {
    assert.deepEqual(
      [...result.querySelectorAll(selector)].map((e) => e.textContent),
      [...original.querySelector("#main").querySelectorAll(selector)].map(
        (e) => e.textContent,
      ),
    );
  }
  assert.equal(result.querySelectorAll("h2[id]").length, 23);
});
test("untrusted markup is inert while escaped code remains readable", () => {
  const article = convertVault(
    source.replace(
      '<div class="module" id="m0">',
      '<div class="module" id="m0" onclick="alert(1)"><script>alert(1)</script><iframe src="https://example.com"></iframe><a href="javascript:alert(1)">unsafe</a>',
    ),
  );
  const output = doc(article.html);
  assert.equal(
    output.querySelector('script,iframe,[onclick],a[href^="javascript:"]'),
    null,
  );
  assert.ok(output.querySelector("pre").textContent.length > 0);
  assert.equal(article.title, "OSAI Vault");
});

test("shipped vault matches the verified source conversion", () => {
  const shipped = JSON.parse(
    readFileSync(
      new URL("../src/osai/content/osai-vault.json", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(shipped, convertVault(source));
});
