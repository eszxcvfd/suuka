# Quickstart - User Profile Service and Personal Profile

## Prerequisites

- Node.js 20+
- pnpm 9+
- MongoDB available for the API app
- Cloudinary environment variables configured for avatar/media-backed flows
- Optional: Playwright browsers installed for web E2E
- Optional: k6 installed for performance validation

## Install workspace dependencies

```bash
pnpm install
```

## Start local services

```bash
pnpm dev
```

Expected: API, web, and mobile apps start without configuration errors.

## Fail-first workflow expectation

Before implementation of each profile capability, add or update tests and confirm failure:

```bash
pnpm --filter api test
pnpm --filter web test
pnpm --filter mobile test
```

Expected: new profile tests fail before implementation and pass after implementation.

## Expected implementation verification sequence

### 1. API quality gates

```bash
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api test
```

Expected evidence:

- contract tests cover profile read/update, username collision handling during save, avatar update behavior, and non-revealing private-profile outcomes
- integration tests verify owner-vs-viewer behavior and non-revealing hidden-profile reads

### 2. Web and mobile client verification

```bash
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter mobile lint
pnpm --filter mobile typecheck
pnpm --filter mobile test
```

Expected evidence:

- profile forms show loading, validation, success, and failure states consistently
- web and mobile clients render updated profile data from profile endpoints without requiring expanded auth session payloads
- owner and viewer states stay aligned with the selected visibility setting

### 3. Web end-to-end checks

```bash
pnpm --filter web test:e2e
```

Expected scenarios:

- owner can open profile settings, update editable fields, and observe saved values
- owner receives a stable validation error when attempting to claim an already-used username
- public profile can be viewed by another signed-in user
- private profile cannot be viewed by an unauthorized signed-in user

### 4. Performance validation

Existing baselines:

```bash
pnpm perf:auth
```

Profile-specific validation to add during implementation:

```bash
k6 run infra/perf/profile-read.k6.js
k6 run infra/perf/profile-save.k6.js
```

Expected performance evidence:

- profile read latency p95 remains under 400ms during normal load
- username validation and visibility updates during profile save p95 remain under 500ms
- profile save confirmation p95 remains under 3s

## Implemented profile surfaces

- `GET /v1/profiles/me` — owner editable profile read
- `PATCH /v1/profiles/me` — owner profile update for `displayName`, `bio`, `username`, `externalLinks`, and `accountVisibility`
- `PATCH /v1/profiles/me/avatar` — owner avatar reference update
- `GET /v1/profiles/{accountId}` — viewer/owner profile read with non-revealing `404` behavior for hidden private profiles

## Manual acceptance checklist

### User Story 1 - Edit core profile

1. Sign in as a regular user and open the profile settings surface.
2. Update display name and bio.
3. Save the profile and confirm the new values appear on subsequent profile reads.
4. Attempt an invalid edit and confirm the profile is not changed.

### User Story 2 - Public identity and presentation

1. Claim a new unique username and confirm success.
2. Attempt to claim a username already used by another account and confirm a stable validation error.
3. Add or replace avatar and at least one external link.
4. Confirm updated profile presentation is visible on owner and viewer-facing profile surfaces.

### User Story 3 - Basic privacy

1. Set the profile to `public` and confirm another signed-in user can view the profile.
2. Set the profile to `private` and confirm the owner still sees the full profile.
3. Confirm an unauthorized viewer no longer sees restricted profile details after the privacy change.
