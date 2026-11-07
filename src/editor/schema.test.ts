import { test, expect } from "vitest";
import { decodeEditor, encodeEditor } from "./schema";
import { createMachineTemplate } from "./templates";
test("preserves command whitespace and non-ASCII text", () => {
  const doc = {
    type: "doc",
    content: [
      {
        type: "codeBlock",
        content: [{ type: "text", text: "whoami\n\tsudo -l\n你好 `test`" }],
      },
    ],
  };
  expect(encodeEditor(decodeEditor(JSON.stringify(doc))).text).toBe(
    "whoami\n\tsudo -l\n你好 `test`",
  );
});
test("rejects unknown nodes and executable links", () => {
  expect(() => decodeEditor("{")).toThrow();
  expect(() =>
    decodeEditor(
      JSON.stringify({ type: "doc", content: [{ type: "script" }] }),
    ),
  ).toThrow();
  expect(() =>
    decodeEditor(
      JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "x",
                marks: [
                  { type: "link", attrs: { href: "javascript:alert(1)" } },
                ],
              },
            ],
          },
        ],
      }),
    ),
  ).toThrow();
});
test("OSCP box template captures objectives, commands, evidence and findings", () => {
  const template = createMachineTemplate();
  const encoded = encodeEditor(template);
  const headings = template.content
    ?.filter((n) => n.type === "heading")
    .map((n) => n.content?.[0].text);
  for (const heading of [
    "Objectives and authorized scope",
    "Enumeration",
    "Initial access",
    "Privilege escalation",
    "Commands and results",
    "Evidence",
    "Findings",
    "Lessons learned",
    "References and next steps",
  ]) {
    expect(headings).toContain(heading);
  }
  expect(template.content?.some((n) => n.type === "codeBlock")).toBe(true);
  expect(encoded.text).toContain("Expected result");
  expect(encoded.text).toContain("Evidence ID");
  expect(() => decodeEditor(encoded.contentJson)).not.toThrow();
});

test("pasted unsupported URI protocols remain readable text that can be saved", async () => {
  const { generateJSON } = await import("@tiptap/core");
  const { extensions } = await import("./schema");
  for (const href of ["mailto:student@example.com", "ftp://lab.example.com"]) {
    const parsed = generateJSON(
      `<p><a href="${href}">Keep my text</a></p>`,
      extensions,
    );
    expect(encodeEditor(parsed).text).toBe("Keep my text");
  }
});
