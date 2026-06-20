# AI Director Assistant Roadmap

This document defines the AI director-assistant roadmap phase after the special-effects work. T0079 created this plan as planning only; T0080 through T0082 have since implemented mock director notes, explicit apply controls, target-binding guardrails, and temporary AI-style attention-path drafts. T0083 has since planned whether later AI may suggest new Camera Shots and Focus Regions. T0084 has since planned advisory audio direction suggestions. T0085 has since reassessed the branch and recommended unified suggestion review planning before provider work. Real AI calls, Project JSON suggestion persistence, preview behavior changes, export behavior changes, OCR, panel detection, audio editing, audio generation, fetching/downloading, dependencies, and automatic project mutation remain out of scope.

## Direction

AI should begin as a director-assistant layer, not as an auto-generator.

The first AI phase should help the creator understand the page, the existing Camera Shots, and the existing Shot Attention Paths. It may suggest directing intent, mood, motion roles, effect cues, and timing ideas, but it must not directly create or mutate Camera Shots, Focus Regions, or Shot Attention Paths.

Manual project data remains the source of truth:

- Camera Shots are user-authored reading containers over the intact page.
- Focus Regions are page-level attention targets.
- Shot Attention Paths are per-shot references to existing Focus Regions.
- Accepted camera grammar remains `track`, `pushIn`, and `pushOut`.
- Accepted effects such as Shake and Impact Pulse are supporting mood/timing layers, not replacements for camera movement.
- Export should continue to use only accepted project data.

## What AI May Read First

The first director-assistant phase may read existing project context only:

- source image metadata such as dimensions and file name
- existing Camera Shot geometry, order, labels, durations, and start framing
- existing page-level Focus Region geometry, labels, kinds, and sequence hints
- existing Shot Attention Path item order, referenced Focus Regions, `motionRole`, `durationWeight`, effect cues, and cue timing
- existing accepted shot-level Shake / Impact Pulse settings
- existing background music and SFX marker metadata only when needed for later planning, not for automatic sound editing

If a later real AI provider receives image pixels or project data, that ticket must handle explicit user consent, provider disclosure, privacy/copyright risk, cancellation, failure states, and validation. The initial UI spike can use mock/static suggestions.

## Suggestion Output Contract

Director suggestions should be reviewable records, not accepted project entities.

Each suggestion should include:

- target reference: existing Camera Shot, existing Shot Attention Path item, or existing accepted project context
- mood: concise directing tone such as calm, tense, impact, reveal, action, or dialogue
- suggested motion role: optional `track`, `pushIn`, or `pushOut`
- suggested effect: optional Shake, Impact Pulse, or none
- cue timing idea: optional `early` or `arrival` when the suggestion targets an attention-path cue
- timing idea: optional duration or duration-weight advice
- reason: short explanation grounded in reading clarity or storytelling intent
- confidence or caution: high, medium, low, unknown, or a warning string

Suggestions should be inspectable even when they cannot be applied. Blocked suggestions should explain the missing dependency instead of mutating project data.

## Safety Boundaries

The first AI director phase must not:

- automatically create Camera Shots
- automatically create Focus Regions
- automatically create Shot Attention Paths
- automatically reorder timeline shots
- automatically change shot geometry, focus geometry, path order, motion roles, effect cues, timing, audio, or export settings
- create a final video path without review
- treat Focus Regions as replacement camera frames
- add new motion roles beyond `track`, `pushIn`, and `pushOut`
- make Shake or Impact Pulse decide where the camera goes
- fetch, download, or place audio assets
- store unaccepted suggestions in Project JSON without a later schema ticket

Every accepted change must be explicit, reversible through normal editing or undo when that exists, and visible before it affects preview/export.

## Roadmap Tickets

1. T0079 - AI Director Suggestions Planning
   - Define scope, readable project inputs, output contract, safety boundaries, relationship to current motion/effect grammar, and manual verification expectations.

2. T0080 - AI Director Suggestions UI Spike
   - Add a UI surface for mock/static AI-style directing suggestions without real provider integration and without automatic project mutation.

3. T0081 - AI Suggestion Accept/Apply Spike
   - Let users manually apply selected suggestions to existing shots, path items, or effect settings through explicit actions.

4. T0081A - AI Suggestion Target Binding Guardrails
   - Repair apply safety so motion suggestions require existing Camera Shots, existing Shot Attention Path items, and existing referenced Focus Regions before they can mutate accepted project data.

5. T0082 - AI Draft Attention Path Spike
   - Implemented after T0080/T0081/T0081A acceptance. AI-style logic can suggest a temporary Shot Attention Path from existing manual Focus Regions only. It still does not create Focus Regions or Camera Shots.

6. T0083 - AI Draft Shots/Focus Regions Planning
   - Implemented as `docs/planning/AI_Draft_Shots_Focus_Regions_Planning.md`. Explores whether a later AI phase may suggest new Camera Shots and Focus Regions, including review/accept/reject workflow and Project JSON/archive compatibility.

7. T0084 - Audio/BGM/SFX Suggestions Planning
   - Implemented as `docs/planning/Audio_BGM_SFX_Suggestions_Planning.md`. AI may suggest BGM/SFX search terms, tone, pacing, and timing ideas after shot mood/timing/intent suggestions exist. No audio editing, generation, fetching, downloading, or automatic placement.

8. T0085 - AI Director-Assistant Roadmap Reassessment
   - Implemented as `docs/planning/AI_Director_Assistant_Roadmap_Reassessment.md`. Recommends staying on mock/review workflow planning before real provider, automatic generation, or audio apply implementation.

9. T0086 - Unified Suggestion Review Surface Planning
   - Implemented as `docs/planning/Unified_Suggestion_Review_Surface_Planning.md`. Defines one coherent review model for mock director notes, attention-path drafts, future shot/focus drafts, future audio suggestions, and future vision/page-understanding suggestions before additional AI UI or provider work.

The originally scoped T0079 through T0084 director-assistant sequence is complete, T0085 chose the next branch, T0086 planned unified suggestion review, T0087 planned the AI vision/page-understanding contract, and T0088 planned the DynamicManga director rulebook / knowledge pack. T0089 should define the AI budget / provider decision gate before any real provider, automatic generation, suggestion persistence, or audio apply implementation.

## Relationship To Earlier Automation Docs

This roadmap narrows the older AI Automation Architecture Plan into a safer first product phase. The older suggestion-state and suggestion-review documents still apply: AI output should be temporary, inspectable, rejectable, and explicitly accepted before it becomes normal project data.

Panel detection, OCR/text timing, smart camera path generation, dialogue/narration, real provider calls, and audio apply behavior remain separate later work unless a ticket explicitly scopes them.

## Manual Verification Expectations

For T0079, verification is documentation-only:

- Confirm this document exists and stays planning-only.
- Confirm `docs/Tickets.md` lists T0079 through T0084 in sequence.
- Confirm `docs/Repo_Current_State.md` records T0079 as completed and names T0080 as the next recommended ticket.
- Confirm `docs/Manual_Verification_Guide.md` includes AI director planning checks.
- Confirm the plan does not claim real AI provider integration.
- Confirm the plan forbids automatic Camera Shot, Focus Region, or Shot Attention Path creation in the first phase.
- Confirm the accepted motion grammar remains `track`, `pushIn`, and `pushOut`.
- Confirm Shake and Impact Pulse are supporting effect layers only.
- Confirm audio/BGM/SFX suggestions come after AI director suggestions.
- Confirm no source, package, Project JSON schema, preview, export, OCR, panel detection, dependency, audio, or multi-page behavior changed.
