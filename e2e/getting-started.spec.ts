import { expect, test } from "@playwright/test";

test("Getting Started guide has all sections, readable code and credited images", async ({
  page,
}) => {
  await page.goto("/getting-started.html");
  await expect(
    page.getByRole("heading", {
      name: "Getting Started study guide",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("h2").filter({ hasText: /^\d{2}\. / })).toHaveCount(
    23,
  );
  await expect(page.locator("pre code")).toHaveCount(20);
  await expect(
    page.getByRole("link", { name: /^HTB source lesson/ }),
  ).toHaveCount(23);
  await expect(page.locator("body")).not.toContainText("13.04%");
  await expect(page.locator("body")).not.toContainText("26.09%");
  await expect(page.locator("figure")).toHaveCount(4);
  for (const image of await page.locator("figure img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page
      .getByRole("link", { name: "04. Connecting Using VPN", exact: true })
      .click();
    await expect(page).toHaveURL(/#section-4$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`getting-started-${width}.png`),
    });
    await page
      .getByRole("link", { name: "Back to contents", exact: true })
      .first()
      .click();
  }
});

test("Today and the HTB calendar open the public guide", async ({ page }) => {
  for (const path of ["/study-plan", "/calendar?week=1"]) {
    await page.goto(path);
    await page
      .getByRole("link", { name: "Getting Started guide", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Getting Started study guide",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("link", { name: "HTB calendar", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "HTB study calendar", exact: true }),
    ).toBeVisible();
  }
});
