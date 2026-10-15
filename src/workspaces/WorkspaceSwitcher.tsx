import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { beforeLeaveEditor } from "../editor/NoteEditor";
import type { WorkspaceId } from "./model";
import { workspacePath } from "./routes";
export default function WorkspaceSwitcher({
  workspace,
}: {
  workspace: WorkspaceId;
}) {
  const navigate = useNavigate(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function change(next: WorkspaceId) {
    setBusy(true);
    setError("");
    try {
      if (!(await beforeLeaveEditor()))
        throw Error(
          "Save or export your current edit before switching workspaces.",
        );
      navigate(workspacePath(next, "study-plan"));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="workspace-switcher">
      <label>
        Study workspace
        <select
          aria-label="Study workspace"
          value={workspace}
          disabled={busy}
          onChange={(e) => void change(e.target.value as WorkspaceId)}
        >
          <option value="oscp">OSCP</option>
          <option value="osai">OSAI</option>
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
