import { sameWorkspace, workspaceOf } from "../workspaces/model";
import { seedMachines } from "../notebook/seeds";
import { osaiSeedMachines } from "../osai/seeds";
import {
  doc,
  collection,
  getDoc,
  getDocsFromServer,
  runTransaction,
  serverTimestamp,
  deleteDoc,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { getClient, requireOwner } from "./client";
import type {
  Draft,
  NoteContent,
  MachineContent,
  Saved,
  SaveResult,
  EntityKind,
} from "../notebook/model";
import { validateNote, validateMachine, validId } from "../notebook/validation";
export function fromSnapshot<T>(s: DocumentSnapshot<DocumentData>): Saved<T> {
  const { revision, lastMutationId, createdAt, updatedAt, ...content } =
    s.data()!;
  return {
    id: s.id,
    content: content as T,
    revision,
    lastMutationId,
    createdAt: createdAt.toMillis(),
    updatedAt: updatedAt.toMillis(),
  };
}
export async function commitEntity<T extends NoteContent | MachineContent>(
  uid: string,
  draft: Draft<T>,
  kind: EntityKind,
): Promise<SaveResult<T>> {
  requireOwner(uid);
  if (
    draft.uid !== uid ||
    draft.kind !== kind ||
    !validId(draft.id) ||
    !validId(draft.mutationId)
  )
    throw Error("Invalid draft identity");
  kind === "note"
    ? validateNote(draft.content)
    : validateMachine(draft.content);
  const db = getClient().db,
    ref = doc(
      db,
      "users",
      uid,
      kind === "note" ? "notebookNotes" : "machines",
      draft.id,
    );
  const history = (revision: number) =>
    doc(
      db,
      "users",
      uid,
      "noteHistory",
      draft.id,
      "versions",
      String(revision),
    );
  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const old = snap.exists() ? fromSnapshot<T>(snap) : null;
    if (old?.lastMutationId === draft.mutationId)
      return { kind: "saved" as const, value: old };
    if ((old?.revision || 0) !== draft.baseRevision) {
      if (kind === "note") {
        const previous = await tx.get(history(draft.baseRevision + 1));
        if (
          previous.exists() &&
          previous.data().lastMutationId === draft.mutationId
        )
          return {
            kind: "saved" as const,
            value: { ...fromSnapshot<T>(previous), id: draft.id },
          };
      }
      return { kind: "conflict" as const, remote: old };
    }
    if (old && !sameWorkspace(old.content, draft.content))
      throw Error("Cannot change workspace");
    const reserved = [...seedMachines, ...osaiSeedMachines].find(
      (m) => m.id === draft.id,
    );
    if (
      kind === "machine" &&
      reserved &&
      !sameWorkspace(reserved.content, draft.content)
    )
      throw Error("Invalid seed workspace");
    if (kind === "note") {
      const id = (draft.content as NoteContent).machineId;
      if (id) {
        const target = await tx.get(doc(db, "users", uid, "machines", id));
        const content = target.exists()
          ? target.data()
          : [...seedMachines, ...osaiSeedMachines].find((m) => m.id === id)
              ?.content;
        if (!content || workspaceOf(content) !== workspaceOf(draft.content))
          throw Error(
            "Linked target is unavailable or belongs to another workspace",
          );
      }
    }
    if (kind === "note" && old) tx.set(history(old.revision), snap.data()!);
    const revision = (old?.revision || 0) + 1;
    tx.set(ref, {
      ...draft.content,
      revision,
      lastMutationId: draft.mutationId,
      createdAt: snap.data()?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { kind: "written" as const, revision };
  }).catch(async (error) => {
    // A concurrent replacement can make immutable-history rules reject before
    // the transaction precondition triggers the SDK's normal retry.
    if (!["permission-denied", "aborted"].includes(error.code)) throw error;
    requireOwner(uid);
    const latest = await getDoc(ref);
    const remote = latest.exists() ? fromSnapshot<T>(latest) : null;
    if (remote?.lastMutationId === draft.mutationId)
      return { kind: "saved" as const, value: remote };
    if ((remote?.revision || 0) !== draft.baseRevision)
      return { kind: "conflict" as const, remote };
    throw error;
  });
  if (result.kind !== "written") return result;
  let saved = await getDoc(ref);
  if (saved.data()?.lastMutationId !== draft.mutationId && kind === "note")
    saved = await getDoc(history(result.revision));
  if (!saved.exists() || saved.data().lastMutationId !== draft.mutationId)
    throw Error(
      "Save acknowledgment changed. Your draft is retained; retry to reconcile.",
    );
  return { kind: "saved", value: { ...fromSnapshot<T>(saved), id: draft.id } };
}
export const commitNote = (uid: string, draft: Draft<NoteContent>) =>
  commitEntity(uid, draft, "note");
export async function listHistory(
  uid: string,
  noteId: string,
): Promise<Saved<NoteContent>[]> {
  requireOwner(uid);
  return (
    await getDocsFromServer(
      collection(
        getClient().db,
        "users",
        uid,
        "noteHistory",
        noteId,
        "versions",
      ),
    )
  ).docs
    .map((s) => ({ ...fromSnapshot<NoteContent>(s), id: noteId }))
    .sort((a, b) => b.revision - a.revision);
}
export async function pruneHistory(uid: string, noteId: string) {
  const history = await listHistory(uid, noteId);
  for (const old of history.slice(20)) {
    requireOwner(uid);
    await deleteDoc(
      doc(
        getClient().db,
        "users",
        uid,
        "noteHistory",
        noteId,
        "versions",
        String(old.revision),
      ),
    );
  }
}
export async function readEntity<T>(
  uid: string,
  kind: EntityKind,
  id: string,
): Promise<Saved<T> | null> {
  requireOwner(uid);
  const s = await getDoc(
    doc(
      getClient().db,
      "users",
      uid,
      kind === "note" ? "notebookNotes" : "machines",
      id,
    ),
  );
  return s.exists() ? fromSnapshot<T>(s) : null;
}
