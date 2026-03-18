# Tasks: User Profile Service and Personal Profile

**Input**: Design documents from `/specs/004-user-profile/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature changes user-facing behavior across API, web, and mobile, so fail-first tests are required.

**Organization**: Tasks are grouped by user story so each story remains independently testable.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Task can run in parallel (different files, no unmet dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks
- Every task includes explicit file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared contracts, validation scaffolding, and profile-specific test placeholders before core implementation.

- [x] T001 Update `specs/004-user-profile/contracts/openapi.yaml` to keep profile read/update, avatar, and private-profile response semantics synchronized with implementation slices
- [x] T002 [P] Create `apps/api/test/contract/profile.contract.spec.ts` for profile contract coverage against `specs/004-user-profile/contracts/openapi.yaml`
- [x] T003 [P] Create `apps/api/test/integration/profile-foundation.integration.spec.ts` for fail-first module-wiring and duplicate-username baseline coverage
- [x] T004 [P] Create `apps/web/test/integration/profile-foundation.integration.test.tsx` for fail-first web profile route/state scaffolding
- [x] T005 [P] Create `apps/mobile/test/integration/profile-foundation.integration.test.ts` for fail-first mobile profile service/screen scaffolding
- [x] T006 [P] Create `infra/perf/profile-read.k6.js` and `infra/perf/profile-save.k6.js` with placeholder thresholds for profile read and save budgets

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared profile infrastructure required before any user-story delivery.

**⚠️ CRITICAL**: No story implementation starts before this phase completes.

- [x] T007 Modify `apps/api/src/modules/auth/infrastructure/user.schema.ts` to persist `username`, `usernameCanonical`, `bio`, `avatarMediaId`, and embedded external-link profile fields
- [x] T008 Modify `apps/api/src/modules/auth/infrastructure/user.repository.ts` to support profile reads, canonical username lookup, and profile updates with validation-safe update operations
- [x] T009 [P] Modify `packages/shared-types/src/index.ts` to extend `UserProfile` and related client-visible profile contracts beyond `displayName` and `accountVisibility`
- [x] T010 [P] Create `packages/validation/src/profile.schema.ts` for profile read/update, avatar-update, and external-link validation schemas
- [x] T011 [P] Modify `packages/validation/src/index.ts` to export profile-specific schemas
- [x] T012 Create `apps/api/src/modules/profiles/application/profile.service.ts` for canonical profile orchestration over the existing user repository and media-backed avatar references
- [x] T013 [P] Create `apps/api/src/modules/profiles/adapters/profile.controller.ts` for `/profiles/{accountId}`, `/profiles/me`, and `/profiles/me/avatar` endpoints
- [x] T014 [P] Create `apps/api/src/modules/profiles/profiles.module.ts` to wire profile controller/service and required auth/media dependencies
- [x] T015 Modify `apps/api/src/app.module.ts` to register the new profiles module in the API application graph
- [x] T016 Modify `apps/api/src/modules/authorization/domain/permission-rule.ts` and `apps/api/src/modules/authorization/application/authorization.service.ts` to introduce profile-view/profile-update policy actions and visibility-aware evaluation support
- [x] T017 Modify `apps/api/src/modules/media/application/media.service.ts` and `apps/api/src/modules/media/domain/media-asset.entity.ts` to support avatar ownership/reference resolution beyond the in-memory upload stub

**Checkpoint**: Foundation complete and all user stories can proceed.

---

## Phase 3: User Story 1 - Edit core personal profile (Priority: P1) 🎯 MVP

**Goal**: Signed-in users can open their own profile, update core editable fields, and see saved values reflected consistently.

**Independent Test**: Open the current user’s profile settings, update display name and bio, save successfully, then reload the profile and confirm the new values appear without affecting unrelated account/session data.

### Tests for User Story 1

> **NOTE: Write these tests first, confirm they fail, then implement.**

- [x] T018 [P] [US1] Create `apps/api/test/contract/profile-self.contract.spec.ts` for `/profiles/me` read/update contract coverage
- [x] T019 [P] [US1] Create `apps/api/test/integration/profile-self.integration.spec.ts` for owner profile read/update and validation-failure behavior
- [x] T020 [P] [US1] Create `apps/web/test/integration/profile-edit.integration.test.tsx` for web profile settings load/save/error-state coverage
- [x] T021 [P] [US1] Create `apps/mobile/test/integration/profile-edit.integration.test.ts` for mobile profile settings load/save/error-state coverage
- [x] T022 [P] [US1] Create `apps/web/e2e/profile-edit.e2e.spec.ts` for browser-level profile settings edit and persistence flow

### Implementation for User Story 1

- [x] T023 [US1] Modify `apps/api/src/modules/profiles/application/profile.service.ts` to implement current-user profile read and core field updates for `displayName` and `bio`
- [x] T024 [US1] Modify `apps/api/src/modules/profiles/adapters/profile.controller.ts` to expose authenticated `/profiles/me` read/update handlers with validation-safe responses
- [x] T025 [US1] Modify `apps/web/src/services/auth-api.ts` to add profile read/update client methods without expanding auth-session payloads
- [x] T026 [US1] Modify `apps/web/src/store/auth.store.ts` to add profile settings state, save handling, and validation/error/success states
- [x] T027 [US1] Create `apps/web/src/app/pages/ProfilePage.tsx` and `apps/web/src/components/profile/ProfileForm.tsx` for the web profile settings flow
- [x] T028 [US1] Modify `apps/web/src/components/layout/DashboardShell.tsx` to consume refreshed profile presentation data after successful profile edits
- [x] T029 [US1] Modify `apps/mobile/src/services/auth.service.ts` to add current-user profile read/update methods
- [x] T030 [US1] Create `apps/mobile/src/screens/ProfileScreen.tsx` and `apps/mobile/src/components/profile/ProfileForm.tsx` for the mobile profile settings flow

**Checkpoint**: User Story 1 works independently as the MVP profile-edit slice.

---

## Phase 4: User Story 2 - Manage public identity and profile presentation (Priority: P2)

**Goal**: Users can claim a unique username, manage avatar, and maintain public-facing external links.

**Independent Test**: Update username, avatar reference, and external links for the current user, reject duplicate usernames, and confirm presentation changes appear on profile surfaces without depending on private/public visibility behavior.

### Tests for User Story 2

- [x] T031 [P] [US2] Create `apps/api/test/contract/profile-identity.contract.spec.ts` for username/avatar/external-link contract coverage
- [x] T032 [P] [US2] Create `apps/api/test/integration/profile-identity.integration.spec.ts` for duplicate-username handling, avatar reference validation, and external-link validation behavior
- [x] T033 [P] [US2] Create `apps/web/test/integration/profile-identity.integration.test.tsx` for web username/avatar/link management states
- [x] T034 [P] [US2] Create `apps/mobile/test/integration/profile-identity.integration.test.ts` for mobile username/avatar/link management states
- [x] T035 [P] [US2] Create `apps/web/e2e/profile-identity.e2e.spec.ts` for browser-level username collision and avatar/link update flows

### Implementation for User Story 2

- [x] T036 [US2] Modify `apps/api/src/modules/profiles/application/profile.service.ts` to add canonical username updates, duplicate-key error mapping, avatar reference updates, and external-link normalization/order handling
- [x] T037 [US2] Modify `apps/api/src/modules/profiles/adapters/profile.controller.ts` to support identity/presentation update payloads and avatar-specific mutation handling
- [x] T038 [US2] Modify `apps/api/src/modules/media/application/media.service.ts` and `apps/api/src/modules/media/infrastructure/cloudinary/cloudinary.service.ts` to support avatar-eligible media reference validation for profile updates
- [x] T039 [US2] Modify `apps/web/src/services/auth-api.ts` and `apps/web/src/store/auth.store.ts` to support username collision errors, avatar updates, and external-link editing state
- [x] T040 [US2] Modify `apps/web/src/components/profile/ProfileForm.tsx` and create `apps/web/src/components/profile/ExternalLinksEditor.tsx` for username/avatar/link controls
- [x] T041 [US2] Modify `apps/mobile/src/services/auth.service.ts` and `apps/mobile/src/screens/ProfileScreen.tsx` to support username/avatar/link updates on mobile
- [x] T042 [US2] Create `apps/mobile/src/components/profile/ExternalLinksEditor.tsx` for mobile external-link editing controls

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Control basic profile privacy (Priority: P3)

**Goal**: Users can switch between public and private profiles, and viewers receive the correct visible or non-revealing response.

**Independent Test**: Toggle the owner profile between public and private, confirm owner access remains intact, confirm allowed viewers can see public profiles, and confirm hidden profiles return the agreed non-revealing result to unauthorized viewers.

### Tests for User Story 3

- [x] T043 [P] [US3] Create `apps/api/test/contract/profile-visibility.contract.spec.ts` for public/private profile read semantics and non-revealing hidden-profile responses
- [x] T044 [P] [US3] Create `apps/api/test/integration/profile-visibility.integration.spec.ts` for owner/viewer/private-profile enforcement behavior
- [x] T045 [P] [US3] Create `apps/web/test/integration/profile-visibility.integration.test.tsx` for web owner/viewer visibility state handling
- [x] T046 [P] [US3] Create `apps/mobile/test/integration/profile-visibility.integration.test.ts` for mobile owner/viewer visibility state handling
- [x] T047 [P] [US3] Create `apps/web/e2e/profile-visibility.e2e.spec.ts` for browser-level public/private profile viewing behavior

### Implementation for User Story 3

- [x] T048 [US3] Modify `apps/api/src/modules/profiles/application/profile.service.ts` to enforce `accountVisibility` on profile reads with the agreed non-revealing hidden-profile outcome
- [x] T049 [US3] Modify `apps/api/src/modules/profiles/adapters/profile.controller.ts` to expose public profile reads and privacy updates consistent with the contract
- [x] T050 [US3] Modify `apps/api/src/modules/authorization/domain/permission-rule.ts` and `apps/api/src/modules/authorization/application/authorization.service.ts` to align profile-view/profile-update actions with current public/private visibility semantics
- [x] T051 [US3] Modify `apps/web/src/services/auth-api.ts`, `apps/web/src/store/auth.store.ts`, and `apps/web/src/app/pages/ProfilePage.tsx` to support public/private profile states for owner and viewer flows
- [x] T052 [US3] Modify `apps/mobile/src/services/auth.service.ts` and `apps/mobile/src/screens/ProfileScreen.tsx` to support public/private profile states on mobile
- [x] T053 [US3] Modify `infra/perf/profile-read.k6.js` and `infra/perf/profile-save.k6.js` to validate profile read/save budgets after visibility enforcement lands

**Checkpoint**: All user stories are independently functional.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Finish shared validation, documentation, and release-readiness checks across all stories.

- [x] T054 [P] Update `specs/004-user-profile/contracts/openapi.yaml` and `specs/004-user-profile/quickstart.md` to reflect any final implementation-driven contract or verification adjustments
- [x] T055 [P] Add profile module boundary coverage in `apps/api/test/architecture/clean-architecture.spec.ts`
- [x] T056 Run `pnpm --filter api lint`, `pnpm --filter api typecheck`, and `pnpm --filter api test` to validate API profile behavior end-to-end
- [x] T057 Run `pnpm --filter web lint`, `pnpm --filter web typecheck`, `pnpm --filter web test`, and `pnpm --filter web test:e2e` to validate web profile flows
- [x] T058 Run `pnpm --filter mobile lint`, `pnpm --filter mobile typecheck`, and `pnpm --filter mobile test` to validate mobile profile flows
- [x] T059 Run `pnpm perf:auth`, `k6 run infra/perf/profile-read.k6.js`, and `k6 run infra/perf/profile-save.k6.js` to capture performance evidence for profile budgets

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: start immediately.
- **Foundational (Phase 2)**: depends on Setup completion; blocks all user stories.
- **User Stories (Phase 3-5)**: depend on Foundational completion; execute in priority order (P1 -> P2 -> P3) or in parallel by staffing once dependencies are satisfied.
- **Final Phase**: depends on completion of desired user stories.

### User Story Dependencies

- **US1**: starts after Foundational; no dependency on other stories.
- **US2**: starts after Foundational and benefits from US1 profile-edit paths, but remains independently testable once profile identity/presentation behavior exists.
- **US3**: starts after Foundational and integrates with US1/US2 profile surfaces while remaining independently testable as a visibility slice.

### Dependency Graph

- Phase 1 -> Phase 2 -> (US1, US2, US3) -> Final Phase
- Critical path for MVP: T001 -> T007 -> T008/T012/T013/T014 -> T023 -> T024 -> T025/T026/T027/T029/T030

---

## Parallel Opportunities

- Setup parallel set: T002, T003, T004, T005, T006
- Foundational parallel set: T009, T010, T011, T013, T014 after T007/T008 framing is clear
- US1 test parallel set: T018, T019, T020, T021, T022
- US2 test parallel set: T031, T032, T033, T034, T035
- US3 test parallel set: T043, T044, T045, T046, T047
- Final phase parallel set: T054, T055

### Parallel Example: User Story 1

```bash
# Run US1 tests in parallel
Task: "T018 [US1] apps/api/test/contract/profile-self.contract.spec.ts"
Task: "T019 [US1] apps/api/test/integration/profile-self.integration.spec.ts"
Task: "T020 [US1] apps/web/test/integration/profile-edit.integration.test.tsx"
Task: "T021 [US1] apps/mobile/test/integration/profile-edit.integration.test.ts"
Task: "T022 [US1] apps/web/e2e/profile-edit.e2e.spec.ts"
```

### Parallel Example: User Story 2

```bash
# Run US2 tests in parallel
Task: "T031 [US2] apps/api/test/contract/profile-identity.contract.spec.ts"
Task: "T032 [US2] apps/api/test/integration/profile-identity.integration.spec.ts"
Task: "T033 [US2] apps/web/test/integration/profile-identity.integration.test.tsx"
Task: "T034 [US2] apps/mobile/test/integration/profile-identity.integration.test.ts"
Task: "T035 [US2] apps/web/e2e/profile-identity.e2e.spec.ts"
```

### Parallel Example: User Story 3

```bash
# Run US3 tests in parallel
Task: "T043 [US3] apps/api/test/contract/profile-visibility.contract.spec.ts"
Task: "T044 [US3] apps/api/test/integration/profile-visibility.integration.spec.ts"
Task: "T045 [US3] apps/web/test/integration/profile-visibility.integration.test.tsx"
Task: "T046 [US3] apps/mobile/test/integration/profile-visibility.integration.test.ts"
Task: "T047 [US3] apps/web/e2e/profile-visibility.e2e.spec.ts"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Deliver US1 (core profile read/edit flow).
2. Deliver US2 (public identity and presentation controls).
3. Deliver US3 (basic privacy and viewer-facing enforcement).
4. Execute final cross-cutting validation.

### Suggested MVP Scope

- MVP recommendation: **US1 only** (T001-T030).

---

## Notes

- All tasks use the required checklist format with task ID, optional `[P]`, optional `[US#]`, and exact file paths.
- Tests are included because the feature spec and constitution require behavior-change automation.
- The tasks intentionally keep profile persistence inside the existing user model and keep rich profile data behind profile endpoints rather than auth session payloads.
