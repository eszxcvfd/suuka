import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('authorization scopes contract', () => {
  const contractPath = path.resolve(
    __dirname,
    '../../../../specs/003-auth-permission-framework/contracts/openapi.yaml',
  );
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('defines internal scope-protected endpoints and missing-scope denial semantics', () => {
    expect(contractText).toContain('/internal/moderation/review-queue:');
    expect(contractText).toContain('/internal/accounts/{accountId}/visibility:');
    expect(contractText).toContain('MISSING_SCOPE');
    expect(contractText).toContain('accounts:write');
    expect(contractText).toContain('moderation:read');
  });
});
