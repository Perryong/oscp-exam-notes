import { beforeEach, afterEach, test, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HackerOriginals from "./HackerOriginals";
const catalog = {
  archiveSha256: "abc123",
  imageCount: 2,
  notes: [
    {
      id: "dns",
      path: "content/Network/DNS.md",
      title: "DNS / Commands",
      category: "Network",
      group: "Footprinting",
      searchText: "resolver authoritative",
      imageCount: 1,
    },
    {
      id: "http",
      path: "content/Web/HTTP.md",
      title: "HTTP / Theory",
      category: "Web",
      group: "Requests",
      searchText: "status headers",
      imageCount: 1,
    },
  ],
};
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => ({
      ok: true,
      json: async () =>
        String(url).endsWith("catalog.json")
          ? catalog
          : {
              html: '<h2 id="commands">Commands</h2><pre><code>example code</code></pre><img src="/hacker-docs/images/test.png" alt="Screenshot">',
              toc: [{ id: "commands", title: "Commands", level: 2 }],
            },
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
test("source collection searches full text and combines topic filters", async () => {
  render(
    <MemoryRouter>
      <HackerOriginals id="hacker-docs" />
    </MemoryRouter>,
  );
  expect(
    await screen.findByRole("link", { name: "DNS / Commands" }),
  ).toBeTruthy();
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "authoritative" },
  });
  expect(screen.getAllByRole("article")).toHaveLength(1);
  fireEvent.change(screen.getByRole("combobox", { name: "Topic" }), {
    target: { value: "Requests" },
  });
  expect(screen.getByText("No notes match these filters.")).toBeTruthy();
});
test("reader displays full content and original Markdown download", async () => {
  render(
    <MemoryRouter>
      <HackerOriginals id="hacker-docs--source-dns" />
    </MemoryRouter>,
  );
  expect(await screen.findByText("example code")).toBeTruthy();
  expect(
    screen.getByRole("img", { name: "Screenshot" }).getAttribute("src"),
  ).toBe("/hacker-docs/images/test.png");
  expect(
    screen
      .getByRole("link", { name: "Download original Markdown" })
      .getAttribute("href"),
  ).toBe("/hacker-docs/dns.md");
});
test("fetch failures offer retry instead of a blank library", async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
  render(
    <MemoryRouter>
      <HackerOriginals id="hacker-docs" />
    </MemoryRouter>,
  );
  expect(await screen.findByRole("alert")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(
    await screen.findByRole("link", { name: "DNS / Commands" }),
  ).toBeTruthy();
});
