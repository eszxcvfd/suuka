import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile identity contract', () => {
  const contractPath = path.resolve(
    __dirname,
    '../../../../specs/004-user-profile/contracts/openapi.yaml',
  );
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('documents username and external-link updates on /profiles/me', () => {
    expect(contractText).toContain('/profiles/me:');
    expect(contractText).toContain('username:');
    expect(contractText).toContain('externalLinks:');
    expect(contractText).toContain('ProfileExternalLink:');
    expect(contractText).toContain('USERNAME_TAKEN');
  });

  it('documents avatar mutation semantics on /profiles/me/avatar', () => {
    expect(contractText).toContain('/profiles/me/avatar:');
    expect(contractText).toContain(
      "summary: Attach, replace, or remove the current authenticated user's avatar",
    );
    expect(contractText).toContain('UpdateAvatarRequest:');
    expect(contractText).toContain('mediaId:');
  });
});
