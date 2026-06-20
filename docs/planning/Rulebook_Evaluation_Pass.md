# Rulebook Evaluation Pass

This document completes T0108. It is an evaluation/reporting pass only. It does not add source behavior, provider behavior, fixture assets, Project JSON schema changes, preview/export changes, audio apply behavior, dependencies, OCR timing, parallax, character cutouts, segmentation animation, new motion roles, automatic accepted-state mutation, audio fetching, audio generation, or automatic SFX placement.

## Purpose

T0106 defined Director Rulebook v1 and T0107 integrated it into provider prompts, deterministic camera-suggestion post-processing, Draft Motion target selection, and read-only Audio Notes. T0107A and T0107B then tightened overlap consolidation and panel-first Draft Motion.

T0108 evaluates that rulebook path against the T0101 practice scenarios and records whether the rulebook improves:

- suggestion density
- target selection
- motion-role choice
- timing clarity
- Draft Motion usefulness
- audio-note restraint

This pass is based on the implemented runtime rules and the T0101 practice checklist. No local/legal practice images or OpenAI provider session were run for this ticket, so provider-vision quality is not scored here. The findings below separate deterministic rulebook behavior from provider-dependent page-understanding quality.

## Evaluation Method

Inputs reviewed:

- `docs/planning/Practice_Fixture_Evaluation_Pass.md`
- `docs/planning/Director_Rulebook_v1_Planning.md`
- `src/lib/directorRulebook.ts`
- AI Camera Suggestion post-processing, density guardrails, overlap consolidation, Draft Motion creation, and Audio Notes behavior in `src/app/App.tsx`
- T0107, T0107A, and T0107B completion notes in `docs/Tickets.md` and `docs/Repo_Current_State.md`

Comparison baseline:

- Before rulebook integration, AI Camera Suggestions already had density guardrails, but provider output could still over-weight raw detections, weak details, speech boxes, or overlapping FACE / ACTION / DETAIL boxes.
- After rulebook integration, prompts and deterministic post-processing explicitly prefer accepted/corrected data, panel-first shot framing, fewer story beats, `track` for reading flow, reserved `pushIn`/`pushOut`, timing restraint, and read-only audio notes tied to accepted visual beats.

## Scenario Results

### 1. Simple Dialogue Strip

Expected T0101 behavior:

- Preserve left-to-right panel order.
- Avoid treating every speech balloon as a dramatic motion target.
- Prefer readable `track` or stable panel shots.

Rulebook result:

- Improved. Speech is now treated primarily as timing/hold evidence, not an automatic motion target.
- Provider prompt guidance says panels are natural shot units and detections are not shots.
- Post-processing discourages repeated push-ins for dialogue/normal reading flow.
- Draft Motion can produce a panel shot with zero or one internal path item when the panel itself is the directing unit.

Residual risk:

- Provider page understanding can still mis-order panels or attach speech to the wrong panel. The rulebook can reduce motion clutter, but it cannot repair a badly reversed reading order without user correction.

### 2. Emotional Close-Up

Expected T0101 behavior:

- Allow one clear `pushIn` when the visible beat is reaction, emotion, realization, fear, surprise, or quiet emphasis.
- Keep the expression readable with settle time.

Rulebook result:

- Improved. `reactionEmotion`, `punchlineGagPayoff`, `tensionMood`, and detail/emphasis wording map to restrained `pushIn`.
- T0102 timing naturalness already gives `pushIn` stronger arrival with readable settle time.
- Accepted/corrected details outrank raw AI detail guesses, so a user-marked expression can steer later suggestions.

Residual risk:

- The text classifier is intentionally simple. Ambiguous provider reasons may still classify a face/action/detail beat too broadly. Manual edit of movement/timing/reason remains necessary for borderline panels.

### 3. Establishing Panel

Expected T0101 behavior:

- Preserve environment and relationship context.
- Use `pushOut` only when restoring/revealing context, not as generic motion.

Rulebook result:

- Improved. Establishing/environment evidence maps toward `pushOut`, context shot, or restrained `track` depending on target and reason.
- T0107B panel-first Draft Motion makes the detected panel the default shot frame instead of building the shot from every selected sub-region.
- Draft Motion skips internal Focus Regions when the panel shot already covers the target.

Residual risk:

- If the provider returns only small raw detail boxes and misses the broad panel, the fallback shot rectangle may be less useful. The review card should remain editable rather than becoming trusted accepted state.

### 4. Two-Character Conversation

Expected T0101 behavior:

- Follow conversation rhythm.
- Prefer `track` between speakers unless a specific reaction earns `pushIn`.
- Avoid over-cutting every speaker or balloon.

Rulebook result:

- Improved. Speaker exchange and normal reading flow now prefer `track`.
- T0107A consolidates overlapping/nearby detections before target selection, reducing duplicate face/action/detail motions around one local beat.
- T0107B allows two path items only for distinct exchange, setup/payoff, or movement cases.

Residual risk:

- Without OCR or reliable speech-to-speaker binding, the rulebook cannot always know who speaks first. This remains a user-review and manual-correction point.

### 5. Action Page

Expected T0101 behavior:

- Permit sharper timing and action emphasis when visible action supports it.
- Stay inside `track`, `pushIn`, and `pushOut`.
- Avoid parallax, cutouts, automatic SFX, or unsupported animation.

Rulebook result:

- Improved. Action/impact evidence can keep faster timing or justify `pushIn` for impact, while action-follow can still prefer `track` when the camera should follow movement.
- The rulebook and post-processing keep unsupported roles out of camera suggestions.
- Audio Notes remain advisory; they can cite accepted visible action/detail/reaction/effect-cue beats but do not create SFX markers.

Residual risk:

- Very dense action pages may still need hand curation. Rulebook density caps intentionally trim suggestions, which can suppress a secondary action beat that a human might want.

### 6. Multi-Detail Page

Expected T0101 behavior:

- Prefer accepted/corrected details over raw AI guesses.
- Use `pushIn` for inspection and `pushOut` for reveal/context only with clear reasons.
- Keep stale or rejected targets from producing Draft Motion.

Rulebook result:

- Improved. Accepted details are explicitly prioritized in accepted context, target ranking, and rulebook guidance.
- Draft Motion creates only the Focus Regions needed by the selected suggestion/path and skips redundant targets.
- Stale/blocked/rejected/already-drafted suggestions cannot create duplicate Draft Motion.

Residual risk:

- Small important details remain provider-quality dependent. The rulebook makes user-corrected details more authoritative, but the user still needs to mark missed details manually.

## Audio Notes Evaluation

Expected behavior:

- BGM should follow page/sequence mood.
- SFX should bind only to accepted visible action/detail/reaction/effect-cue beats.
- Speech-heavy pages should produce restraint, not automatic SFX.
- Notes should remain temporary and read-only.

Rulebook result:

- Improved. T0107 added rulebook citations to Audio Notes, keeps BGM sequence-level, blocks speech Focus Regions from SFX cue generation, and ties SFX notes to accepted visual beats.
- T0104 behavior remains intact: notes can be copied or rejected but cannot create assets, downloads, SFX markers, accepted audio settings, Project JSON data, preview changes, or export changes.

Residual risk:

- Audio notes are currently deterministic advisory text from accepted data, not a provider-quality evaluation. A future provider-assisted audio pass still needs licensing/privacy guardrails from T0103/T0105.

## Before / After Summary

| Area | Before rulebook | After T0107/T0107A/T0107B |
| --- | --- | --- |
| Density | Guardrails existed, but raw detections could still clutter suggestions. | Detections are explicitly consolidated into story beats; ordinary panels default to fewer suggestions. |
| Target selection | Accepted details were useful but raw regions could still dominate weak cases. | Accepted/corrected project data outranks raw detections in prompt context and deterministic ranking. |
| Motion roles | Roles were limited, but provider reasons could overuse emphasis. | `track` is reinforced for reading/dialogue/action-follow; `pushIn`/`pushOut` are reserved for named story purposes. |
| Timing | T0102 improved motion feel, but provider timing could still be aggressive. | Rulebook post-processing can downgrade overly fast non-action timing and reasons cite readable beat intent. |
| Draft Motion | Could create more Focus Regions than needed from selected targets. | Panel-first shot framing and internal target skipping reduce helper clutter. |
| Audio | Read-only notes existed. | Notes cite rulebook intent, keep BGM broad, and make speech/action restraint clearer. |

## Findings

Pass:

- The rulebook materially improves deterministic guardrails for the T0101 scenarios.
- The implementation remains aligned with the accepted camera grammar: `track`, `pushIn`, and `pushOut`.
- Accepted/corrected project data is treated as more authoritative than raw AI detections.
- Draft Motion remains temporary until explicit helper acceptance.
- Audio Notes remain read-only and do not create or apply audio.
- No Project JSON schema, preview/export ownership, source image ownership, or accepted-state mutation rule needs to change for T0108.

Needs more real-page testing:

- Provider panel order and speech-to-speaker association.
- Provider detail recall for small props/clues.
- Whether rulebook warnings are frequent enough to teach the user why a suggestion was downgraded.
- Whether panel-first Draft Motion feels too conservative on complex action/detail pages.
- Whether audio notes are useful enough before any future apply behavior.

## Recommended Next Ticket

T0109 - Rulebook Evaluation Findings Tuning.

Goal: make small, evidence-driven tuning changes from the T0108 findings without expanding product scope.

Candidate scope:

- Add a compact in-app or docs-backed evaluation note format for practice pages.
- Tune rulebook warning copy where downgrades are hard to interpret.
- Adjust deterministic thresholds only if manual practice pages show repeated over-suppression or under-suppression.
- Keep all outputs temporary/review-only.
- Preserve `track`, `pushIn`, and `pushOut` as the only active camera roles.

Non-goals for T0109:

- No new provider behavior unless a concrete provider-quality failure requires prompt wording changes.
- No automatic accepted-state mutation.
- No bundled copyrighted fixtures.
- No audio fetching, generation, automatic SFX placement, OCR timing, parallax, cutouts, segmentation animation, or new motion roles.

## T0109 Practice Tuning Note

Use this compact note when a practice page shows repeated over-suppression, under-suppression, confusing warning copy, or a prompt/rule mismatch. T0109 tuning should cite this kind of evidence before changing thresholds or rule text.

```txt
Practice page:
Scenario type:
Source/legal note:
Provider/model:
Observed rulebook behavior:
Expected rulebook behavior:
Specific warning/card text that helped:
Specific warning/card text that confused:
Suppression issue:
Target-selection issue:
Motion-role issue:
Timing issue:
Draft Motion issue:
Audio-note issue:
Accepted-data boundary preserved?:
Recommended tuning:
Out of scope for this pass:
```

## Manual Verification

For T0108:

- Review this document and confirm it evaluates all T0101 scenarios: simple dialogue, emotional close-up, establishing panel, two-character conversation, action page, and multi-detail page.
- Confirm the report separates deterministic rulebook behavior from provider-dependent page-understanding quality.
- Confirm findings cover density, target selection, motion-role choice, timing clarity, Draft Motion usefulness, and audio-note restraint.
- Confirm it does not claim bundled fixtures or live provider results.
- Confirm no source files, package files, Project JSON schema, preview/export behavior, audio/SFX behavior, dependencies, OCR, panel detection, or accepted-state mutation changed.
