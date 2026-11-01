import { NavLink, useLocation } from "react-router-dom";
import type { WorkspaceId } from "../workspaces/model";
import { workspacePath } from "../workspaces/routes";

export default function WorkspaceNav({
  workspace,
}: {
  workspace: WorkspaceId;
}) {
  const { pathname } = useLocation();
  const secondary =
    workspace === "oscp"
      ? [
          ["/topics", "Concepts"],
          ["/mindmap", "Mindmap"],
          ["/practice-tracks", "Practice tracks"],
          ["/knowledge-vault", "Knowledge Vault"],
          ["/cheat-sheet", "Cheat sheet"],
          ["/walkthroughs", "Walkthroughs"],
        ]
      : [
          ["/osai/topics", "Topics"],
          ["/osai/library/osai-vault", "OSAI Vault"],
          ["/osai/library/owasp-resources", "OWASP Resources"],
          ["/osai/library", "Learning library"],
        ];
  return (
    <div className="workspace-navigation">
      <nav aria-label="Primary" className="primary-nav">
        <NavLink to={workspacePath(workspace, "study-plan")}>Today</NavLink>
        <NavLink to={workspacePath(workspace, "targets")}>Practice</NavLink>
        <NavLink to={workspacePath(workspace, "notes")}>Notes</NavLink>
        <NavLink to={workspace === "oscp" ? "/library" : "/osai/resources"}>
          Library
        </NavLink>
      </nav>
      <details className="more-navigation" key={pathname}>
        <summary>More</summary>
        <nav aria-label="More destinations">
          {secondary.map(([to, label]) => (
            <NavLink key={to} to={to} end>
              {label}
            </NavLink>
          ))}
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </details>
    </div>
  );
}
