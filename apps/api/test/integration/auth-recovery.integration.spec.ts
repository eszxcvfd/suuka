import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('auth recovery integration baseline', () => {
  const authServicePath = path.resolve(
    __dirname,
    '../../src/modules/auth/application/auth.service.ts',
  );
  const authControllerPath = path.resolve(
    __dirname,
    '../../src/modules/auth/adapters/auth.controller.ts',
  );
  const authModulePath = path.resolve(__dirname, '../../src/modules/auth/auth.module.ts');
  const apiPackagePath = path.resolve(__dirname, '../../package.json');
  const envExamplePath = path.resolve(__dirname, '../../../../.env.example');
  const emailServicePath = path.resolve(
    __dirname,
    '../../src/modules/auth/infrastructure/verification-email.service.ts',
  );
  const verificationRepositoryPath = path.resolve(
    __dirname,
    '../../src/modules/auth/infrastructure/email-verification-request.repository.ts',
  );
  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const authControllerText = fs.readFileSync(authControllerPath, 'utf8');
  const authModuleText = fs.readFileSync(authModulePath, 'utf8');
  const apiPackageText = fs.readFileSync(apiPackagePath, 'utf8');
  const envExampleText = fs.readFileSync(envExamplePath, 'utf8');

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

  it('adds persistent verification delivery infrastructure', () => {
    expect(fs.existsSync(emailServicePath)).toBe(true);
    expect(fs.existsSync(verificationRepositoryPath)).toBe(true);
    expect(authModuleText).toContain('VerificationEmailService');
    expect(authModuleText).toContain('EmailVerificationRequestRepository');
    expect(authModuleText).toContain('loadMailConfig');
    expect(authServiceText).not.toContain('private readonly verificationTokens = new Map');
    expect(authServiceText).toContain('sendVerificationEmail');
    expect(authServiceText).toContain('emailVerificationRequestRepository');
  });

  it('documents SMTP verification mail configuration', () => {
    expect(apiPackageText).toContain('nodemailer');
    expect(envExampleText).toContain('MAIL_FROM=');
    expect(envExampleText).toContain('MAIL_HOST=');
    expect(envExampleText).toContain('MAIL_PORT=');
    expect(envExampleText).toContain('MAIL_USER=');
    expect(envExampleText).toContain('MAIL_PASSWORD=');
    expect(envExampleText).toContain('MAIL_SECURE=');
    expect(envExampleText).toContain('WEB_BASE_URL=');
    expect(
      fs.readFileSync(path.resolve(__dirname, '../../src/config/mail.config.ts'), 'utf8'),
    ).toContain('Invalid URL environment variable: WEB_BASE_URL');
  });
});
