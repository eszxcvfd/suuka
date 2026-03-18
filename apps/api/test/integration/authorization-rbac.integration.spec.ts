import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('authorization rbac integration baseline', () => {
  const authServicePath = path.resolve(
    __dirname,
    '../../src/modules/auth/application/auth.service.ts',
  );
  const authControllerPath = path.resolve(
    __dirname,
    '../../src/modules/auth/adapters/auth.controller.ts',
  );
  const authorizationServicePath = path.resolve(
    __dirname,
    '../../src/modules/authorization/application/authorization.service.ts',
  );
  const auditRepositoryPath = path.resolve(
    __dirname,
    '../../src/modules/authorization/infrastructure/authorization-audit.repository.ts',
  );

  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const authControllerText = fs.readFileSync(authControllerPath, 'utf8');
  const authorizationServiceText = fs.readFileSync(authorizationServicePath, 'utf8');
  const auditRepositoryText = fs.readFileSync(auditRepositoryPath, 'utf8');

  it('adds role-aware lifecycle operations to auth service and controller', () => {
    expect(authServiceText).toContain('async assignRole(');
    expect(authServiceText).toContain('async updateAccountVisibility(');
    expect(authControllerText).toContain("@Patch('roles/:userId')");
    expect(authControllerText).toContain("@Patch('account-visibility')");
  });

  it('encodes admin/moderator/user permission matrix and override audit helpers', () => {
    expect(authorizationServiceText).toContain('ROLE_PERMISSION_MATRIX');
    expect(authorizationServiceText).toContain('moderator');
    expect(auditRepositoryText).toContain('recordRoleAction');
  });
});
