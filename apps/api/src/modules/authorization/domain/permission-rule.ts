import type {
  AccountVisibility,
  AuthorizationDecision,
  AuthorizationPrincipal,
  AuthorizationRole,
} from '@suuka/shared-types';

export type AuthorizationAction =
  | 'account:visibility:update'
  | 'internal:accounts:write'
  | 'internal:moderation:read'
  | 'media:delete'
  | 'media:list'
  | 'media:update'
  | 'profile:read'
  | 'profile:update'
  | 'role:assign';

export interface PermissionRule {
  action: AuthorizationAction;
  allowedRoles: AuthorizationRole[];
  allowedVisibilities?: AccountVisibility[];
  allowsAdminOverride: boolean;
  allowsModeratorOverride: boolean;
  requiredScopes?: string[];
  requiresOwnership: boolean;
}

export interface AuthorizationEvaluationContext {
  action: AuthorizationAction;
  ownerUserId?: string;
  requiredScopes?: string[];
  visibility?: AccountVisibility;
}

export const PERMISSION_RULES: Record<AuthorizationAction, PermissionRule> = {
  'account:visibility:update': {
    action: 'account:visibility:update',
    allowedRoles: ['admin', 'moderator', 'user'],
    allowsAdminOverride: true,
    allowsModeratorOverride: false,
    requiresOwnership: true,
  },
  'internal:accounts:write': {
    action: 'internal:accounts:write',
    allowedRoles: ['admin'],
    allowsAdminOverride: false,
    allowsModeratorOverride: false,
    requiredScopes: ['accounts:write'],
    requiresOwnership: false,
  },
  'internal:moderation:read': {
    action: 'internal:moderation:read',
    allowedRoles: ['admin', 'moderator'],
    allowsAdminOverride: false,
    allowsModeratorOverride: false,
    requiredScopes: ['moderation:read'],
    requiresOwnership: false,
  },
  'media:delete': {
    action: 'media:delete',
    allowedRoles: ['admin', 'moderator', 'user'],
    allowsAdminOverride: true,
    allowsModeratorOverride: true,
    requiresOwnership: true,
  },
  'media:list': {
    action: 'media:list',
    allowedRoles: ['admin', 'moderator', 'user'],
    allowedVisibilities: ['public', 'private'],
    allowsAdminOverride: true,
    allowsModeratorOverride: true,
    requiresOwnership: false,
  },
  'media:update': {
    action: 'media:update',
    allowedRoles: ['admin', 'moderator', 'user'],
    allowsAdminOverride: true,
    allowsModeratorOverride: true,
    requiresOwnership: true,
  },
  'profile:read': {
    action: 'profile:read',
    allowedRoles: ['admin', 'moderator', 'user'],
    allowedVisibilities: ['public', 'private'],
    allowsAdminOverride: true,
    allowsModeratorOverride: true,
    requiresOwnership: false,
  },
  'profile:update': {
    action: 'profile:update',
    allowedRoles: ['admin', 'moderator', 'user'],
    allowsAdminOverride: true,
    allowsModeratorOverride: true,
    requiresOwnership: true,
  },
  'role:assign': {
    action: 'role:assign',
    allowedRoles: ['admin'],
    allowsAdminOverride: false,
    allowsModeratorOverride: false,
    requiresOwnership: false,
  },
};

export function deny(
  reasonCode: AuthorizationDecision['reasonCode'],
  requiredScopes: string[] = [],
): AuthorizationDecision {
  return {
    allowed: false,
    reasonCode,
    requiredScopes,
  };
}

export function isPrivilegedRole(principal: AuthorizationPrincipal): boolean {
  return principal.role === 'admin' || principal.role === 'moderator';
}
