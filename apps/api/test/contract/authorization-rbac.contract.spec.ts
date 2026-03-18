import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('authorization rbac contract', () => {
  const contractPath = path.resolve(
    __dirname,
    '../../../../specs/003-auth-permission-framework/contracts/openapi.yaml',
  );
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('documents moderator and admin-only authorization summaries', () => {
    expect(contractText).toContain('moderator');
    expect(contractText).toContain('admin override');
    expect(contractText).toContain('admin-only');
  });
});
