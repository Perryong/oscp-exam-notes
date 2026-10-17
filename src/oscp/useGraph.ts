import { useMemo } from "react";
import { useNotebook } from "../notebook/NotebookContext";
import resources from "./resources.json";
import { buildGraph } from "./graph";
export function useGraph(uid?: string) {
  const { notes, machines } = useNotebook();
  return useMemo(
    () => buildGraph(resources, notes, machines, !!uid),
    [notes, machines, uid],
  );
}
