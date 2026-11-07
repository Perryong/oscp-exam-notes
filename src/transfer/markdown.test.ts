import { test, expect } from "vitest";
import { toMarkdown } from "./markdown";
test("code containing triple backticks uses a longer fence", () => {
  const text = "echo ```\n  spaced";
  expect(
    toMarkdown(
      {
        type: "doc",
        content: [{ type: "codeBlock", content: [{ type: "text", text }] }],
      },
      {},
    ),
  ).toContain("````\n" + text + "\n````");
});
test("screenshots export as relative image files", () => {
  expect(
    toMarkdown(
      {
        type: "doc",
        content: [{ type: "screenshot", attrs: { imageId: "i", alt: "shot" } }],
      },
      { i: "images/i.png" },
    ),
  ).toContain("![shot](images/i.png)");
});
