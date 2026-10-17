import React from "react";
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import WalkthroughLibrary from "./WalkthroughLibrary";
import { catalog, machineWalkthrough } from "./catalog";
afterEach(cleanup);
test("study tracks intersect with search and preserve dual-listed machines", async () => {
  render(
    <MemoryRouter>
      <WalkthroughLibrary />
    </MemoryRouter>,
  );
  const user = userEvent.setup();
  await user.selectOptions(screen.getByLabelText("Study track"), "Red Teaming");
  await user.type(screen.getByLabelText("Search walkthroughs"), "Forest");
  expect(screen.getByRole("link", { name: "Forest" })).toBeTruthy();
  await user.selectOptions(screen.getByLabelText("Study track"), "OSCP");
  expect(screen.getByRole("link", { name: "Forest" })).toBeTruthy();
  await user.clear(screen.getByLabelText("Search walkthroughs"));
  await user.type(screen.getByLabelText("Search walkthroughs"), "Intelligence");
  expect(screen.queryByRole("link", { name: "Intelligence" })).toBeNull();
  await user.selectOptions(screen.getByLabelText("Study track"), "Red Teaming");
  expect(screen.getByRole("link", { name: "Intelligence" })).toBeTruthy();
});
test("new guides match only the correct platform and keep existing guide destinations", () => {
  expect(catalog.articles).toHaveLength(281);
  expect(machineWalkthrough("Forest", "HackTheBox")?.source).toContain(
    "htb-forest.html",
  );
  expect(machineWalkthrough("Forest", "Proving Grounds")).toBeUndefined();
  expect(machineWalkthrough("Bashed", "HackTheBox")?.id).toBe(
    "hackthebox--bashed",
  );
});
