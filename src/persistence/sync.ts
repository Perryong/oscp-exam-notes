import type {
  Draft,
  EntityKind,
  NoteContent,
  MachineContent,
  SaveResult,
  Saved,
} from "../notebook/model";
import { requireOwner } from "../firebase/client";
import { commitNote, pruneHistory, readEntity } from "../firebase/notes";
import { commitMachine } from "../firebase/machines";
import { ensureImage, loadImage } from "../firebase/images";
import {
  acknowledge,
  getDraft,
  listDrafts,
  getLocalImage,
  getMeta,
  setMeta,
  replaceDraft,
  saveDraft,
  announce,
} from "./local";
export type SyncState =
  | "Unsaved"
  | "Saved locally"
  | "Syncing"
  | "Synced"
  | "Conflict"
  | "Save failed";
type Content = NoteContent | MachineContent;
export type Conflict<T> = { draft: Draft<T>; remote: Saved<T> | null };
let generation = 0,
  activeUid: string | null = null;
const statusKey = (kind: EntityKind, id: string) => `sync:${kind}:${id}`;
export async function getSyncStatus(uid: string, kind: EntityKind, id: string) {
  const value = await getMeta<{ state: SyncState; error?: string }>(
    uid,
    statusKey(kind, id),
  );
  if (
    value?.state === "Synced" &&
    (await listDrafts(uid, kind)).some((d) => d.id === id)
  )
    return { state: "Saved locally" as SyncState };
  return value;
}
async function status(
  uid: string,
  kind: EntityKind,
  id: string,
  state: SyncState,
  error?: string,
) {
  await setMeta(uid, statusKey(kind, id), { state, error });
  announce();
}
export async function enableSingleTab(uid: string) {
  await setMeta(uid, "single-tab", true);
  announce();
}
export async function syncDraft<T extends Content>(
  candidate: Draft<T>,
): Promise<SaveResult<T>> {
  const token = generation;
  const check = () => {
    if (token !== generation || activeUid !== candidate.uid)
      throw Error("Account session changed; draft retained");
    requireOwner(candidate.uid);
  };
  check();
  const work = async () => {
    check();
    if (!navigator.onLine) throw Error("Offline; saved locally");
    const current = await getDraft<T>(
      candidate.uid,
      candidate.kind,
      candidate.id,
    );
    if (
      !current ||
      current.mutationId !== candidate.mutationId ||
      current.localRevision !== candidate.localRevision
    )
      throw Error("A newer draft is queued");
    check();
    await status(candidate.uid, candidate.kind, candidate.id, "Syncing");
    if (candidate.kind === "note")
      for (const id of (candidate.content as NoteContent).attachmentIds) {
        const image = await getLocalImage(candidate.uid, id);
        check();
        if (image) await ensureImage(candidate.uid, image);
        else {
          if (!(await loadImage(candidate.uid, id)))
            throw Error("Screenshot missing: " + id);
        }
      }
    check();
    const result = (
      candidate.kind === "note"
        ? await commitNote(candidate.uid, candidate as Draft<NoteContent>)
        : await commitMachine(candidate.uid, candidate as Draft<MachineContent>)
    ) as SaveResult<T>;
    check();
    if (result.kind === "saved") {
      await acknowledge(candidate, result.value);
      check();
      await status(
        candidate.uid,
        candidate.kind,
        candidate.id,
        (await listDrafts(candidate.uid, candidate.kind)).some(
          (d) => d.id === candidate.id,
        )
          ? "Saved locally"
          : "Synced",
      );
      if (candidate.kind === "note")
        void pruneHistory(candidate.uid, candidate.id).catch(() => {});
    } else {
      await setMeta(
        candidate.uid,
        `conflict:${candidate.kind}:${candidate.id}`,
        { draft: candidate, remote: result.remote },
      );
      await status(candidate.uid, candidate.kind, candidate.id, "Conflict");
    }
    return result;
  };
  try {
    if (navigator.locks)
      return await navigator.locks.request(
        `oscp:${candidate.uid}:${candidate.kind}:${candidate.id}`,
        work,
      );
    if (!(await getMeta(candidate.uid, "single-tab")))
      throw Error("Enable single-tab sync after closing other notebook tabs");
    return await work();
  } catch (e) {
    if (token === generation && activeUid === candidate.uid)
      await status(
        candidate.uid,
        candidate.kind,
        candidate.id,
        navigator.onLine ? "Save failed" : "Saved locally",
        String(e),
      );
    throw e;
  }
}
export function startSync(uid: string): () => void {
  const token = ++generation;
  activeUid = uid;
  let timer: ReturnType<typeof setTimeout>,
    busy = false,
    stopped = false;
  const attempts = new Map<
    string,
    { count: number; next: number; mutation: string }
  >();
  const tick = async () => {
    if (stopped || busy || token !== generation) return;
    busy = true;
    try {
      for (const kind of ["note", "machine"] as const)
        for (const draft of await listDrafts<Content>(uid, kind)) {
          if (stopped || token !== generation) return;
          const key = kind + draft.id,
            a = attempts.get(key);
          if (
            a?.mutation === draft.mutationId &&
            (a.count >= 5 || a.next > Date.now())
          )
            continue;
          if (await getMeta(uid, `conflict:${kind}:${draft.id}`)) continue;
          try {
            await syncDraft(draft);
            attempts.delete(key);
          } catch (e) {
            const code = (e as { code?: string }).code || "";
            const count = /permission|unauthenticated|invalid-argument/.test(
              code,
            )
              ? 5
              : (a?.count || 0) + 1;
            attempts.set(key, {
              count,
              next: Date.now() + Math.min(30000, 1000 * 2 ** count),
              mutation: draft.mutationId,
            });
          }
        }
    } finally {
      busy = false;
      if (!stopped) timer = setTimeout(tick, 1000);
    }
  };
  const changed = () => {
    if (!busy) {
      clearTimeout(timer);
      timer = setTimeout(tick, 1000);
    }
  };
  const retry = () => {
    attempts.clear();
    changed();
  };
  window.addEventListener("notebook-change", changed);
  window.addEventListener("online", retry);
  window.addEventListener("notebook-retry", retry);
  timer = setTimeout(tick, 1000);
  return () => {
    stopped = true;
    clearTimeout(timer);
    window.removeEventListener("notebook-change", changed);
    window.removeEventListener("online", retry);
    window.removeEventListener("notebook-retry", retry);
    if (token === generation) {
      generation++;
      activeUid = null;
    }
  };
}
export async function resolveConflict(
  uid: string,
  kind: EntityKind,
  id: string,
  choice: "remote" | "local" | "copy",
) {
  requireOwner(uid);
  const token = generation;
  const local = await getDraft<Content>(uid, kind, id);
  if (!local) throw Error("Draft unavailable");
  const remote = await readEntity<Content>(uid, kind, id);
  if (token !== generation || activeUid !== uid) throw Error("Account changed");
  if (choice === "copy") {
    if (kind !== "note") throw Error("Copy is available for notes");
    const copy = {
      ...local,
      id: crypto.randomUUID(),
      baseRevision: 0,
      localRevision: 0,
      mutationId: crypto.randomUUID(),
    };
    await saveDraft(copy, 0);
  }
  const next =
    choice === "local"
      ? {
          ...local,
          baseRevision: remote?.revision || 0,
          mutationId: crypto.randomUUID(),
        }
      : {
          ...local,
          content: remote?.content || local.content,
          baseRevision: remote?.revision || 0,
          mutationId: remote?.lastMutationId || crypto.randomUUID(),
        };
  await replaceDraft(local, next, choice === "local");
  await setMeta(uid, `conflict:${kind}:${id}`, null);
  await status(uid, kind, id, choice === "local" ? "Saved locally" : "Synced");
  announce();
}
