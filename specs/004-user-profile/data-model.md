# Data Model - User Profile Service and Personal Profile

## UserProfile

- Purpose: Represents the persisted personal profile associated with a single authenticated user account.
- Key fields:
  - `id`
  - `userId`
  - `email`
  - `displayName`
  - `username`
  - `usernameCanonical`
  - `bio`
  - `avatarMediaId` (nullable)
  - `avatarUrl` (derived/read-model field)
  - `accountVisibility` (`public`, `private`)
  - `status` (`active`, `suspended`, `deleted`)
  - `createdAt`
  - `updatedAt`
- Validation rules:
  - Every authenticated user account has exactly one profile record.
  - `displayName` remains required and follows the shared validation constraints already used by signup.
  - `username` must be unique after canonicalization and must not rely on request-time checks alone.
  - Private profiles must still be fully readable/editable by the profile owner.

## ProfileAvatar

- Purpose: Represents the avatar currently associated with a user profile.
- Key fields:
  - `userId`
  - `mediaAssetId`
  - `publicUrl`
  - `state` (`pending`, `active`, `failed`, `removed`)
  - `updatedAt`
- Validation rules:
  - At most one avatar is active for a profile at a time.
  - Failed avatar processing must not remove previously active profile data silently.
  - Removing an avatar must result in a stable fallback presentation for profile surfaces.

## ExternalProfileLink

- Purpose: Stores a user-managed outbound link shown on a public profile.
- Key fields:
  - `id`
  - `userId`
  - `label`
  - `url`
  - `normalizedUrl`
  - `sortOrder`
  - `state` (`active`, `removed`)
- Validation rules:
  - Links must pass URL parsing and scheme allowlist validation before persistence.
  - Duplicate normalized links for the same profile should be rejected.
  - Sort order must be deterministic for profile rendering.

## ProfileChangeEvent

- Purpose: Immutable audit record for profile mutations that affect public identity or privacy.
- Key fields:
  - `id`
  - `userId`
  - `eventType` (`display_name_updated`, `username_updated`, `bio_updated`, `avatar_updated`, `links_updated`, `visibility_updated`)
  - `result` (`success`, `failure`)
  - `detail` (nullable)
  - `createdAt`
- Validation rules:
  - Profile change events are append-only.
  - Privacy, username, avatar, and external-link mutations must be recorded.

## Relationships

- `UserProfile` 1 - 1 authenticated user account
- `UserProfile` 1 - 0..1 active `ProfileAvatar`
- `UserProfile` 1 - N embedded `ExternalProfileLink`
- `UserProfile.accountVisibility` is the active privacy state for profile reads
- `UserProfile` 1 - N `ProfileChangeEvent`
- `ProfileAvatar` links to an existing media asset record or media-backed storage reference

## State Transitions

- Profile visibility:
  - `public <-> private` on owner-authorized profile updates.
- Avatar lifecycle:
  - `pending -> active` on successful upload resolution.
  - `pending -> failed` on upload/processing failure.
  - `active -> removed` on explicit avatar removal.
- External link lifecycle:
  - `active -> removed` on explicit deletion.
- Username lifecycle:
  - canonical username remains active until replaced by a new canonical-unique value.
  - duplicate canonical username assignments must fail atomically at persistence time.

## Planned Existing-Model Extensions

- `apps/api/src/modules/auth/infrastructure/user.schema.ts` should gain persisted fields for `username`, `usernameCanonical`, `bio`, `avatarMediaId`, and embedded external-link metadata needed by profile reads.
- `packages/shared-types/src/index.ts` should extend `UserProfile` beyond `displayName` and `accountVisibility` to cover the profile fields returned to clients.
- `packages/validation/src/` should add profile-specific schemas for read/update payloads and link validation.
- The future `profiles` API module should orchestrate profile read/update behavior, but profile persistence should continue to reuse the current user repository boundary unless later requirements justify splitting storage.
- Username uniqueness should be represented by canonical fields and indexes on the existing user model rather than by a separate reservation collection for the MVP.
