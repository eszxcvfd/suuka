export type UserStatus = 'active' | 'suspended' | 'deleted';
export type MediaStatus = 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  status: UserStatus;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface SessionInfo {
  id: string;
  deviceLabel: string;
  isCurrent: boolean;
  lastActivityAt: string;
}

export type RefreshCredentialState = 'active' | 'replaced' | 'revoked' | 'expired';
export type EmailVerificationStatus = 'pending' | 'completed' | 'expired' | 'invalidated';
export type PasswordResetStatus = 'pending' | 'consumed' | 'expired' | 'invalidated';

export type AuthLifecycleAction =
  | 'register'
  | 'sign_in'
  | 'sign_out'
  | 'refresh'
  | 'verify_email'
  | 'password_reset'
  | 'session_revoke';

export interface EmailVerificationRequest {
  id: string;
  userId: string;
  status: EmailVerificationStatus;
  expiresAt: string;
}

export interface PasswordResetRequest {
  id: string;
  userId: string;
  status: PasswordResetStatus;
  expiresAt: string;
}

export interface MediaAsset {
  id: string;
  ownerUserId: string;
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  status: MediaStatus;
}
