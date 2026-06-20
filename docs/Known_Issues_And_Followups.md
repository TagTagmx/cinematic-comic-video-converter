# Known Issues and Follow-ups

Use this file to record problems, risks, and future ideas that should not be fixed during unrelated tickets.

Codex should add to this file when it notices something important outside the current ticket scope.

## Known Issues

None currently recorded.

## Resolved Issues

- Focus regions were previously stored as child data on camera shots even though preview treated them like page-level annotations. Deleting the shot that created a focus region could silently delete that region. Focus regions are now stored separately at page level, with optional `sourceShotId` metadata only for context.
- Focus regions previously played in page-level array order only. They now support a simple numeric sequence order for deterministic attention ordering inside active camera shots.
- Shot preview timing previously used a fixed hold/focus split only. Camera shots now support simple scene hold and focus attention timing ratios while keeping total duration as the main budget.
- Focus regions previously had no cinematic effect type field. They now support lift, spotlight, zoom, and none values, with lift as the default.
- Focus regions could previously be drawn but not refined afterward. Selected focus regions can now be dragged and resized from a bottom-right handle while remaining page-level annotations.
- Camera shot boxes were previously locked to 16:9 and preview used fill-style scaling. Camera shots are now flexible subject regions, and preview contains each shot inside the fixed 16:9 stage without cropping the selected shot by default.
- Flexible shot preview previously centered the full source page around the active shot, which revealed surrounding page pixels in non-16:9 stage space. Preview now renders the active shot through a clipped shot window so only selected shot pixels appear as shot content.
- Preview previously always showed focus-region kind labels during lifted focus cutouts. Final preview mode now hides debug labels by default, while Debug mode keeps them for inspection.
- Spotlight and zoom focus-region effect types were previously selectable but did not have distinct preview behavior. Spotlight now dims the clipped shot window around the active focus region, and zoom now applies a restrained push-in inside the clipped shot window.
- Zoom focus previously pushed in subtly but left unrelated shot-window areas too visually competitive. Zoom now adds a light aperture mask around the transformed active focus region while preserving shot context.
- Focus region effects previously switched between sequence items with limited transition continuity. Preview now adds simple transition motion between eligible focus regions inside the focus attention phase.
- Focus-region transitions could briefly return the base shot to full brightness when dimming was owned by per-effect masks. Preview now uses a shared focus-phase dim layer so background de-emphasis remains continuous while effect emphasis changes.
- Uploading a new page could reset the stored focus-region list while leaving the default focus-region label/order counter advanced from the previous page. New page loads now reset the focus-region creation counter.
- Lift-to-lift transitions could show a tiny pop when the outgoing lift faded out before being reused as previous transition context. Lift handoff now keeps the outgoing lift visible until the next lift slice and renders outgoing/current lift cutouts as separate keyed elements during overlap.
- Project state previously could not be saved outside the browser session. Users can now export readable Project JSON for the current single-page project and import it later. Project JSON still excludes image binary, but the newer project archive export/import path bundles the source image for reopen without manual image re-selection.
- Some browsers can report MP4 MediaRecorder support but fail when recording starts, especially with mixed audio tracks. Canvas video export now attempts each reported supported recorder MIME type in order before failing, allowing fallback to another browser-supported format such as WebM.

## Follow-up Ideas

### Image Handling

- Add drag-and-drop image upload.
- Add image rotation.
- Add perspective correction for phone photos.
- Add brightness/contrast cleanup.
- Add large-image optimization.

### Editor

- Add zoom and pan controls for editing.
- Add snapping guides.
- Add duplicate shot button.
- Add keyboard shortcuts.
- Add undo/redo.

### Timeline

- Add drag-and-drop reordering.
- Add shot duration visualization.
- Add transitions between shots.
- Add movement/easing controls.
- Add Shot Attention Path data and controls so each camera shot can reference ordered page-level focus regions for intra-shot attention/motion.

### Preview

- Add fit/fill preview mode toggle.
- Add easing options.
- Add hold/pan/zoom presets.
- Add action shake effect.
- Add fade transitions.
- Add preview resolution settings.

### Export

- Harden project archive import/export after broader manual testing, especially around very large source images and browser memory limits.
- Harden background audio export after broader browser testing, especially MediaRecorder container/codec behavior with mixed audio tracks.
- Harden mixed BGM + SFX export after broader browser testing, especially one-shot scheduling accuracy and container/player audio-track behavior.
- Improve video export parity between the canvas prototype and the DOM/CSS preview, especially focus-region transition detail.
- Add production MP4 export if browser MediaRecorder support and output formats are not sufficient.
- Add FFmpeg backend.
- Add render progress UI.

### AI Assistance

- Keep AI automation suggestion-based: AI output should remain temporary until the user accepts, edits, rejects, or ignores it.
- Track privacy and copyright risks before real AI provider integration, especially explicit user consent for image uploads.
- Add mock AI response support before real API integration so suggestion UI and validation can be tested without API keys, cost, latency, or privacy risk.
- Add strict validation/normalization for AI output because provider responses may hallucinate, contain bad JSON, or propose unsupported geometry/motion roles.
- Add panel detection.
- Add speech bubble detection.
- Add OCR-assisted timing.
- Add face/focus detection.
- Add automatic reading order.
- Add smart camera path generation.

### Multi-page Support

- Support multiple uploaded pages.
- Add page ordering.
- Add transitions between pages.
- Export full multi-page sequence.

