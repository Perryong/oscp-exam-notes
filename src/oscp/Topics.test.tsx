import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Topics from "./Topics";
afterEach(cleanup);
test("public concept pages explain prerequisites and lead to full source material", () => {
  render(
    <MemoryRouter initialEntries={["/topics/web"]}>
      <Routes>
        <Route path="/topics/:topicId" element={<Topics />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "The idea in plain language" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { name: "Common misunderstandings" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Discovery & enumeration →" })
      .getAttribute("href"),
  ).toBe("/topics/enumeration");
  expect(
    screen.getByRole("link", { name: "See in Mindmap ↗" }).getAttribute("href"),
  ).toBe("/mindmap?node=topic%3Aweb");
  expect(
    document.querySelectorAll(".map-results article").length,
  ).toBeGreaterThan(0);
});
