# Tasks: Authorization and Permission Framework

**Input**: Design documents from `/specs/003-auth-permission-framework/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test tasks for all behavior changes. QR-002 requires fail-first automated tests before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. [US1], [US2], [US3])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the feature artifacts, shared contracts, and baseline test scaffolding before code changes.

- [x] T001 Update `specs/003-auth-permission-framework/contracts/openapi.yaml` to keep current-vs-planned authorization surfaces synchronized with implementation slices
- [x] T002 Create `apps/api/test/contract/authorization.contract.spec.ts` to assert the 003 OpenAPI contract covers authorization endpoints and denial envelopes
- [x] T003 [P] Create `apps/api/test/integration/authorization-foundation.integration.spec.ts` to define fail-first coverage for module wiring and default-deny authorization behavior
- [x] T004 [P] Create `infra/perf/authorization-policy.k6.js` with placeholder thresholds for policy decision latency and revocation-window validation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authorization infrastructure that MUST be complete before any user story implementation.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create `apps/api/src/modules/authorization/domain/permission-rule.ts` for the baseline permission matrix, actions, and decision result types
- [x] T006 Create `apps/api/src/modules/authorization/application/authorization.service.ts` for deterministic RBAC + visibility + ownership + scope evaluation
- [x] T007 Create `apps/api/src/modules/authorization/adapters/permissions.decorator.ts` for endpoint-level policy and scope metadata
- [x] T008 Create `apps/api/src/modules/authorization/adapters/authorization.guard.ts` for default-deny enforcement after JWT authentication
- [x] T009 Create `apps/api/src/modules/authorization/infrastructure/authorization-audit.repository.ts` for persistent privileged-action and denied-attempt audit writes
- [x] T010 Create `apps/api/src/modules/authorization/authorization.module.ts` to wire the authorization service, guard, decorator metadata, and audit repository
- [x] T011 Modify `apps/api/src/app.module.ts` to register the new authorization module in the API application graph
- [x] T012 Modify `apps/api/src/modules/auth/auth.module.ts` to export the auth dependencies needed by authorization infrastructure
- [x] T013 Modify `apps/api/src/modules/auth/adapters/jwt-auth.guard.ts` to resolve principal context that can support both human users and service principals
- [x] T014 Modify `apps/api/src/modules/auth/adapters/current-user.decorator.ts` to expose richer authorization principal data to protected handlers
- [x] T015 Modify `apps/api/src/modules/auth/infrastructure/user.schema.ts` to persist baseline `role` and `accountVisibility` authorization state on user records
- [x] T016 Modify `apps/api/src/modules/auth/infrastructure/user.repository.ts` to read and update role/visibility state for authorization use cases
- [x] T017 Modify `packages/shared-types/src/index.ts` to add shared role, visibility, scope, authorization decision, and audit event types
- [x] T018 Modify `packages/validation/src/auth.schema.ts` to add validation schemas for role assignment, visibility updates, and internal scope payloads
- [x] T019 Modify `packages/validation/src/index.ts` to export the new authorization-related schemas
- [x] T020 Modify `apps/api/test/architecture/clean-architecture.spec.ts` to include the new authorization module boundaries in architecture verification

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Enforce visibility and ownership for end users (Priority: P1) 🎯 MVP

**Goal**: End users can only view and mutate content allowed by account visibility and ownership rules.

**Independent Test**: Authenticate an owner and a non-owner, switch account visibility between public/private, then verify allowed and denied profile/media access and mutation outcomes independently from staff and internal-scope features.

### Tests for User Story 1 ⚠️

- [x] T021 [P] [US1] Create `apps/api/test/contract/authorization-visibility.contract.spec.ts` for profile, account visibility, and media authorization contract coverage
- [x] T022 [P] [US1] Create `apps/api/test/integration/authorization-visibility.integration.spec.ts` for owner/non-owner and public/private allow-deny API behavior
- [x] T023 [P] [US1] Create `apps/web/test/integration/auth-visibility-ownership.integration.test.tsx` for filtered list, denied mutation, and non-revealing error states in the web client
- [x] T024 [P] [US1] Create `apps/web/e2e/auth-visibility-ownership.e2e.spec.ts` for browser-level owner vs non-owner visibility and mutation flows
- [x] T025 [P] [US1] Create `apps/mobile/test/integration/auth-visibility-ownership.integration.test.ts` for mobile media visibility and denied mutation handling

### Implementation for User Story 1

- [x] T026 [US1] Modify `apps/api/src/modules/media/domain/media-asset.entity.ts` to expose the ownership and visibility context required by policy evaluation
- [x] T027 [US1] Modify `apps/api/src/modules/media/application/media.service.ts` to derive ownership from authenticated server-side context instead of request-supplied `ownerUserId`
- [x] T028 [US1] Modify `apps/api/src/modules/media/adapters/media.controller.ts` to protect list and mutation flows with authorization metadata and authenticated principal context
- [x] T029 [US1] Modify `apps/api/src/modules/media/media.module.ts` to import authorization dependencies for media policy enforcement
- [x] T030 [US1] Modify `apps/web/src/services/auth-api.ts` to handle non-revealing denied responses and visibility-aware resource calls consistently
- [x] T031 [US1] Modify `apps/web/src/app/pages/MediaPage.tsx` to render visibility-filtered, empty, error, and denied states for protected media access
- [x] T032 [US1] Modify `apps/web/src/components/media/MediaList.tsx` to hide unauthorized items and surface stable denied-action feedback
- [x] T033 [US1] Modify `apps/mobile/src/services/auth.service.ts` to normalize authorization-denied responses for mobile flows
- [x] T034 [US1] Modify `apps/mobile/src/screens/MediaListScreen.tsx` to reflect filtered, empty, and denied states for protected media access
- [x] T035 [US1] Modify `infra/perf/media-list.k6.js` to validate visibility-filtered list performance under the new authorization layer

**Checkpoint**: User Story 1 should be fully functional and independently testable.

---

## Phase 4: User Story 2 - Apply role-based staff permissions (Priority: P2)

**Goal**: Admin, moderator, and regular user actions are enforced consistently through an explicit permission matrix.

**Independent Test**: Execute a fixed permission matrix across admin, moderator, and user principals to verify moderation actions, admin-only actions, and denied staff escalation attempts without depending on internal API scopes.

### Tests for User Story 2 ⚠️

- [x] T036 [P] [US2] Create `apps/api/test/contract/authorization-rbac.contract.spec.ts` for role-governed user and staff contract coverage
- [x] T037 [P] [US2] Create `apps/api/test/integration/authorization-rbac.integration.spec.ts` for admin/moderator/user permission matrix behavior
- [x] T038 [P] [US2] Create `apps/web/test/integration/auth-rbac.integration.test.tsx` for web handling of staff-only actions and denied escalation attempts
- [x] T039 [P] [US2] Create `apps/web/e2e/auth-rbac.e2e.spec.ts` for moderator/admin browser flows and denied staff escalation attempts
- [x] T040 [P] [US2] Create `apps/mobile/test/integration/auth-rbac.integration.test.ts` for mobile rendering of role-gated actions and denial states

### Implementation for User Story 2

- [x] T041 [US2] Modify `apps/api/src/modules/auth/application/auth.service.ts` to support role-aware lifecycle operations and staff-audit hooks required by authorization
- [x] T042 [US2] Modify `apps/api/src/modules/auth/adapters/auth.controller.ts` to expose role-governed account visibility and role-management behavior defined by the contract
- [x] T043 [US2] Modify `apps/api/src/modules/authorization/application/authorization.service.ts` to enforce the admin/moderator/user permission matrix and override audit rules
- [x] T044 [US2] Modify `apps/api/src/modules/authorization/infrastructure/authorization-audit.repository.ts` to persist moderator/admin success, denial, and override audit events
- [x] T045 [US2] Modify `apps/web/src/store/auth.store.ts` to track role-aware UI state and denied staff-action feedback
- [x] T046 [US2] Modify `apps/mobile/src/services/api-client.ts` to preserve role-related authorization error semantics consistently for mobile screens
- [x] T047 [US2] Modify `infra/perf/auth.k6.js` to cover protected staff-action latency after RBAC enforcement is introduced

**Checkpoint**: User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Restrict internal API usage by scope (Priority: P3)

**Goal**: Internal API callers can access only endpoints explicitly granted by active scopes.

**Independent Test**: Call internal endpoints with valid, missing, expired, and unrelated scopes and verify deterministic allow/deny outcomes independently from UI-driven user stories.

### Tests for User Story 3 ⚠️

- [x] T048 [P] [US3] Create `apps/api/test/contract/authorization-scopes.contract.spec.ts` for internal endpoint scope declarations and denial envelope coverage
- [x] T049 [P] [US3] Create `apps/api/test/integration/internal-scope.integration.spec.ts` for allow/deny behavior on missing, expired, revoked, and unrelated scopes
- [x] T050 [P] [US3] Modify `infra/perf/authorization-policy.k6.js` to validate internal scope decision latency and revocation-window enforcement

### Implementation for User Story 3

- [x] T051 [US3] Modify `apps/api/src/modules/authorization/adapters/permissions.decorator.ts` to declare required internal scopes on protected internal endpoints
- [x] T052 [US3] Modify `apps/api/src/modules/authorization/adapters/authorization.guard.ts` to enforce active-scope checks for service-principal identities
- [x] T053 [US3] Modify `apps/api/src/modules/authorization/application/authorization.service.ts` to evaluate required scopes and return deterministic internal denial results
- [x] T054 [US3] Modify `apps/api/src/config/auth.config.ts` to support internal-scope and service-principal authorization configuration
- [x] T055 [US3] Modify `packages/shared-types/src/index.ts` to expose service-principal and scope-grant types used by internal authorization flows

**Checkpoint**: All three user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish shared validation, documentation, and release-readiness checks across all stories.

- [x] T056 [P] Update `specs/003-auth-permission-framework/quickstart.md` to reflect the final executable verification steps from the implemented authorization flows
- [x] T057 [P] Update `specs/003-auth-permission-framework/contracts/openapi.yaml` to match final implemented slices and remove any stale planned/current mismatches
- [x] T058 Run `pnpm --filter api test` and `pnpm --filter api lint` to validate API authorization changes end-to-end
- [x] T059 Run `pnpm --filter web test`, `pnpm --filter web test:e2e`, and `pnpm --filter mobile test` to validate cross-client authorization behavior
- [x] T060 Run `pnpm perf:auth` and `k6 run infra/perf/media-list.k6.js` and `k6 run infra/perf/authorization-policy.k6.js` to capture performance evidence for the authorization budgets

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately
- **Foundational (Phase 2)**: depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: depends on Foundational completion
- **User Story 2 (Phase 4)**: depends on Foundational completion and can run after US1 foundation is stable, but remains independently testable
- **User Story 3 (Phase 5)**: depends on Foundational completion and may reuse US2 authorization primitives without depending on UI work
- **Polish (Phase 6)**: depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: MVP slice; no dependency on US2/US3
- **US2 (P2)**: depends on the same central authorization foundation as US1, but can be validated independently once role storage and policy evaluation exist
- **US3 (P3)**: depends on the same foundation plus service-principal support, but does not require web/mobile UI completion

### Within Each User Story

- Fail-first tests first
- Domain/data shape changes before service logic
- Service logic before controller/client integration
- Performance checks after the story behavior is working

---

## Parallel Opportunities

- **Setup**: T002-T004 can proceed in parallel after T001
- **Foundation**: T005-T010 can run in parallel by file ownership, then T011-T020 follow wiring order
- **US1**: T021-T025 run in parallel; T030-T034 can split across web/mobile after API paths T026-T029 stabilize
- **US2**: T036-T040 run in parallel; T045-T046 can proceed in parallel after API RBAC behavior exists
- **US3**: T048-T050 run in parallel; T051-T055 can split across decorator/guard/config/shared-types files

### Parallel Example: User Story 1

```bash
# Run fail-first tests in parallel
Task: "Create apps/api/test/contract/authorization-visibility.contract.spec.ts"
Task: "Create apps/api/test/integration/authorization-visibility.integration.spec.ts"
Task: "Create apps/web/test/integration/auth-visibility-ownership.integration.test.tsx"
Task: "Create apps/web/e2e/auth-visibility-ownership.e2e.spec.ts"
Task: "Create apps/mobile/test/integration/auth-visibility-ownership.integration.test.ts"
```

### Parallel Example: User Story 2

```bash
# Run client-side RBAC follow-up in parallel after API RBAC behavior lands
Task: "Modify apps/web/src/store/auth.store.ts"
Task: "Modify apps/mobile/src/services/api-client.ts"
```

### Parallel Example: User Story 3

```bash
# Split internal-scope work by file boundary
Task: "Modify apps/api/src/modules/authorization/adapters/permissions.decorator.ts"
Task: "Modify apps/api/src/config/auth.config.ts"
Task: "Modify packages/shared-types/src/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate owner/non-owner visibility and mutation behavior independently

### Incremental Delivery

1. Setup + Foundational establish the authorization substrate
2. Deliver US1 for end-user safety boundaries
3. Deliver US2 for staff RBAC and auditability
4. Deliver US3 for internal API scopes
5. Finish with cross-cutting validation and performance evidence

### Suggested MVP Scope

- **MVP**: Phase 1 + Phase 2 + Phase 3 (US1)
- Rationale: US1 delivers the highest-value unauthorized access protections and establishes the media-first authorization slice required by the plan

---

## Notes

- All tasks use the required checklist format with task ID, optional `[P]`, optional `[US#]`, and exact file paths.
- Tests are included because the feature spec and constitution require behavior-change automation.
- Planned post/comment/internal surfaces remain in tasks so implementation can stage them after the shared authorization substrate is ready.
