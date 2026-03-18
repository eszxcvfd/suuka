import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web profile foundation integration baseline', () => {
  const authStorePath = path.resolve(__dirname, '../../src/store/auth.store.ts');
  const authApiPath = path.resolve(__dirname, '../../src/services/auth-api.ts');
  const mainPath = path.resolve(__dirname, '../../src/main.tsx');

  const authStoreText = fs.readFileSync(authStorePath, 'utf8');
  const authApiText = fs.readFileSync(authApiPath, 'utf8');
  const mainText = fs.readFileSync(mainPath, 'utf8');

  it('prepares a profile mode and api client methods for owner profile screens', () => {
    expect(authStoreText).toContain("'profile'");
    expect(authApiText).toContain('getProfile');
    expect(authApiText).toContain('updateProfile');
    expect(mainText).toContain('ProfilePage');
  });
});
