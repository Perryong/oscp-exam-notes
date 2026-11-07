import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LearningHome from "./LearningHome";
afterEach(cleanup);
test("a practice-week deep link expands the schedule and selects the matching phase", () => {
  render(
    <MemoryRouter initialEntries={["/study-plan?week=40"]}>
      <LearningHome />
    </MemoryRouter>,
  );
  expect(document.getElementById("weekly-practice")?.hasAttribute("open")).toBe(
    true,
  );
  expect(document.getElementById("week-40")).toBeTruthy();
  expect(screen.getAllByRole("link", { name: "Learn concept →" })).toHaveLength(
    11,
  );
});
