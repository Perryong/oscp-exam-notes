import { test, expect } from "vitest";
import { validateBundle, remapBundle } from "./backup";
import {
  bundle,
  noteContent,
  imageRecord,
  machineContent,
} from "../../tests/fixtures/builders";
const saved = <T>(id: string, content: T) => ({
  id,
  content,
  revision: 1,
  lastMutationId: "m",
  createdAt: 1,
  updatedAt: 1,
});
test("rejects invalid versions, duplicate IDs and missing screenshot bytes", () => {
  expect(() => validateBundle({ ...bundle(), version: 99 })).toThrow();
  const n = saved("n", noteContent());
  expect(() => validateBundle(bundle({ notes: [n, n] }))).toThrow();
  expect(() =>
    validateBundle(
      bundle({
        notes: [saved("n", noteContent({ attachmentIds: ["missing"] }))],
      }),
    ),
  ).toThrow();
});
test("remaps machines, screenshot nodes and internal note links consistently", () => {
  const input = bundle({
    machines: [saved("m", machineContent())],
    images: [imageRecord()],
    notes: [
      saved(
        "n",
        noteContent({
          machineId: "m",
          attachmentIds: ["img1"],
          contentJson: JSON.stringify({
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "link",
                    marks: [{ type: "link", attrs: { href: "/notes/n" } }],
                  },
                ],
              },
              { type: "screenshot", attrs: { imageId: "img1", alt: "shot" } },
            ],
          }),
        }),
      ),
    ],
  });
  const result = remapBundle(validateBundle(input));
  expect(result.bundle.notes[0].id).not.toBe("n");
  expect(result.bundle.notes[0].content.machineId).toBe(
    result.bundle.machines[0].id,
  );
  expect(result.bundle.notes[0].content.attachmentIds[0]).toBe(
    result.bundle.images[0].id,
  );
  expect(result.bundle.notes[0].content.contentJson).toContain(
    "/notes/" + result.bundle.notes[0].id,
  );
});
test("rejects IDs reused across entity kinds before allocating a restore map", () => {
  expect(() =>
    validateBundle(
      bundle({
        notes: [saved("same", noteContent())],
        images: [imageRecord({ id: "same" })],
      }),
    ),
  ).toThrow();
});
test("workspace backup v2 preserves membership and rejects mixed references", () => {
  const n = saved("n", noteContent({ workspace: "osai", machineId: "m" }));
  const m = saved("m", machineContent({ workspace: "osai" }));
  const b = { ...bundle({ notes: [n], machines: [m] }), version: 2 };
  expect(validateBundle(b).notes[0].content.workspace).toBe("osai");
  expect(() => validateBundle({ ...b, version: 1 })).toThrow();
  expect(() =>
    validateBundle({
      ...b,
      machines: [saved("m", machineContent({ workspace: "oscp" }))],
    }),
  ).toThrow();
  expect(() =>
    validateBundle({
      ...b,
      history: { n: [saved("n", noteContent({ workspace: "oscp" }))] },
    }),
  ).toThrow();
  expect(() =>
    validateBundle({
      ...b,
      notes: [
        saved(
          "n",
          Object.fromEntries(
            Object.entries(noteContent()).filter(
              ([key]) => key !== "workspace",
            ),
          ),
        ),
      ],
    }),
  ).toThrow();
  expect(
    validateBundle(bundle({ notes: [saved("old", noteContent())] })).notes[0]
      .content.workspace,
  ).toBe("oscp");
  const link = JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "note",
            marks: [{ type: "link", attrs: { href: "/osai/notes/n" } }],
          },
        ],
      },
    ],
  });
  const mapped = remapBundle(
    validateBundle({
      ...b,
      notes: [{ ...n, content: { ...n.content, contentJson: link } }],
    }),
  );
  expect(mapped.bundle.notes[0].content.contentJson).toContain(
    "/osai/notes/" + mapped.bundle.notes[0].id,
  );
});
