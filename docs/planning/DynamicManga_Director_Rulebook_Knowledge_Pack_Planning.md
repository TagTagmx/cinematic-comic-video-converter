# DynamicManga Director Rulebook / Knowledge Pack Planning

This document is planning only for T0088. It does not implement source behavior, Project JSON schema changes, suggestion persistence, provider/API code, real AI calls, preview behavior, export behavior, automatic generation, audio fetching/downloading, automatic SFX placement, dependencies, or accepted project mutation.

## Purpose

Future AI should not only identify page regions. It should help direct the page as a readable cinematic comic sequence. T0087 defined the provider-neutral page-understanding response contract. T0088 plans the director knowledge layer that can translate that evidence into reviewable guidance.

The knowledge pack should be article-derived and product-specific. DynamicManga is the primary research anchor because it validates page-preserving camera movement over still comic pages: extract page elements, estimate semantic intent, then use virtual camera movement, timing, holds, transitions, and restrained effects to support story beats.

This rulebook is not the provider integration. It is the layer of cinematic reading rules a later system can use when turning panels, regions, mood, text density, action cues, character cues, and composition into suggestions.

## Core Rule

Accepted project data remains the source of truth:

- Camera Shots are accepted page-level reading containers.
- Focus Regions are accepted page-level reusable attention targets.
- Shot Attention Paths are accepted per-shot references to page-level Focus Regions.
- Accepted motion roles remain `track`, `pushIn`, and `pushOut`.
- Accepted effects remain supporting layers, currently Shake and Impact Pulse.
- Manual Background music and SFX markers remain accepted audio data.

All AI and rulebook outputs remain temporary reviewable suggestions until the user explicitly accepts, edits, applies, or rejects them.

## Knowledge Pack Shape

A future director knowledge pack should be a versioned planning/runtime asset, independent from Project JSON. It should contain:

- `knowledgePackName`: stable pack identifier, such as DynamicManga director guidance.
- `knowledgePackVersion`: version for reproducible suggestion behavior.
- `sourceReferences`: human-readable references to research notes, articles, and internal product docs.
- `ruleFamilies`: grouped rules for context, reading order, pacing, motion, mood, effects, and audio direction.
- `ruleId`: stable identifier for each rule so suggestions can cite why they exist.
- `ruleSummary`: concise human-readable guidance.
- `evidenceInputs`: page-understanding fields the rule may consume.
- `suggestionOutputs`: suggestion types the rule may propose.
- `guardrails`: conditions that block or downgrade a suggestion.
- `confidenceInfluence`: how the rule should raise, lower, or preserve confidence.

The review surface should be able to show the rule reason without exposing long prompts or opaque provider internals.

## Evidence Inputs

The rulebook should consume normalized evidence from the future T0087-style page-understanding contract, not raw provider output. Useful evidence includes:

- Panel or scene candidates, their geometry, and reading-order relations.
- Character, face, expression, pose, gaze, and recurring-subject candidates.
- Speech, caption, sound-effect text, detail, action, impact, establishing, and background region candidates.
- Region confidence, ambiguity warnings, and overlap warnings.
- Text density or speech-heavy flags without requiring OCR text.
- Composition cues such as strong borders, diagonal action, large splash regions, isolated close-ups, and visual direction.
- Mood or energy notes with visual evidence.
- Existing accepted Camera Shots, Focus Regions, Shot Attention Paths, timing, effects, and audio markers.

Provider-specific fields should be normalized before rule evaluation. Unknown evidence should be ignored or converted into low-confidence notes rather than accepted directly.

## Rule Families

### Page Context Preservation

Guidance:

- Preserve the full page as the world.
- Prefer page enter or establishing context when a page has dense layout, ambiguous reading order, large splash art, or strong spatial relationships.
- Avoid over-fragmenting the page into many tight close-ups when the reader needs layout orientation.

Possible suggestions:

- Page-level director note recommending context-first playback.
- Camera Shot candidate covering a meaningful panel or scene region.
- Warning that a proposed shot or focus candidate is too tight to preserve readability.

### Reading Order

Guidance:

- Follow detected or user-accepted reading order before cinematic flourish.
- Downgrade confidence when panel order is ambiguous, borderless, overlapping, or culturally direction-dependent.
- Suggest edit-before-accept when alternate reading orders are plausible.

Possible suggestions:

- Reading-order candidate among panel or scene candidates.
- Camera Shot order suggestion.
- Attention-path order suggestion inside an accepted or proposed Camera Shot.

### Speech-Heavy Pacing

Guidance:

- Speech-heavy, caption-heavy, or dense text regions need longer readable holds and calmer movement.
- Avoid aggressive `pushIn`, rapid `track`, loud SFX, or Impact Pulse over dialogue-heavy beats unless the visual evidence strongly supports it.
- Treat OCR text as optional future evidence, not a requirement for pacing caution.

Possible suggestions:

- Longer duration or duration-weight idea.
- `track` only when moving between related speech/character beats.
- Audio warning to keep BGM/SFX restrained.

### Action Emphasis

Guidance:

- Action lines, impact poses, speed marks, striking diagonals, and high-energy compositions may support shorter beats, faster attention transfer, Shake, Impact Pulse, or sharper SFX suggestions.
- Action should still remain readable; effects must support camera placement, not replace it.
- Avoid applying effects where the action evidence is low-confidence or where text readability would suffer.

Possible suggestions:

- `track` along visible motion or attention direction.
- `pushIn` for an impact point or reaction after the action.
- Shake or Impact Pulse as optional effect suggestions.
- SFX category/search-term ideas tied to the action beat.

### Character, Face, And Reaction Direction

Guidance:

- Faces, expressions, gestures, and reaction poses can justify Focus Region candidates and emotional pacing.
- A face close-up should usually be a Focus Region candidate first, not a replacement Camera Shot.
- Recurring character hints can help sequence attention, but should not become identity claims.

Possible suggestions:

- Focus Region candidate for face, gesture, or reaction.
- `pushIn` for emotional weight or important detail.
- Slower timing for quiet reaction or mood.
- Audio mood note rather than automatic dialogue/narration.

### Detail And Reveal

Guidance:

- Clues, props, small gestures, hidden objects, or delayed information can justify detail Focus Regions and staged attention.
- With the current active grammar, reveal-like intent should map conservatively to `pushOut` when restoring broader context, `pushIn` when isolating an important detail, or `track` when transferring attention.
- Do not reintroduce legacy `reveal` as an active stored motion role unless a later schema ticket explicitly adds it.

Possible suggestions:

- Detail Focus Region candidate.
- Attention Path candidate with edit-before-accept when the reveal order is uncertain.
- Motion intent constrained to `track`, `pushIn`, or `pushOut`.

### Motion Grammar

Guidance:

- `track` means stable-scale eye guidance: a calm pan/glide between Focus Region targets for normal reading flow, dialogue flow, scanning details, and most multi-FR movement.
- `pushIn` means a deliberate zoom toward a subject/detail for emotional emphasis, reaction, threat, realization, inspection, or importance.
- `pushOut` means a deliberate zoom away from a subject/detail to restore context, reveal environment, or show relationships.
- Do not choose `pushIn` or `pushOut` only because multiple FRs exist. Multiple FRs usually default to `track` unless story meaning clearly requires emphasis, inspection, reveal, or context restoration.
- Sometimes the best direction is a calm hold, represented today as timing/duration guidance rather than a new active stored role.

Possible suggestions:

- Motion intent candidates only using `track`, `pushIn`, or `pushOut`.
- Duration-weight ideas for accepted or proposed attention beats.
- Blocked suggestion when a rule wants unsupported motion vocabulary.

### Mood And Effects

Guidance:

- Mood should explain pacing and restraint before it chooses effects.
- Shake and Impact Pulse may support impact, tension, surprise, or high-energy action, but they are secondary to reading clarity.
- Do not revive old lift, spotlight, zoom, blur, vignette, or reveal-mask behavior as accepted suggestions unless future tickets re-scope those effects.

Possible suggestions:

- Director note with mood and evidence.
- Optional Shake or Impact Pulse suggestion with caution.
- Warning when effects may harm readability.

### Audio Direction

Guidance:

- Audio suggestions should follow accepted or proposed visual direction.
- BGM should support page mood, pacing, and scene energy.
- SFX should be tied to action, impact, object, or environmental evidence and remain optional.
- Speech-heavy regions should usually reduce SFX intensity.

Possible suggestions:

- BGM tone/search phrase and pacing idea.
- SFX category/search phrase tied to page, shot, or attention beat.
- Warning that audio should remain restrained.

## Mapping Evidence To Suggestions

The rulebook should produce suggestion reasoning like:

- Strong panel boundary plus clear sequence evidence -> Camera Shot candidate and reading-order suggestion.
- Large establishing background with multiple characters -> context-preserving shot or page-enter note.
- Face close-up or expression evidence -> Focus Region candidate and possible `pushIn`.
- Action lines or impact pose -> `track`, Shake, Impact Pulse, or SFX idea, depending on text density and confidence.
- Dense speech region -> longer timing, calmer motion, restrained audio warning.
- Small clue/object detail -> Focus Region candidate, possible `pushIn`, and edit-before-accept if the detail is visually ambiguous.
- Close-up followed by wider context evidence -> `pushOut` intent.
- Ordinary multi-target reading sequence -> `track` path with readable timing; do not over-direct every transition into push roles.

Each suggestion should cite the rule family, the evidence used, confidence, warnings, and why the guidance helps reading or storytelling.

## Confidence And Warning Rules

The rulebook should adjust confidence conservatively:

- Raise confidence when multiple independent visual cues support the same suggestion.
- Lower confidence when geometry overlaps, order is ambiguous, evidence is weak, or the source page is visually dense.
- Mark suggestions blocked when they require missing accepted targets, rejected temporary dependencies, unsupported motion roles, unsupported effects, out-of-bounds geometry, or provider fields that failed validation.
- Mark suggestions edit-before-accept when they are useful but need human judgment, especially reading order, panel grouping, dialogue pacing, and subtle mood.

Warnings should stay first-class fields compatible with the unified review surface. They should not be buried in prose.

## Prompt / Rulebook Boundary

A later provider workflow may use this knowledge pack in prompts, local deterministic post-processing, or both. The planning boundary should remain:

- The rulebook defines product-safe directing principles.
- The provider returns page-understanding evidence and suggestion candidates.
- Validation normalizes provider output.
- The knowledge pack can rank, filter, explain, or generate reviewable suggestions from that evidence.
- The review surface shows temporary suggestions.
- Accepted project data changes only after explicit user action.

The system should avoid hiding product rules only inside provider prompts. Important rules should exist as documented, versioned guidance so behavior can be reviewed and tested.

## Later Gates

Before real API integration, later tickets should still decide:

- AI budget/provider decision gate: provider choice, expected cost, token/image limits, latency, cancellation, error handling, and user consent.
- Provider privacy and data handling: what image data is sent, whether provider storage is allowed, and how failures are surfaced.
- Knowledge pack versioning: whether accepted suggestions record rule provenance later.
- Suggestion persistence: whether unaccepted suggestions are transient only or can be saved in archives.
- Dynamic rule evaluation: whether the first implementation uses provider-only reasoning, local rule post-processing, or a hybrid.

## Non-Goals

T0088 does not implement:

- Source code changes.
- Provider/API code.
- Real AI calls.
- Project JSON schema changes.
- Suggestion persistence.
- Automatic Camera Shot, Focus Region, Shot Attention Path, effect, timing, or audio generation.
- Preview or export behavior changes.
- OCR, panel detection runtime, face detection runtime, speech bubble recognition, audio generation, or automatic SFX placement.

## Recommended Next Ticket

Recommended next ticket: T0089 - AI Budget / Provider Decision Gate Planning.

Rationale: T0086 through T0088 now define the review surface, future vision response contract, and director knowledge layer. The next planning step should decide provider/budget/privacy/consent constraints before any real provider/API integration or runtime AI work.
