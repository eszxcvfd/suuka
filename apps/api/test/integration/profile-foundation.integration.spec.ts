import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile foundation integration baseline', () => {
  const userSchemaPath = path.resolve(
    __dirname,
    '../../src/modules/auth/infrastructure/user.schema.ts',
  );
  const userRepositoryPath = path.resolve(
    __dirname,
    '../../src/modules/auth/infrastructure/user.repository.ts',
  );
  const profileServicePath = path.resolve(
    __dirname,
    '../../src/modules/profiles/application/profile.service.ts',
  );
  const profileControllerPath = path.resolve(
    __dirname,
    '../../src/modules/profiles/adapters/profile.controller.ts',
  );
  const profileModulePath = path.resolve(
    __dirname,
    '../../src/modules/profiles/profiles.module.ts',
  );
  const appModulePath = path.resolve(__dirname, '../../src/app.module.ts');

  const userSchemaText = fs.readFileSync(userSchemaPath, 'utf8');
  const userRepositoryText = fs.readFileSync(userRepositoryPath, 'utf8');
  const appModuleText = fs.readFileSync(appModulePath, 'utf8');
  const profileServiceText = fs.existsSync(profileServicePath)
    ? fs.readFileSync(profileServicePath, 'utf8')
    : '';
  const profileControllerText = fs.existsSync(profileControllerPath)
    ? fs.readFileSync(profileControllerPath, 'utf8')
    : '';
  const profileModuleText = fs.existsSync(profileModulePath)
    ? fs.readFileSync(profileModulePath, 'utf8')
    : '';

  it('extends persisted user records and repository helpers for profile storage', () => {
    expect(userSchemaText).toContain('username');
    expect(userSchemaText).toContain('usernameCanonical');
    expect(userSchemaText).toContain('bio');
    expect(userSchemaText).toContain('avatarMediaId');
    expect(userSchemaText).toContain('externalLinks');
    expect(userRepositoryText).toContain('findProfileById');
    expect(userRepositoryText).toContain('findByUsernameCanonical');
    expect(userRepositoryText).toContain('updateProfile');
  });

  it('wires a dedicated profiles module into the api graph', () => {
    expect(fs.existsSync(profileServicePath)).toBe(true);
    expect(fs.existsSync(profileControllerPath)).toBe(true);
    expect(fs.existsSync(profileModulePath)).toBe(true);
    expect(profileModuleText).toContain('ProfileService');
    expect(profileModuleText).toContain('ProfileController');
    expect(appModuleText).toContain('ProfilesModule');
  });

  it('prepares profile orchestration and controller wiring for owner and viewer reads', () => {
    expect(profileServiceText).toContain('authorizationService.evaluate');
    expect(profileServiceText).toContain('findProfileById');
    expect(profileControllerText).toContain("@Controller('profiles')");
    expect(profileControllerText).toContain("@Get('me')");
    expect(profileControllerText).toContain("@Patch('me')");
    expect(profileControllerText).toContain("@Get(':accountId')");
  });
});
