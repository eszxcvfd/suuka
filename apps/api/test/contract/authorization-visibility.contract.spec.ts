import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('authorization visibility contract', () => {
  const contractPath = path.resolve(
    __dirname,
    '../../../../specs/003-auth-permission-framework/contracts/openapi.yaml',
  );
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('defines profile, visibility, and media authorization paths', () => {
    expect(contractText).toContain('/profiles/{accountId}:');
    expect(contractText).toContain('/accounts/{accountId}/visibility:');
    expect(contractText).toContain('/media:');
    expect(contractText).toContain('/media/{mediaId}:');
  });

  it('keeps non-revealing denial semantics for end-user visibility checks', () => {
    expect(contractText).toContain('NOT_FOUND');
    expect(contractText).toContain('FORBIDDEN');
    expect(contractText).toContain(
      'Private profile denied without revealing sensitive policy details',
    );
  });
});
