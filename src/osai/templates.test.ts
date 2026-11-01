import { test, expect } from "vitest";
import { createOsaiLabTemplate } from "./templates";
import { encodeEditor, decodeEditor } from "../editor/schema";
test("OSAI lab template captures reproducible evidence and attributed source", () => {
  const encoded = encodeEditor(
    createOsaiLabTemplate({
      title: "Lesson",
      url: "https://example.com/lesson",
    }),
  );
  for (const title of [
    "Objective",
    "Environment",
    "Prerequisites",
    "Steps",
    "Prompts",
    "Expected",
    "Screenshots",
    "Repeated trials",
    "Impact",
    "Mitigations",
    "References",
    "Findings",
    "Lessons learned",
  ])
    expect(encoded.text).toContain(title);
  expect(encoded.contentJson).toContain("https://example.com/lesson");
  expect(() => decodeEditor(encoded.contentJson)).not.toThrow();
});

test("AI lab template has editable experiment prompts and independent fresh documents", () => {
  const one = createOsaiLabTemplate();
  const two = createOsaiLabTemplate();
  expect(one.content?.some((n) => n.type === "codeBlock")).toBe(true);
  expect(encodeEditor(one).text).toContain("Evidence ID");
  expect(encodeEditor(one).text).toContain("Success criterion");
  one.content!.push({
    type: "paragraph",
    content: [{ type: "text", text: "My result" }],
  });
  expect(encodeEditor(two).text).not.toContain("My result");
});
