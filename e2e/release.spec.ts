import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("deployment serves only the built application", async ({ request }) => {
  const config = JSON.parse(readFileSync("vercel.json", "utf8"));
  expect(config.outputDirectory).toBe("dist");
  for (const path of [
    "/tests/fixtures/legacy-index.html",
    "/scripts/legacy-export.mjs",
    "/setup-firebase.sh",
  ]) {
    const response = await request.get(path),
      body = await response.text();
    expect(body).not.toContain("const PLAN =");
    expect(body).not.toContain("localStorage.key(i)");
    expect(body).not.toContain("#!/usr/bin/env bash");
  }
});
for (const width of [390, 1440])
  test(`study references fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/study-plan");
    await expect(
      page.getByRole("heading", { name: "Study plan", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Walkthrough for Markup", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close walkthrough" }).click();
  });
