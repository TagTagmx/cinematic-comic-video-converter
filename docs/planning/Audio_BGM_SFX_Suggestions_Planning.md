# Audio BGM and SFX Suggestions Planning

This document is planning only for T0084. It does not implement audio editing, audio generation, audio fetching, audio downloading, automatic SFX placement, dialogue or narration, Project JSON schema changes, preview behavior, export behavior, source behavior, dependencies, OCR, panel detection, or real AI provider calls.

## Purpose

The editor already supports manual accepted audio data:

- one project-level background music file with trim, loop, fade, volume, Project JSON metadata, archive bundling, and canvas export mixing
- multiple uploaded one-shot SFX markers tied to existing Camera Shots, with shot-relative offset, play length, shot-span cutoff, volume, Project JSON metadata, archive bundling, and canvas export scheduling

T0084 plans an AI-assisted audio direction layer on top of that manual workflow. The layer may suggest what kind of background music or sound effects could fit the existing direction, but it must not fetch, generate, download, upload, place, or mutate audio assets.

## Why This Follows AI Director Suggestions

Audio suggestions should come after shot mood, timing, motion intent, and effect-cue suggestions because sound depends on editorial intent:

- Camera Shot order and duration define the coarse pacing map.
- Shot purpose and director mood describe whether a moment reads as calm, tense, action, reveal, dialogue, or impact.
- Shot Attention Path items identify the attention beats where a sound may support a visual action, expression, text beat, or reveal.
- Accepted motion roles such as `track`, `pushIn`, and `pushOut` define whether a sound should follow movement, build intensity, or punctuate arrival.
- Accepted Shake and Impact Pulse cues can identify moments that may need supportive impact, whoosh, hit, or accent suggestions.

Audio suggestions made before those directing signals exist would be generic. After them, suggestions can stay grounded in the user's accepted visual plan.

## Data Suggestions May Read

A future suggestion implementation may read accepted project data only:

- source image metadata, but not image pixels unless a later provider ticket explicitly allows it
- Camera Shot labels, order, duration, purpose, start framing, and accepted special effects
- Shot Attention Path item order, referenced Focus Regions, `motionRole`, `durationWeight`, `effectCues`, and `effectCueTiming`
- Focus Region labels, kinds, sequence hints, and source-shot context
- existing background music metadata and settings
- existing SFX marker metadata and settings
- existing AI director suggestion outcomes only after they are accepted into normal project data

Unaccepted visual or audio suggestions should not be treated as source of truth for export.

## Suggestion Types

Audio suggestions should be advisory records. They may include:

- BGM tone suggestions, such as ambient tension, light comedy, noir suspense, action percussion, sentimental piano, or quiet room tone
- BGM search terms that a user can copy into their own licensed audio library
- BGM pacing notes, such as slow build, low loop energy, cut before reveal, or fade under impact
- SFX category suggestions, such as impact, whoosh, door, card slap, switch, rain, crowd, footsteps, or UI accent
- SFX search terms that describe a desired one-shot sound without naming a required provider
- timing ideas relative to existing Camera Shots, such as shot start, pre-arrival, focus arrival, post-impact, or shot exit
- volume and restraint notes, such as low bed, subtle accent, foreground hit, or avoid masking readable dialogue
- reason, confidence, and warnings grounded in shot mood, pacing, accepted effects, or attention-path beats

Suggestions should prefer descriptive search phrases over specific copyrighted track titles, specific commercial library IDs, or instructions to use unlicensed assets.

## Review Workflow

Required future workflow:

1. AI creates temporary audio suggestion records only.
2. The user reviews tone, search terms, target shot or beat, timing idea, confidence, and reason.
3. The user independently uploads or selects an audio file through the existing manual BGM or SFX workflow.
4. The user explicitly applies or manually recreates any timing/settings suggestion.
5. Accepted BGM and SFX data remains normal project data using the existing audio model.
6. Rejected suggestions disappear without changing accepted project data.
7. Stale or blocked suggestions explain their missing dependency instead of creating substitute audio markers.

The first implementation should be read-only or copy-assist. An apply workflow should be separately ticketed and should mutate only existing audio settings or existing SFX markers unless a later ticket explicitly permits creating draft audio markers.

## Target Binding Rules

Audio suggestions should bind to accepted targets:

- BGM suggestions may target the whole project or a broad sequence of accepted Camera Shots.
- SFX timing suggestions may target an existing Camera Shot.
- Beat-level SFX timing suggestions may target an existing Shot Attention Path item and referenced Focus Region.
- Suggestions that refer to missing shots, missing path items, missing Focus Regions, or removed effects must be blocked.
- Suggestions must not invent timeline targets or create hidden audio tracks.

If a suggestion proposes an SFX marker, it should remain a draft recommendation until the user uploads a chosen sound file and explicitly creates or updates a marker.

## Project JSON and Archive Compatibility

Current Project JSON should continue to store accepted audio metadata and settings only.

Open decisions before implementation:

- Should unaccepted audio suggestions ever be persisted?
- If persisted, should they live in a separate optional suggestion section rather than inside accepted audio records?
- Should accepted audio entities keep suggestion provenance, or become indistinguishable from manual edits?
- Should archive export include unaccepted suggestion records if no audio binary exists?
- How should stale suggestion targets be handled after JSON or archive import?

Conservative recommendation: do not persist unaccepted audio suggestions yet. Accepted audio remains existing BGM and SFX marker data only.

## Provider, Licensing, and Privacy Boundaries

Before any real provider integration:

- Disclose the provider and what project data is sent.
- Require explicit user action before uploading image pixels or audio files.
- Avoid sending uploaded audio binary unless a later audio-provider ticket explicitly scopes it.
- Do not recommend copyrighted tracks by title unless the user supplied them as context.
- Prefer licensed-library search phrases, genre/mood descriptors, and user-owned upload workflows.
- Provide cancellation, error, and no-suggestion states.
- Keep provider failures from mutating accepted project data.

## Non-Goals

T0084 and its immediate follow-up planning must not:

- generate music or sound effects
- fetch or download audio from the internet
- choose or bundle third-party audio assets
- automatically place SFX markers
- add dialogue, narration, subtitles, OCR, or speech-bubble analysis
- add waveform editing or a multitrack mixer
- change audio export mixing behavior
- change preview or camera behavior
- add dependencies or provider configuration

## Suggested Future Ticket Split

1. Audio Suggestion Contract
   - Define temporary BGM and SFX suggestion records, target references, confidence, warnings, and stale states.

2. Mock Audio Suggestions UI Spike
   - Show read-only or copy-assist BGM/SFX suggestions derived from accepted Camera Shots, effects, and attention beats.

3. Audio Suggestion Apply Spike
   - Let users explicitly apply safe changes only to existing BGM settings or existing SFX markers. Creating draft markers should be a separate decision.

4. Audio Asset Provider Planning
   - Decide whether search-provider integration is allowed, including licensing, privacy, provider disclosure, and no-download boundaries.

5. Real AI Provider Planning
   - Define consent, data sent, failure handling, validation, cost, latency, and privacy before real model calls.

## Manual Verification Expectations

For this planning ticket:

- Confirm this document is planning-only.
- Confirm it explains why audio suggestions follow AI director suggestions.
- Confirm it preserves existing manual BGM and SFX marker workflows as accepted project data.
- Confirm suggestions are advisory until explicit user action.
- Confirm it keeps online fetching, downloading, audio generation, automatic placement, dialogue/narration, waveform editing, source changes, dependencies, preview behavior, and export behavior out of scope.
- Confirm Project JSON/archive persistence for unaccepted suggestions remains an open decision.
