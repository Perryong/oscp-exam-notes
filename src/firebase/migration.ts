import {
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getClient, requireOwner } from "./client";
import { ensureImage, loadImage } from "./images";
import { getLocalImage } from "../persistence/local";
import { validateNote, validateMachine } from "../notebook/validation";
import type {
  MigrationItem,
  TransferReport,
  NoteContent,
} from "../notebook/model";
export async function readLegacyCloud(uid: string) {
  requireOwner(uid);
  const values = await getDocs(
    collection(getClient().db, "users", uid, "notes"),
  );
  return Object.fromEntries(
    values.docs.map((d) => [String(d.data().week), String(d.data().html)]),
  );
}
export async function applyMigration(
  uid: string,
  items: MigrationItem[],
  cancelled = () => false,
): Promise<TransferReport> {
  const report: TransferReport = { completed: [], failed: [], skipped: [] };
  for (const item of items) {
    if (cancelled()) {
      report.skipped.push(item.id);
      continue;
    }
    try {
      requireOwner(uid);
      const isNote = item.source !== "progress";
      isNote ? validateNote(item.payload) : validateMachine(item.payload);
      if (isNote)
        for (const id of (item.payload as NoteContent).attachmentIds) {
          const image =
            (await getLocalImage(uid, id)) || (await loadImage(uid, id));
          if (!image) throw Error("Missing screenshot " + id);
          await ensureImage(uid, image);
        }
      const db = getClient().db,
        marker = doc(db, "users", uid, "migrations", item.id),
        destination = doc(
          db,
          "users",
          uid,
          isNote ? "notebookNotes" : "machines",
          item.destinationId,
        );
      const outcome = await runTransaction(db, async (tx) => {
        requireOwner(uid);
        const done = await tx.get(marker),
          existing = await tx.get(destination);
        if (done.exists() || existing.exists()) return "skipped";
        tx.set(destination, {
          ...item.payload,
          workspace: "oscp",
          revision: 1,
          lastMutationId: item.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        tx.set(marker, {
          destinationId: item.destinationId,
          kind: isNote ? "note" : "machine",
          digest: item.digest,
          createdAt: serverTimestamp(),
        });
        return "completed";
      });
      report[outcome].push(item.id);
    } catch (e) {
      report.failed.push({ id: item.id, reason: String(e) });
    }
  }
  return report;
}
