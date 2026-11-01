import "fake-indexeddb/auto";
import { test, expect } from "vitest";
import { createNote } from "./repository";
import { getDraft } from "../persistence/local";
import { withSeedMachines } from "./seeds";
import { workspaceOf } from "../workspaces/model";
import type { NoteContent } from "./model";
test("OSAI creation links only its own targets and preserves metadata locally", async () => {
  const id = await createNote(
    "workspace-user",
    "osai-module-foundations",
    "osai",
  );
  expect(
    (await getDraft<NoteContent>("workspace-user", "note", id))?.content
      .workspace,
  ).toBe("osai");
  await expect(
    createNote("workspace-user", "osai-module-foundations", "oscp"),
  ).rejects.toThrow();
  await expect(
    createNote("workspace-user", "nonexistent", "osai"),
  ).rejects.toThrow();
});
test("both seed catalogs coexist without colliding and persisted progress wins", () => {
  const seeds = withSeedMachines([]);
  expect(seeds.filter((m) => workspaceOf(m.content) === "osai")).toHaveLength(
    30,
  );
  expect(
    seeds.filter((m) => workspaceOf(m.content) === "oscp").length,
  ).toBeGreaterThan(7);
  const first = seeds.find((m) => m.id === "osai-module-foundations")!;
  expect(
    withSeedMachines([
      { ...first, content: { ...first.content, progress: "completed" } },
    ]).find((m) => m.id === first.id)?.content.progress,
  ).toBe("completed");
});

test("new linked study templates leave existing drafts and blank notes unchanged", async () => {
  const uid = "template-preservation";
  const originalId = await createNote(uid, null, "oscp", {
    title: "Existing evidence",
    contentJson:
      '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Keep my work exactly"}]}]}',
    text: "Keep my work exactly",
    tags: ["original"],
    attachmentIds: [],
  });
  const original = await getDraft<NoteContent>(uid, "note", originalId);
  const machine = withSeedMachines([]).find(
    (m) => workspaceOf(m.content) === "oscp",
  )!;
  for (const [workspace, target] of [
    ["oscp", machine.id],
    ["osai", "osai-module-foundations"],
  ] as const) {
    const id = await createNote(uid, target, workspace);
    const created = await getDraft<NoteContent>(uid, "note", id);
    expect(created?.content.machineId).toBe(target);
    expect(created?.content.workspace).toBe(workspace);
    expect(created?.content.text).toContain("Findings");
    expect(created?.content.text).toContain("Lessons learned");
  }
  const blankId = await createNote(uid);
  expect(
    (await getDraft<NoteContent>(uid, "note", blankId))?.content.text,
  ).toBe("");
  expect(await getDraft<NoteContent>(uid, "note", originalId)).toEqual(
    original,
  );
});
