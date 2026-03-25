import { defineConfig, devices } from '@playwright/test';
import { getE2eConfig } from './e2e-environments.js';

const e2e = getE2eConfig();

/**
 * Portal must be running separately (local) or reachable at the env base URL.
 * Switch target: `npm run test:local` | `test:dev` | `test:qa` (or E2E_TARGET + optional overrides).
 * @see README.md
 */
export default defineConfig({
  testDir: './tests',
  /** Max duration for a single test (includes waits for assertions and actions). */
  timeout: 120_000,
  /** How long `expect(locator).toBeVisible()` and other matchers retry. */
  expect: {
    timeout: 20_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]],
  use: {
    baseURL: e2e.baseURL,
    /** Max time for click/fill/hover and similar actions (0 = only test timeout). */
    actionTimeout: 20_000,
    /** Max time for `page.goto` and navigations triggered by actions. */
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
