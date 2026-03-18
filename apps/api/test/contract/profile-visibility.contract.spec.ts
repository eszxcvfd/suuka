import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile visibility contract', () => {
  const contractPath = path.resolve(
    __dirname,
    '../../../../specs/004-user-profile/contracts/openapi.yaml',
  );
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('documents public and private viewer read semantics on /profiles/{accountId}', () => {
    expect(contractText).toContain('/profiles/{accountId}:');
    expect(contractText).toContain(
      'summary: Read a user profile subject to profile visibility rules',
    );
    expect(contractText).toContain('Profile is visible to the requesting principal');
    expect(contractText).toContain(
      'Profile does not exist or is intentionally hidden from the requester',
    );
    expect(contractText).toContain('NOT_FOUND');
  });

  it('allows owners to update accountVisibility through /profiles/me', () => {
    expect(contractText).toContain('UpdateProfileRequest:');
    expect(contractText).toContain('accountVisibility:');
    expect(contractText).toContain('enum: [public, private]');
  });
});
