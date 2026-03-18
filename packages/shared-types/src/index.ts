export type UserStatus = 'active' | 'suspended' | 'deleted';
export type MediaStatus = 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';
export type AuthorizationRole = 'admin' | 'moderator' | 'user';
export type AccountVisibility = 'public' | 'private';
export type AuthorizationPrincipalType = 'user' | 'internal_service';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  accountVisibility?: AccountVisibility;
  role?: AuthorizationRole;
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

export interface AuthorizationPrincipal {
  id: string;
  principalType: AuthorizationPrincipalType;
  email?: string;
  serviceName?: string;
  sessionId?: string;
  scopes: string[];
  role?: AuthorizationRole;
  accountVisibility?: AccountVisibility;
  status: UserStatus | 'revoked';
  userId?: string;
}

export interface AuthorizationDecision {
  allowed: boolean;
  reasonCode:
    | 'ACTIVE_SCOPE_REQUIRED'
    | 'ACCOUNT_PRIVATE'
    | 'ADMIN_OVERRIDE'
    | 'DEFAULT_DENY'
    | 'MISSING_PERMISSION_METADATA'
    | 'OWNER_REQUIRED'
    | 'ROLE_REQUIRED'
    | 'SUSPENDED_PRINCIPAL';
  requiredScopes: string[];
}

export interface AuthorizationAuditRecord {
  action: string;
  actorPrincipalId: string;
  actorRole?: AuthorizationRole;
  createdAt: string;
  decision: 'allowed' | 'denied' | 'override_allowed';
  reasonCode: AuthorizationDecision['reasonCode'];
  requestPath?: string;
  resourceId?: string;
  resourceType?: 'account' | 'comment' | 'internal' | 'media' | 'post';
  scopesEvaluated: string[];
  targetPrincipalId?: string;
}

export interface ServicePrincipalGrant {
  serviceName: string;
  scopes: string[];
  state: 'active' | 'expired' | 'revoked';
}
