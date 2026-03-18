import { expect, test } from '@playwright/test';

test('media visibility shell shows safe state copy', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});
