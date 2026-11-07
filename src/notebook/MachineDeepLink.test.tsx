import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MachineView from "./MachineView";
import { machineContent } from "../../tests/fixtures/builders";
const data = vi.hoisted(() => ({ machines: [] as unknown[], notes: [] }));
vi.mock("./NotebookContext", () => ({ useNotebook: () => data }));
vi.mock("../persistence/local", () => ({
  listDrafts: async () => [],
  getMeta: async () => null,
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  data.machines = [];
});
test("machine hash navigation retries when a custom machine arrives from sync", () => {
  const scroll = vi.fn();
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: scroll,
  });
  const app = (
    <MemoryRouter initialEntries={["/machines#later"]}>
      <MachineView uid="alice" />
    </MemoryRouter>
  );
  const view = render(app);
  expect(scroll).not.toHaveBeenCalled();
  data.machines = [
    {
      id: "later",
      content: machineContent({ name: "Synced lab" }),
      revision: 1,
      lastMutationId: "x",
      createdAt: 1,
      updatedAt: 1,
    },
  ];
  view.rerender(
    <MemoryRouter initialEntries={["/machines#later"]}>
      <MachineView uid="alice" />
    </MemoryRouter>,
  );
  expect(scroll).toHaveBeenCalledOnce();
});
