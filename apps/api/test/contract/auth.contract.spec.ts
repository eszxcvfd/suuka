import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Auth contract', () => {
  const contractPath = path.resolve(__dirname, '../../../../specs/002-account-auth-lifecycle/contracts/openapi.yaml');
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('defines sign-up and sign-in endpoints', () => {
    expect(contractText).toContain('/auth/sign-up:');
    expect(contractText).toContain('/auth/sign-in:');
    expect(contractText).toContain("$ref: '#/components/schemas/SignUpRequest'");
    expect(contractText).toContain("$ref: '#/components/schemas/SignInRequest'");
  });

  it('defines sign-out and refresh endpoints', () => {
    expect(contractText).toContain('/auth/sign-out:');
    expect(contractText).toContain('/auth/refresh:');
    expect(contractText).toContain("$ref: '#/components/schemas/RefreshRequest'");
    expect(contractText).toContain("$ref: '#/components/schemas/EnvelopeAuthSession'");
  });
});
