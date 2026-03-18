# Implementation Plan: Cross-Platform Core Platform

**Branch**: `001-react-rn-nest-stack` | **Date**: 2026-03-17 | **Spec**: `C:\Users\Admin\Documents\data\2026\project\web\suuka\specs\001-react-rn-nest-stack\spec.md`
**Input**: Feature specification from `/specs/001-react-rn-nest-stack/spec.md`

## Discovery

**Q: Do we already have application code to extend?**  
A: No. Repository is greenfield with only Specify templates and planning artifacts.

**Q: Should we force one frontend stack for both web and mobile?**  
A: No. Web uses React + Tailwind; mobile uses React Native (Expo) with shared API contracts.

**Q: How should backend boundaries be defined?**  
A: Use NestJS modules with Clean Architecture layers: domain, application,
infrastructure, and adapter entrypoints.

**Q: How to integrate MongoDB Atlas, Redis, and Cloudinary safely?**  
A: MongoDB Atlas is the source of record, Redis for cache/session concerns,
Cloudinary for media storage with backend-managed signed upload flow.

**Research findings summary:**
- Monorepo is preferred for shared types and contracts across web/mobile/backend.
- Shared validation and DTO contracts reduce cross-platform drift.
- Clean Architecture boundaries are kept per backend module to avoid framework coupling.

## Summary

Build a monorepo-based product foundation with React + Tailwind web app, React Native
mobile app, and NestJS backend following Clean Architecture. The backend uses MongoDB
Atlas for persistence, Redis for cache/session support, and Cloudinary for media storage.
Design prioritizes consistent user flows, measurable performance budgets, and test-first
delivery for behavior changes.

## Non-Goals

- No production deployment automation or infrastructure-as-code in this phase.
- No advanced analytics, recommendation engines, or real-time streaming.
- No microservice split; backend remains a modular monolith.
- No feature-complete domain product beyond auth/profile/media foundation.

## Ghost Diffs

- Rejected: separate repositories per client/backend due to duplicated contracts and
  slower iteration.
- Rejected: SQL-first persistence for this phase due to user-requested MongoDB Atlas and
  document-oriented media metadata needs.
- Rejected: client-direct Cloudinary upload initially due to higher security complexity;
  backend-mediated signed flow chosen for MVP control.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 LTS  
**Primary Dependencies**: React 19, Tailwind CSS 4, React Native 0.76 (Expo SDK 52), NestJS 11, Mongoose 8, ioredis, cloudinary SDK  
**Storage**: MongoDB Atlas (primary), Redis (cache/session), Cloudinary (media object storage)  
**Testing**: Jest + Supertest (API), Vitest + React Testing Library (web), Jest + React Native Testing Library (mobile), Playwright (web E2E)  
**Target Platform**: Modern web browsers, iOS 16+, Android 10+
**Project Type**: Monorepo web + mobile + backend platform  
**Performance Goals**: API p95 < 400ms for auth and < 300ms for media list; web LCP < 2.5s; mobile first interactive screen < 2.0s  
**Constraints**: Clean Architecture dependency direction MUST be enforced; shared contracts across clients; secure media handling; no unresolved constitution gate violations  
**Scale/Scope**: MVP sized for first 5k MAU, 100k media assets, and progressive growth without major re-architecture

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality Gate**: PASS - monorepo includes lint, format, and static checks per app and shared package.
- **Testing Gate**: PASS - plan defines fail-first behavior tests and platform-specific test layers.
- **UX Consistency Gate**: PASS - spec requires shared UX state model (loading/empty/error/success) and shared API semantics.
- **Performance Gate**: PASS - explicit performance budgets are defined for auth, media list, and client responsiveness.
- **Simplicity Gate**: PASS - modular monolith selected over microservices; complexity deferred until scale requires it.

## Project Structure

### Documentation (this feature)

```text
specs/001-react-rn-nest-stack/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── api/
│   ├── src/
│   │   ├── modules/
│   │   ├── common/
│   │   └── main.ts
│   └── test/
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── services/
│   └── test/
└── mobile/
    ├── src/
    │   ├── screens/
    │   ├── components/
    │   └── services/
    └── test/

packages/
├── shared-types/
├── validation/
└── config/

infra/
└── docker/
```

**Structure Decision**: Use a single monorepo with `apps/` and `packages/` so clients and
backend share contracts while remaining deployable independently.

## Phase Outputs

### Phase 0 - Research

- Produce `research.md` with concrete decisions for architecture, integrations, and
  implementation patterns.

### Phase 1 - Design and Contracts

- Produce `data-model.md` from the spec entities and constraints.
- Produce `contracts/openapi.yaml` for backend API contracts.
- Produce `quickstart.md` for local setup and validation.
- Run `C:\Users\Admin\Documents\data\2026\project\web\suuka\.specify\scripts\powershell\update-agent-context.ps1 -AgentType opencode`.

## Post-Design Constitution Re-check

- **Code Quality Gate**: PASS - quickstart includes lint/typecheck/test verification steps.
- **Testing Gate**: PASS - contract, backend, web, and mobile test layers are defined.
- **UX Consistency Gate**: PASS - shared API contract and state-model expectations are
  codified in spec and contracts.
- **Performance Gate**: PASS - measurable targets are defined in spec and technical context.
- **Simplicity Gate**: PASS - architecture remains modular monolith and avoids early
  microservice complexity.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
