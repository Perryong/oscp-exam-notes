import { test, expect } from "@playwright/test";
test("OSAI progress and lesson notes survive reload without mixing OSCP", async ({
  page,
  request,
}) => {
  const email = `osai-${Date.now()}@example.test`,
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
  await page.goto("/osai/study-plan");
  await page
    .getByLabel("Progress for Overview & Adversary Mindset")
    .selectOption("completed");
  await expect(page.getByText("1 / 23 completed")).toBeVisible();
  await page
    .getByLabel("Read: Overview & Adversary Mindset", { exact: true })
    .click();
  await expect(
    page.getByLabel("Read: Overview & Adversary Mindset", { exact: true }),
  ).toBeChecked();
  await page.reload();
  await expect(
    page.getByLabel("Progress for Overview & Adversary Mindset"),
  ).toHaveValue("completed");
  await expect(
    page.getByLabel("Read: Overview & Adversary Mindset", { exact: true }),
  ).toBeChecked();
  await page.getByRole("link", { name: "Exam Prep", exact: true }).click();
  await expect(page).toHaveURL(/osai-vault#vault-m22$/);
  await expect(page.locator("#vault-m22")).toBeInViewport();
  await page.goto("/osai/library/foundations");
  await page.getByRole("button", { name: "Create lab note" }).click();
  await expect(page.getByLabel("Note title")).toHaveValue(
    "Lab: AI foundations",
  );
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await page.reload();
  await expect(page.getByLabel("Note title")).toHaveValue(
    "Lab: AI foundations",
  );
  await expect(
    page.getByRole("heading", { name: "Environment and model version" }),
  ).toBeVisible();
  await page.goto("/notes");
  await expect(
    page.getByRole("link", { name: "Lab: AI foundations", exact: true }),
  ).toHaveCount(0);
  await page.goto("/osai/library/retrieval");
  await page.getByRole("button", { name: "Bookmark lesson" }).click();
  await expect(page.getByLabel("Note title")).toHaveValue(
    "Bookmark: Retrieval and RAG",
  );
  await page.getByRole("link", { name: "← All notes" }).click();
  await page.getByLabel("Search notes").fill("bookmark");
  await expect(
    page.getByRole("link", { name: "Bookmark: Retrieval and RAG" }),
  ).toBeVisible();
});
