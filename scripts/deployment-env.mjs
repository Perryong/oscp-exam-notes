/** @param {Record<string,string|undefined>} env */
export function validateDeploymentEnvironment(env) {
  const target = env.VERCEL_ENV || env.VITE_VERCEL_ENV;
  if (!target) return;
  const mode = env.VITE_FIREBASE_MODE,
    project = env.VITE_FIREBASE_PROJECT_ID;
  if (
    target === "preview" &&
    (mode !== "test" ||
      project === "oscp-notes" ||
      project === env.VITE_PRODUCTION_FIREBASE_PROJECT_ID)
  )
    throw Error(
      "Vercel previews require test mode and a separate Firebase project",
    );
  if (target === "production" && mode !== "production")
    throw Error("Production deployment requires production Firebase mode");
  if (mode === "emulator")
    throw Error("Hosted builds cannot connect to local emulators");
  for (const key of [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_APP_ID",
  ])
    if (!env[key]) throw Error("Missing deployment setting: " + key);
}
