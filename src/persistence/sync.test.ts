import "fake-indexeddb/auto";
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { draft } from "../../tests/fixtures/builders";
import { saveDraft, listDrafts, clearAccountCache } from "./local";
import { startSync, syncDraft } from "./sync";
const cloud = vi.hoisted(() => ({ commit: vi.fn(), uid: "alice" }));
vi.mock("../firebase/client", () => ({
  requireOwner: (uid: string) => {
    if (uid !== cloud.uid) throw Error("Wrong account");
  },
  getClient: () => ({ auth: { currentUser: { uid: cloud.uid } } }),
}));
vi.mock("../firebase/notes", () => ({
  commitNote: cloud.commit,
  pruneHistory: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../firebase/machines", () => ({ commitMachine: cloud.commit }));
vi.mock("../firebase/images", () => ({ ensureImage: vi.fn() }));
let stop: () => void;
beforeEach(async () => {
  await clearAccountCache("alice");
  cloud.uid = "alice";
  cloud.commit.mockReset();
  vi.stubGlobal("navigator", {
    onLine: true,
    locks: { request: (_n: string, fn: () => unknown) => fn() },
  });
  stop = startSync("alice");
});
afterEach(() => {
  stop();
  vi.unstubAllGlobals();
});
const saved = (d: ReturnType<typeof draft>) => ({
  id: d.id,
  content: d.content,
  revision: 1,
  lastMutationId: d.mutationId,
  createdAt: 1,
  updatedAt: 1,
});
test("older cloud acknowledgment leaves newer local edit pending", async () => {
  const a = (await saveDraft(draft(), 0)).draft;
  let release!: (v: unknown) => void;
  cloud.commit.mockImplementation(() => new Promise((r) => (release = r)));
  const flight = syncDraft(a);
  await vi.waitFor(() => expect(cloud.commit).toHaveBeenCalled());
  await saveDraft(
    { ...a, mutationId: "new", content: { ...a.content, title: "new" } },
    a.localRevision,
  );
  release({ kind: "saved", value: saved(a) });
  await flight;
  expect((await listDrafts("alice", "note"))[0].content).toMatchObject({
    title: "new",
  });
  expect((await listDrafts("alice", "note"))[0].baseRevision).toBe(1);
});
test("network rejection retains draft", async () => {
  const a = (await saveDraft(draft(), 0)).draft;
  cloud.commit.mockRejectedValue(Error("offline"));
  await expect(syncDraft(a)).rejects.toThrow("offline");
  expect(await listDrafts("alice", "note")).toHaveLength(1);
});
test("remote conflict retains local text", async () => {
  const a = (await saveDraft(draft(), 0)).draft;
  cloud.commit.mockResolvedValue({
    kind: "conflict",
    remote: { ...saved(a), revision: 2 },
  });
  expect((await syncDraft(a)).kind).toBe("conflict");
  expect(await listDrafts("alice", "note")).toHaveLength(1);
});
test("sign-out during a save ignores the late acknowledgment", async () => {
  const a = (await saveDraft(draft(), 0)).draft;
  let release!: (v: unknown) => void;
  cloud.commit.mockImplementation(() => new Promise((r) => (release = r)));
  const flight = syncDraft(a);
  await vi.waitFor(() => expect(cloud.commit).toHaveBeenCalled());
  stop();
  cloud.uid = "bob";
  release({ kind: "saved", value: saved(a) });
  await expect(flight).rejects.toThrow();
  expect(await listDrafts("alice", "note")).toHaveLength(1);
  expect(cloud.commit.mock.calls.every((args) => args[0] === "alice")).toBe(
    true,
  );
});
test("without Web Locks sync requires explicit single-tab mode", async () => {
  vi.stubGlobal("navigator", { onLine: true });
  const a = (await saveDraft(draft(), 0)).draft;
  await expect(syncDraft(a)).rejects.toThrow("single-tab");
  expect(cloud.commit).not.toHaveBeenCalled();
});
