import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web profile edit integration baseline', () => {
  const authStorePath = path.resolve(__dirname, '../../src/store/auth.store.ts');
  const profilePagePath = path.resolve(__dirname, '../../src/app/pages/ProfilePage.tsx');
  const profileFormPath = path.resolve(__dirname, '../../src/components/profile/ProfileForm.tsx');
  const dashboardShellPath = path.resolve(
    __dirname,
    '../../src/components/layout/DashboardShell.tsx',
  );

  const authStoreText = fs.readFileSync(authStorePath, 'utf8');
  const profilePageText = fs.existsSync(profilePagePath)
    ? fs.readFileSync(profilePagePath, 'utf8')
    : '';
  const profileFormText = fs.existsSync(profileFormPath)
    ? fs.readFileSync(profileFormPath, 'utf8')
    : '';
  const dashboardShellText = fs.readFileSync(dashboardShellPath, 'utf8');

  it('adds load/save profile actions and edit state to the auth store', () => {
    expect(authStoreText).toContain('loadProfile:');
    expect(authStoreText).toContain('saveProfile:');
    expect(authStoreText).toContain('profileError');
    expect(authStoreText).toContain('profileSuccessMessage');
  });

  it('renders a dedicated profile page and form with display name and bio controls', () => {
    expect(profilePageText).toContain('ProfileForm');
    expect(profilePageText).toContain('Profile settings');
    expect(profileFormText).toContain('displayName');
    expect(profileFormText).toContain('bio');
    expect(profileFormText).toContain('Save profile');
  });

  it('refreshes dashboard presentation after profile edits succeed', () => {
    expect(dashboardShellText).toContain('auth.user?.displayName');
  });
});
