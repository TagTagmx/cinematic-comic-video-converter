import type {
  BackgroundAudioMetadata,
  BackgroundAudioSettings,
  CameraShot,
  FocusRegion,
  FocusRegionEffectType,
  FocusRegionKind,
  GuidedPageOptions,
  ProjectImageMetadata,
  ReadingPurpose,
  ShotAttentionEffectCues,
  ShotAttentionMotionRole,
  ShotAttentionPathItem,
  ShotEffectCueMode,
  ShotEffectCueTiming,
  ShotSpecialEffects,
  ShotStartFraming,
  SoundEffectMarkerMetadata,
  TransitionPurpose,
} from "./projectTypes";

const SUPPORTED_SCHEMA_VERSION = 1;
const DEFAULT_SHOT_DURATION_MS = 2500;
const FOCUS_REGION_KINDS: FocusRegionKind[] = [
  "panel",
  "speech",
  "face",
  "detail",
  "action",
  "other",
];
const FOCUS_REGION_EFFECT_TYPES: FocusRegionEffectType[] = [
  "lift",
  "spotlight",
  "zoom",
  "none",
];
const READING_PURPOSES: ReadingPurpose[] = [
  "establishing",
  "panel",
  "dialogue",
  "reaction",
  "emotion",
  "action",
  "detail",
  "reveal",
  "transition",
  "other",
];
const TRANSITION_PURPOSES: TransitionPurpose[] = [
  "orientation",
  "reading",
  "cinematic",
  "sceneChange",
];
const SHOT_ATTENTION_MOTION_ROLES: ShotAttentionMotionRole[] = [
  "hold",
  "pushIn",
  "pushOut",
  "track",
  "reveal",
  "emphasis",
];
const SHOT_START_FRAMINGS: ShotStartFraming[] = [
  "establishShot",
  "firstFocus",
];
const SHOT_EFFECT_CUE_MODES: ShotEffectCueMode[] = ["once", "repeat"];
const SHOT_EFFECT_CUE_TIMINGS: ShotEffectCueTiming[] = [
  "early",
  "arrival",
];

const DEFAULT_BACKGROUND_AUDIO_SETTINGS: BackgroundAudioSettings = {
  enabled: true,
  trimStartMs: 0,
  trimEndMs: 0,
  loop: true,
  fadeInMs: 0,
  fadeOutMs: 0,
  volume: 0.8,
};

export type ImportedBackgroundAudio = BackgroundAudioMetadata & {
  settings: BackgroundAudioSettings;
};

export type ImportedProjectData = {
  image: ProjectImageMetadata | null;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  guidedPageOptions: GuidedPageOptions;
  backgroundAudio: ImportedBackgroundAudio | null;
  soundEffectMarkers: SoundEffectMarkerMetadata[];
};

export function parseProjectImportData(value: unknown): ImportedProjectData {
  if (!isRecord(value)) {
    throw new Error("Project JSON must contain an object.");
  }

  if (value.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported project schema version. Expected version ${SUPPORTED_SCHEMA_VERSION}.`,
    );
  }

  if (!Array.isArray(value.cameraShots)) {
    throw new Error("Project JSON must include a cameraShots array.");
  }

  if (!Array.isArray(value.focusRegions)) {
    throw new Error("Project JSON must include a focusRegions array.");
  }

  return {
    image: parseImageMetadata(value.image),
    cameraShots: value.cameraShots.map(parseCameraShot),
    focusRegions: value.focusRegions.map(parseFocusRegion),
    guidedPageOptions: parseGuidedPageOptions(value.guidedPageOptions),
    backgroundAudio: parseBackgroundAudio(value.backgroundAudio),
    soundEffectMarkers: parseSoundEffectMarkers(value.soundEffectMarkers),
  };
}

function parseImageMetadata(value: unknown): ProjectImageMetadata | null {
  if (!isRecord(value)) {
    return null;
  }

  if (!isPositiveFiniteNumber(value.width) || !isPositiveFiniteNumber(value.height)) {
    return null;
  }

  return {
    fileName: typeof value.fileName === "string" ? value.fileName : "Imported image",
    width: Math.round(value.width),
    height: Math.round(value.height),
    mimeType: typeof value.mimeType === "string" ? value.mimeType : "",
  };
}

function parseCameraShot(value: unknown, index: number): CameraShot {
  if (!isRecord(value)) {
    throw new Error(`Camera shot ${index + 1} must be an object.`);
  }

  if (typeof value.id !== "string" || value.id.trim() === "") {
    throw new Error(`Camera shot ${index + 1} must include an id.`);
  }

  const x = readFiniteNumber(value.x, `Camera shot ${index + 1} x`);
  const y = readFiniteNumber(value.y, `Camera shot ${index + 1} y`);
  const width = readPositiveFiniteNumber(
    value.width,
    `Camera shot ${index + 1} width`,
  );
  const height = readPositiveFiniteNumber(
    value.height,
    `Camera shot ${index + 1} height`,
  );
  const durationMs = isPositiveFiniteNumber(value.durationMs)
    ? Math.round(value.durationMs)
    : DEFAULT_SHOT_DURATION_MS;

  return {
    id: value.id,
    label: typeof value.label === "string" ? value.label : `Shot ${index + 1}`,
    x,
    y,
    width,
    height,
    durationMs,
    shotPurpose: readReadingPurpose(value.shotPurpose),
    outgoingTransitionPurpose: readTransitionPurpose(
      value.outgoingTransitionPurpose,
    ),
    attentionPath: parseAttentionPath(value.attentionPath),
    shotStartFraming: readShotStartFraming(value.shotStartFraming),
    specialEffects: parseShotSpecialEffects(value.specialEffects),
    sceneHoldRatio: readOptionalRatio(value.sceneHoldRatio),
    focusAttentionRatio: readOptionalRatio(value.focusAttentionRatio),
  };
}

function parseShotSpecialEffects(value: unknown): ShotSpecialEffects | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const specialEffects: ShotSpecialEffects = {
    shake: value.shake === true ? true : undefined,
    impactPulse: value.impactPulse === true ? true : undefined,
  };

  return specialEffects.shake || specialEffects.impactPulse
    ? specialEffects
    : undefined;
}

function parseAttentionPath(value: unknown): ShotAttentionPathItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const attentionPath = value.flatMap((item) => {
    const parsedItem = parseAttentionPathItem(item);

    return parsedItem ? [parsedItem] : [];
  });

  return attentionPath.length > 0 ? attentionPath : undefined;
}

function parseAttentionPathItem(value: unknown): ShotAttentionPathItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || value.id.trim() === "") {
    return null;
  }

  if (
    typeof value.focusRegionId !== "string" ||
    value.focusRegionId.trim() === ""
  ) {
    return null;
  }

  if (!isPositiveFiniteNumber(value.order)) {
    return null;
  }

  const order = Math.round(value.order);
  const durationWeight = isPositiveFiniteNumber(value.durationWeight)
    ? value.durationWeight
    : undefined;

  return {
    id: value.id,
    focusRegionId: value.focusRegionId,
    order,
    motionRole: readShotAttentionMotionRole(value.motionRole),
    durationWeight,
    effectCues: parseShotAttentionEffectCues(value.effectCues),
    effectCueTiming: readShotEffectCueTiming(value.effectCueTiming),
  };
}

function parseShotAttentionEffectCues(
  value: unknown,
): ShotAttentionEffectCues | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const effectCues: ShotAttentionEffectCues = {
    shake: readShotEffectCueMode(value.shake),
    impactPulse: readShotEffectCueMode(value.impactPulse),
  };

  return effectCues.shake || effectCues.impactPulse ? effectCues : undefined;
}

function parseFocusRegion(value: unknown, index: number): FocusRegion {
  if (!isRecord(value)) {
    throw new Error(`Focus region ${index + 1} must be an object.`);
  }

  if (typeof value.id !== "string" || value.id.trim() === "") {
    throw new Error(`Focus region ${index + 1} must include an id.`);
  }

  const x = readFiniteNumber(value.x, `Focus region ${index + 1} x`);
  const y = readFiniteNumber(value.y, `Focus region ${index + 1} y`);
  const width = readPositiveFiniteNumber(
    value.width,
    `Focus region ${index + 1} width`,
  );
  const height = readPositiveFiniteNumber(
    value.height,
    `Focus region ${index + 1} height`,
  );
  const sequenceOrder = isPositiveFiniteNumber(value.sequenceOrder)
    ? Math.round(value.sequenceOrder)
    : undefined;

  return {
    id: value.id,
    label: typeof value.label === "string" ? value.label : `Focus ${index + 1}`,
    description:
      typeof value.description === "string" ? value.description : undefined,
    kind: readFocusRegionKind(value.kind),
    focusPurpose: readReadingPurpose(value.focusPurpose),
    effectType: readFocusRegionEffectType(value.effectType),
    sequenceOrder,
    x,
    y,
    width,
    height,
    sourceShotId:
      typeof value.sourceShotId === "string" ? value.sourceShotId : undefined,
  };
}

function parseGuidedPageOptions(value: unknown): GuidedPageOptions {
  if (!isRecord(value)) {
    return {
      showPageEnter: false,
      showPageExit: false,
    };
  }

  return {
    showPageEnter: value.showPageEnter === true,
    showPageExit: value.showPageExit === true,
  };
}

function parseBackgroundAudio(value: unknown): ImportedBackgroundAudio | null {
  if (!isRecord(value)) {
    return null;
  }

  if (!isPositiveFiniteNumber(value.durationMs)) {
    return null;
  }

  return {
    fileName:
      typeof value.fileName === "string" ? value.fileName : "Background audio",
    durationMs: Math.round(value.durationMs),
    mimeType: typeof value.mimeType === "string" ? value.mimeType : "",
    settings: parseBackgroundAudioSettings(value.settings, value.durationMs),
  };
}

function parseBackgroundAudioSettings(
  value: unknown,
  durationMs: number,
): BackgroundAudioSettings {
  if (!isRecord(value)) {
    return {
      ...DEFAULT_BACKGROUND_AUDIO_SETTINGS,
      trimEndMs: Math.round(durationMs),
    };
  }

  const trimStartMs = readOptionalMilliseconds(value.trimStartMs, 0);
  const trimEndMs = Math.min(
    readOptionalMilliseconds(value.trimEndMs, durationMs),
    Math.round(durationMs),
  );
  const fadeInMs = readOptionalMilliseconds(value.fadeInMs, 0);
  const fadeOutMs = readOptionalMilliseconds(value.fadeOutMs, 0);

  return {
    enabled: value.enabled !== false,
    trimStartMs: Math.min(trimStartMs, Math.max(0, durationMs - 1)),
    trimEndMs: Math.max(trimEndMs, trimStartMs + 1),
    loop: value.loop !== false,
    fadeInMs,
    fadeOutMs,
    volume: readOptionalVolume(value.volume),
  };
}

function parseSoundEffectMarkers(value: unknown): SoundEffectMarkerMetadata[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, index) => {
    const marker = parseSoundEffectMarker(item, index);

    return marker ? [marker] : [];
  });
}

function parseSoundEffectMarker(
  value: unknown,
  index: number,
): SoundEffectMarkerMetadata | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || value.id.trim() === "") {
    return null;
  }

  if (
    typeof value.targetShotId !== "string" ||
    value.targetShotId.trim() === ""
  ) {
    return null;
  }

  if (!isPositiveFiniteNumber(value.durationMs)) {
    return null;
  }

  return {
    id: value.id,
    label:
      typeof value.label === "string" && value.label.trim()
        ? value.label
        : `SFX ${index + 1}`,
    targetShotId: value.targetShotId,
    offsetMs: readOptionalMilliseconds(value.offsetMs, 0),
    playDurationMs: readOptionalMilliseconds(
      value.playDurationMs,
      value.durationMs,
    ),
    shotSpan: isPositiveFiniteNumber(value.shotSpan)
      ? Math.max(1, Math.round(value.shotSpan))
      : 1,
    volume: readOptionalVolume(value.volume),
    fileName:
      typeof value.fileName === "string" && value.fileName.trim()
        ? value.fileName
        : `SFX ${index + 1}`,
    durationMs: Math.round(value.durationMs),
    mimeType: typeof value.mimeType === "string" ? value.mimeType : "",
  };
}

function readReadingPurpose(value: unknown): ReadingPurpose | undefined {
  return typeof value === "string" && READING_PURPOSES.includes(value as ReadingPurpose)
    ? (value as ReadingPurpose)
    : undefined;
}

function readTransitionPurpose(value: unknown): TransitionPurpose | undefined {
  return typeof value === "string" &&
    TRANSITION_PURPOSES.includes(value as TransitionPurpose)
    ? (value as TransitionPurpose)
    : undefined;
}

function readShotAttentionMotionRole(
  value: unknown,
): ShotAttentionMotionRole | undefined {
  return typeof value === "string" &&
    SHOT_ATTENTION_MOTION_ROLES.includes(value as ShotAttentionMotionRole)
    ? (value as ShotAttentionMotionRole)
    : undefined;
}

function readShotStartFraming(value: unknown): ShotStartFraming | undefined {
  return typeof value === "string" &&
    SHOT_START_FRAMINGS.includes(value as ShotStartFraming)
    ? (value as ShotStartFraming)
    : undefined;
}

function readShotEffectCueMode(value: unknown): ShotEffectCueMode | undefined {
  return typeof value === "string" &&
    SHOT_EFFECT_CUE_MODES.includes(value as ShotEffectCueMode)
    ? (value as ShotEffectCueMode)
    : undefined;
}

function readShotEffectCueTiming(
  value: unknown,
): ShotEffectCueTiming | undefined {
  return typeof value === "string" &&
    SHOT_EFFECT_CUE_TIMINGS.includes(value as ShotEffectCueTiming)
    ? (value as ShotEffectCueTiming)
    : undefined;
}

function readFocusRegionKind(value: unknown): FocusRegionKind {
  return typeof value === "string" &&
    FOCUS_REGION_KINDS.includes(value as FocusRegionKind)
    ? (value as FocusRegionKind)
    : "other";
}

function readFocusRegionEffectType(
  value: unknown,
): FocusRegionEffectType | undefined {
  return typeof value === "string" &&
    FOCUS_REGION_EFFECT_TYPES.includes(value as FocusRegionEffectType)
    ? (value as FocusRegionEffectType)
    : undefined;
}

function readOptionalRatio(value: unknown) {
  if (!isFiniteNumber(value)) {
    return undefined;
  }

  return Math.min(Math.max(value, 0), 0.7);
}

function readOptionalMilliseconds(value: unknown, fallback: number) {
  return isFiniteNumber(value) ? Math.max(0, Math.round(value)) : Math.round(fallback);
}

function readOptionalVolume(value: unknown) {
  return isFiniteNumber(value) ? Math.min(Math.max(value, 0), 1) : 0.8;
}

function readFiniteNumber(value: unknown, fieldName: string) {
  if (!isFiniteNumber(value)) {
    throw new Error(`${fieldName} must be a finite number.`);
  }

  return Math.round(value);
}

function readPositiveFiniteNumber(value: unknown, fieldName: string) {
  if (!isPositiveFiniteNumber(value)) {
    throw new Error(`${fieldName} must be a positive finite number.`);
  }

  return Math.round(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}
