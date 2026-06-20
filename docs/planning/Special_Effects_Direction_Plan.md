# Special Effects Direction Plan

T0073 defines how special effects should fit into the current MVP+ product model before any effect code is implemented.

This is documentation only. It does not change source behavior, package files, Project JSON schema, preview behavior, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, or multi-page behavior.

## Product Boundary

Special effects are rendering-layer modifiers that sit on top of existing camera placement.

They may alter the emotional texture of a shot by adding temporary visual treatment during preview/export, but they must not decide where the camera goes. Camera placement remains controlled by Camera Shots, Shot Attention Path anchors, and the accepted motion grammar:

- `track`
- `pushIn`
- `pushOut`

Special effects must not create:

- new Camera Shot geometry
- new Focus Region ownership rules
- new timeline ownership systems
- new motion roles
- replacement camera frames
- destructive source-page crops
- automatic camera-path decisions

Effects should be optional and removable. Turning an effect off should leave the underlying shot/path/camera behavior identical to the accepted baseline.

## Definition

A special effect is a temporary preview/export rendering treatment applied after camera placement has already been resolved.

Examples:

- small camera-offset jitter layered over an already computed camera window
- a brief exposure or opacity pulse over the current frame
- a tension vignette over the fixed 16:9 stage
- a cautious blur treatment during fast movement

A camera motion role answers: where and why does the camera move?

A special effect answers: what emotional texture is layered over the already chosen movement?

This distinction matters because the current product model is page-preserving and camera-motion-first. Effects should support story beats, not become another grammar competing with `track`, `pushIn`, or `pushOut`.

## Allowed MVP+ Effects

Start with low-risk rendering effects only.

### Camera Shake

Storytelling use:

- action impacts
- explosions
- sudden fear or instability
- intense fast-action panels

Scope:

- Prefer per-shot use first.
- A global default may exist later only as a convenience preset, not as required project behavior.

Preview behavior:

- Add small temporary x/y offsets on top of the computed camera placement.
- Keep the resolved source window and shot geometry unchanged.
- Use restrained intensity, short duration, and decay so the page remains readable.

Export behavior:

- Canvas export should apply the same offset function after resolving the normal camera placement.
- Export should match preview closely enough in timing, direction, and intensity.

Risks:

- Can make dialogue unreadable.
- Can look random or cheap if used too often.
- Can fight against smooth `track`, `pushIn`, or `pushOut` movement.
- Can expose stage edges if offsets are not clamped.

### Flash / Impact Pulse

Storytelling use:

- hits, explosions, gunshots, lightning, shock reveals, hard cuts

Scope:

- Per-shot first.
- Later presets may apply it to selected action shots, but not automatically.

Preview behavior:

- Brief white or bright overlay pulse over the fixed stage or active shot.
- Fade in/out quickly without changing camera position.
- Should be visually temporary and should not replace `pushIn`.

Export behavior:

- Canvas export should draw the same timed overlay with similar opacity and easing.

Risks:

- Can feel like an editing error if the flash is too long or too bright.
- Can cause distracting flicker across many short shots.
- Can reduce readability and may need accessibility caution.

Important boundary:

- An impact pulse may be allowed only as a temporary visual modifier on top of the existing camera. It is not a new camera role and must not compete with `pushIn`.

### Vignette / Tension Dim

Storytelling use:

- suspense
- dread
- emotional close-up
- isolation
- dramatic focus

Scope:

- Per-shot first.
- A subtle global styling option may be considered later only if it remains removable.

Preview behavior:

- Add a soft edge darkening or tension dim over the stage after camera placement.
- Keep the center readable and avoid Focus Region-shaped masks.
- Should not revive old spotlight, aperture, or reveal-mask behavior.

Export behavior:

- Canvas export should use gradients or overlays to approximate the same perceived edge falloff.

Risks:

- Can make already dark artwork muddy.
- Can look like the old rejected spotlight/reveal language if too region-shaped.
- Can flatten page contrast if stacked with the accepted shot-to-shot travel veil.

### Motion Blur

Storytelling use:

- very fast shot-to-shot travel
- fast action
- speed emphasis during aggressive movement

Scope:

- Cautious candidate, not first guaranteed implementation.
- Preview-only spike is acceptable before data model or UI commitment.

Preview behavior:

- Apply subtle directional or generic softness during high-velocity movement only.
- Avoid persistent blur during holds or text-heavy shots.
- It should enhance speed, not hide poor camera pacing.

Export behavior:

- Canvas export may approximate blur through canvas filters or frame blending only after preview behavior is accepted.
- Export parity risk should be tested before committing schema or UI.

Risks:

- Browser CSS blur and canvas blur may not match.
- Blurs text and fine manga linework quickly.
- Can look muddy in export.
- Can duplicate the existing subtle shot-to-shot travel softness if not scoped carefully.

## Delayed or Forbidden for Now

The following are delayed and should not be implemented as part of the MVP+ special-effects branch:

- parallax
- character cutouts
- face tracking
- AI-driven emphasis
- moving real manga motion lines
- segmentation-dependent foreground animation
- punch-in as a separate motion grammar

Reasons:

- They require segmentation, detection, or semantic inference that the MVP+ model has not accepted.
- They risk turning the product into character animation instead of page-preserving camera movement.
- They can create new ownership and timeline questions that conflict with the current model.
- They may revive demoted effect-first behavior.

Punch-in remains covered by the existing `pushIn` camera grammar. Do not add a separate `punchIn`, `impactZoom`, or similar role. If a hard impact feeling is needed, use an impact pulse or camera shake modifier layered over existing `pushIn`, `pushOut`, or `track` behavior.

## Data Model Direction

Do not implement a special-effect data model yet.

Recommended sequence:

1. Try preview-only experiments with hardcoded or temporary local settings.
2. Manually judge whether the effects improve story readability.
3. Only after accepted preview behavior exists, add Project JSON fields in a dedicated schema ticket.
4. Keep effect data separate from camera geometry and motion role data.

Future project data, if accepted, should likely describe per-shot effect intent or preset selection. It should not move Focus Regions into shot-owned effect timelines, add new camera frames, or make effects responsible for camera placement.

## UI Direction

Prefer preset-first controls instead of many sliders.

Initial preset candidates:

- None
- Subtle tension
- Impact
- Fast action
- Dramatic focus

Preset-first UI keeps the editor aligned with storytelling choices instead of exposing a technical effect mixer too early. Sliders for intensity, duration, decay, blur amount, or pulse opacity can come later after effects are accepted and the useful parameters are clear.

## Preview and Export Parity

Any accepted special effect must eventually have export parity.

Preview-only spikes are allowed, but they must be labeled as experiments and must not change Project JSON schema. A preview-only spike should not be treated as finished product behavior until export parity has a clear implementation path.

Export parity means creator-perceived behavioral parity, not pixel-perfect DOM reproduction. The exported video should apply the same effect choice at the same shot timing with roughly the same intensity and readability.

## Manual Verification Expectations

Future implementation tickets should verify:

- Effect off looks identical to the current accepted preview/export baseline.
- Effects do not mutate Camera Shot boxes.
- Effects do not mutate Focus Regions.
- Effects do not change Shot Attention Path order or references.
- Effects stack on top of `track`, `pushIn`, and `pushOut`.
- Effects do not introduce new motion roles.
- Effects do not reintroduce old demoted concepts like `reveal`, `lift`, `spotlight`, or `zoom` as separate active grammar.
- Effects do not use rails, ribbons, apertures, punched cutouts, endpoint shapes, moving squares, sliding boxes, or Focus Region-shaped highlights.
- Export parity matches preview closely enough once an effect is accepted beyond a spike.
- Text-heavy panels remain readable.
- Effect stacking stays restrained, especially with the accepted shot-to-shot travel veil.

## Recommended Ticket Sequence

The originally preferred special-effects sequence was T0069 through T0074, but those ticket numbers are already assigned to older deferred automation/suggestion work in `docs/Tickets.md`. The adjusted sequence is:

1. T0073 - Special Effects Direction Doc.
2. T0074 - Camera Shake Preview Spike.
3. T0075 - Flash / Vignette / Motion Blur Preview Spike.
4. T0076 - Shot Effect Model.
5. T0077 - Simple Effect Presets UI.
6. T0078 - Canvas Export Effect Parity.

T0074 and T0075 should remain preview-only experiments. T0076 should happen only after manual review confirms the preview effects are worth persisting.

## Planning Ticket Manual Verification

For T0073:

- Review this document.
- Confirm special effects are rendering-layer modifiers only.
- Confirm the active camera grammar remains `track`, `pushIn`, and `pushOut`.
- Confirm camera shake, flash/impact pulse, vignette/tension dim, and cautious motion blur are the only allowed MVP+ effect candidates.
- Confirm parallax, character cutouts, face tracking, AI-driven emphasis, moving manga motion lines, segmentation-dependent foreground animation, and punch-in as a separate motion grammar are delayed or forbidden.
- Confirm Project JSON schema remains unchanged.
- Confirm no `src/`, package, preview, export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.
- Confirm build is not required because this ticket is docs-only.
