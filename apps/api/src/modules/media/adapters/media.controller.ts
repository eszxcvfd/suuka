import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MediaService } from '../application/media.service';
import { CurrentUser } from '../../auth/adapters/current-user.decorator';
import { JwtAuthGuard } from '../../auth/adapters/jwt-auth.guard';
import { AuthorizationGuard } from '../../authorization/adapters/authorization.guard';
import { Permissions } from '../../authorization/adapters/permissions.decorator';
import type { AuthorizationPrincipal } from '@suuka/shared-types';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Permissions('media:list')
  @Get()
  list(@CurrentUser() principal: AuthorizationPrincipal) {
    return {
      success: true as const,
      data: this.mediaService.list(principal),
    };
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Permissions('media:update')
  @Post()
  upload(@CurrentUser() principal: AuthorizationPrincipal, @Body() body: { filename: string }) {
    return {
      success: true as const,
      data: this.mediaService.upload(principal, body.filename),
    };
  }
}
