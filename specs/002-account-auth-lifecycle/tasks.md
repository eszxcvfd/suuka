# Tasks: Authentication and Account Lifecycle

**Input**: Design documents from `/specs/002-account-auth-lifecycle/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature changes authentication behavior across API, web, and mobile, so fail-first tests are required.

**Organization**: Tasks are grouped by user story so each story remains independently testable.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Task can run in parallel (different files, no unmet dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks
- Every task includes explicit file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare repository dependencies, auth configuration scaffolding, and validation baselines.

- [x] T001 Add auth lifecycle dependencies and scripts in `apps/api/package.json`, `apps/mobile/package.json`, `package.json`
- [x] T002 [P] Add environment template and auth config scaffold in `.env.example`, `apps/api/src/config/auth.config.ts`
- [x] T003 [P] Add shared auth schema/type export scaffolding in `packages/validation/src/index.ts`, `packages/shared-types/src/index.ts`
- [x] T004 [P] Add performance script scaffolding for refresh/reset flows in `infra/perf/refresh.k6.js`, `infra/perf/password-reset.k6.js`
- [x] T005 [P] Add base auth test file scaffolding in `apps/api/test/integration/auth.integration.spec.ts`, `apps/web/test/integration/auth-lifecycle.integration.test.tsx`, `apps/mobile/test/integration/auth-lifecycle.integration.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared auth infrastructure required before any user-story delivery.

**⚠️ CRITICAL**: No story implementation starts before this phase completes.

- [x] T006 Implement core auth persistence models and repositories in `apps/api/src/modules/auth/infrastructure/user.schema.ts`, `apps/api/src/modules/auth/infrastructure/session.schema.ts`, `apps/api/src/modules/auth/infrastructure/refresh-credential.schema.ts`, `apps/api/src/modules/auth/infrastructure/user.repository.ts`, `apps/api/src/modules/auth/infrastructure/session.repository.ts`
- [x] T007 [P] Implement shared lifecycle validation schemas in `packages/validation/src/auth.schema.ts`, `packages/validation/src/index.ts`
- [x] T008 [P] Implement shared auth lifecycle types in `packages/shared-types/src/index.ts`
- [x] T009 Implement token/password utility services in `apps/api/src/modules/auth/application/token.service.ts`, `apps/api/src/modules/auth/application/password.service.ts`
- [x] T010 [P] Implement auth guard and user-context extraction in `apps/api/src/modules/auth/adapters/jwt-auth.guard.ts`, `apps/api/src/modules/auth/adapters/current-user.decorator.ts`
- [x] T011 Wire foundational auth module providers and configuration in `apps/api/src/modules/auth/auth.module.ts`, `apps/api/src/app.module.ts`
- [x] T012 Add foundational architecture guard coverage for auth boundaries in `apps/api/test/architecture/clean-architecture.spec.ts`

**Checkpoint**: Foundation complete and all user stories can proceed.

---

## Phase 3: User Story 1 - Register/sign-in/sign-out/refresh (Priority: P1) 🎯 MVP

**Goal**: Deliver secure registration and core session lifecycle for web and mobile users.

**Independent Test**: Register, verify existing verified user sign-in, refresh access, then sign out and confirm revoked access.

### Tests for User Story 1

> **NOTE: Write these tests first, confirm they fail, then implement.**

- [x] T013 [P] [US1] Add contract tests for sign-up/sign-in/sign-out/refresh endpoints in `apps/api/test/contract/auth.contract.spec.ts`
- [x] T014 [P] [US1] Add API integration tests for refresh rotation and revocation in `apps/api/test/integration/auth.integration.spec.ts`
- [x] T015 [P] [US1] Add web integration tests for registration and session lifecycle in `apps/web/test/integration/auth-lifecycle.integration.test.tsx`
- [x] T016 [P] [US1] Add mobile integration tests for sign-in/refresh/sign-out in `apps/mobile/test/integration/auth-lifecycle.integration.test.ts`

### Implementation for User Story 1

- [x] T017 [US1] Implement register/sign-in/sign-out/refresh use cases in `apps/api/src/modules/auth/application/auth.service.ts`
- [x] T018 [US1] Implement core auth routes and request handling in `apps/api/src/modules/auth/adapters/auth.controller.ts`
- [x] T019 [US1] Implement web auth API/store and sign-up/sign-in pages in `apps/web/src/services/auth-api.ts`, `apps/web/src/store/auth.store.ts`, `apps/web/src/app/pages/SignUpPage.tsx`, `apps/web/src/app/pages/SignInPage.tsx`, `apps/web/src/components/auth/SignUpForm.tsx`, `apps/web/src/components/auth/SignInForm.tsx`
- [x] T020 [US1] Implement mobile auth client/service and sign-in/sign-up screens in `apps/mobile/src/services/api-client.ts`, `apps/mobile/src/services/auth.service.ts`, `apps/mobile/src/screens/SignInScreen.tsx`, `apps/mobile/src/screens/SignUpScreen.tsx`, `apps/mobile/src/components/auth/SignInForm.tsx`, `apps/mobile/src/components/auth/SignUpForm.tsx`

**Checkpoint**: User Story 1 works independently as MVP.

---

## Phase 4: User Story 2 - Password reset and email verification (Priority: P2)

**Goal**: Deliver account recovery and verification lifecycle with anti-enumeration behavior.

**Independent Test**: Request reset/resend verification, complete valid challenges, reject invalid or expired challenges.

### Tests for User Story 2

- [x] T021 [P] [US2] Add contract tests for verification and password reset endpoints in `apps/api/test/contract/auth-recovery.contract.spec.ts`
- [x] T022 [P] [US2] Add API integration tests for challenge lifecycle and session revocation on reset in `apps/api/test/integration/auth-recovery.integration.spec.ts`
- [x] T023 [P] [US2] Add web integration tests for verify and reset flows in `apps/web/test/integration/auth-recovery.integration.test.tsx`
- [x] T024 [P] [US2] Add mobile integration tests for recovery flows in `apps/mobile/test/integration/auth-recovery.integration.test.ts`

### Implementation for User Story 2

- [x] T025 [P] [US2] Implement verification and reset persistence models in `apps/api/src/modules/auth/infrastructure/email-verification-request.schema.ts`, `apps/api/src/modules/auth/infrastructure/password-reset-request.schema.ts`
- [x] T026 [US2] Implement verify/resend/request-reset/confirm-reset use cases in `apps/api/src/modules/auth/application/auth.service.ts`
- [x] T027 [US2] Implement verification and recovery routes in `apps/api/src/modules/auth/adapters/auth.controller.ts`
- [x] T028 [US2] Implement web verify/reset UX and state handling in `apps/web/src/app/pages/VerifyEmailPage.tsx`, `apps/web/src/app/pages/ForgotPasswordPage.tsx`, `apps/web/src/app/pages/ResetPasswordPage.tsx`, `apps/web/src/components/auth/ForgotPasswordForm.tsx`, `apps/web/src/components/auth/ResetPasswordForm.tsx`, `apps/web/src/store/auth.store.ts`
- [x] T029 [US2] Implement mobile verify/reset flows in `apps/mobile/src/screens/ForgotPasswordScreen.tsx`, `apps/mobile/src/screens/ResetPasswordScreen.tsx`, `apps/mobile/src/screens/VerifyEmailScreen.tsx`, `apps/mobile/src/services/auth.service.ts`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Device/session management (Priority: P3)

**Goal**: Enable users to inspect and revoke device sessions while preserving current session.

**Independent Test**: Sign in from multiple devices, list sessions, revoke one session, revoke all non-current sessions.

### Tests for User Story 3

- [x] T030 [P] [US3] Add contract tests for session management endpoints in `apps/api/test/contract/auth-sessions.contract.spec.ts`
- [x] T031 [P] [US3] Add API integration tests for session list and revocation semantics in `apps/api/test/integration/auth-sessions.integration.spec.ts`
- [x] T032 [P] [US3] Add web integration tests for session management in `apps/web/test/integration/session-management.integration.test.tsx`
- [x] T033 [P] [US3] Add mobile integration tests for session management in `apps/mobile/test/integration/session-management.integration.test.ts`

### Implementation for User Story 3

- [x] T034 [US3] Implement session listing and revoke use cases in `apps/api/src/modules/auth/application/auth.service.ts`, `apps/api/src/modules/auth/infrastructure/session.repository.ts`
- [x] T035 [US3] Implement `/auth/sessions` routes and handlers in `apps/api/src/modules/auth/adapters/auth.controller.ts`
- [x] T036 [US3] Implement web sessions management UI in `apps/web/src/app/pages/SessionsPage.tsx`, `apps/web/src/components/auth/SessionList.tsx`, `apps/web/src/store/auth.store.ts`
- [x] T037 [US3] Implement mobile sessions management UI in `apps/mobile/src/screens/SessionsScreen.tsx`, `apps/mobile/src/components/auth/SessionItem.tsx`, `apps/mobile/src/services/auth.service.ts`

**Checkpoint**: All user stories are independently functional.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate and harden behavior across all stories.

- [x] T038 [P] Add end-to-end auth lifecycle coverage in `apps/web/e2e/auth-lifecycle.e2e.spec.ts`
- [x] T039 Validate performance budgets for auth and session flows in `infra/perf/auth.k6.js`, `infra/perf/refresh.k6.js`, `infra/perf/password-reset.k6.js`
- [x] T040 [P] Add audit-event and error-shaping hardening in `apps/api/src/modules/auth/application/auth.service.ts`, `apps/api/src/common/filters/global-exception.filter.ts`
- [x] T041 Run quickstart validation and update verification notes in `specs/002-account-auth-lifecycle/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: start immediately.
- **Foundational (Phase 2)**: depends on Setup completion; blocks all user stories.
- **User Stories (Phase 3-5)**: depend on Foundational completion; then execute in priority order (P1 -> P2 -> P3) or parallel by staffing.
- **Final Phase**: depends on completion of desired user stories.

### User Story Dependencies

- **US1**: starts after Foundational; no dependency on other stories.
- **US2**: starts after Foundational; reuses US1 auth/session primitives but remains independently testable.
- **US3**: starts after Foundational; depends on stable session primitives and remains independently testable.

### Dependency Graph

- Phase 1 -> Phase 2 -> (US1, US2, US3) -> Final Phase
- Critical path for MVP: T001 -> T006 -> T009 -> T017 -> T018 -> T019 -> T020

---

## Parallel Opportunities

- Setup parallel set: T002, T003, T004, T005
- Foundational parallel set: T007, T008, T010
- US1 test parallel set: T013, T014, T015, T016
- US2 test parallel set: T021, T022, T023, T024
- US3 test parallel set: T030, T031, T032, T033
- Final phase parallel set: T038, T040

---

## Parallel Example: User Story 1

```bash
# Run US1 tests in parallel
Task: "T013 [US1] apps/api/test/contract/auth.contract.spec.ts"
Task: "T014 [US1] apps/api/test/integration/auth.integration.spec.ts"
Task: "T015 [US1] apps/web/test/integration/auth-lifecycle.integration.test.tsx"
Task: "T016 [US1] apps/mobile/test/integration/auth-lifecycle.integration.test.ts"
```

## Parallel Example: User Story 2

```bash
# Run US2 tests in parallel
Task: "T021 [US2] apps/api/test/contract/auth-recovery.contract.spec.ts"
Task: "T022 [US2] apps/api/test/integration/auth-recovery.integration.spec.ts"
Task: "T023 [US2] apps/web/test/integration/auth-recovery.integration.test.tsx"
Task: "T024 [US2] apps/mobile/test/integration/auth-recovery.integration.test.ts"
```

## Parallel Example: User Story 3

```bash
# Run US3 tests in parallel
Task: "T030 [US3] apps/api/test/contract/auth-sessions.contract.spec.ts"
Task: "T031 [US3] apps/api/test/integration/auth-sessions.integration.spec.ts"
Task: "T032 [US3] apps/web/test/integration/session-management.integration.test.tsx"
Task: "T033 [US3] apps/mobile/test/integration/session-management.integration.test.ts"
```

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Deliver US1 (core registration/session lifecycle).
2. Deliver US2 (verification and recovery lifecycle).
3. Deliver US3 (device/session management).
4. Execute final cross-cutting validation.

### Suggested MVP Scope

- MVP recommendation: **US1 only** (T001-T020).
