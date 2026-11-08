import { expect, test } from "@playwright/test";

test("Nmap guide covers all lessons with code, images and source links", async ({
  page,
}) => {
  await page.goto("/nmap-study-guide.html");
  await expect(
    page.getByRole("heading", {
      name: "Network Enumeration with Nmap study guide",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("h2").filter({ hasText: /^\d{2}\. / })).toHaveCount(
    12,
  );
  await expect(page.locator("pre code")).toHaveCount(21);
  await expect(
    page.getByRole("link", { name: /^HTB source lesson/ }),
  ).toHaveCount(12);
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
  for (let i = 0; i < 4; i++) {
    await page
      .locator("figure")
      .nth(i)
      .screenshot({ path: test.info().outputPath(`nmap-figure-${i + 1}.png`) });
  }
  await expect(page.locator("body")).toContainText(
    "does not prove that a host is online",
  );
  await expect(page.locator("body")).toContainText(
    "not proof of an open UDP service",
  );
  await expect(page.locator("body")).toContainText(
    "does not identify open ports",
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page
      .getByRole("link", { name: "04. Host and Port Scanning", exact: true })
      .click();
    await expect(page).toHaveURL(/#section-4$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`nmap-guide-${width}.png`),
    });
    await page
      .getByRole("link", { name: "Back to contents", exact: true })
      .first()
      .click();
  }
});

test("Today and the HTB calendar link to the Nmap guide", async ({ page }) => {
  for (const path of ["/study-plan", "/calendar?week=2"]) {
    await page.goto(path);
    await page
      .getByRole("link", { name: "Nmap study guide", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Network Enumeration with Nmap study guide",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("link", { name: "HTB calendar", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "HTB study calendar", exact: true }),
    ).toBeVisible();
  }
});
