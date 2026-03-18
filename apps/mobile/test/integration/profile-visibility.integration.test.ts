import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mobile profile visibility integration baseline', () => {
  const authServicePath = path.resolve(__dirname, '../../src/services/auth.service.ts');
  const profileScreenPath = path.resolve(__dirname, '../../src/screens/ProfileScreen.tsx');

  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const profileScreenText = fs.existsSync(profileScreenPath)
    ? fs.readFileSync(profileScreenPath, 'utf8')
    : '';

  it('adds mobile service support for owner visibility updates and viewer reads', () => {
    expect(authServiceText).toContain('accountVisibility?:');
    expect(authServiceText).toContain('getProfileByAccountId(');
    expect(authServiceText).toContain('normalizeAuthorizationError');
  });

  it('renders visibility state on the mobile profile screen for owners and viewers', () => {
    expect(profileScreenText).toContain('Profile visibility');
    expect(profileScreenText).toContain('This profile is not available.');
    expect(profileScreenText).toContain('viewerAccountId');
  });
});
