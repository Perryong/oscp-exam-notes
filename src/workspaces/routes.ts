import type { WorkspaceId } from "./model";
export function workspaceFromPath(path: string): WorkspaceId {
  return path === "/osai" || path.startsWith("/osai/") ? "osai" : "oscp";
}
export function workspacePath(
  workspace: WorkspaceId,
  page: "study-plan" | "notes" | "topics" | "targets" | "trash" | "library",
  id?: string,
): string {
  const segment =
    page === "targets"
      ? workspace === "osai"
        ? "labs"
        : "machines"
      : page === "library"
        ? workspace === "osai"
          ? "library"
          : "walkthroughs"
        : page;
  return (
    (workspace === "osai" ? "/osai" : "") +
    "/" +
    segment +
    (id ? "/" + encodeURIComponent(id) : "")
  );
}
