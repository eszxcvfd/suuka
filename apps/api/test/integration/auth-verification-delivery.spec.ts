import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { AuthService } from '../../src/modules/auth/application/auth.service';
import { EmailVerificationRequestRepository } from '../../src/modules/auth/infrastructure/email-verification-request.repository';
import { SessionRepository } from '../../src/modules/auth/infrastructure/session.repository';
import { TokenService } from '../../src/modules/auth/application/token.service';
import { UserRepository } from '../../src/modules/auth/infrastructure/user.repository';
import { VerificationEmailService } from '../../src/modules/auth/infrastructure/verification-email.service';

function buildService(overrides?: {
  emailVerificationRequestRepository?: Partial<EmailVerificationRequestRepository>;
  passwordService?: { hash: ReturnType<typeof vi.fn>; matches: ReturnType<typeof vi.fn> };
  sessionRepository?: Partial<SessionRepository>;
  tokenService?: Partial<TokenService>;
  userRepository?: Partial<UserRepository>;
  verificationEmailService?: Partial<VerificationEmailService>;
}) {
  const emailVerificationRequestRepository = {
    createPendingRequest: vi.fn(),
    deletePendingRequest: vi.fn(),
    expirePendingRequests: vi.fn(),
    findPendingRequestByChallengeHash: vi.fn(),
    invalidateOtherPendingRequests: vi.fn(),
    invalidatePendingRequests: vi.fn(),
    markCompleted: vi.fn(),
    ...overrides?.emailVerificationRequestRepository,
  } satisfies Partial<EmailVerificationRequestRepository>;

  const passwordService = {
    hash: vi.fn(),
    matches: vi.fn(),
    ...overrides?.passwordService,
  };

  const sessionRepository = {
    createSession: vi.fn(),
    listActiveSessions: vi.fn(),
    revokeRefreshLineage: vi.fn(),
    revokeSession: vi.fn(),
    ...overrides?.sessionRepository,
  } satisfies Partial<SessionRepository>;

  const tokenService = {
    generateOpaqueRefreshToken: vi.fn(),
    hashOpaqueToken: vi.fn(),
    signAccessToken: vi.fn(),
    verifyAccessToken: vi.fn(),
    ...overrides?.tokenService,
  } satisfies Partial<TokenService>;

  const userRepository = {
    create: vi.fn(),
    deleteById: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    updateAuthorizationState: vi.fn(),
    updatePassword: vi.fn(),
    updateProfile: vi.fn(),
    updateVerificationStatus: vi.fn(),
    ...overrides?.userRepository,
  } satisfies Partial<UserRepository>;

  const verificationEmailService = {
    sendVerificationEmail: vi.fn(),
    ...overrides?.verificationEmailService,
  } satisfies Partial<VerificationEmailService>;

  return {
    emailVerificationRequestRepository,
    passwordService,
    service: new AuthService(
      emailVerificationRequestRepository as EmailVerificationRequestRepository,
      passwordService,
      sessionRepository as SessionRepository,
      tokenService as TokenService,
      userRepository as UserRepository,
      verificationEmailService as VerificationEmailService,
    ),
    sessionRepository,
    tokenService,
    userRepository,
    verificationEmailService,
  };
}

describe('auth verification delivery behavior', () => {
  const originalRequireVerifiedEmail = process.env.AUTH_REQUIRE_VERIFIED_EMAIL;
  const originalAccessSecret = process.env.JWT_ACCESS_SECRET;
  const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;

  beforeEach(() => {
    process.env.AUTH_REQUIRE_VERIFIED_EMAIL = 'true';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalRequireVerifiedEmail === undefined) {
      delete process.env.AUTH_REQUIRE_VERIFIED_EMAIL;
      return;
    }
    process.env.AUTH_REQUIRE_VERIFIED_EMAIL = originalRequireVerifiedEmail;

    if (originalAccessSecret === undefined) {
      delete process.env.JWT_ACCESS_SECRET;
    } else {
      process.env.JWT_ACCESS_SECRET = originalAccessSecret;
    }

    if (originalRefreshSecret === undefined) {
      delete process.env.JWT_REFRESH_SECRET;
    } else {
      process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
    }
  });

  it('does not create a session when signup delivery fails', async () => {
    const createdUser = {
      _id: 'user-1',
      displayName: 'Mailer Test',
      email: 'mailer@example.com',
      status: 'active' as const,
    };
    const invalidatePendingRequests = vi.fn().mockResolvedValue(undefined);
    const { service, sessionRepository, tokenService, userRepository, verificationEmailService } =
      buildService({
        emailVerificationRequestRepository: {
          invalidatePendingRequests,
        },
        tokenService: {
          generateOpaqueRefreshToken: vi.fn().mockReturnValue('token-1'),
          hashOpaqueToken: vi.fn().mockReturnValue('hashed-token-1'),
          signAccessToken: vi.fn().mockResolvedValue('access-token-1'),
        },
        userRepository: {
          create: vi.fn().mockResolvedValue(createdUser),
          deleteById: vi.fn().mockResolvedValue(undefined),
          findByEmail: vi.fn().mockResolvedValue(null),
        },
        verificationEmailService: {
          sendVerificationEmail: vi.fn().mockRejectedValue(new Error('smtp down')),
        },
      });

    await expect(
      service.signUp(createdUser.email, 'secret-pass', createdUser.displayName),
    ).rejects.toThrow(ServiceUnavailableException);

    expect(userRepository.create).toHaveBeenCalledOnce();
    expect(userRepository.deleteById).toHaveBeenCalledWith('user-1');
    expect(verificationEmailService.sendVerificationEmail).toHaveBeenCalledOnce();
    expect(invalidatePendingRequests).toHaveBeenCalledWith('user-1');
    expect(sessionRepository.createSession).not.toHaveBeenCalled();
    expect(tokenService.signAccessToken).not.toHaveBeenCalled();
  });

  it('preserves the delivery error when cleanup queries also fail', async () => {
    const createdUser = {
      _id: 'user-2',
      displayName: 'Broken Cleanup',
      email: 'broken-cleanup@example.com',
      status: 'active' as const,
    };

    const { service } = buildService({
      emailVerificationRequestRepository: {
        invalidatePendingRequests: vi
          .fn()
          .mockRejectedValue(new Error('cleanup invalidation failed')),
      },
      tokenService: {
        generateOpaqueRefreshToken: vi.fn().mockReturnValue('token-2'),
        hashOpaqueToken: vi.fn().mockReturnValue('hashed-token-2'),
      },
      userRepository: {
        create: vi.fn().mockResolvedValue(createdUser),
        deleteById: vi.fn().mockRejectedValue(new Error('cleanup delete failed')),
        findByEmail: vi.fn().mockResolvedValue(null),
      },
      verificationEmailService: {
        sendVerificationEmail: vi.fn().mockRejectedValue(new Error('smtp down')),
      },
    });

    await expect(
      service.signUp(createdUser.email, 'secret-pass', createdUser.displayName),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('keeps prior pending requests valid when resend delivery fails', async () => {
    const user = {
      _id: 'user-1',
      displayName: 'Mailer Test',
      email: 'mailer@example.com',
      emailVerified: false,
      status: 'active' as const,
    };
    const createPendingRequest = vi.fn().mockResolvedValue({ _id: 'request-1' });
    const deletePendingRequest = vi.fn().mockResolvedValue(undefined);
    const invalidateOtherPendingRequests = vi.fn().mockResolvedValue(undefined);
    const sendVerificationEmail = vi.fn().mockRejectedValue(new Error('smtp down'));

    const { service } = buildService({
      emailVerificationRequestRepository: {
        createPendingRequest,
        deletePendingRequest,
        invalidateOtherPendingRequests,
      },
      tokenService: {
        generateOpaqueRefreshToken: vi.fn().mockReturnValue('token-1'),
        hashOpaqueToken: vi.fn().mockReturnValue('hashed-token-1'),
      },
      userRepository: {
        findByEmail: vi.fn().mockResolvedValue(user),
      },
      verificationEmailService: {
        sendVerificationEmail,
      },
    });

    await expect(service.resendVerification(user.email)).rejects.toThrow('smtp down');

    expect(createPendingRequest).toHaveBeenCalledOnce();
    expect(deletePendingRequest).toHaveBeenCalledWith('request-1');
    expect(invalidateOtherPendingRequests).not.toHaveBeenCalled();
  });

  it('invalidates older pending requests only after a resend succeeds', async () => {
    const user = {
      _id: 'user-1',
      displayName: 'Mailer Test',
      email: 'mailer@example.com',
      emailVerified: false,
      status: 'active' as const,
    };
    const createPendingRequest = vi.fn().mockResolvedValue({ _id: 'request-1' });
    const invalidateOtherPendingRequests = vi.fn().mockResolvedValue(undefined);
    const sendVerificationEmail = vi.fn().mockResolvedValue(undefined);

    const { service } = buildService({
      emailVerificationRequestRepository: {
        createPendingRequest,
        invalidateOtherPendingRequests,
      },
      tokenService: {
        generateOpaqueRefreshToken: vi.fn().mockReturnValue('token-1'),
        hashOpaqueToken: vi.fn().mockReturnValue('hashed-token-1'),
      },
      userRepository: {
        findByEmail: vi.fn().mockResolvedValue(user),
      },
      verificationEmailService: {
        sendVerificationEmail,
      },
    });

    await expect(service.resendVerification(user.email)).resolves.toEqual({ ok: true });

    expect(createPendingRequest).toHaveBeenCalledOnce();
    expect(sendVerificationEmail).toHaveBeenCalledOnce();
    expect(invalidateOtherPendingRequests).toHaveBeenCalledWith('user-1', 'request-1');
    expect(
      createPendingRequest.mock.invocationCallOrder[0] <
        sendVerificationEmail.mock.invocationCallOrder[0],
    ).toBe(true);
    expect(
      sendVerificationEmail.mock.invocationCallOrder[0] <
        invalidateOtherPendingRequests.mock.invocationCallOrder[0],
    ).toBe(true);
  });
});
