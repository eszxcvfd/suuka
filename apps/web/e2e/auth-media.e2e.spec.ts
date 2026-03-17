import { test, expect } from '@playwright/test';

test('auth and media flow shell', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/.+/);
});
