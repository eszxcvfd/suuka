import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Auth recovery contract', () => {
  const contractPath = path.resolve(__dirname, '../../../../specs/002-account-auth-lifecycle/contracts/openapi.yaml');
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('defines verification endpoints and request schemas', () => {
    expect(contractText).toContain('/auth/verify-email:');
    expect(contractText).toContain('/auth/resend-verification:');
    expect(contractText).toContain("$ref: '#/components/schemas/VerifyEmailRequest'");
    expect(contractText).toContain("$ref: '#/components/schemas/EmailRequest'");
  });

  it('defines password reset request/confirm endpoints', () => {
    expect(contractText).toContain('/auth/password-reset/request:');
    expect(contractText).toContain('/auth/password-reset/confirm:');
    expect(contractText).toContain("$ref: '#/components/schemas/PasswordResetConfirmRequest'");
    expect(contractText).toContain("Non-enumerating accepted response");
  });
});
