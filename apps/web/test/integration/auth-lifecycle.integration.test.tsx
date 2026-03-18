import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web auth lifecycle integration baseline', () => {
  const authStorePath = path.resolve(__dirname, '../../src/store/auth.store.ts');
  const authStoreText = fs.readFileSync(authStorePath, 'utf8');

  it('exposes sign-up and sign-in actions in auth store', () => {
    expect(authStoreText).toContain('signUp:');
    expect(authStoreText).toContain('signIn:');
    expect(authStoreText).toContain('signOut:');
  });
});
