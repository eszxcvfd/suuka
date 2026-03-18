import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('authorization foundation integration baseline', () => {
  const appModulePath = path.resolve(__dirname, '../../src/app.module.ts');
  const authModulePath = path.resolve(__dirname, '../../src/modules/auth/auth.module.ts');
  const jwtAuthGuardPath = path.resolve(
    __dirname,
    '../../src/modules/auth/adapters/jwt-auth.guard.ts',
  );
  const authorizationModulePath = path.resolve(
    __dirname,
    '../../src/modules/authorization/authorization.module.ts',
  );
  const authorizationGuardPath = path.resolve(
    __dirname,
    '../../src/modules/authorization/adapters/authorization.guard.ts',
  );
  const permissionsDecoratorPath = path.resolve(
    __dirname,
    '../../src/modules/authorization/adapters/permissions.decorator.ts',
  );

  const appModuleText = fs.readFileSync(appModulePath, 'utf8');
  const authModuleText = fs.readFileSync(authModulePath, 'utf8');
  const jwtAuthGuardText = fs.readFileSync(jwtAuthGuardPath, 'utf8');

  it('registers the authorization module in the application graph', () => {
    expect(fs.existsSync(authorizationModulePath)).toBe(true);
    expect(appModuleText).toContain('AuthorizationModule');
    expect(authModuleText).toContain('exports: [');
  });

  it('adds explicit authorization guard and permissions decorator surfaces', () => {
    expect(fs.existsSync(authorizationGuardPath)).toBe(true);
    expect(fs.existsSync(permissionsDecoratorPath)).toBe(true);
  });

  it('keeps jwt authentication and authorization context richer than bare sub/email data', () => {
    expect(jwtAuthGuardText).toContain('principalType');
    expect(jwtAuthGuardText).toContain('scopes');
    expect(jwtAuthGuardText).toContain('role');
    expect(jwtAuthGuardText).toContain('accountVisibility');
  });

  it('defines default-deny behavior in the authorization guard implementation', () => {
    const authorizationGuardText = fs.existsSync(authorizationGuardPath)
      ? fs.readFileSync(authorizationGuardPath, 'utf8')
      : '';

    expect(authorizationGuardText).toContain('ForbiddenException');
    expect(authorizationGuardText).toContain('default-deny');
    expect(authorizationGuardText).toContain('Missing required permissions metadata');
  });
});
