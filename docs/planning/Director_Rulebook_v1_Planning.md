# Director Rulebook v1 Planning

This document completes T0106. It is planning only. It does not implement source behavior, provider routes, runtime rulebook loading, Project JSON schema changes, preview behavior, export behavior, audio apply behavior, OCR timing, parallax, character cutouts, segmentation animation, new motion roles, or automatic accepted-state mutation.

## Purpose

Director Rulebook v1 is a shared director/taste layer for camera, timing, BGM, and SFX suggestions. It turns page-understanding evidence and accepted project data into a small set of readable story beats instead of letting every detected region become motion or audio.

The rulebook should improve suggestion quality before broader camera/audio apply behavior. It should help AI Camera Suggestions, Draft Motion, timing hints, read-only Audio Notes, and future apply guardrails speak the same directing language.

The rulebook does not replace user review. All AI Page Understanding, AI Camera Suggestions, Draft Motion helpers, timing hints, BGM notes, and SFX notes remain temporary/review-only until the user explicitly accepts or applies behavior that a later ticket has scoped.

Accepted project data remains the source of truth:

- accepted Camera Shots
- accepted page-level Focus Regions
- accepted Shot Attention Paths
- accepted detail highlights and user corrections
- accepted shot purpose metadata and timing
- accepted Shake and Impact Pulse effect settings/cues
- accepted Background music settings and SFX markers

## Inputs

The rulebook should consume normalized evidence, not raw provider-specific output.

AI Page Understanding inputs:

- panel or scene candidates, geometry, summary, confidence, and reading order
- character and face regions, expression/gaze/pose hints, and confidence
- speech and caption regions, speech-heavy flags, and text-density hints without requiring OCR
- action and impact regions, speed-line or contact evidence, and energy/mood notes
- detail/object regions, clue/reveal candidates, and ambiguity warnings
- page mood, layout density, establishing/background regions, and scene-change cues

Accepted/corrected project inputs:

- accepted Camera Shots, order, geometry, labels, duration, purpose, and start framing
- accepted Focus Regions, labels, kinds, source context, and geometry
- accepted Shot Attention Path items, referenced Focus Regions, motion roles, duration weights, and effect cues
- accepted detail highlights, especially user-corrected detail labels/descriptions
- accepted special effects, currently Shake and Impact Pulse
- accepted BGM metadata/settings and SFX marker metadata/settings when available

User corrections outrank raw AI detections. A corrected detail, manually placed Focus Region, accepted Camera Shot, or accepted Shot Attention Path item should carry more directing weight than an unreviewed provider box with higher raw confidence.

## Beat Taxonomy

The first rulebook should classify suggestion intent into practical beat types:

- `establishingEnvironment`: orient the reader in a place, layout, crowd, exterior, room, or page-wide relationship.
- `normalReadingFlow`: follow panel/scene order without special emphasis.
- `dialogueSpeechHeavy`: preserve readability for balloons, captions, and quieter exchange.
- `speakerToSpeakerExchange`: guide the eye between speakers or conversational targets.
- `reactionEmotion`: settle on a face, expression, realization, hesitation, or emotional turn.
- `actionImpact`: support visible motion, contact, attack, fall, hit, crash, burst, or fast gesture.
- `detailInspectionClue`: inspect a meaningful prop, clue, small gesture, symbol, or accepted/corrected detail.
- `revealContextRestoration`: widen or re-orient after a close detail, reaction, or partial view.
- `transitionSceneChange`: bridge location/time/state changes without inventing extra beats.
- `punchlineGagPayoff`: preserve setup/payoff rhythm and final hold for comedy or visual twist.
- `tensionMood`: support suspense, threat, quiet dread, ambience, or tonal build.

These beat labels are planning/runtime suggestion metadata only. They are not Project JSON schema changes unless a future schema ticket explicitly adds persisted rule provenance.

## Camera Rules

Director Rulebook v1 must use only the active camera grammar:

- `track`: normal reading flow, speaker-to-speaker exchange, multi-target eye guidance, calm pan/glide, and ordinary detail scanning.
- `pushIn`: reaction, emotion, realization, threat, inspection, impact, or meaningful detail focus.
- `pushOut`: context restoration, reveal, environment, relationship, or re-orientation.

Rules:

- Do not create motion for every detected region. The rulebook should prefer one readable suggestion/path per ordinary panel and only a small number for complex/action/detail-heavy panels.
- Speech regions mostly affect timing and hold guidance. A speech balloon alone is not a motion target unless paired with accepted speaker context, reaction, or story-relevant visual evidence.
- Raw character/face regions become motion targets only when narratively useful: speaker focus, reaction, emotion, threat, action, or an important gaze/pose beat.
- Detail regions become motion targets mainly when accepted/corrected by the user or clearly justified as inspection, reveal, or clue evidence.
- Avoid motion when two candidate windows are too similar in center, scale, or story meaning. Prefer a hold or one merged `track` beat.
- Prefer reading order over raw region confidence when sequencing path targets.
- Prefer fewer meaningful beats over many detected boxes.
- Block or downgrade suggestions that require unsupported motion vocabulary. No `reveal`, `zoom`, `pan`, `tilt`, `follow`, `cut`, or other new stored roles should be introduced.

Beat mapping:

| Beat type | Camera guidance |
| --- | --- |
| establishing/environment | Usually `pushOut` or a calm hold/context shot; avoid tight detail-first motion unless accepted data says otherwise. |
| normal reading flow | `track` or hold; keep stable-scale eye guidance. |
| dialogue/speech-heavy | Hold/readable `track`; avoid targeting every balloon. |
| speaker-to-speaker exchange | `track` between accepted speakers/characters, using reading order and speech evidence. |
| reaction/emotion | One restrained `pushIn` when face/expression evidence is strong. |
| action/impact | `track` along visible action or `pushIn` to impact/reaction; effects may support but not replace camera logic. |
| detail inspection/clue | `pushIn` when detail is accepted/corrected or strongly justified; otherwise low confidence/edit-before-accept. |
| reveal/context restoration | `pushOut` from a close subject/detail to broader relationship/context. |
| transition/scene change | Hold, `track`, or `pushOut` only when visual evidence supports orientation. |
| punchline/gag payoff | Usually hold or one final `pushIn`/`pushOut` if the visual payoff needs emphasis/context. |
| tension/mood | Slow `pushIn`, restrained hold, or `pushOut` for threat/context when supported by visual evidence. |

## Timing Rules

Timing should make reading and story beats legible:

- Dialogue needs hold/readability. Speech-heavy panels should slow movement, extend settle time, and avoid busy target changes.
- Reaction needs settle. A `pushIn` to emotion should arrive before the beat ends and leave time to read the expression.
- Action can be sharper but still readable. Faster movement is allowed only when action/impact evidence is visible and text density is not the main concern.
- Establishing needs context time. Wide/environment beats should give the reader enough time to understand place and relationships.
- Detail inspection needs pause. A clue, prop, or meaningful small gesture should not be passed too quickly.
- Punchline needs final hold. Comedy payoff often benefits from restraint after the reveal instead of immediate extra motion.
- Motion/emotion intensity may influence speed, arrival curve, settle ratio, and duration weighting, but it should not create chaotic target hopping.

Timing hints remain advisory unless a later ticket explicitly scopes accepted timing apply behavior. Manual shot duration, purpose, and path duration weights remain authoritative.

## Audio, BGM, And SFX Rules

Audio should support the same visual beats rather than create separate story beats.

BGM rules:

- BGM follows page/sequence mood, energy, and pacing, not every detected panel.
- BGM suggestions should use provider-neutral mood/search language such as quiet suspense, light comedy bed, action pulse, ambient tension, or sentimental piano.
- Speech-heavy pages should favor restraint, lower intensity, or space in the mix.
- BGM notes remain review-only and must not fetch, generate, select, download, or bundle audio.

SFX rules:

- SFX only for visible action, impact, object, environment, or transition cues.
- Do not invent hidden SFX from speech balloons alone.
- SFX timing should bind to valid accepted/proposed camera beats: shot start, focus arrival, post-impact tail, or shot exit.
- SFX suggestions should target accepted Camera Shots, accepted Shot Attention Path items, accepted Focus Regions, existing accepted SFX markers, or future temporary suggestions only when those references are valid and review-visible.
- Missing, stale, blocked, rejected, or unsupported target references must not create draft motion, audio markers, or apply actions.

Audio suggestions remain temporary review notes until explicit user apply is separately ticketed. Future apply behavior should continue to obey T0105: apply only to existing accepted Background Audio settings or existing accepted SFX marker settings unless a later ticket explicitly expands scope.

## Priority And Ranking Rules

Ranking should favor story usefulness and accepted evidence:

- accepted user corrections outrank accepted detail highlights, which outrank raw AI detail guesses
- accepted Camera Shots, Focus Regions, and Shot Attention Paths outrank raw provider geometry
- reading order outranks raw confidence when determining path order
- story beat importance outranks the number of detected boxes
- high text density can lower motion aggressiveness even when target confidence is high
- low-confidence evidence may support a suggestion, but should not dominate
- redundant, weak, stale, unsupported, or too-similar suggestions should be suppressed, marked low confidence, or blocked
- stale/blocked references must not apply or create Draft Motion, audio markers, or accepted project mutations

The rulebook should preserve T0102A density guardrails: ordinary panels get few suggestions, complex panels get a bounded small set, and Draft Motion creates only the Focus Regions needed by the accepted suggestion/path.

## Future Rulebook Output Shape

T0106 does not implement a runtime file. A later machine-readable rulebook could use a versioned shape like:

```ts
type DirectorRulebookRule = {
  id: string;
  beatType:
    | "establishingEnvironment"
    | "normalReadingFlow"
    | "dialogueSpeechHeavy"
    | "speakerToSpeakerExchange"
    | "reactionEmotion"
    | "actionImpact"
    | "detailInspectionClue"
    | "revealContextRestoration"
    | "transitionSceneChange"
    | "punchlineGagPayoff"
    | "tensionMood";
  evidenceTriggers: string[];
  cameraRecommendation?: {
    roles: Array<"track" | "pushIn" | "pushOut">;
    targetPolicy: string;
    suppressionPolicy: string;
  };
  timingRecommendation?: {
    holdGuidance: string;
    speedGuidance: string;
    settleGuidance: string;
  };
  audioRecommendation?: {
    bgmGuidance?: string;
    sfxGuidance?: string;
    restraintGuidance?: string;
  };
  guardrails: string[];
  confidenceInfluence: string;
  examples: string[];
};
```

Possible future record fields:

- `rulebookId` and `version`
- `rule id`
- `beat type`
- `evidence triggers`
- `camera recommendation`
- `timing recommendation`
- `audio/BGM/SFX recommendation`
- `guardrails`
- `confidence influence`
- `examples`

Runtime suggestions may later cite rule ids in temporary review output, but accepted Project JSON should not change unless a separate schema ticket decides persisted provenance is necessary.

## Runtime Integration Plan For T0107

A later T0107 should decide the narrowest runtime integration path. The likely integration points are:

- AI director/camera prompt context: summarize the rulebook in provider prompts so generated suggestions use the same beat taxonomy, camera grammar, and audio restraint.
- Deterministic post-processing/normalization: enforce motion-role limits, density caps, ranking, suppression, stale/blocked checks, and target validity after provider output.
- Draft Motion target selection: create fewer Focus Regions than raw AI detections; include only targets needed by the accepted suggestion/path; prefer accepted/corrected targets.
- Timing hints: normalize provider timing language into readable holds, speed, settle, and duration-weight hints without OCR timing or automatic accepted-state mutation.
- Audio suggestion generation: derive BGM/SFX notes from accepted/proposed camera beats and valid targets; avoid creating independent story beats from raw detections.
- Apply guardrails: make future apply behavior reject stale/blocked/unsupported rule outputs and preserve T0105 limits for audio.
- Manual verification: rerun the T0101 practice scenarios before and after rulebook integration, then record deltas in T0108.

T0107 should keep all generated outputs temporary/review-only until existing explicit acceptance or separately ticketed apply flows are used.

## Compact Examples

Simple dialogue strip:

- Evidence: two or three panels, speech-heavy regions, simple character positions.
- Beat: `dialogueSpeechHeavy` plus `normalReadingFlow`.
- Camera: one calm `track`/hold per panel or a short speaker-to-speaker `track`; do not target every speech balloon.
- Timing/audio: longer readable holds; restrained BGM; no SFX from speech alone.

Emotional close-up:

- Evidence: accepted face/character focus, expression/reaction summary, low text density.
- Beat: `reactionEmotion`.
- Camera: one restrained `pushIn` if emphasis is clear; otherwise hold.
- Timing/audio: arrive early enough to settle; quiet BGM or silence note; no automatic marker creation.

Establishing panel:

- Evidence: wide environment, multiple characters, location or relationship context.
- Beat: `establishingEnvironment`.
- Camera: hold or `pushOut` to preserve context; avoid detail-first clutter.
- Timing/audio: allow orientation time; BGM can describe broad mood.

Action impact:

- Evidence: action/impact region, motion lines, collision/pose, accepted effect cue if present.
- Beat: `actionImpact`.
- Camera: `track` along visible motion or `pushIn` to impact/reaction; no unsupported roles.
- Timing/audio: sharper but readable; SFX cue only if visible action/object/impact target is valid.

Multi-detail clue/reveal page:

- Evidence: several raw detail detections, one accepted/corrected detail highlight, possible reveal/context relation.
- Beat: `detailInspectionClue` plus `revealContextRestoration`.
- Camera: prefer the accepted/corrected detail for one `pushIn`, then possible `pushOut` for context; suppress raw weak details.
- Timing/audio: pause on clue; optional restrained SFX/search term only if object/action is visible and target references are valid.

Gag/punchline strip:

- Evidence: setup panels followed by payoff pose/object/reaction.
- Beat: `punchlineGagPayoff`.
- Camera: normal `track`/hold through setup, then one final hold or restrained emphasis on payoff.
- Timing/audio: preserve final hold; optional light comedic accent only when tied to a visible payoff beat or existing marker target.

## Non-Goals

T0106 does not:

- change source behavior
- change provider routes
- change Project JSON schema
- implement runtime rulebook loading
- add new motion roles
- add audio/SFX apply behavior
- add OCR timing
- add parallax
- add character cutouts
- add segmentation animation
- add automatic accepted-state mutation
- add audio fetching, downloading, generation, placement, or provider asset selection

## Manual Verification

For T0106:

- Review this document and confirm it is planning-only.
- Confirm the plan connects AI Camera Suggestions, Draft Motion, timing hints, BGM notes, SFX notes, and future apply guardrails through one shared beat taxonomy.
- Confirm camera recommendations use only `track`, `pushIn`, and `pushOut`.
- Confirm speech regions mostly affect timing/hold, not automatic motion targets.
- Confirm accepted/corrected project data outranks raw AI detections.
- Confirm audio suggestions remain advisory and review-only.
- Confirm runtime integration is deferred to T0107.
- Confirm no source files changed.
