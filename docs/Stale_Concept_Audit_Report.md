# Stale Concept Audit Report

## 1. Executive Summary

The project is **partially aligned** with the newer product direction.

The model docs are mostly aligned: page-preserving, manual-first, Camera Shots as reading containers, Focus Regions as page-level targets, and suggestions as temporary review data. The main drift is in implementation and active roadmap assumptions: Focus Regions are still operationally centered on visual effects, Shot Attention Path is still mostly an ordered focus-effect list, export still ignores accepted Shot Attention Path, and the next-roadmap direction points toward panel suggestions before clarifying intra-shot camera-motion anchors.

## 2. Highest-Risk Stale Concepts

| stale concept | where it appears | why it conflicts with the new direction | severity | recommendation |
|---|---|---|---|---|
| Shot Attention Path as ordered focus-effect sequencing | `src/features/preview/PreviewPlayer.tsx`: `getFocusRegionsForShotAttention`, `getActiveFocusEffect`; `docs/Manual_Verification_Guide.md`: "Shot Attention Path Preview" | The new direction wants Shot Attention Path to become intra-shot camera-motion anchors, not just an ordered list of Focus Region effects | high | rename/reclassify |
| Focus Regions as visual effect objects | `FocusRegionEffectType`, `effectType`, `FOCUS_REGION_EFFECT_TYPES`, `Focus Style`, `getActiveFocusEffect`, CSS `.preview-focus-*` | The code path treats Focus Regions primarily as lift/spotlight/zoom targets instead of motion keys with optional treatments | high | freeze |
| `lift` as the default Focus Region behavior | `src/features/editor/PageViewer.tsx`, `src/app/App.tsx`, `src/lib/projectExport.ts`, `src/lib/projectImport.ts`, `src/features/preview/PreviewPlayer.tsx` | The model says lift/pop-out should not be the default flagship behavior, but new and imported regions still default to `lift` | high | deprecate as default |
| Export parity target may preserve stale behavior | `src/lib/canvasVideoExport.ts`; `docs/planning/MVP_Export_Readiness_Plan.md`; `docs/Known_Issues_And_Followups.md` | Export implements intersection-based focus effects and does not use accepted Shot Attention Path, so "parity" could lock in stale effect sequencing | high | freeze until motion model |
| Next-ticket contradiction | `docs/Repo_Current_State.md`: top says next recommended T0058; "Next Recommended Ticket" section still says T0057 | Roadmap source is internally inconsistent after T0057 | high | cleanup later |
| Panel Suggestion Overlay as next active direction | `docs/Repo_Current_State.md`, `docs/automation/Post_Spike_Automation_Suggestion_System_Plan.md` | Panel suggestions may be premature before Shot Attention Path is clarified as motion anchors | medium | needs human decision |
| "Smart Camera Path" wording for rule-based behavior | `docs/Tickets.md` T0057, `src/lib/suggestionTypes.ts` source `smartCameraPath`, `src/app/App.tsx` | Current behavior is rule-based from manual data only; "smart" may overstate intelligence | medium | rename |
| Old fixed 16:9 Camera Shot language | Older tickets T0011-T0017, T0013/T0014 verification, `docs/planning/MVP_Technical_Design.md` | Historical docs still say camera shots/camera frames are fixed 16:9 or fill viewport, while current Camera Shots are flexible containers | medium | freeze/annotate |
| Focus sequencing fields as primary path input | `sequenceOrder`, `focusAttentionRatio`, `getFocusRegionSequenceOrder` | These reinforce ordered visual attention rather than semantic motion anchors with roles and weights | medium | reclassify |
| Suggestion model too narrow for future motion semantics | `src/lib/suggestionTypes.ts`: `ShotAttentionPathSuggestionValues` only has `focusRegionIds` | It omits `motionRole`, `durationWeight`, stale refs, related refs, confidence range, and dependency state already planned in docs | medium | refactor later |

## 3. Docs That Need Roadmap Cleanup Later

- `docs/Repo_Current_State.md`
  - "Current Status" says T0058 is next, but "Next Recommended Ticket" still says T0057.
  - Build/status notes are current, but roadmap summary should be reconciled after the audit.
  - The recommended next ticket should probably shift away from panel overlay until motion-anchor semantics are clarified.

- `docs/Tickets.md`
  - T0011 through T0017 still contain old "camera frame," fixed 16:9, and camera-shot-as-frame wording. These are historical, but future readers may misread them as current rules.
  - T0057 title says "Smart Camera Path Draft" although implementation is a rule-based attention-path draft from existing manual data.
  - No T0058 ticket exists in `docs/Tickets.md`, while current state references it as next.

- `docs/Manual_Verification_Guide.md`
  - "Focus Effects and Sequencing," "Shot Attention Path Preview," "Preview," and "Export Video Prototype" all validate effect sequencing and lift/spotlight/zoom behavior more strongly than motion-anchor behavior.
  - The guide says canvas export behavior is unchanged for Shot Attention Path, while source export still uses old focus-region eligibility. That is accurate, but it should be explicitly marked as conceptually stale once motion-anchor work starts.

- `docs/Known_Issues_And_Followups.md`
  - Follow-up Ideas still include "Add fit/fill preview mode toggle," "Add hold/pan/zoom presets," "Add action shake effect," "Improve video export parity ... focus-region transition detail," and AI detection items. These should be frozen or reclassified after motion model clarification.
  - "Known Issues: None currently recorded" is misleading given the current conceptual mismatch between preview/export and Shot Attention Path semantics.

- `docs/planning/Full_Design_Document.md`
  - "Each shot defines a region to focus on," "rectangular viewport," `movement`, and render-to-MP4 language are older MVP framing. It does not fully reflect Focus Regions as motion keys or suggestions as review-first.
  - Later features include sound effects, impact shake, presets, and AI-generated camera paths without the newer subtract/freeze guidance.

- `docs/planning/MVP_Technical_Design.md`
  - Preview strategy says each shot fills the 16:9 viewport. Current behavior contains flexible shots inside a fixed stage.
  - Draft data model lacks Focus Regions, Shot Attention Path, purpose metadata, suggestions, and flexible-shot semantics.

- `docs/planning/MVP_Export_Readiness_Plan.md`
  - Strongly prioritizes matching current focus-region effects in export. This may need reframing: export parity should wait until accepted Shot Attention Path motion semantics are clarified.

- `docs/automation/Panel_Detection_Suggestions_Spike.md`
  - Mostly aligned, but "Future T0050A - Panel Suggestion Overlay Prototype" may now be premature.
  - It still frames detected intra-panel detail order as Shot Attention Path references, but does not yet distinguish "ordered effects" from "motion anchors."

- `docs/automation/Smart_Camera_Path_Draft_Generator_Spike.md`
  - Mostly aligned, but "smart camera path" language should be softened to "rule-based draft" or "path suggestion" unless actual intelligence is added.
  - Needs a stronger statement that next work should define motionRole/durationWeight behavior before more automation.

## 4. Source Concepts That May Need Refactor Later

- `src/features/preview/PreviewPlayer.tsx`
  - `ActiveFocusEffect`, `getActiveFocusEffect`, `getFocusRegionsForShotAttention`, `getAttentionPathFocusRegions`, `getEligibleFocusRegions`, `getLiftedFocusRegionStyle`, `getZoomFocusStyle`, `getFocusEffectAnimationStyle`.
  - Old assumption: Focus Regions are sliced across the focus phase as visual effects. This will make camera-motion-anchor behavior harder to add cleanly.

- `src/lib/canvasVideoExport.ts`
  - Uses `getEligibleFocusRegions(currentShot, focusRegions)` and ignores `currentShot.attentionPath`.
  - Old assumption: export focus behavior is still intersection plus `sequenceOrder`, not accepted Shot Attention Path. This is a major preview/export semantic mismatch.

- `src/lib/projectTypes.ts`
  - `FocusRegionEffectType`, `sequenceOrder`, `focusAttentionRatio`.
  - `ShotAttentionPathItem` already has `motionRole` and `durationWeight`, which is good, but source behavior barely uses them.
  - Old assumption: Focus Regions still carry effect and sequence fields as first-class behavior drivers.

- `src/lib/suggestionTypes.ts`
  - `SuggestionSource = "manualDraft" | "smartCameraPath"` is much narrower than the planned source model.
  - `SuggestionConfidence = "unknown" | "medium"` is narrow.
  - `ShotAttentionPathSuggestionValues` stores only `focusRegionIds`, so it cannot suggest `motionRole`, `durationWeight`, item-level ordering metadata, stale state, or dependency refs.
  - Old assumption: path suggestions are lists of focus IDs, not motion-anchor suggestions.

- `src/app/App.tsx`
  - `handleCreateShotAttentionPathSuggestion` uses `getFocusRegionInclusionRatio`, skips `effectType: none`, and sorts by `sequenceOrder`.
  - This is appropriate for T0057, but conceptually it continues the effect-sequencing model.
  - Acceptance replaces the target shot's `attentionPath` explicitly, but there is no stale/blocked validation if the target shot or focus regions changed before accepting.

- `src/features/editor/ShotInspector.tsx`
  - UI says "Ordered references to page-level focus regions for future intra-shot attention."
  - It exposes path ordering but not `motionRole` or `durationWeight`, even though those fields exist in the type/schema.
  - Old assumption: manual path controls are membership/order only.

- `src/features/editor/PageViewer.tsx`
  - New Focus Regions default to `kind: "panel"`, `effectType: "lift"`, `sequenceOrder: focusRegionNumber`.
  - This makes every new Focus Region feel like an ordered effect candidate rather than a neutral attention/motion key.

- `src/styles/global.css`
  - Heavy class namespace around `.preview-focus-lift`, `.preview-focus-spotlight`, `.preview-focus-zoom`, `.focus-region-box`.
  - Stale signal: visual effect taxonomy dominates the styling vocabulary.

## 5. UI/UX Wording That May Mislead Users

- `Focus Style` header control
  - Suggests focus treatment presets are central. Should likely be frozen or moved to advanced/legacy behavior after motion model is clarified.

- Focus Region inspector `Effect`
  - Makes visual treatment feel like the main property of a Focus Region. The primary user-facing concept should likely become attention/motion role or purpose.

- `Focus Attention %`
  - Reads as effect time, not intra-shot motion/attention time. It may need rewording once Shot Attention Path anchors become active.

- `Draft Attention Path`
  - Better than "Smart," but it does not say "temporary" on the button. The panel text helps, but the control itself could be clearer later.

- Suggestion source `smartCameraPath`
  - In the UI, source displays as `smartCameraPath`. This overstates T0057's rule-based behavior and leaks internal naming.

- `Add Test Shot Suggestion` / `Add Test Focus Suggestion`
  - Useful prototype controls, but they make the production UI feel unfinished. Keep for now, but freeze as prototype-only.

- `Path for [shot]`
  - Does not communicate that accepting can replace an existing path. The reason text does, but the title could be clearer.

- `Export Video Prototype`
  - Honest about prototype, but export output currently uses old effect sequencing. It should not be positioned as a production export path yet.

- Preview `Final`
  - "Final" may overstate quality and conceptual correctness, especially while motion anchors are unresolved.

## 6. Keep / Freeze / Deprecate / Later

### Keep

- Page-preserving source image model.
- Flexible Camera Shots as timeline reading containers.
- Page-level Focus Regions.
- Manual editing first.
- Project JSON for accepted project data only.
- Temporary Suggestions panel and explicit accept/reject workflow.
- Shot Attention Path as per-shot references to page-level Focus Regions.
- Purpose metadata (`shotPurpose`, `focusPurpose`, `outgoingTransitionPurpose`).

### Freeze

- Additional focus effect polish.
- Focus treatment style presets.
- Export parity for current lift/spotlight/zoom sequencing.
- Panel suggestion overlay work until Shot Attention Path motion semantics are clarified.
- New "smart path" automation beyond rule-based manual-data drafts.

### Deprecate as default

- `lift` as the default Focus Region effect.
- Lift/pop-out as flagship behavior.
- `sequenceOrder` as the primary meaning of Focus Region order.
- Effect-first manual verification emphasis.

### Later after motion model

- Panel detection suggestions.
- Text/OCR timing suggestions.
- AI-assisted camera path generation.
- Export parity for accepted Shot Attention Path behavior.
- Manual attention-key stepping.
- Motion/easing presets.
- Production MP4/export architecture.

### Needs human decision

- Whether Focus Region `effectType` remains on Focus Region, moves to Shot Attention Path item, or becomes a per-path treatment override.
- Whether `sequenceOrder` should remain page-level or be demoted in favor of per-shot path order.
- Whether current lift/spotlight/zoom should become legacy optional treatments or remain primary controls.
- Whether the next ticket should be T0058 panel overlay or a new motion-model clarification ticket.

## 7. Recommended New Roadmap Direction

1. Clarify Shot Attention Path semantics as camera-motion anchors.
   - Define whether a path item is an anchor, keyframe, attention beat, or effect cue.
   - Decide how `motionRole` and `durationWeight` should affect behavior.

2. Expose `motionRole` and `durationWeight` meaning in manual controls.
   - Keep this manual-first.
   - Do not add new automation yet.
   - Do not change export yet.

3. Implement browser preview intra-shot camera motion from accepted Shot Attention Path.
   - Use existing path order.
   - Use Focus Region geometry as anchor targets inside the selected Camera Shot.
   - Treat visual effects as optional treatments, not the path's identity.

4. Add manual-mode attention-key stepping.
   - First step shots.
   - Then optionally step path anchors inside the current shot.

5. Reassess export parity.
   - Export should match accepted Shot Attention Path motion behavior, not the old fallback focus-effect sequencing.
   - Only after preview semantics are stable.

6. Return to automation.
   - Rule-based path suggestions can add `motionRole`/`durationWeight`.
   - Then panel suggestions.
   - Then text/OCR timing suggestions.
   - Then AI only if separately scoped.

## 8. Do Not Remove Yet

- Lift, spotlight, zoom, and none effects.
  - They are implemented, useful for visual tests, and can become optional treatments.

- Focus Style presets.
  - Stale as a roadmap direction, but useful to compare existing preview/export behavior.

- Canvas video export prototype.
  - Conceptually stale in focus behavior, but useful for export infrastructure and performance testing.

- T0056 test suggestion buttons.
  - Prototype-only, but useful while suggestion lifecycle is still being developed.

- `sequenceOrder`.
  - Stale as primary ordering model, but useful fallback for draft generation and current preview.

- `effectType`.
  - Should not remain the identity of Focus Regions, but removing it now would break existing preview/export tests.

- Historical tickets.
  - They should not be rewritten wholesale. Better to annotate current semantics in roadmap cleanup.

## 9. Questions for Human Decision

1. Should `effectType` remain a property of Focus Region, or move to Shot Attention Path items as an optional per-use treatment?

2. Should `sequenceOrder` remain page-level metadata, or should path item order fully replace it for intra-shot behavior?

3. Is the next roadmap ticket still panel suggestion overlay, or should it be replaced by a Shot Attention Path motion-anchor clarification ticket?

4. Should `lift` stop being the default for new/imported Focus Regions now, or only after a neutral motion-anchor preview exists?

5. Should export parity wait until browser preview supports accepted Shot Attention Path camera motion?

## Commands Run During Original Audit

- `Get-Content docs\README.md`
- `Get-Content docs\Known_Issues_And_Followups.md`
- `Get-Content docs\model\Cinematic_Guided_View_Model.md`
- `Get-Content docs\model\Camera_Frame_vs_Focus_Region.md`
- `Get-Content docs\planning\Full_Design_Document.md`
- `Get-Content docs\planning\MVP_Technical_Design.md`
- `Get-Content docs\planning\MVP_Export_Readiness_Plan.md`
- `Get-Content docs\automation\*.md` individually
- `Get-Content docs\research\*.md` individually
- `Get-Content docs\Tickets.md`
- `Get-Content docs\Repo_Current_State.md`
- `Get-Content docs\Manual_Verification_Guide.md`
- `Get-Content src\app\App.tsx`
- `Get-Content src\features\editor\PageViewer.tsx`
- `Get-Content src\features\editor\ShotInspector.tsx`
- `Get-Content src\features\preview\PreviewPlayer.tsx`
- `Get-Content src\features\timeline\Timeline.tsx`
- `Get-Content src\features\upload\ImageUploader.tsx`
- `Get-Content src\lib\*.ts` individually
- `Get-Content src\styles\global.css`

No files were modified during the original audit. No build, formatter, dev server, or long-running command was run.
