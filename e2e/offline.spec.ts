import { test, expect } from "@playwright/test";
test("downloaded notebook and edited draft survive an offline reload", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(60000);
  const email = `offline-${Date.now()}@example.test`,
    password = "testing-password-123";
  await request.post(
    "http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key",
    { data: { email, password, returnSecureToken: true } },
  );
  await page.goto("/settings");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
  await page.getByRole("link", { name: "All notes", exact: true }).click();
  await page.getByRole("button", { name: "New note", exact: true }).click();
  await page.getByLabel("Note title").fill("Offline commands");
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  const url = page.url();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Download for offline", exact: true })
    .click();
  await expect(
    page.getByText("Downloaded snapshot verified on this device.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.goto(url);
  await expect(page.getByLabel("Note title")).toHaveValue("Offline commands");
  await context.setOffline(true);
  await page.getByLabel("Note title").fill("Offline commands retained");
  await expect(
    page.getByText("Saved locally", { exact: true }).first(),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((r) => {
          const o = indexedDB.open("oscp-fieldnotes");
          o.onsuccess = () => r(o.result);
        });
        return new Promise<string>((r) => {
          const q = db.transaction("drafts").objectStore("drafts").getAll();
          q.onsuccess = () => {
            r(q.result[0]?.draft.content.title);
            db.close();
          };
        });
      }),
    )
    .toBe("Offline commands retained");
  await page.reload();
  await expect(page.getByLabel("Note title")).toHaveValue(
    "Offline commands retained",
  );
  await context.setOffline(false);
});

test("both workspaces retain independent drafts through offline switching and reload", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(60000);
  const email = `both-offline-${Date.now()}@example.test`,
    password = "testing-password-123";
  await request.post(
    "http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key",
    { data: { email, password, returnSecureToken: true } },
  );
  await page.goto("/settings");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
  await page.goto("/notes");
  await page.getByRole("button", { name: "New note", exact: true }).click();
  await page.getByLabel("Note title").fill("CP offline");
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  const cp = page.url();
  await page.goto("/osai/notes");
  await page.getByRole("button", { name: "New note", exact: true }).click();
  await page.getByLabel("Note title").fill("AI offline");
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  const ai = page.url();
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Download for offline", exact: true })
    .click();
  await expect(
    page.getByText("Downloaded snapshot verified on this device.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.goto(ai);
  await expect(page.getByLabel("Note title")).toHaveValue("AI offline");
  await context.setOffline(true);
  await page.getByLabel("Note title").fill("AI retained offline");
  await page.getByLabel("Study workspace").selectOption("oscp");
  await expect(page).toHaveURL(/\/study-plan$/);
  await page.goto(cp);
  await expect(page.getByLabel("Note title")).toHaveValue("CP offline");
  await page.getByLabel("Note title").fill("CP retained offline");
  await page.getByLabel("Study workspace").selectOption("osai");
  await page.goto(ai);
  await page.reload();
  await expect(page.getByLabel("Note title")).toHaveValue(
    "AI retained offline",
  );
  await page.goto(cp);
  await expect(page.getByLabel("Note title")).toHaveValue(
    "CP retained offline",
  );
  await context.setOffline(false);
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 20000,
  });
  await page.goto(ai);
  await expect(page.getByText("Synced", { exact: true })).toBeVisible({
    timeout: 20000,
  });
});
