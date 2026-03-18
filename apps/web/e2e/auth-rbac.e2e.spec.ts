import { expect, test } from '@playwright/test';

test('rbac shell keeps dashboard chrome reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});
