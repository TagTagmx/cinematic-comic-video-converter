import type { CameraShot, FocusRegion, UploadedImage } from "./projectTypes";

const MIN_CAMERA_SHOT_WIDTH = 160;
const MIN_CAMERA_SHOT_HEIGHT = 90;

export function createDefaultCameraShot(
  image: UploadedImage,
  id = `shot-${Date.now()}`,
  label = "Shot 1",
): CameraShot {
  const { width, height } = getDefaultCameraShotSize(image);

  return {
    id,
    label,
    x: Math.round((image.width - width) / 2),
    y: Math.round((image.height - height) / 2),
    width,
    height,
    durationMs: 2500,
    sceneHoldRatio: 0.1,
    focusAttentionRatio: 0.6,
  };
}

export function createOffsetCameraShot(
  image: UploadedImage,
  baseShot: CameraShot,
  id: string,
  label: string,
): CameraShot {
  const offset = Math.max(24, Math.round(Math.min(image.width, image.height) * 0.06));
  const width = Math.min(Math.max(1, Math.round(baseShot.width)), image.width);
  const height = Math.min(Math.max(1, Math.round(baseShot.height)), image.height);

  return clampCameraShotToImage(
    {
      ...baseShot,
      id,
      label,
      width,
      height,
      x: baseShot.x + offset,
      y: baseShot.y + offset,
    },
    image,
  );
}

export function clientPointToSourcePoint(
  clientX: number,
  clientY: number,
  displayRect: DOMRect,
  image: UploadedImage,
) {
  return {
    x: ((clientX - displayRect.left) / displayRect.width) * image.width,
    y: ((clientY - displayRect.top) / displayRect.height) * image.height,
  };
}

export function clampCameraShotToImage(
  shot: CameraShot,
  image: UploadedImage,
): CameraShot {
  const width = clamp(Math.round(shot.width), 1, image.width);
  const height = clamp(Math.round(shot.height), 1, image.height);
  const maxX = Math.max(0, image.width - width);
  const maxY = Math.max(0, image.height - height);

  return {
    ...shot,
    width,
    height,
    x: clamp(Math.round(shot.x), 0, maxX),
    y: clamp(Math.round(shot.y), 0, maxY),
  };
}

export function getPreviewShotPlacement(
  shot: CameraShot,
  image: UploadedImage,
  viewportWidth: number,
  viewportHeight: number,
) {
  const safeShotWidth = Math.max(1, shot.width);
  const safeShotHeight = Math.max(1, shot.height);
  const scale = Math.min(
    viewportWidth / safeShotWidth,
    viewportHeight / safeShotHeight,
  );
  const shotWindowWidth = safeShotWidth * scale;
  const shotWindowHeight = safeShotHeight * scale;
  const shotWindowX = (viewportWidth - shotWindowWidth) / 2;
  const shotWindowY = (viewportHeight - shotWindowHeight) / 2;

  return {
    scale,
    shotWindowWidth,
    shotWindowHeight,
    shotWindowX,
    shotWindowY,
    imageWidth: image.width * scale,
    imageHeight: image.height * scale,
    imageX: -shot.x * scale,
    imageY: -shot.y * scale,
  };
}

export function getRectangleIntersectionArea(
  first: Pick<CameraShot | FocusRegion, "x" | "y" | "width" | "height">,
  second: Pick<CameraShot | FocusRegion, "x" | "y" | "width" | "height">,
) {
  const left = Math.max(first.x, second.x);
  const top = Math.max(first.y, second.y);
  const right = Math.min(first.x + first.width, second.x + second.width);
  const bottom = Math.min(first.y + first.height, second.y + second.height);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  return width * height;
}

export function getFocusRegionInclusionRatio(
  cameraShot: CameraShot,
  focusRegion: FocusRegion,
) {
  const focusRegionArea = Math.max(0, focusRegion.width * focusRegion.height);

  if (focusRegionArea === 0) {
    return 0;
  }

  return getRectangleIntersectionArea(cameraShot, focusRegion) / focusRegionArea;
}

export function resizeCameraShotFromBottomRight(
  shot: CameraShot,
  image: UploadedImage,
  sourceX: number,
  sourceY: number,
): CameraShot {
  const maxWidth = Math.max(1, image.width - shot.x);
  const maxHeight = Math.max(1, image.height - shot.y);
  const minimumWidth = Math.min(MIN_CAMERA_SHOT_WIDTH, maxWidth);
  const minimumHeight = Math.min(MIN_CAMERA_SHOT_HEIGHT, maxHeight);
  const width = clamp(Math.round(sourceX - shot.x), minimumWidth, maxWidth);
  const height = clamp(Math.round(sourceY - shot.y), minimumHeight, maxHeight);

  return {
    ...shot,
    width,
    height,
  };
}

function getDefaultCameraShotSize(image: UploadedImage) {
  return {
    width: Math.max(1, Math.round(image.width * 0.6)),
    height: Math.max(1, Math.round(image.height * 0.6)),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
