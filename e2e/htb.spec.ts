import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/settings");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
}

test("HTB schedule, month calendar and legacy links work on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/htb-study-schedule.html");
  await expect(
    page.getByRole("heading", { name: "HTB study schedule", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^HTB week \d+$/ })).toHaveCount(
    51,
  );
  await page.getByRole("link", { name: "HTB week 51", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "HTB week 51 · 10 hours" }),
  ).toBeVisible();
  await page.goto("/index.html?htb-week=3");
  await expect(page).toHaveURL(/\/calendar\?week=3$/);
  const completion = page.getByRole("checkbox", {
    name: "Module complete: Footprinting",
  });
  await completion.first().check();
  await page.reload();
  await expect(completion.first()).toBeChecked();
  await page.getByLabel("Study week").selectOption("4");
  await expect(completion.first()).toBeChecked();
  await page.getByRole("button", { name: "Month", exact: true }).click();
  await expect(page.getByLabel("Study month").getByRole("button")).toHaveCount(
    42,
  );
  await page.screenshot({
    path: test.info().outputPath("htb-calendar-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: test.info().outputPath("htb-calendar-mobile.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/htb-study");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("link", { name: "Learning Process & testing guide" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Learning Process", exact: true }),
  ).toBeVisible();
  await page.locator("img").evaluateAll((images) =>
    images.forEach((image) => {
      (image as HTMLImageElement).loading = "eager";
    }),
  );
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
});

test("HTB notes are reused and module completion syncs to a new browser session", async ({
  page,
  request,
  browser,
}) => {
  const email = `htb-${Date.now()}@example.test`,
    password = "testing-password-123";
  await request.post(
    "http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key",
    { data: { email, password, returnSecureToken: true } },
  );
  await login(page, email, password);
  await page.goto("/calendar?week=3");
  await page
    .getByRole("checkbox", { name: "Module complete: Footprinting" })
    .first()
    .click();
  await expect(
    page
      .getByRole("checkbox", { name: "Module complete: Footprinting" })
      .first(),
  ).toBeChecked();
  await page.getByRole("button", { name: "Open HTB week 3 notes" }).click();
  await expect(page.getByLabel("Note title")).toHaveValue("HTB week 3 notes");
  for (const heading of [
    "Goals",
    "Attempts",
    "What I learned",
    "Where I got stuck",
    "Progress",
    "Assessment stages — Penetration Testing Process (module 90)",
  ])
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  await page.getByLabel("Note title").fill("HTB week 3 — my evidence");
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  const noteUrl = page.url();
  await page.goto("/calendar?week=3");
  await page.getByRole("button", { name: "Open HTB week 3 notes" }).click();
  await expect(page).toHaveURL(noteUrl);
  await expect(page.getByLabel("Note title")).toHaveValue(
    "HTB week 3 — my evidence",
  );
  await page.goto("/machines");
  await page.getByLabel("Search machines").fill("Footprinting");
  await expect(
    page.getByRole("heading", { name: "Footprinting", exact: true }),
  ).toHaveCount(0);
  const context = await browser.newContext();
  try {
    const other = await context.newPage();
    await login(other, email, password);
    await other.goto("/calendar?week=4");
    await expect(
      other
        .getByRole("checkbox", { name: "Module complete: Footprinting" })
        .first(),
    ).toBeChecked({ timeout: 15000 });
    await other.goto("/calendar?week=3");
    await other.getByRole("button", { name: "Open HTB week 3 notes" }).click();
    await expect(other).toHaveURL(noteUrl);
    await expect(other.getByLabel("Note title")).toHaveValue(
      "HTB week 3 — my evidence",
    );
    await other.goto("/notes");
    await expect(
      other.getByRole("link", {
        name: "HTB week 3 — my evidence",
        exact: true,
      }),
    ).toHaveCount(1);
    await other.goto("/osai/notes");
    await expect(
      other.getByRole("link", {
        name: "HTB week 3 — my evidence",
        exact: true,
      }),
    ).toHaveCount(0);
  } finally {
    await context.close();
  }
});
