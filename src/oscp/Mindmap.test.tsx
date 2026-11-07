import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Mindmap from "./Mindmap";

afterEach(cleanup);
test("guided map explains concepts and opens full source resources", () => {
  render(
    <MemoryRouter initialEntries={["/mindmap?node=topic:web"]}>
      <Mindmap />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: "Mindmap" })).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Open Web applications" })
      .getAttribute("href"),
  ).toBe("/topics/web");
  fireEvent.change(screen.getByRole("searchbox", { name: "Find content" }), {
    target: { value: "HTTP / Theory" },
  });
  expect(
    screen.getByRole("button", {
      name: "Select Web Requests CURL / HTTP / Theory and Solutions",
    }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Full graph" }));
  expect(
    screen
      .getByRole("button", { name: "Full graph" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});
test("unknown node and no search results have recoverable states", () => {
  render(
    <MemoryRouter initialEntries={["/mindmap?node=missing"]}>
      <Mindmap />
    </MemoryRouter>,
  );
  expect(screen.getByText(/This item is unavailable/)).toBeTruthy();
  fireEvent.change(screen.getByRole("searchbox", { name: "Find content" }), {
    target: { value: "zzzz-unfindable" },
  });
  expect(screen.getByText("No content matches these filters.")).toBeTruthy();
});
