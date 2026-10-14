import { collection, getDocs } from "firebase/firestore";
import { getClient, requireOwner } from "../firebase/client";
import { fromSnapshot } from "../firebase/notes";
import { loadImage } from "../firebase/images";
import {
  cacheSaved,
  getMeta,
  setMeta,
  getLocalImage,
  putLocalImage,
  listCached,
} from "./local";
import type {
  NoteContent,
  MachineContent,
  OfflineReport,
} from "../notebook/model";
type Snapshot = OfflineReport & {
  revisions: { id: string; revision: number }[];
  imageIds: string[];
};
export async function getOfflineReport(uid: string): Promise<OfflineReport> {
  const old = await getMeta<Snapshot>(uid, "offline");
  if (!old)
    return {
      complete: false,
      missing: ["No snapshot downloaded"],
      completedAt: null,
    };
  const notes = await listCached<NoteContent>(uid, "note"),
    missing = [...old.missing];
  for (const n of old.revisions)
    if (!notes.some((x) => x.id === n.id && x.revision >= n.revision))
      missing.push("note:" + n.id);
  for (const id of old.imageIds)
    if (!(await getLocalImage(uid, id))) missing.push("image:" + id);
  return {
    complete: old.complete && missing.length === 0,
    missing: [...new Set(missing)],
    completedAt: old.completedAt,
  };
}
export async function downloadOffline(uid: string): Promise<OfflineReport> {
  requireOwner(uid);
  const old = await getMeta<Snapshot>(uid, "offline"),
    notes = (
      await getDocs(collection(getClient().db, "users", uid, "notebookNotes"))
    ).docs.map((s) => fromSnapshot<NoteContent>(s)),
    machines = (
      await getDocs(collection(getClient().db, "users", uid, "machines"))
    ).docs.map((s) => fromSnapshot<MachineContent>(s));
  requireOwner(uid);
  const missing: string[] = [],
    imageIds = [...new Set(notes.flatMap((n) => n.content.attachmentIds))];
  for (const note of notes)
    try {
      requireOwner(uid);
      await cacheSaved(uid, "note", note);
    } catch {
      missing.push("note:" + note.id);
    }
  for (const machine of machines)
    try {
      requireOwner(uid);
      await cacheSaved(uid, "machine", machine);
    } catch {
      missing.push("machine:" + machine.id);
    }
  for (const id of imageIds) {
    try {
      requireOwner(uid);
      const image =
        (await getLocalImage(uid, id)) || (await loadImage(uid, id));
      requireOwner(uid);
      if (!image) throw Error("Missing");
      await putLocalImage(uid, image);
    } catch {
      missing.push("image:" + id);
    }
  }
  requireOwner(uid);
  const report: Snapshot = {
    complete: missing.length === 0,
    missing,
    completedAt: missing.length ? old?.completedAt || null : Date.now(),
    revisions: notes.map((n) => ({ id: n.id, revision: n.revision })),
    imageIds,
  };
  await setMeta(uid, "offline", report);
  return report;
}
export async function getStoredImageBytes(uid: string) {
  requireOwner(uid);
  const images = await getDocs(
    collection(getClient().db, "users", uid, "images"),
  );
  requireOwner(uid);
  return images.docs.reduce(
    (total, d) => total + new TextEncoder().encode(d.data().data).byteLength,
    0,
  );
}
