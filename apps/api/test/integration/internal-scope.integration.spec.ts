import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('internal scope integration baseline', () => {
  const permissionsDecoratorPath = path.resolve(
    __dirname,
    '../../src/modules/authorization/adapters/permissions.decorator.ts',
  );
  const authorizationGuardPath = path.resolve(
    __dirname,
    '../../src/modules/authorization/adapters/authorization.guard.ts',
  );
  const authorizationServicePath = path.resolve(
    __dirname,
    '../../src/modules/authorization/application/authorization.service.ts',
  );
  const authConfigPath = path.resolve(__dirname, '../../src/config/auth.config.ts');
  const sharedTypesPath = path.resolve(__dirname, '../../../../packages/shared-types/src/index.ts');

  const permissionsDecoratorText = fs.readFileSync(permissionsDecoratorPath, 'utf8');
  const authorizationGuardText = fs.readFileSync(authorizationGuardPath, 'utf8');
  const authorizationServiceText = fs.readFileSync(authorizationServicePath, 'utf8');
  const authConfigText = fs.readFileSync(authConfigPath, 'utf8');
  const sharedTypesText = fs.readFileSync(sharedTypesPath, 'utf8');
  const internalControllerText = fs.readFileSync(
    path.resolve(
      __dirname,
      '../../src/modules/authorization/adapters/internal-authorization.controller.ts',
    ),
    'utf8',
  );

  it('supports declaring internal scopes directly in authorization metadata', () => {
    expect(permissionsDecoratorText).toContain('requiredScopes');
    expect(permissionsDecoratorText).toContain('InternalScopes');
  });

  it('keeps service-principal scope checks explicit in guard and authorization service', () => {
    expect(authorizationGuardText).toContain('internal_service');
    expect(authorizationGuardText).toContain('Missing required scope grant');
    expect(authorizationServiceText).toContain("principal.principalType === 'internal_service'");
  });

  it('extends auth config and shared types for service-principal scope grants', () => {
    expect(authConfigText).toContain('internalScopeAudience');
    expect(authConfigText).toContain('servicePrincipalSecret');
    expect(sharedTypesText).toContain('ServicePrincipalGrant');
  });

  it('exposes an internal mail connectivity diagnostic behind scoped auth', () => {
    expect(internalControllerText).toContain("@Post('mail/connectivity')");
    expect(internalControllerText).toContain(
      "@InternalScopes('internal:mail:check', ['mail:check'])",
    );
  });
});
