import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import KnowledgeVault from "./KnowledgeVault";
import { hackerLessons, hackerLessonNote } from "./hackerDocsContent";
import { decodeEditor } from "../editor/schema";
import { createNote } from "./repository";
vi.mock("./NotebookContext", () => ({
  useNotebook: () => ({ notes: [], machines: [] }),
}));
vi.mock("./repository", () => ({
  createNote: vi.fn().mockRejectedValue(new Error("Offline")),
}));
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function open(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/knowledge-vault/:id?"
          element={<KnowledgeVault uid="alice" />}
        />
      </Routes>
    </MemoryRouter>,
  );
}
test("collection is discoverable from the vault without private notes", () => {
  open("/knowledge-vault");
  expect(
    screen
      .getByRole("link", { name: "Hacker-DOCS study collection" })
      .getAttribute("href"),
  ).toBe("/knowledge-vault/hacker-docs");
});
test("shared lessons can be read signed out without exposing note actions", () => {
  render(
    <MemoryRouter initialEntries={["/knowledge-vault/hacker-docs--http"]}>
      <Routes>
        <Route path="/knowledge-vault/:id" element={<KnowledgeVault />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "HTTP requests and responses" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Sign in to copy this lesson" })
      .getAttribute("href"),
  ).toBe("/settings");
  expect(
    screen.queryByRole("button", { name: "Copy lesson to my notes" }),
  ).toBeNull();
});
test("collection searches lesson body concepts", () => {
  open("/knowledge-vault/hacker-docs--study-guides");
  expect(screen.getAllByRole("article")).toHaveLength(12);
  fireEvent.change(
    screen.getByRole("searchbox", { name: "Search Hacker-DOCS lessons" }),
    { target: { value: "soft 404" } },
  );
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(
    screen.getByRole("link", { name: /Fuzzing and false positives/ }),
  ).toBeTruthy();
});
test("reader shows explanation, diagram and source; saving failures are recoverable", async () => {
  open("/knowledge-vault/hacker-docs--http");
  expect(
    screen.getByRole("heading", { name: "HTTP requests and responses" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("img", {
      name: /HTTP requests and responses learning flow/,
    }),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { name: "Expected observations" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Hacker-DOCS source notes" })
      .getAttribute("href"),
  ).toContain("/blob/c430f79");
  fireEvent.click(
    screen.getByRole("button", { name: "Copy lesson to my notes" }),
  );
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("Offline"),
  );
  expect(
    screen
      .getByRole("button", { name: "Copy lesson to my notes" })
      .hasAttribute("disabled"),
  ).toBe(false);
});
test("lesson navigation resets the reading position", () => {
  open("/knowledge-vault/hacker-docs--http");
  vi.mocked(window.scrollTo).mockClear();
  fireEvent.click(
    screen.getByRole("link", { name: "Web fingerprinting with uncertainty →" }),
  );
  expect(
    screen.getByRole("heading", {
      name: "Web fingerprinting with uncertainty",
    }),
  ).toBeTruthy();
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

test("unknown lesson has a way back", () => {
  open("/knowledge-vault/hacker-docs--missing");
  expect(screen.getByText("Lesson not found.")).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: /All Hacker-DOCS lessons/ })
      .getAttribute("href"),
  ).toBe("/knowledge-vault/hacker-docs--study-guides");
});

test("editable copies preserve each lesson's prose, examples, flow and sources", () => {
  for (const lesson of hackerLessons) {
    const note = hackerLessonNote(lesson);
    const document = decodeEditor(note.contentJson);
    expect(note.text).toContain(lesson.explanation);
    expect(note.text).toContain(lesson.example);
    expect(note.text).toContain(lesson.flow.join(" → "));
    expect(note.text).toContain(lesson.troubleshooting);
    expect(JSON.stringify(document)).toContain("/blob/c430f79");
    expect(
      document.content?.find((n) => n.type === "codeBlock")?.content?.[0].text,
    ).toBe(lesson.example);
    expect(note.attachmentIds).toEqual([]);
  }
});

test("successful copy uses the OSCP notebook and navigates to the new editable note", async () => {
  vi.mocked(createNote).mockResolvedValueOnce(
    "00000000-0000-4000-8000-000000000001",
  );
  render(
    <MemoryRouter initialEntries={["/knowledge-vault/hacker-docs--http"]}>
      <Routes>
        <Route
          path="/knowledge-vault/:id"
          element={<KnowledgeVault uid="alice" />}
        />
        <Route path="/notes/:id" element={<h1>Editable note destination</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Copy lesson to my notes" }),
  );
  expect(
    await screen.findByRole("heading", { name: "Editable note destination" }),
  ).toBeTruthy();
  expect(createNote).toHaveBeenLastCalledWith(
    "alice",
    null,
    "oscp",
    expect.objectContaining({
      title: "HTTP requests and responses",
      tags: expect.arrayContaining(["knowledge-vault", "hacker-docs"]),
    }),
  );
});
