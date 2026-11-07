import "fake-indexeddb/auto";
import { test, expect, vi, beforeEach } from "vitest";
import { getOfflineReport, downloadOffline } from "./offline";
import { setMeta, clearAccountCache } from "./local";
import { noteContent } from "../../tests/fixtures/builders";
const state = vi.hoisted(() => ({
  uid: "alice",
  image: null as unknown,
  switchOnImage: false,
  offline: false,
}));
vi.mock("../firebase/client", () => ({
  requireOwner: (uid: string) => {
    if (uid !== state.uid) throw Error("Account changed");
  },
  getClient: () => ({ db: {} }),
}));
vi.mock("../firebase/images", () => ({
  loadImage: async () => {
    if (state.switchOnImage) state.uid = "bob";
    return state.image;
  },
}));
vi.mock("firebase/firestore", () => ({
  collection: (_db: unknown, ...path: string[]) => path.at(-1),
  getDocsFromServer: async (kind: string) => {
    if (state.offline) throw Error("offline");
    return query(kind);
  },
  getDocs: async (kind: string) => (state.offline ? { docs: [] } : query(kind)),
}));
const query = async (kind: string) => ({
  docs:
    kind === "notebookNotes"
      ? [
          {
            id: "n",
            data: () => ({
              contentJson: '{"type":"doc","content":[{"type":"paragraph"}]}',
              title: "n",
              text: "",
              tags: [],
              machineId: null,
              week: null,
              attachmentIds: ["missing"],
              schemaVersion: 1,
              deletedAt: null,
              sourceHtml: null,
              revision: 1,
              lastMutationId: "m",
              createdAt: { toMillis: () => 1 },
              updatedAt: { toMillis: () => 1 },
            }),
          },
        ]
      : [],
});
beforeEach(async () => {
  state.uid = "alice";
  state.offline = false;
  state.image = null;
  state.switchOnImage = false;
  await clearAccountCache("alice");
});
test("uncached screenshots make an offline snapshot incomplete", async () => {
  await setMeta("alice", "offline", {
    complete: true,
    missing: [],
    completedAt: 10,
    revisions: [{ id: "n", revision: 1 }],
    imageIds: ["missing"],
  });
  expect((await getOfflineReport("alice")).complete).toBe(false);
});
test("missing downloads never advance the last complete timestamp", async () => {
  await setMeta("alice", "offline", {
    complete: true,
    missing: [],
    completedAt: 10,
    revisions: [],
    imageIds: [],
  });
  const report = await downloadOffline("alice");
  expect(report.complete).toBe(false);
  expect(report.completedAt).toBe(10);
});
test("an account change rejects a download for the previous account", async () => {
  state.uid = "bob";
  await expect(downloadOffline("alice")).rejects.toThrow("Account changed");
});

test("quota failure leaves the previous completed timestamp intact", async () => {
  await setMeta("alice", "offline", {
    complete: true,
    missing: [],
    completedAt: 10,
    revisions: [],
    imageIds: [],
  });
  state.image = { id: "missing", data: "data:image/png;base64,aGVsbG8=" };
  const original = IDBObjectStore.prototype.put;
  const spy = vi
    .spyOn(IDBObjectStore.prototype, "put")
    .mockImplementation(function (
      this: IDBObjectStore,
      ...args: Parameters<typeof original>
    ) {
      if (this.name === "images")
        throw new DOMException("Full", "QuotaExceededError");
      return original.apply(this, args);
    });
  const result = await downloadOffline("alice");
  spy.mockRestore();
  expect(result.complete).toBe(false);
  expect(result.completedAt).toBe(10);
});
test("switching accounts during image download cannot complete the previous snapshot", async () => {
  state.switchOnImage = true;
  await expect(downloadOffline("alice")).rejects.toThrow("Account changed");
});

test("offline query cannot certify an empty downloaded snapshot", async () => {
  state.offline = true;
  await expect(downloadOffline("alice")).rejects.toThrow("offline");
});
