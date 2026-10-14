import "fake-indexeddb/auto";
import { test, expect, vi, beforeEach } from "vitest";
import {
  collectBackup,
  exportBackup,
  validateBundle,
  importBackup,
} from "./backup";
import {
  cacheSaved,
  clearAccountCache,
  saveDraft,
  listConflicts,
  putLocalImage,
} from "../persistence/local";
import { noteContent, draft, imageRecord } from "../../tests/fixtures/builders";
import { seedMachines } from "../notebook/seeds";
const state = vi.hoisted(() => ({
  offline: false,
  notes: [] as any[],
  history: [] as any[],
  images: new Map<string, any>(),
}));
vi.mock("../firebase/client", () => ({
  requireOwner: () => {},
  getClient: () => ({ db: {} }),
}));
vi.mock("firebase/firestore", () => ({
  collection: (_db: unknown, ...p: string[]) => p.at(-1),
  getDocs: async (kind: string) => ({
    docs: state.offline ? [] : kind === "notebookNotes" ? state.notes : [],
  }),
  getDocsFromServer: async (kind: string) => {
    if (state.offline) throw Error("offline");
    return { docs: kind === "notebookNotes" ? state.notes : [] };
  },
}));
vi.mock("../firebase/notes", () => ({
  fromSnapshot: (x: any) => x,
  listHistory: async () => state.history,
  commitNote: async () => ({ kind: "saved" }),
  readEntity: async () => null,
}));
vi.mock("../firebase/machines", () => ({
  commitMachine: async () => ({ kind: "saved" }),
}));
vi.mock("../firebase/images", () => ({
  loadImage: async (_uid: string, id: string) => state.images.get(id) || null,
  ensureImage: async (_uid: string, i: any) => {
    state.images.set(i.id, i);
  },
}));
const saved = (id: string, content = noteContent()) => ({
  id,
  content,
  revision: 2,
  lastMutationId: "m",
  createdAt: 1,
  updatedAt: 2,
});
beforeEach(async () => {
  await clearAccountCache("alice");
  await clearAccountCache("bob");
  state.offline = false;
  state.notes = [];
  state.history = [];
  state.images.clear();
});
test("offline export preserves IndexedDB notes and reports incomplete cloud snapshot", async () => {
  await cacheSaved("alice", "note", saved("local"));
  state.offline = true;
  const r = await collectBackup("alice");
  expect(r.bundle.notes.map((n) => n.id)).toContain("local");
  expect(r.report.failed.some((x) => x.id === "cloud-snapshot")).toBe(true);
});
test("historical-only seed associations are included in a valid backup", async () => {
  state.notes = [saved("n")];
  state.history = [
    {
      ...saved("n", noteContent({ machineId: seedMachines[0].id })),
      revision: 1,
    },
  ];
  const r = await collectBackup("alice");
  expect(r.bundle.machines.map((m) => m.id)).toContain(seedMachines[0].id);
  expect(() => validateBundle(r.bundle)).not.toThrow();
});
test("each prepared blob owns its captured draft revisions", async () => {
  await saveDraft(draft(), 0);
  const a = await exportBackup("alice");
  await saveDraft(draft({ content: noteContent({ title: "newer" }) }), 1);
  const b = await exportBackup("alice");
  expect((a as any).acknowledgment.draftRevisions[0].localRevision).toBe(1);
  expect((b as any).acknowledgment.draftRevisions[0].localRevision).toBe(2);
});
test("recovery-only screenshots survive import and a second export", async () => {
  await saveDraft(draft(), 0);
  await putLocalImage("alice", imageRecord());
  await saveDraft(
    draft({
      content: noteContent({
        title: "recovery",
        attachmentIds: ["img1"],
        contentJson: JSON.stringify({
          type: "doc",
          content: [
            { type: "screenshot", attrs: { imageId: "img1", alt: "shot" } },
          ],
        }),
      }),
    }),
    0,
  );
  const a = await collectBackup("alice");
  expect((await importBackup("bob", a.bundle)).failed).toHaveLength(0);
  const restored = await listConflicts<any>("bob");
  expect(restored).toHaveLength(1);
  expect(restored[0].content.attachmentIds[0]).not.toBe("img1");
  const b = await collectBackup("bob");
  expect(b.bundle.images).toHaveLength(1);
  expect(() => validateBundle(b.bundle)).not.toThrow();
  await importBackup("bob", a.bundle);
  expect(await listConflicts("bob")).toHaveLength(1);
});
