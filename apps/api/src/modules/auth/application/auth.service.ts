import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { EmailVerificationRequestRepository } from '../infrastructure/email-verification-request.repository';
import { SessionRepository } from '../infrastructure/session.repository';
import { UserRepository } from '../infrastructure/user.repository';
import { VerificationEmailService } from '../infrastructure/verification-email.service';
import { loadAuthConfig } from '../../../config/auth.config';

interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'suspended' | 'deleted';
}

interface AuthSessionResult {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

interface SessionInfoResult {
  id: string;
  deviceLabel: string;
  isCurrent: boolean;
  lastActivityAt: string;
}

interface AuthAuditEvent {
  at: string;
  detail?: string;
  eventType:
    | 'register'
    | 'sign_in'
    | 'sign_out'
    | 'refresh'
    | 'verify_email'
    | 'password_reset_request'
    | 'password_reset_confirm'
    | 'session_list'
    | 'session_revoke';
  result: 'success' | 'failure';
  userId?: string;
}

@Injectable()
export class AuthService {
  private readonly refreshTokens = new Map<
    string,
    { email: string; sessionId: string; userId: string }
  >();
  private readonly resetTokens = new Map<string, { expiresAt: number; userId: string }>();
  private readonly auditEvents: AuthAuditEvent[] = [];

  constructor(
    private readonly emailVerificationRequestRepository: EmailVerificationRequestRepository,
    private readonly passwordService: PasswordService,
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly verificationEmailService: VerificationEmailService,
  ) {}

  async signUp(email: string, password: string, displayName: string): Promise<AuthSessionResult> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      this.recordAuditEvent(
        'register',
        'failure',
        String((existing as unknown as { _id: unknown })._id),
        'duplicate_email',
      );
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.passwordService.hash(password);
    const created = await this.userRepository.create({
      displayName,
      email,
      passwordHash,
    });

    const sessionUser = {
      displayName: created.displayName,
      email: created.email,
      id: String((created as unknown as { _id: unknown })._id),
      status: created.status,
    };
    const config = loadAuthConfig();

    try {
      if (!config.requireVerifiedEmail) {
        await this.userRepository.updateVerificationStatus(sessionUser.id, true);
      } else {
        try {
          await this.sendVerificationEmail(sessionUser);
        } catch {
          this.recordAuditEvent(
            'register',
            'failure',
            sessionUser.id,
            'verification_email_delivery_failed',
          );
          throw new ServiceUnavailableException({
            code: 'EMAIL_DELIVERY_UNAVAILABLE',
            message:
              'We could not deliver your verification email right now. Please try again in a moment.',
          });
        }
      }

      const session = await this.issueSession(sessionUser);
      this.recordAuditEvent('register', 'success', sessionUser.id);
      return session;
    } catch (error) {
      await this.safeRollbackSignUp(sessionUser.id);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AuthSessionResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.recordAuditEvent('sign_in', 'failure', undefined, 'unknown_email');
      throw new UnauthorizedException('Invalid credentials');
    }

    const config = loadAuthConfig();
    if (config.requireVerifiedEmail && !user.emailVerified) {
      this.recordAuditEvent(
        'sign_in',
        'failure',
        String((user as unknown as { _id: unknown })._id),
        'email_unverified',
      );
      throw new UnauthorizedException({
        code: 'EMAIL_VERIFICATION_REQUIRED',
        message: 'Email verification required. Open the verification screen or request a new code.',
      });
    }

    const validPassword = await this.passwordService.matches(password, user.passwordHash);
    if (!validPassword) {
      this.recordAuditEvent(
        'sign_in',
        'failure',
        String((user as unknown as { _id: unknown })._id),
        'invalid_password',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.issueSession({
      displayName: user.displayName,
      email: user.email,
      id: String((user as unknown as { _id: unknown })._id),
      status: user.status,
    });
    this.recordAuditEvent('sign_in', 'success', session.user.id);
    return session;
  }

  async refresh(refreshToken: string): Promise<AuthSessionResult> {
    const current = this.refreshTokens.get(refreshToken);
    if (!current) {
      this.recordAuditEvent('refresh', 'failure', undefined, 'invalid_token');
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(current.userId);
    if (!user) {
      this.recordAuditEvent('refresh', 'failure', current.userId, 'missing_user');
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.refreshTokens.delete(refreshToken);

    const session = await this.issueSession({
      displayName: user.displayName,
      email: user.email,
      id: String((user as unknown as { _id: unknown })._id),
      status: user.status,
    });
    this.recordAuditEvent('refresh', 'success', session.user.id);
    return session;
  }

  async signOut(refreshToken: string): Promise<{ ok: true }> {
    const current = this.refreshTokens.get(refreshToken);
    if (current) {
      await this.sessionRepository.revokeSession(current.sessionId, 'sign_out');
      this.recordAuditEvent('sign_out', 'success', current.userId);
    }
    this.refreshTokens.delete(refreshToken);
    return { ok: true };
  }

  async listSessions(userId: string): Promise<SessionInfoResult[]> {
    const sessions = await this.sessionRepository.listActiveSessions(userId);
    this.recordAuditEvent('session_list', 'success', userId);
    return sessions.map((session, index) => ({
      id: String((session as unknown as { _id: unknown })._id),
      deviceLabel: session.deviceLabel,
      isCurrent: index === 0,
      lastActivityAt: session.lastActivityAt.toISOString(),
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<{ ok: true }> {
    await this.sessionRepository.revokeSession(sessionId, 'user_revoke');
    this.revokeSessionToken(userId, sessionId);
    this.recordAuditEvent('session_revoke', 'success', userId, `single:${sessionId}`);
    return { ok: true };
  }

  async revokeOtherSessions(userId: string, currentSessionId?: string): Promise<{ ok: true }> {
    const sessions = await this.sessionRepository.listActiveSessions(userId);
    for (const session of sessions) {
      const sessionId = String((session as unknown as { _id: unknown })._id);
      if (!currentSessionId || sessionId !== currentSessionId) {
        await this.sessionRepository.revokeSession(sessionId, 'revoke_other_sessions');
        this.revokeSessionToken(userId, sessionId);
      }
    }

    this.recordAuditEvent('session_revoke', 'success', userId, 'bulk');

    return { ok: true };
  }

  async assignRole(userId: string, role: 'admin' | 'moderator' | 'user'): Promise<{ ok: true }> {
    await this.userRepository.updateAuthorizationState(userId, { role });
    this.recordAuditEvent('session_revoke', 'success', userId, `role:${role}`);
    return { ok: true };
  }

  async updateAccountVisibility(
    userId: string,
    visibility: 'public' | 'private',
  ): Promise<{ ok: true }> {
    await this.userRepository.updateAuthorizationState(userId, { accountVisibility: visibility });
    this.recordAuditEvent('session_revoke', 'success', userId, `visibility:${visibility}`);
    return { ok: true };
  }

  async verifyEmail(token: string): Promise<{ ok: true }> {
    const now = new Date();
    await this.emailVerificationRequestRepository.expirePendingRequests(now);
    const challengeHash = this.tokenService.hashOpaqueToken(token);
    const active = await this.emailVerificationRequestRepository.findPendingRequestByChallengeHash(
      challengeHash,
      now,
    );
    if (!active) {
      this.recordAuditEvent('verify_email', 'failure', undefined, 'invalid_token');
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    await this.userRepository.updateVerificationStatus(active.userId, true);
    await this.emailVerificationRequestRepository.markCompleted(
      String((active as unknown as { _id: unknown })._id),
    );
    await this.emailVerificationRequestRepository.invalidatePendingRequests(active.userId);
    this.recordAuditEvent('verify_email', 'success', active.userId);

    return { ok: true };
  }

  async resendVerification(email: string): Promise<{ ok: true }> {
    const user = await this.userRepository.findByEmail(email);
    if (user && !user.emailVerified) {
      await this.sendVerificationEmail({
        displayName: user.displayName,
        email: user.email,
        id: String((user as unknown as { _id: unknown })._id),
        status: user.status,
      });
      this.recordAuditEvent(
        'verify_email',
        'success',
        String((user as unknown as { _id: unknown })._id),
        'resend',
      );
    }

    return { ok: true };
  }

  async passwordResetRequest(email: string): Promise<{ ok: true }> {
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      const token = this.tokenService.generateOpaqueRefreshToken();
      this.resetTokens.set(token, {
        expiresAt: Date.now() + 1000 * 60 * 15,
        userId: String((user as unknown as { _id: unknown })._id),
      });
      this.recordAuditEvent(
        'password_reset_request',
        'success',
        String((user as unknown as { _id: unknown })._id),
      );
    }

    return { ok: true };
  }

  async passwordResetConfirm(token: string, newPassword: string): Promise<{ ok: true }> {
    const active = this.resetTokens.get(token);
    if (!active || Date.now() > active.expiresAt) {
      this.recordAuditEvent('password_reset_confirm', 'failure', undefined, 'invalid_token');
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await this.passwordService.hash(newPassword);
    await this.userRepository.updatePassword(active.userId, passwordHash);
    this.revokeUserSessions(active.userId);
    this.resetTokens.delete(token);
    this.recordAuditEvent('password_reset_confirm', 'success', active.userId);

    return { ok: true };
  }

  private async issueSession(user: SessionUser): Promise<AuthSessionResult> {
    const session = await this.sessionRepository.createSession({
      clientType: 'web',
      deviceLabel: 'web-session',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      userId: user.id,
    });
    const sessionId = String((session as unknown as { _id: unknown })._id);

    const accessToken = await this.tokenService.signAccessToken({
      email: user.email,
      sub: user.id,
    });
    const refreshToken = this.tokenService.generateOpaqueRefreshToken();
    this.refreshTokens.set(refreshToken, { email: user.email, sessionId, userId: user.id });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private async sendVerificationEmail(user: SessionUser): Promise<void> {
    const token = this.tokenService.generateOpaqueRefreshToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const request = await this.emailVerificationRequestRepository.createPendingRequest({
      challengeHash: this.tokenService.hashOpaqueToken(token),
      expiresAt,
      userId: user.id,
    });

    try {
      await this.verificationEmailService.sendVerificationEmail({
        displayName: user.displayName,
        email: user.email,
        token,
      });
    } catch (error) {
      await this.emailVerificationRequestRepository.deletePendingRequest(
        String((request as unknown as { _id: unknown })._id),
      );
      throw error;
    }

    await this.emailVerificationRequestRepository.invalidateOtherPendingRequests(
      user.id,
      String((request as unknown as { _id: unknown })._id),
    );
  }

  private revokeSessionToken(userId: string, sessionId: string): void {
    for (const [token, session] of this.refreshTokens.entries()) {
      if (session.userId === userId && session.sessionId === sessionId) {
        this.refreshTokens.delete(token);
      }
    }
  }

  private revokeUserSessions(userId: string): void {
    for (const [token, session] of this.refreshTokens.entries()) {
      if (session.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }
  }

  private async safeRollbackSignUp(userId: string): Promise<void> {
    this.revokeUserSessions(userId);

    try {
      await this.emailVerificationRequestRepository.invalidatePendingRequests(userId);
    } catch {
      // Preserve the original sign-up failure rather than masking it with cleanup noise.
    }

    try {
      await this.userRepository.deleteById(userId);
    } catch {
      // Preserve the original sign-up failure rather than masking it with cleanup noise.
    }
  }

  private recordAuditEvent(
    eventType: AuthAuditEvent['eventType'],
    result: AuthAuditEvent['result'],
    userId?: string,
    detail?: string,
  ): void {
    this.auditEvents.unshift({
      at: new Date().toISOString(),
      detail,
      eventType,
      result,
      userId,
    });
    if (this.auditEvents.length > 500) {
      this.auditEvents.pop();
    }
  }
}
