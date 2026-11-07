import "fake-indexeddb/auto";
import { beforeEach, expect, test, vi } from "vitest";
import { emptyNote, type NoteContent, type Saved } from "../notebook/model";
import {
  cacheSaved,
  clearAccountCache,
  getDraft,
  listConflicts,
  listDrafts,
  saveDraft,
  setMeta,
} from "../persistence/local";
import { combined } from "../notebook/repository";
import { ensureHtbWeekNote } from "./actions";
import { htbSeedMachines } from "./seeds";

const remote = vi.hoisted(() => ({
  uid: "alice",
  records: new Map<string, Saved<NoteContent>>(),
  purged: new Set<string>(),
  legacy: new Map<string, string>(),
  error: null as null | { code: string },
  afterRead: null as null | (() => void),
}));
vi.mock("../firebase/client", () => ({
  getClient: () => ({ db: {}, auth: { currentUser: { uid: remote.uid } } }),
  requireOwner: (uid: string) => {
    if (uid !== remote.uid) throw Error("Sign in to the original account");
  },
}));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("firebase/firestore")>()),
  doc: (_db: unknown, ...parts: string[]) => parts.join("/"),
  collection: (_db: unknown, ...parts: string[]) => parts.join("/"),
  where: (field: string, op: string, value: number) => ({ field, op, value }),
  query: (
    path: string,
    condition: { field: string; op: string; value: number },
  ) => ({ path, condition }),
  getDocs: async ({
    path,
    condition,
  }: {
    path: string;
    condition: { field: keyof NoteContent; op: string; value: number };
  }) => {
    if (remote.error) throw remote.error;
    if (condition.op !== "==") throw Error("Unsupported query operator");
    const docs = [...remote.records.entries()]
      .filter(
        ([key, record]) =>
          key.startsWith(path + "/") &&
          record.content[condition.field] === condition.value,
      )
      .map(([, record]) => ({
        id: record.id,
        data: () => ({
          ...record.content,
          revision: record.revision,
          lastMutationId: record.lastMutationId,
          createdAt: { toMillis: () => record.createdAt },
          updatedAt: { toMillis: () => record.updatedAt },
        }),
      }));
    remote.afterRead?.();
    return { docs };
  },
  getDoc: async (path: string) => {
    if (remote.error) throw remote.error;
    const record = remote.records.get(path);
    const purged = remote.purged.has(path);
    const html = remote.legacy.get(path);
    remote.afterRead?.();
    return {
      id: path.split("/").at(-1),
      exists: () => Boolean(record || purged || html),
      data: () =>
        record
          ? {
              ...record.content,
              revision: record.revision,
              lastMutationId: record.lastMutationId,
              createdAt: { toMillis: () => record.createdAt },
              updatedAt: { toMillis: () => record.updatedAt },
            }
          : html
            ? { html, week: 201 }
            : { deletedAt: { toMillis: () => 1 } },
    };
  },
}));

function note(
  id: string,
  overrides: Partial<NoteContent> = {},
): Saved<NoteContent> {
  return {
    id,
    content: {
      ...emptyNote(),
      week: 201,
      title: "My existing evidence",
      ...overrides,
    },
    revision: 7,
    lastMutationId: "user-edit",
    createdAt: 10,
    updatedAt: 50,
  };
}

beforeEach(async () => {
  await clearAccountCache("alice");
  await clearAccountCache("bob");
  remote.uid = "alice";
  remote.records.clear();
  remote.purged.clear();
  remote.legacy.clear();
  localStorage.clear();
  remote.error = null;
  remote.afterRead = null;
});

test.each([0, 52, 1.5, NaN])(
  "rejects invalid week %s without creating notes",
  async (week) => {
    await expect(ensureHtbWeekNote("alice", week)).rejects.toThrow(RangeError);
    expect(await listDrafts("alice", "note")).toEqual([]);
  },
);

test("legacy imported week notes are reused without changing their evidence", async () => {
  const existing = note("legacy-week-1");
  await cacheSaved("alice", "note", existing);
  expect(await ensureHtbWeekNote("alice", 1)).toBe("legacy-week-1");
  expect(await combined("alice", "note")).toEqual([existing]);
  expect(await listDrafts("alice", "note")).toEqual([]);
});

test("creates one normal OSCP draft and reuses it without revision changes", async () => {
  expect(await ensureHtbWeekNote("alice", 1)).toBe("htb-week-201");
  const draft = await getDraft<NoteContent>("alice", "note", "htb-week-201");
  expect(draft?.content).toMatchObject({
    workspace: "oscp",
    week: 201,
    machineId: null,
    deletedAt: null,
    title: "HTB week 1 notes",
  });
  expect(draft?.content.text).toContain("Goals");
  expect(draft?.baseRevision).toBe(0);
  expect(await ensureHtbWeekNote("alice", 1)).toBe("htb-week-201");
  expect(await getDraft("alice", "note", "htb-week-201")).toEqual(draft);
});

test("cold local cache reuses remote deterministic note without a pending draft", async () => {
  const existing = note("htb-week-201");
  remote.records.set("users/alice/notebookNotes/htb-week-201", existing);
  expect(await ensureHtbWeekNote("alice", 1)).toBe("htb-week-201");
  expect(await combined("alice", "note")).toEqual([existing]);
  expect(await listDrafts("alice", "note")).toEqual([]);
});

test("other workspace and account notes do not capture the OSCP weekly action", async () => {
  await cacheSaved(
    "alice",
    "note",
    note("other-workspace", { workspace: "osai" }),
  );
  await cacheSaved("bob", "note", note("other-account"));
  expect(await ensureHtbWeekNote("alice", 1)).toBe("htb-week-201");
  expect(
    (await listDrafts<NoteContent>("alice", "note"))[0].content.workspace,
  ).toBe("oscp");
  expect(await listDrafts("bob", "note")).toEqual([]);
});

test("simultaneous opens share one main draft without recovery duplicates", async () => {
  expect(
    await Promise.all(
      Array.from({ length: 5 }, () => ensureHtbWeekNote("alice", 1)),
    ),
  ).toEqual(Array(5).fill("htb-week-201"));
  expect(await listDrafts("alice", "note")).toHaveLength(1);
  expect(await listConflicts("alice")).toHaveLength(0);
});

test.each(["legacy-trash", "htb-week-201"])(
  "trashed %s requires restore and preserves content",
  async (id) => {
    const existing = note(id, { deletedAt: 100 });
    await cacheSaved("alice", "note", existing);
    await expect(ensureHtbWeekNote("alice", 1)).rejects.toThrow(/restore/i);
    expect(await combined("alice", "note")).toEqual([existing]);
    expect(await listDrafts("alice", "note")).toEqual([]);
  },
);

test("pending trash overrides active cached state", async () => {
  await cacheSaved("alice", "note", note("htb-week-201"));
  await saveDraft(
    {
      uid: "alice",
      kind: "note",
      id: "htb-week-201",
      content: note("htb-week-201", { deletedAt: 1 }).content,
      baseRevision: 7,
      localRevision: 0,
      mutationId: "trash",
      modifiedAt: 100,
    },
    0,
  );
  await expect(ensureHtbWeekNote("alice", 1)).rejects.toThrow(/restore/i);
  expect(
    (await getDraft<NoteContent>("alice", "note", "htb-week-201"))?.content
      .deletedAt,
  ).toBe(1);
});

test("remote trash requires restore without creating a draft", async () => {
  remote.records.set(
    "users/alice/notebookNotes/htb-week-201",
    note("htb-week-201", { deletedAt: 1 }),
  );
  await expect(ensureHtbWeekNote("alice", 1)).rejects.toThrow(/restore/i);
  expect(await listDrafts("alice", "note")).toEqual([]);
});

test.each(["local", "remote"])(
  "%s purge marker prevents deleted note resurrection",
  async (source) => {
    if (source === "local") await setMeta("alice", "purge:htb-week-201", true);
    else remote.purged.add("users/alice/purgedNotes/htb-week-201");
    await expect(ensureHtbWeekNote("alice", 1)).rejects.toThrow(
      /deleted|purged/i,
    );
    expect(await listDrafts("alice", "note")).toEqual([]);
  },
);

test("offline read failure retains a local draft", async () => {
  remote.error = { code: "unavailable" };
  expect(await ensureHtbWeekNote("alice", 51)).toBe("htb-week-251");
  expect(await listDrafts("alice", "note")).toHaveLength(1);
});

test("permission failures do not create a draft", async () => {
  remote.error = { code: "permission-denied" };
  await expect(ensureHtbWeekNote("alice", 1)).rejects.toMatchObject({
    code: "permission-denied",
  });
  expect(await listDrafts("alice", "note")).toEqual([]);
});

test.each(["before", "during"])(
  "account changes %s remote check cannot write into original account",
  async (when) => {
    if (when === "before") remote.uid = "bob";
    else
      remote.afterRead = () => {
        remote.uid = "bob";
      };
    await expect(ensureHtbWeekNote("alice", 1)).rejects.toThrow(
      /original account/i,
    );
    expect(await listDrafts("alice", "note")).toEqual([]);
  },
);

test("HTB module seeds provide distinct normal OSCP progress entities", () => {
  expect(htbSeedMachines).toHaveLength(27);
  expect(new Set(htbSeedMachines.map((seed) => seed.id)).size).toBe(27);
  expect(
    htbSeedMachines.find((seed) => seed.id === "htb-module-77"),
  ).toMatchObject({
    revision: 0,
    createdAt: 0,
    updatedAt: 0,
    lastMutationId: "seed",
    content: {
      workspace: "oscp",
      progress: "not-started",
      platform: "HTB Academy",
    },
  });
});

test.each(["browser", "cloud"])(
  "unimported %s legacy week requires existing migration before creating a note",
  async (source) => {
    if (source === "browser")
      localStorage.setItem("oscp-note-201", "<p>Private legacy evidence</p>");
    else
      remote.legacy.set(
        "users/alice/notes/week-201",
        "<p>Private legacy evidence</p>",
      );
    await expect(ensureHtbWeekNote("alice", 1)).rejects.toThrow(
      /import.*settings/i,
    );
    expect(await listDrafts("alice", "note")).toEqual([]);
  },
);

test.each(["local", "remote"])(
  "%s deterministic ID collision never overwrites another workspace",
  async (source) => {
    const existing = note("htb-week-201", { workspace: "osai" });
    if (source === "local") await cacheSaved("alice", "note", existing);
    else remote.records.set("users/alice/notebookNotes/htb-week-201", existing);
    await expect(ensureHtbWeekNote("alice", 1)).rejects.toThrow(
      /already used/i,
    );
    expect(await listDrafts("alice", "note")).toEqual([]);
  },
);
test("legacy sources retained after import do not block the imported week note", async () => {
  localStorage.setItem("oscp-note-201", "<p>Original evidence</p>");
  remote.legacy.set("users/alice/notes/week-201", "<p>Original evidence</p>");
  await cacheSaved("alice", "note", note("legacy-imported-id"));
  expect(await ensureHtbWeekNote("alice", 1)).toBe("legacy-imported-id");
  expect(await listDrafts("alice", "note")).toEqual([]);
});

test.each(["none", "browser", "cloud"])(
  "cold cache reuses imported remote note before %s retained legacy guard",
  async (source) => {
    const existing = note("legacy-hashed-week");
    remote.records.set(
      "users/alice/notebookNotes/legacy-hashed-week",
      existing,
    );
    if (source === "browser")
      localStorage.setItem("oscp-note-201", "<p>Original evidence</p>");
    if (source === "cloud")
      remote.legacy.set(
        "users/alice/notes/week-201",
        "<p>Original evidence</p>",
      );
    expect(await ensureHtbWeekNote("alice", 1)).toBe("legacy-hashed-week");
    expect(await combined("alice", "note")).toEqual([existing]);
    expect(await listDrafts("alice", "note")).toEqual([]);
  },
);

test("cold cache remote imported trash requires restore without creating another note", async () => {
  const existing = note("legacy-hashed-trash", { deletedAt: 1 });
  remote.records.set("users/alice/notebookNotes/legacy-hashed-trash", existing);
  await expect(ensureHtbWeekNote("alice", 1)).rejects.toThrow(/restore/i);
  expect(await combined("alice", "note")).toEqual([existing]);
  expect(await listDrafts("alice", "note")).toEqual([]);
});
