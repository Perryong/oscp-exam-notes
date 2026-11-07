import { vaultNotes } from "../notebook/vault";
import topics from "./topics.json";
import type { Saved, NoteContent, MachineContent } from "../notebook/model";
import { workspaceOf } from "../workspaces/model";

export type Resource = {
  id: string;
  title: string;
  kind: string;
  href: string;
  collection: string;
  topicIds: string[];
  links?: string[];
  aliases?: string[];
};
export type GraphNode = Resource & { description?: string };
export type GraphEdge = { from: string; to: string; label: string };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };
export const collectionId = (name: string) => "collection:" + name;
export const mapHref = (id: string) =>
  "/mindmap?node=" + encodeURIComponent(id);
export const kindLabel: Record<string, string> = {
  topic: "Concept",
  collection: "Collection",
  reference: "Source note",
  lesson: "Study lesson",
  track: "Practice track",
  cheatsheet: "Cheat sheet",
  walkthrough: "Walkthrough",
  week: "Practice week",
  machine: "Machine",
  note: "My note",
  root: "Workspace",
};
export function buildGraph(
  resources: Resource[],
  notes: Saved<NoteContent>[],
  machines: Saved<MachineContent>[],
  signedIn: boolean,
): Graph {
  const nodes: GraphNode[] = [
    {
      id: "oscp",
      title: "OSCP",
      kind: "root",
      href: "/study-plan",
      collection: "",
      topicIds: [],
      description:
        "Understand the concepts. Read the evidence. Practise and record what you learn.",
    },
  ];
  const edges: GraphEdge[] = [];
  const addEdge = (from: string, to: string, label: string) => {
    if (from !== to) edges.push({ from, to, label });
  };
  const privateNotes = signedIn
    ? notes.filter(
        (n) =>
          workspaceOf(n.content) === "oscp" && n.content.deletedAt === null,
      )
    : [];
  const vaultIds = new Set(vaultNotes(privateNotes).map((n) => n.id));
  const runtime = new Map(resources.map((r) => [r.id, { ...r }]));
  if (signedIn)
    for (const m of machines.filter((m) => workspaceOf(m.content) === "oscp")) {
      const prior = runtime.get("machine:" + m.id);
      runtime.set("machine:" + m.id, {
        id: "machine:" + m.id,
        title: m.content.name,
        kind: "machine",
        href: "/machines#" + m.id,
        collection: "Practice machines",
        topicIds: prior?.topicIds || [],
        links: prior?.links || [],
      });
    }
  for (const n of privateNotes)
    runtime.set("note:" + n.id, {
      id: "note:" + n.id,
      title: n.content.title || "Untitled note",
      kind: "note",
      href: "/notes/" + encodeURIComponent(n.id),
      collection: "My private notes",
      aliases: vaultIds.has(n.id)
        ? ["/knowledge-vault/" + encodeURIComponent(n.id)]
        : [],
      topicIds: topics
        .filter((t) =>
          n.content.tags.some(
            (tag) =>
              tag.toLowerCase() === t.id ||
              tag.toLowerCase() === t.title.toLowerCase(),
          ),
        )
        .map((t) => t.id),
    });
  for (const t of topics) {
    nodes.push({
      id: "topic:" + t.id,
      title: t.title,
      kind: "topic",
      href: "/topics/" + t.id,
      collection: "",
      topicIds: [t.id],
      description: t.summary,
    });
    addEdge("oscp", "topic:" + t.id, "Learn");
    for (const prerequisite of t.prerequisites)
      addEdge("topic:" + prerequisite, "topic:" + t.id, "Learn before");
  }
  for (const name of new Set([...runtime.values()].map((r) => r.collection))) {
    nodes.push({
      id: collectionId(name),
      title: name,
      kind: "collection",
      href: "",
      collection: name,
      topicIds: [],
    });
    addEdge("oscp", collectionId(name), "Browse");
  }
  for (const r of runtime.values()) {
    nodes.push(r);
    addEdge(collectionId(r.collection), r.id, "Contains");
    for (const topic of r.topicIds)
      if (topics.some((t) => t.id === topic))
        addEdge(
          "topic:" + topic,
          r.id,
          r.kind === "note"
            ? "Tagged topic"
            : r.kind === "track"
              ? "Practise concept"
              : "Suggested topic",
        );
    for (const link of r.links || [])
      if (runtime.has(link)) addEdge(r.id, link, "Practice link");
  }
  const byHref = new Map(
    nodes
      .filter((n) => n.href)
      .flatMap(
        (n) =>
          [[n.href, n.id], ...(n.aliases || []).map((a) => [a, n.id])] as [
            string,
            string,
          ][],
      ),
  );
  for (const n of privateNotes) {
    if (n.content.machineId && runtime.has("machine:" + n.content.machineId))
      addEdge("note:" + n.id, "machine:" + n.content.machineId, "Notes on");
    // Only explicit local hyperlinks are relationships. Note text is never executed.
    try {
      const stack: unknown[] = [JSON.parse(n.content.contentJson)];
      while (stack.length) {
        const value = stack.pop();
        if (!value || typeof value !== "object") continue;
        const obj = value as Record<string, unknown>;
        if (obj.type === "link" && obj.attrs && typeof obj.attrs === "object") {
          const href = (obj.attrs as Record<string, unknown>).href;
          if (typeof href === "string") {
            const local =
              href.startsWith("/") && !href.startsWith("//")
                ? href
                : href.startsWith("https://oscp-exam-notes.vercel.app/")
                  ? href.slice("https://oscp-exam-notes.vercel.app".length)
                  : "";
            const target = byHref.get(local) || byHref.get(local.split("#")[0]);
            if (target) addEdge("note:" + n.id, target, "Links to");
          }
        }
        for (const child of Object.values(obj))
          if (Array.isArray(child)) stack.push(...child);
          else if (child && typeof child === "object") stack.push(child);
      }
    } catch {
      /* An unavailable editor document does not hide the note's title. */
    }
  }
  return {
    nodes,
    edges: [
      ...new Map(
        edges.map((e) => [e.from + "|" + e.to + "|" + e.label, e]),
      ).values(),
    ],
  };
}

export function connections(graph: Graph, id: string) {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  return graph.edges
    .filter((e) => e.from === id || e.to === id)
    .map((e) => ({
      node: byId.get(e.from === id ? e.to : e.from)!,
      label: e.label,
      incoming: e.to === id,
    }));
}

export function resourceAt(graph: Graph, href: string) {
  return graph.nodes.find((n) => n.href === href || n.aliases?.includes(href));
}
