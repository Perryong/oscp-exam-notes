import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render as baseRender,
  screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import CheatSheet from "./CheatSheet";
const render = (ui: ReactNode) => baseRender(<MemoryRouter>{ui}</MemoryRouter>);

test("map deep links open the correct imported section", () => {
  baseRender(
    <MemoryRouter
      initialEntries={["/cheat-sheet?collection=imported&section=imported-3"]}
    >
      <CheatSheet />
    </MemoryRouter>,
  );
  const details = document.getElementById("imported-3");
  expect(details?.hasAttribute("open")).toBe(true);
  expect(details?.textContent).toContain("Important Locations");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("opens the supplied collection, searches commands and keeps the previous collection", () => {
  render(<CheatSheet />);
  expect(
    screen
      .getByRole("link", { name: "Download original Markdown" })
      .getAttribute("href"),
  ).toBe("/oscp-cheatsheet/README.md");
  expect(screen.getByRole("combobox", { name: "Collection" })).toBeTruthy();
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "ligolo" },
  });
  expect(
    document.querySelectorAll("details.reference-section").length,
  ).toBeGreaterThan(0);
  expect(
    [...document.querySelectorAll("details.reference-section")].every((n) =>
      n.hasAttribute("open"),
    ),
  ).toBe(true);
  fireEvent.change(screen.getByRole("combobox", { name: "Collection" }), {
    target: { value: "previous" },
  });
  expect(
    screen.queryByRole("link", { name: "Download original Markdown" }),
  ).toBeNull();
  expect(screen.getByRole("searchbox").getAttribute("value")).toBe("");
});

test("copy buttons copy only their code block, and empty searches give feedback", async () => {
  const copy = vi.fn(async () => {});
  vi.stubGlobal("navigator", { clipboard: { writeText: copy } });
  render(<CheatSheet />);
  const button = document.querySelector<HTMLButtonElement>(".copy-command")!;
  expect(button).toBeTruthy();
  const code = button.parentElement!.querySelector("pre")!.textContent;
  fireEvent.click(button);
  expect(copy).toHaveBeenCalledWith(code);
  expect(await screen.findByText("Copied code")).toBeTruthy();
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "zzzz-nothing-matches" },
  });
  expect(screen.getByText("No sections match your search.")).toBeTruthy();
});
