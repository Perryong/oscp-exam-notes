import { test, expect } from "vitest";
import { withSeedMachines } from "./seeds";
import { searchNotes } from "./search";
import { noteContent } from "../../tests/fixtures/builders";
test("unmodified study machines remain available for associations and search", () => {
  const machines = withSeedMachines([]),
    markup = machines.find((m) => m.content.name === "Markup")!;
  const note = {
    id: "n",
    content: noteContent({ machineId: markup.id }),
    revision: 1,
    lastMutationId: "m",
    createdAt: 1,
    updatedAt: 1,
  };
  expect(searchNotes([note], machines, "Markup")).toHaveLength(1);
  expect(
    withSeedMachines([
      { ...markup, content: { ...markup.content, name: "Renamed" } },
    ]).find((m) => m.id === markup.id)?.content.name,
  ).toBe("Renamed");
});
