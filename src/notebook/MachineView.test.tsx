import "fake-indexeddb/auto";
import { test, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MachineView, { changeMachine } from "./MachineView";
import StudyPlan from "../reference/StudyPlan";
import { cacheSaved, getDraft } from "../persistence/local";
import { machineContent } from "../../tests/fixtures/builders";
const custom = {
  id: "custom",
  content: machineContent({ name: "Custom Lab", week: 1, tags: ["web"] }),
  revision: 1,
  lastMutationId: "m",
  createdAt: 1,
  updatedAt: 1,
};
vi.mock("./NotebookContext", () => ({
  useNotebook: () => ({ machines: [custom], notes: [] }),
}));
test("custom week and tags save through machine drafts and appear in the week", async () => {
  await cacheSaved("alice", "machine", custom);
  render(
    <MemoryRouter>
      <MachineView uid="alice" />
    </MemoryRouter>,
  );
  fireEvent.blur(screen.getByLabelText("Week for Custom Lab"), {
    target: { value: "2" },
  });
  await waitFor(async () =>
    expect(
      (await getDraft<any>("alice", "machine", "custom"))?.content.week,
    ).toBe(2),
  );
  fireEvent.blur(screen.getByLabelText("Tags for Custom Lab"), {
    target: { value: "web, linux" },
  });
  await waitFor(async () =>
    expect(
      (await getDraft<any>("alice", "machine", "custom"))?.content.tags,
    ).toEqual(["web", "linux"]),
  );
  await expect(
    changeMachine("alice", "custom", { week: 999 }),
  ).rejects.toThrow();
  cleanup();
  render(
    <MemoryRouter>
      <StudyPlan uid="alice" />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("link", { name: "Custom Lab" }).getAttribute("href"),
  ).toBe("/machines#custom");
  cleanup();
});
