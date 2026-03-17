# Tasks: Cross-Platform Core Platform

**Input**: Design documents from `/specs/001-react-rn-nest-stack/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature includes behavior changes across backend, web, and mobile, so tests are required.

**Organization**: Tasks are grouped by user story so each story remains independently testable.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Task can run in parallel (different files, no unmet dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks
- Every task includes explicit file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo and baseline tooling.

- [X] T001 Create monorepo workspace configuration in `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- [X] T002 [P] Configure root TypeScript and lint formatting baseline in `tsconfig.base.json`, `.eslintrc.base.js`, `.prettierrc`
- [X] T003 [P] Initialize backend app skeleton in `apps/api/package.json`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
- [X] T004 [P] Initialize web app skeleton with Tailwind in `apps/web/package.json`, `apps/web/src/main.tsx`, `apps/web/tailwind.config.ts`
- [X] T005 [P] Initialize mobile Expo app skeleton in `apps/mobile/package.json`, `apps/mobile/App.tsx`, `apps/mobile/app.json`
- [X] T006 Create local service orchestration in `infra/docker/docker-compose.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts and backend infrastructure required by all stories.

**⚠️ CRITICAL**: No story implementation starts before this phase completes.

- [X] T007 Create shared contract types package in `packages/shared-types/src/index.ts`, `packages/shared-types/package.json`
- [X] T008 [P] Create shared validation schemas in `packages/validation/src/index.ts`, `packages/validation/src/auth.schema.ts`, `packages/validation/src/media.schema.ts`
- [X] T009 Implement MongoDB connection module in `apps/api/src/infrastructure/database/mongoose.module.ts`
- [X] T010 [P] Implement Redis cache/session module in `apps/api/src/infrastructure/cache/redis.module.ts`
- [X] T011 [P] Implement Cloudinary provider and service in `apps/api/src/modules/media/infrastructure/cloudinary/cloudinary.module.ts`, `apps/api/src/modules/media/infrastructure/cloudinary/cloudinary.service.ts`
- [X] T012 Add health endpoint for infrastructure checks in `apps/api/src/modules/health/health.controller.ts`, `apps/api/src/modules/health/health.module.ts`

**Checkpoint**: Foundation complete and all user stories can proceed.

---

## Phase 3: User Story 1 - Web auth and media upload (Priority: P1) 🎯 MVP

**Goal**: Web users authenticate and upload media stored via Cloudinary and MongoDB metadata.

**Independent Test**: Register/sign in on web, upload media, verify metadata appears in list.

### Tests for User Story 1

> **NOTE: Write these tests first, confirm they fail, then implement.**

- [X] T013 [P] [US1] Add contract tests for auth endpoints in `apps/api/test/contract/auth.contract.spec.ts`
- [X] T014 [P] [US1] Add contract tests for media endpoints in `apps/api/test/contract/media.contract.spec.ts`
- [X] T015 [P] [US1] Add web integration tests for auth and upload flows in `apps/web/test/integration/auth-upload.integration.test.tsx`

### Implementation for User Story 1

- [X] T016 [US1] Implement auth domain and use cases in `apps/api/src/modules/auth/domain/*`, `apps/api/src/modules/auth/application/*`
- [X] T017 [US1] Implement auth adapters and endpoints in `apps/api/src/modules/auth/adapters/auth.controller.ts`, `apps/api/src/modules/auth/auth.module.ts`
- [X] T018 [US1] Implement media domain/use cases and persistence in `apps/api/src/modules/media/domain/*`, `apps/api/src/modules/media/application/*`, `apps/api/src/modules/media/infrastructure/*`
- [X] T019 [US1] Implement web auth UI and session handling in `apps/web/src/app/pages/SignInPage.tsx`, `apps/web/src/components/auth/SignInForm.tsx`, `apps/web/src/store/auth.store.ts`
- [X] T020 [US1] Implement web media upload/list UI in `apps/web/src/app/pages/MediaPage.tsx`, `apps/web/src/components/media/MediaUploader.tsx`, `apps/web/src/components/media/MediaList.tsx`

**Checkpoint**: User Story 1 works independently as MVP.

---

## Phase 4: User Story 2 - Mobile sign-in and shared media list (Priority: P2)

**Goal**: Mobile users sign in and view the same media data created on web.

**Independent Test**: Sign in on mobile with same account and confirm media list parity.

### Tests for User Story 2

- [X] T021 [P] [US2] Add mobile auth screen tests in `apps/mobile/src/screens/__tests__/SignInScreen.test.tsx`
- [X] T022 [P] [US2] Add mobile media list tests in `apps/mobile/src/screens/__tests__/MediaListScreen.test.tsx`
- [X] T023 [P] [US2] Add mobile integration test for shared data parity in `apps/mobile/test/integration/shared-media.integration.test.ts`

### Implementation for User Story 2

- [X] T024 [US2] Implement mobile API client and auth service in `apps/mobile/src/services/api-client.ts`, `apps/mobile/src/services/auth.service.ts`
- [X] T025 [US2] Implement mobile sign-in flow UI in `apps/mobile/src/screens/SignInScreen.tsx`, `apps/mobile/src/components/auth/SignInForm.tsx`
- [X] T026 [US2] Implement mobile media listing UI in `apps/mobile/src/screens/MediaListScreen.tsx`, `apps/mobile/src/components/media/MediaCard.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Clean Architecture extensibility (Priority: P3)

**Goal**: Team can add new backend modules while preserving architecture boundaries.

**Independent Test**: Add a new module and verify dependency direction checks pass.

### Tests for User Story 3

- [X] T027 [P] [US3] Add architecture boundary test in `apps/api/test/architecture/clean-architecture.spec.ts`
- [X] T028 [P] [US3] Add integration test for extension module endpoint in `apps/api/test/integration/notifications.integration.spec.ts`

### Implementation for User Story 3

- [X] T029 [US3] Add dependency boundary lint rules in `.eslintrc.base.js`, `apps/api/.eslintrc.js`
- [X] T030 [US3] Implement notification module skeleton across layers in `apps/api/src/modules/notifications/domain/*`, `apps/api/src/modules/notifications/application/*`, `apps/api/src/modules/notifications/infrastructure/*`, `apps/api/src/modules/notifications/adapters/notifications.controller.ts`
- [X] T031 [US3] Register and wire notifications module in `apps/api/src/app.module.ts`, `apps/api/src/modules/notifications/notifications.module.ts`

**Checkpoint**: All user stories are independently functional and extensible.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story hardening and validation.

- [X] T032 [P] Add CI pipeline for lint, test, and typecheck in `.github/workflows/ci.yml`
- [X] T033 Validate p95 performance budgets with scripts in `infra/perf/auth.k6.js`, `infra/perf/media-list.k6.js`
- [X] T034 [P] Add web E2E flow coverage in `apps/web/e2e/auth-media.e2e.spec.ts`
- [X] T035 [P] Add API rate-limit and error handling hardening in `apps/api/src/common/filters/global-exception.filter.ts`, `apps/api/src/common/interceptors/response.interceptor.ts`
- [X] T036 Run end-to-end quickstart validation and update notes in `specs/001-react-rn-nest-stack/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: start immediately.
- **Foundational (Phase 2)**: depends on Setup completion; blocks all user stories.
- **User Stories (Phase 3-5)**: depend on Foundational completion; then execute in priority order (P1 -> P2 -> P3) or parallel by staffing.
- **Final Phase**: depends on completion of desired user stories.

### User Story Dependencies

- **US1**: starts after Foundational; no dependency on other stories.
- **US2**: starts after Foundational; reuses US1 backend APIs but remains independently testable.
- **US3**: starts after Foundational; focuses on architecture safety and module extensibility.

### Dependency Graph

- Phase 1 -> Phase 2 -> (US1, US2, US3) -> Final Phase
- Critical path for MVP: T001 -> T007 -> T009 -> T016 -> T017 -> T018 -> T019 -> T020

---

## Parallel Opportunities

- Setup parallel set: T002, T003, T004, T005
- Foundational parallel set: T008, T010, T011
- US1 test parallel set: T013, T014, T015
- US2 test parallel set: T021, T022, T023
- US3 test parallel set: T027, T028
- Final phase parallel set: T032, T034, T035

---

## Parallel Example: User Story 1

```bash
# Run US1 test creation in parallel
Task: "T013 [US1] apps/api/test/contract/auth.contract.spec.ts"
Task: "T014 [US1] apps/api/test/contract/media.contract.spec.ts"
Task: "T015 [US1] apps/web/test/integration/auth-upload.integration.test.tsx"
```

## Parallel Example: User Story 2

```bash
# Run US2 test creation in parallel
Task: "T021 [US2] apps/mobile/src/screens/__tests__/SignInScreen.test.tsx"
Task: "T022 [US2] apps/mobile/src/screens/__tests__/MediaListScreen.test.tsx"
Task: "T023 [US2] apps/mobile/test/integration/shared-media.integration.test.ts"
```

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Deliver US1 (web auth + upload).
2. Deliver US2 (mobile parity).
3. Deliver US3 (extension-safe architecture).
4. Execute final cross-cutting validation.

### Suggested MVP Scope

- MVP recommendation: **US1 only** (T001-T020).
