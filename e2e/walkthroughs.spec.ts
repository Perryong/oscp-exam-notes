import { test, expect } from "@playwright/test";
test("library search opens formatted steps, code, images and original sources", async ({
  page,
}) => {
  await page.goto("/walkthroughs");
  await page.getByLabel("Search walkthroughs").fill("Bashed");
  await page.getByRole("link", { name: "Bashed", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bashed", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Walkthrough contents" }),
  ).toBeVisible();
  await expect(page.locator(".walkthrough-body pre").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View original on GitHub" }),
  ).toHaveAttribute("href", /dd03eff/);
  const image = page.locator(".walkthrough-body img").first();
  await expect(image).toHaveAttribute("src", /raw.githubusercontent.com/);
  await page.locator(".image-expand").first().click();
  await expect(page.getByRole("dialog", { name: "Screenshot" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Screenshot" }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Copy command", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText(/Copied|Select/);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("matching study machine links to its written guide and missing articles recover", async ({
  page,
}) => {
  await page.goto("/study-plan");
  await page
    .getByRole("button", { name: "Walkthrough for Bashed", exact: true })
    .click();
  await page.getByRole("link", { name: "Read written walkthrough" }).click();
  await expect(page).toHaveURL(/walkthroughs\/hackthebox--bashed/);
  await page.goto("/walkthroughs/not-an-article");
  await expect(page.getByText("Walkthrough not found")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Back to walkthroughs" }),
  ).toBeVisible();
});
