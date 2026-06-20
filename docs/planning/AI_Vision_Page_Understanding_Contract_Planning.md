# AI Vision Page Understanding Contract Planning

This document is planning only for T0087. It does not implement source behavior, Project JSON schema changes, suggestion persistence, provider/API code, real AI calls, preview behavior, export behavior, automatic generation, audio fetching/downloading, automatic SFX placement, dependencies, or accepted project mutation.

## Purpose

The AI direction should become a comic page reader, not just a JSON-note assistant. Current mock director notes and project-derived suggestions are scaffolding. The future value is for AI to inspect the comic page image, describe meaningful page structure, and return reviewable authoring suggestions.

T0087 defines the future response contract before any provider/API work. It describes what a page-understanding response may contain, how targets and confidence should work, how warnings and stale/blocked states should be represented, and what validation must happen before suggestions reach the unified review surface planned in T0086.

## Core Rule

All AI outputs are temporary reviewable suggestions.

Accepted project data remains the source of truth:

- Camera Shots are accepted page-level reading containers.
- Focus Regions are accepted page-level reusable attention targets.
- Shot Attention Paths are accepted per-shot references to page-level Focus Regions.
- Accepted motion roles remain `track`, `pushIn`, and `pushOut`.
- Background music and SFX markers remain accepted manual audio data.
- Export uses accepted project data only.

No vision response may mutate accepted Camera Shots, Focus Regions, Shot Attention Paths, audio markers, preview behavior, export behavior, or Project JSON by itself.

## Response Envelope

A future provider-neutral response should use a top-level envelope with:

- `schemaName`: stable contract name for the AI vision response.
- `schemaVersion`: contract version, independent of Project JSON schema.
- `sourceImageRef`: non-binary identifier for the image analyzed, such as file name, dimensions, and a local image fingerprint if a later ticket defines one.
- `analysisScope`: what the model was asked to analyze, such as page layout, reading order, region candidates, mood, motion, or audio direction.
- `providerInfo`: provider/model metadata when available, without storing secrets.
- `createdAt`: response creation timestamp.
- `pageSummary`: short natural-language page description.
- `warnings`: response-level cautions or limitations.
- `suggestions`: typed temporary suggestion records.

This envelope is not Project JSON persistence. It is a future temporary response shape for validation and review.

## Coordinate Rules

Geometry-bearing suggestions should use source-image coordinates:

- `x`, `y`, `width`, and `height` in source pixel space.
- Optional polygon points only when a later ticket explicitly allows non-rectangular evidence.
- Rectangular bounds remain required for UI review even if extra polygon evidence exists.
- Values must be finite numbers.
- Bounds must be clamped or rejected if outside the source image.
- The contract should record the source image width and height used by the provider.

Camera Shot and Focus Region candidates should remain free-ratio reading/attention containers over the intact page. They must not imply destructive cropping.

## Target Types

Suggestions may target:

- `page`: whole-page understanding, global mood, reading flow, or BGM direction.
- `panelCandidate`: proposed panel or scene grouping not yet accepted.
- `readingOrderCandidate`: proposed order among panel or scene candidates.
- `characterCandidate`: character, face, expression, or recurring subject candidate.
- `regionCandidate`: speech, detail, action, impact, establishing, text-heavy, or background region.
- `cameraShotCandidate`: proposed Camera Shot draft.
- `focusRegionCandidate`: proposed Focus Region draft.
- `attentionPathCandidate`: proposed ordered attention beats.
- `motionIntentCandidate`: proposed `track`, `pushIn`, or `pushOut` intent for a target beat or shot.
- `directorNote`: mood, pacing, effect, or timing note.
- `audioDirectionCandidate`: BGM/SFX tone, category, search-term, or timing idea.
- `warning`: page-level or target-level caution.

Targets should use stable temporary IDs inside the response, such as `panel-1` or `region-3`. A suggestion that depends on another suggestion should reference that temporary ID and remain blocked if the dependency is rejected or stale.

## Suggestion Record Fields

Every suggestion record should include:

- `id`: stable temporary suggestion ID within the response.
- `type`: one of the target/suggestion families.
- `targetType`: page, accepted entity, or temporary suggestion target.
- `targetId`: accepted project ID or temporary response ID when applicable.
- `geometry`: source-image rectangle when relevant.
- `label`: concise user-facing label.
- `description`: short explanation of what was found or proposed.
- `confidence`: normalized confidence, such as high, medium, low, or unknown.
- `reason`: why the suggestion helps reading clarity, cinematic pacing, attention, mood, or audio support.
- `warnings`: suggestion-level cautions.
- `evidence`: optional references to visual cues such as strong border, face, speech balloon, action lines, contrast, text density, or composition.
- `dependencies`: temporary IDs or accepted project IDs required before acceptance.
- `proposedAction`: inspect, copy, accept, apply, edit-before-accept, or blocked.
- `blockedReason`: why the suggestion cannot be accepted or applied.
- `staleCheck`: source image and target context needed to detect stale results.

Provider-specific raw fields should not be used directly by the UI. They should be normalized or discarded before review.

## Suggestion Families

### Panels And Reading Order

Panel/page-structure suggestions may include:

- panel or scene-region candidates
- reading-order links or ordered lists
- confidence per panel and per ordering relation
- warnings for overlapping panels, borderless art, inset panels, splash pages, ambiguous manga/comic reading direction, or decorative frames

These remain suggestions only. They do not become Camera Shots without explicit user acceptance.

### Characters, Faces, And Expressions

Character suggestions may include:

- face or character bounding regions
- recurring-character hints inside the same page
- expression or pose notes
- confidence and ambiguity warnings

These must not introduce identity claims about real people. They should be treated as visual subject candidates for authoring Focus Regions or mood notes.

### Speech, Detail, Action, And Establishing Regions

Region suggestions may include:

- speech or text-heavy area candidates without claiming OCR text unless later scoped
- detail or object emphasis candidates
- action or impact region candidates
- establishing/background context candidates
- warnings for dense text, decorative sound effects, overlapping balloons, or low visual separation

These can inform Focus Region candidates, attention-path candidates, timing warnings, or audio direction.

### Mood And Director Notes

Mood suggestions may include:

- page-level tone
- shot-level mood candidates
- pacing notes
- effect support notes using accepted Shake or Impact Pulse only
- caution when mood is low-confidence or derived from ambiguous visual cues

Mood should support direction; it should not directly mutate shot purpose, effects, or timing.

### Camera Shot Candidates

Shot candidates may include:

- source-image rectangle
- label
- purpose or narrative role
- suggested rough duration rationale
- relationship to panel/scene/region candidates
- duplicate warnings against existing Camera Shots

Accepted Camera Shots remain normal editable project data only after explicit user action.

### Focus Region Candidates

Focus Region candidates may include:

- source-image rectangle
- label and kind
- possible source Camera Shot context
- sequence hint
- relationship to character, speech, detail, or action region evidence
- duplicate warnings against existing Focus Regions

Accepted Focus Regions remain page-level reusable attention targets only after explicit user action.

### Shot Attention Path And Motion Intent

Attention-path and motion suggestions may include:

- target Camera Shot candidate or accepted Camera Shot
- ordered references to accepted Focus Regions or temporary Focus Region candidates
- proposed motion role limited to `track`, `pushIn`, or `pushOut`
- duration-weight ideas
- reason for order and motion intent
- blocked state when dependencies are temporary, rejected, stale, or missing

Motion intent must not add new motion roles or replace Camera Shots with Focus Regions.

### Audio Direction

Audio direction suggestions may include:

- BGM tone or search phrases
- SFX category or search phrases
- timing ideas tied to page, shot, or attention beat
- restraint warnings for dialogue/text readability

The contract must not return downloadable audio, generated audio, provider asset IDs as required choices, or automatic marker placement.

## Confidence And Reasons

Confidence should be normalized:

- high: visually clear and low ambiguity
- medium: plausible but some ambiguity
- low: weak evidence or multiple possible interpretations
- unknown: provider did not provide usable confidence

Every actionable suggestion should include a reason. Reasons should be grounded in visual evidence and authoring value, not opaque model preference. Examples:

- strong border and isolated artwork suggest a panel candidate
- face close-up suggests a Focus Region candidate
- action lines and impact pose suggest a possible impact beat
- dense speech area suggests slower pacing or no loud SFX

## Warnings

Warnings should be first-class fields, not buried in prose. Expected warning categories:

- `lowConfidence`
- `ambiguousReadingOrder`
- `overlappingGeometry`
- `outOfBoundsGeometry`
- `duplicateAcceptedEntity`
- `unsupportedMotionRole`
- `unsupportedEffect`
- `textMayNeedOCR`
- `possibleDecorativeSfxText`
- `privacySensitiveUpload`
- `copyrightSensitiveImage`
- `providerPartialFailure`
- `providerUnsupportedField`

Warnings can make a suggestion inspect-only or blocked.

## Stale And Blocked Rules

A response or suggestion should become stale or blocked when:

- the source image changes
- image dimensions differ from the analyzed dimensions
- an accepted target referenced by the suggestion no longer exists
- a temporary dependency was rejected or discarded
- geometry is invalid or outside image bounds
- a proposed entity duplicates an accepted entity too closely
- the suggestion references unsupported motion roles, effects, audio actions, or schema fields
- the response was created for a different project state than the one being reviewed

Stale suggestions must not silently retarget themselves. The review surface may invite regeneration, but regeneration is a separate explicit action.

## Validation And Normalization

Before suggestions reach the review surface, validation should:

- parse the provider response defensively
- reject malformed or unknown top-level structures
- normalize confidence values
- normalize suggestion types into the supported vocabulary
- validate geometry and source dimensions
- reject unsupported motion roles beyond `track`, `pushIn`, and `pushOut`
- reject unsupported effects beyond accepted Shake and Impact Pulse references
- reject audio generation, audio download, or automatic placement instructions
- mark unresolved dependencies as blocked
- preserve warnings for review

Invalid provider output should produce an error or warning state, not partial accepted project mutation.

## Consent, Provider, Privacy, And Copyright

Before any real provider integration, a later ticket must define:

- explicit user consent before sending image pixels
- provider disclosure and model identity
- what data is sent: image, project metadata, accepted shots, Focus Regions, audio metadata, or none
- cancellation while analysis is pending
- failure and retry behavior
- no mutation on provider failure
- privacy and copyright warnings for uploaded comic pages
- whether provider responses are stored, cached, or discarded
- whether audio metadata is ever sent

No provider/API code should be added until this is planned and accepted.

## Failure States

The contract should support reviewable failure states:

- provider unavailable
- request cancelled
- timeout
- image too large
- unsupported image type
- unsafe or disallowed provider response
- malformed JSON or invalid structure
- partial response with usable warnings
- no useful suggestions

Failures should not create accepted project data. Partial suggestions should be marked with response-level warnings.

## DynamicManga Director Rulebook Placeholder

A later ticket should define a DynamicManga/article-derived director rulebook or knowledge pack. That rulebook can shape how accepted or suggested page-understanding evidence becomes cinematic guidance:

- when to preserve page context
- when to move from establishing shot to detail
- how to handle action emphasis
- how to pace speech-heavy panels
- how to use `track`, `pushIn`, and `pushOut` with restraint
- how to avoid motion that harms readability

T0087 does not define that rulebook. It leaves room for it by keeping visual evidence, reasons, mood, pacing, and motion intent explicit in the response contract.

## Budget And Provider Decision Gate

Before real API integration, a separate decision gate should cover:

- provider options
- expected cost per page
- latency targets
- image size limits
- privacy posture
- offline/mock fallback
- cancellation and retry UX
- rate limits and failure handling
- whether provider output can be cached or stored

The contract should remain provider-neutral until that decision gate is complete.

## Recommended Next Ticket

Historical note: T0088 has since planned the DynamicManga director rulebook / knowledge pack.

Current next recommended ticket: T0089 - AI Budget / Provider Decision Gate Planning.

T0089 should plan provider, budget, privacy, consent, latency, cancellation, and failure-handling constraints before real provider/API implementation. It should remain docs-only and should not implement provider/API code, runtime AI, Project JSON schema changes, or automatic generation.

## Manual Verification Expectations

For this planning ticket:

- Confirm this document is planning-only.
- Confirm it defines future vision response fields, target types, confidence, reasons, warnings, stale/blocked rules, validation needs, consent/provider/privacy notes, and failure states.
- Confirm it covers panels, reading order, characters/faces, speech/detail/action regions, mood, shot candidates, Focus Region candidates, Shot Attention Path/motion intent, and audio direction.
- Confirm all outputs remain temporary reviewable suggestions.
- Confirm accepted project data remains the source of truth.
- Confirm it leaves room for a later DynamicManga/article-derived director rulebook.
- Confirm it leaves room for a later AI budget/provider decision gate before real API integration.
- Confirm the historical T0088 recommendation has since been completed and the current next recommendation is T0089 - AI Budget / Provider Decision Gate Planning.
- Confirm it does not claim source behavior, Project JSON schema changes, provider/API code, real AI calls, preview/export behavior, suggestion persistence, or automatic generation exists.
