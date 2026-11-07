import { test, expect } from "@playwright/test";

test("mobile editor and primary navigation are visible without scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");
  await expect(page.locator(".tiptap")).toBeVisible();
  const body = await page.locator(".tiptap").boundingBox();
  expect(body!.y).toBeLessThan(620);
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const name of ["Today", "Practice", "Notes", "Library"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeInViewport();
  }
  await expect(page.getByRole("status")).toBeInViewport();
  await expect(page.getByLabel("Tags", { exact: true })).not.toBeVisible();
  await page.getByText("Details", { exact: true }).click();
  await page.getByLabel("Tags", { exact: true }).fill("enumeration, linux");
  await page.getByLabel("Study week").fill("12");
  await page.getByLabel("Note title").fill("Mobile study note");
  await expect(page.getByRole("status")).toHaveText("Saved locally");
  await page.reload();
  await page.getByText("Details", { exact: true }).click();
  await expect(page.getByLabel("Tags", { exact: true })).toHaveValue(
    "enumeration, linux",
  );
  await expect(page.getByLabel("Study week")).toHaveValue("12");
  await expect(page.getByLabel("Note title")).toHaveValue("Mobile study note");
});

test("secondary destinations remain accessible in both workspaces", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");
  await page.getByText("More", { exact: true }).click();
  await page.getByRole("link", { name: "Mindmap", exact: true }).click();
  await expect(page).toHaveURL(/\/mindmap$/);
  await page.getByLabel("Study workspace").selectOption("osai");
  await expect(page).toHaveURL(/\/osai\/study-plan$/);
  const nav = page.getByRole("navigation", { name: "Primary" });
  await nav.getByRole("link", { name: "Library", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "OSAI Vault", exact: true }),
  ).toBeVisible();
});

test("mobile More menu is not clipped by the lazy-loaded OSCP styles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/study-plan");
  await expect(
    page.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();
  await page.getByText("More", { exact: true }).click();
  const mindmap = page
    .getByRole("navigation", { name: "More destinations" })
    .getByRole("link", { name: "Mindmap", exact: true });
  expect(
    await mindmap.evaluate((link) => {
      const bounds = link.getBoundingClientRect();
      return link.contains(
        document.elementFromPoint(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        ),
      );
    }),
  ).toBe(true);
});
