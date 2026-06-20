# AI Director Suggestion Contract Planning

This document is planning only for T0098. It does not implement source behavior, provider route changes, Project JSON schema changes, suggestion persistence, automatic Camera Shot creation, automatic Focus Region creation, automatic Shot Attention Path creation, draft motion creation, preview behavior, export behavior, audio/SFX behavior, dependencies, or accepted project mutation.

## Purpose

T0097 hardened accepted detail highlights so manually corrected detail data can become reliable input for later AI camera suggestions. T0098 defines the contract between corrected page understanding and future AI director camera suggestions before adding a review surface.

The goal is to make the next source ticket precise: AI camera suggestions should be structured, target-bound, stale-aware, reviewable, and clearly separate from accepted project data.

## Core Rule

Accepted project data remains the source of truth:

- Camera Shots are accepted page-level reading containers.
- Focus Regions are accepted page-level reusable attention targets.
- Shot Attention Paths are accepted per-shot references to page-level Focus Regions.
- Accepted detail highlights are corrected page-understanding data owned by project state.
- Accepted motion roles remain `track`, `pushIn`, and `pushOut`.
- Preview and export use accepted project data only.

AI director suggestions are temporary review records until a later ticket explicitly implements user review and acceptance. Viewing, generating, filtering, rejecting, or editing a suggestion draft must not mutate accepted Camera Shots, Focus Regions, Shot Attention Paths, detail highlights, Project JSON, preview, export, audio, or SFX markers.

## Input Layers

Future AI director suggestion generation should separate input layers instead of blending raw provider guesses with corrected project state.

### Accepted Corrected Inputs

Accepted/corrected inputs are preferred when present:

- Accepted detail highlights, including user-edited label, description, geometry, and source-image bounds.
- Existing accepted Camera Shots, including geometry, order, duration, start framing, purpose, effects, and labels.
- Existing accepted Focus Regions, including geometry, label, kind, sequence hint, and source-shot context.
- Existing accepted Shot Attention Path items, including target Focus Region, motion role, duration weight, effect cues, and cue timing.
- User-reviewed reject/accept state for prior AI detail suggestions when available in current review state.

These inputs are trusted more than raw AI page-understanding regions because they represent user correction.

### Normalized AI Page-Understanding Inputs

Raw AI page-understanding output may provide useful evidence, but it remains suggestion evidence:

- Page summary and mood.
- Normalized panels and reading order.
- Character or face regions.
- Speech, detail, action, impact, establishing, and background regions.
- Confidence, reasons, provider warnings, and validation warnings.
- Source-image dimensions and stale image metadata.

Provider-specific raw fields should not be consumed directly by the camera suggestion review UI. They should be normalized, validated, and treated as lower-authority evidence than accepted corrected inputs.

### Derived Director Context

A later generator may derive director context from both accepted and AI evidence:

- Reading order confidence.
- Speech-heavy or text-dense pacing cautions without requiring OCR.
- Detail/reveal intent from accepted details.
- Character/reaction intent from accepted or normalized character regions.
- Action/impact energy from normalized action evidence.
- Existing manual motion choices that should not be overwritten.

Derived context is still advisory. It must not become hidden project state.

## Output Envelope

A future AI director suggestion response should use a temporary envelope:

- `schemaName`: stable contract name, such as `aiDirectorCameraSuggestions`.
- `schemaVersion`: contract version independent of Project JSON schema.
- `sourceImageRef`: source image dimensions and optional non-secret fingerprint if later implemented.
- `inputSnapshot`: minimal accepted/AI input identifiers needed for stale checks.
- `providerInfo`: provider/model metadata when applicable, without secrets.
- `createdAt`: response creation timestamp.
- `scope`: generation scope, such as whole page, selected panel, selected detail, or selected Camera Shot.
- `warnings`: response-level cautions.
- `suggestions`: ordered temporary camera suggestion records.

This envelope is not Project JSON persistence. It is a validation and review shape for future UI work.

## Camera Suggestion Record

Every camera suggestion should include:

- `id`: stable temporary ID within the response.
- `kind`: `cameraSuggestion`.
- `status`: `draft`, `inspectOnly`, `blocked`, `stale`, `accepted`, `rejected`, or `superseded`.
- `target`: primary target reference.
- `supportingTargets`: optional secondary target references.
- `suggestedMovement`: motion role limited to `track`, `pushIn`, or `pushOut`.
- `timingHint`: rough duration, duration weight, hold/restraint note, or cue timing idea.
- `compositionHint`: framing guidance in source-image terms, without implying destructive cropping.
- `reason`: concise explanation grounded in reading clarity, story beat, visual evidence, or corrected user input.
- `confidence`: `high`, `medium`, `low`, or `unknown`.
- `warnings`: suggestion-level cautions.
- `validation`: normalized state for target binding, geometry, supported role, duplicates, and stale checks.
- `reviewAction`: recommended user action such as inspect, edit-before-accept, reject, or blocked.

The record should be complete enough for T0099 to show review cards without inventing extra semantics in the UI.

## Target References

Target references should identify what the suggestion is directing:

- `acceptedDetail`: accepted project detail highlight.
- `acceptedCameraShot`: existing Camera Shot.
- `acceptedFocusRegion`: existing Focus Region.
- `acceptedAttentionPathItem`: existing Shot Attention Path item.
- `aiPanel`: normalized AI page-understanding panel.
- `aiCharacter`: normalized AI character or face region.
- `aiSpeech`: normalized AI speech/text-heavy region.
- `aiDetail`: normalized AI detail region that has not been accepted.
- `aiAction`: normalized AI action/impact region.
- `page`: whole-page context.

Accepted targets should use accepted project IDs. AI targets should use normalized AI response IDs and the source image metadata used for that response. Suggestions may reference both, but accepted corrected targets should win when they overlap raw AI regions.

## Movement And Timing Contract

Camera suggestions may propose only current accepted motion grammar:

- `track`: stable-scale pan/glide between readable related targets. Use it for normal reading flow, dialogue flow, scanning details, and most movement between multiple Focus Regions.
- `pushIn`: deliberate zoom toward a subject/detail for emotional emphasis, reaction, threat, realization, inspection, important detail, or impact.
- `pushOut`: deliberate zoom away from a subject/detail to restore context, reveal environment, reconnect a detail to its panel/page, or show relationships.

Do not use `pushIn` or `pushOut` just because there are multiple Focus Regions. Multiple FRs should usually default to `track` unless there is a clear meaning reason for emphasis, inspection, reveal, or context restoration. Avoid over-directing; a camera suggestion should not assign push roles to every FR transition.

When a rule wants a calm hold, it should use `timingHint` or `compositionHint`, not a new motion role. Legacy roles such as reveal, lift, spotlight, zoom, hold, drift, transfer, or pullBack must not be emitted as accepted movement values.

Timing hints may include:

- `short`, `medium`, or `long` beat guidance.
- Duration-weight suggestion for a future attention path beat.
- Hold/restraint note for speech-heavy or quiet reaction beats.
- Early/arrival cue timing idea for existing accepted effect cues only when the target binding is valid.

Timing hints are advisory until a later ticket explicitly applies them.

## Validation Rules

A suggestion should be valid only when:

- The source image dimensions match the current page.
- All accepted target IDs still exist.
- All AI target IDs exist in the current normalized AI page-understanding result.
- Any geometry is finite, non-zero, and inside source-image bounds after validation.
- The movement role is one of `track`, `pushIn`, or `pushOut`.
- The suggestion does not require unsupported OCR, face identity, character cutouts, parallax, segmentation, audio generation, or automatic SFX placement.
- The suggestion does not duplicate an accepted Camera Shot, Focus Region, detail highlight, or equivalent active suggestion too closely.
- The suggestion can explain why accepted corrected input or normalized AI evidence supports it.

Invalid suggestions should be blocked, not silently repaired into different targets.

## Stale And Blocked States

A suggestion should become stale or blocked when:

- The source image changes.
- A referenced accepted detail, Camera Shot, Focus Region, or Shot Attention Path item no longer exists.
- A referenced accepted detail or Focus Region geometry changes enough to invalidate the reason.
- The normalized AI page-understanding result is superseded by a newer analysis.
- The target AI region is no longer present after validation or rerun.
- The suggestion references unsupported movement, effects, provider-only fields, or future schema fields.
- The user has already accepted or rejected an equivalent suggestion by geometry fingerprint or stable target.

Stale suggestions must not retarget themselves. A later UI may offer regeneration, but regeneration creates a new temporary suggestion response.

## Review State Boundaries

T0099 should be able to review suggestions without changing project data:

- Inspecting a suggestion may highlight its targets on the page.
- Editing a suggestion may change only temporary suggestion draft fields until a later acceptance ticket says otherwise.
- Rejecting a suggestion may hide or mark that temporary suggestion without deleting accepted project data.
- Accepting a suggestion into draft motion is out of scope until T0100.
- Project JSON should not persist unaccepted camera suggestions unless a later schema ticket explicitly allows it.

Accepted suggestions, when later scoped, should become ordinary editable draft or project objects through explicit user action. They should not remain hidden AI-owned timeline data.

## Relationship To Existing Contracts

This contract builds on prior planning:

- T0086 defined a unified review surface for temporary suggestions.
- T0087 defined provider-neutral page-understanding output.
- T0088 defined a director rulebook layer from page evidence to cinematic guidance.
- T0089 defined the provider/budget gate.
- T0090 through T0093 implemented temporary page understanding and provider-backed director suggestion drafts.
- T0094 through T0097 made accepted detail highlights more reliable as corrected project data.

T0098 narrows the next step to camera suggestion records that prefer corrected accepted inputs and remain review-only.

## Non-Goals

This planning ticket does not allow:

- Source code changes.
- Provider route changes.
- Project JSON suggestion persistence.
- Automatic Camera Shot creation.
- Automatic Focus Region creation.
- Automatic Shot Attention Path creation.
- Draft motion creation.
- New motion roles.
- OCR, dialogue/narration, face identity, segmentation, character cutouts, or parallax.
- Preview/export behavior changes.
- Audio generation, audio fetching, or automatic SFX placement.

## Recommended Next Ticket

T0099 - AI Camera Suggestion Review Surface.

T0099 should add a review UI for temporary camera suggestions using this contract. It should let users inspect, edit, reject, and mark suggestions without mutating accepted project data. It should not create Camera Shots, Focus Regions, Shot Attention Paths, or draft motion yet.

## Manual Verification Expectations

For this planning ticket:

- Confirm this document is planning-only.
- Confirm corrected accepted detail highlights are preferred over raw AI detail suggestions.
- Confirm raw AI page-understanding regions remain lower-authority temporary evidence.
- Confirm camera suggestion records include target, movement role, timing hint, reason, confidence, status, validation, and stale/blocking data.
- Confirm movement roles are limited to `track`, `pushIn`, and `pushOut`.
- Confirm AI suggestions do not overwrite accepted project data.
- Confirm T0099 is the next recommended ticket.
- Confirm no source, package, Project JSON schema, provider route, preview, export, audio, SFX, OCR, panel detection, dependency, or multi-page behavior changed.
- Build is not required because T0098 is docs-only.
