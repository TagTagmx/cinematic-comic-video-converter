# Roadmap Status Classification

T0058 adds a current roadmap status layer for concepts that already exist in the project or appear in near-term planning. It does not delete, rename, or change implemented behavior. Its job is to make future roadmap choices safer by separating core direction from frozen, legacy, deferred, and undecided areas.

Use this document together with `docs/model/Cinematic_Guided_View_Model.md`, `docs/model/Camera_Frame_vs_Focus_Region.md`, and `docs/Stale_Concept_Audit_Report.md`.

## Status Definitions

### Core

Core concepts define the current product direction and should remain the main alignment target for new roadmap work.

Core work may be refined, documented, or implemented when scoped by a ticket, but it must preserve the manual-first, page-preserving guided-view model.

### Frozen

Frozen concepts may remain available, documented, or testable, but should not receive roadmap expansion unless a future ticket explicitly unfreezes them.

Frozen does not mean deleted. It means "do not make this the next growth direction by default."

### Deprecated as Default

Deprecated-as-default concepts may remain for compatibility, existing behavior, or testing, but should not be presented as the main product direction.

These concepts should not be used as defaults for new roadmap decisions unless a future ticket explicitly reclassifies them.

### Legacy Optional

Legacy Optional concepts may stay usable as optional visual treatments, prototype utilities, or compatibility behavior.

They should be treated as secondary or advanced behavior, not as the product identity or default creative path.

### Later

Later concepts are still plausible future work, but should not become next-ticket recommendations until their prerequisites are complete.

For the current roadmap, most Later automation should wait until Shot Attention Path motion-anchor semantics are clarified.

### Human Decision Required

Human Decision Required items are product or model decisions that must not be changed automatically.

These items need explicit product direction before implementation, cleanup, renaming, schema changes, or behavior changes.

## Classification

### Core

- Page-preserving source image model.
- Flexible Camera Shots as scene/panel reading containers.
- Camera Shots as main timeline destinations.
- Page-level Focus Regions.
- Focus Regions as reusable attention targets that should increasingly be understood as intra-shot attention/motion keys.
- Manual editing first.
- Project JSON for accepted project data.
- Temporary Suggestions panel with explicit accept/reject workflow.
- Suggestions remain temporary until explicitly accepted.
- Shot Attention Path as references to page-level Focus Regions.
- Shot Attention Path evolving from ordered focus-effect sequencing into ordered intra-shot camera-motion anchors.
- Purpose metadata:
  - `shotPurpose`
  - `focusPurpose`
  - `outgoingTransitionPurpose`

### Frozen

- Additional focus-effect polish.
- Focus Style preset expansion.
- Export parity for current lift/spotlight/zoom effect sequencing.
- Panel suggestion overlay work until motion-anchor semantics are clarified.
- Text/OCR timing suggestions until motion-anchor semantics are clarified.
- AI/smart path automation beyond rule-based manual-data drafts.

### Deprecated as Default

- Lift/pop-out as the flagship or default Focus Region behavior.
- Focus Region as primarily a visual effect target.
- `sequenceOrder` as the primary meaning of intra-shot attention order.
- "Smart camera path" wording for rule-based manual-data suggestions.
- Effect-first manual verification emphasis.

### Legacy Optional

- Lift, spotlight, zoom, and none visual treatments.
- Focus Style controls:
  - Clean
  - Cinematic Dim
  - Soft Focus
- Export Video Prototype infrastructure.
- T0056 test suggestion buttons.
- Current `sequenceOrder` fallback behavior.

### Later

- Panel detection suggestions.
- Text/OCR timing suggestions.
- AI-assisted camera path generation.
- Export parity for accepted Shot Attention Path motion behavior.
- Manual attention-key stepping.
- Motion/easing presets.
- Production export architecture reassessment.

### Human Decision Required

- Whether `effectType` stays on Focus Region or moves/becomes overrideable on Shot Attention Path items.
- Whether `sequenceOrder` remains page-level metadata or is demoted behind per-shot path order.
- Whether lift/spotlight/zoom remain primary controls or become advanced/legacy treatments.
- When to freeze or remove test suggestion buttons from production UI.
- When export should follow accepted Shot Attention Path behavior.

## Guardrails

- Frozen features may remain available but should not receive roadmap expansion unless a future ticket explicitly unfreezes them.
- Deprecated-as-default features may remain for compatibility/testing but should not be presented as the main product direction.
- Legacy Optional features may stay usable but should be treated as optional visual treatments.
- Later features should not become next-ticket recommendations until prerequisites are complete.
- Human Decision Required items must not be changed automatically.
- Do not delete or rewrite implemented behavior just because it is frozen, deprecated as default, or legacy optional.
- Do not treat Focus Regions as replacement camera frames.
- Do not treat Shot Attention Path as only an ordered visual-effect list in future roadmap planning.
- Do not expand panel/text/AI suggestions before clarifying the motion-anchor model.

## Current Roadmap Implication

The next recommended step should be a new roadmap planning ticket that converts this classification into a safer implementation sequence.

That planning should prioritize:

1. Clarifying Shot Attention Path as camera-motion anchors.
2. Defining how `motionRole` and `durationWeight` should matter.
3. Deciding how optional visual treatments relate to path items.
4. Planning preview support for accepted Shot Attention Path motion behavior.
5. Only then returning to panel/text/AI suggestions.
