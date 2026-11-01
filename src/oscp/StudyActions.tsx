import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspaceNotebook } from "../notebook/NotebookContext";
import { createNote } from "../notebook/repository";
import { workspacePath } from "../workspaces/routes";
import type { WorkspaceId } from "../workspaces/model";

export default function StudyActions({
  uid,
  workspace,
}: {
  uid?: string;
  workspace: WorkspaceId;
}) {
  const { notes, machines } = useWorkspaceNotebook(workspace);
  const recent = [...notes]
    .filter((n) => n.content.deletedAt === null)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const active = [...machines]
    .filter((m) => m.content.progress === "in-progress")
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const navigate = useNavigate();
  async function addNote() {
    if (!uid || busy) return;
    setBusy(true);
    setError("");
    try {
      const id = await createNote(uid, null, workspace);
      navigate(workspacePath(workspace, "notes", id));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="study-actions" aria-label="Study actions">
        <div>
          <small>CAPTURE</small>
          {uid ? (
            <button disabled={busy} onClick={() => void addNote()}>
              {busy ? "Creating…" : "New note"}
            </button>
          ) : (
            <Link to="/settings">Sign in to take notes →</Link>
          )}
        </div>
        <div>
          <small>{recent ? "RECENT NOTE" : "STUDY"}</small>
          <Link
            to={
              recent
                ? workspacePath(workspace, "notes", recent.id)
                : workspace === "oscp"
                  ? "/topics/foundations"
                  : "/osai/library/osai-vault"
            }
          >
            {recent
              ? recent.content.title || "Untitled note"
              : "Start studying →"}
          </Link>
        </div>
        <div>
          <small>{active ? "RESUME PRACTICE" : "PRACTICE"}</small>
          <Link
            to={
              active
                ? workspacePath(workspace, "targets") +
                  "#" +
                  encodeURIComponent(active.id)
                : workspace === "oscp"
                  ? "/practice-tracks"
                  : "/osai/library"
            }
          >
            {active ? active.content.name : "Choose a practice lab →"}
          </Link>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
