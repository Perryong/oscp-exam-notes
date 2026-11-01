export type WorkspaceId = "oscp" | "osai" | "automated-pentest";
export function workspaceOf(value: { workspace?: WorkspaceId }): WorkspaceId {
  if (!Object.hasOwn(value, "workspace")) return "oscp";
  if (
    value.workspace !== "oscp" &&
    value.workspace !== "osai" &&
    value.workspace !== "automated-pentest"
  )
    throw Error("Invalid workspace");
  return value.workspace;
}
export function sameWorkspace(
  a: { workspace?: WorkspaceId },
  b: { workspace?: WorkspaceId },
): boolean {
  return workspaceOf(a) === workspaceOf(b);
}

export const workspaceLabel = (workspace: WorkspaceId) =>
  workspace === "automated-pentest"
    ? "Automated Pentest"
    : workspace.toUpperCase();
