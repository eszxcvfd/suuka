import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web profile identity integration baseline', () => {
  const authApiPath = path.resolve(__dirname, '../../src/services/auth-api.ts');
  const authStorePath = path.resolve(__dirname, '../../src/store/auth.store.ts');
  const profileFormPath = path.resolve(__dirname, '../../src/components/profile/ProfileForm.tsx');
  const externalLinksEditorPath = path.resolve(
    __dirname,
    '../../src/components/profile/ExternalLinksEditor.tsx',
  );

  const authApiText = fs.readFileSync(authApiPath, 'utf8');
  const authStoreText = fs.readFileSync(authStorePath, 'utf8');
  const profileFormText = fs.existsSync(profileFormPath)
    ? fs.readFileSync(profileFormPath, 'utf8')
    : '';
  const externalLinksEditorText = fs.existsSync(externalLinksEditorPath)
    ? fs.readFileSync(externalLinksEditorPath, 'utf8')
    : '';

  it('adds profile identity client methods and username collision handling', () => {
    expect(authApiText).toContain('updateAvatar(');
    expect(authStoreText).toContain('updateAvatar:');
    expect(authStoreText).toContain("error.code === 'USERNAME_TAKEN'");
    expect(authStoreText).toContain('externalLinks');
  });

  it('renders username, avatar, and external-link controls in the profile form', () => {
    expect(profileFormText).toContain('username');
    expect(profileFormText).toContain('Avatar');
    expect(profileFormText).toContain('ExternalLinksEditor');
    expect(externalLinksEditorText).toContain('Add another link');
    expect(externalLinksEditorText).toContain('https://');
  });
});
