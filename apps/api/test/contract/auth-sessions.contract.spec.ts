import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Auth sessions contract', () => {
  const contractPath = path.resolve(__dirname, '../../../../specs/002-account-auth-lifecycle/contracts/openapi.yaml');
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('defines session list and bulk revoke contract', () => {
    expect(contractText).toContain('/auth/sessions:');
    expect(contractText).toContain('summary: List active sessions for current user');
    expect(contractText).toContain('summary: Revoke all non-current sessions');
    expect(contractText).toContain("$ref: '#/components/schemas/EnvelopeSessionList'");
  });

  it('defines single session revoke contract', () => {
    expect(contractText).toContain('/auth/sessions/{sessionId}:');
    expect(contractText).toContain('name: sessionId');
    expect(contractText).toContain('summary: Revoke one specific session');
  });
});
