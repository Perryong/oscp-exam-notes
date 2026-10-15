import { workspaceOf, sameWorkspace } from "../workspaces/model";
import { osaiSeedMachines } from "../osai/seeds";
import { collection, getDocsFromServer } from "firebase/firestore";
import type {
  NotebookBundle,
  NoteContent,
  MachineContent,
  Saved,
  TransferReport,
  Draft,
} from "../notebook/model";
import { validateNote, validateMachine, validId } from "../notebook/validation";
import { decodeEditor, encodeEditor } from "../editor/schema";
import { getClient, requireOwner } from "../firebase/client";
import {
  fromSnapshot,
  listHistory,
  commitNote,
  readEntity,
} from "../firebase/notes";
import { commitMachine } from "../firebase/machines";
import { loadImage, ensureImage } from "../firebase/images";
import {
  listDrafts,
  listCached,
  getLocalImage,
  getMeta,
  setMeta,
  listConflicts,
  storeRecovery,
} from "../persistence/local";
import { seedMachines } from "../notebook/seeds";
import { digest } from "./legacy";
function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
export function validateBundle(input: unknown): NotebookBundle {
  if (
    !object(input) ||
    (input.version !== 1 && input.version !== 2) ||
    !Array.isArray(input.notes) ||
    !Array.isArray(input.machines) ||
    !Array.isArray(input.images) ||
    !object(input.history) ||
    !object(input.legacySources) ||
    !object(input.unmatchedProgress)
  )
    throw Error("Invalid backup version or structure");
  const b = input as unknown as NotebookBundle;
  if (b.recovery !== undefined && !Array.isArray(b.recovery))
    throw Error("Invalid recovery records");
  const recovery = b.recovery || [];
  const mutationIds = new Set<string>();
  for (const d of recovery) {
    if (
      !d ||
      !validId(d.id) ||
      !validId(d.mutationId) ||
      mutationIds.has(d.mutationId) ||
      typeof d.uid !== "string" ||
      !Number.isSafeInteger(d.localRevision) ||
      d.localRevision < 0 ||
      !Number.isSafeInteger(d.baseRevision) ||
      d.baseRevision < 0 ||
      !Number.isFinite(d.modifiedAt)
    )
      throw Error("Invalid recovery draft");
    mutationIds.add(d.mutationId);
    if (d.kind === "note") validateNote(d.content);
    else if (d.kind === "machine") validateMachine(d.content);
    else throw Error("Invalid recovery kind");
  }
  for (const m of b.machines) {
    const seed = [...seedMachines, ...osaiSeedMachines].find(
      (s) => s.id === m.id,
    );
    if (seed && !sameWorkspace(seed.content, m.content))
      throw Error("Seed workspace mismatch");
  }
  const allIds = [...b.notes, ...b.machines, ...b.images].map(
    (item) => item?.id,
  );
  if (new Set(allIds).size !== allIds.length)
    throw Error("Duplicate ID across entity kinds");
  function records<T>(items: Saved<T>[], validate: (x: unknown) => unknown) {
    const ids = new Set();
    for (const item of items) {
      if (
        !item ||
        !validId(item.id) ||
        ids.has(item.id) ||
        !Number.isSafeInteger(item.revision) ||
        item.revision < 0 ||
        !validId(item.lastMutationId) ||
        !Number.isFinite(item.createdAt) ||
        !Number.isFinite(item.updatedAt)
      )
        throw Error("Invalid or duplicate record");
      ids.add(item.id);
      validate(item.content);
    }
  }
  records(b.notes, validateNote);
  records(b.machines, validateMachine);
  const imageIds = new Set<string>();
  for (const image of b.images) {
    if (
      !validId(image.id) ||
      imageIds.has(image.id) ||
      typeof image.data !== "string" ||
      image.data.length >= 1000000 ||
      !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(
        image.data,
      )
    )
      throw Error("Invalid or duplicate image");
    imageIds.add(image.id);
  }
  const noteIds = new Set(b.notes.map((n) => n.id)),
    machineIds = new Set(b.machines.map((m) => m.id));
  for (const [id, versions] of Object.entries(b.history)) {
    if (!noteIds.has(id) || !Array.isArray(versions) || versions.length > 20)
      throw Error("Invalid note history");
    const rev = new Set();
    for (const v of versions) {
      records([v], validateNote);
      if (v.id !== id || rev.has(v.revision))
        throw Error("Invalid history revision");
      rev.add(v.revision);
    }
  }
  for (const n of [
    ...b.notes,
    ...Object.values(b.history).flat(),
    ...(recovery.filter((d) => d.kind === "note") as Draft<NoteContent>[]),
  ]) {
    if (n.content.machineId && !machineIds.has(n.content.machineId))
      throw Error("Missing linked machine");
    for (const id of n.content.attachmentIds)
      if (!imageIds.has(id)) throw Error("Missing screenshot " + id);
    const normalized = encodeEditor(decodeEditor(n.content.contentJson));
    if (
      normalized.attachmentIds.some(
        (id) => !n.content.attachmentIds.includes(id),
      )
    )
      throw Error("Undeclared screenshot");
  }
  for (const source of Object.values(b.legacySources))
    if (typeof source !== "string") throw Error("Invalid legacy source");
  const entities = [
    ...b.notes,
    ...b.machines,
    ...Object.values(b.history).flat(),
    ...recovery,
  ];
  for (const item of entities) {
    if (b.version === 1 && workspaceOf(item.content) !== "oscp")
      throw Error("Version 1 backups are OSCP only");
    if (b.version === 2 && !Object.hasOwn(item.content, "workspace"))
      throw Error("Version 2 requires workspace metadata");
  }
  for (const [id, versions] of Object.entries(b.history)) {
    const note = b.notes.find((n) => n.id === id)!;
    if (versions.some((v) => !sameWorkspace(v.content, note.content)))
      throw Error("History workspace mismatch");
  }
  for (const d of recovery) {
    const parent = (d.kind === "note" ? b.notes : b.machines).find(
      (n) => n.id === d.id,
    );
    if (parent && !sameWorkspace(d.content, parent.content))
      throw Error("Recovery workspace mismatch");
  }
  for (const n of [
    ...b.notes,
    ...Object.values(b.history).flat(),
    ...recovery.filter((d) => d.kind === "note"),
  ]) {
    const content = n.content as NoteContent;
    const target = b.machines.find((m) => m.id === content.machineId);
    if (target && !sameWorkspace(content, target.content))
      throw Error("Linked target workspace mismatch");
  }
  return normalizeBundle(b);
}
export function normalizeBundle(b: NotebookBundle): NotebookBundle {
  const normalize = <T extends NoteContent | MachineContent>(
    n: Saved<T>,
  ): Saved<T> => ({
    ...n,
    content: { ...n.content, workspace: workspaceOf(n.content) },
  });
  return {
    ...b,
    version: 2,
    notes: b.notes.map(normalize),
    machines: b.machines.map(normalize),
    history: Object.fromEntries(
      Object.entries(b.history).map(([id, rows]) => [id, rows.map(normalize)]),
    ),
    recovery: b.recovery?.map((d) => ({
      ...d,
      content: { ...d.content, workspace: workspaceOf(d.content) },
    })),
  };
}
export function remapBundle(
  input: NotebookBundle,
  mapping?: Record<string, string>,
) {
  const seedIds = new Set(
    input.machines
      .filter((m) =>
        [...seedMachines, ...osaiSeedMachines].some((s) => s.id === m.id),
      )
      .map((m) => m.id),
  );
  const map =
    mapping ||
    Object.fromEntries(
      [
        ...input.notes,
        ...input.machines,
        ...input.images,
        ...(input.recovery || []),
        ...(input.recovery || []).map((d) => ({
          id: "recovery:" + d.mutationId,
        })),
      ].map((item) => [
        item.id,
        seedIds.has(item.id) ? item.id : crypto.randomUUID(),
      ]),
    );
  const content = (n: NoteContent): NoteContent => {
    const doc = decodeEditor(n.contentJson);
    function walk(node: typeof doc) {
      if (node.type === "screenshot")
        node.attrs = { ...node.attrs, imageId: map[node.attrs!.imageId] };
      for (const mark of node.marks || [])
        if (
          mark.type === "link" &&
          /^\/(osai\/)?notes\//.test(mark.attrs?.href || "")
        ) {
          const href = mark.attrs!.href as string;
          const id = href.split("/").pop()!;
          if (map[id])
            mark.attrs!.href =
              (href.startsWith("/osai/") ? "/osai/notes/" : "/notes/") +
              map[id];
        }
      for (const child of node.content || []) walk(child);
    }
    walk(doc);
    return {
      ...n,
      ...encodeEditor(doc),
      machineId: n.machineId ? map[n.machineId] : null,
    };
  };
  return {
    mapping: map,
    bundle: {
      ...input,
      recovery: (input.recovery || []).map((d) => ({
        ...d,
        id: map[d.id],
        mutationId: map["recovery:" + d.mutationId],
        content:
          d.kind === "note" ? content(d.content as NoteContent) : d.content,
      })),
      notes: input.notes.map((n) => ({
        ...n,
        id: map[n.id],
        content: content(n.content),
      })),
      machines: input.machines.map((m) => ({ ...m, id: map[m.id] })),
      images: input.images.map((i) => ({ ...i, id: map[i.id] })),
      history: Object.fromEntries(
        Object.entries(input.history).map(([id, versions]) => [
          map[id],
          versions.map((n) => ({
            ...n,
            id: map[id],
            content: content(n.content),
          })),
        ]),
      ),
    },
  };
}
export async function collectBackup(uid: string) {
  requireOwner(uid);
  const report: TransferReport = { completed: [], failed: [], skipped: [] };
  let notes = await listCached<NoteContent>(uid, "note"),
    machines = await listCached<MachineContent>(uid, "machine");
  try {
    const serverNotes = (
      await getDocsFromServer(
        collection(getClient().db, "users", uid, "notebookNotes"),
      )
    ).docs.map((s) => fromSnapshot<NoteContent>(s));
    const serverMachines = (
      await getDocsFromServer(
        collection(getClient().db, "users", uid, "machines"),
      )
    ).docs.map((s) => fromSnapshot<MachineContent>(s));
    notes = serverNotes;
    machines = serverMachines;
  } catch (e) {
    report.failed.push({ id: "cloud-snapshot", reason: String(e) });
  }
  const history: NotebookBundle["history"] = {};
  for (const n of notes)
    try {
      history[n.id] = await listHistory(uid, n.id);
    } catch (e) {
      report.failed.push({ id: "history:" + n.id, reason: String(e) });
    }
  const pendingNotes = await listDrafts<NoteContent>(uid, "note"),
    pendingMachines = await listDrafts<MachineContent>(uid, "machine");
  for (const d of pendingNotes) {
    const old = notes.find((n) => n.id === d.id);
    if (old)
      history[d.id] = [...(history[d.id] || []), old]
        .sort((a, b) => a.revision - b.revision)
        .slice(-20);
    notes = notes.filter((n) => n.id !== d.id);
    notes.push({
      id: d.id,
      content: d.content,
      revision: d.baseRevision + 1,
      lastMutationId: d.mutationId,
      createdAt: old?.createdAt || d.modifiedAt,
      updatedAt: d.modifiedAt,
    });
  }
  for (const d of pendingMachines) {
    machines = machines.filter((m) => m.id !== d.id);
    machines.push({
      id: d.id,
      content: d.content,
      revision: d.baseRevision + 1,
      lastMutationId: d.mutationId,
      createdAt: d.modifiedAt,
      updatedAt: d.modifiedAt,
    });
  }
  const conflicts = await listConflicts<NoteContent | MachineContent>(uid);
  for (const d of conflicts.filter((d) => d.kind === "machine"))
    if (!machines.some((m) => m.id === d.id))
      machines.push({
        id: d.id,
        content: d.content as MachineContent,
        revision: d.baseRevision,
        lastMutationId: d.mutationId,
        createdAt: d.modifiedAt,
        updatedAt: d.modifiedAt,
      });
  for (const id of new Set(
    [
      ...notes,
      ...Object.values(history).flat(),
      ...(conflicts.filter((d) => d.kind === "note") as Draft<NoteContent>[]),
    ]
      .map((n) => n.content.machineId)
      .filter(Boolean),
  )) {
    if (!machines.some((m) => m.id === id)) {
      const seed = [...seedMachines, ...osaiSeedMachines].find(
        (m) => m.id === id,
      );
      if (seed) machines.push(seed);
      else
        report.failed.push({
          id: "machine:" + id,
          reason: "Linked machine unavailable",
        });
    }
  }
  const images: NotebookBundle["images"] = [];
  const ids = new Set(
    [
      ...notes,
      ...Object.values(history).flat(),
      ...conflicts
        .filter((d) => d.kind === "note")
        .map((d) => ({ content: d.content as NoteContent })),
    ].flatMap((n) => n.content.attachmentIds),
  );
  for (const id of ids) {
    try {
      requireOwner(uid);
      const image =
        (await getLocalImage(uid, id)) || (await loadImage(uid, id));
      if (!image) throw Error("Image unavailable");
      images.push(image);
      report.completed.push(id);
    } catch (e) {
      report.failed.push({ id, reason: String(e) });
    }
  }
  const legacySources =
    (await getMeta<Record<string, string>>(uid, "legacySources")) || {};

  const sources =
    (await getMeta<Record<string, string>>(uid, "portableSources")) || {};
  const bundle: NotebookBundle = normalizeBundle({
    version: 2,
    recovery: conflicts,
    notes,
    machines,
    history,
    images,
    legacySources: { ...legacySources, ...sources },
    unmatchedProgress: (await getMeta(uid, "unmatchedProgress")) || {},
  });
  requireOwner(uid);
  if (!report.failed.length) {
    try {
      validateBundle(bundle);
    } catch (e) {
      report.failed.push({ id: "backup-validation", reason: String(e) });
    }
  }
  return {
    bundle,
    report,
    draftRevisions: [...pendingNotes, ...pendingMachines, ...conflicts].map(
      (d) => ({
        kind: d.kind,
        id: d.id,
        localRevision: d.localRevision,
        mutationId: d.mutationId,
      }),
    ),
  };
}
export async function exportBackup(uid: string) {
  const { bundle, report, draftRevisions } = await collectBackup(uid);
  const blob = new Blob([JSON.stringify(bundle)], { type: "application/json" });
  const acknowledgment = report.failed.length
    ? undefined
    : { draftRevisions, at: Date.now() };
  return { blob, report, acknowledgment };
}
export async function importBackup(
  uid: string,
  input: unknown,
  cancelled = () => false,
): Promise<TransferReport> {
  const original = validateBundle(input);
  requireOwner(uid);
  const hash = await digest(JSON.stringify(original)),
    key = "import:" + hash;
  type Session = { mapping: Record<string, string>; done: string[] };
  let session = await getMeta<Session>(uid, key);
  if (!session) {
    session = { mapping: remapBundle(original).mapping, done: [] };
    await setMeta(uid, key, session);
  }
  const { bundle } = remapBundle(original, session.mapping),
    report: TransferReport = { completed: [], failed: [], skipped: [] };
  const record = async (id: string, fn: () => Promise<void>) => {
    if (session!.done.includes(id) || cancelled()) {
      report.skipped.push(id);
      return;
    }
    try {
      requireOwner(uid);
      await fn();
      session!.done.push(id);
      await setMeta(uid, key, session);
      report.completed.push(id);
    } catch (e) {
      report.failed.push({ id, reason: String(e) });
    }
  };
  for (const image of bundle.images)
    await record(image.id, () => ensureImage(uid, image));
  for (const m of bundle.machines)
    await record(m.id, async () => {
      // Reuse existing curriculum state without overwriting the owner's progress.
      if ([...seedMachines, ...osaiSeedMachines].some((s) => s.id === m.id)) {
        const existing = await readEntity<MachineContent>(uid, "machine", m.id);
        if (existing) {
          if (!sameWorkspace(existing.content, m.content))
            throw Error("Seed workspace mismatch");
          return;
        }
      }
      const result = await commitMachine(uid, {
        uid,
        kind: "machine",
        id: m.id,
        content: m.content,
        baseRevision: 0,
        localRevision: 0,
        mutationId: "import-" + m.id,
        modifiedAt: Date.now(),
      });
      if (result.kind === "conflict")
        throw Error("Imported machine has changed; preserving it");
    });
  for (const n of bundle.notes)
    await record(n.id, async () => {
      const versions = [...(bundle.history[n.id] || [])].sort(
        (a, b) => a.revision - b.revision,
      );
      versions.push(n);
      for (let i = 0; i < versions.length; i++) {
        requireOwner(uid);
        const mutationId = "import-" + n.id + "-" + i,
          remote = await readEntity<NoteContent>(uid, "note", n.id);
        if (remote) {
          const accepted = versions.findIndex(
            (_v, j) => remote.lastMutationId === "import-" + n.id + "-" + j,
          );
          if (accepted < 0)
            throw Error("Imported note has changed; preserving it");
          if (accepted >= i) continue;
        }
        for (const id of versions[i].content.attachmentIds)
          if (!session!.done.includes(id))
            throw Error("Screenshot import incomplete: " + id);
        const result = await commitNote(uid, {
          uid,
          kind: "note",
          id: n.id,
          content: versions[i].content,
          baseRevision: remote?.revision || 0,
          localRevision: 0,
          mutationId,
          modifiedAt: Date.now(),
        });
        if (result.kind === "conflict")
          throw Error("Concurrent import edit; preserved for review");
      }
    });
  for (const recovery of bundle.recovery || [])
    await record("recovery:" + recovery.mutationId, async () => {
      if (recovery.kind === "note")
        for (const id of (recovery.content as NoteContent).attachmentIds)
          if (!session!.done.includes(id))
            throw Error("Screenshot import incomplete: " + id);
      await storeRecovery({
        ...recovery,
        uid,
        baseRevision: 0,
        localRevision: 0,
      });
    });
  const sources =
    (await getMeta<Record<string, string>>(uid, "portableSources")) || {};
  sources["original-backup:" + hash] = JSON.stringify({
    mapping: session.mapping,
    notes: original.notes.map(({ content, ...metadata }) => metadata),
    machines: original.machines.map(({ content, ...metadata }) => metadata),
    history: Object.fromEntries(
      Object.entries(original.history).map(([id, versions]) => [
        id,
        versions.map(({ content, ...metadata }) => metadata),
      ]),
    ),
  });
  await setMeta(uid, "portableSources", sources);
  await setMeta(uid, "legacySources", {
    ...(await getMeta<Record<string, string>>(uid, "legacySources")),
    ...original.legacySources,
  });
  await setMeta(uid, "unmatchedProgress", {
    ...(await getMeta<Record<string, unknown>>(uid, "unmatchedProgress")),
    ...original.unmatchedProgress,
  });
  return report;
}
