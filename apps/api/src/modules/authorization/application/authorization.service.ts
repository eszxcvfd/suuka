import { Injectable } from '@nestjs/common';
import type { AuthorizationDecision, AuthorizationPrincipal } from '@suuka/shared-types';
import { AuthorizationEvaluationContext, PERMISSION_RULES, deny } from '../domain/permission-rule';

const ROLE_PERMISSION_MATRIX: Record<
  'admin' | 'moderator' | 'user',
  AuthorizationEvaluationContext['action'][]
> = {
  admin: [
    'account:visibility:update',
    'internal:accounts:write',
    'internal:moderation:read',
    'media:delete',
    'media:list',
    'media:update',
    'profile:read',
    'profile:update',
    'role:assign',
  ],
  moderator: [
    'internal:moderation:read',
    'media:delete',
    'media:list',
    'media:update',
    'profile:read',
    'profile:update',
  ],
  user: [
    'account:visibility:update',
    'media:list',
    'media:update',
    'profile:read',
    'profile:update',
  ],
};

@Injectable()
export class AuthorizationService {
  evaluate(
    principal: AuthorizationPrincipal,
    context: AuthorizationEvaluationContext,
  ): AuthorizationDecision {
    if (principal.status !== 'active') {
      return deny('SUSPENDED_PRINCIPAL');
    }

    const rule = PERMISSION_RULES[context.action];
    if (!rule) {
      return deny('DEFAULT_DENY');
    }

    if (principal.principalType === 'internal_service') {
      const requiredScopes = context.requiredScopes ?? rule.requiredScopes ?? [];
      const hasScopes = requiredScopes.every((scope) => principal.scopes.includes(scope));
      return hasScopes
        ? { allowed: true, reasonCode: 'ACTIVE_SCOPE_REQUIRED', requiredScopes }
        : deny('ACTIVE_SCOPE_REQUIRED', requiredScopes);
    }

    if (
      !principal.role ||
      !rule.allowedRoles.includes(principal.role) ||
      !ROLE_PERMISSION_MATRIX[principal.role].includes(context.action)
    ) {
      return deny('ROLE_REQUIRED', context.requiredScopes ?? []);
    }

    if (rule.requiresOwnership && context.ownerUserId && context.ownerUserId !== principal.userId) {
      if (principal.role === 'admin' && rule.allowsAdminOverride) {
        return { allowed: true, reasonCode: 'ADMIN_OVERRIDE', requiredScopes: [] };
      }

      if (principal.role === 'moderator' && rule.allowsModeratorOverride) {
        return { allowed: true, reasonCode: 'ADMIN_OVERRIDE', requiredScopes: [] };
      }

      return deny('OWNER_REQUIRED');
    }

    if (
      context.visibility === 'private' &&
      context.ownerUserId !== principal.userId &&
      principal.role === 'user'
    ) {
      return deny('ACCOUNT_PRIVATE');
    }

    return {
      allowed: true,
      reasonCode: 'ACTIVE_SCOPE_REQUIRED',
      requiredScopes: context.requiredScopes ?? rule.requiredScopes ?? [],
    };
  }
}
