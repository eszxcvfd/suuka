import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('authorization contract', () => {
  const contractPath = path.resolve(
    __dirname,
    '../../../../specs/003-auth-permission-framework/contracts/openapi.yaml',
  );
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('covers authorization-sensitive media and account surfaces', () => {
    expect(contractText).toContain('/media:');
    expect(contractText).toContain('/media/{mediaId}:');
    expect(contractText).toContain('/profiles/{accountId}:');
    expect(contractText).toContain('/accounts/{accountId}/visibility:');
  });

  it('defines explicit denial envelopes for user and internal callers', () => {
    expect(contractText).toContain('AuthorizationError:');
    expect(contractText).toContain('enum: [FORBIDDEN, NOT_FOUND, MISSING_SCOPE]');
    expect(contractText).toContain('/internal/moderation/review-queue:');
    expect(contractText).toContain('/internal/accounts/{accountId}/visibility:');
  });

  it('annotates each protected slice with an implementation marker', () => {
    expect(contractText).toContain('x-implementation-slice: us1');
    expect(contractText).toContain('x-implementation-slice: us2');
    expect(contractText).toContain('x-implementation-slice: us3');
  });
});
