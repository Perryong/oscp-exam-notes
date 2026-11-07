import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import StudyActions from "./StudyActions";
import { emptyNote } from "../notebook/model";
const mocks = vi.hoisted(() => ({
  createNote: vi.fn(),
  data: { notes: [] as any[], machines: [] as any[] },
}));
vi.mock("../notebook/NotebookContext", () => ({
  useWorkspaceNotebook: () => mocks.data,
}));
vi.mock("../notebook/repository", () => ({ createNote: mocks.createNote }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.data = { notes: [], machines: [] };
});
test("resume links use newest active note and in-progress lab, ignoring trash", () => {
  mocks.data.notes = [
    {
      id: "trashed",
      updatedAt: 30,
      content: { ...emptyNote(), title: "Deleted", deletedAt: 1 },
    },
    { id: "older", updatedAt: 10, content: { ...emptyNote(), title: "Older" } },
    {
      id: "latest",
      updatedAt: 20,
      content: { ...emptyNote(), title: "Evidence" },
    },
  ];
  mocks.data.machines = [
    {
      id: "done",
      updatedAt: 40,
      content: { name: "Finished", progress: "completed" },
    },
    {
      id: "lab",
      updatedAt: 20,
      content: { name: "Model lab", progress: "in-progress" },
    },
  ];
  render(
    <MemoryRouter>
      <StudyActions uid="alice" workspace="osai" />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("link", { name: "Evidence" }).getAttribute("href"),
  ).toBe("/osai/notes/latest");
  expect(
    screen.getByRole("link", { name: "Model lab" }).getAttribute("href"),
  ).toBe("/osai/labs#lab");
  expect(screen.queryByText("Deleted")).toBeNull();
  expect(mocks.createNote).not.toHaveBeenCalled();
});
test("new note is created only on click in the selected workspace", async () => {
  mocks.createNote.mockResolvedValue("new-id");
  render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={<StudyActions uid="alice" workspace="osai" />}
        />
        <Route path="/osai/notes/new-id" element={<p>New note editor</p>} />
      </Routes>
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole("button", { name: "New note" }));
  expect(mocks.createNote).toHaveBeenCalledWith("alice", null, "osai");
  expect(await screen.findByText("New note editor")).toBeTruthy();
});
test("signed-out home directs capture to sign-in without writing data", () => {
  render(
    <MemoryRouter>
      <StudyActions workspace="oscp" />
    </MemoryRouter>,
  );
  expect(
    screen
      .getByRole("link", { name: "Sign in to take notes →" })
      .getAttribute("href"),
  ).toBe("/settings");
  expect(screen.queryByRole("button", { name: "New note" })).toBeNull();
  expect(mocks.createNote).not.toHaveBeenCalled();
});
