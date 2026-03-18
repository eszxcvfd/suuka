# Feature Specification: User Profile Service and Personal Profile

**Feature Branch**: `004-user-profile`  
**Created**: 2026-03-18  
**Status**: Draft  
**Input**: User description: "Tôi muốn: User profile service và hồ sơ cá nhân

Mục tiêu:

Quản lý thông tin người dùng

Phạm vi:

Edit profile

Avatar

Bio

Username uniqueness

Website/external links

Privacy settings cơ bản"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Edit core personal profile (Priority: P1)

As a signed-in user, I can update the core information on my personal profile so my identity is
accurate and recognizable across the product.

**Why this priority**: Core profile editing is the main user value of this feature and unlocks all
other profile-related experiences.

**Independent Test**: Can be fully tested by opening profile settings, changing profile details,
saving them, and verifying that the updated information appears anywhere the user profile is shown.

**Acceptance Scenarios**:

1. **Given** a signed-in user opens profile settings, **When** the user updates allowed profile
   fields and saves, **Then** the profile is stored and the latest values are shown on subsequent
   views.
2. **Given** a signed-in user submits invalid profile data, **When** validation runs, **Then** the
   profile is not updated and the user sees clear guidance about what must be corrected.
3. **Given** a signed-in user leaves profile changes unsaved, **When** the user leaves the editing
   flow, **Then** the system warns the user before discarding those changes.

---

### User Story 2 - Manage public identity and profile presentation (Priority: P2)

As a signed-in user, I can manage how I appear to other people through a unique username, avatar,
bio, and external links so my profile is personal and discoverable.

**Why this priority**: Public identity and presentation improve recognition and trust, but depend on
the baseline edit flow from P1.

**Independent Test**: Can be tested by creating or updating a username, avatar, bio, and profile
links, then checking how the profile appears to the owner and to another signed-in user.

**Acceptance Scenarios**:

1. **Given** a user enters a username that is not already in use, **When** the profile is saved,
   **Then** the username is reserved for that user and becomes part of the public profile.
2. **Given** a user enters a username that is already in use by another account, **When** the user
   attempts to save it, **Then** the change is rejected and the user is asked to choose a different
   username.
3. **Given** a user updates avatar, bio, or external links, **When** the profile is saved,
   **Then** the updated presentation appears on the user's profile without affecting unrelated
   account settings.

---

### User Story 3 - Control basic profile privacy (Priority: P3)

As a signed-in user, I can apply basic privacy settings to my profile so I can control whether my
profile is broadly visible or limited to authorized viewers.

**Why this priority**: Basic privacy control is important for user trust, but it depends on profile
data already existing and aligns with the broader visibility model already planned elsewhere.

**Independent Test**: Can be tested by changing profile visibility from public to private and
verifying that the owner still sees the full profile while unauthorized viewers see only the
allowed result.

**Acceptance Scenarios**:

1. **Given** a signed-in user sets the profile to public, **When** another allowed viewer opens the
   profile, **Then** the profile is visible with its public information.
2. **Given** a signed-in user sets the profile to private, **When** an unauthorized viewer requests
   the profile, **Then** access is denied or limited according to the privacy policy without
   exposing restricted profile details.
3. **Given** a profile owner changes privacy settings, **When** the change is saved, **Then** the
   new visibility rules apply to subsequent profile views.

### Edge Cases

- User attempts to save a username that differs only by letter case, spacing normalization, or
  punctuation from an existing username.
- User removes an existing avatar, bio, or external link and expects prior public data to disappear
  from future profile views.
- User submits malformed, duplicate, or unsupported external links.
- User saves profile changes while another session is editing the same profile.
- User switches profile visibility while another person is actively viewing the profile.
- Suspended or deleted accounts still have existing profile data in prior views or cached surfaces.
- Username becomes referenced by older links after the user changes it.
- Avatar upload or replacement fails after other profile fields were updated successfully.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a personal profile for each signed-in user account.
- **FR-002**: System MUST allow a signed-in user to view and edit the user's own profile.
- **FR-003**: System MUST allow a signed-in user to update the user's display name.
- **FR-004**: System MUST allow a signed-in user to add, replace, or remove a profile avatar.
- **FR-005**: System MUST allow a signed-in user to add, edit, or remove a profile bio.
- **FR-006**: System MUST allow a signed-in user to claim and update a username that is unique
  across all active user profiles.
- **FR-007**: System MUST reject any username that is already reserved by another active user
  profile.
- **FR-008**: System MUST preserve a user's current username when the user edits other profile
  fields without changing it.
- **FR-009**: System MUST allow a signed-in user to add, edit, reorder, and remove website or
  external profile links.
- **FR-010**: System MUST validate external links before saving them to the profile.
- **FR-011**: System MUST support a basic profile privacy setting that lets a user choose whether
  the profile is public or private.
- **FR-012**: System MUST apply the selected profile privacy setting to subsequent profile-view
  requests.
- **FR-013**: System MUST allow the profile owner to view and edit the full profile regardless of
  privacy setting.
- **FR-014**: System MUST present clear save, validation, success, and failure states for profile
  editing actions.
- **FR-015**: System MUST ensure profile updates do not modify unrelated account lifecycle or role
  settings.
- **FR-016**: System MUST expose profile information consistently across profile surfaces that use
  user identity or presentation data.
- **FR-017**: System MUST keep an auditable record of profile changes affecting username, avatar,
  external links, and privacy state.
- **FR-018**: System MUST allow an authorized viewer to open a user's profile and see the profile
  fields permitted by that profile's current privacy setting.
- **FR-019**: System MUST prevent unauthorized viewers from accessing profile information restricted
  by a private profile setting.

### Quality Requirements _(mandatory)_

- **QR-001 Code Quality**: Changes MUST meet agreed linting, formatting, and static-analysis checks.
- **QR-002 Testing Standards**: Behavior changes MUST include automated tests that fail before
  implementation and pass after implementation.
- **QR-003 UX Consistency**: User-facing behavior MUST define consistent interaction states
  (loading, empty, error, success) and accessibility expectations.
- **QR-004 Performance Requirements**: Critical user journeys MUST include measurable performance
  targets for profile retrieval, save confirmation, and username availability validation.

### Key Entities _(include if feature involves data)_

- **UserProfile**: The user-facing profile record that represents identity and presentation data for
  one account.
- **UsernameReservation**: The unique public handle assigned to one active user profile at a time.
- **ProfileAvatar**: The current avatar associated with a user profile, including its active or
  removed state.
- **ExternalProfileLink**: A user-managed outbound profile link with destination, label, ordering,
  and active state.
- **ProfilePrivacySetting**: The visibility rule that determines whether profile details are shown
  publicly or restricted.
- **ProfileChangeEvent**: An auditable record of profile updates affecting public identity or
  privacy.

## Assumptions

- Existing authenticated account context is already available from the authentication lifecycle
  feature.
- Existing display name remains part of the profile and is not replaced by username.
- Username is a distinct public identifier separate from display name.
- Basic privacy in this scope means public or private profile visibility only; granular per-field
  audience controls are out of scope.
- Existing account visibility concepts can be reused or aligned so profile privacy does not create a
  conflicting visibility model.
- External links are limited to user-provided destinations intended for public profile display and
  do not include private contact methods.

## Dependencies

- Authentication lifecycle capabilities from `002-account-auth-lifecycle` are available so a signed-in
  user can manage the user's own profile.
- Authorization and visibility behavior from `003-auth-permission-framework` is available or aligned
  so profile privacy uses the same public/private policy language.
- Existing user identity surfaces that currently display `displayName` can consume expanded profile
  data once it is available.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 95% of signed-in users can complete a standard profile edit in under 2
  minutes.
- **SC-002**: At least 95% of valid profile save operations complete and confirm success in under 3
  seconds.
- **SC-003**: 100% of attempted username collisions are prevented during acceptance testing.
- **SC-004**: At least 90% of users can successfully add or update avatar, bio, and at least one
  external link on the first attempt.
- **SC-005**: 100% of public-to-private and private-to-public profile visibility changes are
  reflected on subsequent profile views during acceptance testing.
- **SC-006**: At least 90% of users can identify whether their profile is public or private without
  support assistance.
