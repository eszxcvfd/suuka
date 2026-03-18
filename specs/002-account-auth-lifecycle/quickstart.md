# Quickstart - Authentication and Account Lifecycle

## Prerequisites

- Node and pnpm installed.
- MongoDB and Redis available via environment configuration used by API.
- Install dependencies at repository root.

## 1. Install and Baseline Check

```bash
pnpm install
pnpm lint
pnpm typecheck
```

Expected: all workspace lint and type checks pass.

## 2. Run API/Web/Mobile in Development

```bash
pnpm dev
```

Expected: API, web, and mobile dev servers start without runtime config errors.

## 3. Fail-First Test Workflow

Before implementation for each lifecycle capability, add or update tests and confirm failure:

```bash
pnpm --filter api test
pnpm --filter web test
pnpm --filter mobile test
```

Expected: newly added auth lifecycle tests fail before implementation and pass after implementation.

## 4. Contract and Integration Verification

```bash
pnpm --filter api test
pnpm --filter web test
pnpm --filter mobile test
pnpm --filter web test:e2e
```

Expected:

- API contract and integration tests validate sign-up/sign-in/sign-out/refresh/reset/verify/session endpoints.
- Web and mobile tests validate lifecycle UI and state behavior.
- Web E2E covers end-to-end auth lifecycle.

## 5. Performance Validation

```bash
k6 run infra/perf/auth.k6.js
k6 run infra/perf/refresh.k6.js
k6 run infra/perf/password-reset.k6.js
```

Expected:

- Sign-in p95 latency under 400ms.
- Refresh p95 latency under 400ms.
- Password-reset request p95 latency under 400ms.

## 6. UX Consistency Validation Checklist

For each new user-facing lifecycle flow (web and mobile), verify states are explicitly handled:

- Loading state
- Empty state (where applicable)
- Error state
- Success state

## 7. Completion Check

```bash
pnpm build
pnpm test
```

Expected: workspace build and tests pass before generating `tasks.md` and implementation handoff.

## Verification Notes (2026-03-17)

- `pnpm --filter api typecheck` and `pnpm --filter api test` passed after US1-US3 API implementation.
- `pnpm --filter web typecheck` and `pnpm --filter web test` passed after web lifecycle/session pages were added.
- `pnpm --filter mobile typecheck` and `pnpm --filter mobile test` passed after mobile recovery/session screens were added.
- `pnpm --filter web test:e2e` passed after adding Playwright config and browser install.
- Performance scripts passed using Dockerized k6 against local API:
  - `auth.k6.js`: p95 14.46ms, checks 100%
  - `refresh.k6.js`: p95 5.12ms, checks 100%
  - `password-reset.k6.js`: p95 13.28ms, checks 100%
- Docker k6 invocation used for host routing:
  - `docker run --rm --add-host host.docker.internal:host-gateway -e BASE_URL=http://host.docker.internal:3000 -v C:/Users/Admin/Documents/data/2026/project/web/suuka/infra/perf:/perf grafana/k6 run /perf/<script>.k6.js`
