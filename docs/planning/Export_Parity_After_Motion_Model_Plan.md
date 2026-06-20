# Export Parity After Motion Model Plan

This planning note defines what canvas/video export parity should mean after the browser-preview motion grammar is accepted. Browser Preview Motion Grammar Acceptance Review later accepted the current browser-preview `track`, `pushIn`, `pushOut`, `Shot Starts At`, and shot-to-shot travel veil behavior as the practical baseline for T0068.

It is documentation only. It does not change source behavior, package files, Project JSON schema, preview behavior, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, or multi-page behavior.

## Product Boundary

The product remains a manual-first, page-preserving cinematic guided-view editor.

- The source comic page stays intact as the world.
- Camera Shots are flexible reading containers and main timeline destinations over the full page.
- Focus Regions are reusable page-level attention targets, not shot-owned records and not replacement camera frames.
- Shot Attention Paths are ordered intra-shot camera-motion anchors that reference page-level Focus Regions.
- Project JSON remains the source of truth for page, shot, focus-region, and attention-path state.

Export parity should reproduce accepted project data and accepted browser-preview motion behavior. It should not infer panels, OCR text, faces, characters, speech bubbles, or new camera paths.

## Export Parity Definition

Canvas/video export parity means a rendered export should follow the same shot timeline, source-image coordinate math, camera-stage containment, accepted Shot Attention Path order, active motion-role behavior, and timing interpretation that the accepted browser-preview baseline uses.

Parity is not pixel-perfect DOM reproduction. The browser preview uses React, CSS, SVG, layout boxes, and browser compositing. Canvas export will use explicit drawing commands, frame sampling, and recorded media. The goal is creator-perceived behavioral parity: the exported video should read like the accepted browser preview.

For accepted Shot Attention Path anchors, export parity means:

- Resolve only usable accepted path items that reference existing page-level Focus Regions.
- Preserve accepted path order as the primary intra-shot order.
- Use `durationWeight` as relative attention-phase timing in the same way as browser Auto preview.
- Ignore missing references safely without crashing export.
- Preserve the fallback behavior for shots with no usable accepted path.
- Preserve motion-chain continuity: the ending source window of one accepted motion anchor must be the starting source window of the next accepted motion anchor.
- Preserve accepted per-shot `Shot Starts At` behavior: `establishShot` starts at the Camera Shot frame, while `firstFocus` starts at the first accepted focus target for supported first `track` chains and first `pushOut` anchors.
- Preserve accepted shot-to-shot travel treatment: eased camera travel, subtle midpoint dim/softness, and a clear frame again on arrival.
- If the next shot uses `Shot Starts At = firstFocus`, shot-to-shot travel should arrive at that selected first-focus start frame, not at the broader Camera Shot frame.
- Keep Manual mode as preview-only UI behavior; export should render the full automatic timeline unless a later ticket scopes alternate export modes.

Guided Page Enter and Page Exit options must be explicitly reviewed before export implementation. A later export parity ticket should either mirror those options when they are accepted as part of parity, or leave them as browser-preview-only behavior until separately scoped.

## Role Behavior Scope

The active export parity target is the current browser-preview grammar: `track`, `pushIn`, and `pushOut`.

### `track`

Export should reproduce `track` as camera-motion-first attention transfer. As of Track v2, `track` means stable-scale pan/glide between Focus Region targets for normal eye guidance.

- The camera should travel continuously through accepted Focus Region anchors without resetting to the base Camera Shot framing between anchors.
- Track target windows should preserve useful context around Focus Regions rather than becoming destructive crops.
- Differently sized Focus Regions should keep camera scale mostly constant, with only small correction when a larger FR needs readability/framing.
- When `Shot Starts At = firstFocus` and the shot begins with a `track -> track` chain, export should begin already framed on the first track target without making a dimmed follow-spot the identity of the move.
- Final intra-shot placement should remain available for shot exit and next-shot transition behavior when accepted by browser preview.

### `pushIn`

Export should reproduce `pushIn` as a clear inward camera move toward an exact or near-exact Focus Region close-up.

- The move should be stronger than a stable hold or context-preserving track.
- The destination should read as the Focus Region becoming the attention target.
- It should remain page-preserving and should not crop or mutate source art.

### `pushOut`

Export should reproduce `pushOut` as close-up-to-context recovery.

- It should expand from a close-up toward the next anchor's entry window when one exists.
- It should expand toward the broader Camera Shot when no next anchor exists.
- When `Shot Starts At = firstFocus` and the first anchor is `pushOut`, export should start close on that first Focus Region and begin the accepted push-out from there.
- It should preserve continuity into later anchors or shot transitions.

## Track Attention Guide Layer

The accepted browser-preview `track` baseline is now Track v2 camera-motion-first stable-scale eye guidance. A follow-spot can remain an optional/internal attention-guide layer, but it is not the default `track` look.

Export should preserve:

- Stable-scale camera movement as the primary `track` behavior.
- Smooth ease-in-out center movement from the previous track target to the current track target.
- Short readable arrival/settle time when the timing model supports it.
- No dimmed follow-spot overlay as the default identity of `track`.

Optional attention-guide overlays must remain secondary to the camera movement and must not revive the old spotlight/rail identity of `track`.

## Shot-to-Shot Travel Veil

The accepted browser-preview baseline includes a restrained whole-shot travel treatment during shot-to-shot camera movement.

Export should eventually reproduce it as:

- Smooth eased camera travel rather than linear interpolation.
- A bell-curve visual intensity: no veil at departure, subtle peak near mid-travel, no veil at arrival.
- A slight darkening layer during the peak.
- Very subtle image softness or motion-blur-like treatment during the peak.
- No travel veil during intra-shot `track`, `pushIn`, or `pushOut` attention motion.
- No Focus Region-shaped highlight, aperture, punched cutout, rail, ribbon, or other deprecated active `track` language.

When the destination shot uses `Shot Starts At = firstFocus`, the travel veil should clear as the camera arrives directly on that first-focus start frame.

## Deprecated Visual Language To Avoid

Export parity must not resurrect earlier rejected visual experiments as the main `track` language.

Do not implement active `track` export using:

- visible rails, ribbons, corridors, or beams as the primary effect
- aperture masks or moving clear rectangular windows
- endpoint capsules, endpoint ovals, endpoint blobs, or rounded-rectangle apertures
- moving squares, sliding boxes, cursor-like marks, or tiny punched cutouts
- Focus Region-shaped highlights or exact rectangular Focus Region masks
- old lift, spotlight, zoom, or reveal effect-first playback as the core export model

Legacy `effectType` values may remain Project JSON compatibility data, but export parity should target accepted motion roles and accepted browser-preview behavior.

## Baseline Acceptance

Browser Preview Motion Grammar Acceptance Review accepted the current browser-preview `track`, `pushIn`, `pushOut`, `Shot Starts At`, and shot-to-shot travel veil behavior as the practical baseline for T0068. This is not a final/perfect visual-style claim. Additional browser-preview visual repair should not block export parity unless a future ticket explicitly reopens preview behavior.

The accepted baseline covers:

- `track` across at least three Focus Regions.
- `track` with small-to-large, large-to-small, and similar-size Focus Region transitions.
- `track -> track` follow-spot background darkness and spot sizing.
- `Shot Starts At = firstFocus` behavior for first `track -> track` chains, including beginning already dimmed with the spot on the first Focus Region.
- `Shot Starts At = firstFocus` behavior for first `pushOut` anchors, including beginning close on the first Focus Region.
- Shot-to-shot travel veil pacing, including eased movement, midpoint dim/softness, and clean arrival.
- Shot-to-shot travel arriving at a next shot's first-focus start frame when that shot uses `Shot Starts At = firstFocus`.
- `pushOut -> track` and `pushIn -> track` transitions retaining camera movement without the follow-spot overlay.
- Pass-through track-start anchors entered from non-`track` and followed by `track` not consuming a full hold-like timing segment.
- `pushIn` exact or near-exact close-up behavior.
- `pushOut` close-up-to-context behavior with and without a next anchor.
- `pushOut` ending frames matching the next motion's starting frames.
- No camera reset between accepted anchors.
- Final intra-shot placement into the next Camera Shot transition as part of accepted browser behavior.
- Missing-reference safety.
- Shots without usable accepted paths retaining fallback behavior.
- Confirmation that old lift, spotlight, zoom, reveal, rail, ribbon, aperture, endpoint, and rectangular highlight language remains deprecated as core behavior.

T0068 may now begin from this accepted baseline, provided it does not revive deprecated visual language.

## Canvas Translation Risks

Canvas export cannot depend on DOM/CSS/SVG compositing behaving exactly like browser preview.

Known risks:

- CSS/SVG radial masks and alpha stops must be translated into canvas gradients or compositing without changing perceived darkness.
- CSS image blur/softness during the travel veil must be translated into canvas drawing behavior without making exported frames muddy.
- DOM layout sizing and canvas frame sizing can drift if source-image-to-preview coordinate math is not shared carefully.
- Browser preview may update at animation-frame timing, while export samples fixed frames; easing and segment boundaries must be deterministic.
- Canvas capture and MediaRecorder can vary by browser and output format.
- Alpha blending, color management, and antialiasing may make the follow-spot brighter or darker than preview.
- Very small or very large Focus Regions can produce spot radii that need clamping in canvas.
- Export must avoid mutating project state while computing per-frame placements.
- Existing canvas export may still contain legacy focus-effect behavior that should not be treated as the new parity baseline.

## Later Implementation Checklist

A later export parity implementation ticket should:

- Audit current canvas export behavior and identify legacy effect-first code paths.
- Reuse or extract shared source-window placement math where practical.
- Implement accepted Shot Attention Path resolution for export.
- Implement accepted `shotStartFraming` handling for export.
- Implement accepted shot-to-shot travel veil timing and visual treatment for export.
- Ensure shot-to-shot travel targets a destination shot's first-focus start placement when applicable.
- Implement `durationWeight` timing for export attention phases.
- Implement the accepted pass-through timing rule for track-start anchors entered from non-`track` and followed by `track`.
- Implement continuous `track` camera target interpolation.
- Implement `pushIn` target-window behavior.
- Implement `pushOut` context recovery behavior.
- Implement first-focus `pushOut` starts without changing accepted push-out expansion behavior.
- Ensure each motion anchor's ending source window is reused as the next motion anchor's starting source window.
- Implement final intra-shot placement continuity into shot exit and next-shot transitions if accepted.
- Keep any track attention-guide overlay optional; do not implement dimmed follow-spot as the default track identity.
- Add source-window bounds clamps for stable track placement.
- Preserve shots with no usable accepted path.
- Preserve Project JSON schema and import/export behavior unless a separate schema ticket explicitly changes it.
- Keep export controls/status behavior unchanged unless scoped.
- Run build and manual export checks after source changes.

## Planning Ticket Manual Verification

For this T0067 planning ticket:

- Confirm this document defines export parity around accepted Shot Attention Path anchors.
- Confirm `track`, `pushIn`, `pushOut`, `Shot Starts At`, and shot-to-shot travel veil behavior are the active parity targets.
- Confirm the current track follow-spot behavior is documented as the accepted practical baseline, not as a final/perfect visual style.
- Confirm rejected rails, ribbons, apertures, endpoint shapes, moving squares, sliding boxes, and Focus Region-shaped highlights are explicitly excluded.
- Confirm T0068 is unblocked and must target the accepted browser-preview baseline.
- Confirm no `src/`, package, Project JSON schema, preview, export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.
- Confirm build is not required because this ticket is docs-only.
