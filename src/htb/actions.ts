import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getClient, requireOwner } from "../firebase/client";
import { fromSnapshot } from "../firebase/notes";
import { emptyNote, type NoteContent, type Saved } from "../notebook/model";
import { combined } from "../notebook/repository";
import { cacheSaved, getMeta, saveDraft } from "../persistence/local";
import { workspaceOf } from "../workspaces/model";
import { studyWeeks } from "./model";
import { weeklyNoteInitial } from "./templates";

const openings = new Map<string, Promise<string>>();
const importMessage =
  "Import your previous notebook in Settings before opening this week.";

function reusable(notes: Saved<NoteContent>[], week: number): string | null {
  const matches = notes.filter(
    (note) =>
      workspaceOf(note.content) === "oscp" && note.content.week === week,
  );
  const active = matches.find((note) => note.content.deletedAt === null);
  if (active) return active.id;
  if (matches.length) throw Error("Restore this week's note from Trash first.");
  return null;
}

async function openWeek(uid: string, week: number): Promise<string> {
  requireOwner(uid);
  const reservedWeek = 200 + week;
  const id = `htb-week-${reservedWeek}`;
  const existing = reusable(
    await combined<NoteContent>(uid, "note"),
    reservedWeek,
  );
  requireOwner(uid);
  if (existing) return existing;
  if (await getMeta(uid, "purge:" + id))
    throw Error("This week's note was permanently deleted.");

  try {
    requireOwner(uid);
    const db = getClient().db;
    const [remote, purged, legacy, weekly] = await Promise.all([
      getDoc(doc(db, "users", uid, "notebookNotes", id)),
      getDoc(doc(db, "users", uid, "purgedNotes", id)),
      getDoc(doc(db, "users", uid, "notes", `week-${reservedWeek}`)),
      getDocs(
        query(
          collection(db, "users", uid, "notebookNotes"),
          where("week", "==", reservedWeek),
        ),
      ),
    ]);
    requireOwner(uid);
    if (purged.exists())
      throw Error("This week's note was permanently deleted.");
    for (const snapshot of weekly.docs) {
      const value = fromSnapshot<NoteContent>(snapshot);
      if (workspaceOf(value.content) !== "oscp") continue;
      requireOwner(uid);
      await cacheSaved(uid, "note", value);
    }
    const imported = reusable(
      await combined<NoteContent>(uid, "note"),
      reservedWeek,
    );
    requireOwner(uid);
    if (imported) return imported;
    if (remote.exists()) {
      const value = fromSnapshot<NoteContent>(remote);
      const reused = reusable([value], reservedWeek);
      if (!reused)
        throw Error("This week's note ID is already used by another note.");
      await cacheSaved(uid, "note", value);
      requireOwner(uid);
      return reused;
    }
    if (typeof legacy.data()?.html === "string" && legacy.data()!.html.trim())
      throw Error(importMessage);
  } catch (error) {
    if ((error as { code?: string }).code !== "unavailable") throw error;
  }

  if (localStorage.getItem(`oscp-note-${reservedWeek}`)?.trim())
    throw Error(importMessage);

  // Recheck after the remote read: another tab may have opened or trashed it.
  const latest = await combined<NoteContent>(uid, "note");
  const reused = reusable(latest, reservedWeek);
  requireOwner(uid);
  if (reused) return reused;
  if (latest.some((note) => note.id === id))
    throw Error("This week's note ID is already used by another note.");
  if (await getMeta(uid, "purge:" + id))
    throw Error("This week's note was permanently deleted.");
  requireOwner(uid);
  const result = await saveDraft(
    {
      uid,
      kind: "note",
      id,
      content: {
        ...emptyNote("oscp"),
        ...weeklyNoteInitial(week),
        machineId: null,
      },
      baseRevision: 0,
      localRevision: 0,
      mutationId: crypto.randomUUID(),
      modifiedAt: Date.now(),
    },
    0,
  );
  if (result.kind === "conflict") {
    const concurrent = reusable(
      await combined<NoteContent>(uid, "note"),
      reservedWeek,
    );
    if (!concurrent)
      throw Error("Another tab changed this week's note. Reload to review it.");
    return concurrent;
  }
  return id;
}

export async function ensureHtbWeekNote(
  uid: string,
  week: number,
): Promise<string> {
  if (!Number.isInteger(week) || week < 1 || week > studyWeeks.length)
    throw new RangeError(`HTB week must be between 1 and ${studyWeeks.length}`);
  const key = JSON.stringify([uid, week]);
  const pending = openings.get(key);
  if (pending) return pending;
  const opening = openWeek(uid, week);
  openings.set(key, opening);
  try {
    return await opening;
  } finally {
    openings.delete(key);
  }
}
