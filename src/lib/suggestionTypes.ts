import type {
  ActiveShotAttentionMotionRole,
  CameraShot,
  FocusRegion,
} from "./projectTypes";

export type SuggestionSource =
  | "manualDraft"
  | "smartCameraPath"
  | "aiDirectorDraft";
export type SuggestionConfidence = "unknown" | "medium";
export type SuggestionStatus = "visible";

type BaseTemporarySuggestion = {
  id: string;
  source: SuggestionSource;
  confidence: SuggestionConfidence;
  reason: string;
  status: SuggestionStatus;
  createdAt: string;
};

export type CameraShotSuggestionValues = Pick<
  CameraShot,
  | "label"
  | "x"
  | "y"
  | "width"
  | "height"
  | "durationMs"
  | "shotPurpose"
  | "sceneHoldRatio"
  | "focusAttentionRatio"
>;

export type FocusRegionSuggestionValues = Pick<
  FocusRegion,
  | "label"
  | "kind"
  | "x"
  | "y"
  | "width"
  | "height"
  | "sourceShotId"
  | "effectType"
  | "sequenceOrder"
>;

export type ShotAttentionPathSuggestionValues = {
  targetShotId: string;
  targetShotLabel: string;
  pathItems: ShotAttentionPathDraftItem[];
  focusRegionIds?: string[];
};

export type DraftMotionSuggestionValues = {
  label: string;
  cameraShot: CameraShotSuggestionValues;
  focusRegions: DraftMotionFocusRegionValues[];
  pathItems: ShotAttentionPathDraftItem[];
};

export type DraftMotionFocusRegionValues = FocusRegionSuggestionValues & {
  draftFocusRegionId: string;
  description?: string;
};

export type ShotAttentionPathDraftItem = {
  focusRegionId: string;
  motionRole: ActiveShotAttentionMotionRole;
  durationWeight: number;
  reason: string;
};

export type CameraShotSuggestion = BaseTemporarySuggestion & {
  type: "cameraShot";
  proposedValues: CameraShotSuggestionValues;
  editedDraftValues?: Partial<CameraShotSuggestionValues>;
};

export type FocusRegionSuggestion = BaseTemporarySuggestion & {
  type: "focusRegion";
  proposedValues: FocusRegionSuggestionValues;
  editedDraftValues?: Partial<FocusRegionSuggestionValues>;
};

export type ShotAttentionPathSuggestion = BaseTemporarySuggestion & {
  type: "shotAttentionPath";
  proposedValues: ShotAttentionPathSuggestionValues;
  editedDraftValues?: Partial<ShotAttentionPathSuggestionValues>;
};

export type DraftMotionSuggestion = BaseTemporarySuggestion & {
  type: "draftMotion";
  proposedValues: DraftMotionSuggestionValues;
  editedDraftValues?: Partial<DraftMotionSuggestionValues>;
};

export type TemporarySuggestion =
  | CameraShotSuggestion
  | FocusRegionSuggestion
  | ShotAttentionPathSuggestion
  | DraftMotionSuggestion;
