# Data Model - 001-react-rn-nest-stack

## Entity: User

- Description: Primary account identity used across web and mobile clients.
- Fields:
  - `id` (string, immutable)
  - `email` (string, unique, required, normalized)
  - `passwordHash` (string, required)
  - `displayName` (string, required, 2-60 chars)
  - `avatarMediaId` (string, optional)
  - `status` (enum: `active`, `suspended`, `deleted`)
  - `createdAt` (datetime)
  - `updatedAt` (datetime)
- Validation rules:
  - Email MUST be valid format and unique.
  - Password hash MUST never be exposed in API responses.

## Entity: Session

- Description: Session and refresh-token lifecycle record.
- Fields:
  - `id` (string, immutable)
  - `userId` (string, required, reference User)
  - `refreshTokenHash` (string, required)
  - `expiresAt` (datetime, required)
  - `revokedAt` (datetime, optional)
  - `deviceInfo` (string, optional)
  - `ipAddress` (string, optional)
  - `createdAt` (datetime)
- Validation rules:
  - Expired or revoked sessions MUST fail refresh.
  - One compromised session MUST be revocable without revoking all users.

## Entity: MediaAsset

- Description: Metadata for user-uploaded media stored in Cloudinary.
- Fields:
  - `id` (string, immutable)
  - `ownerUserId` (string, required, reference User)
  - `publicId` (string, required, Cloudinary unique id)
  - `secureUrl` (string, required)
  - `resourceType` (enum: `image`, `video`, `raw`)
  - `format` (string, required)
  - `bytes` (number, required)
  - `width` (number, optional)
  - `height` (number, optional)
  - `status` (enum: `uploaded`, `processing`, `ready`, `failed`, `deleted`)
  - `createdAt` (datetime)
  - `updatedAt` (datetime)
- Validation rules:
  - Allowed upload types MUST be enforced before Cloudinary upload.
  - Metadata write MUST be idempotent per `publicId`.

## Relationships

- `User (1) -> (many) Session`
- `User (1) -> (many) MediaAsset`
- `MediaAsset (0..1) -> (1) User` as avatar reference via `avatarMediaId`

## State Transitions

### Session

- `active -> revoked` on logout or security event.
- `active -> expired` when `expiresAt` is reached.

### MediaAsset

- `uploaded -> processing -> ready`
- `uploaded -> failed` when storage/validation fails.
- `ready -> deleted` on user delete request or retention policy.
