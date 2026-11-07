import { test, expect } from "@playwright/test";
test("workspace notes, seeds, links and trash remain separated", async ({
  page,
  request,
}) => {
  const email = `workspace-${Date.now()}@example.test`,
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
  await page.getByLabel("Note title").fill("OSCP preserved");
  await page.getByLabel("Study workspace").selectOption("osai");
  await expect(page).toHaveURL(/\/osai\/study-plan/);
  await page.goto("/osai/notes");
  await expect(
    page.getByRole("link", { name: "OSCP preserved", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "New note", exact: true }).click();
  await page.getByLabel("Note title").fill("OSAI experiment");
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  const url = page.url(),
    id = url.split("/").pop();
  await page.goto("/notes/" + id);
  await expect(page).toHaveURL(url);
  await expect(page.getByLabel("Note title")).toHaveValue("OSAI experiment");
  await page.getByRole("button", { name: "Move to trash" }).click();
  await expect(page).toHaveURL(/\/osai\/notes$/);
  await page.goto("/osai/trash");
  await expect(
    page.getByRole("button", { name: "Restore OSAI experiment" }),
  ).toBeVisible();
  await page.goto("/trash");
  await expect(page.getByText("OSAI experiment", { exact: true })).toHaveCount(
    0,
  );
  await page.goto("/notes");
  await expect(
    page.getByRole("link", { name: "OSCP preserved", exact: true }),
  ).toBeVisible();
  await page.goto("/osai/labs");
  await expect(
    page.getByRole("heading", { name: "AI foundations", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Markup", exact: true }),
  ).toHaveCount(0);
});
