<!--
Sync Impact Report
- Version change: unversioned template -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. Code Quality as a Merge Gate
  - Template Principle 2 -> II. Testing Standards are Non-Negotiable
  - Template Principle 3 -> III. User Experience Consistency by Default
  - Template Principle 4 -> IV. Performance Budgets are Required
  - Template Principle 5 -> V. Maintainability and Simplicity First
- Added sections:
  - Engineering Standards
  - Delivery Workflow and Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ .opencode/command/speckit.constitution.md
  - ⚠ pending: runtime guidance docs (README.md/docs not present in repository)
- Follow-up TODOs:
  - None
-->
# Suuka Constitution

## Core Principles

### I. Code Quality as a Merge Gate
All changes MUST pass formatting, linting, and static checks before review approval.
Code MUST remain readable, intentionally named, and scoped to the minimum change needed.
Pull requests MUST include clear rationale for non-trivial design choices.
Rationale: high code quality reduces regressions and keeps maintenance cost predictable.

### II. Testing Standards are Non-Negotiable
Behavior changes MUST include automated tests that fail before the fix or feature and pass
after implementation. Test coverage MUST include the primary success path and relevant
failure paths. Flaky or timing-dependent tests MUST be stabilized before merge.
Rationale: deterministic tests are the main safeguard against silent regressions.

### III. User Experience Consistency by Default
User-facing changes MUST align with established interaction patterns, wording conventions,
accessibility expectations, and visual language. New flows MUST define loading, empty,
error, and success states. UX decisions that intentionally diverge from existing patterns
MUST be documented in the plan and reviewed explicitly.
Rationale: consistent UX improves learnability, trust, and product quality.

### IV. Performance Budgets are Required
Every feature plan MUST define measurable performance expectations for critical paths
(for example p95 latency, interaction responsiveness, or render targets). Implementations
MUST include validation steps proving those budgets are met before completion.
Performance regressions without approved exceptions MUST block merge.
Rationale: explicit budgets prevent gradual degradation and make trade-offs visible.

### V. Maintainability and Simplicity First
Designs MUST prefer the simplest solution that satisfies current requirements.
New abstractions, dependencies, or architectural complexity MUST be justified with
clear evidence that simpler alternatives are insufficient.
Rationale: simplicity preserves delivery speed and long-term adaptability.

## Engineering Standards

- Specifications MUST include measurable success criteria and explicit non-functional
  requirements for testing, UX consistency, and performance.
- Plans MUST define quality checks, test strategy, UX validation, and performance
  validation before implementation begins.
- Tasks MUST map work to independently testable user outcomes and include exact file paths
  for implementation and verification activities.
- Exceptions to any principle MUST be recorded in plan complexity tracking with rationale,
  impact, and reviewer sign-off.

## Delivery Workflow and Quality Gates

1. Specification gate: requirements are clear, testable, and measurable.
2. Planning gate: constitution checks pass and required quality/performance validation is
   planned.
3. Implementation gate: tests are written first for behavior changes, then code is
   implemented.
4. Review gate: reviewers confirm code quality, testing evidence, UX consistency, and
   performance evidence.
5. Completion gate: all required checks pass and no unresolved constitution violations
   remain.

## Governance

This constitution is the highest-priority engineering policy for this repository.
Amendments MUST be documented in the same change set as any dependent template updates,
must include a semantic version bump rationale, and MUST be approved in review.

Versioning policy:
- MAJOR: incompatible principle removals or redefinitions.
- MINOR: new principle or materially expanded guidance.
- PATCH: clarifications, wording improvements, or non-semantic edits.

Compliance review expectations:
- Every plan, task list, and implementation review MUST include constitution compliance.
- Violations MUST be fixed before merge or recorded as an explicit, time-bound exception.
- Exceptions MUST include owner, expiry, and follow-up action.

**Version**: 1.0.0 | **Ratified**: 2026-03-17 | **Last Amended**: 2026-03-17
