export type ProjectImageMetadata = {
  fileName: string;
  width: number;
  height: number;
  mimeType: string;
};

export type UploadedImage = ProjectImageMetadata & {
  objectUrl: string;
};

export type BackgroundAudioMetadata = {
  fileName: string;
  durationMs: number;
  mimeType: string;
};

export type BackgroundAudioSettings = {
  enabled: boolean;
  trimStartMs: number;
  trimEndMs: number;
  loop: boolean;
  fadeInMs: number;
  fadeOutMs: number;
  volume: number;
};

export type UploadedBackgroundAudio = BackgroundAudioMetadata & {
  objectUrl: string;
  settings: BackgroundAudioSettings;
};

export type SoundEffectMarkerMetadata = {
  id: string;
  label: string;
  targetShotId: string;
  offsetMs: number;
  playDurationMs: number;
  shotSpan: number;
  volume: number;
  fileName: string;
  durationMs: number;
  mimeType: string;
};

export type UploadedSoundEffectMarker = SoundEffectMarkerMetadata & {
  objectUrl: string;
};

export type FocusRegionKind =
  | "panel"
  | "speech"
  | "face"
  | "detail"
  | "action"
  | "other";

export type FocusRegionEffectType = "lift" | "spotlight" | "zoom" | "none";

export type ReadingPurpose =
  | "establishing"
  | "panel"
  | "dialogue"
  | "reaction"
  | "emotion"
  | "action"
  | "detail"
  | "reveal"
  | "transition"
  | "other";

export type TransitionPurpose =
  | "orientation"
  | "reading"
  | "cinematic"
  | "sceneChange";

export type ActiveShotAttentionMotionRole = "track" | "pushIn" | "pushOut";

export type LegacyShotAttentionMotionRole = "hold" | "reveal" | "emphasis";

export type ShotAttentionMotionRole =
  | ActiveShotAttentionMotionRole
  | LegacyShotAttentionMotionRole;

export type ShotStartFraming = "establishShot" | "firstFocus";

export type ShotSpecialEffects = {
  shake?: boolean;
  impactPulse?: boolean;
};

export type ShotEffectCueMode = "once" | "repeat";
export type ShotEffectCueTiming = "early" | "arrival";

export type ShotAttentionEffectCues = {
  shake?: ShotEffectCueMode;
  impactPulse?: ShotEffectCueMode;
};

export type ShotAttentionPathItem = {
  id: string;
  focusRegionId: string;
  order: number;
  motionRole?: ShotAttentionMotionRole;
  durationWeight?: number;
  effectCues?: ShotAttentionEffectCues;
  effectCueTiming?: ShotEffectCueTiming;
};

export type GuidedPageOptions = {
  showPageEnter: boolean;
  showPageExit: boolean;
};

export type FocusRegion = {
  id: string;
  sourceShotId?: string;
  label: string;
  description?: string;
  kind: FocusRegionKind;
  focusPurpose?: ReadingPurpose;
  effectType?: FocusRegionEffectType;
  sequenceOrder?: number;
  // Coordinates use source image coordinate space and are intentionally free-ratio.
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CameraShot = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  durationMs: number;
  shotPurpose?: ReadingPurpose;
  // Describes the transition from this shot to the next shot.
  outgoingTransitionPurpose?: TransitionPurpose;
  // Ordered references to page-level focus regions for future intra-shot attention/motion.
  attentionPath?: ShotAttentionPathItem[];
  shotStartFraming?: ShotStartFraming;
  specialEffects?: ShotSpecialEffects;
  sceneHoldRatio?: number;
  focusAttentionRatio?: number;
};
