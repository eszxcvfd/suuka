# Implementation Plan: User Profile Service and Personal Profile

**Branch**: `004-user-profile` | **Date**: 2026-03-18 | **Spec**: `specs/004-user-profile/spec.md`
**Input**: Feature specification from `specs/004-user-profile/spec.md`

## Summary

Add a dedicated profile-management slice on top of the existing authentication and authorization
foundation so authenticated users can edit profile details, claim a unique username, manage avatar,
bio, and external links, and apply basic public/private profile visibility. Implementation will
extend the existing persisted user document, add explicit profile read/update contracts, reuse the
current `accountVisibility` policy for basic privacy, and wire the new profile surfaces through the
existing API, web, mobile, shared-types, and validation packages without broadening auth-session
payloads by default.

## Technical Context

**Language/Version**: TypeScript 5.7 (workspace), NestJS 11 (API), React 19 (web), React Native 0.76 + Expo 52 (mobile)  
**Primary Dependencies**: NestJS core/common/jwt/mongoose/passport, Mongoose, Cloudinary SDK, Zod validation package, shared types package, React/Vite, Expo Secure Store  
**Storage**: MongoDB via Mongoose for user/profile state embedded in the existing user document, Cloudinary-backed media assets referenced by avatar fields, existing in-memory media list treated as temporary scaffolding that must be replaced or integrated before avatar persistence is production-ready  
**Testing**: Vitest (API contract/integration, web integration, mobile integration), Playwright (web E2E), k6 (profile read/save and username-check performance validation)  
**Target Platform**: Linux server API, modern web browsers, iOS/Android via Expo  
**Project Type**: Monorepo with API, web, mobile, shared workspace packages, and performance scripts  
**Performance Goals**: profile read p95 < 500ms, profile save confirmation p95 < 3s, username validation during profile save p95 < 500ms, visibility changes reflected on subsequent profile views within 1 minute  
**Constraints**: preserve existing `displayName` semantics, enforce DB-backed username uniqueness with canonicalization, reuse `accountVisibility` public/private model for MVP privacy, keep hidden-profile reads non-revealing, prevent profile edits from affecting auth/session/role state, keep editable profile data outside auth session responses unless later work explicitly expands them, define loading/empty/error/success states on new user-facing flows, keep design within existing module/package boundaries  
**Scale/Scope**: one personal profile per authenticated user across API/web/mobile, profile read/update support for all signed-in users, unique public username namespace, basic public/private visibility only, no granular per-field audiences or social graph approvals in this feature

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Gate Review

- **Code Quality Gate**: PASS - plan extends existing auth/media/shared package boundaries and avoids introducing a new service boundary outside the current monorepo structure.
- **Testing Gate**: PASS - plan requires fail-first API contract/integration tests plus web/mobile integration and web E2E coverage for profile behavior.
- **UX Consistency Gate**: PASS - plan explicitly includes loading, validation, success, empty, and denial states for profile editing and profile viewing.
- **Performance Gate**: PASS - measurable read/save/username-check budgets are defined and tied to k6 and acceptance validation.
- **Simplicity Gate**: PASS - design favors extending the current user document and visibility primitives instead of introducing separate profile collections or granular privacy framework.

### Post-Design Gate Review

- **Code Quality Gate**: PASS - design artifacts keep persistence changes in the existing auth user model, place profile orchestration in a dedicated API module, and centralize shared contract types in workspace packages.
- **Testing Gate**: PASS - contracts, data model, and quickstart map each story to contract, integration, E2E, and performance verification.
- **UX Consistency Gate**: PASS - quickstart requires consistent owner/viewer states across web and mobile profile surfaces.
- **Performance Gate**: PASS - design keeps profile reads and username checks inside the normal API request flow with explicit budgets and verification steps.
- **Simplicity Gate**: PASS - basic privacy is intentionally aligned to `accountVisibility`, persistence remains inside the current user model, and avatar is modeled as a media-backed reference rather than a parallel asset system.

## Project Structure

### Documentation (this feature)

```text
specs/004-user-profile/
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
│   │   │   │   └── infrastructure/
│   │   │   ├── authorization/
│   │   │   ├── media/
│   │   │   └── profiles/
│   └── test/
│       ├── contract/
│       └── integration/
├── web/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── app/pages/
│   ├── test/
│   └── e2e/
└── mobile/
    ├── src/
    │   ├── components/
    │   ├── screens/
    │   └── services/
    └── test/

packages/
├── shared-types/src/
└── validation/src/

infra/perf/
```

**Structure Decision**: Keep the existing monorepo layout, extend the persisted user model inside
the current auth infrastructure, and add a focused `profiles` API module for read/update contracts
instead of overloading auth controllers with profile CRUD. Web and mobile clients should add new
profile-focused services/screens while reusing existing auth session state, while loading rich
editable profile data from profile endpoints rather than auth session responses.

## Phase 0 Research Plan

- Resolve whether profile persistence should extend the existing user document or create a separate profile collection.
- Resolve username canonicalization, uniqueness, and duplicate-key handling semantics for MongoDB/Mongoose.
- Resolve avatar modeling against the existing media/Cloudinary surfaces, including how the client obtains a valid avatar media reference.
- Resolve how basic profile privacy should align with existing `accountVisibility` and authorization rules, including non-revealing read behavior for hidden profiles.
- Resolve validation and contract layering across Zod, shared types, Mongoose, and API responses.
- Resolve external link validation and public-profile safety constraints.
- Confirm repository planning/design artifact conventions and implementation surfaces before Phase 1 outputs.

Output: `specs/004-user-profile/research.md`

## Phase 1 Design Plan

- Define the canonical profile domain model as an extension of the existing user document, including username, avatar reference, bio, external links, `accountVisibility`, and audit events.
- Define API contracts for profile read, self-profile read/update, duplicate-username handling during save, avatar updates, and privacy updates.
- Define quickstart verification for API, web, mobile, E2E, and performance validation of profile flows.
- Update agent context via repository script after artifacts are written.

Outputs:

- `specs/004-user-profile/data-model.md`
- `specs/004-user-profile/contracts/openapi.yaml`
- `specs/004-user-profile/quickstart.md`
- Agent context update via `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode`

## Complexity Tracking

> No constitution violations identified at planning stage.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
