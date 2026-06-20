import type {
  BackgroundAudioMetadata,
  CameraShot,
  FocusRegion,
  GuidedPageOptions,
  ShotAttentionPathItem,
  SoundEffectMarkerMetadata,
  UploadedBackgroundAudio,
  UploadedImage,
} from "./projectTypes";

const PROJECT_SCHEMA_VERSION = 1;
const IMAGE_BINARY_NOTE =
  "Image binary data is not included. Re-select the source image when reopening this project.";
const AUDIO_BINARY_NOTE =
  "Audio binary data is not included. Re-select the background audio when reopening this project.";
const SFX_BINARY_NOTE =
  "Sound effect audio data is not included. Re-select or use a project archive to restore SFX files.";

export function createProjectExportData({
  image,
  cameraShots,
  focusRegions,
  guidedPageOptions,
  backgroundAudio,
  soundEffectMarkers,
  exportedAt,
}: {
  image: UploadedImage;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  guidedPageOptions?: GuidedPageOptions;
  backgroundAudio?: UploadedBackgroundAudio | null;
  soundEffectMarkers?: SoundEffectMarkerMetadata[];
  exportedAt: string;
}) {
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    exportedAt,
    guidedPageOptions,
    image: {
      fileName: image.fileName,
      width: image.width,
      height: image.height,
      mimeType: image.mimeType || null,
      binaryIncluded: false,
      note: IMAGE_BINARY_NOTE,
    },
    backgroundAudio: backgroundAudio
      ? createBackgroundAudioExportData(backgroundAudio)
      : null,
    soundEffectMarkers: (soundEffectMarkers ?? []).map((marker) => ({
      id: marker.id,
      label: marker.label,
      targetShotId: marker.targetShotId,
      offsetMs: marker.offsetMs,
      playDurationMs: marker.playDurationMs,
      shotSpan: marker.shotSpan,
      volume: marker.volume,
      fileName: marker.fileName,
      durationMs: marker.durationMs,
      mimeType: marker.mimeType || "",
      binaryIncluded: false,
      note: SFX_BINARY_NOTE,
    })),
    cameraShots: cameraShots.map((shot) => ({
      id: shot.id,
      label: shot.label,
      x: shot.x,
      y: shot.y,
      width: shot.width,
      height: shot.height,
      durationMs: shot.durationMs,
      shotPurpose: shot.shotPurpose,
      outgoingTransitionPurpose: shot.outgoingTransitionPurpose,
      attentionPath: shot.attentionPath?.map((item) => ({
        id: item.id,
        focusRegionId: item.focusRegionId,
        order: item.order,
        motionRole: item.motionRole,
        durationWeight: item.durationWeight,
        effectCues: createAttentionEffectCuesExportData(item),
        effectCueTiming: item.effectCues ? item.effectCueTiming : undefined,
      })),
      shotStartFraming: shot.shotStartFraming,
      specialEffects: createShotSpecialEffectsExportData(shot),
      sceneHoldRatio: shot.sceneHoldRatio,
      focusAttentionRatio: shot.focusAttentionRatio,
    })),
    focusRegions: focusRegions.map((region) => ({
      id: region.id,
      label: region.label,
      description: region.description,
      kind: region.kind,
      focusPurpose: region.focusPurpose,
      effectType: region.effectType,
      sequenceOrder: region.sequenceOrder,
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      sourceShotId: region.sourceShotId,
    })),
  };
}

function createAttentionEffectCuesExportData(item: ShotAttentionPathItem) {
  const effectCues = {
    shake: item.effectCues?.shake,
    impactPulse: item.effectCues?.impactPulse,
  };

  return effectCues.shake || effectCues.impactPulse ? effectCues : undefined;
}

function createShotSpecialEffectsExportData(shot: CameraShot) {
  const specialEffects = {
    shake: shot.specialEffects?.shake === true ? true : undefined,
    impactPulse:
      shot.specialEffects?.impactPulse === true ? true : undefined,
  };

  return specialEffects.shake || specialEffects.impactPulse
    ? specialEffects
    : undefined;
}

export function createBackgroundAudioExportData(audio: UploadedBackgroundAudio): BackgroundAudioMetadata & {
  settings: UploadedBackgroundAudio["settings"];
  binaryIncluded: boolean;
  note: string;
} {
  return {
    fileName: audio.fileName,
    durationMs: audio.durationMs,
    mimeType: audio.mimeType || "",
    settings: audio.settings,
    binaryIncluded: false,
    note: AUDIO_BINARY_NOTE,
  };
}

export function createProjectExportFileName(image: UploadedImage) {
  const extensionlessName = image.fileName.replace(/\.[^.]+$/, "");
  const safeBaseName = extensionlessName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeBaseName || "cinematic-comic"}-project.json`;
}
