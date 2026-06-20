# Audio/SFX Suggestion Pass

This document completes T0103. It is planning only. It does not implement source behavior, provider calls, real AI audio analysis, audio editing, audio generation, audio fetching, audio downloading, automatic SFX marker placement, Project JSON schema changes, preview behavior, export behavior, dependencies, OCR, panel detection, dialogue, narration, or automatic accepted-state mutation.

## Purpose

The editor already has accepted manual audio workflows:

- one uploaded background music file with settings, archive bundling, and export mixing
- uploaded one-shot SFX markers tied to existing Camera Shots

T0103 defines the first reviewable AI audio direction layer that may be built after AI Camera Suggestions and Draft Motion are grounded. Audio suggestions should be temporary notes that help the user choose licensed or user-owned audio manually. They must not create, fetch, download, generate, bundle, or place audio assets.

## Source of Truth

Accepted project data remains authoritative:

- accepted Camera Shot order, labels, duration, purpose, start framing, and persisted effects
- accepted Shot Attention Path items, referenced Focus Regions, motion roles, duration weights, and effect cues
- accepted Focus Region labels, kinds, source-shot context, and geometry
- accepted background music metadata/settings
- accepted SFX marker metadata/settings
- accepted Draft Motion output only after the user has explicitly accepted it into normal project objects

Temporary AI Page Understanding, AI Camera Suggestions, Draft Motion helpers, and future audio notes remain review data. They may provide context in the UI, but they must not become export source-of-truth data until a later ticket explicitly scopes a safe apply workflow.

## Suggestion Record Shape

Future read-only audio notes should use a small provider-neutral shape:

- `id`: temporary review id
- `kind`: `bgmTone`, `bgmPacing`, `sfxCue`, `sfxRestraint`, or `audioWarning`
- `target`: project, Camera Shot id, Shot Attention Path item id, Focus Region id, or existing SFX marker id
- `timing`: project-wide, shot start, pre-arrival, focus arrival, post-impact, shot exit, or manual review needed
- `suggestion`: short human-readable note
- `searchTerms`: optional provider-neutral phrases for the user's own licensed library
- `reason`: grounded in accepted shot mood, camera motion, timing, effect cues, visual action, reveal, or context restoration
- `confidence`: high, medium, low, or unknown
- `warnings`: missing target, weak evidence, licensing reminder, dialogue masking risk, clutter risk, or stale context
- `status`: new, copied, rejected, stale, or blocked

The shape is intentionally not a Project JSON schema change. If future tickets persist unaccepted audio notes, they should add a separate optional suggestion section rather than mixing suggestions into accepted audio records.

## BGM Note Guidance

BGM notes should stay broad and useful:

- suggest mood/tone families such as light comedy bed, quiet suspense, noir room tone, action pulse, sentimental piano, or ambient tension
- suggest pacing such as low-energy loop, slow build, drop before reveal, fade under dialogue, or brief silence before impact
- bind to the whole project or a range of accepted Camera Shots
- avoid exact copyrighted track titles, artist names, provider catalog ids, or instructions to use unlicensed assets
- warn when dense speech/dialogue, subtle gag timing, or quiet reaction beats should avoid busy music

BGM notes should not upload source image pixels or audio binaries unless a future provider ticket explicitly scopes consent and data handling.

## SFX Cue Guidance

SFX notes should describe cue intent without placing markers automatically:

- bind to an accepted Camera Shot or accepted Shot Attention Path item where possible
- use timing language such as shot start, focus arrival, post-impact tail, or shot exit
- suggest categories such as whoosh, impact, card slap, door, rain bed, footsteps, switch, crowd murmur, comedic accent, or soft UI-like accent
- prefer restraint notes over filling every beat with sound
- use accepted Shake and Impact Pulse cues as evidence for possible impact or accent sounds
- treat raw speech regions as masking/restraint evidence, not automatic SFX targets

Any future SFX marker creation must remain a separate explicit user action after the user uploads or selects a sound file.

## Stale and Blocked Rules

Audio notes should be blocked or stale when their accepted target no longer exists:

- missing Camera Shot target
- missing Shot Attention Path item
- missing referenced Focus Region
- removed effect cue that justified the sound
- changed shot timing that makes a timing note invalid
- missing existing SFX marker if the note targets marker settings
- unsupported request to fetch, download, generate, or automatically place audio

Blocked notes should explain the dependency instead of creating substitute targets or hidden markers.

## Review Behavior

The first source implementation after this plan should be read-only or copy-assist:

- show temporary audio notes in AI Review or an adjacent audio review section
- let the user copy search terms or reject notes
- keep notes out of Project JSON and archives unless a later schema ticket says otherwise
- do not alter background music settings, SFX markers, preview, export, or accepted project data
- preserve existing manual Background Audio and Sound Effects panels as the only accepted audio workflows

Apply behavior should be a later ticket. Safe apply should start with existing accepted audio settings or existing SFX markers, not automatic new marker creation.

## Provider, Privacy, and Licensing Caveats

Any future provider workflow must:

- disclose provider identity and what data is sent
- require explicit user action before sending image pixels, project data, or audio metadata
- avoid sending uploaded audio binaries unless specifically ticketed
- avoid recommending copyrighted tracks by exact title unless the user supplied that title
- prefer descriptive search terms for licensed libraries or user-owned files
- include cancellation, error, no-suggestion, stale, and blocked states
- keep provider failures from mutating accepted project data

## Manual Verification

For T0103:

- Confirm this document is planning-only.
- Confirm BGM and SFX suggestions are advisory notes, not audio assets.
- Confirm target binding uses accepted Camera Shots, accepted Shot Attention Path items, accepted Focus Regions, and existing accepted audio metadata only.
- Confirm raw/temporary AI outputs are not treated as accepted export data.
- Confirm the plan avoids automatic fetching, downloading, generation, SFX marker placement, copyrighted asset recommendations, dialogue/narration, Project JSON persistence, preview/export changes, and source behavior changes.
- Confirm the next implementation step should be a read-only or copy-assist audio notes UI, not audio apply behavior.
