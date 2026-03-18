import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mobile rbac integration baseline', () => {
  const apiClientPath = path.resolve(__dirname, '../../src/services/api-client.ts');
  const apiClientText = fs.readFileSync(apiClientPath, 'utf8');

  it('preserves role-related authorization error semantics', () => {
    expect(apiClientText).toContain('AuthorizationError');
    expect(apiClientText).toContain('isAuthorizationDeniedError');
  });
});
