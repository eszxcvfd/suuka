# Quickstart - 001-react-rn-nest-stack

## Prerequisites

- Node.js 22 LTS
- pnpm 9+
- Docker Desktop (for local MongoDB/Redis)
- Cloudinary account credentials

## Environment Variables

Create `.env` files for apps with these minimum values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
```

## Install Dependencies

```bash
pnpm install
```

## Start Supporting Services (local)

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

## Run Applications

```bash
# API
pnpm --filter api dev

# Web
pnpm --filter web dev

# Mobile (Expo)
pnpm --filter mobile start
```

## Run Quality Checks

```bash
pnpm lint
pnpm test
pnpm typecheck
```

## Optional Extended Validation

```bash
# Web E2E shell test (requires Playwright setup)
pnpm --filter web test:e2e

# Performance smoke checks (requires k6)
k6 run infra/perf/auth.k6.js
k6 run infra/perf/media-list.k6.js
```

## Validate Core Flow

1. Sign up and sign in from web.
2. Upload one media file from web.
3. Sign in from mobile using same account.
4. Verify uploaded media is visible in mobile list.
5. Confirm API health endpoint returns success.
6. Confirm notifications endpoint returns default payload at `/v1/notifications`.

## Expected Result

Web and mobile authenticate against the same NestJS backend, media uploads are persisted
in Cloudinary with metadata in MongoDB, and Redis-backed session/cache behavior is active.
US3 scaffolding endpoint (`/v1/notifications`) and CI/performance scripts are also present.
