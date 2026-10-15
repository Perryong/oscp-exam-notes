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
