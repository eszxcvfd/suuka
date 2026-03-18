import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('authorization visibility integration baseline', () => {
  const mediaEntityPath = path.resolve(
    __dirname,
    '../../src/modules/media/domain/media-asset.entity.ts',
  );
  const mediaServicePath = path.resolve(
    __dirname,
    '../../src/modules/media/application/media.service.ts',
  );
  const mediaControllerPath = path.resolve(
    __dirname,
    '../../src/modules/media/adapters/media.controller.ts',
  );
  const mediaModulePath = path.resolve(__dirname, '../../src/modules/media/media.module.ts');

  const mediaEntityText = fs.readFileSync(mediaEntityPath, 'utf8');
  const mediaServiceText = fs.readFileSync(mediaServicePath, 'utf8');
  const mediaControllerText = fs.readFileSync(mediaControllerPath, 'utf8');
  const mediaModuleText = fs.readFileSync(mediaModulePath, 'utf8');

  it('derives media ownership and visibility from authenticated principal context', () => {
    expect(mediaEntityText).toContain('accountVisibility');
    expect(mediaServiceText).toContain('AuthorizationPrincipal');
    expect(mediaServiceText).not.toContain('upload(ownerUserId');
    expect(mediaServiceText).not.toContain('list(ownerUserId');
  });

  it('protects media routes with jwt + authorization metadata instead of owner query params', () => {
    expect(mediaControllerText).toContain('@UseGuards(JwtAuthGuard, AuthorizationGuard)');
    expect(mediaControllerText).toContain("@Permissions('media:list')");
    expect(mediaControllerText).toContain('@CurrentUser() principal');
    expect(mediaControllerText).not.toContain("@Query('ownerUserId')");
    expect(mediaControllerText).not.toContain('body.ownerUserId');
  });

  it('wires media module through the authorization-aware dependency graph', () => {
    expect(mediaModuleText).toContain('AuthorizationModule');
    expect(mediaModuleText).toContain('AuthModule');
  });
});
