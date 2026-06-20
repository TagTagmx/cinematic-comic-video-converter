# Full Design Document

## 1. Project Overview

Cinematic Comic Video Converter transforms static comic page images into cinematic motion videos.

Users upload photos or scans of comic pages. The app creates a guided camera path across the page using zooms, pans, holds, and transitions. The result feels like a motion comic or cinematic reading experience.

The project does not aim to fully animate characters or redraw comic art. It uses the existing page art and adds motion through camera direction.

## 2. Key Design Philosophy

Traditional panel extraction is fragile because comic pages often contain:

- Characters extending outside panel frames.
- Speech bubbles touching or crossing borders.
- Effects, weapons, or backgrounds spanning multiple panels.
- Irregular layouts.
- Splash panels.
- Overlapping artwork.

Therefore, the page should remain intact.

The app should move a virtual camera across the full page, rather than cutting the page into separate images.

## 3. Core User Experience

A typical user flow:

1. User uploads a comic page.
2. The page appears in an editor.
3. The user creates camera shots over the page.
4. Each shot defines a region to focus on.
5. The user arranges shots in order.
6. The app previews camera movement between shots.
7. The user adjusts timing, zoom, and movement style.
8. The app renders a video.

## 4. Main Concepts

### Page

A source image uploaded by the user.

### Camera Shot

A rectangular viewport over the page.

A shot includes:

- Position
- Size
- Duration
- Movement type
- Optional label
- Optional transition behavior

### Timeline

An ordered sequence of camera shots.

### Preview

A browser-based simulation of the final cinematic movement.

### Render

A later system that converts timeline data into an MP4 video.

## 5. Data Model Draft

```ts
export type ComicProject = {
  id: string;
  title: string;
  pages: ComicPage[];
  timeline: TimelineShot[];
};

export type ComicPage = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
};

export type CameraShot = {
  id: string;
  pageId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  durationMs: number;
  easing: "linear" | "easeInOut";
  movement: "hold" | "pan" | "zoomIn" | "zoomOut";
};

export type TimelineShot = {
  shotId: string;
  order: number;
};
```

Coordinates should be stored in source image coordinate space, not screen coordinate space. This makes the project stable when the editor zoom level changes.

## 6. MVP Scope

The MVP should support:

- One uploaded image.
- Displaying that image in an editor.
- Creating camera shots manually.
- Moving/resizing camera shot rectangles.
- Showing a basic timeline list.
- Previewing movement between shots.
- Saving/loading project JSON locally.

## 7. Later Features

After the manual editor works, later versions may add:

- Automatic panel detection.
- Speech bubble detection.
- OCR-assisted timing.
- Face/focus detection.
- Smart reading order.
- Multi-page projects.
- MP4 export through FFmpeg/MoviePy.
- Background music and sound effects.
- Impact shake for action panels.
- Page transitions.
- AI-generated camera path suggestions.
- Presets for manga, Western comics, webtoons, etc.

## 8. Important Edge Cases

### Art outside panel boundaries

Do not crop tightly. Expand the camera region or show multiple connected regions.

### Speech bubble merged with panel border

Use camera framing over the full page. Do not depend on separating the bubble from the panel.

### Character spanning multiple panels

Show both relevant panels first, then move into the next story beat.

### Irregular panel layouts

Manual camera editing should always be available, even after automatic detection exists.

## 9. Success Criteria

The project is successful if a user can take one comic page and create a short cinematic sequence that feels intentional, readable, and visually smooth.

Technical success means:

- The source image remains intact.
- Camera shots are editable.
- Timeline order is clear.
- Preview accurately reflects shot data.
- The system is extensible for future rendering/export.

