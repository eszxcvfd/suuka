import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile contract', () => {
  const contractPath = path.resolve(
    __dirname,
    '../../../../specs/004-user-profile/contracts/openapi.yaml',
  );
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('keeps owner profile, viewer profile, and avatar surfaces documented', () => {
    expect(contractText).toContain('/profiles/{accountId}:');
    expect(contractText).toContain('/profiles/me:');
    expect(contractText).toContain('/profiles/me/avatar:');
    expect(contractText).toContain('x-implementation-slice: us1');
    expect(contractText).toContain('x-implementation-slice: us2');
    expect(contractText).toContain('x-implementation-slice: us3');
  });

  it('documents validation and owner-profile envelope semantics for the mvp slice', () => {
    expect(contractText).toContain('ProfileView:');
    expect(contractText).toContain('UpdateProfileRequest:');
    expect(contractText).toContain('displayName:');
    expect(contractText).toContain('bio:');
    expect(contractText).toContain('ValidationError:');
  });
});
