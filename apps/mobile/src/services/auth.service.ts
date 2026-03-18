import { ApiClient } from './api-client';

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

interface SessionUser {
  id?: string;
  email: string;
  displayName?: string;
  status?: 'active' | 'suspended' | 'deleted';
}

interface SignInResponse {
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

export class AuthService {
  constructor(private readonly apiClient: ApiClient) {}

  async signIn(payload: SignInPayload): Promise<SignInResponse> {
    const session = await this.apiClient.post<SignInResponse>('/auth/sign-in', payload);
    this.apiClient.setAccessToken(session.accessToken);
    return session;
  }

  async signUp(payload: SignUpPayload): Promise<SessionUser> {
    return this.apiClient.post<SessionUser>('/auth/sign-up', payload);
  }

  async verifyEmail(payload: VerifyEmailPayload): Promise<{ ok: true }> {
    return this.apiClient.post<{ ok: true }>('/auth/verify-email', payload);
  }

  async resendVerification(payload: EmailPayload): Promise<{ ok: true }> {
    return this.apiClient.post<{ ok: true }>('/auth/resend-verification', payload);
  }

  async passwordResetRequest(payload: EmailPayload): Promise<{ ok: true }> {
    return this.apiClient.post<{ ok: true }>('/auth/password-reset/request', payload);
  }

  async passwordResetConfirm(payload: PasswordResetConfirmPayload): Promise<{ ok: true }> {
    return this.apiClient.post<{ ok: true }>('/auth/password-reset/confirm', payload);
  }

  async listSessions(): Promise<SessionInfo[]> {
    return this.apiClient.get<SessionInfo[]>('/auth/sessions');
  }

  async revokeSession(sessionId: string): Promise<{ ok: true }> {
    return this.apiClient.delete<{ ok: true }>(`/auth/sessions/${sessionId}`);
  }

  async revokeOtherSessions(currentSessionId?: string): Promise<{ ok: true }> {
    return this.apiClient.delete<{ ok: true }>(
      currentSessionId ? `/auth/sessions?currentSessionId=${encodeURIComponent(currentSessionId)}` : '/auth/sessions',
    );
  }

  signOut(): void {
    this.apiClient.setAccessToken(null);
  }
}
