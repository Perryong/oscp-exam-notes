import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
const guard = vi.hoisted(() => vi.fn());
vi.mock("../editor/NoteEditor", () => ({ beforeLeaveEditor: guard }));
afterEach(cleanup);
function Route() {
  return <output>{useLocation().pathname}</output>;
}
test("failed persistence blocks workspace navigation", async () => {
  guard.mockResolvedValue(false);
  render(
    <MemoryRouter initialEntries={["/notes/n"]}>
      <WorkspaceSwitcher workspace="oscp" />
      <Route />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Study workspace"), {
    target: { value: "osai" },
  });
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain("Save"),
  );
  expect(screen.getByText("/notes/n")).toBeTruthy();
});
test("successful persistence allows switching", async () => {
  guard.mockResolvedValue(true);
  render(
    <MemoryRouter>
      <WorkspaceSwitcher workspace="oscp" />
      <Route />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Study workspace"), {
    target: { value: "osai" },
  });
  await waitFor(() =>
    expect(screen.getByText("/osai/study-plan")).toBeTruthy(),
  );
});
