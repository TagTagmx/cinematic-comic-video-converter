# MVP Technical Design

## 1. MVP Objective

Build a browser-based manual cinematic editor for one comic page image.

The MVP should not attempt full automation. It should prove the core interaction:

> Upload page -> define camera shots -> preview cinematic movement.

## 2. Suggested Frontend Stack

- Vite
- React
- TypeScript
- CSS modules or plain CSS to start
- No heavy UI framework unless needed

## 3. Suggested Folder Structure

```txt
src/
  app/
    App.tsx
  features/
    upload/
      ImageUploader.tsx
    editor/
      PageEditor.tsx
      CameraBoxOverlay.tsx
      ShotInspector.tsx
    timeline/
      Timeline.tsx
    preview/
      PreviewPlayer.tsx
  lib/
    projectTypes.ts
    coordinateMath.ts
    sampleProject.ts
  styles/
    global.css
```

This structure can change if needed, but changes should be documented in `Repo_Current_State.md`.

## 4. State Model

Store project state in React first. Avoid backend storage in the MVP.

Minimum state:

```ts
type AppState = {
  page: ComicPage | null;
  shots: CameraShot[];
  selectedShotId: string | null;
};
```

Later, this can become a full `ComicProject`.

## 5. Coordinate System

All camera shot coordinates should use source image coordinates.

Example:

If the uploaded image is 2400 x 3600 and a shot covers the upper-left quarter:

```json
{
  "x": 0,
  "y": 0,
  "width": 1200,
  "height": 1800
}
```

The editor may display the image smaller on screen, but stored coordinates should remain based on the real image size.

## 6. Camera Shot Rules

A camera shot rectangle should:

- Stay within the image bounds.
- Have a minimum width and height.
- Be selectable.
- Be draggable.
- Eventually be resizable.

For the earliest ticket, only one fixed-size draggable box is acceptable.

## 7. Preview Strategy

For MVP preview, use CSS transforms or canvas rendering.

Basic approach:

1. Render the source image inside a fixed 16:9 preview viewport.
2. For each shot, calculate how to scale and translate the image so the shot fills the viewport.
3. Animate from one shot transform to the next.
4. Use simple easing.

The preview does not need to export MP4 yet.

## 8. Project JSON

Eventually support exporting/importing JSON.

Draft format:

```json
{
  "version": 1,
  "title": "Untitled Comic Project",
  "page": {
    "id": "page-1",
    "imageName": "comic-page.png",
    "width": 2400,
    "height": 3600
  },
  "shots": [
    {
      "id": "shot-1",
      "label": "Opening panel",
      "x": 100,
      "y": 200,
      "width": 900,
      "height": 700,
      "durationMs": 2500,
      "movement": "hold",
      "easing": "easeInOut"
    }
  ]
}
```

## 9. MVP Non-Goals

Do not build these in the MVP unless specifically ticketed:

- Account system
- Cloud save
- Backend upload
- MP4 export
- AI panel detection
- OCR
- Audio editing
- Multi-page sequencing
- Mobile optimization
- Advanced visual effects

## 10. Acceptance Standard

The MVP is acceptable when:

1. A user can upload one image.
2. The image appears in the editor.
3. The user can create at least two camera shots.
4. The shots can be arranged in a timeline.
5. A preview can animate between those shots.
6. Project state can be inspected or exported as JSON.

