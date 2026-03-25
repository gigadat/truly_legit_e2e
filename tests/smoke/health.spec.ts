import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('health-check responds', async ({ request }) => {
    const res = await request.get('/health-check');
    expect(res.ok()).toBeTruthy();
  });
});
