# Implementation Plan: Authorization and Permission Framework

**Branch**: `003-auth-permission-framework` | **Date**: 2026-03-18 | **Spec**: `specs/003-auth-permission-framework/spec.md`
**Input**: Feature specification from `specs/003-auth-permission-framework/spec.md`

## Summary

Add a centralized authorization layer on top of the existing authentication stack so protected API
requests are evaluated consistently using RBAC, account visibility, ownership rules, and internal
API scopes. Implementation will extend the current NestJS auth/media structure, push shared policy
types into workspace packages, harden the current media ownership flow so ownership is derived from
authenticated server-side context, and reconcile auth contract/runtime drift from feature `002`
before treating existing session semantics as the authorization substrate.

## Technical Context

**Language/Version**: TypeScript 5.7 (workspace), NestJS 11 (API), React 19 (web), React Native 0.76 + Expo 52 (mobile)
**Primary Dependencies**: NestJS core/common/passport/jwt/mongoose, Mongoose, Zod validation package, shared types package
**Storage**: MongoDB via Mongoose for persistent identity/resource/audit state; current in-memory auth state is insufficient for authorization-critical decisions and should not remain the source of truth
**Testing**: Vitest (API contract/integration, web/mobile integration), Playwright (web E2E), k6 (performance validation)
**Target Platform**: Linux server API, modern web browsers, iOS/Android via Expo, internal service-to-service API consumers
**Project Type**: Monorepo with API, web, mobile, and shared workspace packages
**Performance Goals**: Authorization decision latency p95 < 200ms inside protected handlers, protected request p95 < 1s under normal load, revocation enforcement within 1 minute, denied unauthorized mutations = 100% in acceptance tests
**Constraints**: Default-deny for protected actions, deterministic decisions across entry paths, non-revealing denial responses, auditable admin/moderator overrides, incremental rollout over existing auth/media modules, no trust in caller-supplied ownership identifiers, reconcile current client/API auth transport drift before rollout
**Scale/Scope**: Authorization coverage for admin/moderator/user roles, private/public account policy, ownership checks for post/comment/media, and scope enforcement for internal APIs across API/web/mobile integrations

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Gate Review

- **Code Quality Gate**: PASS - plan keeps changes inside existing module/package boundaries and requires workspace lint, typecheck, and architecture test coverage.
- **Testing Gate**: PASS - plan requires fail-first API contract/integration tests plus web/mobile integration and web E2E validation for changed behavior.
- **UX Consistency Gate**: PASS - plan includes filtered/denied/loading/empty/success state validation for user-facing authorization outcomes.
- **Performance Gate**: PASS - measurable latency and revocation budgets are defined and validated with k6 plus protected-flow checks.
- **Simplicity Gate**: PASS - central policy services/guards are added to existing API structure instead of scattering per-controller conditionals or adding a new service boundary.

### Post-Design Gate Review

- **Code Quality Gate**: PASS - design artifacts keep role/scope contracts in shared packages and authorization orchestration in a dedicated API module.
- **Testing Gate**: PASS - design maps every story to contract/integration/E2E/performance validation and preserves fail-first requirements.
- **UX Consistency Gate**: PASS - quickstart includes validation for denied-resource masking, empty filtered lists, and staff override messaging expectations.
- **Performance Gate**: PASS - design keeps policy evaluation local to API request flow with measurable list/filter and mutation budgets.
- **Simplicity Gate**: PASS - posts/comments integrate through shared resolver contracts so missing modules do not force a big-bang authorization rewrite.

## Project Structure

### Documentation (this feature)

```text
specs/003-auth-permission-framework/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── api/
│   ├── src/
│   │   ├── config/
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   └── modules/
│   │       ├── auth/
│   │       │   ├── adapters/
│   │       │   ├── application/
│   │       │   ├── domain/
│   │       │   └── infrastructure/
│   │       ├── authorization/
│   │       │   ├── adapters/
│   │       │   ├── application/
│   │       │   ├── domain/
│   │       │   └── infrastructure/
│   │       ├── media/
│   │       ├── posts/
│   │       └── comments/
│   └── test/
│       ├── architecture/
│       ├── contract/
│       └── integration/
├── web/
│   ├── src/
│   │   ├── app/pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── store/
│   ├── e2e/
│   └── test/integration/
└── mobile/
    ├── src/
    │   ├── components/
    │   ├── screens/
    │   └── services/
    └── test/integration/

packages/
├── shared-types/src/
└── validation/src/

infra/perf/
```

**Structure Decision**: Keep the existing monorepo layout and add an `authorization` API module as
the single policy orchestration point. Media integrates first after replacing request-supplied
ownership with authenticated server-side ownership resolution; post/comment support is planned
through the same resolver and contract pattern so authorization can ship incrementally instead of
coupling to non-existent modules.

## Phase 0 Research Plan

- Confirm the central authorization architecture for NestJS (guards + decorators + policy service) and reject per-controller ad hoc checks.
- Resolve how embedded role assignment, account visibility, and ownership metadata become persistent sources of truth in existing user/resource models.
- Resolve how internal API scopes are represented, declared on endpoints, and enforced within the current token/guard stack.
- Resolve audit persistence, deterministic denial behavior, and revocation-window strategy so role/scope changes take effect within the spec budget.
- Reconcile feature `002` contract/runtime drift around session and sign-out behavior so authorization dependencies are explicit before implementation.
- Confirm repository test/performance conventions to validate protected mutations, filtered reads, override audit events, and internal-scope enforcement.

Output: `specs/003-auth-permission-framework/research.md`

## Phase 1 Design Plan

- Define the authorization domain model: principals, embedded role assignment state, visibility policy, ownership context, scope grants, and audit events.
- Define API contracts for authorization-sensitive user and internal endpoints, explicitly marking planned vs current surfaces and denial semantics.
- Define the media-first hardening prerequisite that replaces request-supplied `ownerUserId` with authenticated principal ownership resolution.
- Define quickstart verification flows for owner vs non-owner access, public vs private visibility, moderator vs admin actions, and internal scope allow/deny cases.
- Update agent context via repository script after artifacts are written.

Outputs:

- `specs/003-auth-permission-framework/data-model.md`
- `specs/003-auth-permission-framework/contracts/openapi.yaml`
- `specs/003-auth-permission-framework/quickstart.md`
- Agent context update via `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode`
- `AGENTS.md` updated by the agent-context script as planning evidence

## Complexity Tracking

> No constitution violations identified at planning stage.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
