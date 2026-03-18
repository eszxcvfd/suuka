import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mobile profile edit integration baseline', () => {
  const authServicePath = path.resolve(__dirname, '../../src/services/auth.service.ts');
  const profileScreenPath = path.resolve(__dirname, '../../src/screens/ProfileScreen.tsx');
  const profileFormPath = path.resolve(__dirname, '../../src/components/profile/ProfileForm.tsx');

  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const profileScreenText = fs.existsSync(profileScreenPath)
    ? fs.readFileSync(profileScreenPath, 'utf8')
    : '';
  const profileFormText = fs.existsSync(profileFormPath)
    ? fs.readFileSync(profileFormPath, 'utf8')
    : '';

  it('adds owner profile read and update methods to the mobile auth service', () => {
    expect(authServiceText).toContain('async getProfile(');
    expect(authServiceText).toContain('async updateProfile(');
  });

  it('renders a dedicated profile screen and form with display name and bio controls', () => {
    expect(profileScreenText).toContain('Profile settings');
    expect(profileScreenText).toContain('ProfileForm');
    expect(profileFormText).toContain('displayName');
    expect(profileFormText).toContain('bio');
    expect(profileFormText).toContain('Save profile');
  });
});
