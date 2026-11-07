import { test } from "node:test";
import assert from "node:assert/strict";
import { extractLegacy } from "./extract-reference.mjs";
test("extracts JSON without executing the source page", () => {
  const html =
    'const PLAN = [{"week":1,"boxes":[{"name":"Markup"}]}];\nconst CHEAT = [{"id":"cs1","text":"nmap"}];\nthrow new Error("must not execute");';
  assert.deepEqual(extractLegacy(html), {
    PLAN: [{ week: 1, boxes: [{ name: "Markup" }] }],
    CHEAT: [{ id: "cs1", text: "nmap" }],
  });
});
