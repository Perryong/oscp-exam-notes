import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import KnowledgeVault from "./KnowledgeVault";
import { emptyNote } from "./model";
vi.mock("./NotebookContext", () => ({
  useNotebook: () => ({
    notes: [
      {
        id: "web",
        content: {
          ...emptyNote(),
          title: "02 · Web",
          tags: ["discord-resources"],
          contentJson: JSON.stringify({
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Source reading",
                    marks: [
                      { type: "link", attrs: { href: "https://example.com" } },
                    ],
                  },
                ],
              },
              {
                type: "screenshot",
                attrs: { imageId: "pic", alt: "Reference image" },
              },
            ],
          }),
        },
      },
    ],
    machines: [],
  }),
}));
vi.mock("../firebase/images", () => ({
  loadImage: async () => ({ id: "pic", data: "data:image/png;base64,AA==" }),
}));
afterEach(cleanup);
test("reader displays saved content and image without editable controls", async () => {
  render(
    <MemoryRouter initialEntries={["/knowledge-vault/web"]}>
      <Routes>
        <Route
          path="/knowledge-vault/:id"
          element={<KnowledgeVault uid="alice" />}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    (await screen.findByRole("img", { name: "Reference image" })).getAttribute(
      "src",
    ),
  ).toContain("data:image/png");
  expect(
    screen.getByRole("link", { name: "Edit note" }).getAttribute("href"),
  ).toBe("/notes/web");
  expect(
    screen.getByRole("link", { name: "Source reading" }).getAttribute("href"),
  ).toBe("https://example.com");
  expect(document.querySelector('[contenteditable="true"]')).toBeNull();
});
