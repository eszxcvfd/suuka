import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('auth sessions integration baseline', () => {
  const authServicePath = path.resolve(__dirname, '../../src/modules/auth/application/auth.service.ts');
  const authControllerPath = path.resolve(__dirname, '../../src/modules/auth/adapters/auth.controller.ts');
  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const authControllerText = fs.readFileSync(authControllerPath, 'utf8');

  it('defines session management use cases in auth service', () => {
    expect(authServiceText).toContain('async listSessions(');
    expect(authServiceText).toContain('async revokeSession(');
    expect(authServiceText).toContain('async revokeOtherSessions(');
  });

  it('defines session management routes in auth controller', () => {
    expect(authControllerText).toContain("@Get('sessions')");
    expect(authControllerText).toContain("@Delete('sessions/:sessionId')");
    expect(authControllerText).toContain("@Delete('sessions')");
  });
});
