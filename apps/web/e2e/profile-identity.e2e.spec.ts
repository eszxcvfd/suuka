import { expect, test } from '@playwright/test';

test('profile identity shell on web', async ({ page }) => {
  const profile: {
    accountId: string;
    accountVisibility: 'public' | 'private';
    avatarMediaId: string | null;
    avatarUrl: string | null;
    bio: string;
    displayName: string;
    externalLinks: Array<{ id: string; label: string; url: string }>;
    username: string;
  } = {
    accountId: 'user-1',
    accountVisibility: 'public',
    avatarMediaId: null,
    avatarUrl: null,
    bio: 'Initial bio',
    displayName: 'Initial User',
    externalLinks: [{ id: 'link-1', label: 'Initial link', url: 'https://initial.example.com' }],
    username: 'initial_user',
  };

  await page.route('**/v1/auth/sign-in', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'user-1',
            email: 'user@example.com',
            displayName: 'Initial User',
            status: 'active',
          },
        },
      }),
    });
  });

  await page.route('**/v1/media', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }

    await route.fulfill({ status: 500, body: 'unexpected media request' });
  });

  await page.route('**/v1/profiles/me', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: profile }),
      });
      return;
    }

    const payload = route.request().postDataJSON() as {
      bio?: string;
      displayName?: string;
      externalLinks?: Array<{ id: string; label: string; url: string }>;
      username?: string;
    };

    if (payload.username === 'taken_name') {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Username is already reserved by another profile',
            status: 409,
          },
        }),
      });
      return;
    }

    profile.bio = payload.bio ?? profile.bio;
    profile.displayName = payload.displayName ?? profile.displayName;
    profile.externalLinks = payload.externalLinks ?? profile.externalLinks;
    profile.username = payload.username ?? profile.username;

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: profile }),
    });
  });

  await page.route('**/v1/profiles/me/avatar', async (route) => {
    const payload = route.request().postDataJSON() as { mediaId: string | null };
    profile.avatarMediaId = payload.mediaId;
    profile.avatarUrl = payload.mediaId ? `https://cdn.example.com/${payload.mediaId}.png` : null;

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: profile }),
    });
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.getByLabel('Email address').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Media' })).toBeVisible();
  await page.getByRole('button', { name: 'Profile' }).click();

  await expect(page.getByRole('heading', { name: 'Profile settings' })).toBeVisible();
  const usernameInput = page.locator('input[name="username"]');
  const avatarInput = page.locator('input[name="avatarMediaId"]');

  await expect(usernameInput).toHaveValue('initial_user');
  await usernameInput.fill('taken_name');
  const usernameTakenResponse = page.waitForResponse(
    (response) => response.url().includes('/v1/profiles/me') && response.status() === 409,
  );
  await page.getByRole('button', { name: 'Save profile' }).click();
  const failedResponse = await usernameTakenResponse;
  expect(failedResponse.status()).toBe(409);

  await usernameInput.fill('fresh_name');
  await avatarInput.fill('avatar-1');
  await page.getByLabel('Link label 1').fill('Portfolio');
  await page.getByLabel('Link url 1').fill('https://example.com');
  await page.getByRole('button', { name: 'Save profile' }).click();

  await expect(page.getByText('Avatar saved successfully.')).toBeVisible();
  await expect(usernameInput).toHaveValue('fresh_name');
  await expect(avatarInput).toHaveValue('avatar-1');
});
