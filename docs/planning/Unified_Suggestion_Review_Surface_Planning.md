# Unified Suggestion Review Surface Planning

This document is planning only for T0086. It does not implement source behavior, Project JSON schema changes, suggestion persistence, provider/API code, preview behavior, export behavior, real AI calls, automatic generation, audio fetching/downloading, automatic SFX placement, OCR, panel detection runtime, dependencies, or accepted project mutation.

## Purpose

The project now has several suggestion families either implemented as local/mock workflows or planned for later AI work. They should not grow into separate review experiences with different rules. T0086 plans one unified suggestion review surface that can handle current mock suggestions and future AI vision/page-understanding suggestions.

This is not only an organizer for current JSON-derived mock director notes. Those notes are scaffolding for the eventual value of AI: reading the comic page image and suggesting useful authoring candidates that the user can inspect, correct, accept, or reject.

The real future AI value is page understanding:

- possible panels and scene groupings
- reading order and pacing structure
- characters, faces, expressions, and recurring subjects
- speech, detail, action, impact, and establishing regions
- mood and directing intent
- Camera Shot candidates
- page-level Focus Region candidates
- Shot Attention Path and motion-intent candidates
- BGM/SFX tone, category, search-term, and timing ideas

All of those outputs must still pass through explicit review before they affect accepted project data.

## Source Of Truth

Accepted project data remains the source of truth:

- Camera Shots are accepted page-level reading containers.
- Focus Regions are accepted page-level reusable attention targets.
- Shot Attention Paths are accepted per-shot references to page-level Focus Regions.
- Accepted motion roles remain `track`, `pushIn`, and `pushOut`.
- Shake and Impact Pulse remain accepted supporting effect layers.
- Background music and SFX markers remain accepted manual audio data.
- Export uses accepted project data only.

Suggestions are temporary review records until explicit user action accepts or applies them.

## Suggestion Families

The unified surface should support these current and future families.

### Director Notes

Director notes advise on existing accepted targets:

- mood or storytelling intent for an existing Camera Shot
- motion intent for an existing Shot Attention Path item
- effect support using accepted Shake or Impact Pulse behavior
- cue timing ideas such as `early` or `arrival`
- timing or duration-weight advice

These may be inspect-only or safely apply to existing targets when a later source ticket explicitly supports the apply behavior.

### Draft Attention Paths

Draft attention paths propose ordered per-shot references to existing Focus Regions:

- target existing Camera Shot
- proposed ordered Focus Region references
- proposed `track`, `pushIn`, or `pushOut` motion roles
- proposed duration-weight ideas
- reasons for order and motion intent

Accepting a valid draft should write normal editable Shot Attention Path items only after explicit user action. Stale drafts must block acceptance.

### Draft Camera Shot And Focus Region Candidates

Future shot/focus suggestions may propose new accepted entities, but only as drafts:

- Camera Shot candidate geometry, label, purpose, pacing rationale, and warnings
- Focus Region candidate geometry, label, kind, sequence hint, source-shot context, and warnings
- possible relationship between suggested shots and suggested focus regions
- duplicate or overlap warnings against accepted project data

Accepting a draft Camera Shot or Focus Region should create a normal editable accepted entity only after the user reviews it. Edit-before-accept should be planned before implementation.

### Audio/BGM/SFX Suggestions

Audio suggestions remain advisory until a later ticket explicitly scopes apply behavior:

- BGM mood, genre, pacing, and search-term ideas
- SFX category and search-term ideas
- shot-level or beat-level timing ideas
- volume/restraint notes
- warnings about readability, masking dialogue, or overusing impacts

These should not fetch, generate, download, or place audio assets. User-owned uploads and manual BGM/SFX workflows remain the accepted path.

### Future Vision/Page-Understanding Suggestions

Future vision suggestions are the target experience, not a side case. The review surface should be ready to show AI outputs derived from page pixels when a later provider ticket explicitly allows that.

Potential vision/page-understanding suggestion types:

- panel or scene-region candidates
- reading-order candidates
- character or face candidates
- speech, detail, action, impact, and establishing-region candidates
- mood and tone annotations
- shot candidates derived from panel/scene understanding
- Focus Region candidates derived from faces, speech, action, or detail emphasis
- attention-path candidates derived from reading flow and visual salience
- warnings for ambiguous layouts, overlapping panels, unclear reading order, dense text, or low confidence

Vision suggestions must not be treated as accepted panel detection, OCR, face detection, or automatic generation. They are review candidates only.

## Common Suggestion Fields

Every suggestion card should expose a consistent set of fields where applicable:

- `type`: director note, attention path draft, shot candidate, focus candidate, audio idea, vision finding, warning, or future extension
- `target`: project, page, Camera Shot, Focus Region, Shot Attention Path item, audio marker, or draft target
- `proposed value`: geometry, ordered references, motion role, effect cue, cue timing, audio phrase, mood, or warning
- `confidence`: high, medium, low, unknown, or provider-specific confidence normalized into a small vocabulary
- `reason`: concise explanation grounded in readability, story intent, visual evidence, timing, or audio support
- `warning`: privacy, stale target, low confidence, duplicate, unsupported field, out-of-bounds geometry, or ambiguous reading
- `state`: draft, inspect-only, applicable, blocked, stale, accepted, rejected, discarded, or superseded
- `source`: mock rule, manual draft, local heuristic, future provider, imported suggestion, or user-created suggestion
- `created context`: source image identity, project revision context, target IDs, and relevant accepted data snapshot when needed for stale checks

The UI should make blocked or stale states visible before action buttons.

## Review Actions

Actions should depend on suggestion type and state:

- Inspect: show details, target context, reason, and warnings without changing project data.
- Accept: convert a valid draft suggestion into normal accepted project data.
- Apply: update an existing accepted target when the suggestion is safe and explicitly scoped.
- Edit: let the user revise proposed geometry, target, label, role, timing, or settings before accepting.
- Reject: mark the suggestion as rejected and hide or archive it from the active review queue.
- Discard: remove temporary local suggestions that do not need history.
- Copy: copy audio search terms or provider-neutral prompt/search phrases.
- Blocked: show why no action is allowed.

Accept-all should not be the default. If a later ticket adds batch actions, the UI must summarize what will change and skip stale or blocked suggestions.

## Layout And Grouping

The unified surface should support multiple views:

- All suggestions, newest or highest-priority first
- By Camera Shot
- By page-level region or draft geometry
- By Shot Attention Path beat
- By audio/project-level target
- By issue/warning status
- By future AI vision finding type

Suggested grouping strategy:

- Project-level group: BGM ideas, global pacing, page-level mood, provider warnings
- Page-level group: vision findings, panel candidates, reading-order candidates, Focus Region candidates
- Shot-level group: director notes, shot candidates, shot effects, timing, SFX ideas
- Beat-level group: attention-path items, motion intent, effect cues, beat-level SFX ideas

The user should be able to inspect a suggestion from a list and see any relevant geometry overlay or target context without accepting it.

## Stale And Blocked Rules

A suggestion should become stale or blocked when:

- the source image changes
- the relevant accepted Camera Shot no longer exists
- the referenced Focus Region no longer exists
- the referenced Shot Attention Path item no longer exists
- target audio marker or BGM metadata no longer exists
- proposed geometry is outside source-image bounds
- a suggested entity now duplicates an accepted entity too closely
- the suggestion references unsupported motion roles, effects, audio behavior, schema fields, or provider-only data
- the project context has changed enough that the suggestion reason is no longer valid

Stale suggestions must not silently retarget themselves. The surface can suggest regeneration later, but regeneration is separate from acceptance.

## Accepted-State Boundaries

The review surface must preserve the accepted-data boundary:

- Viewing a suggestion does not mutate project data.
- Reordering or filtering suggestions does not mutate project data.
- Rejected suggestions do not affect preview or export.
- Export ignores unaccepted suggestions.
- Project JSON should not persist unaccepted suggestions unless a later schema ticket explicitly allows it.
- Accepted suggestions become ordinary editable project data unless a later provenance ticket records source metadata.

## Vision Provider Boundary

Future vision/page-understanding work should not begin from UI alone. Before any provider reads image pixels, a later contract ticket must define:

- what page/image data is sent
- provider disclosure and explicit consent
- cancellation and failure states
- response schema
- validation and normalization
- confidence normalization
- unsupported-field rejection
- stale-target handling
- privacy and copyright warnings
- whether any suggestion data can be persisted

T0087 has since handled that contract planning before real provider/API code.

## Recommended Next Ticket

Historical note: T0087 has since planned the AI vision/page-understanding response contract.

Historical note: T0088 has since planned the DynamicManga director rulebook / knowledge pack.

Current next recommended ticket: T0089 - AI Budget / Provider Decision Gate Planning.

T0089 should plan provider, budget, privacy, consent, latency, cancellation, and failure-handling constraints before real provider/API implementation. It should leave provider/API code and automatic generation out of scope.

## Manual Verification Expectations

For this planning ticket:

- Confirm this document is planning-only.
- Confirm it covers director notes, draft attention paths, draft Camera Shot / Focus Region candidates, audio/BGM/SFX suggestions, and future vision/page-understanding suggestions.
- Confirm it explicitly says future vision suggestions are the real AI value and JSON/mock notes are scaffolding.
- Confirm it keeps accepted project data as the source of truth.
- Confirm suggestions remain temporary until explicit user action.
- Confirm it defines target, type, confidence, reason, warning, stale/blocked state, and accept/reject/edit actions.
- Confirm the historical T0087 recommendation has been superseded by T0088 and the current next recommendation is T0089 - AI Budget / Provider Decision Gate Planning.
- Confirm it does not claim source behavior, Project JSON schema changes, provider/API code, preview/export behavior, real AI calls, or automatic generation exists.
