import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('auth integration baseline', () => {
  const authServicePath = path.resolve(__dirname, '../../src/modules/auth/application/auth.service.ts');
  const authControllerPath = path.resolve(__dirname, '../../src/modules/auth/adapters/auth.controller.ts');
  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const authControllerText = fs.readFileSync(authControllerPath, 'utf8');

  it('defines refresh and sign-out use cases in auth service', () => {
    expect(authServiceText).toContain('async refresh(');
    expect(authServiceText).toContain('async signOut(');
  });

  it('defines refresh and sign-out routes in auth controller', () => {
    expect(authControllerText).toContain("@Post('refresh')");
    expect(authControllerText).toContain("@Post('sign-out')");
  });
});
