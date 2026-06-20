# Shot Attention Path Motion Semantics

Current active direction: the app is a semi-automatic cinematic comic motion editor. Camera Shots define the larger shot/panel space. Focus Regions are camera anchors inside a shot, not independent decorative visual-effect boxes. The active basic camera grammar target is now `track`, `pushIn`, and `pushOut`.

Old Focus Region effects (`lift`, `spotlight`, `zoom`, `none`) remain Project JSON compatibility metadata, but they are no longer active browser-preview/UI grammar. Old basic roles (`hold`, `emphasis`, and `reveal`) remain legacy parseable values only. Runtime fallback may map old `reveal` to `pushOut`, old `emphasis` to `pushIn`, old `hold` to unset/default, old `effectType: zoom` to `pushIn`, and old `effectType: lift`/`spotlight` to `track` when no newer motion role exists. This fallback must not preserve old lift/spotlight/zoom/reveal behavior under new names.

The next implementation target is full basic browser-preview grammar: `track` should travel continuously through multiple Focus Region anchors, `pushIn` should move into exact or near-exact Focus Region close-up/isolation destinations, and `pushOut` should expand from a close-up toward another anchor, the Camera Shot frame, or a context window. Special effects such as reveal masking, shake, blur, motion lines, and decorative focus treatment are later work.

T0060 defines Shot Attention Path as a route of intra-shot camera-motion anchors. This is a documentation-only semantics plan. It does not change source behavior, Project JSON schema, browser preview behavior, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, or multi-page behavior.

Use this document with:

- `docs/model/Cinematic_Guided_View_Model.md`
- `docs/model/Camera_Frame_vs_Focus_Region.md`
- `docs/model/Roadmap_Status_Classification.md`
- `docs/planning/Motion_Anchor_Roadmap_Rebuild_Plan.md`

Older implemented tickets may describe Shot Attention Path as focus sequencing or visual-effect ordering. Those descriptions remain useful historical context, but this document defines the current model direction for intra-shot camera motion.

## Core Semantics

Shot Attention Path belongs to a Camera Shot and contains ordered references to existing page-level Focus Regions.

The path answers: during this Camera Shot, which existing page-level attention targets should guide the reader's eye, camera motion, pacing, or optional visual treatment, and in what order?

Current model boundaries:

- Camera Shots remain flexible panel/scene reading containers and main timeline destinations.
- Focus Regions remain reusable page-level attention targets.
- Focus Regions are not replacement Camera Shots.
- Shot Attention Path items reference Focus Regions; they do not copy, own, move, resize, or delete them.
- Lift, spotlight, zoom, and none are legacy compatibility metadata, not the identity of the active motion-anchor model.

## Path Item Meaning

Each Shot Attention Path item should be understood in four layers.

### Anchor

The referenced Focus Region is an anchor: a stable page-level region that future intra-shot motion can use as a target or waypoint inside the parent Camera Shot.

The anchor uses the Focus Region's existing geometry. It does not create a new camera frame, does not change the parent Camera Shot, and does not transfer Focus Region ownership into the shot.

### Attention Beat

The path item is an attention beat: a moment inside the Camera Shot where the reader should notice, read, feel, or understand something.

The beat can support dialogue reading, reaction emphasis, reveal staging, action clarity, detail inspection, or emotional pacing. This is a story and reading function first; visual effects are secondary.

### Camera Target

The path item is a future camera target: a candidate for restrained intra-shot motion inside the Camera Shot's reading container.

Future browser preview can use path item order and metadata to decide whether to hold, push toward, track across, reveal, or emphasize the referenced anchor. The parent Camera Shot remains the scene/panel container; the motion target does not become a replacement Camera Shot.

### Legacy Visual-Treatment Metadata

Older projects may contain Focus Region `effectType` values: `lift`, `spotlight`, `zoom`, or `none`.

Those values are legacy compatibility metadata. They should not define the path item or active preview architecture. Future tickets may decide whether special effects return as optional layers, but they should not drive the basic camera grammar.

## `motionRole`

`motionRole` describes the camera-motion intent for a path item. It answers why the camera is moving or holding on this anchor inside the parent Camera Shot.

T0065 defines role behavior as documentation/model planning only. It does not change browser preview behavior, canvas export behavior, Project JSON schema, suggestion behavior, OCR, AI, panel detection, dependencies, audio, or multi-page behavior.

Active basic values:

- `track`
- `pushIn`
- `pushOut`

Legacy parseable values:

- `hold`
- `reveal`
- `emphasis`

### `track`

Semantic purpose: guide attention transfer across multiple Focus Region anchors inside one Camera Shot.

Expected camera behavior: travel continuously from anchor to anchor without resetting to the default shot frame between Focus Regions. Track v2 is stable-scale eye guidance: the camera calmly pans/glides between FR centers while keeping scale mostly constant across anchors in the same shot. Only tiny scale correction should occur when needed to keep a large FR readable or inside the Camera Shot bounds. Track must not be defined by a spotlight, rail, aperture, or dimmed attention overlay.

### `pushIn`

Semantic purpose: move closer for emotional, detail, reaction, threat, realization, inspection, or importance emphasis.

Expected camera behavior: move into the exact Focus Region as a close-up/isolation target, or as close to Focus Region-only as the 16:9 stage/aspect constraints require. The destination should not preserve generous surrounding panel context.

### `pushOut`

Semantic purpose: deliberately zoom away from a subject/detail to recover broader context, reveal environment, or show relationships.

Expected camera behavior: start from exact or near-exact Focus Region close-up and expand outward to another Focus Region, the Camera Shot frame, or a context window.

### `hold`

Semantic purpose: let the reader absorb the anchor without making motion itself the point.

Expected camera behavior: keep framing mostly stable. A tiny drift or settle is acceptable only if it does not distract from reading. Avoid obvious zoom or directional travel.

Pacing and duration tendency: usually medium to long, especially for speech bubbles, dense art, quiet reactions, or emotional pauses. Higher `durationWeight` should mean a longer dwell, not stronger motion.

Use it for: dialogue, captions, quiet expressions, important props that need inspection, establishing details that should not be rushed, and any beat where stillness is more readable than motion.

Do not use it for: fast action, clear directional movement, staged reveals, or beats where attention must transfer from a previous subject to a new one.

Interaction with `effectType`: any visual treatment should remain secondary. `effectType: none` is valid and often appropriate for `hold`.

Interaction with `durationWeight`: weight primarily affects dwell time. It should not increase camera intensity.

### `pushIn`

Semantic purpose: increase intimacy, emotional weight, importance, or dramatic attention.

Expected camera behavior: move subtly closer toward the anchor, with restrained zoom and limited re-centering. Preserve enough of the parent Camera Shot to keep context readable.

Pacing and duration tendency: usually medium to long. Emotional push-ins should be slow; detail push-ins can be shorter if the detail is simple.

Use it for: faces, reactions, important clues, objects, dramatic details, and emotional emphasis.

Do not use it for: text-heavy anchors that need stable reading, broad establishing shots, anchors near the edge where zoom would lose context, or already tight close-ups that would feel aggressive.

Interaction with `effectType`: `spotlight` or `zoom` may support the beat, but `pushIn` should not require a visual treatment. `effectType: none` remains a valid motion anchor.

Interaction with `durationWeight`: weight controls how long the push-in takes and how long it can settle. It should not automatically make the zoom stronger.

### `track`

Semantic purpose: normal eye guidance between related Focus Regions inside the shot.

Expected camera behavior: glide from the previous anchor target toward the current anchor target, or along a clear visual direction implied by action lines, gaze, pose, or composition. Movement should remain smooth, readable, and mostly stable-scale. Track is the default for multi-FR reading flow unless the beat needs a clear push-in or push-out meaning.

Pacing and duration tendency: usually short to medium for action, medium for dialogue exchange or multi-subject scans. Faster panels may use lower `durationWeight`; text-heavy transfers need more time.

Use it for: normal FR-to-FR reading guidance, dialogue flow, speech-to-reaction, action lines, running/falling/striking motion, gaze direction, multi-character exchange, scanning details, and reading across related subjects.

Do not use it for: moments that need deliberate intensification/inspection (`pushIn`) or deliberate reveal/context restoration (`pushOut`).

Interaction with `effectType`: visual effects should not interrupt the track. `effectType: none` is valid and often useful when the camera movement alone should guide attention.

Interaction with `durationWeight`: weight controls travel and dwell allocation. Higher weight should make the track easier to read, not more erratic.

Important rule: do not use `pushIn` or `pushOut` merely because a shot contains multiple Focus Regions. Multiple FRs should usually default to `track`; use push roles only when the story meaning requires emphasis, inspection, reveal, or context restoration.

### `reveal`

Semantic purpose: stage information so the viewer discovers it intentionally rather than seeing it immediately. Reveal should read as isolate -> reveal -> reconnect, not as a weaker `pushIn`.

Expected camera behavior: begin with partial context or less informative framing, isolate the reveal Focus Region, then reconnect to the next anchor, next transition, or broader shot context. Browser preview may temporarily strengthen surrounding dim/mask around the reveal anchor so the revealed region reads clearly. The motion should feel deliberate and should not random-scan the panel.

Pacing and duration tendency: usually medium. The pre-reveal portion needs enough time to create anticipation, and the revealed anchor needs enough dwell to read.

Use it for: hidden objects, punchlines, character entrances, dramatic face reveals, clues, or composition shifts where delayed attention matters.

Do not use it for: ordinary reading order, dense dialogue, anchors already obvious in the initial framing, or details that would become confusing if delayed.

Interaction with `effectType`: `spotlight` may support the reveal after arrival, but reveal is a motion-role intent rather than stored visual-treatment metadata. T0066B allows browser preview to apply a temporary reveal mask/dim as part of the reveal role without changing stored `effectType`. `effectType: none` remains valid; it should skip normal focus visual treatment while still allowing the reveal role's temporary mask if needed for the reveal to read.

Interaction with `durationWeight`: weight controls reveal pacing and post-reveal dwell. It should not automatically increase zoom strength.

### `emphasis`

Semantic purpose: give a beat extra weight when the camera should acknowledge importance but not perform a full push-in, track, or reveal.

Expected camera behavior: use a small push, settle, or brief hold around the anchor. The behavior should be restrained and should not become a generic zoom for every important region.

Pacing and duration tendency: usually short to medium. Longer emphasis can become `hold` or `pushIn` if the beat needs sustained attention.

Use it for: impact moments, emotional punctuation, important art details, final beats, or quick visual clues.

Do not use it for: long text reading, broad context restoration, clear directional movement, or cases where a more specific role is available.

Interaction with `effectType`: visual treatment may add weight, but `emphasis` remains camera intent. `effectType: none` is valid if the emphasis should be felt through framing only.

Interaction with `durationWeight`: weight controls how long the emphasis lasts. It should not automatically make the effect louder or the zoom stronger.

## Future Role Classification

The T0064 study introduced possible roles that are not currently in the Project JSON motion-role vocabulary. T0065 keeps schema expansion delayed unless a later ticket explicitly approves it.

### `pullBack`

Classification: future possible role.

Rationale: `pullBack` is semantically useful for restoring context after a close-up, revealing the relationship between subject and environment, or easing out of an intense beat. It is distinct enough from `reveal` and `pushIn` to remain a candidate future role.

Current mapping: approximate with `reveal` when the purpose is staged context, or with `hold` when the goal is simply to settle back into readability. Do not add it to Project JSON yet.

### `drift`

Classification: shot-level/profile concept for now.

Rationale: drift is usually an ambient motion texture across a calm panel rather than a specific attention-anchor intent. It may belong to future shot-level motion profiles such as calm reading or establishing/orientation.

Current mapping: approximate with `hold` plus restrained preview behavior. Do not add it to Project JSON yet.

### `transfer`

Classification: merged into `track` for now.

Rationale: transfer describes moving attention from one subject to another, which overlaps strongly with `track` in the current five-role vocabulary. It may become a clearer future role if dialogue exchange or multi-subject scenes need different behavior from action tracking.

Current mapping: use `track` for anchor-to-anchor attention transfer. Do not add it to Project JSON yet.

## Role Boundaries

- `motionRole` is camera-motion intent.
- Active basic `motionRole` values are `track`, `pushIn`, and `pushOut`.
- `effectType` is legacy compatibility metadata and should not drive active browser preview.
- `effectType: none` should not prevent a Focus Region from being used as a motion anchor.
- Browser preview should not preserve old reveal masking as an active basic role.
- `durationWeight` is timing guidance inside the parent Camera Shot's attention phase.
- `durationWeight` should not make camera motion more aggressive by itself.
- Focus Regions remain page-level anchors, not mini-panels or replacement Camera Shots.
- Full `track` / `pushIn` / `pushOut` browser preview behavior should be implemented in the next source ticket.
- Canvas export parity remains delayed until browser preview grammar behavior is implemented and stabilized.

## `durationWeight`

`durationWeight` is intended to guide future attention-beat timing inside a Camera Shot. It should not change current behavior in T0060.

Interpretation rules for future tickets:

- It is a relative weight, not an absolute duration.
- It applies within the parent Camera Shot's existing time budget.
- It should distribute time among path items during the attention phase.
- Missing, invalid, or non-positive values should fall back to a safe default such as equal weighting.
- Higher values mean the beat deserves proportionally more time.
- It should not override manual shot duration by itself.
- It should not create independent timeline items.

Example future behavior: if a shot has three path items with weights 1, 2, and 1, the middle item receives roughly half of the available attention-beat time while the first and third each receive roughly one quarter.

## Relationship To Existing Fields

### Path Item Order

Path item order is the primary intended order for intra-shot attention and motion when a Camera Shot has an accepted Shot Attention Path.

Current behavior: browser preview already prefers usable explicit Shot Attention Path order for focus attention and falls back when no usable path exists.

Future behavior: browser preview should use path item order as the route for camera-motion anchors during the attention phase.

### Focus Region `sequenceOrder`

`sequenceOrder` is page-level fallback ordering metadata.

Current behavior: it sorts eligible Focus Regions when preview falls back to intersection-based focus sequencing, and T0057 uses it when drafting temporary attention path suggestions.

Future behavior: once a Camera Shot has an accepted Shot Attention Path, path item order should be the primary per-shot order. `sequenceOrder` can remain useful for fallback behavior, draft suggestions, and page-level ordering hints.

Human decision required: decide whether `sequenceOrder` remains page-level metadata indefinitely or is demoted behind per-shot path order in UI emphasis.

### Focus Region `effectType`

`effectType` describes optional visual treatment: `lift`, `spotlight`, `zoom`, or `none`.

Current behavior: preview skips `none` for focus effects and uses lift/spotlight/zoom as visual treatments during focus attention. T0057 skips `effectType: none` when drafting temporary path suggestions.

Future behavior: `effectType` should not define whether a Focus Region is a valid motion anchor. A region can be meaningful as an attention/motion key even when visual treatment is absent or optional.

Legacy optional behavior: lift, spotlight, zoom, and none remain available as visual treatments.

Human decision required: decide whether `effectType` stays on Focus Region, moves to path items, or becomes overrideable per path item.

### `shotPurpose`

`shotPurpose` describes why the Camera Shot exists as a timeline destination and reading container.

Current behavior: purpose metadata is manually editable and may support explicit timing suggestions, but it does not automatically change preview/export behavior.

Future behavior: `shotPurpose` can guide default path interpretation. For example, an establishing shot may prefer broad holds or reveals; an action shot may prefer quicker track beats; a dialogue shot may prefer longer holds.

### `focusPurpose`

`focusPurpose` describes why the Focus Region deserves attention.

Current behavior: it is metadata-only and does not change preview/export behavior by itself.

Future behavior: `focusPurpose` can guide `motionRole` suggestions and `durationWeight` defaults. Dialogue and reaction may lean toward `hold`; detail and reveal may lean toward `pushIn` or `reveal`; action may lean toward `track`.

### `outgoingTransitionPurpose`

`outgoingTransitionPurpose` describes why the sequence moves from the current Camera Shot to the next Camera Shot.

Current behavior: it is persisted metadata and does not change preview/export behavior.

Future behavior: it should influence inter-shot movement, not intra-shot path identity. It may shape how the shot exits after its attention path completes, but it should not turn Focus Regions into timeline destinations.

## Behavior Classification

### Current Behavior

- Camera Shots are flexible scene/panel reading containers and timeline destinations.
- Focus Regions are reusable page-level attention targets.
- Shot Attention Path stores ordered references to existing Focus Regions.
- Manual inspector controls can add, reorder, and remove path references.
- Browser preview prefers usable explicit Shot Attention Path order for focus attention.
- Browser preview falls back to intersection-based eligible Focus Region sequencing when no usable explicit path exists.
- Browser Auto preview prototypes accepted Shot Attention Path items as restrained intra-shot camera-motion anchors.
- Browser Auto preview preserves continuous anchor-to-anchor motion inside a Camera Shot.
- Browser Auto preview applies T0065's restrained role-profile grammar for `hold`, `pushIn`, `track`, `reveal`, and `emphasis`.
- Browser Auto preview preserves final intra-shot motion placement into the next transition and treats `reveal` as isolate -> reveal -> reconnect with a temporary role mask.
- Canvas export does not follow accepted Shot Attention Path behavior yet.
- T0057 creates temporary rule-based draft path suggestions from existing manual data only.

### Intended Future Behavior

- Shot Attention Path order becomes the route for intra-shot camera-motion anchors.
- Path items use `motionRole` to describe hold, push-in, track, reveal, or emphasis behavior.
- Path items use `durationWeight` to distribute future attention-beat time.
- Browser preview applies T0065 role-profile behavior for accepted path items during the attention phase.
- Manual preview may optionally step through attention keys inside the selected Camera Shot while keeping shot stepping available.
- Canvas export follows accepted motion-anchor behavior only after browser preview role behavior stabilizes and export parity is separately planned.
- Rule-based suggestions may later propose `motionRole` and `durationWeight` while remaining temporary until explicit acceptance.

### Legacy Optional Behavior

- Lift, spotlight, zoom, and none remain usable visual treatments.
- Focus Style controls remain optional legacy visual treatment controls.
- `sequenceOrder` remains useful for fallback ordering and draft suggestions.
- Current effect sequencing remains available until motion-anchor preview behavior replaces or reframes it through explicit tickets.

### Human Decision Required

- Whether `effectType` stays on Focus Region or moves/becomes overrideable on Shot Attention Path items.
- Whether `sequenceOrder` remains visible page-level metadata or is demoted behind per-shot path item order.
- Whether lift/spotlight/zoom remain primary controls or become advanced/legacy visual treatment controls.
- When lift/pop-out stops being the default treatment for newly created Focus Regions.
- Whether manual preview should step attention keys by default or expose key stepping as an optional mode.
- When canvas export should follow accepted Shot Attention Path motion behavior.

## Automation And Export Guardrails

- Panel suggestions remain delayed until motion-anchor semantics are clear.
- Text/OCR timing suggestions remain delayed until motion-anchor prerequisites are clear.
- AI-assisted camera path work remains later and must be suggestion-based.
- Suggestions must remain temporary until explicitly accepted.
- Export parity remains delayed until browser preview motion-anchor semantics stabilize.
- T0060 does not change source behavior, schema, preview, export, suggestion behavior, OCR, AI, panel detection, dependencies, audio, or multi-page behavior.

## Guidance For T0061

T0061 should expose `motionRole` and `durationWeight` controls for accepted Shot Attention Path items. Those controls should be metadata-only at first and should not change preview or export behavior.

The UI should make clear that these fields describe future motion-anchor intent, not current visual effect output.

## Guidance For T0062

T0062 should prototype browser preview behavior that uses accepted Shot Attention Path items as intra-shot camera-motion anchors during the attention phase.

It should keep movement restrained, keep Camera Shots as the parent reading containers, keep Focus Regions as page-level targets, and treat lift/spotlight/zoom as optional visual treatments rather than the path identity.
