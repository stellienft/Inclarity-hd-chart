import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3123);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * The e2e suite runs against a production build with the offline location
 * provider, so it never depends on a third-party geocoder being reachable.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : [["list"]],
  /**
   * CHROMIUM_PATH lets a sandbox or CI image point at a browser it already has
   * installed, instead of Playwright downloading its own. Unset in normal use.
   */
  use: {
    baseURL,
    trace: "on-first-retry",
    ...(process.env.CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { LOCATION_PROVIDER: "static" },
  },
});
