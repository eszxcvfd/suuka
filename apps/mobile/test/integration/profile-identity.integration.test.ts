import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mobile profile identity integration baseline', () => {
  const authServicePath = path.resolve(__dirname, '../../src/services/auth.service.ts');
  const profileScreenPath = path.resolve(__dirname, '../../src/screens/ProfileScreen.tsx');
  const externalLinksEditorPath = path.resolve(
    __dirname,
    '../../src/components/profile/ExternalLinksEditor.tsx',
  );

  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const profileScreenText = fs.existsSync(profileScreenPath)
    ? fs.readFileSync(profileScreenPath, 'utf8')
    : '';
  const externalLinksEditorText = fs.existsSync(externalLinksEditorPath)
    ? fs.readFileSync(externalLinksEditorPath, 'utf8')
    : '';

  it('adds profile identity methods to the mobile auth service', () => {
    expect(authServiceText).toContain('async updateAvatar(');
    expect(authServiceText).toContain('username');
    expect(authServiceText).toContain('externalLinks');
  });

  it('renders username, avatar, and external-link editing on the mobile profile screen', () => {
    expect(profileScreenText).toContain('username');
    expect(profileScreenText).toContain('Avatar');
    expect(profileScreenText).toContain('ExternalLinksEditor');
    expect(externalLinksEditorText).toContain('Add link');
    expect(externalLinksEditorText).toContain('https://');
  });
});
