import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile visibility integration baseline', () => {
  const profileServicePath = path.resolve(
    __dirname,
    '../../src/modules/profiles/application/profile.service.ts',
  );
  const profileControllerPath = path.resolve(
    __dirname,
    '../../src/modules/profiles/adapters/profile.controller.ts',
  );
  const authorizationServicePath = path.resolve(
    __dirname,
    '../../src/modules/authorization/application/authorization.service.ts',
  );
  const permissionRulePath = path.resolve(
    __dirname,
    '../../src/modules/authorization/domain/permission-rule.ts',
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
  const authorizationServiceText = fs.existsSync(authorizationServicePath)
    ? fs.readFileSync(authorizationServicePath, 'utf8')
    : '';
  const permissionRuleText = fs.existsSync(permissionRulePath)
    ? fs.readFileSync(permissionRulePath, 'utf8')
    : '';
  const profileSchemaText = fs.existsSync(profileSchemaPath)
    ? fs.readFileSync(profileSchemaPath, 'utf8')
    : '';

  it('enforces non-revealing hidden-profile reads while still evaluating account visibility', () => {
    expect(profileServiceText).toContain('async getProfileByAccountId(');
    expect(profileServiceText).toContain('visibility: profile.accountVisibility');
    expect(profileServiceText).toContain(
      "throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profile not found' })",
    );
  });

  it('persists owner accountVisibility updates through the profile update flow', () => {
    expect(profileServiceText).toContain('accountVisibility: input.accountVisibility');
    expect(profileSchemaText).toContain('accountVisibility: accountVisibilitySchema.optional()');
    expect(profileControllerText).toContain("@Patch('me')");
  });

  it('keeps profile privacy authorization aligned with owner update and viewer read semantics', () => {
    expect(permissionRuleText).toContain("'profile:read'");
    expect(permissionRuleText).toContain("'profile:update'");
    expect(permissionRuleText).toContain('requiresOwnership: true');
    expect(authorizationServiceText).toContain("context.visibility === 'private'");
    expect(authorizationServiceText).toContain("return deny('ACCOUNT_PRIVATE')");
  });
});
