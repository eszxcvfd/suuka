import { useMemo, useState } from 'react';
import { AuthApi, SessionInfo, VisibleMediaItem } from '../services/auth-api';

export interface SessionUser {
  accountVisibility?: 'public' | 'private';
  id?: string;
  email: string;
  displayName: string;
  role?: 'admin' | 'moderator' | 'user';
  status?: 'active' | 'suspended' | 'deleted';
}

export interface AuthState {
  mode:
    | 'signIn'
    | 'signUp'
    | 'forgotPassword'
    | 'resetPassword'
    | 'verifyEmail'
    | 'media'
    | 'sessions';
  sessions: SessionInfo[];
  isAuthenticated: boolean;
  deniedStaffActionMessage: string | null;
  user: SessionUser | null;
  setMode: (
    mode:
      | 'signIn'
      | 'signUp'
      | 'forgotPassword'
      | 'resetPassword'
      | 'verifyEmail'
      | 'media'
      | 'sessions',
  ) => void;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  loadMedia: () => Promise<VisibleMediaItem[]>;
  requestPasswordReset: (email: string) => Promise<void>;
  revokeOtherSessions: (currentSessionId?: string) => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  uploadMedia: (file: File) => Promise<VisibleMediaItem>;
  verifyEmail: (token: string) => Promise<void>;
}

const authApi = new AuthApi();

function normalizeDisplayName(displayName: string | undefined, email: string): string {
  if (displayName && displayName.trim().length > 0) {
    return displayName;
  }
  return email.split('@')[0] ?? email;
}

export function useAuthStore(): AuthState {
  const [mode, setMode] = useState<
    'signIn' | 'signUp' | 'forgotPassword' | 'resetPassword' | 'verifyEmail' | 'media' | 'sessions'
  >('signIn');
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [deniedStaffActionMessage] = useState<string | null>(null);

  const value = useMemo<AuthState>(
    () => ({
      mode,
      sessions,
      isAuthenticated: Boolean(user),
      deniedStaffActionMessage,
      user,
      setMode(
        nextMode:
          | 'signIn'
          | 'signUp'
          | 'forgotPassword'
          | 'resetPassword'
          | 'verifyEmail'
          | 'media'
          | 'sessions',
      ): void {
        setMode(nextMode);
      },
      async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
        if (!token || !newPassword) {
          throw new Error('Token and new password are required');
        }
        await authApi.passwordResetConfirm({ token, newPassword });
      },
      async requestPasswordReset(email: string): Promise<void> {
        if (!email) {
          throw new Error('Email is required');
        }
        await authApi.passwordResetRequest({ email });
      },
      async loadSessions(): Promise<void> {
        const nextSessions = await authApi.listSessions();
        setSessions(nextSessions);
      },
      async loadMedia(): Promise<VisibleMediaItem[]> {
        return authApi.listVisibleMedia();
      },
      async revokeOtherSessions(currentSessionId?: string): Promise<void> {
        await authApi.revokeOtherSessions(currentSessionId);
        const nextSessions = await authApi.listSessions();
        setSessions(nextSessions);
      },
      async revokeSession(sessionId: string): Promise<void> {
        await authApi.revokeSession(sessionId);
        const nextSessions = await authApi.listSessions();
        setSessions(nextSessions);
      },
      async resendVerification(email: string): Promise<void> {
        if (!email) {
          throw new Error('Email is required');
        }
        await authApi.resendVerification({ email });
      },
      async signUp(displayName: string, email: string, password: string): Promise<void> {
        if (!displayName || !email || !password) {
          throw new Error('Display name, email and password are required');
        }

        const sessionOrUser = await authApi.signUp({ displayName, email, password });
        const sessionUser = 'user' in sessionOrUser ? sessionOrUser.user : sessionOrUser;

        authApi.setAccessToken('accessToken' in sessionOrUser ? sessionOrUser.accessToken : null);

        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          displayName: normalizeDisplayName(sessionUser.displayName, sessionUser.email),
          accountVisibility: sessionUser.accountVisibility,
          role: sessionUser.role,
          status: sessionUser.status,
        });
        setMode('media');
      },
      async signIn(email: string, password: string): Promise<void> {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        const session = await authApi.signIn({ email, password });
        authApi.setAccessToken(session.accessToken);
        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName: normalizeDisplayName(session.user.displayName, session.user.email),
          accountVisibility: session.user.accountVisibility,
          role: session.user.role,
          status: session.user.status,
        });
        setMode('media');
      },
      signOut(): void {
        authApi.setAccessToken(null);
        setUser(null);
        setSessions([]);
        setMode('signIn');
      },
      async uploadMedia(file: File): Promise<VisibleMediaItem> {
        return authApi.uploadMedia(file.name);
      },
      async verifyEmail(token: string): Promise<void> {
        if (!token) {
          throw new Error('Verification token is required');
        }
        await authApi.verifyEmail({ token });
      },
    }),
    [deniedStaffActionMessage, mode, sessions, user],
  );

  return value;
}
