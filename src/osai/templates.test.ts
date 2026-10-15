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
  ])
    expect(encoded.text).toContain(title);
  expect(encoded.contentJson).toContain("https://example.com/lesson");
  expect(() => decodeEditor(encoded.contentJson)).not.toThrow();
});
