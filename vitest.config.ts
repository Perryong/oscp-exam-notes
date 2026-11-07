import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [
    {
      name: "test-pwa-register",
      resolveId: (id) => (id === "virtual:pwa-register" ? id : undefined),
      load: (id) =>
        id === "virtual:pwa-register"
          ? "export const registerSW = () => async () => {};"
          : undefined,
    },
  ],
  test: { include: ["src/**/*.test.{ts,tsx}"], environment: "jsdom" },
});
