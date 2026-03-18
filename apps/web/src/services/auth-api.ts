import { normalizeApiBaseUrl } from './api-base-url';

interface ApiSuccessEnvelope<TData> {
  success: true;
  data: TData;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    code?: 'FORBIDDEN' | 'MISSING_SCOPE' | 'NOT_FOUND';
    message?: string;
    status?: number;
  };
}

export type AuthorizationErrorCode = 'FORBIDDEN' | 'MISSING_SCOPE' | 'NOT_FOUND';

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly code: AuthorizationErrorCode,
    readonly status?: number,
  ) {
    super(message);
  }
}

interface SessionUser {
  accountVisibility?: 'public' | 'private';
  id?: string;
  email: string;
  displayName: string;
  role?: 'admin' | 'moderator' | 'user';
  status?: 'active' | 'suspended' | 'deleted';
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export interface SessionInfo {
  id: string;
  deviceLabel: string;
  isCurrent: boolean;
  lastActivityAt: string;
}

export interface VisibleMediaItem {
  id: string;
  ownerUserId: string;
  publicId: string;
  secureUrl: string;
  accountVisibility?: 'public' | 'private';
  status: 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';
}

interface SignInPayload {
  email: string;
  password: string;
}

interface SignUpPayload {
  displayName: string;
  email: string;
  password: string;
}

interface EmailPayload {
  email: string;
}

interface VerifyEmailPayload {
  token: string;
}

interface PasswordResetConfirmPayload {
  token: string;
  newPassword: string;
}

type SignUpResult = SessionUser | AuthSession;

const DEFAULT_API_BASE_URL = normalizeApiBaseUrl();

export class AuthApi {
  private accessToken: string | null = null;

  constructor(private readonly baseUrl = DEFAULT_API_BASE_URL) {}

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  async signIn(payload: SignInPayload): Promise<AuthSession> {
    return this.request<AuthSession>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async signUp(payload: SignUpPayload): Promise<SignUpResult> {
    return this.request<SignUpResult>('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async verifyEmail(payload: VerifyEmailPayload): Promise<{ ok: true }> {
    return this.request<{ ok: true }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resendVerification(payload: EmailPayload): Promise<{ ok: true }> {
    return this.request<{ ok: true }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async passwordResetRequest(payload: EmailPayload): Promise<{ ok: true }> {
    return this.request<{ ok: true }>('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async passwordResetConfirm(payload: PasswordResetConfirmPayload): Promise<{ ok: true }> {
    return this.request<{ ok: true }>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listSessions(): Promise<SessionInfo[]> {
    return this.request<SessionInfo[]>('/auth/sessions', {
      method: 'GET',
    });
  }

  async revokeSession(sessionId: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async revokeOtherSessions(currentSessionId?: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>('/auth/sessions', {
      method: 'DELETE',
      body: JSON.stringify({ currentSessionId }),
    });
  }

  async listVisibleMedia(): Promise<VisibleMediaItem[]> {
    return this.request<VisibleMediaItem[]>('/media', {
      method: 'GET',
    });
  }

  async uploadMedia(filename: string): Promise<VisibleMediaItem> {
    return this.request<VisibleMediaItem>('/media', {
      method: 'POST',
      body: JSON.stringify({ filename }),
    });
  }

  private async request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    let payload: ApiSuccessEnvelope<TResponse> | ApiErrorEnvelope | undefined;
    try {
      payload = (await response.json()) as ApiSuccessEnvelope<TResponse> | ApiErrorEnvelope;
    } catch {
      payload = undefined;
    }

    if (!response.ok) {
      if (payload && 'error' in payload && payload.error?.code && payload.error?.message) {
        throw new AuthorizationError(
          payload.error.message,
          payload.error.code,
          payload.error.status,
        );
      }
      if (payload && 'error' in payload && payload.error?.message) {
        throw new Error(payload.error.message);
      }
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (!payload || !('success' in payload) || payload.success !== true) {
      throw new Error('Unexpected API response format');
    }

    return payload.data;
  }
}

export function isAuthorizationDeniedError(error: unknown): error is AuthorizationError {
  return (
    error instanceof AuthorizationError &&
    (error.code === 'FORBIDDEN' || error.code === 'NOT_FOUND' || error.code === 'MISSING_SCOPE')
  );
}
