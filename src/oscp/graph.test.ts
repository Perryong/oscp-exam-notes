import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { buildGraph, resourceAt } from "./graph";
import resources from "./resources.json";
import topics from "./topics.json";
import { emptyNote } from "../notebook/model";
import { catalog } from "../walkthroughs/catalog";

test("every imported resource has a stable unique node and collection connection", () => {
  const graph = buildGraph(resources, [], [], false);
  expect(new Set(graph.nodes.map((n) => n.id)).size).toBe(graph.nodes.length);
  const ids = new Set(graph.nodes.map((n) => n.id));
  expect(graph.edges.every((e) => ids.has(e.from) && ids.has(e.to))).toBe(true);
  expect(resources.filter((r) => r.kind === "walkthrough")).toHaveLength(
    catalog.articles.length,
  );
  const hacker = JSON.parse(
    readFileSync("public/hacker-docs/catalog.json", "utf8"),
  );
  expect(resources.filter((r) => r.id.startsWith("source:"))).toHaveLength(
    hacker.notes.length,
  );
  expect(resources.filter((r) => r.kind === "cheatsheet")).toHaveLength(80);
  for (const r of resources)
    expect(
      graph.edges.some((e) => e.to === r.id && e.label === "Contains"),
    ).toBe(true);
  expect(
    topics.every((t) =>
      t.prerequisites.every((id) => topics.some((p) => p.id === id)),
    ),
  ).toBe(true);
});

test("private notes are account-scoped, exclude OSAI and trash, and expose real backlinks", () => {
  const note = (id: string, fields = {}) => ({
    id,
    content: { ...emptyNote(), title: id, ...fields },
    revision: 1,
    lastMutationId: "x",
    createdAt: 1,
    updatedAt: 1,
  });
  const notes = [
    note("dns", { tags: ["enumeration"] }),
    note("lab", {
      contentJson: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "text",
            text: "DNS",
            marks: [{ type: "link", attrs: { href: "/notes/dns" } }],
          },
        ],
      }),
    }),
    note("private-osai", { workspace: "osai" }),
    note("deleted", { deletedAt: 1 }),
  ];
  expect(
    buildGraph(resources, notes, [], false).nodes.some(
      (n) => n.kind === "note",
    ),
  ).toBe(false);
  const graph = buildGraph(resources, notes, [], true);
  expect(graph.nodes.filter((n) => n.kind === "note").map((n) => n.id)).toEqual(
    ["note:dns", "note:lab"],
  );
  expect(graph.edges).toContainEqual({
    from: "note:lab",
    to: "note:dns",
    label: "Links to",
  });
  expect(graph.edges).toContainEqual({
    from: "topic:enumeration",
    to: "note:dns",
    label: "Tagged topic",
  });
  expect(
    buildGraph(resources, [], [], true).nodes.some((n) => n.kind === "note"),
  ).toBe(false);
});

test("private vault reading URLs resolve to the same note and preserve backlinks", () => {
  const saved = (id: string, fields = {}) => ({
    id,
    content: { ...emptyNote(), title: id, ...fields },
    revision: 1,
    lastMutationId: "x",
    createdAt: 1,
    updatedAt: 1,
  });
  const graph = buildGraph(
    resources,
    [
      saved("vault", { tags: ["knowledge-vault"] }),
      saved("link", {
        contentJson: JSON.stringify({
          type: "link",
          attrs: {
            href: "https://oscp-exam-notes.vercel.app/knowledge-vault/vault",
          },
        }),
      }),
    ],
    [],
    true,
  );
  expect(resourceAt(graph, "/knowledge-vault/vault")?.id).toBe("note:vault");
  expect(graph.edges).toContainEqual({
    from: "note:link",
    to: "note:vault",
    label: "Links to",
  });
});
