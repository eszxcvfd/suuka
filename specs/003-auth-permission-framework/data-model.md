# Data Model - Authorization and Permission Framework

## PrincipalIdentity

- Purpose: Represents the acting caller for an authorization decision, either a human user or an internal service principal.
- Key fields:
  - `id`
  - `principalType` (`user`, `internal_service`)
  - `status` (`active`, `suspended`, `revoked`)
  - `userId` (nullable for service principals)
  - `serviceName` (nullable for end users)
  - `sessionId` (nullable)
  - `issuedScopes` (derived view for service principals)
- Validation rules:
  - Exactly one of `userId` or `serviceName` must be populated.
  - Suspended or revoked principals cannot pass protected mutations.

## RoleAssignment

- Purpose: Assigns a baseline human role for RBAC evaluation.
- Key fields:
  - `id`
  - `userId`
  - `role` (`admin`, `moderator`, `user`)
  - `active` (boolean)
  - `effectiveFrom`
  - `effectiveUntil` (nullable)
  - `changedBy` (nullable actor reference for audit)
- Validation rules:
  - Only one active baseline role assignment may exist per human principal.
  - Inactive or expired assignments must not be considered during authorization.
  - Repository implementation should store this as embedded or directly persisted user-account state rather than a separate collection unless later requirements justify normalization.

## AccountVisibilityPolicy

- Purpose: Defines whether an account’s content is publicly viewable or private by default.
- Key fields:
  - `accountId`
  - `visibility` (`public`, `private`)
  - `ownerUserId`
  - `updatedAt`
  - `updatedBy`
- Validation rules:
  - Every user account must have exactly one active visibility policy.
  - Policy changes apply to subsequent protected requests within the revocation window.

## ResourceOwnership

- Purpose: Describes the owning principal and parent context for an authorization-protected resource.
- Key fields:
  - `resourceType` (`post`, `comment`, `media`)
  - `resourceId`
  - `ownerUserId`
  - `accountId`
  - `parentResourceType` (nullable)
  - `parentResourceId` (nullable)
  - `visibilitySource` (`account`, `resource`, `parent_resource`)
  - `deletedAt` (nullable)
- Validation rules:
  - Every protected resource must resolve to one owner.
  - Child resources must resolve parent visibility when their own visibility is not authoritative.
  - Orphaned resources must be denied by default until ownership is repaired.

## PermissionRule

- Purpose: Declarative allow/deny rule mapping actions to roles and contextual requirements.
- Key fields:
  - `id`
  - `action` (examples: `profile:view`, `post:update`, `comment:delete`, `media:moderate`, `role:manage`)
  - `resourceType`
  - `allowedRoles`
  - `requiresOwnership` (boolean)
  - `allowsAdminOverride` (boolean)
  - `allowsModeratorOverride` (boolean)
  - `requiredVisibilityStates`
  - `effect` (`allow`, `deny`)
- Validation rules:
  - Protected actions default to deny when no matching explicit allow exists.
  - Moderator overrides must never grant admin-only operations.
  - Rules must be deterministic for the same principal, action, and resource context.

## ApiScopeGrant

- Purpose: Grants internal services the scopes required to call protected internal endpoints.
- Key fields:
  - `id`
  - `servicePrincipalId`
  - `scope`
  - `state` (`active`, `revoked`, `expired`)
  - `issuedAt`
  - `expiresAt`
  - `revokedAt` (nullable)
  - `revokedBy` (nullable)
- Validation rules:
  - Internal endpoints require at least one declared scope.
  - Authorization succeeds only when all required scopes are active and unexpired.
  - Revoked grants must be rejected on subsequent protected requests within the revocation window.

## AuthorizationAuditEvent

- Purpose: Immutable record for privileged actions, denied privileged attempts, moderation actions, and administrative overrides.
- Key fields:
  - `id`
  - `actorPrincipalId`
  - `actorRole` (nullable for service principals)
  - `targetPrincipalId` (nullable)
  - `action`
  - `resourceType` (nullable)
  - `resourceId` (nullable)
  - `decision` (`allowed`, `denied`, `override_allowed`)
  - `reasonCode`
  - `scopesEvaluated`
  - `createdAt`
  - `requestPath`
- Validation rules:
  - Audit events are append-only and must survive process restarts.
  - Privileged success, privileged denial, and override events are mandatory.
  - Denial reasons persisted for operators must map to non-revealing client-facing errors.

## Relationships

- `PrincipalIdentity` 1 - 0..1 active `RoleAssignment` for human users
- `AccountVisibilityPolicy` 1 - 1 user account
- `PrincipalIdentity` 1 - N `ApiScopeGrant` for internal services
- `PrincipalIdentity` 1 - N `AuthorizationAuditEvent`
- `ResourceOwnership` links protected resources to `AccountVisibilityPolicy` and `PrincipalIdentity`
- `PermissionRule` is evaluated against `RoleAssignment`, `AccountVisibilityPolicy`, `ResourceOwnership`, and `ApiScopeGrant`

## State Transitions

- Role assignment:
  - `active -> inactive` on demotion, suspension, or explicit replacement.
- Account visibility:
  - `public <-> private` on owner or admin policy changes.
- Scope grant:
  - `active -> revoked` on admin/service-owner action.
  - `active -> expired` on time boundary.
- Authorization decision outcome:
  - `allow` when explicit role/scope rule passes and context requirements are satisfied.
  - `deny` when any required role, visibility, ownership, or scope check fails.
  - `override_allowed` when an explicit moderator/admin override is used and audited.

## Planned Existing-Model Extensions

- `UserModel` should gain a persisted baseline `role` and `accountVisibility` field or equivalent backing relationship.
- Internal service authentication should introduce a service-principal representation that can resolve persisted scope grants during authorization.
- `MediaAsset` already exposes `ownerUserId`; its authorization resolver should also expose account/parent visibility context.
- `MediaController` and `MediaService` should stop trusting caller-supplied `ownerUserId`; ownership should resolve from authenticated server-side context before policy evaluation.
- Future `Post` and `Comment` models should expose the same ownership contract as `MediaAsset` so policy checks remain generic.
