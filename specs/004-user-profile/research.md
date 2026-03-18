# Research - User Profile Service and Personal Profile

## Decision 1: Extend the existing user persistence model for profile fields

- **Decision**: Add username, bio, avatar reference, external links, and profile audit metadata to the existing persisted user/account model rather than creating a separate profile collection for this feature.
- **Rationale**: The current code already persists `displayName`, `accountVisibility`, role, status, and email on `UserModel`, and the current auth/profile-adjacent write paths already flow through `UserRepository`. Extending that model keeps the MVP inside existing auth and authorization boundaries and avoids a second identity record that would immediately need synchronization.
- **Alternatives considered**:
  - Separate `profiles` collection: rejected because it adds consistency and join complexity before the product has field-level privacy or multi-profile use cases.
  - Fully auth-controller-only profile handling without a profile module: rejected because profile read/update contracts are a distinct surface and would make auth controllers too broad.

## Decision 2: Use a dedicated `profiles` API surface while reusing auth identity context

- **Decision**: Introduce profile-specific read/update endpoints under a dedicated `profiles` module, while continuing to rely on the authenticated principal from the existing auth stack.
- **Rationale**: The repo currently has no implemented profile controller, while planned authorization contracts already reserve `/profiles/{accountId}` as a future profile read surface. A dedicated module keeps profile logic cohesive without inventing a new authentication path.
- **Alternatives considered**:
  - Add all profile mutations to `/auth/*`: rejected because profile editing is broader than authentication/account lifecycle.
  - Internal-only profile service layer without public profile routes: rejected because the feature explicitly requires personal profile management and public profile reading behavior.

## Decision 3: Treat username uniqueness as canonicalized application logic plus DB-enforced integrity

- **Decision**: Canonicalize usernames for uniqueness checks and persist a canonical unique value backed by a database unique index, while mapping duplicate-key failures into stable profile validation errors.
- **Rationale**: External references show strong precedent for separating presentation form from canonical uniqueness form, and Mongoose’s `unique` option is an index helper rather than a request validator. This means the plan must include both request-level validation and duplicate-key handling at persistence time.
- **Alternatives considered**:
  - Request-time availability checks only: rejected because they are race-prone and do not guarantee integrity.
  - Raw case-sensitive uniqueness: rejected because it allows visually duplicated namespaces and inconsistent lookup semantics.

## Decision 4: Keep `displayName` and username as separate fields

- **Decision**: Preserve `displayName` as the editable human-readable name already used in the repo, and add username as a separate unique public identifier.
- **Rationale**: Existing signup flows, shared types, and UI surfaces already rely on `displayName`. The feature spec also distinguishes profile editing from username uniqueness, which points to two different user-facing concepts rather than renaming the current field.
- **Alternatives considered**:
  - Replace `displayName` with username: rejected because it breaks existing terminology and reduces profile flexibility.
  - Keep username optional and ephemeral: rejected because the feature explicitly requires username uniqueness as part of the profile service.

## Decision 5: Reuse `accountVisibility` for MVP profile privacy

- **Decision**: Implement basic profile privacy by aligning profile visibility with the existing `accountVisibility` public/private model rather than introducing per-field privacy controls or a second privacy flag.
- **Rationale**: The current code, shared types, validation, and authorization flow already understand `accountVisibility`, and the feature scope only asks for “basic privacy settings.” Reusing that model minimizes policy drift and keeps the MVP aligned with the authorization framework already planned in feature `003`.
- **Alternatives considered**:
  - Separate profile-only visibility field: rejected because it creates overlapping privacy semantics immediately.
  - Granular field-level privacy controls: rejected because the feature explicitly scopes only basic privacy.

## Decision 6: Model avatar as a media-backed reference resolved into profile reads

- **Decision**: Treat avatar as a profile field backed by the media/Cloudinary stack, storing a durable reference in the user profile and returning a resolved avatar URL in profile read responses.
- **Rationale**: The repo already contains a media module, shared media types, and a Cloudinary client scaffold. Using those surfaces is simpler than inventing a second asset subsystem, while still letting the profile contract stay user-focused.
- **Alternatives considered**:
  - Store only raw external avatar URLs on the user document: rejected because it weakens ownership and lifecycle control.
  - Build a separate avatar storage path unrelated to media: rejected because it duplicates existing asset concerns with no current product benefit.

## Decision 7: Validate external links as public, security-sensitive profile input

- **Decision**: Restrict public profile links to normalized web URLs with an explicit scheme allowlist, and reject malformed or unsafe forms before persistence.
- **Rationale**: External profile links are public-facing and should not be treated like freeform text. External references support strict URL parsing and scheme constraints for public profile links, and the feature scope only calls for website/external links rather than arbitrary protocol handlers.
- **Alternatives considered**:
  - Accept any string and defer validation to the client: rejected because it creates unsafe and inconsistent profile rendering.
  - Support every URI scheme from day one: rejected because it increases security review scope and user confusion for an MVP.

## Decision 8: Layer validation across transport, domain contracts, and persistence

- **Decision**: Define profile request/response contracts in shared Zod-backed schemas, validate request payloads at the API boundary, and rely on Mongoose plus database indexes for persistence-level enforcement.
- **Rationale**: The repo already uses shared types and Zod for auth and media validation. External references support keeping read contracts and mutable update contracts separate, and Mongoose update operations require explicit validator handling for update safety.
- **Alternatives considered**:
  - Validation only in the frontend: rejected because API contracts must remain trustworthy across web and mobile.
  - Validation only in Mongoose: rejected because API errors become less precise and contract drift becomes more likely.

## Decision 9: Keep profile read/update contracts separate

- **Decision**: Define distinct contracts for reading profiles and updating the current user’s profile, rather than reusing the same schema for both directions.
- **Rationale**: Read responses include resolved presentation fields and privacy-filtered output, while update requests should contain only mutable input. This separation reduces accidental write exposure and matches the repo’s growing contract-first pattern.
- **Alternatives considered**:
  - Single shared full-profile schema for reads and writes: rejected because it exposes immutable/system-managed fields in mutation contracts.
  - Endpoint-per-field contracts only: rejected because it fragments a coherent profile edit workflow.

## Decision 10: Keep profile reads separate from auth session payloads

- **Decision**: Continue to return minimal auth session data from sign-in and refresh flows, and load richer editable profile data through profile endpoints rather than expanding auth session payloads in this feature.
- **Rationale**: Existing auth/web/mobile flows currently depend on small session user shapes. Keeping richer profile data behind dedicated profile reads avoids unnecessary auth contract churn while still letting profile surfaces fetch what they need.
- **Alternatives considered**:
  - Expand auth session responses immediately with full profile fields: rejected because it broadens current auth contracts beyond lifecycle needs.
  - Keep all profile state client-local after edit: rejected because it weakens cross-surface consistency.

## Decision 11: Preserve current planning maturity level from feature `003`

- **Decision**: Author `data-model.md`, `contracts/openapi.yaml`, and `quickstart.md` at the same level of detail used in `003-auth-permission-framework`, including explicit verification steps and rollout metadata.
- **Rationale**: The repo’s newest planning artifacts already establish the quality bar for constitution checks, OpenAPI metadata, and quickstart validation. Matching that maturity keeps the feature package consistent and ready for `tasks.md` generation.
- **Alternatives considered**:
  - Minimal placeholder planning artifacts: rejected because the repo’s current planning flow expects detailed Phase 0/1 outputs.
