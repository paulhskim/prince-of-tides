import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * Booking e2e. Uses an already running server on PW_BASE_URL (default http://localhost:3100) or starts
 * one with a production build. Browsers come from PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers here).
 * Run: npx playwright test
 */
process.env.PLAYWRIGHT_BROWSERS_PATH ??= "/opt/pw-browsers";

/**
 * Use the Chromium already in /opt/pw-browsers even when its build number differs from what this
 * @playwright/test version expects (never run `playwright install` here). Override with PW_CHROMIUM.
 */
function chromiumPath(): string | undefined {
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH!;
  try {
    const dir = readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
    const exe = dir && path.join(root, dir, "chrome-linux", "chrome");
    return exe && existsSync(exe) ? exe : undefined;
  } catch {
    return undefined;
  }
}

const baseURL = process.env.PW_BASE_URL ?? "http://localhost:3100";
const port = new URL(baseURL).port || "3100";

export default defineConfig({
  testDir: "tests/booking",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath: chromiumPath() },
  },
  webServer: {
    command: `npm run build && npx next start -p ${port}`,
    url: `${baseURL}/api/availability`,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
