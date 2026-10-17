import { expect, test } from "vitest";
import resources from "./resources.json";
import { buildGraph, connections, resourceAt } from "./graph";

test("all seven practice tracks have curated concept links and working graph destinations", () => {
  const tracks = resources.filter((r) => r.kind === "track");
  expect(tracks).toHaveLength(7);
  const graph = buildGraph(resources, [], [], false);
  for (const track of tracks) {
    expect(resourceAt(graph, track.href)?.id).toBe(track.id);
    expect(track.topicIds.length).toBeGreaterThan(0);
    for (const id of track.topicIds) {
      expect(connections(graph, "topic:" + id)).toContainEqual({
        node: expect.objectContaining({ id: track.id }),
        label: "Practise concept",
        incoming: false,
      });
    }
  }
});
