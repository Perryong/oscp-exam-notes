import { workspaceOf, type WorkspaceId } from "../workspaces/model";
import { useState } from "react";
import { useNotebook } from "./NotebookContext";
import { restoreNote, purgeNote } from "./repository";
export default function TrashView({
  uid,
  workspace = "oscp",
}: {
  uid: string;
  workspace?: WorkspaceId;
}) {
  const { notes } = useNotebook(),
    [error, setError] = useState("");
  return (
    <section className="page">
      <h1>Trash</h1>
      {notes
        .filter(
          (n) =>
            workspaceOf(n.content) === workspace &&
            n.content.deletedAt !== null,
        )
        .map((n) => (
          <article className="week-card" key={n.id}>
            <h2>{n.content.title}</h2>
            <button
              onClick={() =>
                void restoreNote(uid, n.id).catch((e) => setError(String(e)))
              }
            >
              Restore {n.content.title}
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Permanently delete this note and its history? Screenshots will be retained.",
                  )
                )
                  void purgeNote(uid, n.id, n.revision).catch((e) =>
                    setError(String(e)),
                  );
              }}
            >
              Delete permanently
            </button>
          </article>
        ))}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
