# Preview Frame vs Camera Shot vs Focus Region vs Shot Attention Path

This document records the design distinction between the fixed preview frame, flexible camera shots, page-level focus regions, and the shot attention path model.

## Preview Frame

The preview frame is the fixed final video stage.

Current rules:

- It uses a 16:9 aspect ratio for now.
- It is the browser preview viewport.
- Future video export should use the same fixed 16:9 stage unless a future output-aspect ticket changes it.
- It can show empty space around non-16:9 subject regions.

## Camera Shot / Reading Container

A camera shot is a flexible panel/scene reading container over the full comic page. It is the main timeline destination for a story beat. It is not a fixed output-ratio frame, and it is not merely a destructive crop box.

Current rules:

- It marks the page area the user wants fully visible during that timeline item.
- It represents the panel, scene, or reading container for that beat.
- It is stored in source image coordinates.
- It can be selected, dragged, and resized freely within the source page bounds.
- It does not need to be 16:9.
- It is used by timeline order and browser preview playback.

During preview, each camera shot is fit into the fixed 16:9 preview frame with contain-style logic. The full shot rectangle should remain visible. Tall, wide, or square shots may leave letterbox or pillarbox space inside the preview frame.

The active shot is rendered as a clipped content window. The app uses the original source image, but only pixels inside the active camera shot rectangle are visible:

- Shot window size: `shot.width * containScale` by `shot.height * containScale`.
- Shot window position: centered inside the fixed 16:9 preview frame.
- Image scale: `containScale`.
- Image offset inside the shot window: `-shot.x * containScale`, `-shot.y * containScale`.

Empty space outside the shot window belongs to the preview frame background. It should not reveal unselected surrounding comic page pixels.

## Focus Region / Page-Level Attention Target

A focus region is a free-ratio page annotation / attention target. It is reusable page-level data, not owned by a camera shot by default.

Future use cases:

- Mark an actual comic panel.
- Mark a speech bubble.
- Mark a face, action detail, or important object.
- Guide blur, highlight, hold, or attention effects.
- Guide future pan-within-frame behavior.
- Act as a reusable intra-shot attention or motion key when referenced by a camera shot.
- Provide structured data for later automation without changing the video viewport.

Focus regions should be allowed to use arbitrary aspect ratios because comic panels and details are not always 16:9. They can be tall, wide, irregularly composed, or small detail regions inside a larger shot.

Focus regions are stored at the page/project level. A focus region may keep optional metadata such as `sourceShotId` to record which shot was selected when the region was created, but deleting that shot should not delete the focus region. Future shot-level attention paths should reference page-level focus region IDs rather than transferring ownership into the shot.

## Shot Attention Path

Shot Attention Path is a per-camera-shot list of ordered references to page-level focus regions.

It answers: which existing attention targets should this camera shot visit, emphasize, or use as intra-shot motion keys, and in what order?

Current model rules:

- It belongs to a camera shot as ordered reference data.
- It references existing page-level focus regions by ID.
- It does not copy, own, or delete focus regions.
- It does not make focus regions replacement camera frames.
- It is intended to realize intra-shot attention and motion inside the camera shot reading container.
- It has model+persistence support and manual inspector controls.
- Browser preview uses it for focus attention when a usable explicit path exists.
- Canvas video export must not use it until explicitly ticketed.

Automatic browser preview prefers an explicit shot attention path when one exists and resolves to at least one usable focus region. If a shot has no usable explicit path, browser preview falls back to the current intersection-based eligible focus-region behavior. Future export can adopt the same preference in a separate parity ticket.

Manual tap-through preview currently steps camera shot by camera shot. A future manual mode can optionally step through attention keys inside the current camera shot by following the shot attention path.

## Why These Concepts Stay Separate

Preview frames, camera shots, focus regions, and shot attention paths answer different questions:

- Preview frame: What is the final 16:9 video canvas?
- Camera shot: What panel/scene reading container should be visible inside that canvas for this timeline beat?
- Focus region: What reusable part of the comic page can receive attention?
- Shot attention path: Which focus-region references should guide intra-shot attention or motion, and in what order?

If focus regions replaced camera shots, the app would lose a stable timeline subject model. If camera shots replaced the preview frame, the app would lose a stable output canvas. Keeping all three concepts separate makes the project easier to reason about:

- Preview and export continue to use a fixed video stage.
- Timeline shots can match actual comic panels or page areas without forced 16:9 resizing.
- Editor annotations can mark real comic content with page-level focus regions.
- Future effects and intra-shot motion can use focus regions through shot attention path references without changing shot or output semantics.
- Deleting or reordering timeline shots does not silently delete page annotations.

## Implementation Guidance

Until a future ticket explicitly changes output aspect ratio behavior, the preview/export stage should remain 16:9. Camera shot boxes should be flexible panel/scene reading containers and should be clipped then contained inside that stage by default. Free-ratio panel, detail, speech bubble, face, or action marking should be implemented as page-level focus regions.

Preview and future export currently read subject placement from camera shots. Browser preview now prefers shot attention path data for focus attention before falling back to the page-level focus region list intersection behavior. Canvas video export still uses its existing behavior until a separate parity ticket changes it. Do not reintroduce shot-owned focus regions unless a later feature explicitly designs shot-local annotations.
