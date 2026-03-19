import { Body, Controller, Get, Patch, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/adapters/jwt-auth.guard';
import { AuthorizationGuard } from './authorization.guard';
import { InternalScopes } from './permissions.decorator';
import { UserRepository } from '../../auth/infrastructure/user.repository';
import { VerificationEmailService } from '../../auth/infrastructure/verification-email.service';

@Controller('internal')
export class InternalAuthorizationController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationEmailService: VerificationEmailService,
  ) {}

  @Get('moderation/review-queue')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @InternalScopes('internal:moderation:read', ['moderation:read'])
  reviewQueue() {
    return {
      success: true as const,
      data: {
        items: [],
      },
    };
  }

  @Patch('accounts/:accountId/visibility')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @InternalScopes('internal:accounts:write', ['accounts:write'])
  async updateVisibility(
    @Param('accountId') accountId: string,
    @Body() body: { visibility: 'public' | 'private' },
  ) {
    await this.userRepository.updateAuthorizationState(accountId, {
      accountVisibility: body.visibility,
    });

    return {
      success: true as const,
      data: {
        ok: true as const,
      },
    };
  }

  @Post('mail/connectivity')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @InternalScopes('internal:mail:check', ['mail:check'])
  async verifyMailConnectivity() {
    const requestId = `mailchk-${Date.now().toString(36)}`;
    const result = await this.verificationEmailService.verifyConnectivity(requestId);

    return {
      success: true as const,
      data: result,
    };
  }
}
