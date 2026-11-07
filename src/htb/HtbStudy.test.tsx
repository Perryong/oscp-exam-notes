import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test } from "vitest";
import HtbStudy from "./HtbStudy";
beforeEach(() => localStorage.clear());
afterEach(cleanup);
test("public schedule presents all weeks without creating notes", () => {
  render(
    <MemoryRouter>
      <HtbStudy />
    </MemoryRouter>,
  );
  expect(screen.getAllByRole("link", { name: /^HTB week \d+$/ })).toHaveLength(
    51,
  );
  expect(
    screen
      .getByRole("link", { name: "Sign in for HTB week 51 notes" })
      .getAttribute("href"),
  ).toBe("/settings");
  expect(localStorage.getItem("oscp-ladder")).toBeNull();
});
test("whole module completion follows allocations and preserves machine progress", () => {
  localStorage.setItem(
    "oscp-ladder",
    JSON.stringify({ "existing-machine": 1 }),
  );
  render(
    <MemoryRouter initialEntries={["/calendar?week=3"]}>
      <HtbStudy calendar />
    </MemoryRouter>,
  );
  fireEvent.click(
    screen.getAllByRole("checkbox", {
      name: "Module complete: Footprinting",
    })[0],
  );
  expect(
    screen
      .getAllByRole("checkbox", { name: "Module complete: Footprinting" })
      .every((e) => (e as HTMLInputElement).checked),
  ).toBe(true);
  fireEvent.change(screen.getByLabelText("Study week"), {
    target: { value: "4" },
  });
  expect(
    (
      screen.getAllByRole("checkbox", {
        name: "Module complete: Footprinting",
      })[0] as HTMLInputElement
    ).checked,
  ).toBe(true);
  expect(JSON.parse(localStorage.getItem("oscp-ladder")!)).toEqual({
    "existing-machine": 1,
    "htb-module-112": 1,
  });
});
test("calendar month and checkpoint weeks remain navigable", () => {
  render(
    <MemoryRouter initialEntries={["/calendar?week=7"]}>
      <HtbStudy calendar />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "HTB week 7 · 10 hours" }),
  ).toBeTruthy();
  expect(screen.getAllByText(/Checkpoint and catch-up/).length).toBeGreaterThan(
    0,
  );
  fireEvent.click(screen.getByRole("button", { name: /^Month$/ }));
  expect(
    screen.getByLabelText("Study month").querySelectorAll("button"),
  ).toHaveLength(42);
  expect(
    screen.getByRole("link", { name: "Sign in for HTB week 7 notes" }),
  ).toBeTruthy();
});
