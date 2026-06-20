# Audio Suggestion Apply Guardrails Planning

This document completes T0105. It is planning only. It does not implement source behavior, provider calls, audio editing, audio generation, audio fetching, audio downloading, automatic SFX marker placement, Project JSON schema changes, preview behavior, export behavior, dependencies, OCR, dialogue, narration, or automatic accepted-state mutation.

## Purpose

T0104 added read-only, copy-assist Audio Notes in AI Review. Those notes are temporary and advisory. T0105 decides what a later apply workflow may safely do before any source implementation.

The conservative answer is: apply behavior may be considered only for existing accepted audio records. It should not create audio assets, discover files, place new SFX markers, or persist unaccepted suggestion records.

## Allowed Future Apply Targets

A future apply ticket may safely target only existing accepted project data:

- existing Background Audio settings
- existing SFX marker settings

Background Audio apply may adjust metadata-backed settings only:

- enabled
- trim start/end
- loop
- fade in/out
- volume

SFX marker apply may adjust metadata-backed settings only:

- target Camera Shot only if the marker already exists and the target shot still exists
- shot-relative offset
- play duration
- shot span
- volume
- label, if the user explicitly accepts a rename

Any future apply action must be explicit, visible, undoable through normal manual controls, and limited to the selected existing target. It must never operate as a hidden batch edit.

## Disallowed Future Apply Targets

Future audio suggestion apply behavior must not:

- create a new Background Audio file
- upload, fetch, download, generate, or bundle audio
- create new SFX markers automatically
- choose specific copyrighted tracks or commercial library ids
- place markers from raw AI page-understanding regions
- edit Camera Shots, Focus Regions, Shot Attention Path items, preview behavior, or export behavior
- persist temporary audio notes in Project JSON or archives unless a separate schema ticket explicitly adds that behavior
- send uploaded audio binaries to a provider unless a separate provider/privacy ticket explicitly scopes it

Creating draft SFX markers is a separate product decision. It should require its own ticket because it would introduce new temporary audio-marker objects and review/accept behavior.

## Required Apply Preconditions

Every future apply action must verify:

- the note is not rejected, stale, or blocked
- the target accepted Background Audio or SFX marker still exists
- any referenced Camera Shot still exists
- the proposed timing stays inside the target shot duration
- the proposed play duration stays within source audio duration and shot-span limits
- volume stays within the existing accepted range
- trim/fade settings stay inside the background audio duration
- the user has explicitly clicked an apply action for this one note and this one target

If any precondition fails, the action must be blocked with a clear reason and accepted data must remain unchanged.

## Review and UI Rules

A later apply UI should show:

- current accepted value
- proposed value
- affected accepted target
- reason
- warnings
- stale/blocked state
- explicit `Apply to existing audio` action only when safe

The read-only `Copy Terms` action should remain available for search phrases. Apply actions should be visually separate from copy/reject actions because copying text is not project mutation.

No `Apply All` control should be added in the first apply implementation.

## Stale and Blocked Rules

Audio apply suggestions should become stale when:

- accepted Camera Shots change order, duration, or ids
- accepted Shot Attention Path items change
- accepted Focus Regions referenced by an audio note change or disappear
- Background Audio is replaced or removed
- an SFX marker is replaced, removed, or retargeted
- source audio duration changes after archive/import or re-upload

Audio apply suggestions should be blocked when:

- they target missing accepted data
- they require a file that is not loaded
- they require creating a new marker
- they require generated/fetched/downloaded audio
- they reference unsupported fields
- proposed values are out of bounds

Blocked suggestions must explain the dependency instead of creating substitute targets.

## Project JSON and Archive Rules

Accepted audio data remains the only exported audio state:

- Background Audio metadata/settings
- SFX marker metadata/settings
- archive-bundled audio binaries already supported by existing manual workflows

Temporary audio notes and future apply suggestions should remain in memory only unless a separate schema ticket defines persisted suggestions. If persistence is later approved, suggestion records should live in a separate optional suggestion section and must not be mixed into accepted audio records.

## Provider, Privacy, and Licensing Rules

Future apply behavior does not require a provider. If a provider is later used:

- disclose the provider and data sent
- require explicit consent before sending image pixels, project data, audio metadata, or audio binaries
- do not send uploaded audio binaries unless a separate ticket explicitly allows it
- do not recommend copyrighted tracks by title unless supplied by the user
- keep provider failures from mutating accepted project data

## Recommended Next Ticket

T0106 - Director Rulebook v1 Planning has since superseded the earlier immediate audio-apply spike and is now implemented as docs-only. T0107 has since integrated the rulebook into runtime camera/audio suggestion generation and post-processing.

The current recommended next ticket is T0108 - Rulebook Evaluation Pass. Existing-audio apply behavior remains deferred until camera/audio suggestions are evaluated after rulebook integration. When resumed, audio apply should still implement only safe apply actions to existing Background Audio settings or existing SFX marker settings. It should not create audio assets, generate audio, fetch audio, place new markers, persist suggestions, or alter preview/export behavior.

## Manual Verification

For T0105:

- Confirm this document is planning-only.
- Confirm future apply behavior is limited to existing accepted Background Audio settings or existing SFX marker settings.
- Confirm new SFX marker creation remains separately ticketed.
- Confirm stale/blocked rules prevent mutation when accepted targets change or disappear.
- Confirm Project JSON suggestion persistence remains out of scope.
- Confirm no source files changed.
