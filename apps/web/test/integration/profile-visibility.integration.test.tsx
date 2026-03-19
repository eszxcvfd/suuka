import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web profile visibility integration baseline', () => {
  const authApiPath = path.resolve(__dirname, '../../src/services/auth-api.ts');
  const authStorePath = path.resolve(__dirname, '../../src/store/auth.store.ts');
  const profilePagePath = path.resolve(__dirname, '../../src/app/pages/ProfilePage.tsx');

  const authApiText = fs.readFileSync(authApiPath, 'utf8');
  const authStoreText = fs.readFileSync(authStorePath, 'utf8');
  const profilePageText = fs.existsSync(profilePagePath)
    ? fs.readFileSync(profilePagePath, 'utf8')
    : '';

  it('adds web client support for owner visibility updates and viewer profile reads', () => {
    expect(authApiText).toContain('accountVisibility?:');
    expect(authApiText).toContain('getProfileByAccountId(');
    expect(authStoreText).toContain('loadProfileByAccountId:');
  });

  it('renders visibility controls for owners and a non-revealing hidden-profile state for viewers', () => {
    expect(profilePageText).toContain('Public profile');
    expect(profilePageText).toContain('This creator card is not available.');
    expect(profilePageText).toContain('viewerAccountId');
  });
});
