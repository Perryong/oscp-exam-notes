import type { Saved, NoteContent } from "./model";
import { workspaceOf } from "../workspaces/model";
export function vaultNotes(notes: Saved<NoteContent>[]) {
  return notes
    .filter(
      (n) =>
        workspaceOf(n.content) === "oscp" &&
        n.content.deletedAt === null &&
        (n.content.tags.includes("discord-resources") ||
          n.content.tags.includes("knowledge-vault")) &&
        !n.content.tags.includes("index"),
    )
    .sort((a, b) =>
      a.content.title.localeCompare(b.content.title, undefined, {
        numeric: true,
      }),
    );
}
