import { sameWorkspace, workspaceOf } from "../workspaces/model";
import { useEffect, useState } from "react";
import type { NoteContent, Saved } from "../notebook/model";
import { listHistory, readEntity } from "../firebase/notes";
import { beforeLeaveEditor } from "../editor/NoteEditor";
import { getDraft, saveDraft, replaceDraft } from "./local";
export default function RecoveryPanel({
  uid,
  id,
  onRestored,
}: {
  uid: string;
  id: string;
  onRestored: () => void;
}) {
  const [versions, setVersions] = useState<Saved<NoteContent>[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    void listHistory(uid, id)
      .then((v) => alive && setVersions(v))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, [uid, id]);
  async function restore(v: Saved<NoteContent>) {
    try {
      if (!(await beforeLeaveEditor()))
        throw Error("Save or export the live edit before restoring");
      const local = await getDraft<NoteContent>(uid, "note", id),
        remote = await readEntity<NoteContent>(uid, "note", id);
      if (!remote) throw Error("Note unavailable");
      if (!sameWorkspace(remote.content, v.content))
        throw Error("History workspace mismatch");
      const replacement = {
        uid,
        kind: "note" as const,
        id,
        content: {
          ...v.content,
          workspace: workspaceOf(remote.content),
          deletedAt: null,
        },
        baseRevision: remote.revision,
        localRevision: local?.localRevision || 0,
        mutationId: crypto.randomUUID(),
        modifiedAt: Date.now(),
      };
      if (local) await replaceDraft(local, replacement, true);
      else if ((await saveDraft(replacement, 0)).kind === "conflict")
        throw Error(
          "Another tab edited this note. Your restoration is retained for recovery.",
        );
      onRestored();
    } catch (e) {
      setError(String(e));
    }
  }
  return (
    <details>
      <summary>Previous versions</summary>
      <p>Restoring adds a new revision and preserves the current version.</p>
      {versions.map((v) => (
        <div key={v.revision}>
          <span>
            Revision {v.revision}: {v.content.title} ·{" "}
            {new Date(v.updatedAt).toLocaleString()}
          </span>
          <button onClick={() => restore(v)}>
            Restore revision {v.revision}
          </button>
        </div>
      ))}
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
