# Phase 0 Research - Authorization and Permission Framework

## Decision 1: Centralize authorization in a dedicated NestJS module

- Decision: Add a dedicated `authorization` module with policy services, metadata decorators, and guards that compose with the existing JWT authentication flow.
- Rationale: The current `JwtAuthGuard` only authenticates bearer tokens, while media/auth controllers contain no reusable authorization orchestration. Centralizing policy evaluation keeps decisions deterministic and avoids controller-by-controller drift.
- Alternatives considered:
  - Inline controller checks: quicker initially, but violates FR-015 and becomes unmaintainable across API surfaces.
  - Embedding authorization inside `AuthService`: couples request-time authorization to lifecycle logic and weakens reuse for media/internal APIs.

## Decision 2: Represent role and visibility as persistent user-account state, not token-only claims

- Decision: Persist the baseline role assignment and account visibility on the user/account record (or an embedded equivalent in the same aggregate) and resolve them at authorization time for protected requests.
- Rationale: Feature `003` requires role and visibility changes to take effect within a one-minute revocation window. Persisted state with request-time lookup prevents stale JWT claims from extending outdated privileges.
- Alternatives considered:
  - Role/visibility in long-lived JWT claims only: faster reads, but demotions and privacy changes would propagate too slowly.
  - Separate role table with mandatory join on every request: flexible, but unnecessary complexity for the current three-role baseline.

## Decision 3: Compose authorization as RBAC + policy + ownership with default-deny semantics

- Decision: Use a three-stage evaluation model: baseline role permission matrix, resource visibility policy, then ownership or override checks, with explicit allow rules and default deny everywhere else.
- Rationale: The feature combines staff permissions, public/private account rules, and owner-only mutations. A layered evaluator matches the spec directly and makes reasons for allow/deny explicit without leaking sensitive details to clients.
- Alternatives considered:
  - Pure RBAC only: cannot express owner-only mutations or private-account view rules.
  - Resource-only ABAC everywhere: flexible, but overcomplicated for the fixed admin/moderator/user matrix.

## Decision 4: Use resolver-based ownership and parent-visibility adapters for resource domains

- Decision: Define resource resolver interfaces for `post`, `comment`, and `media` so authorization can query owner, parent resource, and visibility context from each domain without hard-coding controller logic.
- Rationale: Media already exposes `ownerUserId`; posts and comments are not yet implemented locally. Resolver contracts let the authorization feature integrate media immediately and provide a stable pattern for future post/comment modules.
- Alternatives considered:
  - Big-bang creation of post/comment/media authorization logic together: blocked by missing modules and slows delivery.
  - One generic database table for all resources: adds abstraction before the resource domains exist and obscures parent-child policy rules.

## Decision 5: Enforce internal API scopes with endpoint metadata plus service-principal grants

- Decision: Require internal endpoints to declare scopes through metadata/decorators and validate those scopes against service-principal grants resolved from bearer-authenticated internal identities.
- Rationale: FR-012 through FR-014 require every internal endpoint to declare scopes and reject missing, expired, or revoked grants. Metadata-driven enforcement fits the NestJS guard model and keeps declaration close to the protected route.
- Alternatives considered:
  - Prefix-based scope inference from URL paths: easier to bootstrap, but not explicit enough for auditability or mixed-scope endpoints.
  - Reusing user-role logic for internal services: conflates human and service identities and weakens least-privilege controls.

## Decision 6: Introduce explicit service-principal identity support for internal authorization

- Decision: Extend the authn/authz model so internal bearer tokens resolve to a service principal identity that carries `serviceName` plus persisted scope grants, instead of reusing the current user-only `{ sub, email }` payload shape.
- Rationale: The current guard and current-user decorator only model human users. Internal scope enforcement needs a first-class service identity so scope grants and audit events are attributable and deterministic.
- Alternatives considered:
  - Overloading user identities for internal callers: smaller short-term diff, but weak auditability and ambiguous authorization semantics.
  - Accepting unsigned or header-only service identity metadata: faster to prototype, but too weak for a security boundary.

## Decision 7: Persist authorization audit events in MongoDB

- Decision: Replace or supplement in-memory audit arrays with persistent authorization audit events stored in MongoDB.
- Rationale: The current auth service keeps audit events in memory, which is insufficient for privileged-action, denied-attempt, and admin-override audit requirements. Persistent events are necessary for moderation/admin traceability and cross-instance consistency.
- Alternatives considered:
  - Keep in-memory audit events only: loses records on restart and fails audit expectations.
  - Introduce a separate event pipeline immediately: stronger long term, but unnecessary for the first authorization slice.

## Decision 8: Make revocation-sensitive decisions request-time deterministic

- Decision: Evaluate role assignment, visibility policy, and internal scope grants against current persisted state on each protected request, and treat cached/session artifacts as optimization hints only.
- Rationale: The specification requires deterministic outcomes across entry paths and role/scope changes within one minute. Request-time resolution avoids stale authorization decisions after demotions, privacy changes, or grant revocations.
- Alternatives considered:
  - Cache all authorization context for access-token lifetime: better raw latency but violates the revocation window.
  - Full cache bypass for every nested resource lookup: simplest behavior, but likely harms list/filter performance without selective caching.

## Decision 9: Preserve existing workspace conventions for validation, tests, and performance evidence

- Decision: Keep request/response schemas in `packages/validation`, shared role/scope/user-facing types in `packages/shared-types`, API contract tests in `apps/api/test/contract`, API integration tests in `apps/api/test/integration`, web/mobile integration tests in app-specific test folders, Playwright for web end-to-end checks, and k6 for protected-path performance budgets.
- Rationale: Feature `002` already established these conventions, and the repo contains matching test/perf structure today. Reusing them keeps planning and later implementation aligned with the constitution’s code quality, testing, UX, and performance gates.
- Alternatives considered:
  - API-only verification: too narrow for user-visible filtered states and client consistency.
  - Per-app schema duplication: faster locally, but increases drift risk across API/web/mobile authorization semantics.

## Decision 10: Treat current auth/session drift as an explicit dependency risk, not a hidden assumption

- Decision: Carry forward feature `002` as a dependency, but require implementation to reconcile contract/runtime mismatches in sign-out and session-revocation flows before using those flows as a trustworthy authorization substrate.
- Rationale: The current API/controller/client behavior is not fully aligned, and leaving that implicit would make 003 tasks underestimate prerequisite hardening work.
- Alternatives considered:
  - Assume feature `002` is fully complete: simpler planning, but misleading against current repo state.
  - Block all 003 work until a separate 002 cleanup feature lands: safer, but too rigid when most authorization work can proceed in parallel with targeted dependency fixes.
