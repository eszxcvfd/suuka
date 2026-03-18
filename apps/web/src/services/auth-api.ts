interface ApiSuccessEnvelope<TData> {
  success: true;
  data: TData;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    message?: string;
    status?: number;
  };
}

interface SessionUser {
  id?: string;
  email: string;
  displayName: string;
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

const DEFAULT_API_BASE_URL = '/v1';

export class AuthApi {
  constructor(private readonly baseUrl = DEFAULT_API_BASE_URL) {}

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

  private async request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
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
