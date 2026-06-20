# Practice Fixture and Evaluation Pass

This document completes T0101. It defines a controlled practice set and expected-behavior checklist for corrected page understanding, AI Camera Suggestions, and Draft Motion review. It does not add source behavior, provider features, fixtures, bundled comic assets, Project JSON schema changes, preview/export changes, audio/SFX behavior, dependencies, automatic scoring, or accepted-state mutation.

## Purpose

T0100 and T0100A made the AI camera suggestion to Draft Motion path usable enough to evaluate. The next risk is judging quality from one-off pages. This checklist gives humans and Codex a repeatable set of page types, expected outputs, and pass/fail notes before T0102 changes motion timing.

The practice set should be run with legally usable local images. Garfield or other simple comic-strip pages may be used as real-world practice material only when the user already has a local/legal copy for private testing. No copyrighted practice images are committed by this ticket.

## Core Evaluation Rule

Accepted project data remains the source of truth:

- AI Page Understanding output is temporary review data.
- AI Camera Suggestions are temporary review cards.
- Draft Motion helper suggestions are temporary until explicitly accepted.
- Accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, and SFX markers must not change from analysis or review alone.
- Accepted motion roles remain `track`, `pushIn`, and `pushOut`.

## Practice Set

Each practice page should be tested from a fresh upload or fresh project import. If provider access is unavailable, use the same page types with any available local/mock review output and record that provider quality was not evaluated.

### 1. Simple Dialogue Strip

Recommended material: a three- or four-panel horizontal gag strip with clear speech balloons and simple staging.

What to check:

- Panel detection/order follows the left-to-right reading order for the main strip.
- Speech regions are associated with the correct panel when possible.
- AI Camera Suggestions favor `track` for ordinary reading flow between dialogue beats.
- Timing hints are calm and readable rather than action-heavy.
- Draft Motion creates one readable shot or a small sequence of readable shots without over-zooming on text.

Pass notes:

- Pass if suggested motion preserves gag setup -> response -> punchline order.
- Fail if the camera skips the punchline panel, treats every speech balloon as a dramatic `pushIn`, or proposes unreadable tight crops around text.

### 2. Emotional Close-Up

Recommended material: a panel or short sequence dominated by a face, reaction, realization, fear, surprise, or quiet emotional beat.

What to check:

- Character/face or reaction evidence is present, even if geometry is approximate.
- Corrected/accepted detail highlights can override weak AI detail guesses when the user marks the important expression.
- AI Camera Suggestions may use `pushIn` when the reason is clear emotional emphasis.
- Timing hints include a settle/hold idea rather than fast travel through the reaction.
- Draft Motion keeps the face or expression readable inside the 16:9 stage.

Pass notes:

- Pass if `pushIn` is reserved for the meaningful reaction beat and the reason names the emotional intent.
- Fail if the suggestion zooms into an irrelevant face/background detail or uses `pushOut` without a context-restoration reason.

### 3. Establishing Panel

Recommended material: a wide or tall panel that introduces a room, street, landscape, crowd, or relationship between characters.

What to check:

- Page understanding marks the panel as environment, background, establishing, or broad scene evidence when possible.
- AI Camera Suggestions prefer `pushOut` only when moving from a detail to restored context or revealing the broader scene.
- For a single broad establishing panel, `track` or a stable shot may be preferable to unnecessary zoom.
- Draft Motion preserves enough context to understand place and character relationship.
- The 16:9 preview/export stage contains the shot without destructive source-page cropping.

Pass notes:

- Pass if the generated draft shows the environment before close details dominate.
- Fail if the suggestion starts too tight, loses scene context, or invents unsupported action emphasis.

### 4. Two-Character Conversation

Recommended material: a page or strip where two characters alternate speech/reaction beats.

What to check:

- Reading order does not jump between characters out of dialogue order.
- Character/face regions are grouped under the correct panel when available.
- AI Camera Suggestions use `track` for ordinary eye-guidance between speakers unless a specific reaction earns `pushIn`.
- Timing hints distinguish speech-heavy beats from reaction beats.
- Draft Motion creates Focus Regions that can be manually edited into a speaker-to-speaker attention path.

Pass notes:

- Pass if motion follows conversation rhythm and avoids over-cutting every speaker.
- Fail if it reverses who speaks first, ignores reaction emphasis, or creates duplicate draft motion for an already-drafted suggestion.

### 5. Action Page

Recommended material: a page or panel with clear impact, chase, movement, fight, fall, crash, speed lines, or large sound-effect lettering.

What to check:

- Action/impact regions appear when visible.
- AI Camera Suggestions may use faster timing hints or `pushIn` for impact emphasis when the reason is grounded in visible action.
- `track` remains valid for reading flow into or out of the action.
- Draft Motion does not require parallax, cutouts, face tracking, OCR, or new motion roles.
- Accepted effect cues, if manually present, remain separate rendering-layer modifiers and are not invented automatically.

Pass notes:

- Pass if the suggestion makes the action beat clearer while staying in `track` / `pushIn` / `pushOut`.
- Fail if it proposes unsupported animation, character cutouts, new roles, hidden SFX placement, or unreadable fast motion.

### 6. Multi-Detail Page

Recommended material: a page with multiple important props, clues, signs, reaction details, or small visual reveals.

What to check:

- The AI may miss or approximate small details; user-corrected accepted detail highlights should become the preferred input.
- AI Camera Suggestions should reference accepted detail targets when they exist.
- Detail/reveal suggestions should use `pushIn` for inspection or `pushOut` for reveal/context restoration only with clear reasons.
- Draft Motion should create distinct Focus Regions for the key details without covering unrelated page areas.
- Re-running AI page understanding should not overwrite accepted/corrected detail highlights.

Pass notes:

- Pass if corrected details improve suggestion relevance and remain editable accepted project data.
- Fail if raw AI guesses override accepted details, stale targets remain usable, or draft helper acceptance creates invalid/stale references.

## Optional Garfield / Simple Strip Evaluation

Use a local/legal Garfield or similarly simple comic strip when available because it is good for evaluating basic reading rhythm:

- Three-panel gag structure should remain ordered.
- Ordinary panel-to-panel reading should mostly use `track`.
- The punchline panel may receive a timing hold or restrained emphasis when justified.
- The provider does not need pixel-perfect character or speech geometry to produce useful direction.
- Draft Motion should be simple enough that a user can inspect and accept/reject quickly.

Do not commit the strip image to the repository unless a later ticket provides a clear legal fixture source.

## Evaluation Procedure

For each practice page:

1. Start from a fresh upload or fresh imported project.
2. Run AI page understanding.
3. Inspect Page Understanding cards and canvas highlights.
4. Correct or accept important detail highlights when the page type needs them.
5. Generate AI Camera Suggestions.
6. Inspect target binding, movement role, timing hint, reason, confidence, validation, and stale/blocked state.
7. Edit one suggestion's movement/timing/reason when appropriate.
8. Reject one unsuitable suggestion and confirm accepted project data remains unchanged.
9. Use Create Draft Motion on one usable non-stale suggestion.
10. Confirm the temporary Draft Motion helper appears with shot/focus overlays and does not mutate accepted project data.
11. Accept one Draft Motion helper only after inspection.
12. Confirm the accepted result is normal editable Camera Shot, Focus Region, and Shot Attention Path data.
13. Export/import Project JSON or archive only if the test also needs persistence verification; T0101 does not require it.

## Pass / Fail Checklist

### Page Understanding

Pass:

- Main panels are detected or at least represented well enough for review.
- Reading order is plausible for the page.
- Important character, speech, action, or detail evidence appears when visually obvious.
- Bad, missing, low-confidence, or approximate geometry is shown as review data rather than silently trusted.
- Hover/focus/click highlights line up with analyzed image geometry.

Fail:

- The review UI crashes on partial or weak analysis.
- The main page or panel order is unusably reversed without warning.
- Out-of-bounds or stale geometry is treated as usable.
- Viewing analysis mutates accepted Camera Shots, Focus Regions, Shot Attention Paths, audio, SFX, preview, export, or Project JSON.

### Detail Correction

Pass:

- User-created or accepted detail highlights remain editable project data.
- Corrected detail labels, descriptions, and geometry are preferred over raw AI detail guesses when generating camera suggestions.
- Rejected or accepted AI detail boxes do not immediately reappear as duplicate review work after rerun when geometry matches.
- Invalid or clamped geometry is surfaced to the user.

Fail:

- Raw provider detail guesses override accepted user corrections.
- Detail edits create zero-area or out-of-bounds project data.
- Rerunning page understanding deletes accepted detail highlights.

### AI Camera Suggestions

Pass:

- Suggestions are grouped and inspectable.
- Target and supporting references are visible and stale-aware.
- `track` is the normal reading-flow role.
- `pushIn` is reserved for emphasis, reaction, threat, realization, inspection, impact, or detail focus.
- `pushOut` is reserved for context restoration, reveal, environment, or relationship.
- Timing hints fit the scenario: calm for dialogue, held for reaction, broader for establishing, sharper for action.
- Reject/edit/review actions stay temporary.

Fail:

- Suggestions introduce unsupported roles, parallax, character cutouts, OCR timing, automatic SFX placement, or hidden project mutations.
- Ordinary multi-region reading flow defaults to zooming every beat.
- Blocked or stale suggestions can create Draft Motion.

### Draft Motion

Pass:

- Create Draft Motion creates a temporary helper suggestion only.
- Helper overlays are visually distinct from accepted Camera Shots and Focus Regions.
- Accepting the helper creates normal editable accepted records with valid remapped ids.
- Rejected helpers leave accepted project data unchanged.
- Created Shot Attention Path items use only `track`, `pushIn`, and `pushOut`.
- Manual editing remains authoritative after acceptance.

Fail:

- Draft creation directly mutates accepted project state before helper acceptance.
- Duplicate draft creation is allowed for already-drafted suggestions.
- Accepted helper output contains stale target ids or unsupported roles.
- Preview/export behavior changes before the user accepts project data.

## Recording Results

Use this short note format when manually evaluating a page:

```txt
Practice page:
Scenario type:
Source/legal note:
Provider/model:
Page understanding pass/fail:
Detail correction pass/fail:
AI camera suggestions pass/fail:
Draft motion pass/fail:
Notable misses:
Manual correction needed:
Would this page help T0102 timing work?:
```

## T0102 Baseline

T0102 should use this practice set before changing motion feel. The useful baseline questions are:

- Which scenarios feel too mechanical today?
- Which timing hints create readable holds?
- Where does `track` need calmer settle timing?
- Where does `pushIn` need stronger but still restrained emphasis?
- Where does `pushOut` restore context too early or too late?
- Which failures are provider/content quality issues rather than motion-timing issues?

T0102 should not add new motion roles, parallax, OCR timing, automatic audio/SFX placement, or automatic accepted-state mutation.

## Manual Verification

For T0101:

- Review this checklist and confirm it covers simple dialogue, emotional close-up, establishing panel, two-character conversation, action page, and multi-detail page.
- Confirm Garfield/simple comic pages are optional local/legal practice material only and are not bundled.
- Confirm expected behavior is concrete for detection/order, detail correction, AI Camera Suggestions, timing hints, and Draft Motion.
- Confirm source files did not change.
- Build is not required because T0101 is documentation-only.
