import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('auth recovery integration baseline', () => {
  const authServicePath = path.resolve(__dirname, '../../src/modules/auth/application/auth.service.ts');
  const authControllerPath = path.resolve(__dirname, '../../src/modules/auth/adapters/auth.controller.ts');
  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const authControllerText = fs.readFileSync(authControllerPath, 'utf8');

  it('defines recovery use cases in auth service', () => {
    expect(authServiceText).toContain('async verifyEmail(');
    expect(authServiceText).toContain('async resendVerification(');
    expect(authServiceText).toContain('async passwordResetRequest(');
    expect(authServiceText).toContain('async passwordResetConfirm(');
  });

  it('defines recovery routes in auth controller', () => {
    expect(authControllerText).toContain("@Post('verify-email')");
    expect(authControllerText).toContain("@Post('resend-verification')");
    expect(authControllerText).toContain("@Post('password-reset/request')");
    expect(authControllerText).toContain("@Post('password-reset/confirm')");
  });
});
