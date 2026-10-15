export type WorkspaceId = "oscp" | "osai";
export function workspaceOf(value: { workspace?: WorkspaceId }): WorkspaceId {
  if (!Object.hasOwn(value, "workspace")) return "oscp";
  if (value.workspace !== "oscp" && value.workspace !== "osai")
    throw Error("Invalid workspace");
  return value.workspace;
}
export function sameWorkspace(
  a: { workspace?: WorkspaceId },
  b: { workspace?: WorkspaceId },
): boolean {
  return workspaceOf(a) === workspaceOf(b);
}
