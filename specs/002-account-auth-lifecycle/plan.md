# Implementation Plan: Authentication and Account Lifecycle

**Branch**: `002-account-auth-lifecycle` | **Date**: 2026-03-17 | **Spec**: `specs/002-account-auth-lifecycle/spec.md`
**Input**: Feature specification from `specs/002-account-auth-lifecycle/spec.md`

## Summary

Evolve existing auth scaffolding into a complete account lifecycle for web and mobile clients:
email/password registration, sign-in, sign-out, refresh token rotation, password reset,
email verification, and device/session management. Implementation follows current clean
architecture module boundaries and shared packages for schema/type consistency.

## Technical Context

**Language/Version**: TypeScript 5.7 (workspace), NestJS 11 (API), React 19 (web), React Native 0.76 + Expo 52 (mobile)  
**Primary Dependencies**: NestJS core/common/mongoose, Mongoose, ioredis, Zod validation package, shared types package  
**Storage**: MongoDB (primary persistence), Redis (session/token state and revocation support)  
**Testing**: Vitest (unit/integration/contract), Playwright (web E2E), k6 (performance checks)  
**Target Platform**: Linux server API, modern web browsers, iOS/Android via Expo  
**Project Type**: Monorepo web + API + mobile applications with shared packages  
**Performance Goals**: sign-in p95 < 400ms, media list p95 < 300ms, refresh success >= 99%, revoked session denial = 100%  
**Constraints**: access/refresh lifecycle security, non-enumerating recovery responses, consistent loading/empty/error/success UX states  
**Scale/Scope**: account lifecycle for all authenticated users across web/mobile; support multi-device sessions per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate Review

- **Code Quality Gate**: PASS - plan enforces workspace lint/typecheck/build and architecture-boundary checks.
- **Testing Gate**: PASS - plan requires contract/integration/E2E/perf plus fail-first auth behavior tests.
- **UX Consistency Gate**: PASS - plan includes explicit state handling requirements on new auth flows in web/mobile.
- **Performance Gate**: PASS - measurable auth/session budgets captured from spec and existing k6 patterns.
- **Simplicity Gate**: PASS - extends current auth module and shared packages; avoids introducing new service boundaries.

### Post-Design Gate Review

- **Code Quality Gate**: PASS - design artifacts map directly to existing package/module conventions.
- **Testing Gate**: PASS - contracts and quickstart verification cover required levels.
- **UX Consistency Gate**: PASS - quickstart includes state validation for all user-facing lifecycle screens.
- **Performance Gate**: PASS - k6 scenarios and measurable outcomes are preserved in artifacts.
- **Simplicity Gate**: PASS - no constitution exception needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-account-auth-lifecycle/
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
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── adapters/
│   │   │   │   ├── application/
│   │   │   │   ├── domain/
│   │   │   │   └── infrastructure/
│   │   │   └── users/
│   │   └── infrastructure/
│   └── test/
│       ├── architecture/
│       ├── contract/
│       └── integration/
├── web/
│   ├── src/
│   │   ├── app/pages/
│   │   ├── components/auth/
│   │   ├── services/
│   │   └── store/
│   ├── test/integration/
│   └── e2e/
└── mobile/
    ├── src/
    │   ├── components/auth/
    │   ├── screens/
    │   └── services/
    └── test/integration/

packages/
├── shared-types/src/
└── validation/src/

infra/perf/
```

**Structure Decision**: Keep existing monorepo layout and extend current auth module using
the same domain/application/adapters/infrastructure pattern already used in API modules.

## Phase 0 Research Plan

- Resolve token lifecycle decisions (rotation, revocation, reuse handling).
- Resolve reset/verification token lifecycle and anti-enumeration behavior.
- Confirm repository conventions for test placement and performance thresholds.
- Confirm rollout order that keeps API/web/mobile integration incremental.

Output: `specs/002-account-auth-lifecycle/research.md`

## Phase 1 Design Plan

- Define canonical entities, attributes, relationships, validation constraints, and transitions.
- Define API contracts for auth lifecycle endpoints and error/response envelopes.
- Define runnable quickstart and verification sequence for local execution.
- Update agent context via repository script after artifacts are written.

Outputs:
- `specs/002-account-auth-lifecycle/data-model.md`
- `specs/002-account-auth-lifecycle/contracts/openapi.yaml`
- `specs/002-account-auth-lifecycle/quickstart.md`
- Agent context update via `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode`

## Complexity Tracking

> No constitution violations identified at planning stage.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
