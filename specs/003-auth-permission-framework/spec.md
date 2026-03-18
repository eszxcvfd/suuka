# Feature Specification: Authorization and Permission Framework

**Feature Branch**: `003-auth-permission-framework`  
**Created**: 2026-03-18  
**Status**: Draft  
**Input**: User description: "Tôi muốn: Xây dựng authorization và permission framework; Mục tiêu: Quản lý ai được xem/chỉnh sửa cái gì; Phạm vi: RBAC cho admin/moderator/user, policy layer cho private/public account, ownership checks cho post/comment/media, scope cho internal APIs"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Enforce visibility and ownership for end users (Priority: P1)

As a signed-in user, I can view and edit only the content I am allowed to access based on account
visibility (public/private) and resource ownership rules.

**Why this priority**: This is the core safety boundary for daily product usage and directly prevents
unauthorized reading or editing.

**Independent Test**: Can be fully tested by creating owner and non-owner users, setting account
visibility states, then validating allowed/denied view and edit actions for post, comment, and media.

**Acceptance Scenarios**:

1. **Given** a user owns a post/comment/media resource, **When** that user attempts to edit or
   delete the resource, **Then** the action is allowed.
2. **Given** a regular user does not own a post/comment/media resource, **When** that user attempts
   to edit or delete the resource, **Then** the action is denied.
3. **Given** an account is public, **When** another regular user requests view access to the
   account's public profile and content, **Then** view access is allowed.
4. **Given** an account is private, **When** a non-owner regular user requests view access,
   **Then** view access is denied.

---

### User Story 2 - Apply role-based staff permissions (Priority: P2)

As a platform operator, I can rely on clear role boundaries so admin and moderator actions are
enforced consistently and regular users cannot perform staff actions.

**Why this priority**: RBAC is required for operational safety and trust, but depends on baseline
ownership and visibility controls from P1.

**Independent Test**: Can be tested by executing a fixed permission matrix for admin,
moderator, and user roles across representative actions (view, edit, moderate, manage roles).

**Acceptance Scenarios**:

1. **Given** a user with moderator role, **When** performing moderation actions on content,
   **Then** moderation actions are allowed and non-moderation admin-only actions are denied.
2. **Given** a user with admin role, **When** performing platform-level management actions,
   **Then** the actions are allowed.
3. **Given** a regular user role, **When** attempting moderator or admin actions,
   **Then** the actions are denied.

---

### User Story 3 - Restrict internal API usage by scope (Priority: P3)

As a service owner, I can ensure each internal API consumer can call only the operations explicitly
granted to it via scopes.

**Why this priority**: Scope controls reduce lateral risk between services and prevent privilege
bleed across internal integrations.

**Independent Test**: Can be tested by calling internal APIs using identities with valid, missing,
and insufficient scopes and verifying consistent allow/deny outcomes.

**Acceptance Scenarios**:

1. **Given** an internal caller has the required scope for an endpoint, **When** it calls that
   endpoint, **Then** the request is allowed.
2. **Given** an internal caller lacks a required scope, **When** it calls that endpoint,
   **Then** the request is denied.
3. **Given** an internal caller has unrelated scopes, **When** it calls an endpoint outside those
   scopes, **Then** the request is denied.

### Edge Cases

- Account visibility changes from public to private while existing viewers are browsing content.
- Ownership transfer, deletion, or orphaned resources leave unclear owner state.
- Role changes (promotion, demotion, suspension) occur during active sessions.
- Moderator attempts actions that should remain admin-only.
- Admin override is used on private resources and must remain auditable.
- Internal clients reuse stale credentials after scope revocation.
- Nested resources (comments/media on a private post) have conflicting parent and child visibility.
- Concurrent updates attempt to bypass ownership checks through request tampering.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST define and enforce three baseline user roles: admin, moderator, and user.
- **FR-002**: System MUST apply default-deny behavior for protected actions unless an explicit allow rule exists.
- **FR-003**: System MUST maintain a documented permission matrix for role-based actions.
- **FR-004**: System MUST enforce account visibility policies for public and private accounts.
- **FR-005**: System MUST allow the account owner to view and manage their own account and owned resources regardless of public/private setting.
- **FR-006**: System MUST deny non-owner regular users from viewing private account content.
- **FR-007**: System MUST enforce ownership checks for post, comment, and media resources on update and deletion actions.
- **FR-008**: System MUST deny non-owner regular users from modifying resources they do not own.
- **FR-009**: System MUST allow moderators to perform only predefined moderation actions and deny moderator access to admin-only operations.
- **FR-010**: System MUST allow admins to perform all role-governed operations, including role management.
- **FR-011**: System MUST ensure that role changes take effect for subsequent protected requests within the defined revocation window.
- **FR-012**: System MUST require every internal API endpoint to declare at least one required scope.
- **FR-013**: System MUST allow internal API access only when the caller has all required scopes.
- **FR-014**: System MUST deny internal API access when scopes are missing, expired, or revoked.
- **FR-015**: System MUST return consistent authorization outcomes for identical inputs regardless of endpoint entry path.
- **FR-016**: System MUST capture audit records for privileged actions, denied privileged attempts, and administrative overrides.
- **FR-017**: System MUST apply visibility and ownership filters to list and search responses so unauthorized resources are not disclosed.
- **FR-018**: System MUST provide non-revealing denial responses that do not leak sensitive authorization details.

### Quality Requirements _(mandatory)_

- **QR-001 Code Quality**: Changes MUST meet agreed linting, formatting, and static-analysis checks.
- **QR-002 Testing Standards**: Behavior changes MUST include automated tests that fail before implementation and pass after implementation.
- **QR-003 UX Consistency**: User-facing behavior MUST define consistent interaction states (loading, empty, error, success) and accessibility expectations.
- **QR-004 Performance Requirements**: Critical user journeys MUST include measurable performance targets (for example latency, responsiveness, or throughput).
- **QR-005 Authorization Determinism**: Authorization decisions for equivalent requests MUST be reproducible and consistent across services.

### Key Entities _(include if feature involves data)_

- **PrincipalIdentity**: The acting identity (end user or internal service) used for authorization evaluation.
- **RoleAssignment**: The role mapping (admin/moderator/user) associated with a principal and its active status.
- **AccountVisibilityPolicy**: Rule set that defines whether account data is public or private and who can view it.
- **ResourceOwnership**: Ownership mapping between a principal and post/comment/media resources.
- **PermissionRule**: Declarative rule that maps role, action, and resource context to allow/deny outcomes.
- **ApiScopeGrant**: Internal service scope grants used to authorize internal endpoint access.
- **AuthorizationAuditEvent**: Immutable record of privileged access decisions and override events.

## Assumptions

- Existing authentication already provides a reliable acting identity for end users; internal service callers will require explicit service-principal identity support as part of this feature.
- Private account behavior in this scope means non-owner regular users cannot view private content unless explicitly allowed by future features outside this scope.
- Moderator access to private content is limited to moderation responsibilities and remains auditable.
- Internal API scope governance applies only to internal service-to-service endpoints, not public user-facing endpoints.

## Dependencies

- Authentication lifecycle capabilities from `002-account-auth-lifecycle` are available for identity context.
- Post/comment/media domains expose ownership metadata needed for policy evaluation.
- Internal API inventory is available to map each endpoint to required scope(s).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of protected actions have documented allow/deny behavior for admin, moderator, and user roles.
- **SC-002**: 100% of non-owner regular-user modification attempts on post/comment/media are denied in acceptance testing.
- **SC-003**: 100% of private-account view attempts by non-owner regular users are denied in acceptance testing.
- **SC-004**: At least 95% of authorization decisions complete within 1 second during normal operating load.
- **SC-005**: Role, visibility, and internal scope changes are enforced on subsequent protected requests within 1 minute.
- **SC-006**: 100% of admin overrides and moderator enforcement actions are captured in audit records with actor, target, action, and outcome.
- **SC-007**: No critical-severity unauthorized access defects remain open at release readiness.
