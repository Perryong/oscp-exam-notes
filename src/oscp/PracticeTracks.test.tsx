import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PracticeTracks from "./PracticeTracks";
import practice from "./practice-tracks.json";
import topics from "./topics.json";
afterEach(cleanup);
function open(path = "/practice-tracks") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/practice-tracks/:trackId?" element={<PracticeTracks />} />
      </Routes>
    </MemoryRouter>,
  );
}
test("tracks open their exercises, pinned references and exact Mindmap node", () => {
  open();
  expect(screen.getAllByRole("link", { name: "Start track →" })).toHaveLength(
    7,
  );
  fireEvent.click(
    screen.getByRole("link", { name: /^Enumeration$/ }),
  );
  expect(screen.getByRole("heading", { name: "Exercise" })).toBeTruthy();
  expect(screen.getAllByText("Expected observation")).toHaveLength(4);
  expect(
    screen
      .getByRole("link", { name: "See track in Mindmap ↗" })
      .getAttribute("href"),
  ).toBe("/mindmap?node=track%3Aenumeration");
  expect(
    screen
      .getByRole("link", { name: /OSCP-Tricks-2023 · Host discovery/ })
      .getAttribute("href"),
  ).toContain(practice.sources.tricks.commit);
  fireEvent.click(
    screen.getByRole("link", { name: "Next: Web applications →" }),
  );
  expect(
    screen.getByRole("heading", { name: "Web applications", level: 1 }),
  ).toBeTruthy();
});
test("missing track offers recovery instead of showing unrelated content", () => {
  open("/practice-tracks/missing");
  expect(
    screen.getByRole("heading", { name: "Practice track not found" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Browse practice tracks" })
      .getAttribute("href"),
  ).toBe("/practice-tracks");
});
test("every track has actionable steps and resolvable concept/source references", () => {
  for (const track of practice.tracks) {
    expect(track.steps.length).toBeGreaterThanOrEqual(3);
    expect(
      track.steps.every((s) => s.action.length > 30 && s.expected.length > 30),
    ).toBe(true);
    expect(track.topicIds.every((id) => topics.some((t) => t.id === id))).toBe(
      true,
    );
    expect(track.sources.every((s) => s.source in practice.sources)).toBe(true);
  }
});
