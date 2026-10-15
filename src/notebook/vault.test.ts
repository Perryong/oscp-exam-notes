import { expect, test } from "vitest";
import { vaultNotes } from "./vault";
import { emptyNote, type Saved, type NoteContent } from "./model";
const note = (
  id: string,
  title: string,
  extra: Partial<NoteContent> = {},
): Saved<NoteContent> => ({
  id,
  content: { ...emptyNote(), title, tags: ["discord-resources"], ...extra },
  revision: 1,
  createdAt: 0,
  updatedAt: 0,
  lastMutationId: "x",
});
test("vault keeps private OSCP topic notes in numeric order and excludes index, trash and other workspaces", () => {
  expect(
    vaultNotes([
      note("b", "Discord resources · 10 · Labs"),
      note("a", "Discord resources · 02 · Web"),
      note("index", "00 · Index", { tags: ["discord-resources", "index"] }),
      note("trash", "03 · Linux", { deletedAt: 1 }),
      note("ai", "04 · AI", { workspace: "osai" }),
      note("other", "05 · Other", { tags: [] }),
    ]).map((n) => n.id),
  ).toEqual(["a", "b"]);
});
