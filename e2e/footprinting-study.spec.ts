import { expect, test } from "@playwright/test";

test("Footprinting guide covers all lessons, service examples and credited images", async ({
  page,
}) => {
  await page.goto("/footprinting-study-guide.html");
  await expect(
    page.getByRole("heading", {
      name: "Footprinting study guide",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("h2").filter({ hasText: /^\d{2}\. / })).toHaveCount(
    21,
  );
  await expect(
    page.getByRole("link", { name: /^HTB source lesson/ }),
  ).toHaveCount(21);
  await expect(page.locator("pre code")).toHaveCount(34);
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
  for (let i = 0; i < 4; i++)
    await page
      .locator("figure")
      .nth(i)
      .screenshot({
        path: test.info().outputPath(`footprinting-figure-${i + 1}.png`),
      });
  await expect(page.locator("body")).toContainText("FTPS is not SFTP");
  await expect(page.locator("body")).toContainText(
    "NFSv4 does not automatically require Kerberos",
  );
  await expect(page.locator("body")).toContainText(
    "SID and service name are not interchangeable",
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("link", { name: "07. SMB", exact: true }).click();
    await expect(page).toHaveURL(/#section-7$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`footprinting-guide-${width}.png`),
    });
    await page
      .getByRole("link", { name: "Back to contents", exact: true })
      .first()
      .click();
  }
});

test("Today and HTB calendar open the Footprinting guide", async ({ page }) => {
  for (const path of ["/study-plan", "/calendar?week=3"]) {
    await page.goto(path);
    await page
      .getByRole("link", { name: "Footprinting guide", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Footprinting study guide",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("link", { name: "HTB calendar", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "HTB study calendar", exact: true }),
    ).toBeVisible();
  }
});
