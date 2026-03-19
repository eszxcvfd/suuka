import { useMemo, useState } from 'react';
import {
  AuthApi,
  AuthorizationError,
  ProfileDetails,
  SessionInfo,
  UpdateAvatarPayload,
  UpdateProfilePayload,
  VisibleMediaItem,
} from '../services/auth-api';

export interface SessionUser {
  accountId?: string;
  accountVisibility?: 'public' | 'private';
  avatarMediaId?: string | null;
  avatarUrl?: string | null;
  bio?: string;
  externalLinks?: Array<{ id: string; label: string; url: string }>;
  id?: string;
  email: string;
  displayName: string;
  role?: 'admin' | 'moderator' | 'user';
  status?: 'active' | 'suspended' | 'deleted';
  username?: string;
}

export interface AuthState {
  mode:
    | 'signIn'
    | 'signUp'
    | 'forgotPassword'
    | 'resetPassword'
    | 'verifyEmail'
    | 'media'
    | 'profile'
    | 'sessions';
  sessions: SessionInfo[];
  isAuthenticated: boolean;
  deniedStaffActionMessage: string | null;
  profileError: string | null;
  isProfileLoading: boolean;
  profileSuccessMessage: string | null;
  user: SessionUser | null;
  setMode: (
    mode:
      | 'signIn'
      | 'signUp'
      | 'forgotPassword'
      | 'resetPassword'
      | 'verifyEmail'
      | 'media'
      | 'profile'
      | 'sessions',
  ) => void;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  loadProfileByAccountId: (accountId: string) => Promise<ProfileDetails>;
  loadSessions: () => Promise<void>;
  loadMedia: () => Promise<VisibleMediaItem[]>;
  requestPasswordReset: (email: string) => Promise<void>;
  revokeOtherSessions: (currentSessionId?: string) => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  saveProfile: (payload: UpdateProfilePayload) => Promise<void>;
  updateAvatar: (payload: UpdateAvatarPayload) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  uploadMedia: (file: File) => Promise<VisibleMediaItem>;
  verifyEmail: (token: string) => Promise<void>;
}

const authApi = new AuthApi();

function mapSessionUser(sessionUser: SessionUser): SessionUser {
  return {
    accountId: sessionUser.accountId ?? sessionUser.id,
    accountVisibility: sessionUser.accountVisibility,
    avatarMediaId: sessionUser.avatarMediaId ?? null,
    avatarUrl: sessionUser.avatarUrl ?? null,
    bio: sessionUser.bio ?? '',
    displayName: normalizeDisplayName(sessionUser.displayName, sessionUser.email),
    email: sessionUser.email,
    externalLinks: sessionUser.externalLinks ?? [],
    id: sessionUser.id,
    role: sessionUser.role,
    status: sessionUser.status,
    username: sessionUser.username,
  };
}

function normalizeDisplayName(displayName: string | undefined, email: string): string {
  if (displayName && displayName.trim().length > 0) {
    return displayName;
  }
  return email.split('@')[0] ?? email;
}

function toAuthFeedbackError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof AuthorizationError) {
    if (error.code === 'EMAIL_DELIVERY_UNAVAILABLE') {
      return new Error(
        'We could not send the verification email right now. Please try again in a moment.',
      );
    }

    return new Error(error.message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
}

export function useAuthStore(): AuthState {
  const [mode, setMode] = useState<
    | 'signIn'
    | 'signUp'
    | 'forgotPassword'
    | 'resetPassword'
    | 'verifyEmail'
    | 'media'
    | 'profile'
    | 'sessions'
  >('signIn');
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [deniedStaffActionMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState<string | null>(null);

  function mergeProfileDetails(
    profile: ProfileDetails,
    currentUser: SessionUser | null,
  ): SessionUser {
    return {
      accountId: profile.accountId,
      accountVisibility: profile.accountVisibility,
      avatarMediaId: profile.avatarMediaId ?? currentUser?.avatarMediaId ?? null,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      displayName: normalizeDisplayName(profile.displayName, currentUser?.email ?? ''),
      email: currentUser?.email ?? '',
      externalLinks: profile.externalLinks,
      id: currentUser?.id ?? profile.accountId,
      role: currentUser?.role,
      status: currentUser?.status,
      username: profile.username,
    };
  }

  const value = useMemo<AuthState>(
    () => ({
      mode,
      sessions,
      isAuthenticated: Boolean(user),
      deniedStaffActionMessage,
      isProfileLoading,
      profileError,
      profileSuccessMessage,
      user,
      setMode(
        nextMode:
          | 'signIn'
          | 'signUp'
          | 'forgotPassword'
          | 'resetPassword'
          | 'verifyEmail'
          | 'media'
          | 'profile'
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
      async loadProfile(): Promise<void> {
        setIsProfileLoading(true);
        try {
          const profile = await authApi.getProfile();
          setUser((currentUser) => mergeProfileDetails(profile, currentUser));
          setProfileError(null);
        } catch (error) {
          setProfileError(error instanceof Error ? error.message : 'Unable to load profile.');
          throw error;
        } finally {
          setIsProfileLoading(false);
        }
      },
      async loadProfileByAccountId(accountId: string): Promise<ProfileDetails> {
        setIsProfileLoading(true);
        try {
          const profile = await authApi.getProfileByAccountId(accountId);
          setProfileError(null);
          return profile;
        } catch (error) {
          if (error instanceof AuthorizationError && error.code === 'NOT_FOUND') {
            setProfileError('This profile is not available.');
          } else {
            setProfileError(error instanceof Error ? error.message : 'Unable to load profile.');
          }
          throw error;
        } finally {
          setIsProfileLoading(false);
        }
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

        try {
          await authApi.resendVerification({ email });
        } catch (error) {
          throw toAuthFeedbackError(error, 'Unable to resend verification');
        }
      },
      async saveProfile(payload: UpdateProfilePayload): Promise<void> {
        try {
          const profile = await authApi.updateProfile(payload);
          setUser((currentUser) => mergeProfileDetails(profile, currentUser));
          setProfileError(null);
          setProfileSuccessMessage('Profile saved successfully.');
        } catch (error) {
          if (error instanceof AuthorizationError && error.code === 'USERNAME_TAKEN') {
            setProfileError(error.message);
          } else {
            setProfileError(error instanceof Error ? error.message : 'Unable to save profile.');
          }
          setProfileSuccessMessage(null);
          throw error;
        }
      },
      async updateAvatar(payload: UpdateAvatarPayload): Promise<void> {
        try {
          const profile = await authApi.updateAvatar(payload);
          setUser((currentUser) => mergeProfileDetails(profile, currentUser));
          setProfileError(null);
          setProfileSuccessMessage('Avatar saved successfully.');
        } catch (error) {
          setProfileError(error instanceof Error ? error.message : 'Unable to save avatar.');
          setProfileSuccessMessage(null);
          throw error;
        }
      },
      async signUp(displayName: string, email: string, password: string): Promise<void> {
        if (!displayName || !email || !password) {
          throw new Error('Display name, email and password are required');
        }

        try {
          const sessionOrUser = await authApi.signUp({ displayName, email, password });
          const sessionUser = 'user' in sessionOrUser ? sessionOrUser.user : sessionOrUser;

          authApi.setAccessToken('accessToken' in sessionOrUser ? sessionOrUser.accessToken : null);

          setUser(mapSessionUser(sessionUser));
          setMode('media');
        } catch (error) {
          throw toAuthFeedbackError(error, 'Unable to sign up');
        }
      },
      async signIn(email: string, password: string): Promise<void> {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        try {
          const session = await authApi.signIn({ email, password });
          authApi.setAccessToken(session.accessToken);
          setUser(mapSessionUser(session.user));
          setMode('media');
        } catch (error) {
          if (error instanceof AuthorizationError && error.code === 'EMAIL_VERIFICATION_REQUIRED') {
            setMode('verifyEmail');
          }

          throw error;
        }
      },
      signOut(): void {
        authApi.setAccessToken(null);
        setUser(null);
        setSessions([]);
        setProfileError(null);
        setProfileSuccessMessage(null);
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
    [
      deniedStaffActionMessage,
      isProfileLoading,
      mode,
      profileError,
      profileSuccessMessage,
      sessions,
      user,
    ],
  );

  return value;
}
