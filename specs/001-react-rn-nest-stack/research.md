# Phase 0 Research - 001-react-rn-nest-stack

## Decision 1: Use a monorepo with `apps/` and `packages/`

- Decision: Use a TypeScript monorepo structure with `apps/api`, `apps/web`,
  `apps/mobile`, and shared packages for contracts and validation.
- Rationale: Shared contracts reduce API drift between web and mobile and improve
  consistency in user-facing behavior.
- Alternatives considered:
  - Separate repositories for each app: rejected due to duplicate contract maintenance.
  - Single app repository with backend subfolder only: rejected due to poor mobile/web
    separation.

## Decision 2: Web stack is React + Tailwind

- Decision: Use React with Tailwind CSS for web UI development.
- Rationale: Matches user requirement and enables fast, consistent UI assembly with
  reusable utility patterns.
- Alternatives considered:
  - CSS Modules only: rejected because design token consistency is slower to enforce.
  - Component library first: rejected for MVP speed and flexibility.

## Decision 3: Mobile stack is React Native with Expo

- Decision: Use React Native with Expo managed workflow for mobile app delivery.
- Rationale: Faster MVP setup and streamlined developer workflow for iOS and Android.
- Alternatives considered:
  - Bare React Native CLI: rejected for higher early setup complexity.
  - Flutter: rejected because user explicitly requested React Native.

## Decision 4: Backend stack is NestJS modular monolith with Clean Architecture

- Decision: Implement backend with NestJS and per-module Clean Architecture layers:
  domain, application, infrastructure.
- Rationale: Provides clear dependency boundaries while retaining practical NestJS
  productivity.
- Alternatives considered:
  - Layered MVC only: rejected due to higher risk of framework leakage into business logic.
  - Microservices from day one: rejected as unnecessary complexity for MVP scope.

## Decision 5: Data persistence and cache architecture

- Decision: Use MongoDB Atlas as source of record and Redis for session/cache concerns.
- Rationale: Fits document-centric user/media data and supports low-latency repeated reads.
- Alternatives considered:
  - SQL primary database: rejected due to explicit MongoDB Atlas requirement.
  - In-memory cache only in API process: rejected because it does not scale across instances.

## Decision 6: Media pipeline via Cloudinary through backend

- Decision: Upload media through backend to Cloudinary and store metadata in MongoDB.
- Rationale: Centralized validation/security and simpler auditability for MVP.
- Alternatives considered:
  - Direct client upload with signatures from day one: deferred to later scale phase.
  - Local object storage emulation in production: rejected due to cloud portability limits.

## Decision 7: Shared contracts and validation

- Decision: Maintain shared DTO and schema definitions in `packages/shared-types` and
  `packages/validation`.
- Rationale: Reduces duplicated logic and keeps web/mobile/backend behavior aligned.
- Alternatives considered:
  - Backend-only contract ownership: rejected because frontend/mobile drift risk increases.
  - Code generation-first workflow: deferred until contract volume grows.

## Decision 8: Test strategy across all apps

- Decision: Use platform-appropriate tests with fail-first behavior for functional changes.
- Rationale: Aligns with constitution testing standards and provides coverage at unit,
  integration, and end-to-end levels.
- Alternatives considered:
  - E2E-only strategy: rejected due to slow feedback and weak root-cause isolation.
  - Unit-only strategy: rejected due to missing cross-service integration confidence.

## Decision 9: Performance targets and validation

- Decision: Track auth/media API p95 latency, web LCP, and mobile first-interaction metrics.
- Rationale: Aligns with constitution requirement for explicit performance budgets.
- Alternatives considered:
  - No explicit budgets until post-MVP: rejected due to high regression risk.
  - Overly strict day-one SLOs: rejected to avoid premature optimization.
