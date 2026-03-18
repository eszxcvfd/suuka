import { expect, test } from '@playwright/test';

test('auth lifecycle shell on web', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('button', { name: 'Verify email' }).click();
  await expect(page.getByRole('heading', { name: 'Verify email' })).toBeVisible();
  await page.getByRole('button', { name: 'Need an account first?' }).click();
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  await page.getByRole('button', { name: 'Have a verification token?' }).click();
  await expect(page.getByRole('heading', { name: 'Verify email' })).toBeVisible();
  await page.getByRole('button', { name: 'Need password help too?' }).click();
  await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();
  await page.getByRole('button', { name: 'Need a new reset link?' }).click();
  await expect(page.getByRole('heading', { name: 'Forgot password' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});
