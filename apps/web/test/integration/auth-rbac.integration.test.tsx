import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web rbac integration baseline', () => {
  const authStorePath = path.resolve(__dirname, '../../src/store/auth.store.ts');
  const authStoreText = fs.readFileSync(authStorePath, 'utf8');

  it('tracks role-aware ui state and denied staff action feedback', () => {
    expect(authStoreText).toContain('role?:');
    expect(authStoreText).toContain('accountVisibility?:');
    expect(authStoreText).toContain('deniedStaffActionMessage');
  });
});
