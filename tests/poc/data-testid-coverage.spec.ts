import { test, expect } from '@playwright/test';
import { getE2eConfig } from '../../e2e-environments.js';
import {
  DASHBOARD_PW_TESTIDS_BUSINESS,
  DASHBOARD_PW_TESTIDS_LAYOUT,
  DASHBOARD_PW_TESTIDS_SITE_USAGE,
  DASHBOARD_PW_TESTIDS_SYSADMIN_NAV,
  LOGIN_PW_TESTIDS_CORE,
} from '../helpers/pw-testids.js';

async function expectAllVisible(
  page: import('@playwright/test').Page,
  ids: readonly string[],
): Promise<void> {
  for (const id of ids) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
}

test.describe('POC: data-testid coverage + page load', () => {
  test('login page responds OK and exposes core pw- hooks', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `expected 2xx from /login, got ${response?.status()}`).toBeTruthy();

    await expect(page.locator('body')).toBeVisible();
    await expectAllVisible(page, LOGIN_PW_TESTIDS_CORE);
  });

  test('dashboard responds OK and exposes pw- hooks when credentials are set', async ({ page }) => {
    const { testUser } = getE2eConfig();
    test.skip(
      !testUser.email || !testUser.password,
      'Set E2E_*_EMAIL/PASSWORD or E2E_USER_* in .env (see .env.example)',
    );

    const loginResp = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(loginResp?.ok(), `expected 2xx from /login, got ${loginResp?.status()}`).toBeTruthy();

    await page.getByTestId('pw-login-email').fill(testUser.email);
    await page.getByTestId('pw-login-password').fill(testUser.password);
    await page.getByTestId('pw-login-submit').click();

    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForLoadState('load');

    const dashResp = page.url();
    expect(dashResp).toMatch(/\/dashboard/);

    await expect(page.locator('body')).toBeVisible();
    await expectAllVisible(page, DASHBOARD_PW_TESTIDS_LAYOUT);
    await expectAllVisible(page, DASHBOARD_PW_TESTIDS_BUSINESS);
    await expectAllVisible(page, DASHBOARD_PW_TESTIDS_SITE_USAGE);

    // Seeded sysadmin: Admin nav entry exists.
    await expectAllVisible(page, DASHBOARD_PW_TESTIDS_SYSADMIN_NAV);

    // Badge script status: exactly one branch is shown.
    const installed = page.getByTestId('pw-dashboard-badge-script-installed');
    const missing = page.getByTestId('pw-dashboard-badge-script-missing');
    await expect(installed.or(missing)).toBeVisible();
    await expect(page.getByTestId('pw-dashboard-badge-script-status-text')).toBeVisible();

    // Either platform picker (no script hits yet) or badge selection (script usage recorded).
    const platformPicker = page.getByTestId('pw-dashboard-platform-picker');
    const badgeSelection = page.getByTestId('pw-dashboard-badge-selection');
    await expect(platformPicker.or(badgeSelection)).toBeVisible();

    // Pause / resume / upgrade: at least one action button set exists (copy varies by subscription).
    const pause = page.getByTestId('pw-dashboard-pause-badges');
    const resume = page.getByTestId('pw-dashboard-resume-badges');
    const upgrade = page.getByTestId('pw-dashboard-upgrade-plan');
    await expect(pause.or(resume).or(upgrade)).toBeVisible();
  });
});
