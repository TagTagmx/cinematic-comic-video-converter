# MVP Export Readiness Plan

T0031 documents the recommended first MP4/video export architecture. This is a planning document only; it does not implement export, add dependencies, or change app behavior.

## Recommendation

Use a **browser-side render-specific canvas pipeline with MediaRecorder capture** for the first prototype.

The current preview is DOM/CSS-based, so it should not be treated as automatically exportable video. T0032 should extract or mirror the preview timing and placement math into a deterministic canvas renderer, draw each frame into a fixed 16:9 canvas, and capture that canvas stream with `MediaRecorder` where supported.

This direction fits the current stage because the app is still a single-page, local-first MVP with no backend, no audio, no render queue, and no cloud storage. It keeps the first export prototype close to the existing project state and avoids introducing server infrastructure before the render model is proven.

## Approach Comparison

### Browser-only Canvas Recording

Render frames into an offscreen or visible `<canvas>` and record `canvas.captureStream()` with `MediaRecorder`.

Pros:
- Keeps export local and single-page.
- Can reuse current project data and most preview timing math.
- Avoids backend setup, uploads, queues, and server FFmpeg dependencies.
- Good fit for a rough prototype.

Cons:
- Requires a render-specific canvas path because current preview uses DOM/CSS.
- Browser encoding support and output container support vary.
- Long or high-resolution exports may be slow or memory-heavy.
- Timing accuracy depends on browser scheduling unless the renderer is carefully structured.

### Browser MediaRecorder From DOM Preview

Capture the existing preview visually from the browser.

Pros:
- Seems simple at first.
- Would preserve the current visual appearance if capture were reliable.

Cons:
- The existing preview is DOM/CSS, not a canvas video source.
- Capturing DOM as video is not a standard, reliable browser primitive.
- CSS transforms, overlay layers, and image clipping would be hard to guarantee.
- Not recommended for T0032.

### Client-side FFmpeg/WASM

Generate frames in-browser, then encode with FFmpeg compiled to WebAssembly.

Pros:
- More control over output format than MediaRecorder.
- Can produce MP4 more consistently if performance is acceptable.
- Avoids backend infrastructure.

Cons:
- Adds a large dependency and heavier browser workload.
- Initial load time and memory use may be poor for large comic pages.
- More implementation complexity than the MVP needs.
- Should be deferred unless MediaRecorder output is unacceptable.

### Backend FFmpeg

Send project data and image binary to a backend service that renders and encodes with FFmpeg.

Pros:
- Best control over codecs, MP4 output, timing, and reproducibility.
- Handles large renders better than many browsers.
- Easier to validate frame-accurate output once infrastructure exists.

Cons:
- Requires backend scaffold, upload handling, job lifecycle, file storage, and security decisions.
- Conflicts with the current local-only MVP stage.
- Introduces operational scope before the render model is proven.
- Not recommended for the first prototype.

### Hybrid Approach

Render or preview in-browser, then use backend or FFmpeg/WASM only for final encoding.

Pros:
- Can balance local interaction with stronger final encoding later.
- Leaves a path to production-quality export.

Cons:
- Too much architecture for the first export prototype.
- Still requires either heavy WASM or backend decisions.
- Better as a later follow-up after a simple canvas renderer exists.

## Data Flow For Export

T0032 should feed export from the same project state used by preview:

- `uploadedImage`: provides the source image binary through the browser object URL and the source dimensions.
- `cameraShots`: ordered timeline source; export must render shots in array order.
- Camera shot geometry: `x`, `y`, `width`, and `height` define flexible subject regions in source-image coordinates.
- Shot timing: `durationMs`, `sceneHoldRatio`, and `focusAttentionRatio` define travel, hold, focus, and exit phase timing.
- `focusRegions`: page-level regions, not shot-owned timeline data.
- `effectType`: controls lift, spotlight, zoom, or none behavior.
- `sequenceOrder`: controls deterministic focus attention order inside each active shot.
- Output stage: fixed 16:9 canvas, initially one practical MVP size such as 1280x720 unless T0032 chooses otherwise.

The source image must be available at export time. Project JSON alone is not enough because schema version 1 explicitly does not bundle image binary.

## Preview Reuse Boundary

Reuse:
- Timeline order.
- Shot phase model: travel, scene hold, focus attention, exit.
- Camera shot travel math, including source-space center/size interpolation and deterministic easing.
- Fixed 16:9 stage behavior.
- Flexible camera shot subject regions.
- Clipped shot-window placement.
- Focus-region eligibility, `effectType`, and `sequenceOrder` behavior.

Render-specific path needed:
- Canvas drawing for the source page crop/window.
- Canvas equivalents for lift, spotlight, and zoom effects.
- Deterministic frame stepping at the chosen output FPS.
- Video capture and download flow.

Do not assume the DOM preview can be recorded directly. The preview should remain the interactive user-facing reference, while export should use shared math or matching helper functions where practical.

## MVP Scope

- Single uploaded page only.
- Fixed 16:9 output.
- Camera shots rendered in timeline order.
- Use existing shot duration and timing fields.
- Include current focus-region effects as closely as practical.
- No audio.
- No cloud rendering.
- No multi-page export.
- No advanced export settings.
- No production render queue.

## Risks And Limitations

- Image binary availability: exports require the source image to be selected in the current browser session.
- Browser performance: large source images and long timelines may be slow or memory-heavy.
- Preview/export consistency: canvas export must intentionally match the DOM preview; it will not happen automatically.
- Timing accuracy: real-time MediaRecorder capture may drift if frame drawing stalls.
- Large images: T0032 may need source image scaling limits or warnings.
- Cross-browser support: `MediaRecorder` MIME support varies, and true MP4 output may not be available in every browser.
- Audio: not supported in the MVP export scope.

## T0032 Implementation Outline

Title: MP4 Export Prototype

Goal: Add a rough browser-side video export prototype for the current single-page project.

Allowed areas:
- `src/features/preview/` or a new narrowly scoped export feature folder.
- `src/lib/` for shared render/timing helpers if needed.
- `src/styles/` for minimal export UI styling.
- `docs/` for verification notes.

Requirements:
- Add an export action that is available only when an image and at least one camera shot exist.
- Render a fixed 16:9 canvas from the current uploaded image and project state.
- Use camera shots in timeline order.
- Preserve flexible camera shot subject regions and clipped shot-window behavior.
- Preserve shot phase timing and deterministic camera travel.
- Include focus-region effects as scoped for MVP, or document any effect-specific gaps before finishing.
- Capture canvas output with `MediaRecorder` when supported.
- Provide a clear unsupported-browser message when capture is unavailable.

Non-goals:
- No backend.
- No dependency installation unless explicitly approved by a later ticket.
- No audio.
- No cloud rendering.
- No multi-page export.
- No advanced codec, bitrate, resolution, or FPS settings.
- No render queue.
- No AI detection or automatic camera planning.

Verification:
- Export a short project with at least three shots of varied aspect ratios.
- Include a shot with no focus regions.
- Include focus regions using lift, spotlight, zoom, and none where practical.
- Play the exported artifact locally and compare it against preview timing and framing.
- Confirm Project JSON export/import behavior is unchanged.
