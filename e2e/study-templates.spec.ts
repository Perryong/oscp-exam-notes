import { test, expect } from "@playwright/test";

test("study templates create independent editable notes and preserve existing work", async ({
  page,
  request,
}) => {
  const email = `templates-${Date.now()}@example.test`,
    password = "testing-password-123";
  await request.post(
    "http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key",
    { data: { email, password, returnSecureToken: true } },
  );
  await page.goto("/settings");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
  await page.goto("/notes");
  await page.getByRole("button", { name: "New note", exact: true }).click();
  await expect(page.getByLabel("Note content")).toBeEmpty();
  await page.getByLabel("Note title").fill("Existing study evidence");
  await page
    .getByLabel("Note content")
    .fill("Keep my original findings unchanged.");
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  const original = page.url();
  for (const [path, button, title, commands, evidence] of [
    [
      "/notes",
      "New OSCP box note",
      "OSCP box study",
      "Commands and results",
      "Evidence",
    ],
    [
      "/osai/notes",
      "New AI-300 lab note",
      "AI-300 lab study",
      "Prompts and commands",
      "Screenshots and evidence",
    ],
  ]) {
    await page.setViewportSize({
      width: path === "/notes" ? 390 : 1440,
      height: 900,
    });
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test
        .info()
        .outputPath(
          path === "/notes"
            ? "oscp-template-action-mobile.png"
            : "ai300-template-action-desktop.png",
        ),
    });
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect(page.getByLabel("Note title")).toHaveValue(title);
    for (const heading of [
      "Objectives and authorized scope",
      commands,
      evidence,
      "Findings",
      "Lessons learned",
    ]) {
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test
        .info()
        .outputPath(
          path === "/notes"
            ? "oscp-template-mobile.png"
            : "ai300-template-desktop.png",
        ),
    });
    await page.getByLabel("Note title").fill(title + " edited");
    await page.locator(".tiptap pre").click();
    await page.keyboard.insertText("whoami\n\t# recorded command only");
    await expect(page.getByText("Synced", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await page.reload();
    await expect(page.getByLabel("Note title")).toHaveValue(title + " edited");
    await expect(page.locator(".tiptap pre")).toContainText(
      "# recorded command only",
    );
    await expect(
      page.getByRole("heading", { name: "Lessons learned", exact: true }),
    ).toBeVisible();
  }
  await page.goto("/osai/notes");
  await expect(
    page.getByRole("link", { name: "OSCP box study edited", exact: true }),
  ).toHaveCount(0);
  await page.goto(original);
  await expect(page.getByLabel("Note title")).toHaveValue(
    "Existing study evidence",
  );
  await expect(page.getByLabel("Note content")).toHaveText(
    "Keep my original findings unchanged.",
  );
  await page.goto("/machines");
  await page.getByLabel("Search machines").fill("Markup");
  await page
    .getByRole("button", { name: "New note for Markup", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Objectives and authorized scope",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Findings", exact: true }),
  ).toBeVisible();
  await page.getByText("Details", { exact: true }).click();
  await expect(
    page.getByLabel("Linked machine").locator("option:checked"),
  ).toHaveText("Markup");
});
