import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthorizationGuard } from '../../authorization/adapters/authorization.guard';
import { Permissions } from '../../authorization/adapters/permissions.decorator';
import type { AuthorizationPrincipal } from '@suuka/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() body: { email: string; password: string; displayName: string }) {
    return this.authService.signUp(body.email, body.password, body.displayName);
  }

  @Post('sign-in')
  signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body.email, body.password);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('sign-out')
  signOut(@Body() body: { refreshToken: string }) {
    return this.authService.signOut(body.refreshToken);
  }

  @Post('verify-email')
  verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  @Post('password-reset/request')
  passwordResetRequest(@Body() body: { email: string }) {
    return this.authService.passwordResetRequest(body.email);
  }

  @Post('password-reset/confirm')
  passwordResetConfirm(@Body() body: { token: string; newPassword: string }) {
    return this.authService.passwordResetConfirm(body.token, body.newPassword);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  listSessions(@CurrentUser() user: { sub: string }) {
    return this.authService.listSessions(user.sub);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  revokeSession(@CurrentUser() user: { sub: string }, @Param('sessionId') sessionId: string) {
    return this.authService.revokeSession(user.sub, sessionId);
  }

  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  revokeOtherSessions(
    @CurrentUser() user: AuthorizationPrincipal,
    @Body() body: { currentSessionId?: string },
  ) {
    return this.authService.revokeOtherSessions(user.userId ?? user.id, body.currentSessionId);
  }

  @Patch('account-visibility')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Permissions('account:visibility:update')
  updateAccountVisibility(
    @CurrentUser() user: AuthorizationPrincipal,
    @Body() body: { visibility: 'public' | 'private' },
  ) {
    return this.authService.updateAccountVisibility(user.userId ?? user.id, body.visibility);
  }

  @Patch('roles/:userId')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Permissions('role:assign')
  assignRole(
    @Param('userId') userId: string,
    @Body() body: { role: 'admin' | 'moderator' | 'user' },
  ) {
    return this.authService.assignRole(userId, body.role);
  }
}
