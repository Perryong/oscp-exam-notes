import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { validateDeploymentEnvironment } from "./scripts/deployment-env.mjs";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  validateDeploymentEnvironment(env);
  return {
    define: {
      "import.meta.env.VITE_VERCEL_ENV": JSON.stringify(
        env.VERCEL_ENV || env.VITE_VERCEL_ENV || "",
      ),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        injectRegister: false,
        manifest: {
          name: "OSCP Fieldnotes",
          short_name: "Fieldnotes",
          start_url: "/study-plan",
          display: "standalone",
          background_color: "#f5f6f2",
          theme_color: "#183d39",
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
          globIgnores: ["hacker-docs/**"],
          maximumFileSizeToCacheInBytes: 4000000,
          navigateFallback: "/index.html",
          runtimeCaching: [],
        },
      }),
    ],
    build: { outDir: "dist" },
  };
});
