import { test, expect } from "@playwright/test";
test("OSAI library loads attributed lessons and diagrams on mobile", async ({
  page,
}) => {
  await page.goto("/osai/library");
  await page.getByLabel("Search OSAI library").fill("RAG");
  await page
    .getByRole("link", { name: "Retrieval and RAG", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Retrieval and RAG", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Lesson contents" }),
  ).toBeVisible();
  const image = page.locator(".osai-body img");
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Copy worksheet" }).click();
  await expect(page.getByRole("status")).toContainText(/copied|Select/);
  await expect(
    page.getByRole("link", { name: "Kongsec community training vault" }),
  ).toHaveAttribute("href", "https://kongsec.github.io/OSAINotesResearch/");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/osai/library/not-real");
  await expect(page.getByRole("alert")).toContainText("not found");
});
