# AI Director Assistant Roadmap Reassessment

This document is planning only for T0085. It does not implement real AI provider calls, provider configuration, Project JSON schema changes, suggestion persistence, source behavior, preview behavior, export behavior, audio editing, audio generation, audio fetching/downloading, automatic SFX placement, OCR, panel detection, dialogue/narration, dependencies, or automatic accepted-state mutation.

## Purpose

T0079 through T0084 completed the first AI director-assistant planning and mock workflow branch:

- T0079 defined the AI director-assistant roadmap.
- T0080 added mock director notes.
- T0081 added explicit apply behavior for safe existing-target suggestions.
- T0081A added target-binding guardrails.
- T0082 added temporary AI-style Shot Attention Path drafts from existing manual Focus Regions.
- T0083 planned later AI-suggested Camera Shots and Focus Regions.
- T0084 planned advisory BGM/SFX direction suggestions.

This reassessment decides what should happen next before any real provider, automatic generation, or audio apply implementation.

## Current Decision

The next AI branch should remain mock/review UI work, not real provider integration.

Historical note: T0086 has since planned the unified suggestion review surface.

Historical note: T0087 has since planned the AI vision/page-understanding response contract.

Historical note: T0088 has since planned the DynamicManga director rulebook / knowledge pack.

Current next recommended ticket: T0089 - AI Budget / Provider Decision Gate Planning.

The reason is simple: the project now has several suggestion concepts, but their review surfaces are still split across mock director notes, temporary attention-path drafts, planned draft shot/focus suggestions, and planned audio suggestions. Before sending source images or project data to a real provider, the app should have a coherent way to show, group, inspect, block, accept, reject, and discard suggestions.

## Why Not Real Provider Yet

Real AI provider work remains premature because these decisions are still open:

- whether unaccepted suggestions should be persisted in Project JSON or remain session-only
- how stale suggestions should be displayed after project edits, JSON import, or archive import
- how provider consent should be requested for source image pixels, project data, and possible audio metadata
- how provider errors, cancellation, partial output, bad JSON, unsupported fields, and hallucinated targets should be handled
- whether accepted entities should record AI provenance
- whether audio suggestions should remain copy-assist only or gain safe apply behavior later
- whether suggested Camera Shots and Focus Regions need an edit-before-accept workflow before implementation

A real provider would increase privacy, copyright, latency, cost, validation, and failure-state complexity before the local review contract is settled.

## Why Not Automatic Generation

Automatic generation remains out of scope. The core product still depends on manual accepted project data:

- Camera Shots are user-authored reading containers over the intact page.
- Focus Regions are page-level reusable attention targets.
- Shot Attention Paths are per-shot references to page-level Focus Regions.
- Accepted camera grammar remains `track`, `pushIn`, and `pushOut`.
- Shake and Impact Pulse are supporting effect layers, not camera movement replacements.
- Existing BGM and SFX marker workflows are manual accepted audio data.
- Export must use only accepted project data.

The system may suggest, but accepted project state must change only through explicit user action.

## Recommended Next Branch

T0086 - Unified Suggestion Review Surface Planning defined one consistent review model before more suggestion types are implemented.

It should plan:

- a unified suggestion list or panel for director notes, attention-path drafts, future shot/focus drafts, and future audio suggestions
- common suggestion fields: type, target, proposed value, reason, confidence, warning, stale/blocked status, and source
- grouping by target Camera Shot, Shot Attention Path beat, project-level audio, or page-level draft geometry
- inspect-only, copy-assist, apply, accept, reject, and discard actions by suggestion type
- stale-state handling when shots, Focus Regions, path items, effects, or audio markers change
- clear distinction between accepted project data and temporary suggestions
- manual verification expectations for no Project JSON persistence unless separately scoped

T0086 was planning-only. A later UI spike can implement a unified mock review surface after that plan is accepted. T0087 should first define the AI vision/page-understanding contract that will feed that review surface.

## Deferred Branches

These should remain later or separately ticketed:

- real AI provider planning and implementation
- provider consent UX and privacy/copyright disclosure
- Project JSON suggestion persistence
- AI-suggested Camera Shot / Focus Region review UI
- AI audio suggestion UI
- audio suggestion apply behavior
- automatic SFX placement
- audio generation or fetching/downloading
- OCR, speech-bubble detection, panel detection, face detection, or dialogue/narration
- automatic full guided-view generation

## Guardrails For Future Tickets

Future AI tickets should keep these boundaries:

- Suggestions are temporary until accepted.
- Accepted project data remains the source of truth.
- Export uses accepted project data only.
- Suggestions that reference missing targets are blocked, not silently repaired.
- Suggestions must not invent unsupported motion roles, effects, geometry ownership rules, audio tracks, or timeline systems.
- Provider work must include explicit consent, provider disclosure, cancellation, failure states, and validation.
- No ticket should combine real provider calls with broad UI/schema changes unless an earlier planning ticket explicitly allows that risk.

## Manual Verification Expectations

For this planning ticket:

- Confirm this document is planning-only.
- Confirm it recommends a mock/review workflow branch before real provider work.
- Confirm the historical T0086 recommendation has been superseded by T0087 and T0088, and that T0089 is now the next recommended ticket.
- Confirm it keeps accepted project data manual and explicit.
- Confirm it keeps real provider calls, automatic generation, audio fetching/downloading, automatic SFX placement, Project JSON schema changes, source behavior, preview behavior, and export behavior out of scope.
