import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import type { AuthorizationPrincipal } from '@suuka/shared-types';
import { updateAvatarSchema, updateProfileSchema } from '@suuka/validation';
import { CurrentUser } from '../../auth/adapters/current-user.decorator';
import { JwtAuthGuard } from '../../auth/adapters/jwt-auth.guard';
import { AuthorizationGuard } from '../../authorization/adapters/authorization.guard';
import { Permissions } from '../../authorization/adapters/permissions.decorator';
import { ProfileService } from '../application/profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Permissions('profile:read')
  @Get('me')
  getMe(@CurrentUser() principal: AuthorizationPrincipal) {
    return this.profileService.getCurrentProfile(principal.userId ?? principal.id);
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Permissions('profile:update')
  @Patch('me')
  updateMe(@CurrentUser() principal: AuthorizationPrincipal, @Body() body: unknown) {
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid profile update payload',
      });
    }

    return this.profileService.updateCurrentProfile(
      principal.userId ?? principal.id,
      parsed.data,
      principal,
    );
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Permissions('profile:update')
  @Patch('me/avatar')
  updateAvatar(@CurrentUser() principal: AuthorizationPrincipal, @Body() body: unknown) {
    const parsed = updateAvatarSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid avatar update payload',
      });
    }

    return this.profileService.updateAvatar(principal.userId ?? principal.id, parsed.data);
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Permissions('profile:read')
  @Get(':accountId')
  getByAccountId(
    @Param('accountId') accountId: string,
    @CurrentUser() principal: AuthorizationPrincipal,
  ) {
    return this.profileService.getProfileByAccountId(accountId, principal);
  }
}
