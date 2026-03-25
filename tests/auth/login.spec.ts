import { test, expect } from '@playwright/test';
import { getE2eConfig } from '../../e2e-environments.js';

test.describe('login page', () => {
  test('shows login form with stable test ids', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByTestId('pw-login-form')).toBeVisible();
    await expect(page.getByTestId('pw-login-email')).toBeVisible();
    await expect(page.getByTestId('pw-login-password')).toBeVisible();
    await expect(page.getByTestId('pw-login-submit')).toBeVisible();
  });

  test('signs in when test user is configured', async ({ page }) => {
    const { testUser } = getE2eConfig();
    test.skip(
      !testUser.email || !testUser.password,
      'Set E2E_<TARGET>_EMAIL/PASSWORD or E2E_USER_EMAIL/PASSWORD in .env (see .env.example)',
    );

    await page.goto('/login');
    await page.getByTestId('pw-login-email').fill(testUser.email);
    await page.getByTestId('pw-login-password').fill(testUser.password);
    await page.getByTestId('pw-login-submit').click();

    await expect(page).not.toHaveURL(/\/login$/);
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
