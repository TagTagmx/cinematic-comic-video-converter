# Post-Spike Automation Suggestion System Plan

T0053 resolves the post-spike automation roadmap decision. The project should define a generic suggestion workflow/foundation before implementing T0052A or any smart camera path prototype.

This is a documentation planning result only. It does not implement source code, editor UI, Project JSON schema changes, preview behavior, export behavior, OCR, AI, panel detection, dependencies, audio, or multi-page support.

## Decision

The next safe phase is a generic suggestion system foundation.

T0052A should not directly create permanent Camera Shots, Focus Regions, or Shot Attention Paths. Future automation should first share a temporary suggestion model and review workflow so panel detection, text-weight timing, and smart camera path generation all behave the same way:

1. Create temporary suggestions.
2. Let the user review and correct them.
3. Commit only explicitly accepted suggestions into normal project data.
4. Keep manual editing available before and after acceptance.

This avoids a brittle all-in-one generator and keeps user intent higher priority than detected or inferred data.

## Temporary Suggestions

A temporary suggestion is a non-committed recommendation produced by a future automation feature or manual-assisted workflow.

Temporary suggestions:

- Are not normal Camera Shots, Focus Regions, Shot Attention Path items, timing values, or purpose metadata yet.
- Can be shown, selected, edited, deleted, reordered, regenerated, or ignored.
- Should not affect preview playback, canvas export, Project JSON export/import, or timeline behavior until accepted.
- Should be safe to discard without changing project data.
- Should clearly identify their source, such as panel heuristic, text-weight analysis, smart draft, or user-assisted generation.

Temporary suggestions are a review layer, not the project source of truth.

## Suggestion Types

Future features can produce several suggestion types through one workflow.

### Camera Shot Suggestions

Camera Shot suggestions are proposed timeline reading containers over the intact page.

They may come from accepted panel candidates, existing manual shots, page composition, reading-order hints, or smart draft logic. They must remain editable full-page camera framing containers and must not become destructive panel crops.

### Focus Region Suggestions

Focus Region suggestions are proposed page-level attention targets.

They may represent speech/caption areas, faces, action details, reveal details, signs, objects, or other attention targets. They must remain reusable page-level regions and must not become replacement camera frames or shot-owned child records.

### Shot Attention Path Suggestions

Shot Attention Path suggestions are proposed ordered references from a Camera Shot to page-level Focus Regions.

They should reference existing or accepted Focus Regions by ID after acceptance. They should not copy focus-region geometry, transfer ownership, or make Focus Regions timeline destinations.

### Timing Suggestions

Timing suggestions are proposed edits to existing timing fields, such as `durationMs`, `sceneHoldRatio`, and `focusAttentionRatio`.

They may come from purpose metadata, text-weight notes, reading complexity, shot count, or attention-path length. They must remain recommendations until explicitly accepted.

### Purpose Metadata Suggestions

Purpose suggestions are proposed values for `shotPurpose`, `focusPurpose`, or `outgoingTransitionPurpose`.

They should explain why a purpose was suggested and should never override user-authored intent without explicit acceptance.

### Warning And Confidence Notes

Warning and confidence notes explain uncertainty.

Examples include unclear reading order, low-confidence panel boundaries, dense text without reliable OCR, overlapping panels, splash-page ambiguity, or fragile webtoon/manga flow assumptions. These notes may remain advisory and may never need to become project data.

## Temporary UI State

Most suggestion data should stay in temporary UI state for an initial implementation:

- Suggestion IDs.
- Suggestion type.
- Proposed geometry.
- Proposed order.
- Proposed timing values.
- Proposed purpose metadata.
- Proposed Shot Attention Path membership/order.
- Confidence level.
- Source/reason notes.
- Rejected/hidden state.
- Edited draft values before acceptance.

Temporary UI state is appropriate while suggestions are review-only and can be regenerated.

## Accepted Project Data

Only explicit acceptance should create or update normal project data:

- Accepted Camera Shot suggestions become normal editable Camera Shots.
- Accepted Focus Region suggestions become normal page-level Focus Regions.
- Accepted Shot Attention Path suggestions become ordered references on a Camera Shot to page-level Focus Regions.
- Accepted timing suggestions update normal editable timing fields.
- Accepted purpose suggestions update normal purpose metadata fields.

Rejected or ignored suggestions should not change project data. Deleting a Camera Shot suggestion should not delete any accepted Focus Region. Deleting an accepted Camera Shot should preserve page-level Focus Regions by default, matching current behavior.

## Persistence And Schema

Suggestion data should not be persisted in Project JSON during the first suggestion-foundation phase.

Persisting suggestions would require a separate future schema ticket because it raises several questions:

- Whether unaccepted suggestions belong in project files.
- How to preserve suggestion source and confidence.
- How to handle stale suggestions after user edits.
- Whether rejected suggestions should be remembered.
- How to migrate temporary suggestion formats.

Until a schema ticket explicitly scopes persisted suggestions, Project JSON should remain the source of truth for accepted project data only.

## User Workflow

The shared suggestion workflow should support:

- Accept one suggestion.
- Accept a selected group.
- Accept all visible suggestions.
- Edit geometry before accepting.
- Edit timing or purpose values before accepting.
- Delete or reject suggestions without changing project data.
- Reorder Camera Shot suggestions before accepting.
- Reorder Shot Attention Path suggestions before accepting.
- Regenerate suggestions while preserving accepted project data by default.
- Ignore suggestions and continue manual editing.

Accepted data must remain editable with the existing manual tools.

## User-Authored Data Priority

User-authored project data should outrank generated suggestions:

- Existing Camera Shots should not be replaced unless the user explicitly chooses replacement.
- Existing Focus Regions should be reused rather than duplicated where possible.
- Existing Shot Attention Paths should be preserved unless the user asks to regenerate path suggestions.
- Existing timing and purpose metadata should be treated as intentional.
- Manual edits after suggestion generation should make stale suggestions lower confidence or require regeneration.

Automation should assist correction, not compete with the user as the source of truth.

## Shared Review Workflow

Panel detection, OCR/text-weight timing, and smart camera path generation should share one review workflow:

- Panel detection can create Camera Shot and Focus Region suggestions.
- OCR/text-weight analysis can create timing, Focus Region, purpose, warning, and confidence suggestions.
- Smart camera path generation can combine accepted/manual data into Camera Shot order, Shot Attention Path, timing, and purpose suggestions.

Using one suggestion review model avoids three separate automation UX patterns and makes future automation predictable.

## Why T0052A Should Wait

T0052A should not be the immediate implementation step because a smart draft prototype needs somewhere safe to put generated output.

Without a generic suggestion foundation, T0052A would have to either:

- Create permanent Camera Shots, Focus Regions, or Shot Attention Paths too early.
- Invent a one-off temporary state model that panel and text workflows later duplicate.
- Blur the difference between suggestions and accepted project data.
- Risk overriding manual user intent.

The safer path is to define suggestion state first, then build review UI, then prototype smart drafting using the shared foundation.

## Recommended Follow-Up Order

The next ticket should be:

### T0054 - Temporary Suggestion State Model Plan

Define the TypeScript/data-shape plan for temporary in-memory suggestions without changing Project JSON schema. This should specify common fields, suggestion variants, source/confidence fields, and how suggestions refer to existing project data safely.

Recommended sequence after T0054:

1. T0055 - Suggestion Review UI Plan.
2. T0056 - Manual Suggestion Accept/Edit/Delete Workflow Prototype.
3. T0057 - Smart Camera Path Draft Prototype Using Existing Manual Data Only.
4. T0058 - Panel Suggestion Overlay Prototype.
5. T0059 - Text Weight Timing Suggestion Prototype.
6. T0060 - Accepted Shot Attention Path Preview/Export Parity Plan.
7. T0061 - Manual Mode Attention-Key Stepping Plan.
8. T0062 - Project Archive / Export Stabilization Reassessment.

This order builds a common review foundation before introducing higher-risk generation.

## Later Work Boundaries

Future tickets should keep these boundaries unless explicitly changed:

- No mandatory AI, OCR, or panel detection.
- No source page cropping or destructive panel extraction.
- No Focus Regions as camera frames.
- No automatic final video generation.
- No preview/export behavior changes without a dedicated ticket.
- No Project JSON schema changes without a dedicated schema ticket.
- No dependencies without explicit approval.

## Manual Verification

For T0053, verification is documentation-only:

- Confirm this plan recommends T0054 before T0052A.
- Confirm suggestions stay temporary until explicit acceptance.
- Confirm accepted suggestions become normal editable project data.
- Confirm Project JSON schema remains unchanged.
- Confirm Camera Shot, Focus Region, and Shot Attention Path semantics remain unchanged.
- Confirm no source code, package files, preview/export behavior, OCR, AI, panel detection, audio, or multi-page support changed.
