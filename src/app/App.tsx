import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, RefObject } from "react";
import { PageViewer } from "../features/editor/PageViewer";
import type { AiPageHighlight } from "../features/editor/PageViewer";
import { PreviewPlayer } from "../features/preview/PreviewPlayer";
import { ShotInspector } from "../features/editor/ShotInspector";
import { Timeline } from "../features/timeline/Timeline";
import { ImageUploader } from "../features/upload/ImageUploader";
import {
  createDefaultCameraShot,
  createOffsetCameraShot,
  getFocusRegionInclusionRatio,
} from "../lib/coordinateMath";
import {
  createProjectExportData,
  createProjectExportFileName,
} from "../lib/projectExport";
import {
  createProjectArchiveData,
  createProjectArchiveFileName,
  parseProjectArchiveData,
} from "../lib/projectArchive";
import { parseProjectImportData } from "../lib/projectImport";
import type { ImportedBackgroundAudio } from "../lib/projectImport";
import {
  DEFAULT_VIDEO_EXPORT_SETTINGS,
  exportVideoPrototype,
  getVideoExportFormatSupportMessage,
} from "../lib/canvasVideoExport";
import type {
  ExportVideoProgress,
  ExportVideoSettings,
} from "../lib/canvasVideoExport";
import type {
  ActiveShotAttentionMotionRole,
  BackgroundAudioSettings,
  CameraShot,
  FocusRegion,
  GuidedPageOptions,
  ProjectImageMetadata,
  ShotAttentionPathItem,
  SoundEffectMarkerMetadata,
  UploadedBackgroundAudio,
  UploadedImage,
  UploadedSoundEffectMarker,
} from "../lib/projectTypes";
import type {
  AiDirectorSuggestionsResult,
  AiPageUnderstandingGeometry,
  AiPageUnderstandingResult,
  AiPageUnderstandingRegion,
  AnalyzePageRequest,
  GenerateAiDirectorSuggestionsRequest,
} from "../lib/aiPageUnderstanding";
import {
  normalizeAiDirectorSuggestionsResult,
  normalizeAiPageUnderstandingResult,
} from "../lib/aiPageUnderstanding";
import {
  createDirectorRulebookAcceptedContext,
  formatDirectorRuleWarning,
  getDirectorBeatTypeFromText,
  getRecommendedMotionForBeat,
  getTimingHintForBeat,
} from "../lib/directorRulebook";
import type { DirectorBeatType } from "../lib/directorRulebook";
import type { TemporarySuggestion } from "../lib/suggestionTypes";
import type {
  DraftMotionFocusRegionValues,
  ShotAttentionPathDraftItem,
} from "../lib/suggestionTypes";

type ExportResolutionOption = "720p" | "1080p";
type ExportFpsOption = "24" | "30";

const VIDEO_EXPORT_RESOLUTION_OPTIONS: Record<
  ExportResolutionOption,
  Pick<ExportVideoSettings, "width" | "height">
> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
};

const VIDEO_EXPORT_FPS_OPTIONS: Record<ExportFpsOption, number> = {
  "24": 24,
  "30": 30,
};

const DEFAULT_GUIDED_PAGE_OPTIONS: GuidedPageOptions = {
  showPageEnter: false,
  showPageExit: false,
};
const DEFAULT_BACKGROUND_AUDIO_SETTINGS: BackgroundAudioSettings = {
  enabled: true,
  trimStartMs: 0,
  trimEndMs: 0,
  loop: true,
  fadeInMs: 0,
  fadeOutMs: 0,
  volume: 0.8,
};
const FOCUS_REGION_INCLUSION_THRESHOLD = 0.6;
const LEGACY_EXPORT_FOCUS_TREATMENT_STYLE = "cinematic-dim";
const AI_CAMERA_MAX_REVIEW_CARDS_PER_PAGE = 8;
const AI_CAMERA_ORDINARY_PANEL_CARD_LIMIT = 1;
const AI_CAMERA_COMPLEX_PANEL_CARD_LIMIT = 2;
const AI_CAMERA_DENSE_PANEL_CARD_LIMIT = 3;
const AI_CAMERA_MAX_SUPPORTING_TARGETS = 2;
const DRAFT_MOTION_MAX_FOCUS_TARGETS = 2;
const DRAFT_MOTION_TARGET_COVERED_RATIO = 0.72;
const DRAFT_MOTION_TARGET_LARGE_AREA_RATIO = 0.52;
const DRAFT_MOTION_PATH_ITEM_EXTRA_DURATION_MS = 650;
const DRAFT_MOTION_CAMERA_MOVE_EXTRA_DURATION_MS = 450;
const AI_CAMERA_REDUNDANT_TARGET_OVERLAP_RATIO = 0.72;
const AI_CAMERA_CLUSTER_OVERLAP_RATIO = 0.32;
const AI_CAMERA_CLUSTER_CONTAINMENT_RATIO = 0.68;
const AI_CAMERA_CLUSTER_CENTER_DISTANCE_RATIO = 0.28;
const AI_CAMERA_REDUNDANT_CENTER_DISTANCE_RATIO = 0.18;
const AI_AUDIO_MAX_NOTES = 8;
const DIRECTOR_RULEBOOK_SOURCE_LABEL = "Director Rulebook v1";

type AiDirectorSuggestion = {
  id: string;
  targetType: "shot" | "pathItem";
  shotId: string;
  pathItemId?: string;
  focusRegionId?: string;
  target: string;
  mood: string;
  motionRole: "track" | "pushIn" | "pushOut";
  effect: "None" | "Shake" | "Impact Pulse";
  cueTiming: "Early" | "Arrival" | "Not applicable";
  confidence: "Medium" | "Low";
  reason: string;
  canApply: boolean;
  warning?: string;
};

type AiCameraSuggestionStatus =
  | "draft"
  | "accepted"
  | "drafted"
  | "rejected"
  | "blocked"
  | "stale";

type AiCameraSuggestionTargetRef = {
  id: string;
  label: string;
  geometry: AiPageUnderstandingGeometry;
  type:
    | "acceptedDetail"
    | "aiPanel"
    | "aiCharacter"
    | "aiSpeech"
    | "aiDetail"
    | "aiAction";
};

type AiCameraSuggestionDraft = {
  id: string;
  sourceSuggestionId: string;
  targetPanelId: string;
  targetPanelLabel: string;
  targetPanelGeometry?: AiPageUnderstandingGeometry;
  target: AiCameraSuggestionTargetRef;
  supportingTargets: AiCameraSuggestionTargetRef[];
  movementRole: AiDirectorSuggestion["motionRole"];
  timingHint: AiDirectorSuggestionsResult["suggestions"][number]["suggestedSpeedTiming"];
  compositionHint: string;
  reason: string;
  confidence: AiDirectorSuggestionsResult["suggestions"][number]["confidence"];
  warnings: string[];
  status: AiCameraSuggestionStatus;
};

type AiCameraSuggestionDraftWithPriority = AiCameraSuggestionDraft & {
  priorityScore: number;
  originalIndex: number;
};

type AiAudioSuggestionKind =
  | "bgmTone"
  | "bgmPacing"
  | "sfxCue"
  | "sfxRestraint"
  | "audioWarning";

type AiAudioSuggestionStatus =
  | "new"
  | "copied"
  | "rejected"
  | "stale"
  | "blocked";

type AiAudioSuggestionTiming =
  | "project-wide"
  | "shot start"
  | "pre-arrival"
  | "focus arrival"
  | "post-impact"
  | "shot exit"
  | "manual review needed";

type AiAudioSuggestionTarget =
  | { type: "project"; label: string }
  | { type: "shot"; id: string; label: string }
  | { type: "pathItem"; shotId: string; pathItemId: string; label: string }
  | { type: "focusRegion"; id: string; label: string }
  | { type: "sfxMarker"; id: string; label: string };

type AiAudioSuggestionNote = {
  id: string;
  kind: AiAudioSuggestionKind;
  target: AiAudioSuggestionTarget;
  timing: AiAudioSuggestionTiming;
  suggestion: string;
  searchTerms: string[];
  reason: string;
  confidence: "high" | "medium" | "low" | "unknown";
  warnings: string[];
  status: AiAudioSuggestionStatus;
  createdAt: string;
};

export function App() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [expectedImageMetadata, setExpectedImageMetadata] =
    useState<ProjectImageMetadata | null>(null);
  const [isImportedProjectAwaitingImage, setIsImportedProjectAwaitingImage] =
    useState(false);
  const [cameraShots, setCameraShots] = useState<CameraShot[]>([]);
  const [focusRegions, setFocusRegions] = useState<FocusRegion[]>([]);
  const [temporarySuggestions, setTemporarySuggestions] = useState<
    TemporarySuggestion[]
  >([]);
  const [aiPageUnderstandingResult, setAiPageUnderstandingResult] =
    useState<AiPageUnderstandingResult | null>(null);
  const [isAnalyzingPageWithAi, setIsAnalyzingPageWithAi] = useState(false);
  const [aiDirectorSuggestionsResult, setAiDirectorSuggestionsResult] =
    useState<AiDirectorSuggestionsResult | null>(null);
  const [isGeneratingAiDirectorSuggestions, setIsGeneratingAiDirectorSuggestions] =
    useState(false);
  const [aiCameraSuggestionDrafts, setAiCameraSuggestionDrafts] = useState<
    AiCameraSuggestionDraft[]
  >([]);
  const [aiAudioSuggestionNotes, setAiAudioSuggestionNotes] = useState<
    AiAudioSuggestionNote[]
  >([]);
  const [hoveredAiPageRegionId, setHoveredAiPageRegionId] = useState<string | null>(
    null,
  );
  const [selectedAiPageRegionId, setSelectedAiPageRegionId] = useState<
    string | null
  >(null);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [selectedFocusRegionId, setSelectedFocusRegionId] = useState<
    string | null
  >(null);
  const [hiddenAiDetailFingerprints, setHiddenAiDetailFingerprints] = useState<
    string[]
  >([]);
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoExportProgress, setVideoExportProgress] =
    useState<ExportVideoProgress | null>(null);
  const [videoExportFormatMessage, setVideoExportFormatMessage] = useState<
    string | null
  >(null);
  const [videoExportResolution, setVideoExportResolution] =
    useState<ExportResolutionOption>("720p");
  const [videoExportFps, setVideoExportFps] = useState<ExportFpsOption>("30");
  const [guidedPageOptions, setGuidedPageOptions] = useState<GuidedPageOptions>(
    DEFAULT_GUIDED_PAGE_OPTIONS,
  );
  const [backgroundAudio, setBackgroundAudio] =
    useState<UploadedBackgroundAudio | null>(null);
  const [expectedBackgroundAudio, setExpectedBackgroundAudio] =
    useState<ImportedBackgroundAudio | null>(null);
  const [soundEffectMarkers, setSoundEffectMarkers] = useState<
    UploadedSoundEffectMarker[]
  >([]);
  const [expectedSoundEffectMarkers, setExpectedSoundEffectMarkers] = useState<
    SoundEffectMarkerMetadata[]
  >([]);
  const [suggestionDraftMessage, setSuggestionDraftMessage] = useState<
    string | null
  >(null);
  const nextShotNumberRef = useRef(1);
  const nextSuggestionNumberRef = useRef(1);
  const projectImportInputRef = useRef<HTMLInputElement | null>(null);
  const projectArchiveInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundAudioInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundAudioRef = useRef<UploadedBackgroundAudio | null>(null);
  const soundEffectMarkersRef = useRef<UploadedSoundEffectMarker[]>([]);
  const videoExportAbortControllerRef = useRef<AbortController | null>(null);
  const aiPageAnalysisRequestIdRef = useRef(0);
  const aiDirectorSuggestionsRequestIdRef = useRef(0);
  const nextAiAudioSuggestionNumberRef = useRef(1);

  useEffect(() => {
    return () => {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage.objectUrl);
      }
    };
  }, [uploadedImage]);

  useEffect(() => {
    backgroundAudioRef.current = backgroundAudio;
  }, [backgroundAudio]);

  useEffect(() => {
    soundEffectMarkersRef.current = soundEffectMarkers;
  }, [soundEffectMarkers]);

  useEffect(() => {
    setAiAudioSuggestionNotes((notes) =>
      notes.map((note) => {
        if (note.status === "rejected" || note.status === "blocked") {
          return note;
        }

        const targetAvailable = isAiAudioSuggestionTargetAvailable(
          note,
          cameraShots,
          focusRegions,
          soundEffectMarkers,
        );

        return {
          ...note,
          status: "stale",
          warnings: appendUniqueWarning(
            note.warnings,
            targetAvailable
              ? "Accepted project context changed. Regenerate audio notes before using this cue."
              : "Accepted target changed or no longer exists. Regenerate audio notes before using this cue.",
          ),
        };
      }),
    );
  }, [cameraShots, focusRegions, soundEffectMarkers]);

  useEffect(() => {
    return () => {
      if (backgroundAudioRef.current) {
        URL.revokeObjectURL(backgroundAudioRef.current.objectUrl);
      }

      soundEffectMarkersRef.current.forEach((marker) =>
        URL.revokeObjectURL(marker.objectUrl),
      );
    };
  }, []);

  function handleImageLoaded(image: UploadedImage) {
    aiPageAnalysisRequestIdRef.current += 1;
    aiDirectorSuggestionsRequestIdRef.current += 1;

    if (isImportedProjectAwaitingImage && expectedImageMetadata) {
      if (imageDimensionsMatch(image, expectedImageMetadata)) {
        setUploadedImage(image);
        setIsImportedProjectAwaitingImage(false);
        setProjectError(null);
        setProjectMessage(
          "Source image matched the imported project. Imported shots and focus regions are ready to edit.",
        );
        return;
      }

      setProjectError(
        `Selected image is ${image.width}x${image.height}px, but the imported project expects ${expectedImageMetadata.width}x${expectedImageMetadata.height}px. Started a new project from the selected image.`,
      );
      setExpectedImageMetadata(null);
      setIsImportedProjectAwaitingImage(false);
    } else if (isImportedProjectAwaitingImage) {
      setUploadedImage(image);
      setIsImportedProjectAwaitingImage(false);
      setProjectError(null);
      setProjectMessage(
        "Source image attached to the imported project. Review shot and focus-region placement because the JSON did not include expected image dimensions.",
      );
      return;
    } else {
      setProjectError(null);
      setProjectMessage(null);
    }

    nextShotNumberRef.current = 1;
    nextSuggestionNumberRef.current = 1;

    setUploadedImage(image);
    setExpectedImageMetadata(null);
    setCameraShots([]);
    setFocusRegions([]);
    setTemporarySuggestions([]);
    setAiPageUnderstandingResult(null);
    setAiDirectorSuggestionsResult(null);
    setAiCameraSuggestionDrafts([]);
    setAiAudioSuggestionNotes([]);
    setHiddenAiDetailFingerprints([]);
    setIsGeneratingAiDirectorSuggestions(false);
    setHoveredAiPageRegionId(null);
    setSelectedAiPageRegionId(null);
    setSuggestionDraftMessage(null);
    setGuidedPageOptions(DEFAULT_GUIDED_PAGE_OPTIONS);
    replaceBackgroundAudio(null);
    setExpectedBackgroundAudio(null);
    replaceSoundEffectMarkers([]);
    setExpectedSoundEffectMarkers([]);
    setSelectedShotId(null);
    setSelectedFocusRegionId(null);
    nextAiAudioSuggestionNumberRef.current = 1;
  }

  function createShotId() {
    const shotNumber = nextShotNumberRef.current;

    nextShotNumberRef.current += 1;

    return `shot-${shotNumber}-${Date.now()}`;
  }

  function handleAddShot() {
    if (!uploadedImage) {
      return;
    }

    const selectedShot =
      cameraShots.find((shot) => shot.id === selectedShotId) ??
      cameraShots[cameraShots.length - 1];
    const newShotNumber = nextShotNumberRef.current;
    const newShot: CameraShot = {
      ...(selectedShot
        ? createOffsetCameraShot(
            uploadedImage,
            selectedShot,
            createShotId(),
            `Shot ${newShotNumber}`,
          )
        : createDefaultCameraShot(
            uploadedImage,
            createShotId(),
            `Shot ${newShotNumber}`,
          )),
      durationMs: 2500,
      sceneHoldRatio: selectedShot?.sceneHoldRatio ?? 0.1,
      focusAttentionRatio: selectedShot?.focusAttentionRatio ?? 0.6,
    };

    setCameraShots((shots) => [...shots, newShot]);
    setSelectedShotId(newShot.id);
    setSelectedFocusRegionId(null);
  }

  function handleChangeShot(updatedShot: CameraShot) {
    setCameraShots((shots) =>
      shots.map((shot) => (shot.id === updatedShot.id ? updatedShot : shot)),
    );
  }

  function handleDeleteShot(shotId: string) {
    setCameraShots((shots) => {
      const deletedIndex = shots.findIndex((shot) => shot.id === shotId);
      const nextShots = shots.filter((shot) => shot.id !== shotId);
      const nextSelectedShot =
        nextShots[Math.min(Math.max(deletedIndex, 0), nextShots.length - 1)];

      replaceSoundEffectMarkers((markers) =>
        markers.filter((marker) => marker.targetShotId !== shotId),
      );
      setExpectedSoundEffectMarkers((markers) =>
        markers.filter((marker) => marker.targetShotId !== shotId),
      );
      setSelectedShotId(nextSelectedShot?.id ?? null);
      setSelectedFocusRegionId(null);

      return nextShots;
    });
  }

  function handleSelectShot(shotId: string) {
    setSelectedShotId(shotId);
    setSelectedFocusRegionId(null);
    setSelectedAiPageRegionId(null);
  }

  function handleSelectFocusRegion(focusRegionId: string) {
    const focusRegion = focusRegions.find((region) => region.id === focusRegionId);

    if (
      focusRegion?.sourceShotId &&
      cameraShots.some((shot) => shot.id === focusRegion.sourceShotId)
    ) {
      setSelectedShotId(focusRegion.sourceShotId);
    }

    setSelectedFocusRegionId(focusRegionId);
    setSelectedAiPageRegionId(null);
  }

  function handleSelectAiPageRegion(regionId: string | null) {
    setSelectedAiPageRegionId(regionId);

    if (regionId) {
      setSelectedFocusRegionId(null);
    }
  }

  function handleAddFocusRegion(focusRegion: FocusRegion) {
    setFocusRegions((regions) => [
      ...regions,
      normalizeDetailGeometryForImage(focusRegion, uploadedImage),
    ]);
    setSelectedFocusRegionId(focusRegion.id);
  }

  function handleChangeFocusRegion(updatedFocusRegion: FocusRegion) {
    const normalizedFocusRegion = normalizeDetailGeometryForImage(
      updatedFocusRegion,
      uploadedImage,
    );

    setFocusRegions((regions) =>
      regions.map((focusRegion) =>
        focusRegion.id === normalizedFocusRegion.id
          ? normalizedFocusRegion
          : focusRegion,
      ),
    );
  }

  function handleDeleteFocusRegion(focusRegionId: string) {
    setFocusRegions((regions) =>
      regions.filter((focusRegion) => focusRegion.id !== focusRegionId),
    );
    setSelectedFocusRegionId(null);
  }

  function handleAcceptAiDetail(region: AiPageUnderstandingRegion) {
    if (!uploadedImage) {
      return;
    }

    const nextIndex =
      focusRegions.filter((focusRegion) => focusRegion.kind === "detail").length + 1;
    const detail: FocusRegion = normalizeDetailGeometryForImage({
      id: `detail-${Date.now()}`,
      label: region.label || `Detail ${nextIndex}`,
      description: region.description,
      kind: "detail",
      focusPurpose: "detail",
      effectType: "none",
      sequenceOrder: getNextFocusRegionSequenceOrder(focusRegions),
      x: Math.round(region.geometry.x),
      y: Math.round(region.geometry.y),
      width: Math.round(region.geometry.width),
      height: Math.round(region.geometry.height),
    }, uploadedImage);

    setFocusRegions((regions) => [...regions, detail]);
    setHiddenAiDetailFingerprints((fingerprints) =>
      addHiddenAiDetailFingerprint(fingerprints, region),
    );
    setSelectedFocusRegionId(detail.id);
    setSelectedAiPageRegionId(null);
    setProjectError(null);
    setProjectMessage(`Accepted detail highlight: ${detail.label}.`);
  }

  function handleRejectAiDetail(region: AiPageUnderstandingRegion) {
    setHiddenAiDetailFingerprints((fingerprints) =>
      addHiddenAiDetailFingerprint(fingerprints, region),
    );
    setSelectedAiPageRegionId((selectedRegionId) =>
      selectedRegionId === region.id ? null : selectedRegionId,
    );
  }

  function handleMoveShot(shotId: string, direction: "up" | "down") {
    setCameraShots((shots) => {
      const currentIndex = shots.findIndex((shot) => shot.id === shotId);

      if (currentIndex === -1) {
        return shots;
      }

      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (nextIndex < 0 || nextIndex >= shots.length) {
        return shots;
      }

      const nextShots = [...shots];
      const [movedShot] = nextShots.splice(currentIndex, 1);

      nextShots.splice(nextIndex, 0, movedShot);

      return nextShots;
    });
  }

  function handleImportButtonClick() {
    projectImportInputRef.current?.click();
  }

  function handleImportArchiveButtonClick() {
    projectArchiveInputRef.current?.click();
  }

  async function handleImportProjectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isJsonFile(file)) {
      setProjectError("Choose a .json project file.");
      setProjectMessage(null);
      return;
    }

    aiPageAnalysisRequestIdRef.current += 1;
    aiDirectorSuggestionsRequestIdRef.current += 1;

    try {
      const importedProject = parseProjectImportData(parseJson(await file.text()));

      setUploadedImage(null);
      setExpectedImageMetadata(importedProject.image);
      setIsImportedProjectAwaitingImage(true);
      setCameraShots(importedProject.cameraShots);
      setFocusRegions(importedProject.focusRegions);
      setTemporarySuggestions([]);
      setAiPageUnderstandingResult(null);
      setAiDirectorSuggestionsResult(null);
      setAiCameraSuggestionDrafts([]);
      setAiAudioSuggestionNotes([]);
      setHiddenAiDetailFingerprints([]);
      setIsGeneratingAiDirectorSuggestions(false);
      setHoveredAiPageRegionId(null);
      setSelectedAiPageRegionId(null);
      setSuggestionDraftMessage(null);
      setGuidedPageOptions(importedProject.guidedPageOptions);
      replaceBackgroundAudio(null);
      setExpectedBackgroundAudio(importedProject.backgroundAudio);
      replaceSoundEffectMarkers([]);
      setExpectedSoundEffectMarkers(importedProject.soundEffectMarkers);
      setSelectedShotId(importedProject.cameraShots[0]?.id ?? null);
      setSelectedFocusRegionId(null);
      setProjectError(null);
      setProjectMessage(
        createImportSuccessMessage(
          importedProject.image,
          importedProject.backgroundAudio,
          importedProject.soundEffectMarkers,
        ),
      );
      nextShotNumberRef.current = getNextShotNumber(importedProject.cameraShots);
      nextSuggestionNumberRef.current = 1;
      nextAiAudioSuggestionNumberRef.current = 1;
    } catch (error) {
      aiPageAnalysisRequestIdRef.current += 1;
      aiDirectorSuggestionsRequestIdRef.current += 1;
      setProjectError(
        error instanceof Error
          ? error.message
          : "That project JSON could not be imported.",
      );
      setProjectMessage(null);
    }
  }

  async function handleImportProjectArchiveFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isProjectArchiveFile(file)) {
      setProjectError("Choose a .ccvproject archive file.");
      setProjectMessage(null);
      return;
    }

    aiPageAnalysisRequestIdRef.current += 1;
    aiDirectorSuggestionsRequestIdRef.current += 1;

    try {
      const importedArchive = await parseProjectArchiveData(
        parseJson(await file.text()),
      );

      setUploadedImage(importedArchive.image);
      setExpectedImageMetadata(null);
      setIsImportedProjectAwaitingImage(false);
      setCameraShots(importedArchive.cameraShots);
      setFocusRegions(importedArchive.focusRegions);
      setTemporarySuggestions([]);
      setAiPageUnderstandingResult(null);
      setAiDirectorSuggestionsResult(null);
      setAiCameraSuggestionDrafts([]);
      setAiAudioSuggestionNotes([]);
      setHiddenAiDetailFingerprints([]);
      setIsGeneratingAiDirectorSuggestions(false);
      setHoveredAiPageRegionId(null);
      setSelectedAiPageRegionId(null);
      setSuggestionDraftMessage(null);
      setGuidedPageOptions(importedArchive.guidedPageOptions);
      replaceBackgroundAudio(importedArchive.backgroundAudio);
      setExpectedBackgroundAudio(null);
      replaceSoundEffectMarkers(importedArchive.soundEffectMarkers);
      setExpectedSoundEffectMarkers(importedArchive.missingSoundEffectMarkers);
      setSelectedShotId(importedArchive.cameraShots[0]?.id ?? null);
      setSelectedFocusRegionId(null);
      setProjectError(null);
      setProjectMessage(
        createArchiveImportSuccessMessage(
          importedArchive.image.fileName,
          importedArchive.backgroundAudio,
          importedArchive.soundEffectMarkers.length,
          importedArchive.missingSoundEffectMarkers.length,
        ),
      );
      nextShotNumberRef.current = getNextShotNumber(importedArchive.cameraShots);
      nextSuggestionNumberRef.current = 1;
      nextAiAudioSuggestionNumberRef.current = 1;
    } catch (error) {
      aiPageAnalysisRequestIdRef.current += 1;
      aiDirectorSuggestionsRequestIdRef.current += 1;
      setProjectError(
        error instanceof Error
          ? error.message
          : "That project archive could not be imported.",
      );
      setProjectMessage(null);
    }
  }

  function handleExportProject() {
    if (!uploadedImage) {
      return;
    }

    const exportData = createProjectExportData({
      image: uploadedImage,
      cameraShots,
      focusRegions,
      guidedPageOptions,
      backgroundAudio,
      soundEffectMarkers: getAllSoundEffectMarkerMetadata(
        soundEffectMarkers,
        expectedSoundEffectMarkers,
      ),
      exportedAt: new Date().toISOString(),
    });
    const blob = new Blob([`${JSON.stringify(exportData, null, 2)}\n`], {
      type: "application/json",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = createProjectExportFileName(uploadedImage);
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  async function handleExportProjectArchive() {
    if (!uploadedImage) {
      return;
    }

    try {
      const archiveData = await createProjectArchiveData({
        image: uploadedImage,
        cameraShots,
        focusRegions,
        guidedPageOptions,
        backgroundAudio,
        soundEffectMarkers,
        soundEffectMarkerMetadata: getAllSoundEffectMarkerMetadata(
          soundEffectMarkers,
          expectedSoundEffectMarkers,
        ),
        exportedAt: new Date().toISOString(),
      });
      const blob = new Blob([`${JSON.stringify(archiveData, null, 2)}\n`], {
        type: "application/json",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download = createProjectArchiveFileName(uploadedImage);
      document.body.append(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);
      setProjectError(null);
      setProjectMessage("Project archive exported with bundled source image.");
    } catch (error) {
      setProjectError(
        error instanceof Error
          ? error.message
          : "Project archive could not be exported.",
      );
      setProjectMessage(null);
    }
  }

  async function handleExportVideoPrototype() {
    if (!uploadedImage || cameraShots.length === 0 || isExportingVideo) {
      return;
    }

    const abortController = new AbortController();
    const exportSoundEffectMarkers = soundEffectMarkers.map((marker) =>
      normalizeSoundEffectMarker(marker, cameraShots),
    );
    const shouldIncludeAudio =
      Boolean(backgroundAudio?.settings.enabled) ||
      exportSoundEffectMarkers.length > 0;
    const formatMessage = getVideoExportFormatSupportMessage(shouldIncludeAudio);
    const exportSettings = createVideoExportSettings(
      videoExportResolution,
      videoExportFps,
    );

    videoExportAbortControllerRef.current = abortController;
    setIsExportingVideo(true);
    setVideoExportProgress(null);
    setVideoExportFormatMessage(formatMessage);
    setProjectError(null);
    setProjectMessage("Rendering video prototype. Keep this tab open.");

    try {
      const exportResult = await exportVideoPrototype({
        image: uploadedImage,
        cameraShots,
        focusRegions,
        guidedPageOptions,
        backgroundAudio,
        soundEffectMarkers: exportSoundEffectMarkers,
        settings: exportSettings,
        focusTreatmentStyle: LEGACY_EXPORT_FOCUS_TREATMENT_STYLE,
        signal: abortController.signal,
        onProgress: setVideoExportProgress,
      });
      const downloadUrl = URL.createObjectURL(exportResult.blob);
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download = exportResult.fileName;
      document.body.append(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);
      setProjectMessage(
        createVideoExportSuccessMessage(
          exportResult.fileName,
          exportResult.mimeType,
          exportSettings,
          exportResult.requestedAudio,
          exportResult.recordedAudioTrackCount,
          exportResult.audioWarnings,
        ),
      );
      setVideoExportProgress(null);
      setVideoExportFormatMessage(null);
    } catch (error) {
      if (isAbortError(error)) {
        setProjectMessage("Video export canceled. No video file was downloaded.");
        setProjectError(null);
      } else {
        setProjectError(
          error instanceof Error
            ? error.message
            : "Video export failed in this browser.",
        );
        setProjectMessage(null);
      }
      setVideoExportProgress(null);
    } finally {
      setIsExportingVideo(false);
      setVideoExportFormatMessage(null);
      videoExportAbortControllerRef.current = null;
    }
  }

  function handleCancelVideoExport() {
    if (!isExportingVideo) {
      return;
    }

    setProjectMessage("Canceling video export...");
    videoExportAbortControllerRef.current?.abort();
  }

  async function handleBackgroundAudioFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("audio/")) {
      setProjectError("Choose an audio file for background music.");
      setProjectMessage(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const durationMs = await readAudioDurationMs(objectUrl);

      const importedSettings = expectedBackgroundAudio?.settings;
      const nextAudio: UploadedBackgroundAudio = {
        objectUrl,
        fileName: file.name,
        durationMs,
        mimeType: file.type,
        settings: {
          ...DEFAULT_BACKGROUND_AUDIO_SETTINGS,
          trimEndMs: durationMs,
          ...(importedSettings ?? {}),
        },
      };

      replaceBackgroundAudio({
        ...nextAudio,
        settings: normalizeAudioSettings(nextAudio.settings, nextAudio),
      });
      setExpectedBackgroundAudio(null);
      setProjectError(null);
      setProjectMessage(`Background audio loaded: ${file.name}.`);
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      setProjectError(
        error instanceof Error
          ? error.message
          : "That audio file could not be loaded.",
      );
      setProjectMessage(null);
    }
  }

  function handleSelectBackgroundAudio() {
    backgroundAudioInputRef.current?.click();
  }

  function handleRemoveBackgroundAudio() {
    replaceBackgroundAudio(null);
    setExpectedBackgroundAudio(null);
    setProjectError(null);
    setProjectMessage("Background audio removed.");
  }

  function handleChangeBackgroundAudioSettings(
    settings: BackgroundAudioSettings,
  ) {
    setBackgroundAudio((audio) =>
      audio ? { ...audio, settings: normalizeAudioSettings(settings, audio) } : audio,
    );
  }

  function replaceBackgroundAudio(nextAudio: UploadedBackgroundAudio | null) {
    setBackgroundAudio((currentAudio) => {
      if (currentAudio && currentAudio.objectUrl !== nextAudio?.objectUrl) {
        URL.revokeObjectURL(currentAudio.objectUrl);
      }

      return nextAudio;
    });
  }

  async function handleAddSoundEffectMarker(file: File, targetShotId: string) {
    if (!file.type.startsWith("audio/")) {
      setProjectError("Choose an audio file for the sound effect marker.");
      setProjectMessage(null);
      return;
    }

    const targetShot = cameraShots.find((shot) => shot.id === targetShotId);

    if (!targetShot) {
      setProjectError("Choose a target shot before adding a sound effect marker.");
      setProjectMessage(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const durationMs = await readAudioDurationMs(objectUrl);
      const marker: UploadedSoundEffectMarker = {
        id: `sfx-${Date.now()}`,
        label: createDefaultSoundEffectLabel(file.name, soundEffectMarkers.length + 1),
        targetShotId: targetShot.id,
        offsetMs: 0,
        playDurationMs: durationMs,
        shotSpan: 1,
        volume: 1,
        fileName: file.name,
        durationMs,
        mimeType: file.type,
        objectUrl,
      };

      setSoundEffectMarkers((markers) => [...markers, marker]);
      setProjectError(null);
      setProjectMessage(`Sound effect marker added: ${marker.label}.`);
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      setProjectError(
        error instanceof Error
          ? error.message
          : "That sound effect file could not be loaded.",
      );
      setProjectMessage(null);
    }
  }

  function handleChangeSoundEffectMarker(updatedMarker: UploadedSoundEffectMarker) {
    setSoundEffectMarkers((markers) =>
      markers.map((marker) =>
        marker.id === updatedMarker.id
          ? normalizeSoundEffectMarker(updatedMarker, cameraShots)
          : marker,
      ),
    );
  }

  function handleRemoveSoundEffectMarker(markerId: string) {
    setSoundEffectMarkers((markers) => {
      const removedMarker = markers.find((marker) => marker.id === markerId);

      if (removedMarker) {
        URL.revokeObjectURL(removedMarker.objectUrl);
      }

      return markers.filter((marker) => marker.id !== markerId);
    });
    setExpectedSoundEffectMarkers((markers) =>
      markers.filter((marker) => marker.id !== markerId),
    );
  }

  function replaceSoundEffectMarkers(
    nextMarkers:
      | UploadedSoundEffectMarker[]
      | ((markers: UploadedSoundEffectMarker[]) => UploadedSoundEffectMarker[]),
  ) {
    setSoundEffectMarkers((currentMarkers) => {
      const resolvedMarkers =
        typeof nextMarkers === "function" ? nextMarkers(currentMarkers) : nextMarkers;
      const nextIds = new Set(resolvedMarkers.map((marker) => marker.id));

      currentMarkers.forEach((marker) => {
        if (!nextIds.has(marker.id)) {
          URL.revokeObjectURL(marker.objectUrl);
        }
      });

      return resolvedMarkers.map(normalizeSoundEffectMarkerFields);
    });
  }

  function handleCreateCameraShotSuggestion() {
    if (!uploadedImage) {
      return;
    }

    const suggestionNumber = nextSuggestionNumberRef.current;
    nextSuggestionNumberRef.current += 1;

    const baseShot =
      selectedShot ??
      cameraShots[cameraShots.length - 1] ??
      createDefaultCameraShot(uploadedImage, "suggestion-base", "Suggestion");
    const width = Math.max(24, Math.round(baseShot.width * 0.85));
    const height = Math.max(24, Math.round(baseShot.height * 0.85));
    const x = clampNumber(
      Math.round(baseShot.x + baseShot.width * 0.08),
      0,
      Math.max(0, uploadedImage.width - width),
    );
    const y = clampNumber(
      Math.round(baseShot.y + baseShot.height * 0.08),
      0,
      Math.max(0, uploadedImage.height - height),
    );

    setTemporarySuggestions((suggestions) => [
      ...suggestions,
      {
        id: createSuggestionId("shot", suggestionNumber),
        type: "cameraShot",
        source: "manualDraft",
        confidence: "unknown",
        status: "visible",
        createdAt: new Date().toISOString(),
        reason: "Manual draft suggestion for testing accept/reject workflow.",
        proposedValues: {
          label: `Suggested Shot ${suggestionNumber}`,
          x,
          y,
          width,
          height,
          durationMs: baseShot.durationMs,
          shotPurpose: baseShot.shotPurpose,
          sceneHoldRatio: baseShot.sceneHoldRatio,
          focusAttentionRatio: baseShot.focusAttentionRatio,
        },
      },
    ]);
    setSuggestionDraftMessage(null);
  }

  function handleCreateFocusRegionSuggestion() {
    if (!uploadedImage) {
      return;
    }

    const suggestionNumber = nextSuggestionNumberRef.current;
    nextSuggestionNumberRef.current += 1;
    const sourceShot = selectedShot ?? cameraShots[0] ?? null;
    const sourceRect = sourceShot ?? {
      x: 0,
      y: 0,
      width: uploadedImage.width,
      height: uploadedImage.height,
    };
    const width = Math.max(24, Math.round(sourceRect.width * 0.35));
    const height = Math.max(24, Math.round(sourceRect.height * 0.3));
    const x = clampNumber(
      Math.round(sourceRect.x + sourceRect.width * 0.18),
      0,
      Math.max(0, uploadedImage.width - width),
    );
    const y = clampNumber(
      Math.round(sourceRect.y + sourceRect.height * 0.18),
      0,
      Math.max(0, uploadedImage.height - height),
    );

    setTemporarySuggestions((suggestions) => [
      ...suggestions,
      {
        id: createSuggestionId("focus", suggestionNumber),
        type: "focusRegion",
        source: "manualDraft",
        confidence: "unknown",
        status: "visible",
        createdAt: new Date().toISOString(),
        reason: "Manual draft suggestion for testing focus-region acceptance.",
        proposedValues: {
          label: `Suggested Focus ${suggestionNumber}`,
          kind: "detail",
          x,
          y,
          width,
          height,
          sourceShotId: sourceShot?.id,
          sequenceOrder: getNextFocusRegionSequenceOrder(focusRegions),
        },
      },
    ]);
    setSuggestionDraftMessage(null);
  }

  function handleCreateShotAttentionPathSuggestion() {
    if (!uploadedImage) {
      setSuggestionDraftMessage("Upload an image before drafting suggestions.");
      return;
    }

    if (!selectedShot) {
      setSuggestionDraftMessage(
        "Select a camera shot before drafting an attention path.",
      );
      return;
    }

    if (focusRegions.length === 0) {
      setSuggestionDraftMessage(
        "Create page-level focus regions before drafting an attention path.",
      );
      return;
    }

    const eligibleFocusRegions = getDraftAttentionPathFocusRegions(
      selectedShot,
      focusRegions,
    );

    if (eligibleFocusRegions.length === 0) {
      setSuggestionDraftMessage(
        "No usable focus regions belong to the selected shot.",
      );
      return;
    }

    const suggestionNumber = nextSuggestionNumberRef.current;
    nextSuggestionNumberRef.current += 1;
    const hasExistingAttentionPath =
      (selectedShot.attentionPath?.length ?? 0) > 0;
    const draftPathItems = createAiDraftAttentionPathItems(
      selectedShot,
      eligibleFocusRegions,
    );

    setTemporarySuggestions((suggestions) => [
      ...suggestions,
      {
        id: createSuggestionId("path", suggestionNumber),
        type: "shotAttentionPath",
        source: "aiDirectorDraft",
        confidence: "medium",
        status: "visible",
        createdAt: new Date().toISOString(),
        reason: hasExistingAttentionPath
          ? "AI-style draft from existing manual focus regions. The selected shot already has an attention path, so accepting this will replace that path explicitly."
          : "AI-style draft from existing manual focus regions inside the selected shot.",
        proposedValues: {
          targetShotId: selectedShot.id,
          targetShotLabel: selectedShot.label,
          pathItems: draftPathItems,
        },
      },
    ]);
    setSuggestionDraftMessage(
      `Drafted ${draftPathItems.length} attention path item${
        draftPathItems.length === 1 ? "" : "s"
      } for ${selectedShot.label}.`,
    );
  }

  function handleAcceptSuggestion(suggestionId: string) {
    const suggestion = temporarySuggestions.find((item) => item.id === suggestionId);

    if (!suggestion) {
      return;
    }

    if (suggestion.type === "cameraShot") {
      const newShot: CameraShot = {
        id: createShotId(),
        ...suggestion.proposedValues,
      };

      setCameraShots((shots) => [...shots, newShot]);
      setSelectedShotId(newShot.id);
      setSelectedFocusRegionId(null);
    } else if (suggestion.type === "focusRegion") {
      const newFocusRegion: FocusRegion = {
        id: createFocusRegionId(suggestion.id),
        ...suggestion.proposedValues,
      };

      setFocusRegions((regions) => [...regions, newFocusRegion]);
      setSelectedFocusRegionId(newFocusRegion.id);

      if (
        newFocusRegion.sourceShotId &&
        cameraShots.some((shot) => shot.id === newFocusRegion.sourceShotId)
      ) {
        setSelectedShotId(newFocusRegion.sourceShotId);
      }
    } else if (suggestion.type === "shotAttentionPath") {
      const targetShot = cameraShots.find(
        (shot) => shot.id === suggestion.proposedValues.targetShotId,
      );
      const draftPathItems = getSuggestionDraftPathItems(suggestion);
      const missingFocusRegion = draftPathItems.find(
        (pathItem) =>
          !focusRegions.some((region) => region.id === pathItem.focusRegionId),
      );

      if (!targetShot) {
        setProjectMessage(null);
        setProjectError(
          "Draft attention path is blocked because its Camera Shot target is missing.",
        );
        return;
      }

      if (draftPathItems.length === 0) {
        setProjectMessage(null);
        setProjectError(
          "Draft attention path is blocked because it has no valid Focus Region targets.",
        );
        return;
      }

      if (missingFocusRegion) {
        setProjectMessage(null);
        setProjectError(
          "Draft attention path is blocked because one of its Focus Region targets is missing.",
        );
        return;
      }

      const nextAttentionPath = createSuggestedAttentionPathItems(
        suggestion.proposedValues.targetShotId,
        draftPathItems,
      );

      setCameraShots((shots) =>
        shots.map((shot) =>
          shot.id === suggestion.proposedValues.targetShotId
            ? {
                ...shot,
                attentionPath: nextAttentionPath,
              }
            : shot,
        ),
      );
      setSelectedShotId(suggestion.proposedValues.targetShotId);
      setSelectedFocusRegionId(null);
      setProjectError(null);
      setProjectMessage(
        `Accepted draft attention path for ${targetShot.label}.`,
      );
    } else {
      const newShotId = createShotId();
      const focusRegionIdMap = new Map<string, string>();
      const newFocusRegions = suggestion.proposedValues.focusRegions.map(
        (draftFocusRegion) => {
          const { draftFocusRegionId, ...focusRegionValues } = draftFocusRegion;
          const newFocusRegionId = createFocusRegionId(
            `${suggestion.id}-${draftFocusRegionId}`,
          );
          focusRegionIdMap.set(draftFocusRegionId, newFocusRegionId);

          return {
            ...focusRegionValues,
            id: newFocusRegionId,
            sourceShotId: newShotId,
          };
        },
      );
      const nextAttentionPath = suggestion.proposedValues.pathItems.reduce<
        ShotAttentionPathItem[]
      >((items, pathItem, index) => {
          const focusRegionId = focusRegionIdMap.get(pathItem.focusRegionId);

          if (!focusRegionId) {
            return items;
          }

          items.push({
            id: createAttentionPathItemId(newShotId, focusRegionId, index + 1),
            focusRegionId,
            order: index + 1,
            motionRole: pathItem.motionRole,
            durationWeight: pathItem.durationWeight,
          });

          return items;
        }, []);
      const newShot: CameraShot = {
        id: newShotId,
        ...suggestion.proposedValues.cameraShot,
        attentionPath: nextAttentionPath,
      };

      setCameraShots((shots) => [...shots, newShot]);
      setFocusRegions((regions) => [...regions, ...newFocusRegions]);
      setSelectedShotId(newShot.id);
      setSelectedFocusRegionId(newFocusRegions[0]?.id ?? null);
      setProjectError(null);
      setProjectMessage(
        `Accepted draft motion for ${newShot.label}: created 1 Camera Shot, ${newFocusRegions.length} Focus Region${newFocusRegions.length === 1 ? "" : "s"}, and ${nextAttentionPath.length} attention path item${nextAttentionPath.length === 1 ? "" : "s"}.`,
      );
    }

    setTemporarySuggestions((suggestions) =>
      suggestions.filter((item) => item.id !== suggestionId),
    );
    setSuggestionDraftMessage(null);
  }

  function handleRejectSuggestion(suggestionId: string) {
    setTemporarySuggestions((suggestions) =>
      suggestions.filter((item) => item.id !== suggestionId),
    );
  }

  function handleChangeAiCameraSuggestionDraft(
    suggestionId: string,
    changes: Partial<
      Pick<AiCameraSuggestionDraft, "movementRole" | "timingHint" | "reason">
    >,
  ) {
    setAiCameraSuggestionDrafts((suggestions) =>
      suggestions.map((suggestion) =>
        suggestion.id === suggestionId
          ? {
              ...suggestion,
              ...changes,
              status:
                suggestion.status === "rejected" ? suggestion.status : "draft",
            }
          : suggestion,
      ),
    );
  }

  function handleAcceptAiCameraSuggestionDraft(suggestionId: string) {
    const suggestion = aiCameraSuggestionDrafts.find(
      (item) => item.id === suggestionId,
    );

    if (!suggestion) {
      return;
    }

    if (
      suggestion.status === "blocked" ||
      suggestion.status === "stale" ||
      suggestion.status === "rejected"
    ) {
      setProjectMessage(null);
      setProjectError(
        "AI camera suggestion cannot create draft motion while it is blocked, stale, or rejected.",
      );
      return;
    }

    if (suggestion.status === "drafted") {
      setProjectMessage(null);
      setProjectError("Draft motion has already been created for this suggestion.");
      return;
    }

    if (!uploadedImage) {
      setProjectMessage(null);
      setProjectError("Upload or import a page before creating draft motion.");
      return;
    }

    const draftMotionSuggestion = createDraftMotionSuggestionFromAiCameraSuggestion(
      suggestion,
      uploadedImage,
      nextSuggestionNumberRef.current,
    );
    nextSuggestionNumberRef.current += 1;
    setTemporarySuggestions((suggestions) => [
      ...suggestions,
      draftMotionSuggestion,
    ]);
    setAiCameraSuggestionDrafts((suggestions) =>
      suggestions.map((suggestion) =>
        suggestion.id === suggestionId && suggestion.status !== "blocked"
          ? {
              ...suggestion,
              status: suggestion.status === "stale" ? "stale" : "drafted",
            }
          : suggestion,
      ),
    );
    setProjectError(null);
    setProjectMessage(
      "Created a temporary Draft Motion suggestion. Review it in Temporary Helper Suggestions before accepting it into project data.",
    );
  }

  function handleRejectAiCameraSuggestionDraft(suggestionId: string) {
    setAiCameraSuggestionDrafts((suggestions) =>
      suggestions.map((suggestion) =>
        suggestion.id === suggestionId
          ? {
              ...suggestion,
              status: "rejected",
            }
          : suggestion,
      ),
    );
    setProjectError(null);
    setProjectMessage(
      "AI camera suggestion rejected. Accepted project data is unchanged.",
    );
  }

  function handleGenerateAiAudioSuggestionNotes() {
    const nextNotes = createAiAudioSuggestionNotes({
      cameraShots,
      focusRegions,
      backgroundAudio,
      soundEffectMarkers,
      startIndex: nextAiAudioSuggestionNumberRef.current,
    });

    nextAiAudioSuggestionNumberRef.current += nextNotes.length;
    setAiAudioSuggestionNotes(nextNotes);
    setProjectError(null);
    setProjectMessage(
      nextNotes.length > 0
        ? `Generated ${nextNotes.length} temporary audio note${nextNotes.length === 1 ? "" : "s"}. Accepted audio data is unchanged.`
        : "No audio notes generated. Add accepted Camera Shots or attention-path beats first.",
    );
  }

  async function handleCopyAiAudioSuggestionTerms(noteId: string) {
    const note = aiAudioSuggestionNotes.find((item) => item.id === noteId);

    if (!note || note.searchTerms.length === 0) {
      return;
    }

    const copyText = note.searchTerms.join(", ");

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable.");
      }

      await navigator.clipboard.writeText(copyText);

      setAiAudioSuggestionNotes((notes) =>
        notes.map((item) =>
          item.id === noteId && item.status !== "rejected"
            ? { ...item, status: "copied" }
            : item,
        ),
      );
      setProjectError(null);
      setProjectMessage("Copied advisory audio search terms. Accepted audio data is unchanged.");
    } catch {
      setProjectMessage(null);
      setProjectError("Could not copy audio search terms in this browser.");
    }
  }

  function handleRejectAiAudioSuggestionNote(noteId: string) {
    setAiAudioSuggestionNotes((notes) =>
      notes.map((note) =>
        note.id === noteId ? { ...note, status: "rejected" } : note,
      ),
    );
    setProjectError(null);
    setProjectMessage("Audio note rejected. Accepted audio data is unchanged.");
  }

  function handleApplyAiDirectorSuggestion(suggestion: AiDirectorSuggestion) {
    if (!suggestion.canApply) {
      setProjectMessage(null);
      setProjectError(
        suggestion.warning ?? "Director suggestion is blocked for this target.",
      );
      return;
    }

    const targetShot = cameraShots.find((shot) => shot.id === suggestion.shotId);

    if (!targetShot) {
      setProjectMessage(null);
      setProjectError("Director suggestion is blocked because its Camera Shot target is missing.");
      return;
    }

    if (suggestion.targetType === "pathItem") {
      const targetPathItem = targetShot.attentionPath?.find(
        (pathItem) => pathItem.id === suggestion.pathItemId,
      );
      const targetFocusRegion = targetPathItem
        ? focusRegions.find(
            (focusRegion) => focusRegion.id === targetPathItem.focusRegionId,
          )
        : undefined;

      if (!targetPathItem) {
        setProjectMessage(null);
        setProjectError(
          "Director suggestion is blocked because its Shot Attention Path target is missing.",
        );
        return;
      }

      if (
        !targetFocusRegion ||
        suggestion.focusRegionId !== targetPathItem.focusRegionId
      ) {
        setProjectMessage(null);
        setProjectError(
          "This suggestion is blocked because its Focus Region target is missing.",
        );
        return;
      }
    }

    setCameraShots((shots) =>
      shots.map((shot) => {
        if (shot.id !== suggestion.shotId) {
          return shot;
        }

        if (suggestion.targetType === "shot") {
          return {
            ...shot,
            specialEffects: createShotSpecialEffectsFromDirectorSuggestion(
              suggestion.effect,
            ),
          };
        }

        if (!suggestion.pathItemId || !shot.attentionPath) {
          return shot;
        }

        const effectCues = createEffectCuesFromDirectorSuggestion(
          suggestion.effect,
        );

        return {
          ...shot,
          attentionPath: shot.attentionPath.map((pathItem) =>
            pathItem.id === suggestion.pathItemId
              ? {
                  ...pathItem,
                  motionRole: suggestion.motionRole,
                  effectCues,
                  effectCueTiming: effectCues
                    ? createEffectCueTimingFromDirectorSuggestion(
                        suggestion.cueTiming,
                      )
                    : undefined,
                }
              : pathItem,
          ),
        };
      }),
    );
    setSelectedShotId(suggestion.shotId);
    setSelectedFocusRegionId(null);
    setProjectError(null);
    setProjectMessage(`Applied director suggestion to ${suggestion.target}.`);
  }

  async function handleAnalyzePageWithAi() {
    if (!uploadedImage || isAnalyzingPageWithAi) {
      return;
    }

    const requestId = aiPageAnalysisRequestIdRef.current + 1;
    aiPageAnalysisRequestIdRef.current = requestId;
    setIsAnalyzingPageWithAi(true);
    setAiPageUnderstandingResult(null);
    setAiDirectorSuggestionsResult(null);
    setAiCameraSuggestionDrafts([]);
    setTemporarySuggestions(removeAiDerivedTemporarySuggestions);
    setHiddenAiDetailFingerprints([]);
    setHoveredAiPageRegionId(null);
    setSelectedAiPageRegionId(null);
    setSuggestionDraftMessage(null);
    setIsGeneratingAiDirectorSuggestions(false);
    aiDirectorSuggestionsRequestIdRef.current += 1;
    setProjectError(null);
    setProjectMessage(
      "Analyzing the uploaded page with AI. Previous temporary AI review data was cleared.",
    );

    try {
      const compressedImage = await createCompressedImageDataUrl(
        uploadedImage.objectUrl,
      );
      const requestBody: AnalyzePageRequest = {
        image: {
          fileName: uploadedImage.fileName,
          width: uploadedImage.width,
          height: uploadedImage.height,
          mimeType: uploadedImage.mimeType,
        },
        compressedImageDataUrl: compressedImage.dataUrl,
        compressedImageWidth: compressedImage.width,
        compressedImageHeight: compressedImage.height,
        cameraShots,
        focusRegions,
      };
      const response = await fetch("/api/analyze-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const responseJson = await response.json();

      if (requestId !== aiPageAnalysisRequestIdRef.current) {
        return;
      }

      if (!response.ok) {
        setAiPageUnderstandingResult({
          id: `ai-page-error-${Date.now()}`,
          source: "openai",
          providerModel: getProviderModelFromResponse(responseJson),
          createdAt: new Date().toISOString(),
          image: {
            fileName: uploadedImage.fileName,
            width: uploadedImage.width,
            height: uploadedImage.height,
            mimeType: uploadedImage.mimeType,
            analyzedWidth: compressedImage.width,
            analyzedHeight: compressedImage.height,
          },
          analysis: null,
          providerError: getProviderErrorFromResponse(responseJson),
        });
        setAiDirectorSuggestionsResult(null);
        setAiCameraSuggestionDrafts([]);
        setTemporarySuggestions(removeAiDerivedTemporarySuggestions);
        setProjectMessage(null);
        setProjectError("AI page analysis failed. Review the provider error below.");
        return;
      }

      const normalizedResult = normalizeAiPageUnderstandingResult(
        responseJson,
        requestBody.image,
      );

      setAiPageUnderstandingResult(normalizedResult);
      setAiDirectorSuggestionsResult(null);
      setAiCameraSuggestionDrafts([]);
      setTemporarySuggestions(removeAiDerivedTemporarySuggestions);
      setHoveredAiPageRegionId(null);
      setSelectedAiPageRegionId(null);
      setProjectError(null);
      setProjectMessage(
        `AI page analysis returned temporary review results from ${normalizedResult.providerModel}. Accepted project data is unchanged.`,
      );
    } catch (error) {
      if (requestId !== aiPageAnalysisRequestIdRef.current) {
        return;
      }

      setProjectMessage(null);
      setProjectError(
        error instanceof Error
          ? error.message
          : "AI page analysis could not be completed.",
      );
    } finally {
      if (requestId === aiPageAnalysisRequestIdRef.current) {
        setIsAnalyzingPageWithAi(false);
      }
    }
  }

  async function handleGenerateAiDirectorSuggestions() {
    if (
      !aiPageUnderstandingResult?.analysis ||
      isGeneratingAiDirectorSuggestions
    ) {
      return;
    }

    const pageUnderstanding = aiPageUnderstandingResult;
    const requestId = aiDirectorSuggestionsRequestIdRef.current + 1;
    aiDirectorSuggestionsRequestIdRef.current = requestId;
    setIsGeneratingAiDirectorSuggestions(true);
    setProjectError(null);
    setProjectMessage(
      "Generating temporary AI Director Suggestions from page understanding.",
    );

    try {
      const requestBody: GenerateAiDirectorSuggestionsRequest = {
        pageUnderstanding,
        acceptedContext: createDirectorRulebookAcceptedContext(
          cameraShots,
          focusRegions,
        ),
      };
      const response = await fetch("/api/generate-director-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const responseJson = await response.json();

      if (requestId !== aiDirectorSuggestionsRequestIdRef.current) {
        return;
      }

      if (!response.ok) {
        setAiDirectorSuggestionsResult({
          id: `ai-director-error-${Date.now()}`,
          source: "openai",
          providerModel: getProviderModelFromResponse(responseJson),
          createdAt: new Date().toISOString(),
          pageUnderstandingId: pageUnderstanding.id,
          suggestions: [],
          providerError: getProviderErrorFromResponse(responseJson),
        });
        setAiCameraSuggestionDrafts([]);
        setProjectMessage(null);
        setProjectError(
          "AI Director Suggestions failed. Review the provider error below.",
        );
        return;
      }

      const normalizedResult = normalizeAiDirectorSuggestionsResult(
        responseJson,
        pageUnderstanding,
      );

      setAiDirectorSuggestionsResult(normalizedResult);
      setAiCameraSuggestionDrafts(
        createAiCameraSuggestionDrafts(
          normalizedResult,
          pageUnderstanding,
          focusRegions,
        ),
      );
      setProjectError(null);
      setProjectMessage(
        `AI Camera Suggestions returned ${normalizedResult.suggestions.length} temporary review cards from ${normalizedResult.providerModel}; ${DIRECTOR_RULEBOOK_SOURCE_LABEL} post-processing was applied. Accepted project data is unchanged.`,
      );
    } catch (error) {
      if (requestId !== aiDirectorSuggestionsRequestIdRef.current) {
        return;
      }

      setProjectMessage(null);
      setProjectError(
        error instanceof Error
          ? error.message
          : "AI Director Suggestions could not be completed.",
      );
    } finally {
      if (requestId === aiDirectorSuggestionsRequestIdRef.current) {
        setIsGeneratingAiDirectorSuggestions(false);
      }
    }
  }

  const selectedShot =
    cameraShots.find((shot) => shot.id === selectedShotId) ?? null;
  const selectedFocusRegion =
    focusRegions.find(
      (focusRegion) => focusRegion.id === selectedFocusRegionId,
    ) ?? null;
  const detailHighlights = focusRegions.filter(
    (focusRegion) => focusRegion.kind === "detail",
  );
  const activeAiPageRegionId = hoveredAiPageRegionId ?? selectedAiPageRegionId;
  const aiPageHighlight = getAiPageHighlight(
    aiPageUnderstandingResult,
    activeAiPageRegionId,
  );

  useEffect(() => {
    if (
      !selectedAiPageRegionId ||
      !aiPageHighlight ||
      aiPageHighlight.id !== selectedAiPageRegionId
    ) {
      return;
    }

    console.debug("[ai-page-understanding] selected region geometry", {
      id: aiPageHighlight.id,
      label: aiPageHighlight.label,
      rawGeometry: aiPageHighlight.rawGeometry,
      geometrySpace: aiPageHighlight.geometrySpace,
      analyzedImage: {
        width: aiPageHighlight.analyzedImageWidth,
        height: aiPageHighlight.analyzedImageHeight,
      },
      sourceImage: {
        width: aiPageHighlight.sourceImageWidth,
        height: aiPageHighlight.sourceImageHeight,
      },
      svgRect: {
        x: aiPageHighlight.analyzedX,
        y: aiPageHighlight.analyzedY,
        width: aiPageHighlight.analyzedWidth,
        height: aiPageHighlight.analyzedHeight,
      },
    });
  }, [
    aiPageHighlight,
    selectedAiPageRegionId,
  ]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Manual cinematic editor</p>
          <h1>Cinematic Comic Video Converter</h1>
        </div>
        <div className="app-header-actions">
          <button
            className="secondary-action"
            type="button"
            onClick={handleImportButtonClick}
          >
            Import JSON
          </button>
          <input
            ref={projectImportInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={handleImportProjectFile}
          />
          <button
            className="secondary-action"
            type="button"
            onClick={handleImportArchiveButtonClick}
          >
            Import Archive
          </button>
          <input
            ref={projectArchiveInputRef}
            className="visually-hidden"
            type="file"
            accept=".ccvproject,application/json"
            onChange={handleImportProjectArchiveFile}
          />
          <button
            className="secondary-action"
            type="button"
            disabled={!uploadedImage}
            onClick={handleExportProject}
          >
            Export JSON
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={!uploadedImage}
            onClick={handleExportProjectArchive}
          >
            Export Archive
          </button>
          <label className="export-setting-control">
            <span>Resolution</span>
            <select
              value={videoExportResolution}
              disabled={isExportingVideo}
              onChange={(event) =>
                setVideoExportResolution(
                  event.target.value as ExportResolutionOption,
                )
              }
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </label>
          <label className="export-setting-control">
            <span>FPS</span>
            <select
              value={videoExportFps}
              disabled={isExportingVideo}
              onChange={(event) =>
                setVideoExportFps(event.target.value as ExportFpsOption)
              }
            >
              <option value="24">24</option>
              <option value="30">30</option>
            </select>
          </label>
          <label className="guided-option-control">
            <input
              type="checkbox"
              checked={guidedPageOptions.showPageEnter}
              onChange={(event) =>
                setGuidedPageOptions((options) => ({
                  ...options,
                  showPageEnter: event.target.checked,
                }))
              }
            />
            <span>Page Enter</span>
          </label>
          <label className="guided-option-control">
            <input
              type="checkbox"
              checked={guidedPageOptions.showPageExit}
              onChange={(event) =>
                setGuidedPageOptions((options) => ({
                  ...options,
                  showPageExit: event.target.checked,
                }))
              }
            />
            <span>Page Exit</span>
          </label>
          <button
            className="secondary-action"
            type="button"
            disabled={!uploadedImage || cameraShots.length === 0 || isExportingVideo}
            onClick={handleExportVideoPrototype}
          >
            {isExportingVideo ? "Exporting Video..." : "Export Video Prototype"}
          </button>
          {isExportingVideo ? (
            <button
              className="secondary-action"
              type="button"
              onClick={handleCancelVideoExport}
            >
              Cancel Export
            </button>
          ) : null}
        </div>
      </header>

      {projectError || projectMessage ? (
        <div className="project-status" role={projectError ? "alert" : "status"}>
          {projectError ?? projectMessage}
        </div>
      ) : null}

      {isExportingVideo ? (
        <div className="export-status" role="status" aria-live="polite">
          <div className="export-status-header">
            <strong>Video export</strong>
            <span>{formatProgressPercent(videoExportProgress?.progress ?? 0)}</span>
          </div>
          <progress
            max={100}
            value={Math.round((videoExportProgress?.progress ?? 0) * 100)}
          />
          <p>
            {videoExportProgress?.message ??
              "Preparing browser video export."}
          </p>
          {videoExportProgress?.totalDurationMs ? (
            <span>
              {formatDuration(videoExportProgress.elapsedMs)} /{" "}
              {formatDuration(videoExportProgress.totalDurationMs)}
            </span>
          ) : null}
          {videoExportFormatMessage ? <small>{videoExportFormatMessage}</small> : null}
        </div>
      ) : null}

      <section className="workspace" aria-label="Empty editor workspace">
        <aside className="workspace-sidebar" aria-label="Upload area">
          <ImageUploader
            image={uploadedImage}
            expectedImage={expectedImageMetadata}
            needsImage={isImportedProjectAwaitingImage}
            onImageLoaded={handleImageLoaded}
          />
          <BackgroundAudioPanel
            audio={backgroundAudio}
            expectedAudio={expectedBackgroundAudio}
            disabled={isExportingVideo}
            inputRef={backgroundAudioInputRef}
            onSelectAudio={handleSelectBackgroundAudio}
            onAudioFileChange={handleBackgroundAudioFile}
            onChangeSettings={handleChangeBackgroundAudioSettings}
            onRemoveAudio={handleRemoveBackgroundAudio}
          />
          <SoundEffectMarkersPanel
            markers={soundEffectMarkers}
            expectedMarkers={expectedSoundEffectMarkers}
            cameraShots={cameraShots}
            selectedShotId={selectedShotId}
            disabled={isExportingVideo}
            onAddMarker={handleAddSoundEffectMarker}
            onChangeMarker={handleChangeSoundEffectMarker}
            onRemoveMarker={handleRemoveSoundEffectMarker}
          />
        </aside>

        <section className="workspace-main" aria-label="Editor canvas">
          <PageViewer
            image={uploadedImage}
            shots={cameraShots}
            focusRegions={focusRegions}
            suggestions={temporarySuggestions}
            aiPageHighlight={aiPageHighlight}
            selectedShotId={selectedShotId}
            selectedFocusRegionId={selectedFocusRegionId}
            onSelectShot={handleSelectShot}
            onSelectFocusRegion={handleSelectFocusRegion}
            onChangeShot={handleChangeShot}
            onAddFocusRegion={handleAddFocusRegion}
            onChangeFocusRegion={handleChangeFocusRegion}
            onDeleteFocusRegion={handleDeleteFocusRegion}
            onAddShot={handleAddShot}
          />
          <Timeline
            image={uploadedImage}
            shots={cameraShots}
            selectedShotId={selectedShotId}
            onSelectShot={handleSelectShot}
            onMoveShot={handleMoveShot}
          />
          <PreviewPlayer
            image={uploadedImage}
            shots={cameraShots}
            focusRegions={focusRegions}
            guidedPageOptions={guidedPageOptions}
          />
        </section>

        <aside className="workspace-sidebar" aria-label="Inspector controls">
          <SuggestionsPanel
            image={uploadedImage}
            suggestions={temporarySuggestions}
            aiPageUnderstandingResult={aiPageUnderstandingResult}
            isAnalyzingPageWithAi={isAnalyzingPageWithAi}
            aiDirectorSuggestionsResult={aiDirectorSuggestionsResult}
            isGeneratingAiDirectorSuggestions={
              isGeneratingAiDirectorSuggestions
            }
            aiCameraSuggestionDrafts={aiCameraSuggestionDrafts}
            aiAudioSuggestionNotes={aiAudioSuggestionNotes}
            onAnalyzePageWithAi={handleAnalyzePageWithAi}
            onGenerateAiDirectorSuggestions={handleGenerateAiDirectorSuggestions}
            onGenerateAiAudioSuggestions={handleGenerateAiAudioSuggestionNotes}
            onCopyAiAudioSuggestionTerms={handleCopyAiAudioSuggestionTerms}
            onRejectAiAudioSuggestion={handleRejectAiAudioSuggestionNote}
            activeAiPageRegionId={activeAiPageRegionId}
            selectedAiPageRegionId={selectedAiPageRegionId}
            onHoverAiPageRegion={setHoveredAiPageRegionId}
            onSelectAiPageRegion={handleSelectAiPageRegion}
            detailHighlights={detailHighlights}
            selectedDetailHighlightId={selectedFocusRegionId}
            hiddenAiDetailFingerprints={hiddenAiDetailFingerprints}
            onAcceptAiDetail={handleAcceptAiDetail}
            onRejectAiDetail={handleRejectAiDetail}
            onSelectDetailHighlight={handleSelectFocusRegion}
            onChangeDetailHighlight={handleChangeFocusRegion}
            onDeleteDetailHighlight={handleDeleteFocusRegion}
            onInspectAiCameraSuggestionTarget={(target) => {
              if (target.type === "acceptedDetail") {
                handleSelectFocusRegion(target.id);
                return;
              }

              handleSelectAiPageRegion(target.id);
            }}
            onChangeAiCameraSuggestion={handleChangeAiCameraSuggestionDraft}
            onAcceptAiCameraSuggestion={handleAcceptAiCameraSuggestionDraft}
            onRejectAiCameraSuggestion={handleRejectAiCameraSuggestionDraft}
            onCreateShotAttentionPathSuggestion={
              handleCreateShotAttentionPathSuggestion
            }
            onApplyDirectorSuggestion={handleApplyAiDirectorSuggestion}
            onAcceptSuggestion={handleAcceptSuggestion}
            onRejectSuggestion={handleRejectSuggestion}
            draftMessage={suggestionDraftMessage}
            selectedShot={selectedShot}
            cameraShots={cameraShots}
            focusRegions={focusRegions}
          />
          <ShotInspector
            image={uploadedImage}
            selectedShot={selectedShot}
            selectedFocusRegion={selectedFocusRegion}
            focusRegions={focusRegions}
            shotCount={cameraShots.length}
            onChangeShot={handleChangeShot}
            onChangeFocusRegion={handleChangeFocusRegion}
            onDeleteShot={handleDeleteShot}
            onDeleteFocusRegion={handleDeleteFocusRegion}
          />
        </aside>
      </section>
    </main>
  );
}

function AiDirectorSuggestionsReview({
  image,
  selectedShot,
  cameraShots,
  focusRegions,
  onApplySuggestion,
}: {
  image: UploadedImage | null;
  selectedShot: CameraShot | null;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  onApplySuggestion: (suggestion: AiDirectorSuggestion) => void;
}) {
  const suggestions = createAiDirectorSuggestions(
    selectedShot,
    cameraShots,
    focusRegions,
  );
  const selectedShotHasNoPathItems =
    selectedShot !== null && (selectedShot.attentionPath?.length ?? 0) === 0;

  return (
    <div className="ai-director-content">
        {!image ? (
          <p className="suggestions-empty">
            Upload or import a page to inspect director notes.
          </p>
        ) : suggestions.length > 0 ? (
          <>
            <p className="suggestions-empty">
              Local director notes derived from accepted project data. They are
              not provider page understanding. Project data changes only when
              you apply one.
            </p>
            {selectedShotHasNoPathItems ? (
              <p className="ai-director-warning">
                No Shot Attention Path items available. Add Focus Regions to
                this shot's attention path before applying motion suggestions.
              </p>
            ) : null}
            <ul className="ai-director-list">
              {suggestions.map((suggestion) => (
                <li className="ai-director-item" key={suggestion.id}>
                  <div className="ai-director-item-header">
                    <span className="suggestion-type">{suggestion.mood}</span>
                    <strong>{suggestion.target}</strong>
                  </div>
                  <dl className="ai-director-metadata">
                    <div>
                      <dt>Motion</dt>
                      <dd>{formatDirectorMotionLabel(suggestion)}</dd>
                    </div>
                    <div>
                      <dt>Effect</dt>
                      <dd>{suggestion.effect}</dd>
                    </div>
                    <div>
                      <dt>Cue</dt>
                      <dd>{suggestion.cueTiming}</dd>
                    </div>
                    <div>
                      <dt>Confidence</dt>
                      <dd>{suggestion.confidence}</dd>
                    </div>
                  </dl>
                  <p>{suggestion.reason}</p>
                  {suggestion.warning ? (
                    <p className="ai-director-warning">
                      {suggestion.warning}
                    </p>
                  ) : null}
                  <div className="ai-director-actions">
                    {suggestion.canApply ? (
                      <button
                        className="secondary-action"
                        type="button"
                        onClick={() => onApplySuggestion(suggestion)}
                      >
                        {suggestion.targetType === "shot"
                          ? "Apply Effect"
                          : "Apply to Path"}
                      </button>
                    ) : (
                      <span className="ai-director-blocked">Blocked</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="suggestions-empty">
            Add a Camera Shot to inspect director notes.
          </p>
        )}
    </div>
  );
}

function AiProviderDirectorSuggestionsReview({
  pageUnderstandingResult,
  directorSuggestionsResult,
  isGenerating,
  cameraSuggestionDrafts,
  onGenerate,
  onInspectTarget,
  onChangeSuggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
}: {
  pageUnderstandingResult: AiPageUnderstandingResult | null;
  directorSuggestionsResult: AiDirectorSuggestionsResult | null;
  isGenerating: boolean;
  cameraSuggestionDrafts: AiCameraSuggestionDraft[];
  onGenerate: () => void;
  onInspectTarget: (target: AiCameraSuggestionTargetRef) => void;
  onChangeSuggestion: (
    suggestionId: string,
    changes: Partial<
      Pick<AiCameraSuggestionDraft, "movementRole" | "timingHint" | "reason">
    >,
  ) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string) => void;
}) {
  const hasUsableUnderstanding = Boolean(pageUnderstandingResult?.analysis);
  const groupedSuggestions = groupCameraSuggestionsByPanel(cameraSuggestionDrafts);
  const validationWarnings =
    directorSuggestionsResult?.validationWarnings ?? [];

  return (
    <div className="ai-provider-director-content">
      <div className="suggestion-seed-actions">
        <p className="suggestions-empty">
          Provider AI camera suggestions generated from the latest page
          understanding. These cards are temporary review data. Creating draft
          motion adds a temporary helper suggestion first; accepted project data
          changes only if that draft is explicitly accepted.
        </p>
        <button
          className="secondary-action"
          type="button"
          disabled={!hasUsableUnderstanding || isGenerating}
          onClick={onGenerate}
        >
          {isGenerating
            ? "Generating camera suggestions..."
            : "Generate AI Camera Suggestions"}
        </button>
        <p className="suggestions-empty" role="status">
          {getAiDirectorSuggestionStatus(
            pageUnderstandingResult,
            directorSuggestionsResult,
            isGenerating,
            cameraSuggestionDrafts.length,
          )}
        </p>
      </div>

      {directorSuggestionsResult?.providerError ? (
        <p className="ai-director-warning">
          {directorSuggestionsResult.providerError}
        </p>
      ) : null}

      {validationWarnings.length > 0 ? (
        <div className="ai-page-warning-list">
          {validationWarnings.map((warning) => (
            <p className="ai-director-warning" key={warning}>
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      {groupedSuggestions.length > 0 ? (
        <div className="ai-director-panel-groups">
          {groupedSuggestions.map((group) => (
            <section className="ai-director-panel-group" key={group.panelId}>
              <div className="ai-page-review-group-header">
                <strong>{group.panelLabel}</strong>
                <span>
                  {group.suggestions.length}{" "}
                  {group.suggestions.length === 1 ? "card" : "cards"}
                </span>
              </div>
              <ul className="ai-camera-suggestion-list">
                {group.suggestions.map((suggestion) => (
                  <li
                    className={[
                      "ai-camera-suggestion-card",
                      `is-${suggestion.status}`,
                    ].join(" ")}
                    key={suggestion.id}
                  >
                    <div className="ai-director-item-header">
                      <span
                        className={[
                          "suggestion-type",
                          `is-review-${suggestion.status}`,
                        ].join(" ")}
                      >
                        {suggestion.status}
                      </span>
                      <strong>{suggestion.target.label}</strong>
                    </div>
                    <p>{suggestion.compositionHint}</p>
                    <dl className="ai-director-metadata">
                      <div>
                        <dt>Target</dt>
                        <dd>{formatCameraSuggestionTarget(suggestion.target)}</dd>
                      </div>
                      <div>
                        <dt>Timing</dt>
                        <dd>{suggestion.timingHint}</dd>
                      </div>
                      <div>
                        <dt>Confidence</dt>
                        <dd>{suggestion.confidence}</dd>
                      </div>
                      <div>
                        <dt>Movement</dt>
                        <dd>{formatMotionRoleLabel(suggestion.movementRole)}</dd>
                      </div>
                    </dl>
                    <details className="ai-region-card-detail">
                      <summary>Inspect / edit suggestion</summary>
                      <div className="ai-camera-target-list">
                        <strong>Target references</strong>
                        <button
                          className="timeline-move-button"
                          type="button"
                          onClick={() => onInspectTarget(suggestion.target)}
                        >
                          Inspect {suggestion.target.label}
                        </button>
                        {suggestion.supportingTargets.length > 0 ? (
                          <ul>
                            {suggestion.supportingTargets.map((target) => (
                              <li key={`${suggestion.id}-${target.type}-${target.id}`}>
                                <span>{formatCameraSuggestionTarget(target)}</span>
                                <button
                                  className="timeline-move-button"
                                  type="button"
                                  onClick={() => onInspectTarget(target)}
                                >
                                  Inspect
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="suggestions-empty">Panel target only.</p>
                        )}
                      </div>
                      <label className="ai-detail-edit-field">
                        <span>Movement</span>
                        <select
                          value={suggestion.movementRole}
                          onChange={(event) =>
                            onChangeSuggestion(suggestion.id, {
                              movementRole: event.target
                                .value as AiCameraSuggestionDraft["movementRole"],
                            })
                          }
                          disabled={
                            suggestion.status === "rejected" ||
                            suggestion.status === "blocked"
                          }
                        >
                          <option value="track">Track</option>
                          <option value="pushIn">Push In</option>
                          <option value="pushOut">Push Out</option>
                        </select>
                      </label>
                      <label className="ai-detail-edit-field">
                        <span>Timing hint</span>
                        <select
                          value={suggestion.timingHint}
                          onChange={(event) =>
                            onChangeSuggestion(suggestion.id, {
                              timingHint: event.target
                                .value as AiCameraSuggestionDraft["timingHint"],
                            })
                          }
                          disabled={
                            suggestion.status === "rejected" ||
                            suggestion.status === "blocked"
                          }
                        >
                          <option value="slow">Slow</option>
                          <option value="medium">Medium</option>
                          <option value="fast">Fast</option>
                        </select>
                      </label>
                      <label className="ai-detail-edit-field">
                        <span>Reason</span>
                        <textarea
                          value={suggestion.reason}
                          onChange={(event) =>
                            onChangeSuggestion(suggestion.id, {
                              reason: event.target.value,
                            })
                          }
                          disabled={
                            suggestion.status === "rejected" ||
                            suggestion.status === "blocked"
                          }
                        />
                      </label>
                      {suggestion.warnings.map((warning) => (
                        <p className="ai-director-warning" key={warning}>
                          {warning}
                        </p>
                      ))}
                    </details>
                    {suggestion.status === "rejected" ? (
                      <p className="suggestions-empty">
                        Rejected in this review session. Accepted project data
                        was not changed.
                      </p>
                    ) : null}
                    <div className="suggestion-actions">
                      <button
                        className="secondary-action"
                        type="button"
                        disabled={
                          suggestion.status === "blocked" ||
                          suggestion.status === "stale" ||
                          suggestion.status === "drafted"
                        }
                        onClick={() => onAcceptSuggestion(suggestion.id)}
                      >
                        Create Draft Motion
                      </button>
                      <button
                        className="timeline-move-button"
                        type="button"
                        disabled={suggestion.status === "rejected"}
                        onClick={() => onRejectSuggestion(suggestion.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      {directorSuggestionsResult?.usage ? (
        <details className="ai-review-section">
          <summary>Director Suggestion Usage</summary>
          <dl className="ai-director-metadata">
            <div>
              <dt>Input tokens</dt>
              <dd>
                {formatOptionalNumber(
                  directorSuggestionsResult.usage.inputTokens,
                )}
              </dd>
            </div>
            <div>
              <dt>Output tokens</dt>
              <dd>
                {formatOptionalNumber(
                  directorSuggestionsResult.usage.outputTokens,
                )}
              </dd>
            </div>
            <div>
              <dt>Total tokens</dt>
              <dd>
                {formatOptionalNumber(
                  directorSuggestionsResult.usage.totalTokens,
                )}
              </dd>
            </div>
            <div>
              <dt>Est. cost</dt>
              <dd>
                {formatOptionalCost(
                  directorSuggestionsResult.usage.estimatedCostUsd,
                )}
              </dd>
            </div>
          </dl>
        </details>
      ) : null}
    </div>
  );
}

function AiAudioSuggestionNotesReview({
  notes,
  cameraShots,
  focusRegions,
  onGenerate,
  onCopyTerms,
  onRejectNote,
}: {
  notes: AiAudioSuggestionNote[];
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  onGenerate: () => void;
  onCopyTerms: (noteId: string) => void;
  onRejectNote: (noteId: string) => void;
}) {
  const visibleNotes = notes.filter((note) => note.status !== "rejected");

  return (
    <div className="ai-provider-director-content">
      <div className="suggestion-seed-actions">
        <p className="suggestions-empty">
          Read-only advisory notes derived from accepted Camera Shots, accepted
          attention paths, accepted Focus Regions, and existing audio metadata.
          These notes can be copied or rejected, but they never create audio
          assets or SFX markers.
        </p>
        <button
          className="secondary-action"
          type="button"
          disabled={cameraShots.length === 0}
          onClick={onGenerate}
        >
          Generate Audio Notes
        </button>
        <p className="suggestions-empty" role="status">
          {getAiAudioSuggestionStatus(notes, cameraShots)}
        </p>
      </div>

      {visibleNotes.length > 0 ? (
        <ul className="ai-audio-note-list">
          {visibleNotes.map((note) => (
            <li
              className={["ai-audio-note-card", `is-${note.status}`].join(" ")}
              key={note.id}
            >
              <div className="ai-director-item-header">
                <span
                  className={["suggestion-type", `is-review-${note.status}`].join(
                    " ",
                  )}
                >
                  {formatAiAudioSuggestionKind(note.kind)}
                </span>
                <strong>{note.suggestion}</strong>
              </div>
              <dl className="ai-director-metadata">
                <div>
                  <dt>Target</dt>
                  <dd>{formatAiAudioSuggestionTarget(note.target)}</dd>
                </div>
                <div>
                  <dt>Timing</dt>
                  <dd>{note.timing}</dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{note.confidence}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{note.status}</dd>
                </div>
              </dl>
              <p>{note.reason}</p>
              {note.searchTerms.length > 0 ? (
                <div className="ai-audio-search-terms">
                  <strong>Search terms</strong>
                  <span>{note.searchTerms.join(", ")}</span>
                </div>
              ) : null}
              {note.warnings.map((warning) => (
                <p className="ai-director-warning" key={warning}>
                  {warning}
                </p>
              ))}
              <div className="suggestion-actions">
                <button
                  className="secondary-action"
                  type="button"
                  disabled={
                    note.searchTerms.length === 0 ||
                    note.status === "stale" ||
                    note.status === "blocked"
                  }
                  onClick={() => onCopyTerms(note.id)}
                >
                  Copy Terms
                </button>
                <button
                  className="timeline-move-button"
                  type="button"
                  onClick={() => onRejectNote(note.id)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {notes.some((note) => note.status === "rejected") ? (
        <p className="suggestions-empty">
          Rejected audio notes are hidden for this temporary review session.
          Accepted project data is unchanged.
        </p>
      ) : null}

      {focusRegions.length === 0 ? (
        <p className="suggestions-empty">
          Add accepted Focus Regions and attention paths for more precise SFX
          cue notes.
        </p>
      ) : null}
    </div>
  );
}

type BackgroundAudioPanelProps = {
  audio: UploadedBackgroundAudio | null;
  expectedAudio: ImportedBackgroundAudio | null;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelectAudio: () => void;
  onAudioFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeSettings: (settings: BackgroundAudioSettings) => void;
  onRemoveAudio: () => void;
};

function BackgroundAudioPanel({
  audio,
  expectedAudio,
  disabled,
  inputRef,
  onSelectAudio,
  onAudioFileChange,
  onChangeSettings,
  onRemoveAudio,
}: BackgroundAudioPanelProps) {
  function updateSettings(partialSettings: Partial<BackgroundAudioSettings>) {
    if (!audio) {
      return;
    }

    onChangeSettings({
      ...audio.settings,
      ...partialSettings,
    });
  }

  return (
    <section className="panel background-audio-panel">
      <div className="panel-heading">
        <span className="panel-kicker">Audio</span>
        <h2>Background music</h2>
      </div>

      <div className="audio-content">
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="audio/*"
          onChange={onAudioFileChange}
        />
        <button
          className="secondary-action"
          type="button"
          disabled={disabled}
          onClick={onSelectAudio}
        >
          {audio ? "Replace Audio" : "Upload Audio"}
        </button>

        {audio ? (
          <>
            <dl className="image-metadata" aria-label="Background audio metadata">
              <div>
                <dt>File name</dt>
                <dd>{audio.fileName}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{formatDuration(audio.durationMs)}</dd>
              </div>
              <div>
                <dt>MIME type</dt>
                <dd>{audio.mimeType || "Unavailable"}</dd>
              </div>
            </dl>

            <div className="audio-control-grid">
              <label className="guided-option-control">
                <input
                  type="checkbox"
                  checked={audio.settings.enabled}
                  disabled={disabled}
                  onChange={(event) =>
                    updateSettings({ enabled: event.target.checked })
                  }
                />
                <span>Include</span>
              </label>
              <label className="guided-option-control">
                <input
                  type="checkbox"
                  checked={audio.settings.loop}
                  disabled={disabled}
                  onChange={(event) =>
                    updateSettings({ loop: event.target.checked })
                  }
                />
                <span>Loop</span>
              </label>
            </div>

            <label className="field">
              <span>Trim start</span>
              <input
                type="number"
                min={0}
                max={toSeconds(audio.durationMs)}
                step={0.1}
                value={toSeconds(audio.settings.trimStartMs)}
                disabled={disabled}
                onChange={(event) =>
                  updateSettings({
                    trimStartMs: secondsInputToMilliseconds(event.target.value),
                  })
                }
              />
            </label>
            <label className="field">
              <span>Trim end</span>
              <input
                type="number"
                min={0.1}
                max={toSeconds(audio.durationMs)}
                step={0.1}
                value={toSeconds(audio.settings.trimEndMs)}
                disabled={disabled}
                onChange={(event) =>
                  updateSettings({
                    trimEndMs: secondsInputToMilliseconds(event.target.value),
                  })
                }
              />
            </label>
            <label className="field">
              <span>Fade in</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={toSeconds(audio.settings.fadeInMs)}
                disabled={disabled}
                onChange={(event) =>
                  updateSettings({
                    fadeInMs: secondsInputToMilliseconds(event.target.value),
                  })
                }
              />
            </label>
            <label className="field">
              <span>Fade out</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={toSeconds(audio.settings.fadeOutMs)}
                disabled={disabled}
                onChange={(event) =>
                  updateSettings({
                    fadeOutMs: secondsInputToMilliseconds(event.target.value),
                  })
                }
              />
            </label>
            <label className="field">
              <span>Volume</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(audio.settings.volume * 100)}
                disabled={disabled}
                onChange={(event) =>
                  updateSettings({ volume: Number(event.target.value) / 100 })
                }
              />
            </label>

            <button
              className="secondary-action"
              type="button"
              disabled={disabled}
              onClick={onRemoveAudio}
            >
              Remove Audio
            </button>
          </>
        ) : expectedAudio ? (
          <div className="imported-image-needed">
            <p>Background audio needed.</p>
            <span>
              This project expects the original background music. Re-select the
              audio file before exporting with audio.
            </span>
            <dl className="image-metadata" aria-label="Expected audio metadata">
              <div>
                <dt>Expected file</dt>
                <dd>{expectedAudio.fileName}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{formatDuration(expectedAudio.durationMs)}</dd>
              </div>
              <div>
                <dt>MIME type</dt>
                <dd>{expectedAudio.mimeType || "Unavailable"}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="placeholder-box audio-empty">
            <p>No background music.</p>
            <span>Upload one audio file to mix under the exported video.</span>
          </div>
        )}
      </div>
    </section>
  );
}

type SoundEffectMarkersPanelProps = {
  markers: UploadedSoundEffectMarker[];
  expectedMarkers: SoundEffectMarkerMetadata[];
  cameraShots: CameraShot[];
  selectedShotId: string | null;
  disabled: boolean;
  onAddMarker: (file: File, targetShotId: string) => void;
  onChangeMarker: (marker: UploadedSoundEffectMarker) => void;
  onRemoveMarker: (markerId: string) => void;
};

function SoundEffectMarkersPanel({
  markers,
  expectedMarkers,
  cameraShots,
  selectedShotId,
  disabled,
  onAddMarker,
  onChangeMarker,
  onRemoveMarker,
}: SoundEffectMarkersPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [targetShotId, setTargetShotId] = useState(selectedShotId ?? "");
  const hasTargetShot = cameraShots.some((shot) => shot.id === targetShotId);
  const hasSelectedShot = cameraShots.some((shot) => shot.id === selectedShotId);
  const defaultShotId =
    (hasTargetShot ? targetShotId : "") ||
    (hasSelectedShot ? selectedShotId ?? "" : "") ||
    cameraShots[0]?.id ||
    "";

  useEffect(() => {
    if (!targetShotId || !hasTargetShot) {
      setTargetShotId(
        (hasSelectedShot ? selectedShotId ?? "" : "") || cameraShots[0]?.id || "",
      );
    }
  }, [cameraShots, hasSelectedShot, hasTargetShot, selectedShotId, targetShotId]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !defaultShotId) {
      return;
    }

    onAddMarker(file, defaultShotId);
  }

  return (
    <section className="panel sound-effects-panel">
      <div className="panel-heading">
        <span className="panel-kicker">Audio</span>
        <h2>Sound effects</h2>
      </div>

      <div className="audio-content">
        <label className="field">
          <span>Target shot</span>
          <select
            value={defaultShotId}
            disabled={disabled || cameraShots.length === 0}
            onChange={(event) => setTargetShotId(event.target.value)}
          >
            {cameraShots.length === 0 ? (
              <option value="">No shots</option>
            ) : (
              cameraShots.map((shot) => (
                <option key={shot.id} value={shot.id}>
                  {shot.label}
                </option>
              ))
            )}
          </select>
        </label>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
        />
        <button
          className="secondary-action"
          type="button"
          disabled={disabled || !defaultShotId}
          onClick={() => inputRef.current?.click()}
        >
          Add SFX Marker
        </button>

        {markers.length > 0 || expectedMarkers.length > 0 ? (
          <ul className="sfx-marker-list">
            {markers.map((marker) => (
              <li className="sfx-marker-item" key={marker.id}>
                <label className="field">
                  <span>Label</span>
                  <input
                    type="text"
                    value={marker.label}
                    disabled={disabled}
                    onChange={(event) =>
                      onChangeMarker({ ...marker, label: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>Shot</span>
                  <select
                    value={marker.targetShotId}
                    disabled={disabled}
                    onChange={(event) =>
                      onChangeMarker({
                        ...marker,
                        targetShotId: event.target.value,
                      })
                    }
                  >
                    {cameraShots.map((shot) => (
                      <option key={shot.id} value={shot.id}>
                        {shot.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="audio-control-grid">
                  <label className="field">
                    <span>Offset</span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={toSeconds(marker.offsetMs)}
                      disabled={disabled}
                      onChange={(event) =>
                        onChangeMarker({
                          ...marker,
                          offsetMs: secondsInputToMilliseconds(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Play length</span>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={toSeconds(marker.playDurationMs)}
                      disabled={disabled}
                      onChange={(event) =>
                        onChangeMarker({
                          ...marker,
                          playDurationMs: secondsInputToMilliseconds(
                            event.target.value,
                          ),
                        })
                      }
                    />
                  </label>
                </div>
                <div className="audio-control-grid">
                  <label className="field">
                    <span>Lasts shots</span>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, cameraShots.length)}
                      step={1}
                      value={marker.shotSpan}
                      disabled={disabled}
                      onChange={(event) =>
                        onChangeMarker({
                          ...marker,
                          shotSpan: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Volume</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(marker.volume * 100)}
                      disabled={disabled}
                      onChange={(event) =>
                        onChangeMarker({
                          ...marker,
                          volume: Number(event.target.value) / 100,
                        })
                      }
                    />
                  </label>
                </div>
                <dl className="image-metadata" aria-label="SFX metadata">
                  <div>
                    <dt>File</dt>
                    <dd>{marker.fileName}</dd>
                  </div>
                  <div>
                    <dt>Length</dt>
                    <dd>{formatDuration(marker.durationMs)}</dd>
                  </div>
                </dl>
                <button
                  className="secondary-action"
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemoveMarker(marker.id)}
                >
                  Remove SFX
                </button>
              </li>
            ))}
            {expectedMarkers.map((marker) => (
              <li className="sfx-marker-item is-missing" key={marker.id}>
                <div className="suggestion-item-main">
                  <span className="suggestion-type">Missing SFX File</span>
                  <strong>{marker.label}</strong>
                  <small>{getShotLabel(marker.targetShotId, cameraShots)}</small>
                  <p>
                    {marker.fileName} at {formatDuration(marker.offsetMs)}; use
                    a project archive to restore audio binary.
                  </p>
                </div>
                <button
                  className="secondary-action"
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemoveMarker(marker.id)}
                >
                  Remove Marker
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="placeholder-box audio-empty">
            <p>No sound effects.</p>
            <span>Add short one-shot sounds tied to camera shots.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function SuggestionsPanel({
  image,
  suggestions,
  aiPageUnderstandingResult,
  isAnalyzingPageWithAi,
  aiDirectorSuggestionsResult,
  isGeneratingAiDirectorSuggestions,
  aiCameraSuggestionDrafts,
  aiAudioSuggestionNotes,
  onAnalyzePageWithAi,
  onGenerateAiDirectorSuggestions,
  onGenerateAiAudioSuggestions,
  onCopyAiAudioSuggestionTerms,
  onRejectAiAudioSuggestion,
  activeAiPageRegionId,
  selectedAiPageRegionId,
  onHoverAiPageRegion,
  onSelectAiPageRegion,
  detailHighlights,
  selectedDetailHighlightId,
  hiddenAiDetailFingerprints,
  onAcceptAiDetail,
  onRejectAiDetail,
  onSelectDetailHighlight,
  onChangeDetailHighlight,
  onDeleteDetailHighlight,
  onInspectAiCameraSuggestionTarget,
  onChangeAiCameraSuggestion,
  onAcceptAiCameraSuggestion,
  onRejectAiCameraSuggestion,
  selectedShot,
  cameraShots,
  focusRegions,
  draftMessage,
  onCreateShotAttentionPathSuggestion,
  onApplyDirectorSuggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
}: {
  image: UploadedImage | null;
  suggestions: TemporarySuggestion[];
  aiPageUnderstandingResult: AiPageUnderstandingResult | null;
  isAnalyzingPageWithAi: boolean;
  aiDirectorSuggestionsResult: AiDirectorSuggestionsResult | null;
  isGeneratingAiDirectorSuggestions: boolean;
  aiCameraSuggestionDrafts: AiCameraSuggestionDraft[];
  aiAudioSuggestionNotes: AiAudioSuggestionNote[];
  onAnalyzePageWithAi: () => void;
  onGenerateAiDirectorSuggestions: () => void;
  onGenerateAiAudioSuggestions: () => void;
  onCopyAiAudioSuggestionTerms: (noteId: string) => void;
  onRejectAiAudioSuggestion: (noteId: string) => void;
  activeAiPageRegionId: string | null;
  selectedAiPageRegionId: string | null;
  onHoverAiPageRegion: (regionId: string | null) => void;
  onSelectAiPageRegion: (regionId: string | null) => void;
  detailHighlights: FocusRegion[];
  selectedDetailHighlightId: string | null;
  hiddenAiDetailFingerprints: string[];
  onAcceptAiDetail: (region: AiPageUnderstandingRegion) => void;
  onRejectAiDetail: (region: AiPageUnderstandingRegion) => void;
  onSelectDetailHighlight: (detailId: string) => void;
  onChangeDetailHighlight: (detail: FocusRegion) => void;
  onDeleteDetailHighlight: (detailId: string) => void;
  onInspectAiCameraSuggestionTarget: (
    target: AiCameraSuggestionTargetRef,
  ) => void;
  onChangeAiCameraSuggestion: (
    suggestionId: string,
    changes: Partial<
      Pick<AiCameraSuggestionDraft, "movementRole" | "timingHint" | "reason">
    >,
  ) => void;
  onAcceptAiCameraSuggestion: (suggestionId: string) => void;
  onRejectAiCameraSuggestion: (suggestionId: string) => void;
  selectedShot: CameraShot | null;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  draftMessage: string | null;
  onCreateShotAttentionPathSuggestion: () => void;
  onApplyDirectorSuggestion: (suggestion: AiDirectorSuggestion) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string) => void;
}) {
  return (
    <section className="panel suggestions-panel">
      <div className="panel-heading">
        <span className="panel-kicker">Temporary review</span>
        <h2>AI Review</h2>
      </div>

      <div className="suggestions-content">
        <div className="ai-review-primary">
          <button
            className="primary-action"
            type="button"
            disabled={!image || isAnalyzingPageWithAi}
            onClick={onAnalyzePageWithAi}
          >
            {isAnalyzingPageWithAi
              ? "Analyzing page..."
              : "Analyze page with AI"}
          </button>
          <p className="suggestions-empty" role="status">
            {getAiReviewStatus(
              image,
              aiPageUnderstandingResult,
              isAnalyzingPageWithAi,
            )}
          </p>
        </div>
        <AiPageUnderstandingReview
          result={aiPageUnderstandingResult}
          activeRegionId={activeAiPageRegionId}
          selectedRegionId={selectedAiPageRegionId}
          onHoverRegion={onHoverAiPageRegion}
          onSelectRegion={onSelectAiPageRegion}
          detailHighlights={detailHighlights}
          selectedDetailHighlightId={selectedDetailHighlightId}
          image={image}
          hiddenAiDetailFingerprints={hiddenAiDetailFingerprints}
          onAcceptAiDetail={onAcceptAiDetail}
          onRejectAiDetail={onRejectAiDetail}
          onSelectDetailHighlight={onSelectDetailHighlight}
          onChangeDetailHighlight={onChangeDetailHighlight}
          onDeleteDetailHighlight={onDeleteDetailHighlight}
        />

        <details className="ai-review-section" open>
          <summary>AI Camera Suggestions</summary>
          <AiProviderDirectorSuggestionsReview
            pageUnderstandingResult={aiPageUnderstandingResult}
            directorSuggestionsResult={aiDirectorSuggestionsResult}
            isGenerating={isGeneratingAiDirectorSuggestions}
            cameraSuggestionDrafts={aiCameraSuggestionDrafts}
            onGenerate={onGenerateAiDirectorSuggestions}
            onInspectTarget={onInspectAiCameraSuggestionTarget}
            onChangeSuggestion={onChangeAiCameraSuggestion}
            onAcceptSuggestion={onAcceptAiCameraSuggestion}
            onRejectSuggestion={onRejectAiCameraSuggestion}
          />
        </details>

        <details className="ai-review-section">
          <summary>Audio Notes</summary>
          <AiAudioSuggestionNotesReview
            notes={aiAudioSuggestionNotes}
            cameraShots={cameraShots}
            focusRegions={focusRegions}
            onGenerate={onGenerateAiAudioSuggestions}
            onCopyTerms={onCopyAiAudioSuggestionTerms}
            onRejectNote={onRejectAiAudioSuggestion}
          />
        </details>

        <details className="ai-review-section">
          <summary>Director Notes</summary>
          <AiDirectorSuggestionsReview
            image={image}
            selectedShot={selectedShot}
            cameraShots={cameraShots}
            focusRegions={focusRegions}
            onApplySuggestion={onApplyDirectorSuggestion}
          />
        </details>

        <details className="ai-review-section">
          <summary>Helper Drafts</summary>
          <div className="suggestion-seed-actions">
            <p className="suggestions-empty">
              Manual helper. This drafts a temporary attention path from
              existing Focus Regions only; it is not real provider AI page
              understanding.
            </p>
            <button
              className="secondary-action"
              type="button"
              disabled={!image}
              onClick={onCreateShotAttentionPathSuggestion}
            >
              Draft path from existing Focus Regions
            </button>
            <p className="suggestions-empty" role="status">
              {draftMessage ??
                (selectedShot
                  ? `Helper draft target: ${selectedShot.label}`
                  : "Select a shot before drafting a helper attention path.")}
            </p>
          </div>
        </details>

        {suggestions.length > 0 ? (
          <details className="ai-review-section">
            <summary>Temporary Helper Suggestions ({suggestions.length})</summary>
            <ul className="suggestion-list">
            {suggestions.map((suggestion) => (
              <li className="suggestion-item" key={suggestion.id}>
                <div className="suggestion-item-main">
                  <span className="suggestion-type">
                    {formatSuggestionType(suggestion.type)}
                  </span>
                  <strong>
                    {getSuggestionTitle(suggestion, cameraShots)}
                  </strong>
                  <small>
                    {suggestion.source} | confidence {suggestion.confidence}
                  </small>
                  <p>{suggestion.reason}</p>
                  {suggestion.type === "draftMotion" ? (
                    <div className="ai-camera-target-list">
                      <dl className="suggestion-geometry">
                        <div>
                          <dt>Shot</dt>
                          <dd>{suggestion.proposedValues.cameraShot.label}</dd>
                        </div>
                        <div>
                          <dt>Focus Regions</dt>
                          <dd>{suggestion.proposedValues.focusRegions.length}</dd>
                        </div>
                        <div>
                          <dt>Path Items</dt>
                          <dd>{suggestion.proposedValues.pathItems.length}</dd>
                        </div>
                        <div>
                          <dt>Duration</dt>
                          <dd>
                            {suggestion.proposedValues.cameraShot.durationMs}ms
                          </dd>
                        </div>
                      </dl>
                      <ol className="suggestion-path-list">
                        {suggestion.proposedValues.pathItems.map((pathItem) => {
                          const draftFocusRegion =
                            suggestion.proposedValues.focusRegions.find(
                              (region) =>
                                region.draftFocusRegionId ===
                                pathItem.focusRegionId,
                            );

                          return (
                            <li key={pathItem.focusRegionId}>
                              <strong>
                                {draftFocusRegion
                                  ? `${draftFocusRegion.label} (${draftFocusRegion.kind})`
                                  : `Missing draft focus ${pathItem.focusRegionId}`}
                              </strong>
                              <span>
                                {formatMotionRoleLabel(pathItem.motionRole)} /
                                weight {pathItem.durationWeight}
                              </span>
                              <small>{pathItem.reason}</small>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  ) : suggestion.type === "shotAttentionPath" ? (
                    <ol className="suggestion-path-list">
                      {getSuggestionDraftPathItems(suggestion).map(
                        (pathItem) => {
                          const focusRegion = focusRegions.find(
                            (region) => region.id === pathItem.focusRegionId,
                          );

                          return (
                            <li key={pathItem.focusRegionId}>
                              <strong>
                                {focusRegion
                                  ? `${focusRegion.label} (${focusRegion.kind})`
                                  : `Missing focus region ${pathItem.focusRegionId}`}
                              </strong>
                              <span>
                                {formatMotionRoleLabel(pathItem.motionRole)} /
                                weight {pathItem.durationWeight}
                              </span>
                              <small>{pathItem.reason}</small>
                            </li>
                          );
                        },
                      )}
                    </ol>
                  ) : (
                    <dl className="suggestion-geometry">
                      <div>
                        <dt>X</dt>
                        <dd>{suggestion.proposedValues.x}px</dd>
                      </div>
                      <div>
                        <dt>Y</dt>
                        <dd>{suggestion.proposedValues.y}px</dd>
                      </div>
                      <div>
                        <dt>W</dt>
                        <dd>{suggestion.proposedValues.width}px</dd>
                      </div>
                      <div>
                        <dt>H</dt>
                        <dd>{suggestion.proposedValues.height}px</dd>
                      </div>
                    </dl>
                  )}
                </div>
                <div className="suggestion-actions">
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() => onAcceptSuggestion(suggestion.id)}
                  >
                    Accept
                  </button>
                  <button
                    className="timeline-move-button"
                    type="button"
                    onClick={() => onRejectSuggestion(suggestion.id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  );
}

function getAiReviewStatus(
  image: UploadedImage | null,
  result: AiPageUnderstandingResult | null,
  isAnalyzing: boolean,
) {
  if (!image) {
    return "Upload or import a page before running real AI page analysis.";
  }

  if (isAnalyzing) {
    return "Analyzing a compressed copy of the current page through the local provider proxy.";
  }

  if (!result) {
    return "No AI page analysis yet. Results stay temporary until a later explicit workflow uses them.";
  }

  if (!result.analysis) {
    return `Latest analysis returned a provider error from ${result.providerModel}.`;
  }

  const analysis = result.analysis;
  const regionCount =
    analysis.panels.length +
    analysis.characterRegions.length +
    analysis.speechRegions.length +
    analysis.detailRegions.length +
    analysis.actionRegions.length;

  const warningCount =
    analysis.warnings.length + (result.validationWarnings?.length ?? 0);
  const staleLabel = result.isStale ? "stale, " : "";

  return `Latest analysis: ${staleLabel}${analysis.mood.label} mood, ${analysis.panels.length} panels, ${regionCount} regions, ${warningCount} warnings.`;
}

function getAiDirectorSuggestionStatus(
  pageUnderstandingResult: AiPageUnderstandingResult | null,
  directorSuggestionsResult: AiDirectorSuggestionsResult | null,
  isGenerating: boolean,
  reviewCardCount = 0,
) {
  if (!pageUnderstandingResult?.analysis) {
    return "Run AI page understanding before generating AI camera suggestions.";
  }

  if (isGenerating) {
    return "Generating temporary review cards from the latest page-understanding result.";
  }

  if (!directorSuggestionsResult) {
    return "No AI Camera Suggestions yet. Cards will stay separate from accepted project data.";
  }

  if (directorSuggestionsResult.providerError) {
    return `Latest camera suggestion request returned a provider error from ${directorSuggestionsResult.providerModel}.`;
  }

  const suppressedCount = Math.max(
    0,
    directorSuggestionsResult.suggestions.length - reviewCardCount,
  );
  const suppressionLabel =
    suppressedCount > 0
      ? ` (${suppressedCount} raw provider suggestion${suppressedCount === 1 ? "" : "s"} suppressed by density guardrails)`
      : "";

  return `Latest camera suggestions from ${directorSuggestionsResult.providerModel}: ${reviewCardCount} review-only card${reviewCardCount === 1 ? "" : "s"}${suppressionLabel}.`;
}

function getAiAudioSuggestionStatus(
  notes: AiAudioSuggestionNote[],
  cameraShots: CameraShot[],
) {
  if (cameraShots.length === 0) {
    return "Add accepted Camera Shots before generating read-only audio notes.";
  }

  if (notes.length === 0) {
    return "No audio notes yet. Generated notes stay temporary and do not create audio assets.";
  }

  const activeCount = notes.filter((note) => note.status !== "rejected").length;
  const staleCount = notes.filter((note) => note.status === "stale").length;
  const copiedCount = notes.filter((note) => note.status === "copied").length;

  return `${activeCount} visible audio note${activeCount === 1 ? "" : "s"} (${copiedCount} copied, ${staleCount} stale). Notes are not saved to Project JSON.`;
}

function createAiAudioSuggestionNotes({
  cameraShots,
  focusRegions,
  backgroundAudio,
  soundEffectMarkers,
  startIndex,
}: {
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  backgroundAudio: UploadedBackgroundAudio | null;
  soundEffectMarkers: UploadedSoundEffectMarker[];
  startIndex: number;
}) {
  if (cameraShots.length === 0) {
    return [];
  }

  const createdAt = new Date().toISOString();
  let noteNumber = startIndex;
  const notes: AiAudioSuggestionNote[] = [];
  const projectPurposeSummary = summarizeShotPurposes(cameraShots);

  notes.push({
    id: createAiAudioSuggestionId(noteNumber++),
    kind: "bgmTone",
    target: { type: "project", label: "Whole project" },
    timing: "project-wide",
    suggestion: getBgmToneSuggestion(projectPurposeSummary),
    searchTerms: getBgmToneSearchTerms(projectPurposeSummary),
    reason:
      `${DIRECTOR_RULEBOOK_SOURCE_LABEL}: BGM follows page/sequence mood, not every detected panel. Derived from accepted Camera Shot purposes and pacing. Use these terms only in a licensed or user-owned audio library.`,
    confidence: "medium",
    warnings: backgroundAudio
      ? [
          `Existing background audio is ${backgroundAudio.fileName}; compare any new idea manually before replacing it.`,
        ]
      : ["No background audio is loaded; this is a search note only."],
    status: "new",
    createdAt,
  });

  if (cameraShots.length > 1) {
    notes.push({
      id: createAiAudioSuggestionId(noteNumber++),
      kind: "bgmPacing",
      target: { type: "project", label: "Whole project" },
      timing: "project-wide",
      suggestion: getBgmPacingSuggestion(cameraShots),
      searchTerms: getBgmPacingSearchTerms(cameraShots),
      reason:
        `${DIRECTOR_RULEBOOK_SOURCE_LABEL}: audio pacing supports accepted camera beats instead of creating new story beats. Based on accepted shot count, durations, and the need to preserve readable camera timing.`,
      confidence: "medium",
      warnings: ["Keep music restrained under speech-heavy or gag-timing shots."],
      status: "new",
      createdAt,
    });
  }

  const pathCueNotes = createAiAudioPathCueNotes(
    cameraShots,
    focusRegions,
    createdAt,
    noteNumber,
  );
  noteNumber += pathCueNotes.length;
  notes.push(...pathCueNotes);

  const speechRegionCount = focusRegions.filter(
    (region) => region.kind === "speech",
  ).length;
  const dialogueShotCount = cameraShots.filter(
    (shot) => shot.shotPurpose === "dialogue",
  ).length;

  if (speechRegionCount > 0 || dialogueShotCount > 0) {
    notes.push({
      id: createAiAudioSuggestionId(noteNumber++),
      kind: "sfxRestraint",
      target: { type: "project", label: "Whole project" },
      timing: "manual review needed",
      suggestion: "Leave speech-heavy beats uncluttered; use quiet beds or very sparse accents.",
      searchTerms: ["quiet room tone", "subtle ambience", "minimal comic accent"],
      reason:
        `${DIRECTOR_RULEBOOK_SOURCE_LABEL}: speech regions are timing/hold evidence, not automatic SFX targets. Accepted speech Focus Regions or dialogue shot purposes suggest readability should take priority over dense SFX.`,
      confidence: "medium",
      warnings: [
        formatDirectorRuleWarning(
          "DR-AUDIO-SPEECH-RESTRAINT",
          "do not create SFX for every speech balloon.",
        ),
      ],
      status: "new",
      createdAt,
    });
  }

  if (soundEffectMarkers.length > 0) {
    notes.push({
      id: createAiAudioSuggestionId(noteNumber++),
      kind: "audioWarning",
      target: { type: "project", label: "Existing SFX markers" },
      timing: "manual review needed",
      suggestion: "Review existing SFX markers before adding more accents.",
      searchTerms: [],
      reason: `${DIRECTOR_RULEBOOK_SOURCE_LABEL}: audio should support existing accepted/proposed visual beats instead of creating clutter. ${soundEffectMarkers.length} accepted SFX marker${soundEffectMarkers.length === 1 ? "" : "s"} already exist in project data.`,
      confidence: "high",
      warnings: ["This note does not edit or place SFX markers."],
      status: "new",
      createdAt,
    });
  }

  return notes.slice(0, AI_AUDIO_MAX_NOTES);
}

function createAiAudioPathCueNotes(
  cameraShots: CameraShot[],
  focusRegions: FocusRegion[],
  createdAt: string,
  startIndex: number,
) {
  let noteNumber = startIndex;
  const notes: AiAudioSuggestionNote[] = [];

  for (const shot of cameraShots) {
    const pathItems = [...(shot.attentionPath ?? [])].sort(
      (first, second) => first.order - second.order,
    );

    for (const pathItem of pathItems) {
      const focusRegion = focusRegions.find(
        (region) => region.id === pathItem.focusRegionId,
      );

      if (!focusRegion || !isPathItemUsefulForAudioCue(shot, focusRegion, pathItem)) {
        continue;
      }

      notes.push({
        id: createAiAudioSuggestionId(noteNumber++),
        kind: "sfxCue",
        target: {
          type: "pathItem",
          shotId: shot.id,
          pathItemId: pathItem.id,
          label: `${shot.label}: ${focusRegion.label}`,
        },
        timing: getAiAudioCueTiming(pathItem),
        suggestion: getSfxCueSuggestion(shot, focusRegion, pathItem),
        searchTerms: getSfxSearchTerms(shot, focusRegion, pathItem),
        reason: getSfxCueReason(shot, focusRegion, pathItem),
        confidence:
          pathItem.effectCues?.impactPulse || pathItem.effectCues?.shake
            ? "high"
            : "medium",
        warnings: [
          formatDirectorRuleWarning(
            "DR-AUDIO-VISIBLE-BEAT",
            "SFX notes are tied only to accepted visible action, impact, detail, reaction, or effect-cue beats.",
          ),
        ],
        status: "new",
        createdAt,
      });

      if (notes.length >= 4) {
        return notes;
      }
    }
  }

  return notes;
}

function isPathItemUsefulForAudioCue(
  shot: CameraShot,
  focusRegion: FocusRegion,
  pathItem: ShotAttentionPathItem,
) {
  if (focusRegion.kind === "speech") {
    return false;
  }

  if (pathItem.effectCues?.impactPulse || pathItem.effectCues?.shake) {
    return true;
  }

  if (focusRegion.kind === "action" || shot.shotPurpose === "action") {
    return true;
  }

  if (focusRegion.kind === "detail" && pathItem.motionRole === "pushIn") {
    return true;
  }

  if (focusRegion.kind === "face" && shot.shotPurpose === "reaction") {
    return true;
  }

  return false;
}

function getAiAudioCueTiming(pathItem: ShotAttentionPathItem): AiAudioSuggestionTiming {
  if (pathItem.effectCueTiming === "early") {
    return "pre-arrival";
  }

  if (pathItem.motionRole === "pushOut") {
    return "shot exit";
  }

  if (pathItem.effectCues?.impactPulse || pathItem.motionRole === "pushIn") {
    return "focus arrival";
  }

  return "manual review needed";
}

function getSfxCueSuggestion(
  shot: CameraShot,
  focusRegion: FocusRegion,
  pathItem: ShotAttentionPathItem,
) {
  if (pathItem.effectCues?.impactPulse) {
    return `Consider one restrained impact accent for ${focusRegion.label}.`;
  }

  if (pathItem.effectCues?.shake) {
    return `Consider a short shake-support accent for ${focusRegion.label}.`;
  }

  if (focusRegion.kind === "action" || shot.shotPurpose === "action") {
    return `Consider a brief movement accent for ${focusRegion.label}.`;
  }

  if (focusRegion.kind === "detail") {
    return `Consider a subtle inspection or reveal accent for ${focusRegion.label}.`;
  }

  return `Consider a soft reaction accent for ${focusRegion.label}.`;
}

function getSfxSearchTerms(
  shot: CameraShot,
  focusRegion: FocusRegion,
  pathItem: ShotAttentionPathItem,
) {
  if (pathItem.effectCues?.impactPulse) {
    return ["soft impact hit", "comic impact accent", "short thump"];
  }

  if (pathItem.effectCues?.shake) {
    return ["short rumble accent", "quick shake hit", "low impact pulse"];
  }

  if (focusRegion.kind === "action" || shot.shotPurpose === "action") {
    return ["quick whoosh", "movement accent", "action swish"];
  }

  if (focusRegion.kind === "detail") {
    return ["subtle reveal accent", "small object detail", "soft inspection ping"];
  }

  return ["soft reaction accent", "small comedic sting", "gentle emphasis"];
}

function getSfxCueReason(
  shot: CameraShot,
  focusRegion: FocusRegion,
  pathItem: ShotAttentionPathItem,
) {
  const motionLabel = pathItem.motionRole
    ? formatAudioMotionRoleLabel(pathItem.motionRole)
    : "motion";

  return `${DIRECTOR_RULEBOOK_SOURCE_LABEL}: SFX supports visible accepted camera beats only. ${shot.label} uses ${motionLabel} toward accepted ${focusRegion.kind} Focus Region "${focusRegion.label}", so the note is tied to an accepted visual beat.`;
}

function formatAudioMotionRoleLabel(motionRole: ShotAttentionPathItem["motionRole"]) {
  if (motionRole === "pushIn" || motionRole === "pushOut" || motionRole === "track") {
    return formatMotionRoleLabel(motionRole);
  }

  return motionRole ?? "motion";
}

function summarizeShotPurposes(cameraShots: CameraShot[]) {
  const purposes = cameraShots.map((shot) => shot.shotPurpose ?? "other");

  return {
    hasAction: purposes.includes("action"),
    hasEmotion: purposes.includes("emotion") || purposes.includes("reaction"),
    hasDialogue: purposes.includes("dialogue"),
    hasReveal: purposes.includes("reveal") || purposes.includes("detail"),
    hasEstablishing: purposes.includes("establishing"),
  };
}

function getBgmToneSuggestion(summary: ReturnType<typeof summarizeShotPurposes>) {
  if (summary.hasAction) {
    return "Use a light action pulse that supports movement without overpowering panel reading.";
  }

  if (summary.hasEmotion) {
    return "Use a restrained emotional bed with room for reaction holds.";
  }

  if (summary.hasDialogue) {
    return "Use quiet ambience or a sparse comedy bed that leaves speech readable.";
  }

  if (summary.hasReveal || summary.hasEstablishing) {
    return "Use low ambience that can widen for reveal or establishing context.";
  }

  return "Use a neutral light bed that stays under the guided-view camera movement.";
}

function getBgmToneSearchTerms(summary: ReturnType<typeof summarizeShotPurposes>) {
  if (summary.hasAction) {
    return ["light action pulse", "restrained percussion bed", "comic chase rhythm"];
  }

  if (summary.hasEmotion) {
    return ["soft emotional underscore", "quiet piano bed", "gentle tension ambience"];
  }

  if (summary.hasDialogue) {
    return ["quiet room tone", "light comedy bed", "minimal dialogue underscore"];
  }

  if (summary.hasReveal || summary.hasEstablishing) {
    return ["ambient reveal bed", "wide room tone", "subtle cinematic ambience"];
  }

  return ["light comic background", "neutral ambience", "soft underscore loop"];
}

function getBgmPacingSuggestion(cameraShots: CameraShot[]) {
  const averageDuration =
    cameraShots.reduce((sum, shot) => sum + shot.durationMs, 0) /
    Math.max(1, cameraShots.length);

  if (averageDuration < 2200) {
    return "Prefer short-loop music with low transient density so quick shots stay readable.";
  }

  if (averageDuration > 4000) {
    return "Use a slow build or sustained bed that can hold through longer camera beats.";
  }

  return "Use a steady low-energy loop and let camera arrivals carry the rhythm.";
}

function getBgmPacingSearchTerms(cameraShots: CameraShot[]) {
  const hasReveal = cameraShots.some(
    (shot) => shot.shotPurpose === "reveal" || shot.shotPurpose === "establishing",
  );

  if (hasReveal) {
    return ["slow reveal build", "subtle swell", "ambient transition bed"];
  }

  return ["low energy loop", "steady underscore", "light pacing bed"];
}

function createAiAudioSuggestionId(noteNumber: number) {
  return `audio-note-${noteNumber}-${Date.now()}`;
}

function isAiAudioSuggestionTargetAvailable(
  note: AiAudioSuggestionNote,
  cameraShots: CameraShot[],
  focusRegions: FocusRegion[],
  soundEffectMarkers: UploadedSoundEffectMarker[],
) {
  const target = note.target;

  switch (target.type) {
    case "project":
      return true;
    case "shot":
      return cameraShots.some((shot) => shot.id === target.id);
    case "focusRegion":
      return focusRegions.some((region) => region.id === target.id);
    case "sfxMarker":
      return soundEffectMarkers.some((marker) => marker.id === target.id);
    case "pathItem": {
      const shot = cameraShots.find((item) => item.id === target.shotId);

      return Boolean(
        shot?.attentionPath?.some(
          (pathItem) => pathItem.id === target.pathItemId,
        ),
      );
    }
    default:
      return false;
  }
}

function appendUniqueWarning(warnings: string[], warning: string) {
  return warnings.includes(warning) ? warnings : [...warnings, warning];
}

function formatAiAudioSuggestionKind(kind: AiAudioSuggestionKind) {
  switch (kind) {
    case "bgmTone":
      return "BGM tone";
    case "bgmPacing":
      return "BGM pacing";
    case "sfxCue":
      return "SFX cue";
    case "sfxRestraint":
      return "SFX restraint";
    case "audioWarning":
      return "Audio warning";
    default:
      return kind;
  }
}

function formatAiAudioSuggestionTarget(target: AiAudioSuggestionTarget) {
  switch (target.type) {
    case "project":
      return target.label;
    case "shot":
      return `Shot: ${target.label}`;
    case "pathItem":
      return `Beat: ${target.label}`;
    case "focusRegion":
      return `Focus: ${target.label}`;
    case "sfxMarker":
      return `SFX marker: ${target.label}`;
    default:
      return "Unknown target";
  }
}

function groupDirectorSuggestionsByPanel(
  suggestions: AiDirectorSuggestionsResult["suggestions"],
  pageUnderstandingResult: AiPageUnderstandingResult | null,
) {
  const panelLabels = new Map(
    (pageUnderstandingResult?.analysis?.panels ?? []).map((panel) => [
      panel.id,
      panel.label,
    ]),
  );
  const groups = new Map<
    string,
    {
      panelId: string;
      panelLabel: string;
      suggestions: AiDirectorSuggestionsResult["suggestions"];
    }
  >();

  suggestions.forEach((suggestion) => {
    const panelLabel =
      panelLabels.get(suggestion.targetPanelId) ?? suggestion.targetPanelLabel;
    const group = groups.get(suggestion.targetPanelId) ?? {
      panelId: suggestion.targetPanelId,
      panelLabel,
      suggestions: [],
    };

    group.suggestions.push(suggestion);
    groups.set(suggestion.targetPanelId, group);
  });

  return [...groups.values()];
}

function groupCameraSuggestionsByPanel(suggestions: AiCameraSuggestionDraft[]) {
  const groups = new Map<
    string,
    {
      panelId: string;
      panelLabel: string;
      suggestions: AiCameraSuggestionDraft[];
    }
  >();

  suggestions.forEach((suggestion) => {
    const group = groups.get(suggestion.targetPanelId) ?? {
      panelId: suggestion.targetPanelId,
      panelLabel: suggestion.targetPanelLabel,
      suggestions: [],
    };

    group.suggestions.push(suggestion);
    groups.set(suggestion.targetPanelId, group);
  });

  return [...groups.values()];
}

function createDraftMotionSuggestionFromAiCameraSuggestion(
  suggestion: AiCameraSuggestionDraft,
  image: UploadedImage,
  suggestionNumber: number,
): TemporarySuggestion {
  const shotRect = createDraftMotionShotRect(suggestion, image);
  const focusTargets = getDraftMotionFocusTargets(suggestion, shotRect);
  const draftFocusRegions = focusTargets.map((target, index) =>
    createDraftMotionFocusRegion(target, suggestion, image, index),
  );
  const pathItems = draftFocusRegions.map((focusRegion, index) =>
    createDraftMotionPathItem(focusRegion, suggestion, index),
  );
  const shotPurpose = getDraftMotionShotPurpose(suggestion);
  const shotTiming = getDraftMotionShotTiming(
    suggestion,
    shotPurpose,
    pathItems.length,
  );

  return {
    id: createSuggestionId("motion", suggestionNumber),
    type: "draftMotion",
    source: "aiDirectorDraft",
    confidence: suggestion.confidence === "unknown" ? "unknown" : "medium",
    status: "visible",
    createdAt: new Date().toISOString(),
    reason: `Draft motion from AI camera suggestion: ${suggestion.reason} Panel-first draft: the detected panel becomes the shot; Focus Regions and path items are added only for distinct internal viewing beats.`,
    proposedValues: {
      label: `Draft Motion ${suggestionNumber}: ${suggestion.targetPanelLabel}`,
      cameraShot: {
        label: `AI Draft Shot ${suggestionNumber}`,
        x: shotRect.x,
        y: shotRect.y,
        width: shotRect.width,
        height: shotRect.height,
        durationMs: shotTiming.durationMs,
        shotPurpose,
        sceneHoldRatio: shotTiming.sceneHoldRatio,
        focusAttentionRatio: shotTiming.focusAttentionRatio,
      },
      focusRegions: draftFocusRegions,
      pathItems,
    },
  };
}

function getDraftMotionFocusTargets(
  suggestion: AiCameraSuggestionDraft,
  shotRect: AiPageUnderstandingGeometry,
) {
  const uniqueTargets = [suggestion.target, ...suggestion.supportingTargets].filter(
    (target, index, targets) =>
      targets.findIndex(
        (item) => item.id === target.id && item.type === target.type,
      ) === index,
  );
  const internalBeatBudget = getDraftMotionPathItemBudget(suggestion);
  const motionTargets: AiCameraSuggestionTargetRef[] = [];

  uniqueTargets
    .filter((target) => target.type !== "aiSpeech" && target.type !== "aiPanel")
    .sort(
      (first, second) =>
        getDraftMotionTargetPriority(second) -
        getDraftMotionTargetPriority(first),
    )
    .forEach((target) => {
      if (motionTargets.length >= internalBeatBudget) {
        return;
      }

      if (!shouldCreateDraftMotionFocusTarget(target, suggestion, shotRect)) {
        return;
      }

      if (
        motionTargets.some((existingTarget) =>
          areAiCameraTargetGeometriesSimilar(existingTarget, target),
        )
      ) {
        return;
      }

      motionTargets.push(target);
    });

  return motionTargets.slice(0, DRAFT_MOTION_MAX_FOCUS_TARGETS);
}

function getDraftMotionPathItemBudget(suggestion: AiCameraSuggestionDraft) {
  const text = `${suggestion.reason} ${suggestion.compositionHint}`.toLowerCase();
  const hasDistinctExchange =
    /\b(speaker|exchange|conversation|back.?and.?forth|setup|payoff|reaction|then|to)\b/.test(
      text,
    ) || suggestion.movementRole === "track";

  if (!hasDistinctExchange && suggestion.movementRole !== "pushIn") {
    return 0;
  }

  return hasDistinctExchange ? 2 : 1;
}

function shouldCreateDraftMotionFocusTarget(
  target: AiCameraSuggestionTargetRef,
  suggestion: AiCameraSuggestionDraft,
  shotRect: AiPageUnderstandingGeometry,
) {
  if (isDraftMotionTargetCoveredByShot(target, shotRect)) {
    return false;
  }

  if (suggestion.movementRole === "pushIn") {
    return (
      target.type === "acceptedDetail" ||
      target.type === "aiDetail" ||
      target.type === "aiCharacter" ||
      target.type === "aiAction"
    );
  }

  if (suggestion.movementRole === "pushOut") {
    return false;
  }

  return suggestion.supportingTargets.some(
    (supportingTarget) =>
      !areAiCameraTargetsEqual(supportingTarget, target) &&
      !areAiCameraTargetGeometriesSimilar(supportingTarget, target),
  );
}

function isDraftMotionTargetCoveredByShot(
  target: AiCameraSuggestionTargetRef,
  shotRect: AiPageUnderstandingGeometry,
) {
  const targetArea = Math.max(1, target.geometry.width * target.geometry.height);
  const shotArea = Math.max(1, shotRect.width * shotRect.height);
  const targetAreaRatio = targetArea / shotArea;

  return (
    targetAreaRatio >= DRAFT_MOTION_TARGET_LARGE_AREA_RATIO ||
    (targetAreaRatio >= 0.28 &&
      getRectOverlapRatio(target.geometry, shotRect) >=
        DRAFT_MOTION_TARGET_COVERED_RATIO &&
      getRectCenterDistanceRatio(target.geometry, shotRect) <=
        AI_CAMERA_REDUNDANT_CENTER_DISTANCE_RATIO)
  );
}

function getDraftMotionTargetPriority(target: AiCameraSuggestionTargetRef) {
  if (target.type === "acceptedDetail") {
    return 100;
  }

  if (target.type === "aiAction") {
    return 80;
  }

  if (target.type === "aiCharacter") {
    return 70;
  }

  if (target.type === "aiDetail") {
    return 55;
  }

  if (target.type === "aiPanel") {
    return 40;
  }

  return 10;
}

function createDraftMotionFocusRegion(
  target: AiCameraSuggestionTargetRef,
  suggestion: AiCameraSuggestionDraft,
  image: UploadedImage,
  index: number,
): DraftMotionFocusRegionValues {
  const geometry = clampGeometryToImage(
    target.geometry,
    image,
    target.type === "aiPanel" ? 24 : 12,
  );

  return {
    draftFocusRegionId: `draft-focus-${index + 1}`,
    label: target.label,
    description:
      index === 0
        ? suggestion.compositionHint
        : `Supporting target for ${suggestion.target.label}.`,
    kind: getDraftMotionFocusKind(target.type),
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height,
    effectType: "none",
    sequenceOrder: index + 1,
  };
}

function createDraftMotionPathItem(
  focusRegion: DraftMotionFocusRegionValues,
  suggestion: AiCameraSuggestionDraft,
  index: number,
): ShotAttentionPathDraftItem {
  return {
    focusRegionId: focusRegion.draftFocusRegionId,
    motionRole: index === 0 ? suggestion.movementRole : "track",
    durationWeight: getDraftMotionDurationWeight(focusRegion.kind, index),
    reason:
      index === 0
        ? suggestion.reason
        : "Supporting target keeps the accepted suggestion's context readable.",
  };
}

function createDraftMotionShotRect(
  suggestion: AiCameraSuggestionDraft,
  image: UploadedImage,
) {
  const fallbackRect = {
    x: Math.round(image.width * 0.2),
    y: Math.round(image.height * 0.2),
    width: Math.round(image.width * 0.6),
    height: Math.round(image.height * 0.6),
  };
  const baseRect =
    suggestion.targetPanelGeometry ??
    (suggestion.target.type === "aiPanel" ? suggestion.target.geometry : fallbackRect);
  const padding =
    suggestion.movementRole === "pushOut"
      ? Math.round(Math.min(image.width, image.height) * 0.1)
      : Math.round(Math.min(image.width, image.height) * 0.035);

  return clampGeometryToImage(baseRect, image, padding);
}

function clampGeometryToImage(
  geometry: AiPageUnderstandingGeometry,
  image: UploadedImage,
  padding: number,
): AiPageUnderstandingGeometry {
  const x = Math.max(0, Math.round(geometry.x - padding));
  const y = Math.max(0, Math.round(geometry.y - padding));
  const width = Math.max(1, Math.round(geometry.width + padding * 2));
  const height = Math.max(1, Math.round(geometry.height + padding * 2));
  const clampedWidth = Math.min(width, Math.max(1, image.width - x));
  const clampedHeight = Math.min(height, Math.max(1, image.height - y));

  return {
    x: Math.min(x, Math.max(0, image.width - clampedWidth)),
    y: Math.min(y, Math.max(0, image.height - clampedHeight)),
    width: clampedWidth,
    height: clampedHeight,
  };
}

function getDraftMotionDurationMs(
  timingHint: AiCameraSuggestionDraft["timingHint"],
) {
  if (timingHint === "fast") {
    return 1800;
  }

  if (timingHint === "slow") {
    return 3600;
  }

  return 2600;
}

function getDraftMotionShotTiming(
  suggestion: AiCameraSuggestionDraft,
  shotPurpose: CameraShot["shotPurpose"],
  pathItemCount: number,
) {
  const cameraMoveCount = suggestion.movementRole === "track" ? pathItemCount : Math.min(1, pathItemCount);
  const durationMs =
    getDraftMotionDurationMs(suggestion.timingHint) +
    pathItemCount * DRAFT_MOTION_PATH_ITEM_EXTRA_DURATION_MS +
    cameraMoveCount * DRAFT_MOTION_CAMERA_MOVE_EXTRA_DURATION_MS;

  if (suggestion.timingHint === "fast" || shotPurpose === "action") {
    return {
      durationMs,
      sceneHoldRatio: 0.06,
      focusAttentionRatio: 0.58,
    };
  }

  if (shotPurpose === "dialogue") {
    return {
      durationMs: Math.max(durationMs, 3400),
      sceneHoldRatio: 0.24,
      focusAttentionRatio: 0.5,
    };
  }

  if (shotPurpose === "reaction") {
    return {
      durationMs: Math.max(durationMs, 2800),
      sceneHoldRatio: 0.18,
      focusAttentionRatio: 0.56,
    };
  }

  if (shotPurpose === "detail") {
    return {
      durationMs: Math.max(durationMs, 3000),
      sceneHoldRatio: 0.16,
      focusAttentionRatio: 0.6,
    };
  }

  if (shotPurpose === "establishing") {
    return {
      durationMs: Math.max(durationMs, 3600),
      sceneHoldRatio: 0.28,
      focusAttentionRatio: 0.44,
    };
  }

  if (suggestion.movementRole === "pushIn") {
    return {
      durationMs,
      sceneHoldRatio: 0.14,
      focusAttentionRatio: 0.6,
    };
  }

  if (suggestion.movementRole === "pushOut") {
    return {
      durationMs,
      sceneHoldRatio: 0.18,
      focusAttentionRatio: 0.58,
    };
  }

  return {
    durationMs,
    sceneHoldRatio: 0.14,
    focusAttentionRatio: 0.58,
  };
}

function getDraftMotionDurationWeight(
  kind: FocusRegion["kind"],
  index: number,
) {
  if (kind === "speech") {
    return 1.55;
  }

  if (kind === "face") {
    return 1.35;
  }

  if (kind === "detail") {
    return 1.3;
  }

  if (kind === "action") {
    return 0.8;
  }

  return index === 0 ? 1.15 : 1;
}

function getDraftMotionShotPurpose(
  suggestion: AiCameraSuggestionDraft,
): CameraShot["shotPurpose"] {
  if (suggestion.target.type === "aiAction") {
    return "action";
  }

  if (suggestion.target.type === "aiSpeech") {
    return "dialogue";
  }

  if (
    suggestion.target.type === "acceptedDetail" ||
    suggestion.target.type === "aiDetail"
  ) {
    return "detail";
  }

  if (suggestion.target.type === "aiCharacter") {
    return "reaction";
  }

  if (
    suggestion.target.type === "aiPanel" &&
    suggestion.movementRole === "pushOut"
  ) {
    return "establishing";
  }

  return "panel";
}

function getDraftMotionFocusKind(
  targetType: AiCameraSuggestionTargetRef["type"],
): FocusRegion["kind"] {
  if (targetType === "aiPanel") {
    return "panel";
  }

  if (targetType === "aiSpeech") {
    return "speech";
  }

  if (targetType === "aiCharacter") {
    return "face";
  }

  if (targetType === "aiAction") {
    return "action";
  }

  return "detail";
}

function createAiCameraSuggestionDrafts(
  result: AiDirectorSuggestionsResult,
  pageUnderstanding: AiPageUnderstandingResult,
  focusRegions: FocusRegion[],
): AiCameraSuggestionDraft[] {
  if (!pageUnderstanding.analysis) {
    return [];
  }

  const regions = getAiPageUnderstandingRegions(pageUnderstanding);
  const acceptedDetails = focusRegions.filter((region) => region.kind === "detail");

  const rawDrafts = result.suggestions.map<AiCameraSuggestionDraftWithPriority>(
    (suggestion, index) => {
      const panel = pageUnderstanding.analysis?.panels.find(
        (item) => item.id === suggestion.targetPanelId,
      );
      const referencedRegions = suggestion.referencedRegionIds
        .map((regionId) => regions.find((region) => region.id === regionId))
        .filter((region): region is AiPageUnderstandingRegion => Boolean(region));
      const acceptedDetailTargets = getAcceptedDetailTargetsForRegions(
        referencedRegions,
        acceptedDetails,
      );
      const targetSelection = selectAiCameraSuggestionTargets(
        suggestion,
        panel,
        referencedRegions,
        acceptedDetailTargets,
      );
      const rulebookSuggestion = applyDirectorRulebookToCameraSuggestion(
        suggestion,
        targetSelection.target,
        referencedRegions,
      );
      const warnings = [
        ...(suggestion.warning ? [suggestion.warning] : []),
        ...targetSelection.warnings,
        ...rulebookSuggestion.warnings,
        ...getAiCameraSuggestionValidationWarnings(
          suggestion,
          pageUnderstanding,
          targetSelection.target,
          referencedRegions,
        ),
      ];
      const status: AiCameraSuggestionStatus =
        warnings.some((warning) => warning.toLowerCase().includes("stale"))
          ? "stale"
          : warnings.some((warning) => warning.toLowerCase().includes("blocked"))
            ? "blocked"
            : "draft";

      return {
        id: `ai-camera-${suggestion.id}`,
        sourceSuggestionId: suggestion.id,
        targetPanelId: suggestion.targetPanelId,
        targetPanelLabel:
          panel?.label ?? suggestion.targetPanelLabel ?? suggestion.targetPanelId,
        targetPanelGeometry: panel?.geometry,
        target: targetSelection.target,
        supportingTargets: targetSelection.supportingTargets,
        movementRole: rulebookSuggestion.movementRole,
        timingHint: rulebookSuggestion.timingHint,
        compositionHint: suggestion.suggestedAttentionPath,
        reason: rulebookSuggestion.reason,
        confidence: suggestion.confidence,
        warnings,
        status,
        priorityScore: getAiCameraSuggestionPriority(
          suggestion,
          targetSelection.target,
          targetSelection.supportingTargets,
        ),
        originalIndex: index,
      };
    },
  );

  return applyAiCameraSuggestionDensityGuardrails(
    rawDrafts,
    pageUnderstanding,
    acceptedDetails,
  );
}

function selectAiCameraSuggestionTargets(
  suggestion: AiDirectorSuggestionsResult["suggestions"][number],
  panel: AiPageUnderstandingRegion | undefined,
  referencedRegions: AiPageUnderstandingRegion[],
  acceptedDetailTargets: AiCameraSuggestionTargetRef[],
) {
  const warnings: string[] = [];
  const beatType = getDirectorBeatTypeFromText(
    [
      suggestion.reason,
      suggestion.moodMotionInterpretation,
      suggestion.suggestedAttentionPath,
      suggestion.sfxBgmNote ?? "",
    ].join(" "),
    inferDirectorBeatTypeFromRegions(referencedRegions),
  );
  const scoredTargets = [
    ...acceptedDetailTargets.map((target) => ({
      target,
      region: undefined,
      score: getAiCameraTargetPriority(
        target,
        suggestion,
        undefined,
      ),
    })),
    ...referencedRegions.map((region) => {
      const target = createAiCameraTargetRef(region);

      return {
        target,
        region,
        score: getAiCameraTargetPriority(target, suggestion, region),
      };
    }),
  ];
  const beatClusters = createAiCameraBeatClusters(
    scoredTargets,
    suggestion,
    beatType,
  );
  const primaryCandidates = beatClusters
    .filter(({ target }) => target.type !== "aiSpeech")
    .sort((first, second) => second.score - first.score);
  const target =
    primaryCandidates[0]?.target ??
    createAiCameraTargetRef(
      panel,
      "aiPanel",
      suggestion.targetPanelId,
      suggestion.targetPanelLabel,
    );
  const selectedCluster = beatClusters.find((cluster) =>
    areAiCameraTargetsEqual(cluster.target, target),
  );
  const supportingTargets = [
    ...(selectedCluster?.supportingTargets ?? []),
    ...beatClusters
      .filter(({ target: candidate }) => !areAiCameraTargetsEqual(candidate, target))
      .sort((first, second) => second.score - first.score)
      .map(({ target }) => target),
  ]
    .filter((candidate) => !areAiCameraTargetsEqual(candidate, target))
    .filter(
      (candidate, index, candidates) =>
        candidates.findIndex((item) =>
          areAiCameraTargetsEqual(item, candidate),
        ) === index,
    )
    .slice(0, AI_CAMERA_MAX_SUPPORTING_TARGETS);
  const rawSupportCount = scoredTargets.filter(
    ({ target: candidate }) => !areAiCameraTargetsEqual(candidate, target),
  ).length;

  if (
    referencedRegions.some((region) => region.kind === "speech") &&
    target.type !== "aiSpeech"
  ) {
    warnings.push(
      "Density guardrail: speech regions are being used as timing evidence, not primary motion targets.",
    );
  }

  if (rawSupportCount > supportingTargets.length) {
    warnings.push(
      `Density guardrail: kept ${supportingTargets.length} supporting target${supportingTargets.length === 1 ? "" : "s"} from ${rawSupportCount} referenced target${rawSupportCount === 1 ? "" : "s"} so the card stays focused on one directing beat; trimmed references remain review evidence, not separate motion targets.`,
    );
  }

  const clusteredSupportCount = beatClusters.reduce(
    (count, cluster) => count + cluster.supportingTargets.length,
    0,
  );

  if (clusteredSupportCount > 0) {
    warnings.push(
      `Director rulebook DR-BEAT-CLUSTER: consolidated ${clusteredSupportCount} overlapping or nearby AI detection${clusteredSupportCount === 1 ? "" : "s"} into one primary directing beat plus support, so Draft Motion should create fewer Focus Regions than raw detections.`,
    );
  }

  return {
    target,
    supportingTargets,
    warnings,
  };
}

type AiCameraScoredTarget = {
  target: AiCameraSuggestionTargetRef;
  region?: AiPageUnderstandingRegion;
  score: number;
};

type AiCameraBeatCluster = {
  target: AiCameraSuggestionTargetRef;
  supportingTargets: AiCameraSuggestionTargetRef[];
  score: number;
};

function createAiCameraBeatClusters(
  scoredTargets: AiCameraScoredTarget[],
  suggestion: AiDirectorSuggestionsResult["suggestions"][number],
  beatType: DirectorBeatType,
): AiCameraBeatCluster[] {
  const clusters: AiCameraScoredTarget[][] = [];

  scoredTargets.forEach((candidate) => {
    const cluster = clusters.find((items) =>
      items.some((item) => shouldMergeAiCameraBeatTargets(item, candidate)),
    );

    if (cluster) {
      cluster.push(candidate);
      return;
    }

    clusters.push([candidate]);
  });

  return clusters.map((cluster) => {
    const rankedTargets = [...cluster].sort(
      (first, second) =>
        getAiCameraClusterDominanceScore(second, cluster, suggestion, beatType) -
          getAiCameraClusterDominanceScore(first, cluster, suggestion, beatType) ||
        second.score - first.score,
    );
    const primary = rankedTargets[0];
    const supportingTargets = rankedTargets
      .slice(1)
      .map(({ target }) => target)
      .filter(
        (target, index, targets) =>
          targets.findIndex((item) => areAiCameraTargetsEqual(item, target)) ===
          index,
      );

    return {
      target: primary.target,
      supportingTargets,
      score: getAiCameraClusterDominanceScore(
        primary,
        cluster,
        suggestion,
        beatType,
      ),
    };
  });
}

function shouldMergeAiCameraBeatTargets(
  first: AiCameraScoredTarget,
  second: AiCameraScoredTarget,
) {
  if (areAiCameraTargetsEqual(first.target, second.target)) {
    return true;
  }

  if (first.target.type === "aiPanel" || second.target.type === "aiPanel") {
    return false;
  }

  if (first.target.type === "aiSpeech" || second.target.type === "aiSpeech") {
    return (
      getRectOverlapRatio(first.target.geometry, second.target.geometry) >=
      AI_CAMERA_CLUSTER_CONTAINMENT_RATIO
    );
  }

  return (
    getRectOverlapRatio(first.target.geometry, second.target.geometry) >=
      AI_CAMERA_CLUSTER_OVERLAP_RATIO ||
    getRectContainmentRatio(first.target.geometry, second.target.geometry) >=
      AI_CAMERA_CLUSTER_CONTAINMENT_RATIO ||
    getRectContainmentRatio(second.target.geometry, first.target.geometry) >=
      AI_CAMERA_CLUSTER_CONTAINMENT_RATIO ||
    getRectCenterDistanceRatio(first.target.geometry, second.target.geometry) <=
      AI_CAMERA_CLUSTER_CENTER_DISTANCE_RATIO
  );
}

function getAiCameraClusterDominanceScore(
  candidate: AiCameraScoredTarget,
  cluster: AiCameraScoredTarget[],
  suggestion: AiDirectorSuggestionsResult["suggestions"][number],
  beatType: DirectorBeatType,
) {
  let score = candidate.score;
  const hasAction = cluster.some((item) => item.target.type === "aiAction");
  const hasCharacter = cluster.some((item) => item.target.type === "aiCharacter");
  const hasDetail = cluster.some(
    (item) => item.target.type === "aiDetail" || item.target.type === "acceptedDetail",
  );
  const text = [
    suggestion.reason,
    suggestion.moodMotionInterpretation,
    suggestion.suggestedAttentionPath,
  ]
    .join(" ")
    .toLowerCase();

  if (candidate.target.type === "acceptedDetail") {
    score += 34;
  }

  if (beatType === "actionImpact" && candidate.target.type === "aiAction") {
    score += 30;
  }

  if (beatType === "reactionEmotion" && candidate.target.type === "aiCharacter") {
    score += 30;
  }

  if (
    beatType === "detailInspectionClue" &&
    (candidate.target.type === "acceptedDetail" || candidate.target.type === "aiDetail")
  ) {
    score += 24;
  }

  if (
    candidate.target.type === "aiDetail" &&
    (hasAction || hasCharacter) &&
    beatType !== "detailInspectionClue" &&
    !/\b(clue|inspect|detail|object|prop|symbol|reveal)\b/.test(text)
  ) {
    score -= 24;
  }

  if (
    candidate.target.type === "aiCharacter" &&
    hasAction &&
    beatType === "actionImpact"
  ) {
    score -= 10;
  }

  if (
    candidate.target.type === "aiAction" &&
    hasCharacter &&
    beatType === "reactionEmotion"
  ) {
    score -= 10;
  }

  if (
    candidate.target.type === "aiSpeech" &&
    (hasAction || hasCharacter || hasDetail)
  ) {
    score -= 36;
  }

  return score;
}

function inferDirectorBeatTypeFromRegions(
  referencedRegions: AiPageUnderstandingRegion[],
): DirectorBeatType {
  const hasSpeech = referencedRegions.some((region) => region.kind === "speech");
  const hasAction = referencedRegions.some((region) => region.kind === "action");
  const hasCharacter = referencedRegions.some(
    (region) => region.kind === "character" || region.kind === "face",
  );
  const hasDetail = referencedRegions.some(
    (region) => region.kind === "detail" || region.kind === "background",
  );

  if (hasSpeech && hasCharacter && !hasAction) {
    return "speakerToSpeakerExchange";
  }

  if (hasAction) {
    return "actionImpact";
  }

  if (hasCharacter) {
    return "reactionEmotion";
  }

  if (hasDetail) {
    return "detailInspectionClue";
  }

  if (hasSpeech) {
    return "dialogueSpeechHeavy";
  }

  return "normalReadingFlow";
}

function applyDirectorRulebookToCameraSuggestion(
  suggestion: AiDirectorSuggestionsResult["suggestions"][number],
  target: AiCameraSuggestionTargetRef,
  referencedRegions: AiPageUnderstandingRegion[],
) {
  const rulebookText = [
    suggestion.reason,
    suggestion.moodMotionInterpretation,
    suggestion.suggestedAttentionPath,
    suggestion.sfxBgmNote ?? "",
    target.label,
  ].join(" ");
  const beatType = getDirectorBeatTypeFromText(
    rulebookText,
    inferDirectorBeatTypeFromTarget(target, referencedRegions),
  );
  const warnings: string[] = [];
  let movementRole = suggestion.suggestedCameraMotion;
  let timingHint = suggestion.suggestedSpeedTiming;

  if (target.type === "aiSpeech" && movementRole !== "track") {
    movementRole = "track";
    warnings.push(
      formatDirectorRuleWarning(
        "DR-CAM-SPEECH-HOLD",
        "speech regions inform timing/hold and were downgraded to track instead of direct push motion.",
      ),
    );
  }

  if (
    movementRole === "pushIn" &&
    beatType === "actionImpact" &&
    target.type === "aiAction" &&
    !/\b(impact|hit|crash|strike|slam|payoff|tight|close)\b/i.test(
      `${suggestion.reason} ${suggestion.suggestedAttentionPath}`,
    )
  ) {
    movementRole = "track";
    warnings.push(
      formatDirectorRuleWarning(
        "DR-CAM-ACTION-FOLLOW",
        "action beats default to track when the camera should follow movement instead of punching into a tight impact payoff.",
      ),
    );
  }

  if (
    movementRole === "pushIn" &&
    (beatType === "dialogueSpeechHeavy" ||
      beatType === "speakerToSpeakerExchange" ||
      beatType === "normalReadingFlow") &&
    !/\b(reaction|emotion|realization|expression|shock|threat)\b/i.test(
      `${suggestion.reason} ${suggestion.suggestedAttentionPath}`,
    )
  ) {
    movementRole = "track";
    warnings.push(
      formatDirectorRuleWarning(
        "DR-CAM-DIALOGUE-RESTRAINT",
        "dialogue, speaker exchange, and normal reading-flow beats prefer track or hold so balloon/speaker order stays readable; use pushIn only when reaction is the point.",
      ),
    );
  }

  if (
    movementRole === "pushIn" &&
    target.type === "aiPanel" &&
    !isPushInBeat(beatType)
  ) {
    movementRole = getRecommendedMotionForBeat(beatType);
    warnings.push(
      formatDirectorRuleWarning(
        "DR-CAM-MEANINGFUL-PUSH",
        "panel-level pushIn needs reaction, action, threat, inspection, detail, or payoff evidence.",
      ),
    );
  }

  if (
    movementRole === "pushIn" &&
    target.type === "aiDetail" &&
    beatType !== "detailInspectionClue" &&
    beatType !== "revealContextRestoration"
  ) {
    movementRole = "track";
    warnings.push(
      formatDirectorRuleWarning(
        "DR-CAM-DETAIL-EVIDENCE",
        "raw detail regions need accepted/corrected detail data or clear clue/reveal evidence before pushIn; otherwise they remain supporting review evidence.",
      ),
    );
  }

  if (
    movementRole === "pushOut" &&
    beatType !== "establishingEnvironment" &&
    beatType !== "revealContextRestoration" &&
    beatType !== "transitionSceneChange"
  ) {
    movementRole = "track";
    warnings.push(
      formatDirectorRuleWarning(
        "DR-CAM-CONTEXT-ONLY",
        "pushOut is reserved for context restoration, reveal, environment, relationship, or re-orientation beats.",
      ),
    );
  }

  const recommendedTiming = getTimingHintForBeat(beatType);
  const speechHeavy = referencedRegions.some((region) => region.kind === "speech");
  const hasActionEvidence = referencedRegions.some((region) => region.kind === "action");

  if (speechHeavy && !hasActionEvidence && timingHint === "fast") {
    timingHint = "slow";
    warnings.push(
      formatDirectorRuleWarning(
        "DR-TIME-DIALOGUE-HOLD",
        "speech-heavy beats need readable hold time instead of fast timing.",
      ),
    );
  } else if (
    timingHint === "fast" &&
    recommendedTiming !== "fast" &&
    beatType !== "actionImpact"
  ) {
    timingHint = recommendedTiming;
    warnings.push(
      formatDirectorRuleWarning(
        "DR-TIME-READABILITY",
        `fast timing was adjusted to ${recommendedTiming} for the ${formatDirectorBeatType(beatType)} readability profile.`,
      ),
    );
  }

  return {
    beatType,
    movementRole,
    timingHint,
    warnings,
    reason: appendDirectorRulebookReason(suggestion.reason, beatType),
  };
}

function inferDirectorBeatTypeFromTarget(
  target: AiCameraSuggestionTargetRef,
  referencedRegions: AiPageUnderstandingRegion[],
): DirectorBeatType {
  if (
    target.type === "aiAction" ||
    referencedRegions.some((region) => region.kind === "action")
  ) {
    return "actionImpact";
  }

  if (target.type === "acceptedDetail" || target.type === "aiDetail") {
    return "detailInspectionClue";
  }

  if (target.type === "aiCharacter") {
    return "reactionEmotion";
  }

  if (
    target.type === "aiSpeech" ||
    referencedRegions.some((region) => region.kind === "speech")
  ) {
    return "dialogueSpeechHeavy";
  }

  return "normalReadingFlow";
}

function isPushInBeat(beatType: DirectorBeatType) {
  return (
    beatType === "reactionEmotion" ||
    beatType === "actionImpact" ||
    beatType === "detailInspectionClue" ||
    beatType === "punchlineGagPayoff" ||
    beatType === "tensionMood"
  );
}

function appendDirectorRulebookReason(reason: string, beatType: DirectorBeatType) {
  const rulebookLabel = `Rulebook beat: ${formatDirectorBeatType(beatType)}.`;

  return reason.includes("Rulebook beat:")
    ? reason
    : `${reason} ${rulebookLabel}`;
}

function formatDirectorBeatType(beatType: DirectorBeatType) {
  switch (beatType) {
    case "establishingEnvironment":
      return "establishing / environment";
    case "normalReadingFlow":
      return "normal reading flow";
    case "dialogueSpeechHeavy":
      return "dialogue / speech-heavy";
    case "speakerToSpeakerExchange":
      return "speaker-to-speaker exchange";
    case "reactionEmotion":
      return "reaction / emotion";
    case "actionImpact":
      return "action / impact";
    case "detailInspectionClue":
      return "detail inspection / clue";
    case "revealContextRestoration":
      return "reveal / context restoration";
    case "transitionSceneChange":
      return "transition / scene change";
    case "punchlineGagPayoff":
      return "punchline / gag payoff";
    case "tensionMood":
      return "tension / mood";
  }
}

function applyAiCameraSuggestionDensityGuardrails(
  drafts: AiCameraSuggestionDraftWithPriority[],
  pageUnderstanding: AiPageUnderstandingResult,
  acceptedDetails: FocusRegion[],
): AiCameraSuggestionDraft[] {
  const groups = new Map<string, AiCameraSuggestionDraftWithPriority[]>();

  drafts.forEach((draft) => {
    const group = groups.get(draft.targetPanelId) ?? [];
    group.push(draft);
    groups.set(draft.targetPanelId, group);
  });

  const keptDrafts: AiCameraSuggestionDraftWithPriority[] = [];

  groups.forEach((group, panelId) => {
    const sortedGroup = [...group].sort(
      (first, second) =>
        second.priorityScore - first.priorityScore ||
        first.originalIndex - second.originalIndex,
    );
    const panelLimit = getAiCameraPanelSuggestionLimit(
      panelId,
      pageUnderstanding,
      acceptedDetails,
    );
    const keptForPanel: AiCameraSuggestionDraftWithPriority[] = [];
    let suppressedCount = 0;

    sortedGroup.forEach((draft) => {
      if (
        keptDrafts.length >= AI_CAMERA_MAX_REVIEW_CARDS_PER_PAGE ||
        keptForPanel.length >= panelLimit ||
        keptForPanel.some((kept) => areAiCameraSuggestionsRedundant(kept, draft))
      ) {
        suppressedCount += 1;
        return;
      }

      keptForPanel.push(draft);
      keptDrafts.push(draft);
    });

    if (suppressedCount > 0 && keptForPanel[0]) {
      keptForPanel[0].warnings = [
        ...keptForPanel[0].warnings,
        `Density guardrail: suppressed ${suppressedCount} weaker or redundant camera suggestion${suppressedCount === 1 ? "" : "s"} for this panel.`,
      ];
    }
  });

  return keptDrafts
    .sort((first, second) => first.originalIndex - second.originalIndex)
    .map(({ priorityScore, originalIndex, ...draft }) => draft);
}

function getAiCameraPanelSuggestionLimit(
  panelId: string,
  pageUnderstanding: AiPageUnderstandingResult,
  acceptedDetails: FocusRegion[],
) {
  const panel = pageUnderstanding.analysis?.panels.find((item) => item.id === panelId);
  const regions = getAiPageUnderstandingRegions(pageUnderstanding).filter(
    (region) => region.panelId === panelId,
  );
  const actionOrDetailCount = regions.filter(
    (region) =>
      region.kind === "action" ||
      region.kind === "detail" ||
      region.kind === "background",
  ).length;
  const acceptedDetailCount = panel
    ? acceptedDetails.filter(
        (detail) => getRectOverlapRatio(panel.geometry, detail) >= 0.2,
      ).length
    : 0;

  if (actionOrDetailCount + acceptedDetailCount >= 3) {
    return AI_CAMERA_DENSE_PANEL_CARD_LIMIT;
  }

  if (actionOrDetailCount > 0 || acceptedDetailCount > 0 || regions.length >= 4) {
    return AI_CAMERA_COMPLEX_PANEL_CARD_LIMIT;
  }

  return AI_CAMERA_ORDINARY_PANEL_CARD_LIMIT;
}

function getAiCameraSuggestionPriority(
  suggestion: AiDirectorSuggestionsResult["suggestions"][number],
  target: AiCameraSuggestionTargetRef,
  supportingTargets: AiCameraSuggestionTargetRef[],
) {
  let score = getAiCameraTargetPriority(target, suggestion);

  score += supportingTargets.some((item) => item.type === "acceptedDetail") ? 16 : 0;
  score += supportingTargets.some((item) => item.type === "aiAction") ? 10 : 0;
  score += getAiConfidenceScore(suggestion.confidence);

  if (suggestion.warning) {
    score -= 12;
  }

  return score;
}

function getAiCameraTargetPriority(
  target: AiCameraSuggestionTargetRef,
  suggestion: AiDirectorSuggestionsResult["suggestions"][number],
  region?: AiPageUnderstandingRegion,
) {
  const reasonText = `${suggestion.reason} ${suggestion.moodMotionInterpretation} ${suggestion.suggestedAttentionPath}`.toLowerCase();
  let score = getDraftMotionTargetPriority(target);

  if (region) {
    score += getAiConfidenceScore(region.confidence);
  }

  if (
    suggestion.suggestedCameraMotion === "pushIn" &&
    (target.type === "acceptedDetail" ||
      target.type === "aiDetail" ||
      target.type === "aiCharacter" ||
      target.type === "aiAction")
  ) {
    score += 18;
  }

  if (
    suggestion.suggestedCameraMotion === "pushOut" &&
    (target.type === "aiPanel" ||
      target.type === "acceptedDetail" ||
      target.type === "aiDetail")
  ) {
    score += 12;
  }

  if (
    suggestion.suggestedCameraMotion === "track" &&
    (target.type === "aiPanel" ||
      target.type === "aiCharacter" ||
      target.type === "aiAction")
  ) {
    score += 8;
  }

  if (
    reasonText.includes("reaction") ||
    reasonText.includes("emotion") ||
    reasonText.includes("threat") ||
    reasonText.includes("realization") ||
    reasonText.includes("impact")
  ) {
    score += target.type === "aiCharacter" || target.type === "aiAction" ? 12 : 0;
  }

  if (
    reasonText.includes("detail") ||
    reasonText.includes("clue") ||
    reasonText.includes("inspect") ||
    reasonText.includes("reveal")
  ) {
    score +=
      target.type === "acceptedDetail" || target.type === "aiDetail" ? 12 : 0;
  }

  if (target.type === "aiSpeech") {
    score -= 22;
  }

  return score;
}

function getAiConfidenceScore(
  confidence: AiDirectorSuggestionsResult["suggestions"][number]["confidence"],
) {
  if (confidence === "high") {
    return 14;
  }

  if (confidence === "medium") {
    return 6;
  }

  if (confidence === "low") {
    return -10;
  }

  return -14;
}

function areAiCameraSuggestionsRedundant(
  first: AiCameraSuggestionDraft,
  second: AiCameraSuggestionDraft,
) {
  if (first.targetPanelId !== second.targetPanelId) {
    return false;
  }

  const sameViewingIntention =
    first.movementRole === second.movementRole ||
    inferDirectorBeatTypeFromTarget(first.target, []) ===
      inferDirectorBeatTypeFromTarget(second.target, []);
  const nearlySameTarget =
    getRectOverlapRatio(first.target.geometry, second.target.geometry) >=
      AI_CAMERA_REDUNDANT_TARGET_OVERLAP_RATIO ||
    getRectContainmentRatio(first.target.geometry, second.target.geometry) >=
      AI_CAMERA_REDUNDANT_TARGET_OVERLAP_RATIO ||
    getRectContainmentRatio(second.target.geometry, first.target.geometry) >=
      AI_CAMERA_REDUNDANT_TARGET_OVERLAP_RATIO ||
    getRectCenterDistanceRatio(first.target.geometry, second.target.geometry) <=
      AI_CAMERA_REDUNDANT_CENTER_DISTANCE_RATIO;

  if (nearlySameTarget && sameViewingIntention) {
    return true;
  }

  return (
    nearlySameTarget &&
    (first.supportingTargets.some((target) =>
      areAiCameraTargetGeometriesSimilar(target, second.target),
    ) ||
      second.supportingTargets.some((target) =>
        areAiCameraTargetGeometriesSimilar(target, first.target),
      ))
  );
}

function areAiCameraTargetsEqual(
  first: AiCameraSuggestionTargetRef,
  second: AiCameraSuggestionTargetRef,
) {
  return first.id === second.id && first.type === second.type;
}

function createAiCameraTargetRef(
  region: AiPageUnderstandingRegion | undefined,
  fallbackType: AiCameraSuggestionTargetRef["type"] = "aiPanel",
  fallbackId = "page",
  fallbackLabel = "Page",
  fallbackGeometry: AiPageUnderstandingGeometry = {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  },
): AiCameraSuggestionTargetRef {
  if (!region) {
    return {
      id: fallbackId,
      label: fallbackLabel,
      geometry: fallbackGeometry,
      type: fallbackType,
    };
  }

  return {
    id: region.id,
    label: region.label,
    geometry: region.geometry,
    type: getAiCameraTargetTypeForRegion(region),
  };
}

function getAiCameraTargetTypeForRegion(
  region: AiPageUnderstandingRegion,
): AiCameraSuggestionTargetRef["type"] {
  if (region.kind === "panel" || region.kind === "establishing") {
    return "aiPanel";
  }

  if (region.kind === "character" || region.kind === "face") {
    return "aiCharacter";
  }

  if (region.kind === "speech") {
    return "aiSpeech";
  }

  if (region.kind === "detail" || region.kind === "background") {
    return "aiDetail";
  }

  return "aiAction";
}

function getAcceptedDetailTargetsForRegions(
  regions: AiPageUnderstandingRegion[],
  acceptedDetails: FocusRegion[],
): AiCameraSuggestionTargetRef[] {
  const matches = new Map<string, AiCameraSuggestionTargetRef>();

  regions.forEach((region) => {
    acceptedDetails.forEach((detail) => {
      if (getRectOverlapRatio(region.geometry, detail) >= 0.35) {
        matches.set(detail.id, {
          id: detail.id,
          label: detail.label,
          geometry: {
            x: detail.x,
            y: detail.y,
            width: detail.width,
            height: detail.height,
          },
          type: "acceptedDetail",
        });
      }
    });
  });

  return [...matches.values()];
}

function getAiCameraSuggestionValidationWarnings(
  suggestion: AiDirectorSuggestionsResult["suggestions"][number],
  pageUnderstanding: AiPageUnderstandingResult,
  target: AiCameraSuggestionTargetRef,
  referencedRegions: AiPageUnderstandingRegion[],
) {
  const warnings: string[] = [];

  if (pageUnderstanding.isStale) {
    warnings.push("Suggestion is stale because the page-understanding result is stale.");
  }

  if (
    suggestion.referencedRegionIds.length > 0 &&
    referencedRegions.length !== suggestion.referencedRegionIds.length
  ) {
    warnings.push("Suggestion is blocked because one or more AI target regions are missing.");
  }

  if (target.id === "page") {
    warnings.push("Suggestion is blocked because it has no usable target region.");
  }

  if (
    suggestion.suggestedCameraMotion !== "track" &&
    suggestion.suggestedCameraMotion !== "pushIn" &&
    suggestion.suggestedCameraMotion !== "pushOut"
  ) {
    warnings.push("Suggestion is blocked because it uses an unsupported movement role.");
  }

  return warnings;
}

function getRectOverlapRatio(
  first: AiPageUnderstandingGeometry,
  second: Pick<FocusRegion, "x" | "y" | "width" | "height">,
) {
  const x1 = Math.max(first.x, second.x);
  const y1 = Math.max(first.y, second.y);
  const x2 = Math.min(first.x + first.width, second.x + second.width);
  const y2 = Math.min(first.y + first.height, second.y + second.height);
  const overlapArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const smallerArea = Math.min(
    Math.max(1, first.width * first.height),
    Math.max(1, second.width * second.height),
  );

  return overlapArea / smallerArea;
}

function getRectContainmentRatio(
  inner: AiPageUnderstandingGeometry,
  outer: Pick<FocusRegion, "x" | "y" | "width" | "height">,
) {
  const x1 = Math.max(inner.x, outer.x);
  const y1 = Math.max(inner.y, outer.y);
  const x2 = Math.min(inner.x + inner.width, outer.x + outer.width);
  const y2 = Math.min(inner.y + inner.height, outer.y + outer.height);
  const overlapArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const innerArea = Math.max(1, inner.width * inner.height);

  return overlapArea / innerArea;
}

function getRectCenterDistanceRatio(
  first: AiPageUnderstandingGeometry,
  second: AiPageUnderstandingGeometry,
) {
  const firstCenterX = first.x + first.width / 2;
  const firstCenterY = first.y + first.height / 2;
  const secondCenterX = second.x + second.width / 2;
  const secondCenterY = second.y + second.height / 2;
  const distance = Math.hypot(firstCenterX - secondCenterX, firstCenterY - secondCenterY);
  const referenceSize = Math.max(
    1,
    Math.max(first.width, first.height, second.width, second.height),
  );

  return distance / referenceSize;
}

function areAiCameraTargetGeometriesSimilar(
  first: AiCameraSuggestionTargetRef,
  second: AiCameraSuggestionTargetRef,
) {
  return (
    getRectOverlapRatio(first.geometry, second.geometry) >=
      AI_CAMERA_REDUNDANT_TARGET_OVERLAP_RATIO ||
    getRectCenterDistanceRatio(first.geometry, second.geometry) <=
      AI_CAMERA_REDUNDANT_CENTER_DISTANCE_RATIO
  );
}

function formatCameraSuggestionTarget(target: AiCameraSuggestionTargetRef) {
  if (target.type === "acceptedDetail") {
    return `Accepted detail: ${target.label}`;
  }

  if (target.type === "aiPanel") {
    return `AI panel: ${target.label}`;
  }

  if (target.type === "aiCharacter") {
    return `AI character: ${target.label}`;
  }

  if (target.type === "aiSpeech") {
    return `AI speech: ${target.label}`;
  }

  if (target.type === "aiDetail") {
    return `AI detail: ${target.label}`;
  }

  return `AI action: ${target.label}`;
}

function formatDirectorRegionReferences(
  regionIds: string[],
  pageUnderstandingResult: AiPageUnderstandingResult | null,
) {
  if (regionIds.length === 0) {
    return "Panel only";
  }

  const regions = pageUnderstandingResult
    ? getAiPageUnderstandingRegions(pageUnderstandingResult)
    : [];
  const labels = regionIds.map((regionId) => {
    const region = regions.find((item) => item.id === regionId);
    return region ? `${region.id} (${region.label})` : regionId;
  });

  return labels.join(", ");
}

function getAiPageHighlight(
  result: AiPageUnderstandingResult | null,
  regionId: string | null,
): AiPageHighlight | null {
  if (!regionId || !result?.analysis) {
    return null;
  }

  const region = getAiPageUnderstandingRegions(result).find(
    (item) => item.id === regionId,
  );

  if (!region) {
    return null;
  }

  return {
    id: region.id,
    label: region.label,
    kind: region.kind,
    rawGeometry: region.rawGeometry,
    geometrySpace: region.geometrySpace,
    x: region.geometry.x,
    y: region.geometry.y,
    width: region.geometry.width,
    height: region.geometry.height,
    analyzedX: region.analyzedGeometry?.x,
    analyzedY: region.analyzedGeometry?.y,
    analyzedWidth: region.analyzedGeometry?.width,
    analyzedHeight: region.analyzedGeometry?.height,
    analyzedImageWidth: result.image.analyzedWidth,
    analyzedImageHeight: result.image.analyzedHeight,
    sourceImageWidth: result.image.width,
    sourceImageHeight: result.image.height,
  };
}

function getAiPageUnderstandingRegions(result: AiPageUnderstandingResult) {
  if (!result.analysis) {
    return [];
  }

  return [
    ...result.analysis.panels,
    ...result.analysis.characterRegions,
    ...result.analysis.speechRegions,
    ...result.analysis.detailRegions,
    ...result.analysis.actionRegions,
  ];
}

function AiPageUnderstandingReview({
  image,
  result,
  activeRegionId,
  selectedRegionId,
  onHoverRegion,
  onSelectRegion,
  detailHighlights,
  selectedDetailHighlightId,
  hiddenAiDetailFingerprints,
  onAcceptAiDetail,
  onRejectAiDetail,
  onSelectDetailHighlight,
  onChangeDetailHighlight,
  onDeleteDetailHighlight,
}: {
  image: UploadedImage | null;
  result: AiPageUnderstandingResult | null;
  activeRegionId: string | null;
  selectedRegionId: string | null;
  onHoverRegion: (regionId: string | null) => void;
  onSelectRegion: (regionId: string | null) => void;
  detailHighlights: FocusRegion[];
  selectedDetailHighlightId: string | null;
  hiddenAiDetailFingerprints: string[];
  onAcceptAiDetail: (region: AiPageUnderstandingRegion) => void;
  onRejectAiDetail: (region: AiPageUnderstandingRegion) => void;
  onSelectDetailHighlight: (detailId: string) => void;
  onChangeDetailHighlight: (detail: FocusRegion) => void;
  onDeleteDetailHighlight: (detailId: string) => void;
}) {
  if (!result) {
    return (
      <div className="ai-page-review-empty">
        <p>AI page-understanding results will appear here as temporary review data.</p>
        <AiPageRegionGroup
          title="Details"
          regions={[]}
          activeRegionId={activeRegionId}
          selectedRegionId={selectedRegionId}
          onHoverRegion={onHoverRegion}
          onSelectRegion={onSelectRegion}
          detailHighlights={detailHighlights}
          image={image}
          selectedDetailHighlightId={selectedDetailHighlightId}
          onSelectDetailHighlight={onSelectDetailHighlight}
          onChangeDetailHighlight={onChangeDetailHighlight}
          onDeleteDetailHighlight={onDeleteDetailHighlight}
        />
      </div>
    );
  }

  if (!result.analysis) {
    const validationWarnings = result.validationWarnings ?? [];

    return (
      <div className="ai-page-review" role="status">
        <div className="ai-page-review-header">
          <span className="suggestion-type">Provider error</span>
          <strong>{result.providerModel}</strong>
        </div>
        <p className="ai-director-warning">
          {result.providerError ?? "The provider did not return usable analysis."}
        </p>
        {validationWarnings.length > 0 ? (
          <div className="ai-page-warning-list">
            {validationWarnings.map((warning) => (
              <p className="ai-director-warning" key={`validation-${warning}`}>
                {warning}
              </p>
            ))}
          </div>
        ) : null}
        <AiPageRegionGroup
          title="Details"
          regions={[]}
          activeRegionId={activeRegionId}
          selectedRegionId={selectedRegionId}
          onHoverRegion={onHoverRegion}
          onSelectRegion={onSelectRegion}
          detailHighlights={detailHighlights}
          image={image}
          selectedDetailHighlightId={selectedDetailHighlightId}
          onSelectDetailHighlight={onSelectDetailHighlight}
          onChangeDetailHighlight={onChangeDetailHighlight}
          onDeleteDetailHighlight={onDeleteDetailHighlight}
        />
      </div>
    );
  }

  const analysis = result.analysis;
  const validationWarnings = result.validationWarnings ?? [];
  const hasWarnings =
    analysis.warnings.length > 0 || validationWarnings.length > 0;
  const regionCount =
    analysis.panels.length +
    analysis.characterRegions.length +
    analysis.speechRegions.length +
    analysis.detailRegions.length +
    analysis.actionRegions.length;

  return (
    <div className="ai-page-review" role="status">
      <details className="ai-review-section" open>
        <summary>Overview</summary>
        <div className="ai-page-review-header">
          <span className="suggestion-type">AI page understanding</span>
          <strong>{result.providerModel}</strong>
          {result.isStale ? (
            <small>Stale result. Re-run analysis for the current page.</small>
          ) : null}
          <small>
            Temporary result from {formatDateTime(result.createdAt)}. Analyzed{" "}
            {result.image.analyzedWidth}x{result.image.analyzedHeight}px copy.
          </small>
        </div>

        <p>{analysis.pageSummary}</p>

        <dl className="ai-director-metadata">
          <div>
            <dt>Mood</dt>
            <dd>{analysis.mood.label}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{analysis.mood.confidence}</dd>
          </div>
          <div>
            <dt>Regions</dt>
            <dd>{regionCount}</dd>
          </div>
          <div>
            <dt>Warnings</dt>
            <dd>{analysis.warnings.length}</dd>
          </div>
        </dl>
        <p>{analysis.mood.reason}</p>
      </details>

      <details className="ai-review-section">
        <summary>Page Understanding</summary>
        <div className="ai-understanding-flashcards">
          {analysis.readingOrder.length > 0 ? (
            <div className="ai-page-review-group ai-reading-order-card">
              <div className="ai-page-review-group-header">
                <strong>Reading order</strong>
                <span>{analysis.readingOrder.length} beats</span>
              </div>
              <ol className="ai-reading-order-strip">
                {analysis.readingOrder.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <span>{index + 1}</span>
                    <strong>{item}</strong>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <AiPageRegionGroup
            title="Panels"
            regions={analysis.panels}
            activeRegionId={activeRegionId}
            selectedRegionId={selectedRegionId}
            onHoverRegion={onHoverRegion}
            onSelectRegion={onSelectRegion}
          />
          <AiPageRegionGroup
            title="Characters / Faces"
            regions={analysis.characterRegions}
            activeRegionId={activeRegionId}
            selectedRegionId={selectedRegionId}
            onHoverRegion={onHoverRegion}
            onSelectRegion={onSelectRegion}
          />
          <AiPageRegionGroup
            title="Speech"
            regions={analysis.speechRegions}
            activeRegionId={activeRegionId}
            selectedRegionId={selectedRegionId}
            onHoverRegion={onHoverRegion}
            onSelectRegion={onSelectRegion}
          />
          <AiPageRegionGroup
            title="Details"
            regions={analysis.detailRegions.filter(
              (region) =>
                !hiddenAiDetailFingerprints.includes(
                  createAiDetailFingerprint(region),
                ),
            )}
            activeRegionId={activeRegionId}
            selectedRegionId={selectedRegionId}
            onHoverRegion={onHoverRegion}
            onSelectRegion={onSelectRegion}
            detailHighlights={detailHighlights}
            image={image}
            selectedDetailHighlightId={selectedDetailHighlightId}
            onAcceptAiDetail={onAcceptAiDetail}
            onRejectAiDetail={onRejectAiDetail}
            onSelectDetailHighlight={onSelectDetailHighlight}
            onChangeDetailHighlight={onChangeDetailHighlight}
            onDeleteDetailHighlight={onDeleteDetailHighlight}
          />
          <AiPageRegionGroup
            title="Action"
            regions={analysis.actionRegions}
            activeRegionId={activeRegionId}
            selectedRegionId={selectedRegionId}
            onHoverRegion={onHoverRegion}
            onSelectRegion={onSelectRegion}
          />
        </div>
      </details>

      {hasWarnings ? (
        <details className="ai-review-section" open>
          <summary>Warnings</summary>
          <div className="ai-page-warning-list">
            {validationWarnings.map((warning) => (
              <p className="ai-director-warning" key={`validation-${warning}`}>
                {warning}
              </p>
            ))}
            {analysis.warnings.map((warning) => (
              <p className="ai-director-warning" key={warning}>
                {warning}
              </p>
            ))}
          </div>
        </details>
      ) : null}

      {result.usage ? (
        <details className="ai-review-section">
          <summary>Usage</summary>
          <dl className="ai-director-metadata">
            <div>
              <dt>Input tokens</dt>
              <dd>{formatOptionalNumber(result.usage.inputTokens)}</dd>
            </div>
            <div>
              <dt>Output tokens</dt>
              <dd>{formatOptionalNumber(result.usage.outputTokens)}</dd>
            </div>
            <div>
              <dt>Total tokens</dt>
              <dd>{formatOptionalNumber(result.usage.totalTokens)}</dd>
            </div>
            <div>
              <dt>Est. cost</dt>
              <dd>{formatOptionalCost(result.usage.estimatedCostUsd)}</dd>
            </div>
          </dl>
        </details>
      ) : null}
    </div>
  );
}

function AiPageRegionGroup({
  title,
  regions,
  image,
  activeRegionId,
  selectedRegionId,
  onHoverRegion,
  onSelectRegion,
  detailHighlights = [],
  selectedDetailHighlightId = null,
  onAcceptAiDetail,
  onRejectAiDetail,
  onSelectDetailHighlight,
  onChangeDetailHighlight,
  onDeleteDetailHighlight,
}: {
  title: string;
  regions: AiPageUnderstandingRegion[];
  image?: UploadedImage | null;
  activeRegionId: string | null;
  selectedRegionId: string | null;
  onHoverRegion: (regionId: string | null) => void;
  onSelectRegion: (regionId: string | null) => void;
  detailHighlights?: FocusRegion[];
  selectedDetailHighlightId?: string | null;
  onAcceptAiDetail?: (region: AiPageUnderstandingRegion) => void;
  onRejectAiDetail?: (region: AiPageUnderstandingRegion) => void;
  onSelectDetailHighlight?: (detailId: string) => void;
  onChangeDetailHighlight?: (detail: FocusRegion) => void;
  onDeleteDetailHighlight?: (detailId: string) => void;
}) {
  const isDetailGroup = title === "Details";

  if (regions.length === 0 && (!isDetailGroup || detailHighlights.length === 0)) {
    return null;
  }

  return (
    <div className="ai-page-review-group">
      <div className="ai-page-review-group-header">
        <strong>{title}</strong>
        <span>
          {regions.length + detailHighlights.length}{" "}
          {regions.length + detailHighlights.length === 1 ? "card" : "cards"}
        </span>
      </div>
      {isDetailGroup ? (
        <p className="suggestions-empty">
          AI details are suggestions. Accept a suggested detail or draw a Detail
          Highlight on the canvas to create editable project data.
        </p>
      ) : null}
      {detailHighlights.length > 0 ? (
        <ul className="ai-page-region-list">
          {detailHighlights.map((detail) => (
            <ManualDetailHighlightCard
              detail={detail}
              image={image}
              isSelected={detail.id === selectedDetailHighlightId}
              key={detail.id}
              onSelect={onSelectDetailHighlight}
              onChange={onChangeDetailHighlight}
              onDelete={onDeleteDetailHighlight}
            />
          ))}
        </ul>
      ) : null}
      {regions.length > 0 ? (
        <ul className="ai-page-region-list">
          {regions.map((region) => (
          <li
            className={[
              "ai-page-region-item",
              region.id === activeRegionId ? "is-highlighted" : "",
              region.id === selectedRegionId ? "is-selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={region.id}
            tabIndex={0}
            onClick={() => onSelectRegion(region.id)}
            onFocus={() => onHoverRegion(region.id)}
            onBlur={() => onHoverRegion(null)}
            onMouseEnter={() => onHoverRegion(region.id)}
            onMouseLeave={() => onHoverRegion(null)}
          >
            <div className="ai-director-item-header">
              <span
                className={[
                  "suggestion-type",
                  region.kind === "detail" && region.confidence !== "high"
                    ? "is-low-confidence-detail"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {region.kind}
              </span>
              <strong>{region.label}</strong>
            </div>
            {region.warnings.length > 0 ? (
              <span className="ai-region-warning-badge">
                {region.warnings.length} warning
                {region.warnings.length === 1 ? "" : "s"}
              </span>
            ) : null}
            <details className="ai-region-card-detail">
              <summary>Inspect card</summary>
              <p>{region.description}</p>
              <small className="ai-region-confidence">
                Confidence {region.confidence}
              </small>
              <dl className="suggestion-geometry">
                <div>
                  <dt>X</dt>
                  <dd>{Math.round(region.geometry.x)}px</dd>
                </div>
                <div>
                  <dt>Y</dt>
                  <dd>{Math.round(region.geometry.y)}px</dd>
                </div>
                <div>
                  <dt>W</dt>
                  <dd>{Math.round(region.geometry.width)}px</dd>
                </div>
                <div>
                  <dt>H</dt>
                  <dd>{Math.round(region.geometry.height)}px</dd>
                </div>
              </dl>
              {region.warnings.map((warning) => (
                <p className="ai-director-warning" key={warning}>
                  {warning}
                </p>
              ))}
              {isDetailGroup && onAcceptAiDetail && onRejectAiDetail ? (
                <div className="ai-detail-card-actions">
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onAcceptAiDetail(region);
                    }}
                  >
                    Accept Detail
                  </button>
                  <button
                    className="timeline-move-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRejectAiDetail(region);
                    }}
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </details>
          </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ManualDetailHighlightCard({
  detail,
  image,
  isSelected,
  onSelect,
  onChange,
  onDelete,
}: {
  detail: FocusRegion;
  image?: UploadedImage | null;
  isSelected: boolean;
  onSelect?: (detailId: string) => void;
  onChange?: (detail: FocusRegion) => void;
  onDelete?: (detailId: string) => void;
}) {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function updateDetail(partialDetail: Partial<FocusRegion>) {
    onChange?.({
      ...detail,
      ...partialDetail,
    });
  }

  function updateNumber(field: "x" | "y" | "width" | "height", value: string) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      setValidationMessage(`${field.toUpperCase()} must be a number.`);
      return;
    }

    const requestedValue = Math.round(numericValue);
    const nextDetail = normalizeDetailGeometryForImage(
      {
        ...detail,
        [field]: requestedValue,
      },
      image ?? null,
    );
    const normalizedValue = nextDetail[field];

    if (requestedValue !== normalizedValue) {
      setValidationMessage(
        `${field.toUpperCase()} was clamped to ${normalizedValue}px to stay inside the page image.`,
      );
    } else {
      setValidationMessage(null);
    }

    onChange?.(nextDetail);
  }

  return (
    <li
      className={[
        "ai-page-region-item",
        "manual-detail-card",
        isSelected ? "is-selected is-highlighted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      tabIndex={0}
      onClick={() => onSelect?.(detail.id)}
      onFocus={() => onSelect?.(detail.id)}
    >
      <div className="ai-director-item-header">
        <span className="suggestion-type is-accepted-detail">
          Accepted detail
        </span>
        <strong>{detail.label}</strong>
      </div>
      <small className="ai-region-confidence">
        Project detail highlight. Edits here are the source of truth.
      </small>
      <details className="ai-region-card-detail" open>
        <summary>Edit detail</summary>
        <label className="ai-detail-edit-field">
          <span>Label</span>
          <input
            value={detail.label}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => updateDetail({ label: event.target.value })}
          />
        </label>
        <label className="ai-detail-edit-field">
          <span>Description</span>
          <textarea
            value={detail.description ?? ""}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              updateDetail({ description: event.target.value })
            }
          />
        </label>
        <dl className="suggestion-geometry ai-detail-edit-geometry">
          {(["x", "y", "width", "height"] as const).map((field) => (
            <div key={field}>
              <dt>{field.toUpperCase()}</dt>
              <dd>
                <input
                  type="number"
                  min={field === "width" || field === "height" ? 1 : 0}
                  max={getDetailGeometryFieldMax(field, detail, image ?? null)}
                  value={Math.round(detail[field])}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => updateNumber(field, event.target.value)}
                />
              </dd>
            </div>
          ))}
        </dl>
        {validationMessage ? (
          <p className="ai-detail-validation" role="status">
            {validationMessage}
          </p>
        ) : null}
        <div className="ai-detail-card-actions">
          <button
            className="timeline-move-button"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(detail.id);
            }}
          >
            Delete Detail
          </button>
        </div>
      </details>
    </li>
  );
}

function parseJson(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Project file is not valid JSON.");
  }
}

function createCompressedImageDataUrl(objectUrl: string) {
  return new Promise<{ dataUrl: string; width: number; height: number }>(
    (resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const maxDimension = 1400;
        const scale = Math.min(
          1,
          maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not prepare the page image for AI analysis."));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.78),
          width,
          height,
        });
      };
      image.onerror = () =>
        reject(new Error("Could not load the page image for AI analysis."));
      image.src = objectUrl;
    },
  );
}

function getProviderErrorFromResponse(value: unknown) {
  if (isPlainRecord(value) && typeof value.error === "string") {
    return value.error;
  }

  return "The provider returned an unknown error.";
}

function getProviderModelFromResponse(value: unknown) {
  if (isPlainRecord(value) && typeof value.providerModel === "string") {
    return value.providerModel;
  }

  return "OpenAI";
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatOptionalNumber(value: number | undefined) {
  return typeof value === "number" ? value.toLocaleString() : "n/a";
}

function formatOptionalCost(value: number | undefined) {
  return typeof value === "number" ? `$${value.toFixed(6)}` : "n/a";
}

function imageDimensionsMatch(
  image: UploadedImage,
  expectedImage: ProjectImageMetadata,
) {
  return image.width === expectedImage.width && image.height === expectedImage.height;
}

function isJsonFile(file: File) {
  return (
    file.name.toLowerCase().endsWith(".json") ||
    file.type === "application/json"
  );
}

function isProjectArchiveFile(file: File) {
  return file.name.toLowerCase().endsWith(".ccvproject");
}

function createImportSuccessMessage(
  image: ProjectImageMetadata | null,
  backgroundAudio: ImportedBackgroundAudio | null,
  soundEffectMarkers: SoundEffectMarkerMetadata[] = [],
) {
  const audioNote = backgroundAudio
    ? ` Re-upload ${backgroundAudio.fileName} before exporting with background audio, or use an archive file next time.`
    : "";
  const sfxNote =
    soundEffectMarkers.length > 0
      ? ` ${soundEffectMarkers.length} SFX marker${soundEffectMarkers.length === 1 ? "" : "s"} imported as metadata only; use an archive file to restore SFX audio.`
      : "";

  if (!image) {
    return `Project JSON imported. Re-upload the source image before editing the canvas or preview.${audioNote}${sfxNote}`;
  }

  return `Project JSON imported. Re-upload ${image.fileName} (${image.width}x${image.height}px) to pair the source image with the restored shots and focus regions.${audioNote}${sfxNote}`;
}

function createArchiveImportSuccessMessage(
  imageFileName: string,
  backgroundAudio: UploadedBackgroundAudio | null,
  soundEffectMarkerCount = 0,
  missingSoundEffectMarkerCount = 0,
) {
  const audioNote = backgroundAudio
    ? `Project archive imported with bundled source image ${imageFileName} and background audio ${backgroundAudio.fileName}.`
    : `Project archive imported with bundled source image ${imageFileName}.`;
  const sfxNote =
    soundEffectMarkerCount > 0
      ? ` Restored ${soundEffectMarkerCount} SFX marker${soundEffectMarkerCount === 1 ? "" : "s"}.`
      : "";
  const missingNote =
    missingSoundEffectMarkerCount > 0
      ? ` ${missingSoundEffectMarkerCount} SFX marker${missingSoundEffectMarkerCount === 1 ? "" : "s"} had no bundled audio and remain metadata only.`
      : "";

  return `${audioNote}${sfxNote}${missingNote}`;
}

function getNextShotNumber(shots: CameraShot[]) {
  const maxImportedShotNumber = shots.reduce((maxShotNumber, shot) => {
    const match = /^shot-(\d+)-/.exec(shot.id);

    return match ? Math.max(maxShotNumber, Number(match[1])) : maxShotNumber;
  }, 0);

  return Math.max(maxImportedShotNumber + 1, shots.length + 1, 1);
}

function createVideoExportSuccessMessage(
  fileName: string,
  mimeType: string,
  settings: ExportVideoSettings,
  requestedAudio: boolean,
  recordedAudioTrackCount: number,
  audioWarnings: string[],
) {
  const settingsSummary = `${settings.width}x${settings.height} at ${settings.fps} fps`;
  const audioSummary = requestedAudio
    ? ` Audio requested; recorder stream had ${recordedAudioTrackCount} audio track${recordedAudioTrackCount === 1 ? "" : "s"}.`
    : " Audio was not requested.";
  const warningSummary =
    audioWarnings.length > 0 ? ` Audio warnings: ${audioWarnings.join(" ")}` : "";

  if (mimeType.includes("mp4")) {
    return `Video prototype exported as ${fileName}. Recorded ${settingsSummary}. Format: MP4 (${mimeType}).${audioSummary}${warningSummary}`;
  }

  return `Video prototype exported as ${fileName}. Recorded ${settingsSummary}. This browser used WebM fallback because MP4 recording was not supported (${mimeType}).${audioSummary}${warningSummary}`;
}

function createVideoExportSettings(
  resolution: ExportResolutionOption,
  fps: ExportFpsOption,
): ExportVideoSettings {
  const size =
    VIDEO_EXPORT_RESOLUTION_OPTIONS[resolution] ?? DEFAULT_VIDEO_EXPORT_SETTINGS;

  return {
    ...size,
    fps: VIDEO_EXPORT_FPS_OPTIONS[fps] ?? DEFAULT_VIDEO_EXPORT_SETTINGS.fps,
  };
}

function formatProgressPercent(progress: number) {
  return `${Math.round(progress * 100)}%`;
}

function formatDuration(milliseconds: number) {
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

function toSeconds(milliseconds: number) {
  return Number((milliseconds / 1000).toFixed(1));
}

function secondsInputToMilliseconds(value: string) {
  const seconds = Number(value);

  return Number.isFinite(seconds) ? Math.max(0, Math.round(seconds * 1000)) : 0;
}

function normalizeAudioSettings(
  settings: BackgroundAudioSettings,
  audio: UploadedBackgroundAudio,
): BackgroundAudioSettings {
  const maxDurationMs = Math.max(1, audio.durationMs);
  const trimStartMs = clampNumber(
    Math.round(settings.trimStartMs),
    0,
    Math.max(0, maxDurationMs - 1),
  );
  const trimEndMs = clampNumber(
    Math.round(settings.trimEndMs),
    trimStartMs + 1,
    maxDurationMs,
  );

  return {
    enabled: settings.enabled,
    trimStartMs,
    trimEndMs,
    loop: settings.loop,
    fadeInMs: Math.max(0, Math.round(settings.fadeInMs)),
    fadeOutMs: Math.max(0, Math.round(settings.fadeOutMs)),
    volume: clampNumber(settings.volume, 0, 1),
  };
}

function normalizeSoundEffectMarker(
  marker: UploadedSoundEffectMarker,
  cameraShots: CameraShot[],
): UploadedSoundEffectMarker {
  const targetShotIndex = cameraShots.findIndex(
    (shot) => shot.id === marker.targetShotId,
  );
  const targetShot = targetShotIndex >= 0 ? cameraShots[targetShotIndex] : null;
  const maxOffsetMs = Math.max(0, (targetShot?.durationMs ?? 1) - 1);
  const maxShotSpan = Math.max(
    1,
    targetShotIndex >= 0 ? cameraShots.length - targetShotIndex : cameraShots.length,
  );

  return {
    ...marker,
    label: marker.label?.trim() || "SFX Marker",
    targetShotId: targetShot?.id ?? cameraShots[0]?.id ?? marker.targetShotId,
    offsetMs: clampNumber(
      Number.isFinite(marker.offsetMs) ? Math.round(marker.offsetMs) : 0,
      0,
      maxOffsetMs,
    ),
    playDurationMs: Math.max(
      1,
      Number.isFinite(marker.playDurationMs)
        ? Math.round(marker.playDurationMs)
        : Number.isFinite(marker.durationMs)
          ? Math.round(marker.durationMs)
          : 1,
    ),
    shotSpan: clampNumber(
      Number.isFinite(marker.shotSpan) ? Math.round(marker.shotSpan) : 1,
      1,
      maxShotSpan,
    ),
    volume: clampNumber(Number.isFinite(marker.volume) ? marker.volume : 1, 0, 1),
  };
}

function normalizeSoundEffectMarkerFields(
  marker: UploadedSoundEffectMarker,
): UploadedSoundEffectMarker {
  return {
    ...marker,
    label: marker.label?.trim() || "SFX Marker",
    offsetMs: Number.isFinite(marker.offsetMs) ? Math.max(0, Math.round(marker.offsetMs)) : 0,
    playDurationMs: Math.max(
      1,
      Number.isFinite(marker.playDurationMs)
        ? Math.round(marker.playDurationMs)
        : Number.isFinite(marker.durationMs)
          ? Math.round(marker.durationMs)
          : 1,
    ),
    shotSpan: Number.isFinite(marker.shotSpan)
      ? Math.max(1, Math.round(marker.shotSpan))
      : 1,
    volume: clampNumber(Number.isFinite(marker.volume) ? marker.volume : 1, 0, 1),
  };
}

function getAllSoundEffectMarkerMetadata(
  uploadedMarkers: UploadedSoundEffectMarker[],
  expectedMarkers: SoundEffectMarkerMetadata[],
): SoundEffectMarkerMetadata[] {
  const uploadedIds = new Set(uploadedMarkers.map((marker) => marker.id));

  return [
    ...uploadedMarkers.map((uploadedMarker) => {
      const { objectUrl: _objectUrl, ...marker } =
        normalizeSoundEffectMarkerFields(uploadedMarker);

      return marker;
    }),
    ...expectedMarkers.filter((marker) => !uploadedIds.has(marker.id)),
  ];
}

function createDefaultSoundEffectLabel(fileName: string, markerNumber: number) {
  const extensionlessName = fileName.replace(/\.[^.]+$/, "").trim();

  return extensionlessName || `SFX ${markerNumber}`;
}

function getShotLabel(shotId: string, cameraShots: CameraShot[]) {
  return cameraShots.find((shot) => shot.id === shotId)?.label ?? "Missing shot";
}

function createAiDirectorSuggestions(
  selectedShot: CameraShot | null,
  cameraShots: CameraShot[],
  focusRegions: FocusRegion[],
): AiDirectorSuggestion[] {
  const targetShots = selectedShot ? [selectedShot] : cameraShots.slice(0, 2);

  return targetShots.flatMap((shot, shotIndex) => {
    const pathItems = [...(shot.attentionPath ?? [])].sort(
      (first, second) => first.order - second.order,
    );
    const shotSuggestion = createShotDirectorSuggestion(shot, shotIndex);
    const pathSuggestions = pathItems.slice(0, 2).map((pathItem, pathIndex) =>
      createPathDirectorSuggestion(shot, pathItem, pathIndex, focusRegions),
    );

    return [shotSuggestion, ...pathSuggestions];
  });
}

function createShotDirectorSuggestion(
  shot: CameraShot,
  shotIndex: number,
): AiDirectorSuggestion {
  const purpose = shot.shotPurpose;
  const hasImpact = shot.specialEffects?.impactPulse === true;
  const hasShake = shot.specialEffects?.shake === true;

  if (purpose === "action" || hasShake) {
    return {
      id: `ai-shot-${shot.id}`,
      targetType: "shot",
      shotId: shot.id,
      target: `${shot.label} shot direction`,
      mood: "Action",
      motionRole: "track",
      effect: "Shake",
      cueTiming: "Early",
      confidence: "Medium",
      reason:
        "Shake can support the action beat as a shot-level effect without creating or replacing camera movement.",
      canApply: true,
    };
  }

  if (purpose === "emotion" || purpose === "reaction") {
    return {
      id: `ai-shot-${shot.id}`,
      targetType: "shot",
      shotId: shot.id,
      target: `${shot.label} shot direction`,
      mood: "Emotion",
      motionRole: "pushIn",
      effect: hasImpact ? "Impact Pulse" : "None",
      cueTiming: hasImpact ? "Arrival" : "Not applicable",
      confidence: "Medium",
      reason:
        hasImpact
          ? "The existing impact pulse can punctuate this emotional beat as a shot-level effect."
          : "No target-bound attention path exists in this shot note, so the only applicable shot-level recommendation is effect-off.",
      canApply: true,
    };
  }

  if (purpose === "reveal" || hasImpact) {
    return {
      id: `ai-shot-${shot.id}`,
      targetType: "shot",
      shotId: shot.id,
      target: `${shot.label} shot direction`,
      mood: "Reveal",
      motionRole: "pushOut",
      effect: "Impact Pulse",
      cueTiming: "Arrival",
      confidence: "Medium",
      reason:
        "Impact Pulse can punctuate the reveal as a shot-level effect while camera movement remains owned by existing path items.",
      canApply: true,
    };
  }

  return {
    id: `ai-shot-${shot.id}`,
    targetType: "shot",
    shotId: shot.id,
    target: `${shot.label} shot direction`,
    mood: shotIndex === 0 ? "Establish" : "Reading",
    motionRole: "track",
    effect: "None",
    cueTiming: "Not applicable",
    confidence: "Low",
    reason:
      "No target-bound attention path exists in this shot note, so the safest applicable recommendation is effect-off.",
    canApply: true,
  };
}

function createPathDirectorSuggestion(
  shot: CameraShot,
  pathItem: ShotAttentionPathItem,
  pathIndex: number,
  focusRegions: FocusRegion[],
): AiDirectorSuggestion {
  const focusRegion = focusRegions.find(
    (region) => region.id === pathItem.focusRegionId,
  );
  const hasFocusRegionTarget = focusRegion !== undefined;
  const existingMotionRole =
    pathItem.motionRole === "track" ||
    pathItem.motionRole === "pushIn" ||
    pathItem.motionRole === "pushOut"
      ? pathItem.motionRole
      : undefined;
  const motionRole =
    existingMotionRole ??
    (focusRegion
      ? getSuggestedMotionRoleForFocusRegion(focusRegion, pathIndex)
      : "track");
  const effect = pathItem.effectCues?.shake
    ? "Shake"
    : pathItem.effectCues?.impactPulse
      ? "Impact Pulse"
      : getSuggestedEffectForFocusRegion(focusRegion);
  const cueTiming = effect === "None"
    ? "Not applicable"
    : pathItem.effectCueTiming === "early"
      ? "Early"
      : "Arrival";

  return {
    id: `ai-path-${shot.id}-${pathItem.id}`,
    targetType: "pathItem",
    shotId: shot.id,
    pathItemId: pathItem.id,
    focusRegionId: pathItem.focusRegionId,
    target: `${shot.label} -> ${focusRegion?.label ?? "missing focus"}`,
    mood: getSuggestedMoodForFocusRegion(focusRegion),
    motionRole,
    effect,
    cueTiming,
    confidence: focusRegion ? "Medium" : "Low",
    reason: focusRegion
      ? `Use the existing ${focusRegion.kind} focus as a reviewed attention beat; keep any effect secondary to ${formatMotionRoleLabel(motionRole)} movement.`
      : "The path item references a missing focus region, so this suggestion is inspect-only until the path is repaired.",
    canApply: hasFocusRegionTarget,
    warning: hasFocusRegionTarget
      ? undefined
      : "This suggestion is blocked because its Focus Region target is missing.",
  };
}

function getSuggestedMotionRoleForFocusRegion(
  focusRegion: FocusRegion | undefined,
  pathIndex: number,
): AiDirectorSuggestion["motionRole"] {
  void pathIndex;

  if (
    focusRegion?.focusPurpose === "reveal" ||
    focusRegion?.focusPurpose === "establishing"
  ) {
    return "pushOut";
  }

  if (
    focusRegion?.focusPurpose === "emotion" ||
    focusRegion?.focusPurpose === "reaction" ||
    focusRegion?.focusPurpose === "detail" ||
    focusRegion?.kind === "detail"
  ) {
    return "pushIn";
  }

  return "track";
}

function getSuggestedEffectForFocusRegion(
  focusRegion: FocusRegion | undefined,
): AiDirectorSuggestion["effect"] {
  return focusRegion?.kind === "action" ? "Shake" : "None";
}

function getSuggestedMoodForFocusRegion(focusRegion: FocusRegion | undefined) {
  if (!focusRegion) {
    return "Caution";
  }

  if (focusRegion.kind === "action") {
    return "Action";
  }

  if (focusRegion.kind === "face") {
    return "Emotion";
  }

  if (focusRegion.kind === "speech") {
    return "Dialogue";
  }

  if (focusRegion.kind === "detail") {
    return "Detail";
  }

  return "Reading";
}

function formatMotionRoleLabel(motionRole: AiDirectorSuggestion["motionRole"]) {
  if (motionRole === "pushIn") {
    return "Push In";
  }

  if (motionRole === "pushOut") {
    return "Push Out";
  }

  return "Track";
}

function formatDirectorMotionLabel(suggestion: AiDirectorSuggestion) {
  if (suggestion.targetType === "shot") {
    return "Shot-level only";
  }

  if (!suggestion.canApply) {
    return "Blocked target";
  }

  return formatMotionRoleLabel(suggestion.motionRole);
}

function createShotSpecialEffectsFromDirectorSuggestion(
  effect: AiDirectorSuggestion["effect"],
): CameraShot["specialEffects"] {
  if (effect === "Shake") {
    return { shake: true };
  }

  if (effect === "Impact Pulse") {
    return { impactPulse: true };
  }

  return undefined;
}

function createEffectCuesFromDirectorSuggestion(
  effect: AiDirectorSuggestion["effect"],
): ShotAttentionPathItem["effectCues"] {
  if (effect === "Shake") {
    return { shake: "once" };
  }

  if (effect === "Impact Pulse") {
    return { impactPulse: "once" };
  }

  return undefined;
}

function createEffectCueTimingFromDirectorSuggestion(
  cueTiming: AiDirectorSuggestion["cueTiming"],
): ShotAttentionPathItem["effectCueTiming"] {
  return cueTiming === "Early" ? "early" : "arrival";
}

function readAudioDurationMs(objectUrl: string) {
  return new Promise<number>((resolve, reject) => {
    const audio = document.createElement("audio");

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const durationMs = Math.round(audio.duration * 1000);

      if (Number.isFinite(durationMs) && durationMs > 0) {
        resolve(durationMs);
        return;
      }

      reject(new Error("That audio file did not report a usable duration."));
    };
    audio.onerror = () =>
      reject(new Error("That file could not be loaded as background audio."));
    audio.src = objectUrl;
  });
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function createSuggestionId(
  kind: "shot" | "focus" | "path" | "motion",
  suggestionNumber: number,
) {
  return `suggestion-${kind}-${suggestionNumber}-${Date.now()}`;
}

function removeAiDerivedTemporarySuggestions(suggestions: TemporarySuggestion[]) {
  return suggestions.filter(
    (suggestion) =>
      suggestion.source !== "aiDirectorDraft" &&
      suggestion.type !== "draftMotion",
  );
}

function getDraftAttentionPathFocusRegions(
  selectedShot: CameraShot,
  focusRegions: FocusRegion[],
) {
  return focusRegions
    .map((focusRegion, index) => ({ focusRegion, index }))
    .filter(
      ({ focusRegion }) =>
        getFocusRegionInclusionRatio(selectedShot, focusRegion) >=
          FOCUS_REGION_INCLUSION_THRESHOLD,
    )
    .sort((first, second) => {
      const firstOrder = first.focusRegion.sequenceOrder ?? first.index + 1;
      const secondOrder = second.focusRegion.sequenceOrder ?? second.index + 1;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return first.index - second.index;
    })
    .map(({ focusRegion }) => focusRegion);
}

function createAiDraftAttentionPathItems(
  selectedShot: CameraShot,
  focusRegions: FocusRegion[],
) {
  return focusRegions.map((focusRegion, index) => {
    const motionRole = getAiDraftMotionRole(focusRegion, index);
    const durationWeight = getAiDraftDurationWeight(focusRegion, selectedShot);

    return {
      focusRegionId: focusRegion.id,
      motionRole,
      durationWeight,
      reason: getAiDraftPathItemReason(focusRegion, motionRole),
    };
  });
}

function createSuggestedAttentionPathItems(
  shotId: string,
  draftPathItems: ReturnType<typeof createAiDraftAttentionPathItems>,
): ShotAttentionPathItem[] {
  return draftPathItems.map((draftPathItem, index) => ({
    id: createAttentionPathItemId(
      shotId,
      draftPathItem.focusRegionId,
      index + 1,
    ),
    focusRegionId: draftPathItem.focusRegionId,
    order: index + 1,
    motionRole: draftPathItem.motionRole,
    durationWeight: draftPathItem.durationWeight,
  }));
}

function createAttentionPathItemId(
  shotId: string,
  focusRegionId: string,
  order: number,
) {
  return `attention-${shotId}-${focusRegionId}-${order}-${Date.now()}`;
}

function formatSuggestionType(suggestionType: TemporarySuggestion["type"]) {
  if (suggestionType === "cameraShot") {
    return "Camera Shot";
  }

  if (suggestionType === "focusRegion") {
    return "Focus Region";
  }

  if (suggestionType === "draftMotion") {
    return "Draft Motion";
  }

  return "Attention Path";
}

function getSuggestionTitle(
  suggestion: TemporarySuggestion,
  cameraShots: CameraShot[],
) {
  if (suggestion.type !== "shotAttentionPath") {
    if (suggestion.type === "draftMotion") {
      return suggestion.proposedValues.label;
    }

    return suggestion.proposedValues.label;
  }

  const targetShot = cameraShots.find(
    (shot) => shot.id === suggestion.proposedValues.targetShotId,
  );

  return `Path for ${
    targetShot?.label ?? suggestion.proposedValues.targetShotLabel
  }`;
}

function getSuggestionDraftPathItems(
  suggestion: Extract<TemporarySuggestion, { type: "shotAttentionPath" }>,
) {
  if (suggestion.proposedValues.pathItems) {
    return suggestion.proposedValues.pathItems;
  }

  return (suggestion.proposedValues.focusRegionIds ?? []).map(
    (focusRegionId, index) => ({
      focusRegionId,
      motionRole: (index === 0 ? "pushIn" : "track") as ActiveShotAttentionMotionRole,
      durationWeight: 1,
      reason: "Legacy focus-only draft item.",
    }),
  );
}

function getAiDraftMotionRole(
  focusRegion: FocusRegion,
  index: number,
): ActiveShotAttentionMotionRole {
  if (focusRegion.kind === "action") {
    return "track";
  }

  if (focusRegion.kind === "panel" && index === 0) {
    return "pushOut";
  }

  if (
    focusRegion.focusPurpose === "emotion" ||
    focusRegion.focusPurpose === "reaction" ||
    focusRegion.focusPurpose === "detail" ||
    focusRegion.kind === "detail"
  ) {
    return "pushIn";
  }

  return "track";
}

function getAiDraftDurationWeight(
  focusRegion: FocusRegion,
  selectedShot: CameraShot,
) {
  const areaRatio =
    (focusRegion.width * focusRegion.height) /
    Math.max(1, selectedShot.width * selectedShot.height);

  if (focusRegion.kind === "speech") {
    return 1.4;
  }

  if (focusRegion.kind === "action") {
    return 0.9;
  }

  return areaRatio > 0.35 ? 1.2 : 1;
}

function getAiDraftPathItemReason(
  focusRegion: FocusRegion,
  motionRole: ActiveShotAttentionMotionRole,
) {
  if (focusRegion.kind === "speech") {
    return "Speech focus gets extra reading time while preserving the manual region.";
  }

  if (focusRegion.kind === "action") {
    return "Action focus stays on track movement so shake or impact can remain secondary.";
  }

  if (motionRole === "pushIn") {
    return "Detail-oriented focus uses push-in to emphasize the existing target.";
  }

  if (motionRole === "pushOut") {
    return "First panel-like focus starts with context before later attention beats.";
  }

  return "Track is the normal calm movement between existing manual focus regions.";
}

function createFocusRegionId(suggestionId: string) {
  return `focus-from-${suggestionId}-${Date.now()}`;
}

function getNextFocusRegionSequenceOrder(focusRegions: FocusRegion[]) {
  const maxSequenceOrder = focusRegions.reduce(
    (maxOrder, focusRegion) =>
      Math.max(maxOrder, focusRegion.sequenceOrder ?? 0),
    0,
  );

  return maxSequenceOrder + 1;
}

function normalizeDetailGeometryForImage(
  focusRegion: FocusRegion,
  image: UploadedImage | null,
): FocusRegion {
  if (focusRegion.kind !== "detail" || !image) {
    return {
      ...focusRegion,
      x: Math.max(0, Math.round(focusRegion.x)),
      y: Math.max(0, Math.round(focusRegion.y)),
      width: Math.max(1, Math.round(focusRegion.width)),
      height: Math.max(1, Math.round(focusRegion.height)),
    };
  }

  const maxWidth = Math.max(1, image.width);
  const maxHeight = Math.max(1, image.height);
  const width = clampNumber(Math.round(focusRegion.width), 1, maxWidth);
  const height = clampNumber(Math.round(focusRegion.height), 1, maxHeight);
  const x = clampNumber(
    Math.round(focusRegion.x),
    0,
    Math.max(0, image.width - width),
  );
  const y = clampNumber(
    Math.round(focusRegion.y),
    0,
    Math.max(0, image.height - height),
  );

  return {
    ...focusRegion,
    x,
    y,
    width: Math.min(width, Math.max(1, image.width - x)),
    height: Math.min(height, Math.max(1, image.height - y)),
  };
}

function getDetailGeometryFieldMax(
  field: "x" | "y" | "width" | "height",
  detail: FocusRegion,
  image: UploadedImage | null,
) {
  if (!image) {
    return undefined;
  }

  if (field === "x") {
    return Math.max(0, image.width - Math.max(1, Math.round(detail.width)));
  }

  if (field === "y") {
    return Math.max(0, image.height - Math.max(1, Math.round(detail.height)));
  }

  if (field === "width") {
    return Math.max(1, image.width - Math.max(0, Math.round(detail.x)));
  }

  return Math.max(1, image.height - Math.max(0, Math.round(detail.y)));
}

function createAiDetailFingerprint(region: AiPageUnderstandingRegion) {
  return [
    "detail",
    Math.round(region.geometry.x),
    Math.round(region.geometry.y),
    Math.round(region.geometry.width),
    Math.round(region.geometry.height),
  ].join(":");
}

function addHiddenAiDetailFingerprint(
  fingerprints: string[],
  region: AiPageUnderstandingRegion,
) {
  const nextFingerprint = createAiDetailFingerprint(region);

  return fingerprints.includes(nextFingerprint)
    ? fingerprints
    : [...fingerprints, nextFingerprint];
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
