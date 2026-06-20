# AI Draft Shots and Focus Regions Planning

This document is planning only for T0083. It does not implement AI provider calls, source behavior, Project JSON schema changes, preview behavior, export behavior, OCR, panel detection, audio behavior, dependencies, or automatic project mutation.

## Purpose

T0082 allowed AI-style logic to draft Shot Attention Paths from existing manual Focus Regions. T0083 explores whether a later phase may suggest new Camera Shots and Focus Regions at all.

The answer is yes, but only as temporary reviewable suggestions. New Camera Shots and Focus Regions must not become accepted project data until the user explicitly accepts them.

## Preconditions Before Implementation

Future implementation must not start until these are true:

- The temporary suggestion workflow can clearly distinguish accepted project data from draft data.
- The UI can show suggested Camera Shots and suggested Focus Regions as drafts, not normal overlays.
- The user can inspect, accept, reject, and ideally edit each suggestion before acceptance.
- The app can detect stale suggestions when the source image, accepted shots, accepted Focus Regions, or target references change.
- Project JSON and archive behavior are explicitly designed if suggestions ever need persistence.

## Data AI May Read

A later planning or implementation ticket may allow AI to read:

- source image metadata and, only with explicit user consent, source image pixels
- existing Camera Shot geometry, labels, order, duration, purpose, timing, and effects
- existing page-level Focus Region geometry, labels, kinds, sequence hints, and source-shot context
- existing Shot Attention Path items, motion roles, duration weights, effect cues, and cue timing
- accepted draft-attention-path outcomes from T0082

AI should not infer hidden ownership. Camera Shots remain page-level reading containers. Focus Regions remain page-level reusable attention targets.

## Suggestion Types

Future AI may suggest temporary Camera Shot drafts with:

- geometry in source-image coordinates
- label and optional reading purpose
- duration or timing rationale
- relationship to nearby existing Focus Regions when known
- confidence and warnings
- reason grounded in reading clarity, panel flow, or storytelling intent

Future AI may suggest temporary Focus Region drafts with:

- geometry in source-image coordinates
- label and kind
- optional sequence hint
- optional source-shot context
- confidence and warnings
- reason grounded in attention, dialogue, expression, action, or detail emphasis

Future AI may suggest combined batches, but batch acceptance must still resolve into explicit accepted entities. The user must be able to reject individual items.

## Review and Accept Workflow

Suggested Camera Shots and Focus Regions should appear in a review surface before acceptance.

Required workflow:

1. AI creates temporary draft suggestions only.
2. User inspects each suggestion and sees proposed geometry, target context, confidence, and reason.
3. User accepts, rejects, or edits suggestions explicitly.
4. Accepted Camera Shot suggestions become normal editable Camera Shots.
5. Accepted Focus Region suggestions become normal page-level Focus Regions.
6. Rejected suggestions disappear without mutating accepted project data.
7. Stale suggestions are blocked or clearly marked stale instead of applying silently.

Accept-all must not be the default. If it is ever added, it must still show a review summary and skip stale or invalid suggestions.

## Stale Suggestion Rules

A suggestion should become stale or blocked when:

- the source image changes
- the suggested geometry falls outside source-image bounds
- the target Camera Shot no longer exists
- the target Focus Region no longer exists
- an accepted entity already occupies the same role closely enough that applying would duplicate data
- the suggestion references unsupported motion roles, effects, or future schema fields

Stale suggestions must not auto-repair by creating substitute targets.

## Project JSON and Archive Compatibility

Current Project JSON should continue to store accepted project data only.

Open decisions before implementation:

- Should temporary suggestions ever be persisted in Project JSON?
- If yes, should that require `schemaVersion` migration or a separate optional suggestion section?
- How should archive import handle stale suggestion references after bundled image restore?
- Should suggestion IDs be stable across sessions, and how are they reconciled with accepted entity IDs?
- Should accepted suggestion provenance be recorded, or should accepted entities become indistinguishable from manual entities?

Conservative recommendation: do not persist unaccepted AI suggestions yet. Accepted suggestions should write normal existing Camera Shot and Focus Region data only.

## Provider, Privacy, and Copyright Questions

Before real AI image analysis:

- Ask for explicit user consent before uploading image pixels.
- Disclose the provider and what data is sent.
- Provide cancel and failure states.
- Handle provider errors without mutating project data.
- Avoid sending audio files unless a later audio-specific ticket explicitly allows it.
- Document privacy and copyright risks for uploaded comic pages.

## Boundaries

Future implementation must not:

- destructively crop panel art
- replace the intact page canvas model
- make Camera Shots fixed output-ratio frames
- make Focus Regions shot-owned timeline records
- auto-create accepted Camera Shots or Focus Regions without explicit user action
- add OCR, panel detection, face detection, speech-bubble detection, or real provider calls unless separately scoped
- change preview/export camera behavior
- add motion roles beyond `track`, `pushIn`, and `pushOut`

## Suggested Future Ticket Split

1. AI Draft Shot/Focus Suggestion Contract
   - Define typed temporary suggestion records, validation, stale states, and geometry constraints.

2. AI Draft Shot/Focus Review UI Spike
   - Show mock suggested Camera Shots and Focus Regions as draft overlays/cards only.

3. AI Draft Shot/Focus Accept/Edit Spike
   - Let the user explicitly accept, edit, or reject draft suggestions.

4. Real AI Provider Planning
   - Define consent, provider configuration, privacy/copyright disclosures, failure states, and validation before any real API calls.

## Manual Verification Expectations

For this planning ticket:

- Confirm this document is planning-only.
- Confirm it keeps manual accepted project data as the source of truth.
- Confirm it allows only temporary suggested Camera Shots and Focus Regions.
- Confirm it requires explicit accept/reject/edit workflow.
- Confirm it preserves Camera Shot and Focus Region ownership rules.
- Confirm it identifies Project JSON/archive open decisions.
- Confirm it does not claim source behavior, provider calls, OCR, panel detection, preview/export changes, dependencies, or audio behavior exists.
