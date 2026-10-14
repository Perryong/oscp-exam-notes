import { test, expect } from "vitest";
import { validateDeploymentEnvironment } from "../../scripts/deployment-env.mjs";
test("Vercel previews cannot select production or emulator Firebase", () => {
  expect(() =>
    validateDeploymentEnvironment({
      VERCEL_ENV: "preview",
      VITE_FIREBASE_MODE: "production",
      VITE_FIREBASE_PROJECT_ID: "oscp-notes",
    }),
  ).toThrow();
  expect(() =>
    validateDeploymentEnvironment({
      VERCEL_ENV: "preview",
      VITE_FIREBASE_MODE: "emulator",
      VITE_FIREBASE_PROJECT_ID: "demo-oscp-notebook",
    }),
  ).toThrow();
});
