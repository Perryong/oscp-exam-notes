import { expect, test } from "vitest";
import { emptyNote } from "../notebook/model";
import { validateNote, validateMachine } from "../notebook/validation";
import { workspaceOf, sameWorkspace } from "./model";
import { workspacePath, workspaceFromPath } from "./routes";
test("legacy records default to OSCP and new records declare membership", () => {
  expect(workspaceOf({})).toBe("oscp");
  expect(workspaceOf({ workspace: "osai" })).toBe("osai");
  expect(emptyNote("osai").workspace).toBe("osai");
  expect(sameWorkspace({}, { workspace: "osai" })).toBe(false);
  expect(() => workspaceOf({ workspace: "other" } as never)).toThrow();
});
test("validators accept legacy fields and reject invalid metadata", () => {
  const note = emptyNote();
  delete note.workspace;
  expect(validateNote(note)).toEqual(note);
  expect(validateNote({ ...note, workspace: "osai" }).workspace).toBe("osai");
  for (const workspace of [null, "OSAI", "bad", undefined])
    expect(() => validateNote({ ...note, workspace })).toThrow();
  expect(() => validateNote({ ...note, unknown: true })).toThrow();
  const machine = {
    name: "lab",
    platform: "local",
    os: "",
    tags: [],
    legacyKey: null,
    week: null,
    progress: "not-started",
  };
  expect(validateMachine({ ...machine, workspace: "osai" }).workspace).toBe(
    "osai",
  );
  expect(() => validateMachine({ ...machine, workspace: "bad" })).toThrow();
});
test("routes keep OSCP links and canonicalize OSAI", () => {
  expect(workspacePath("osai", "notes", "abc")).toBe("/osai/notes/abc");
  expect(workspacePath("oscp", "targets")).toBe("/machines");
  expect(workspacePath("osai", "targets")).toBe("/osai/labs");
  expect(workspaceFromPath("/osai/notes")).toBe("osai");
  expect(workspaceFromPath("/osaiish/notes")).toBe("oscp");
});
