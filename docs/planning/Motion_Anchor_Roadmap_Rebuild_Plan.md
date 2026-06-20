# Motion-Anchor Roadmap Rebuild Plan

T0059 rebuilds the near-term roadmap after stale concept demotion. It keeps implemented behavior available, but changes the roadmap priority: clarify Shot Attention Path as intra-shot camera-motion anchors before adding more automation, panel suggestions, OCR/text timing, AI, or export parity work.

This plan uses `docs/model/Roadmap_Status_Classification.md` as the current priority layer. Older tickets may contain historical effect-first wording, but this plan defines the intended sequence after T0059.

## Alignment Target

- The source comic page remains intact and acts as the world.
- Camera Shots are flexible scene/panel reading containers and timeline destinations.
- Focus Regions are reusable page-level attention targets that should increasingly be treated as intra-shot attention/motion keys.
- Shot Attention Path should become a per-shot camera-motion route through Focus Region anchors.
- Lift, spotlight, zoom, and none remain optional visual treatments, not the identity of Focus Regions.
- Automation remains temporary, reviewable, and accepted only through explicit user action.
- Panel/text/AI suggestions should wait until the motion-anchor model is clear.

## New Roadmap Sequence After T0059

### T0060 - Shot Attention Path Motion Semantics Plan

Implemented as docs-only in `docs/model/Shot_Attention_Path_Motion_Semantics.md`.

Define Shot Attention Path as a route of intra-shot camera-motion anchors. Define the meaning of each path item as an anchor, attention beat, camera target, and optional visual treatment. Define how `motionRole` and `durationWeight` should be interpreted. Define the relationship between path order, `sequenceOrder`, `effectType`, `shotPurpose`, `focusPurpose`, and `outgoingTransitionPurpose`. Classify each part as current behavior, future behavior, legacy optional behavior, or human-decision-required behavior.

### T0061 - Manual Motion Role and Duration Weight Controls

Implemented as a narrow source metadata-control ticket.

Expose `motionRole` and `durationWeight` on Shot Attention Path items in the inspector. Keep the controls metadata-only at first. Do not change browser preview, canvas export, Project JSON schema, or suggestion behavior unless explicitly scoped by the ticket.

### T0062 - Intra-Shot Motion Preview Prototype

Implemented as a browser-preview-only prototype.

Browser Auto preview now uses usable accepted Shot Attention Path path items as restrained camera-motion anchors during the focus/attention phase. It uses path item order, `motionRole`, and `durationWeight`; keeps lift, spotlight, zoom, and none as optional visual treatments rather than the path's identity; and leaves canvas export unchanged.

### T0063 - Manual Attention-Key Stepping Plan or Prototype

Planned as the next recommended ticket after T0062. Plan first if implementation risk is unclear; otherwise prototype narrowly.

Let manual preview inspect attention keys inside the current Camera Shot while keeping shot-by-shot stepping available. Do not make intra-shot key stepping replace timeline shot stepping unless a later product decision explicitly requires that.

### T0064 - Export Parity After Motion Model Plan

Docs-only first.

Reassess canvas export after browser preview motion semantics stabilize. Do not chase parity for stale focus-effect sequencing. Define what export parity should mean for accepted motion anchors before implementing export changes.

### T0065 - Canvas Export Parity for Accepted Motion Anchors

Source ticket later.

Only implement after preview behavior is stable and T0064 defines the parity target. Mirror accepted Shot Attention Path motion-anchor behavior in canvas export without changing Project JSON schema or introducing unrelated production export architecture changes.

### T0066 - Rule-Based Path Suggestion Upgrade With Motion Roles

Source ticket later.

Upgrade the T0057 rule-based draft path suggestion so it can propose `motionRole` and `durationWeight`, not just ordered `focusRegionId` references. Keep the temporary suggestion lifecycle. Do not add AI, OCR, image analysis, panel detection, dependencies, audio, or multi-page behavior.

### T0067 - Panel Suggestion Overlay Prototype

Source ticket later.

Resume panel suggestions only after the motion-anchor model exists. Keep suggestions temporary, reviewable, and explicitly accepted. Do not add AI unless a later ticket explicitly scopes it.

### T0068 - Text/OCR Timing Suggestion Prototype

Source ticket later.

Only revisit text/OCR timing after the motion-anchor model and panel suggestion path are clarified. Keep the workflow suggestion-based and avoid automatic overrides of manual timing, Shot Attention Path, Camera Shot, or Focus Region data.

### T0069 - AI-Assisted Camera Path Spike or Prototype

Later only.

AI-assisted camera path work must be explicitly scoped and suggestion-based. It should propose reviewable edits to manual project data, not automatically become accepted Camera Shots, Focus Regions, timing, or Shot Attention Path data.

## Why Panel Suggestions Are Delayed

Panel suggestions are delayed because Camera Shots and Focus Regions now have different semantic roles. A panel candidate may suggest a Camera Shot, a Focus Region, or both, but Focus Regions must not become replacement camera frames. The project should first define how accepted Shot Attention Path items use Focus Regions as motion anchors, so later panel suggestions can propose useful reading containers and attention keys without reviving the old crop-box model.

## Why Export Parity Is Delayed

Current canvas export parity is tied to legacy focus-effect sequencing. Export should not chase parity for behavior that is being demoted as the product identity. Browser preview should first stabilize accepted Shot Attention Path motion-anchor semantics, then export can mirror that behavior deliberately.

## What Not To Build Next

- Do not expand lift/pop-out as the flagship Focus Region behavior.
- Do not add more focus-effect polish before motion-anchor semantics are clear.
- Do not expand Focus Style presets as the core roadmap direction.
- Do not add panel suggestion overlays before Shot Attention Path motion semantics are defined.
- Do not add text/OCR timing suggestions before motion-anchor and panel suggestion prerequisites are clear.
- Do not add AI-assisted camera path generation before rule-based/manual-data behavior is clarified.
- Do not update canvas export just to match stale focus-effect sequencing.
- Do not make suggestions accepted project data without explicit user acceptance.

## Features Kept But Demoted

- Lift, spotlight, zoom, and none remain available as legacy optional visual treatments.
- Focus Style controls remain legacy optional.
- Export Video Prototype infrastructure remains available for testing and earlier implemented behavior.
- T0056 test suggestion buttons remain available until a future ticket hides, freezes, or removes them.
- `sequenceOrder` remains useful fallback behavior until path item order becomes the active intra-shot order model.

## Human Decision Gates

- Decide whether `effectType` stays on Focus Region or moves/becomes overrideable as a path item visual treatment.
- Decide the role of `sequenceOrder` after per-shot path item order becomes active.
- Decide when lift/pop-out stops being the default treatment for new Focus Regions.
- Decide when T0056 test suggestion buttons become hidden, dev-only, or removed from production UI.
- Decide whether manual mode should step attention keys by default or offer key stepping as an optional mode inside a selected shot.

## Roadmap Guardrails

- T0063 should be the next recommended ticket after T0062.
- T0061 and T0062 should use `docs/model/Shot_Attention_Path_Motion_Semantics.md` and should not reinterpret or rename existing source symbols outside their ticket scope.
- T0064 should happen before export implementation.
- T0067 through T0069 should remain delayed until motion-anchor preview semantics are at least planned and preferably prototyped.
- Older implemented tickets remain historical records; they should not be deleted or rewritten wholesale just because their wording is stale.
