# Data Model - Authentication and Account Lifecycle

## UserAccount

- Purpose: Represents user identity and account status.
- Key fields:
  - `id`
  - `email` (canonicalized)
  - `displayName`
  - `passwordCredential`
  - `status` (`active`, `suspended`, `deleted`)
  - `verificationState` (`unverified`, `verified`)
  - `createdAt`
  - `updatedAt`
- Validation rules:
  - Email must be valid format and unique after canonicalization.
  - Password must satisfy minimum strength policy.
  - `displayName` length constrained by shared validation package.

## AuthSession

- Purpose: Represents a signed-in device/session context.
- Key fields:
  - `id`
  - `userId` (relation to UserAccount)
  - `deviceLabel`
  - `clientType` (`web`, `mobile`)
  - `ipAddress`
  - `lastActivityAt`
  - `expiresAt`
  - `revokedAt` (nullable)
  - `revokeReason` (nullable)
- Validation rules:
  - Session belongs to exactly one user.
  - Revoked sessions cannot transition back to active.

## RefreshCredential

- Purpose: Tracks refresh lifecycle and rotation lineage.
- Key fields:
  - `id`
  - `sessionId` (relation to AuthSession)
  - `credentialHash`
  - `lineageId`
  - `state` (`active`, `replaced`, `revoked`, `expired`)
  - `issuedAt`
  - `expiresAt`
  - `replacedById` (nullable)
- Validation rules:
  - Only one active refresh credential per session lineage step.
  - Replaced credential cannot be reused; reuse triggers lineage revocation.

## EmailVerificationRequest

- Purpose: Manages verification challenges for unverified accounts.
- Key fields:
  - `id`
  - `userId`
  - `challengeHash`
  - `state` (`pending`, `completed`, `expired`, `invalidated`)
  - `issuedAt`
  - `expiresAt`
  - `completedAt` (nullable)
- Validation rules:
  - Challenge is single-use and time-limited.
  - Resend invalidates prior pending challenge.

## PasswordResetRequest

- Purpose: Manages password recovery challenges.
- Key fields:
  - `id`
  - `userId`
  - `challengeHash`
  - `state` (`pending`, `consumed`, `expired`, `invalidated`)
  - `issuedAt`
  - `expiresAt`
  - `consumedAt` (nullable)
- Validation rules:
  - Request flow response must not reveal account existence.
  - Challenge is single-use and time-limited.
  - Successful consumption forces revocation of all active sessions for user.

## AuthAuditEvent

- Purpose: Immutable lifecycle log for security-sensitive actions.
- Key fields:
  - `id`
  - `userId` (nullable when unknown identity)
  - `eventType` (`register`, `sign_in`, `sign_out`, `refresh`, `verify_email`, `password_reset`, `session_revoke`)
  - `result` (`success`, `failure`)
  - `sessionId` (nullable)
  - `deviceLabel` (nullable)
  - `ipAddress` (nullable)
  - `createdAt`
- Validation rules:
  - Events are append-only.
  - Event type and result are mandatory.

## Relationships

- `UserAccount` 1 - N `AuthSession`
- `AuthSession` 1 - N `RefreshCredential`
- `UserAccount` 1 - N `EmailVerificationRequest`
- `UserAccount` 1 - N `PasswordResetRequest`
- `UserAccount` 1 - N `AuthAuditEvent`

## State Transitions

- User verification:
  - `unverified -> verified` after successful verification challenge.
- Session lifecycle:
  - `active -> revoked` on sign-out/session revoke/password reset/reuse detection.
  - `active -> expired` on time boundary.
- Refresh lifecycle:
  - `active -> replaced` on successful rotation.
  - `active -> revoked` on manual revoke/reuse detection.
  - `active -> expired` on time boundary.
- Password reset lifecycle:
  - `pending -> consumed` on successful reset.
  - `pending -> expired` on time boundary.
  - `pending -> invalidated` on newer request.
