# Quickstart - Authorization and Permission Framework

## Prerequisites

- Node.js 20+
- pnpm 9+
- MongoDB available for the API app
- Optional: Playwright browsers installed for web E2E
- Optional: k6 installed for performance validation

## Install workspace dependencies

```bash
pnpm install
```

## Start local services

API:

```bash
pnpm --filter api dev
```

Web:

```bash
pnpm --filter web dev
```

Mobile:

```bash
pnpm --filter mobile start
```

## Implementation prerequisites to validate first

1. Align current auth/session transport drift inherited from feature `002`:
   - API sign-out and session-revocation expectations must match web/mobile client behavior.
2. Harden media ownership resolution:
   - protected media actions must derive ownership from authenticated server-side context rather than request-supplied `ownerUserId`.
3. Introduce explicit service-principal auth context for internal-scope checks:
   - internal scope validation must not reuse the current user-only JWT payload shape unchanged.

## Expected implementation verification sequence

### 1. API quality gates

```bash
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api test authorization.contract.spec.ts authorization-foundation.integration.spec.ts authorization-visibility.contract.spec.ts authorization-visibility.integration.spec.ts authorization-rbac.contract.spec.ts authorization-rbac.integration.spec.ts authorization-scopes.contract.spec.ts internal-scope.integration.spec.ts clean-architecture.spec.ts
```

Expected evidence:

- contract tests cover allow/deny behavior for owner, non-owner, moderator, admin, and internal-scope callers
- integration tests verify visibility filtering and audit event creation

### 2. Web and mobile client verification

```bash
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test auth-visibility-ownership.integration.test.tsx auth-rbac.integration.test.tsx
pnpm --filter mobile lint
pnpm --filter mobile typecheck
pnpm --filter mobile test auth-visibility-ownership.integration.test.ts auth-rbac.integration.test.ts
```

Expected evidence:

- filtered resource lists do not reveal unauthorized resources
- denied actions present stable error states without leaking policy details
- loading, empty, error, and success states remain consistent with existing auth/media flows

### 3. Web end-to-end checks

```bash
pnpm --filter web test:e2e
```

Expected scenarios:

- first-slice browser coverage should focus on currently reachable authorization surfaces (media first, then profile/account visibility once those routes land) until post/comment UI flows exist
- owner can update/delete owned content
- regular user cannot update/delete another user’s content
- private-account resources are not viewable to unauthorized users
- moderator can perform moderation actions but not admin-only actions
- admin override actions succeed and generate audit records

### 4. Performance validation

Existing baselines:

```bash
pnpm perf:auth
k6 run infra/perf/media-list.k6.js
```

Authorization-specific validation to add during implementation:

```bash
k6 run infra/perf/authorization-policy.k6.js
```

Expected performance evidence:

- authorization decision latency p95 remains under 200ms inside protected request handling
- protected request latency p95 remains under 1s under normal load
- role/scope changes are enforced on subsequent protected requests within 1 minute

## Manual acceptance checklist

### User Story 1 - Visibility and ownership

1. Create two regular users: `owner` and `viewer`.
2. Set the owner account to `public` and confirm the viewer can read public profile/content.
3. Switch the owner account to `private` and confirm the viewer can no longer read private content.
4. Confirm the owner can still manage owned post/comment/media resources.
5. Confirm the viewer cannot mutate the owner’s post/comment/media resources.

### User Story 2 - Staff RBAC

1. Assign one user the `moderator` role and another the `admin` role.
2. Confirm moderator moderation actions succeed on protected content.
3. Confirm moderator attempts at admin-only actions are denied.
4. Confirm admin platform-level role/visibility management actions succeed.
5. Confirm privileged success, privileged denial, and override actions create audit events.

### User Story 3 - Internal API scopes

1. Call an internal endpoint with the declared required scope and confirm success.
2. Call the same endpoint with missing, expired, or revoked scopes and confirm denial.
3. Confirm unrelated scopes do not grant access.
4. Confirm identical requests through different API entry paths resolve to the same authorization decision.
