import { expect, test } from '@playwright/test';

test('profile visibility behavior on web', async ({ page }) => {
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
    bio: 'Visibility bio',
    displayName: 'Visible User',
    externalLinks: [],
    username: 'visible_user',
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
            displayName: 'Visible User',
            status: 'active',
          },
        },
      }),
    });
  });

  await page.route('**/v1/media', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
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
      accountVisibility?: 'public' | 'private';
      bio?: string;
      displayName?: string;
      externalLinks?: Array<{ id: string; label: string; url: string }>;
      username?: string;
    };

    profile.accountVisibility = payload.accountVisibility ?? profile.accountVisibility;
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
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: profile }),
    });
  });

  await page.route('**/v1/profiles/user-1', async (route) => {
    if (profile.accountVisibility === 'private') {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Profile not found',
            status: 404,
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: profile }),
    });
  });

  await page.goto('/');

  await page.getByLabel('Email address').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Media' })).toBeVisible();
  await page.getByRole('button', { name: 'Profile' }).click();
  await expect(page.getByRole('heading', { name: 'Profile settings' })).toBeVisible();

  await page.getByLabel('Profile visibility').selectOption('private');
  await page.getByRole('button', { name: 'Save profile' }).click();

  const hiddenProfileResult = await page.evaluate(async () => {
    const response = await fetch('/v1/profiles/user-1', {
      headers: {
        Authorization: 'Bearer access-token',
      },
    });

    return {
      body: await response.text(),
      status: response.status,
    };
  });

  expect(hiddenProfileResult.status).toBe(404);
  expect(hiddenProfileResult.body).not.toContain('Visible User');

  await page.getByLabel('Profile visibility').selectOption('public');
  await page.getByRole('button', { name: 'Save profile' }).click();

  const publicProfileResult = await page.evaluate(async () => {
    const response = await fetch('/v1/profiles/user-1', {
      headers: {
        Authorization: 'Bearer access-token',
      },
    });

    return {
      body: await response.json(),
      status: response.status,
    };
  });

  expect(publicProfileResult.status).toBe(200);
  expect(publicProfileResult.body.data.displayName).toBe('Visible User');
  expect(publicProfileResult.body.data.accountVisibility).toBe('public');
});
