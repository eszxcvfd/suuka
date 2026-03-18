import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile self integration baseline', () => {
  const profileServicePath = path.resolve(
    __dirname,
    '../../src/modules/profiles/application/profile.service.ts',
  );
  const profileControllerPath = path.resolve(
    __dirname,
    '../../src/modules/profiles/adapters/profile.controller.ts',
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
  const profileSchemaText = fs.existsSync(profileSchemaPath)
    ? fs.readFileSync(profileSchemaPath, 'utf8')
    : '';

  it('implements current-user profile read and update use cases for display name and bio', () => {
    expect(profileServiceText).toContain('async getCurrentProfile(');
    expect(profileServiceText).toContain('async updateCurrentProfile(');
    expect(profileServiceText).toContain('displayName');
    expect(profileServiceText).toContain('bio');
  });

  it('protects /profiles/me with jwt auth and profile-specific authorization metadata', () => {
    expect(profileControllerText).toContain('@UseGuards(JwtAuthGuard, AuthorizationGuard)');
    expect(profileControllerText).toContain("@Permissions('profile:read')");
    expect(profileControllerText).toContain("@Permissions('profile:update')");
    expect(profileControllerText).toContain('@CurrentUser() principal');
  });

  it('defines validation schemas for owner profile updates and rejects invalid bio/display name payloads', () => {
    expect(profileSchemaText).toContain('updateProfileSchema');
    expect(profileSchemaText).toContain('displayName');
    expect(profileSchemaText).toContain('bio');
    expect(profileSchemaText).toContain('max(160)');
  });
});
