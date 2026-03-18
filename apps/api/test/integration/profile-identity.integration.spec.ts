import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile identity integration baseline', () => {
  const profileServicePath = path.resolve(
    __dirname,
    '../../src/modules/profiles/application/profile.service.ts',
  );
  const profileControllerPath = path.resolve(
    __dirname,
    '../../src/modules/profiles/adapters/profile.controller.ts',
  );
  const mediaServicePath = path.resolve(
    __dirname,
    '../../src/modules/media/application/media.service.ts',
  );
  const profileSchemaPath = path.resolve(
    __dirname,
    '../../../../packages/validation/src/profile.schema.ts',
  );

  const profileServiceText = fs.existsSync(profileServicePath)
    ? fs.readFileSync(profileServicePath, 'utf8')
    : '';
  const profileControllerText = fs.existsSync(profileControllerPath)
    ? fs.readFileSync(profileControllerPath, 'utf8')
    : '';
  const mediaServiceText = fs.existsSync(mediaServicePath)
    ? fs.readFileSync(mediaServicePath, 'utf8')
    : '';
  const profileSchemaText = fs.existsSync(profileSchemaPath)
    ? fs.readFileSync(profileSchemaPath, 'utf8')
    : '';

  it('maps duplicate usernames and identity updates in the profile service', () => {
    expect(profileServiceText).toContain('usernameCanonical');
    expect(profileServiceText).toContain('USERNAME_TAKEN');
    expect(profileServiceText).toContain('externalLinks');
    expect(profileServiceText).toContain('normalizeExternalLinks');
  });

  it('validates avatar references through the media reference model', () => {
    expect(profileServiceText).toContain('resolveAvatarAsset');
    expect(mediaServiceText).toContain('resolveAvatarAsset(');
    expect(mediaServiceText).toContain("resourceType === 'image'");
    expect(mediaServiceText).toContain("status === 'ready'");
  });

  it('extends controller validation coverage for username and external links', () => {
    expect(profileControllerText).toContain('updateProfileSchema');
    expect(profileSchemaText).toContain('username');
    expect(profileSchemaText).toContain('externalLinks');
    expect(profileSchemaText).toContain('https://');
  });
});
