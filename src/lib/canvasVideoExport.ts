import { getFocusRegionInclusionRatio, getPreviewShotPlacement } from "./coordinateMath";
import type {
  ActiveShotAttentionMotionRole,
  BackgroundAudioSettings,
  CameraShot,
  FocusRegion,
  FocusRegionEffectType,
  GuidedPageOptions,
  ShotAttentionEffectCues,
  ShotAttentionMotionRole,
  ShotEffectCueMode,
  ShotEffectCueTiming,
  UploadedBackgroundAudio,
  UploadedImage,
  UploadedSoundEffectMarker,
} from "./projectTypes";

type ExportVideoPrototypeInput = {
  image: UploadedImage;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  guidedPageOptions?: GuidedPageOptions;
  backgroundAudio?: UploadedBackgroundAudio | null;
  soundEffectMarkers?: UploadedSoundEffectMarker[];
  settings?: ExportVideoSettings;
  focusTreatmentStyle?: FocusTreatmentStyle;
  signal?: AbortSignal;
  onProgress?: (progress: ExportVideoProgress) => void;
};

type ExportVideoPrototypeResult = {
  blob: Blob;
  fileName: string;
  mimeType: string;
  attemptedMimeTypes: string[];
  requestedAudio: boolean;
  recordedAudioTrackCount: number;
  audioWarnings: string[];
};

export type ExportVideoProgress = {
  phase: "preparing" | "recording" | "finalizing";
  elapsedMs: number;
  totalDurationMs: number;
  progress: number;
  message: string;
};

export type ExportVideoSettings = {
  width: number;
  height: number;
  fps: number;
};

export type FocusTreatmentStyle = "clean" | "cinematic-dim" | "soft-focus";

type ShotPhaseRatios = {
  travelRatio: number;
  holdRatio: number;
  focusRatio: number;
};

type PreviewPhase = "travel" | "hold" | "focus" | "exit";

type ExportTimelineFrame =
  | {
      segment: "shot";
      shotIndex: number;
      shotProgress: number;
    }
  | {
      segment: "pageEnter" | "pageExit";
      progress: number;
    };

type ViewportSize = {
  width: number;
  height: number;
};

type PreviewShotPlacement = ReturnType<typeof getPreviewShotPlacement>;

type SourceWindow = Pick<CameraShot, "x" | "y" | "width" | "height">;

type AttentionAnchor = {
  region: FocusRegion;
  motionRole: ActiveShotAttentionMotionRole;
  durationWeight: number;
  effectCues?: ShotAttentionEffectCues;
  effectCueTiming?: ShotEffectCueTiming;
};

type ActiveAttentionAnchor = {
  anchor: AttentionAnchor;
  previousAnchor: AttentionAnchor | null;
  nextAnchor: AttentionAnchor | null;
  progress: number;
  transitionProgress: number;
  durationShare: number;
};

type TrackAttentionField = {
  dimOpacity: number;
  spotStrength: number;
  viewportWidth: number;
  viewportHeight: number;
  center: Point;
  radius: number;
};

type ProjectedSourceWindow = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type CameraShakeOffset = {
  x: number;
  y: number;
};

type AttentionEffectCueClock = {
  isActive: boolean;
  elapsedMs: number;
};

type ActiveFocusEffect = {
  region: FocusRegion;
  effectType: Exclude<FocusRegionEffectType, "none">;
  previousRegion: FocusRegion | null;
  previousEffectType: Exclude<FocusRegionEffectType, "none"> | null;
  nextRegion: FocusRegion | null;
  nextEffectType: Exclude<FocusRegionEffectType, "none"> | null;
  progress: number;
  transitionProgress: number;
};

export const DEFAULT_VIDEO_EXPORT_SETTINGS: ExportVideoSettings = {
  width: 1280,
  height: 720,
  fps: 30,
};
const FOCUS_REGION_INCLUSION_THRESHOLD = 0.6;
const TRAVEL_PHASE_RATIO = 0.24;
const SHOT_TRAVEL_MIN_DURATION_MS = 720;
const SHOT_TRAVEL_MAX_RATIO = 0.36;
const HOLD_PHASE_RATIO = 0.1;
const FOCUS_PHASE_RATIO = 0.6;
const EXIT_PHASE_RATIO = 0.05;
const GUIDED_PAGE_SEGMENT_DURATION_MS = 2400;
const GUIDED_PAGE_HOLD_RATIO = 0.5;
const TRAVEL_VEIL_DIM_PEAK_OPACITY = 0.1;
const TRAVEL_VEIL_BLUR_PEAK_PX = 1;
const TRACK_WINDOW_WIDTH_RATIO = 0.62;
const TRACK_WINDOW_HEIGHT_RATIO = 0.62;
const TRACK_READABILITY_PADDING_RATIO = 0.08;
const PUSH_IN_CONTEXT_SCALE = 1.04;
const PUSH_OUT_CONTEXT_SCALE = 1.45;
const PUSH_OUT_CLOSEUP_RATIO = 0.42;
const TRACK_CHAIN_ENTRY_DURATION_WEIGHT = 0.35;
const ATTENTION_SETTLE_RATIO: Record<ActiveShotAttentionMotionRole, number> = {
  track: 0.22,
  pushIn: 0.3,
  pushOut: 0.24,
};
const TRACK_ATTENTION_DIM_OPACITY = 1;
const TRACK_FOLLOW_SPOT_CLEAR_STRENGTH = 0.96;
const TRACK_ATTENTION_OVERLAY_MODE: "followSpot" | "none" = "none";
const CAMERA_SHAKE_PREVIEW_MAX_OFFSET_PX = 5;
const CAMERA_SHAKE_CUE_ONCE_DURATION_MS = 420;
const ATTENTION_EFFECT_CUE_ARRIVAL_PROGRESS: Record<
  ShotEffectCueTiming,
  number
> = {
  early: 0.5,
  arrival: 0.68,
};
const PUSH_OUT_EFFECT_CUE_ARRIVAL_PROGRESS: Record<
  ShotEffectCueTiming,
  number
> = {
  early: 0.78,
  arrival: 0.9,
};
const IMPACT_PULSE_PREVIEW_DURATION_MS = 360;
const IMPACT_PULSE_PREVIEW_PEAK_OPACITY = 0.55;
const IMPACT_PULSE_REPEAT_INTERVAL_MS = 760;
const ZOOM_MAX_SCALE = 1.08;
const LIFT_MAX_WIDTH_RATIO = 0.72;
const LIFT_MAX_HEIGHT_RATIO = 0.72;
const LIFT_PADDING = 28;

const VIDEO_ONLY_MIME_TYPES = [
  "video/mp4;codecs=avc1.42E01E",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];
const VIDEO_WITH_AUDIO_MIME_TYPES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

export async function exportVideoPrototype({
  image,
  cameraShots,
  focusRegions,
  guidedPageOptions,
  backgroundAudio,
  soundEffectMarkers = [],
  settings = DEFAULT_VIDEO_EXPORT_SETTINGS,
  focusTreatmentStyle = "cinematic-dim",
  signal,
  onProgress,
}: ExportVideoPrototypeInput): Promise<ExportVideoPrototypeResult> {
  if (cameraShots.length === 0) {
    throw new Error("Add at least one camera shot before exporting video.");
  }

  throwIfExportAborted(signal);
  onProgress?.({
    phase: "preparing",
    elapsedMs: 0,
    totalDurationMs: 0,
    progress: 0,
    message: "Preparing source image and browser recorder.",
  });

  const canvas = document.createElement("canvas");
  canvas.width = settings.width;
  canvas.height = settings.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  const renderContext = context;

  if (!("captureStream" in canvas) || typeof MediaRecorder === "undefined") {
    throw new Error(
      "Video export is not supported in this browser. This prototype needs canvas captureStream and MediaRecorder support.",
    );
  }

  const shouldIncludeAudio =
    Boolean(backgroundAudio?.settings.enabled) || soundEffectMarkers.length > 0;
  const supportedMimeTypes = getSupportedVideoMimeTypes(shouldIncludeAudio);

  if (supportedMimeTypes.length === 0) {
    throw new Error(
      "Video export is not supported in this browser. MediaRecorder did not report a supported video format.",
    );
  }

  throwIfExportAborted(signal);
  const sourceImage = await loadImageElement(image.objectUrl);
  const totalDurationMs = getTotalExportDurationMs(
    cameraShots,
    guidedPageOptions,
  );

  for (const [index, mimeType] of supportedMimeTypes.entries()) {
    throwIfExportAborted(signal);

    try {
      return await recordVideoWithMimeType({
        mimeType,
        attemptedMimeTypes: supportedMimeTypes.slice(0, index + 1),
        canvas,
        renderContext,
        sourceImage,
        image,
        cameraShots,
        focusRegions,
        guidedPageOptions,
        backgroundAudio,
        soundEffectMarkers,
        settings,
        focusTreatmentStyle,
        shouldIncludeAudio,
        totalDurationMs,
        signal,
        onProgress,
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw createExportCanceledError();
      }

      if (
        !isVideoRecorderStartupError(error) ||
        index === supportedMimeTypes.length - 1
      ) {
        throw error;
      }

      onProgress?.({
        phase: "preparing",
        elapsedMs: 0,
        totalDurationMs,
        progress: 0,
        message: `Recorder could not start with ${mimeType}; trying another supported format.`,
      });
    }
  }

  throw new Error("Video export could not start in this browser.");
}

async function recordVideoWithMimeType({
  mimeType,
  attemptedMimeTypes,
  canvas,
  renderContext,
  sourceImage,
  image,
  cameraShots,
  focusRegions,
  guidedPageOptions,
  backgroundAudio,
  soundEffectMarkers,
  settings,
  focusTreatmentStyle,
  shouldIncludeAudio,
  totalDurationMs,
  signal,
  onProgress,
}: {
  mimeType: string;
  attemptedMimeTypes: string[];
  canvas: HTMLCanvasElement;
  renderContext: CanvasRenderingContext2D;
  sourceImage: HTMLImageElement;
  image: UploadedImage;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  guidedPageOptions?: GuidedPageOptions;
  backgroundAudio?: UploadedBackgroundAudio | null;
  soundEffectMarkers: UploadedSoundEffectMarker[];
  settings: ExportVideoSettings;
  focusTreatmentStyle: FocusTreatmentStyle;
  shouldIncludeAudio: boolean;
  totalDurationMs: number;
  signal?: AbortSignal;
  onProgress?: (progress: ExportVideoProgress) => void;
}): Promise<ExportVideoPrototypeResult> {
  const stream = canvas.captureStream(settings.fps);
  const audioMix = await createExportAudioMix({
    backgroundAudio,
    soundEffectMarkers,
    cameraShots,
    guidedPageOptions,
    totalDurationMs,
    signal,
  });
  audioMix.stream?.getAudioTracks().forEach((track) => stream.addTrack(track));
  const recordedAudioTrackCount = stream.getAudioTracks().length;
  const chunks: BlobPart[] = [];

  return new Promise((resolve, reject) => {
    let recorder: MediaRecorder | null = null;
    let animationFrame = 0;
    let startedAt = 0;
    let didStop = false;
    let didCancel = false;
    let lastProgressAt = 0;

    function cleanup() {
      cancelAnimationFrame(animationFrame);
      audioMix.stop();
      stream.getTracks().forEach((track) => track.stop());
      signal?.removeEventListener("abort", handleAbort);
    }

    function handleAbort() {
      if (didStop) {
        return;
      }

      didCancel = true;
      didStop = true;
      cleanup();

      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      } else {
        reject(createExportCanceledError());
      }
    }

    function step(now: number) {
      if (signal?.aborted) {
        handleAbort();
        return;
      }

      if (startedAt === 0) {
        startedAt = now;
      }

      const elapsedMs = Math.min(now - startedAt, totalDurationMs);
      renderExportFrame({
        context: renderContext,
        sourceImage,
        image,
        cameraShots,
        focusRegions,
        guidedPageOptions,
        settings,
        focusTreatmentStyle,
        elapsedMs,
      });

      if (now - lastProgressAt >= 250 || elapsedMs >= totalDurationMs) {
        lastProgressAt = now;
        onProgress?.({
        phase: "recording",
        elapsedMs,
        totalDurationMs,
        progress: clamp(elapsedMs / totalDurationMs, 0, 1),
        message: shouldIncludeAudio
          ? `Recording canvas frames with ${recordedAudioTrackCount} audio track${recordedAudioTrackCount === 1 ? "" : "s"}.`
          : "Recording canvas frames.",
      });
      }

      if (elapsedMs >= totalDurationMs) {
        if (!didStop) {
          didStop = true;
          recorder?.stop();
        }

        return;
      }

      animationFrame = requestAnimationFrame(step);
    }

    let didRecorderStart = false;

    try {
      const activeRecorder = new MediaRecorder(stream, { mimeType });
      recorder = activeRecorder;

      activeRecorder.addEventListener("dataavailable", (event) => {
        if (!didCancel && event.data.size > 0) {
          chunks.push(event.data);
        }
      });

      activeRecorder.addEventListener("stop", () => {
        cleanup();

        if (didCancel) {
          reject(createExportCanceledError());
          return;
        }

        onProgress?.({
          phase: "finalizing",
          elapsedMs: totalDurationMs,
          totalDurationMs,
          progress: 1,
          message: "Finalizing recorded video file.",
        });
        resolve({
          blob: new Blob(chunks, { type: mimeType }),
          fileName: createVideoExportFileName(image.fileName, mimeType),
          mimeType,
          attemptedMimeTypes,
          requestedAudio: shouldIncludeAudio,
          recordedAudioTrackCount,
          audioWarnings: audioMix.warnings,
        });
      });

      activeRecorder.addEventListener("error", () => {
        cleanup();
        reject(new Error("Video export failed while recording the canvas."));
      });

      signal?.addEventListener("abort", handleAbort, { once: true });
      throwIfExportAborted(signal);
      activeRecorder.start();
      didRecorderStart = true;
      audioMix.start();
      animationFrame = requestAnimationFrame(step);
    } catch (error) {
      cleanup();
      reject(
        isAbortError(error)
          ? createExportCanceledError()
          : didRecorderStart
            ? new Error(`Video export audio mix could not start with ${mimeType}.`)
            : new VideoRecorderStartupError(
                `Video export could not start with ${mimeType}.`,
              ),
      );
    }
  });
}

export function getVideoExportFormatSupportMessage(includeAudio = false) {
  if (typeof MediaRecorder === "undefined") {
    return "Video export is unavailable in this browser because MediaRecorder is not supported.";
  }

  const supportedMimeTypes = getSupportedVideoMimeTypes(includeAudio);
  const mimeType = supportedMimeTypes[0] ?? "";

  if (!mimeType) {
    return "Video export is unavailable in this browser because no supported MediaRecorder video format was reported.";
  }

  if (mimeType.includes("mp4")) {
    return includeAudio
      ? `This browser reports MP4 recording support with audio (${mimeType}). If startup fails, export will try another reported format.`
      : `This browser reports MP4 recording support (${mimeType}). If startup fails, export will try another reported format.`;
  }

  return includeAudio
    ? `This browser does not report MP4 recording support with background audio, so export will fall back to WebM (${mimeType}).`
    : `This browser does not report MP4 recording support, so export will fall back to WebM (${mimeType}).`;
}

type ExportAudioMix = {
  stream: MediaStream | null;
  warnings: string[];
  start: () => void;
  stop: () => void;
};

async function createExportAudioMix({
  backgroundAudio,
  soundEffectMarkers,
  cameraShots,
  guidedPageOptions,
  totalDurationMs,
  signal,
}: {
  backgroundAudio?: UploadedBackgroundAudio | null;
  soundEffectMarkers: UploadedSoundEffectMarker[];
  cameraShots: CameraShot[];
  guidedPageOptions?: GuidedPageOptions;
  totalDurationMs: number;
  signal?: AbortSignal;
}): Promise<ExportAudioMix> {
  const warnings: string[] = [];

  if (!backgroundAudio?.settings.enabled && soundEffectMarkers.length === 0) {
    return createEmptyAudioMix(warnings);
  }

  throwIfExportAborted(signal);

  const prefixedWindow = window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextConstructor =
    window.AudioContext ?? prefixedWindow.webkitAudioContext;

  if (!AudioContextConstructor) {
    return createEmptyAudioMix([
      "Audio export is not supported in this browser because Web Audio is unavailable.",
    ]);
  }

  throwIfExportAborted(signal);
  const audioContext = new AudioContextConstructor();
  const destination = audioContext.createMediaStreamDestination();
  const exportDurationSeconds = Math.max(0.001, totalDurationMs / 1000);
  let backgroundClip:
    | {
        buffer: AudioBuffer;
        settings: BackgroundAudioSettings;
        clip: ReturnType<typeof getAudioClipSettings>;
      }
    | null = null;
  const scheduledSoundEffects: {
    marker: UploadedSoundEffectMarker;
    buffer: AudioBuffer;
    startsAtSeconds: number;
    maxDurationSeconds: number;
  }[] = [];

  try {
    if (backgroundAudio?.settings.enabled) {
      const buffer = await decodeAudioFromObjectUrl(
        audioContext,
        backgroundAudio.objectUrl,
      );

      backgroundClip = {
        buffer,
        settings: backgroundAudio.settings,
        clip: getAudioClipSettings(backgroundAudio.settings, buffer.duration),
      };
    }
  } catch {
    warnings.push(
      `Background audio "${backgroundAudio?.fileName ?? "unknown"}" could not be decoded and was skipped.`,
    );
  }

  for (const marker of soundEffectMarkers) {
    try {
      const timing = getSoundEffectTiming(
        marker,
        cameraShots,
        guidedPageOptions,
      );

      if (timing.startsAtSeconds >= exportDurationSeconds) {
        warnings.push(`SFX "${marker.label}" starts after export end and was skipped.`);
        continue;
      }

      scheduledSoundEffects.push({
        marker,
        buffer: await decodeAudioFromObjectUrl(audioContext, marker.objectUrl),
        startsAtSeconds: timing.startsAtSeconds,
        maxDurationSeconds: timing.maxDurationSeconds,
      });
    } catch {
      warnings.push(`SFX "${marker.label}" could not be decoded and was skipped.`);
    }
  }

  if (!backgroundClip && scheduledSoundEffects.length === 0) {
    destination.stream.getTracks().forEach((track) => track.stop());
    void audioContext.close();

    return createEmptyAudioMix(warnings);
  }

  const activeSources: AudioBufferSourceNode[] = [];

  return {
    stream: destination.stream,
    warnings,
    start() {
      const startsAt = audioContext.currentTime + 0.03;
      const endsAt = startsAt + exportDurationSeconds;

      void audioContext.resume();

      if (backgroundClip) {
        try {
          const gain = audioContext.createGain();
          const source = audioContext.createBufferSource();
          const clip = backgroundClip.clip;
          const volume = clip.volume;

          source.buffer = backgroundClip.buffer;
          source.loop = backgroundClip.settings.loop;
          source.loopStart = clip.startSeconds;
          source.loopEnd = clip.endSeconds;
          source.connect(gain);
          gain.connect(destination);
          gain.gain.cancelScheduledValues(startsAt);
          gain.gain.setValueAtTime(0, startsAt);

          if (clip.fadeInSeconds > 0) {
            gain.gain.linearRampToValueAtTime(
              volume,
              Math.min(startsAt + clip.fadeInSeconds, endsAt),
            );
          } else {
            gain.gain.setValueAtTime(volume, startsAt);
          }

          if (clip.fadeOutSeconds > 0) {
            const fadeOutStartsAt = Math.max(
              startsAt,
              endsAt - clip.fadeOutSeconds,
            );

            gain.gain.setValueAtTime(volume, fadeOutStartsAt);
            gain.gain.linearRampToValueAtTime(0, endsAt);
          }

          if (backgroundClip.settings.loop) {
            source.start(startsAt, clip.startSeconds);
          } else {
            source.start(
              startsAt,
              clip.startSeconds,
              Math.min(clip.durationSeconds, exportDurationSeconds),
            );
          }

          activeSources.push(source);
        } catch {
          warnings.push("Background audio could not be scheduled and was skipped.");
        }
      }

      scheduledSoundEffects.forEach(
        ({ marker, buffer, startsAtSeconds, maxDurationSeconds }) => {
          try {
            const gain = audioContext.createGain();
            const source = audioContext.createBufferSource();
            const sourceStartsAt = startsAt + startsAtSeconds;
            const playDurationSeconds = getSoundEffectPlayDurationSeconds(
              marker,
              buffer,
            );
            const durationSeconds = Math.min(
              buffer.duration,
              playDurationSeconds,
              Math.max(0.001, maxDurationSeconds),
              Math.max(0.001, endsAt - sourceStartsAt),
            );

            source.buffer = buffer;
            source.connect(gain);
            gain.connect(destination);
            gain.gain.setValueAtTime(clamp(marker.volume, 0, 1), sourceStartsAt);
            source.start(sourceStartsAt, 0, durationSeconds);
            activeSources.push(source);
          } catch {
            warnings.push(
              `SFX "${marker.label}" could not be scheduled and was skipped.`,
            );
          }
        },
      );
    },
    stop() {
      activeSources.forEach((source) => {
        try {
          source.stop();
        } catch {
          // The source may already have ended naturally.
        }
      });

      destination.stream.getTracks().forEach((track) => track.stop());
      void audioContext.close();
    },
  };
}

function createEmptyAudioMix(warnings: string[]): ExportAudioMix {
  return {
    stream: null,
    warnings,
    start() {},
    stop() {},
  };
}

async function decodeAudioFromObjectUrl(
  audioContext: AudioContext,
  objectUrl: string,
) {
  const response = await fetch(objectUrl);

  if (!response.ok) {
    throw new Error("Audio file could not be read.");
  }

  return audioContext.decodeAudioData(await response.arrayBuffer());
}

function getSoundEffectTiming(
  marker: UploadedSoundEffectMarker,
  cameraShots: CameraShot[],
  guidedPageOptions?: GuidedPageOptions,
) {
  const shotIndex = cameraShots.findIndex((shot) => shot.id === marker.targetShotId);

  if (shotIndex === -1) {
    throw new Error("Sound effect target shot is missing.");
  }

  const pageEnterOffsetMs = guidedPageOptions?.showPageEnter
    ? GUIDED_PAGE_SEGMENT_DURATION_MS
    : 0;
  const shotStartMs = cameraShots
    .slice(0, shotIndex)
    .reduce((totalMs, shot) => totalMs + Math.max(1, shot.durationMs), 0);
  const shotSpan = isPositiveFiniteNumber(marker.shotSpan)
    ? Math.max(1, Math.round(marker.shotSpan))
    : 1;
  const spanEndShotIndex = Math.min(cameraShots.length, shotIndex + shotSpan);
  const spanDurationMs = cameraShots
    .slice(shotIndex, spanEndShotIndex)
    .reduce((totalMs, shot) => totalMs + Math.max(1, shot.durationMs), 0);
  const offsetMs = isFiniteNumber(marker.offsetMs) ? Math.max(0, marker.offsetMs) : 0;

  return {
    startsAtSeconds: (pageEnterOffsetMs + shotStartMs + offsetMs) / 1000,
    maxDurationSeconds: Math.max(0.001, (spanDurationMs - offsetMs) / 1000),
  };
}

function getSoundEffectPlayDurationSeconds(
  marker: UploadedSoundEffectMarker,
  buffer: AudioBuffer,
) {
  if (isPositiveFiniteNumber(marker.playDurationMs)) {
    return Math.max(0.001, marker.playDurationMs / 1000);
  }

  if (isPositiveFiniteNumber(marker.durationMs)) {
    return Math.max(0.001, marker.durationMs / 1000);
  }

  return Math.max(0.001, buffer.duration);
}

function getAudioClipSettings(
  settings: BackgroundAudioSettings,
  durationSeconds: number,
) {
  const safeDurationSeconds = Math.max(0.001, durationSeconds);
  const maxStartSeconds = Math.max(0, safeDurationSeconds - 0.001);
  const startSeconds = clamp(settings.trimStartMs / 1000, 0, maxStartSeconds);
  const rawEndSeconds =
    settings.trimEndMs > 0 ? settings.trimEndMs / 1000 : safeDurationSeconds;
  const endSeconds = clamp(
    Math.max(rawEndSeconds, startSeconds + 0.001),
    0.001,
    safeDurationSeconds,
  );

  return {
    startSeconds,
    endSeconds,
    durationSeconds: Math.max(0.001, endSeconds - startSeconds),
    fadeInSeconds: Math.max(0, settings.fadeInMs / 1000),
    fadeOutSeconds: Math.max(0, settings.fadeOutMs / 1000),
    volume: clamp(settings.volume, 0, 1),
  };
}

function renderExportFrame({
  context,
  sourceImage,
  image,
  cameraShots,
  focusRegions,
  guidedPageOptions,
  settings,
  focusTreatmentStyle,
  elapsedMs,
}: {
  context: CanvasRenderingContext2D;
  sourceImage: HTMLImageElement;
  image: UploadedImage;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  guidedPageOptions?: GuidedPageOptions;
  settings: ExportVideoSettings;
  focusTreatmentStyle: FocusTreatmentStyle;
  elapsedMs: number;
}) {
  const timelineFrame = getTimelineFrame(
    cameraShots,
    elapsedMs,
    guidedPageOptions,
  );

  if (timelineFrame.segment !== "shot") {
    renderGuidedPageFrame({
      context,
      sourceImage,
      image,
      cameraShots,
      focusRegions,
      settings,
      timelineFrame,
    });
    return;
  }

  const currentShot = cameraShots[timelineFrame.shotIndex];
  const phaseRatios = getShotPhaseRatios(
    currentShot,
    timelineFrame.shotIndex === 0,
  );
  const phase = getPreviewPhase(timelineFrame.shotProgress, phaseRatios);
  const viewportSize = {
    width: settings.width,
    height: settings.height,
  };
  const basePlacement = getPreviewShotPlacement(
    currentShot,
    image,
    settings.width,
    settings.height,
  );
  const anchors = getExplicitAttentionAnchorSequence(currentShot, focusRegions);
  const focusProgress =
    phase === "focus"
      ? getFocusPhaseProgress(timelineFrame.shotProgress, phaseRatios)
      : 0;
  const activeFocusEffect =
    anchors.length === 0 && phase === "focus"
      ? getActiveFocusEffect(
          getEligibleFocusRegions(currentShot, focusRegions),
          focusProgress,
          focusTreatmentStyle,
        )
      : null;
  const activeMotionAnchor =
    anchors.length > 0 && phase === "focus"
      ? getActiveAttentionAnchor(
          anchors,
          focusProgress,
          currentShot.shotStartFraming === "firstFocus",
        )
      : null;
  const currentShotDurationMs = Math.max(1, currentShot.durationMs ?? 2500);
  const shotEffectElapsedMs = Math.max(
    0,
    timelineFrame.shotProgress * currentShotDurationMs -
      currentShotDurationMs * phaseRatios.travelRatio,
  );
  const shouldApplyShotEffects = phase !== "travel" && phase !== "exit";
  const focusDurationMs = currentShotDurationMs * phaseRatios.focusRatio;
  const activeCueDurationMs =
    activeMotionAnchor && focusDurationMs > 0
      ? Math.max(1, focusDurationMs * activeMotionAnchor.durationShare)
      : 0;
  const activeCueElapsedMs = activeMotionAnchor
    ? activeMotionAnchor.progress * activeCueDurationMs
    : 0;
  const shakeCueClock = getAttentionEffectCueClock(
    activeMotionAnchor,
    activeCueElapsedMs,
    activeCueDurationMs,
    CAMERA_SHAKE_CUE_ONCE_DURATION_MS,
    activeMotionAnchor?.anchor.effectCues?.shake,
  );
  const impactPulseCueClock = getAttentionEffectCueClock(
    activeMotionAnchor,
    activeCueElapsedMs,
    activeCueDurationMs,
    IMPACT_PULSE_PREVIEW_DURATION_MS,
    activeMotionAnchor?.anchor.effectCues?.impactPulse,
  );
  const placement = getExportFramePlacement({
    image,
    cameraShots,
    focusRegions,
    settings,
    timelineFrame,
    currentShot,
    phase,
    phaseRatios,
    basePlacement,
    viewportSize,
    activeMotionAnchor,
  });
  const cameraShakeOffset = getCameraShakeOffset(
    (shouldApplyShotEffects && currentShot.specialEffects?.shake === true) ||
      shouldApplyAttentionEffectCue(
        activeMotionAnchor?.anchor.effectCues?.shake,
        shakeCueClock,
        CAMERA_SHAKE_CUE_ONCE_DURATION_MS,
      ),
    phase,
    shotEffectElapsedMs,
    placement,
  );
  const trackAttentionField =
    activeMotionAnchor && phase === "focus"
      ? applyCameraShakeToTrackAttentionField(
          getTrackAttentionField(activeMotionAnchor, placement),
          cameraShakeOffset,
        )
      : applyCameraShakeToTrackAttentionField(
          getFirstFocusTrackAttentionField(
            currentShot,
            anchors,
            placement,
            phase,
          ),
          cameraShakeOffset,
        );
  const impactPulseOpacity = Math.max(
    getImpactPulsePreviewOpacity(
      shouldApplyShotEffects && currentShot.specialEffects?.impactPulse === true,
      phase,
      shotEffectElapsedMs,
    ),
    getAttentionImpactPulseOpacity(
      activeMotionAnchor?.anchor.effectCues?.impactPulse,
      shouldApplyShotEffects,
      phase,
      impactPulseCueClock,
    ),
  );
  const rawTravelProgress =
    phase === "travel" && timelineFrame.shotIndex > 0
      ? getRawTravelProgress(timelineFrame.shotProgress, phaseRatios.travelRatio)
      : 1;
  const travelVeilIntensity =
    phase === "travel" && timelineFrame.shotIndex > 0
      ? getShotTravelVeilIntensity(rawTravelProgress)
      : 0;

  context.clearRect(0, 0, settings.width, settings.height);
  context.fillStyle = "#111827";
  context.fillRect(0, 0, settings.width, settings.height);

  drawShotWindow(
    context,
    sourceImage,
    placement,
    activeFocusEffect,
    travelVeilIntensity,
    cameraShakeOffset,
  );

  if (travelVeilIntensity > 0) {
    drawShotTravelVeil(context, placement, travelVeilIntensity);
  }

  if (trackAttentionField) {
    drawTrackAttentionField(context, trackAttentionField);
  }

  if (activeFocusEffect) {
    drawFocusEffect(
      context,
      sourceImage,
      image,
      placement,
      activeFocusEffect,
      settings,
      focusTreatmentStyle,
    );
  }

  if (impactPulseOpacity > 0) {
    drawImpactPulse(context, settings, impactPulseOpacity);
  }
}

function renderGuidedPageFrame({
  context,
  sourceImage,
  image,
  cameraShots,
  focusRegions,
  settings,
  timelineFrame,
}: {
  context: CanvasRenderingContext2D;
  sourceImage: HTMLImageElement;
  image: UploadedImage;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  settings: ExportVideoSettings;
  timelineFrame: Extract<
    ExportTimelineFrame,
    { segment: "pageEnter" | "pageExit" }
  >;
}) {
  const viewportSize = {
    width: settings.width,
    height: settings.height,
  };
  const fullPagePlacement = getFullPagePlacement(image, viewportSize);
  const travelProgress = getGuidedPageTravelProgress(
    timelineFrame.segment,
    timelineFrame.progress,
  );
  const firstShot = cameraShots[0];
  const lastShot = cameraShots[cameraShots.length - 1];
  const firstBasePlacement = getPreviewShotPlacement(
    firstShot,
    image,
    settings.width,
    settings.height,
  );
  const firstStartPlacement =
    getShotPlaybackStartPlacement(
      firstBasePlacement,
      image,
      viewportSize,
      firstShot,
      focusRegions,
    ) ?? firstBasePlacement;
  const lastBasePlacement = getPreviewShotPlacement(
    lastShot,
    image,
    settings.width,
    settings.height,
  );
  const lastFinalPlacement =
    getFinalMotionAnchorPlacement(
      lastBasePlacement,
      image,
      viewportSize,
      lastShot,
      focusRegions,
    ) ?? lastBasePlacement;
  const targetPlacement =
    timelineFrame.segment === "pageEnter"
      ? firstStartPlacement
      : fullPagePlacement;
  const outgoingPlacement =
    timelineFrame.segment === "pageExit"
      ? lastFinalPlacement
      : fullPagePlacement;
  const placement = interpolateShotPlacement(
    outgoingPlacement,
    targetPlacement,
    travelProgress,
  );

  context.clearRect(0, 0, settings.width, settings.height);
  context.fillStyle = "#111827";
  context.fillRect(0, 0, settings.width, settings.height);
  drawShotWindow(context, sourceImage, placement, null);
}

function drawShotWindow(
  context: CanvasRenderingContext2D,
  sourceImage: HTMLImageElement,
  placement: PreviewShotPlacement,
  activeFocusEffect: ActiveFocusEffect | null,
  travelVeilIntensity = 0,
  cameraShakeOffset: CameraShakeOffset = { x: 0, y: 0 },
) {
  context.save();
  context.beginPath();
  context.rect(
    placement.shotWindowX,
    placement.shotWindowY,
    placement.shotWindowWidth,
    placement.shotWindowHeight,
  );
  context.clip();

  if (activeFocusEffect?.effectType === "zoom") {
    const zoomFocus = getZoomFocusStyle(activeFocusEffect, placement);
    const originX = clamp(
      placement.shotWindowX + zoomFocus.originX,
      placement.shotWindowX,
      placement.shotWindowX + placement.shotWindowWidth,
    );
    const originY = clamp(
      placement.shotWindowY + zoomFocus.originY,
      placement.shotWindowY,
      placement.shotWindowY + placement.shotWindowHeight,
    );

    context.translate(originX, originY);
    context.scale(zoomFocus.scale, zoomFocus.scale);
    context.translate(-originX, -originY);
  }

  const previousFilter = context.filter;
  if (travelVeilIntensity > 0) {
    context.filter = `blur(${(travelVeilIntensity * TRAVEL_VEIL_BLUR_PEAK_PX).toFixed(3)}px)`;
  }

  context.drawImage(
    sourceImage,
    placement.shotWindowX + placement.imageX + cameraShakeOffset.x,
    placement.shotWindowY + placement.imageY + cameraShakeOffset.y,
    placement.imageWidth,
    placement.imageHeight,
  );
  context.filter = previousFilter;
  context.restore();
}

function drawShotTravelVeil(
  context: CanvasRenderingContext2D,
  placement: PreviewShotPlacement,
  intensity: number,
) {
  const opacity = clamp(intensity, 0, 1) * TRAVEL_VEIL_DIM_PEAK_OPACITY;

  if (opacity <= 0) {
    return;
  }

  context.save();
  context.beginPath();
  context.rect(
    placement.shotWindowX,
    placement.shotWindowY,
    placement.shotWindowWidth,
    placement.shotWindowHeight,
  );
  context.clip();
  context.fillStyle = `rgba(17, 24, 39, ${opacity})`;
  context.fillRect(
    placement.shotWindowX,
    placement.shotWindowY,
    placement.shotWindowWidth,
    placement.shotWindowHeight,
  );
  context.restore();
}

function drawImpactPulse(
  context: CanvasRenderingContext2D,
  settings: ExportVideoSettings,
  opacity: number,
) {
  context.save();
  context.fillStyle = `rgba(255, 255, 255, ${clamp(opacity, 0, 1)})`;
  context.fillRect(0, 0, settings.width, settings.height);
  context.restore();
}

function getCameraShakeOffset(
  isEnabled: boolean,
  previewPhase: PreviewPhase,
  previewClockMs: number,
  placement: PreviewShotPlacement,
): CameraShakeOffset {
  if (!isEnabled) {
    return { x: 0, y: 0 };
  }

  const phaseIntensity = getCameraShakePhaseIntensity(previewPhase);

  if (phaseIntensity <= 0) {
    return { x: 0, y: 0 };
  }

  const timeSeconds = previewClockMs / 1000;
  const rawOffset = {
    x:
      Math.sin(timeSeconds * 57.2) * 0.65 +
      Math.sin(timeSeconds * 91.7 + 1.8) * 0.35,
    y:
      Math.sin(timeSeconds * 63.9 + 0.9) * 0.6 +
      Math.sin(timeSeconds * 104.3 + 2.4) * 0.4,
  };
  const amplitude = CAMERA_SHAKE_PREVIEW_MAX_OFFSET_PX * phaseIntensity;

  return clampCameraShakeOffset(
    {
      x: rawOffset.x * amplitude,
      y: rawOffset.y * amplitude,
    },
    placement,
  );
}

function getImpactPulsePreviewOpacity(
  isEnabled: boolean,
  previewPhase: PreviewPhase,
  previewClockMs: number,
) {
  if (
    !isEnabled ||
    previewPhase === "travel" ||
    previewPhase === "exit" ||
    previewClockMs > IMPACT_PULSE_PREVIEW_DURATION_MS
  ) {
    return 0;
  }

  const progress = clamp(previewClockMs / IMPACT_PULSE_PREVIEW_DURATION_MS, 0, 1);
  const attackProgress = clamp(progress / 0.18, 0, 1);
  const decayProgress = clamp((progress - 0.18) / 0.82, 0, 1);
  const attack = easeInOutSine(attackProgress);
  const decay = 1 - easeInOutSine(decayProgress);

  return IMPACT_PULSE_PREVIEW_PEAK_OPACITY * Math.min(attack, decay);
}

function getAttentionImpactPulseOpacity(
  cueMode: ShotAttentionEffectCues["impactPulse"] | undefined,
  isPlayingShot: boolean,
  previewPhase: PreviewPhase,
  cueClock: AttentionEffectCueClock,
) {
  if (!cueMode || !isPlayingShot || previewPhase !== "focus" || !cueClock.isActive) {
    return 0;
  }

  const cueClockMs =
    cueMode === "repeat"
      ? cueClock.elapsedMs % IMPACT_PULSE_REPEAT_INTERVAL_MS
      : cueClock.elapsedMs;

  return getImpactPulsePreviewOpacity(true, previewPhase, cueClockMs);
}

function shouldApplyAttentionEffectCue(
  cueMode: ShotAttentionEffectCues["shake"] | undefined,
  cueClock: AttentionEffectCueClock,
  onceDurationMs: number,
) {
  if (!cueMode || !cueClock.isActive) {
    return false;
  }

  if (cueMode === "repeat") {
    return true;
  }

  return cueClock.elapsedMs <= onceDurationMs;
}

function getAttentionEffectCueClock(
  activeMotionAnchor: ActiveAttentionAnchor | null,
  activeCueElapsedMs: number,
  activeCueDurationMs: number,
  onceDurationMs: number,
  cueMode: ShotEffectCueMode | undefined,
): AttentionEffectCueClock {
  if (!activeMotionAnchor || !cueMode || activeCueDurationMs <= 0) {
    return { isActive: false, elapsedMs: 0 };
  }

  const cueTiming = activeMotionAnchor?.anchor.effectCueTiming ?? "arrival";
  const arrivalProgress =
    activeMotionAnchor.anchor.motionRole === "pushOut"
      ? PUSH_OUT_EFFECT_CUE_ARRIVAL_PROGRESS[cueTiming]
      : ATTENTION_EFFECT_CUE_ARRIVAL_PROGRESS[cueTiming];
  const arrivalMs = activeCueDurationMs * arrivalProgress;

  if (cueTiming === "early") {
    if (activeCueElapsedMs > arrivalMs) {
      return { isActive: false, elapsedMs: 0 };
    }

    const startsAtMs =
      cueMode === "repeat" ? 0 : Math.max(0, arrivalMs - onceDurationMs);

    if (activeCueElapsedMs < startsAtMs) {
      return { isActive: false, elapsedMs: 0 };
    }

    return {
      isActive: true,
      elapsedMs: activeCueElapsedMs - startsAtMs,
    };
  }

  if (activeCueElapsedMs < arrivalMs) {
    return { isActive: false, elapsedMs: 0 };
  }

  return {
    isActive: true,
    elapsedMs: activeCueElapsedMs - arrivalMs,
  };
}

function getCameraShakePhaseIntensity(previewPhase: PreviewPhase) {
  if (previewPhase === "focus") {
    return 1;
  }

  if (previewPhase === "hold") {
    return 0.65;
  }

  return 0;
}

function clampCameraShakeOffset(
  offset: CameraShakeOffset,
  placement: PreviewShotPlacement,
): CameraShakeOffset {
  const minX = placement.shotWindowWidth - placement.imageWidth - placement.imageX;
  const maxX = -placement.imageX;
  const minY = placement.shotWindowHeight - placement.imageHeight - placement.imageY;
  const maxY = -placement.imageY;

  return {
    x: clamp(offset.x, Math.min(minX, maxX), Math.max(minX, maxX)),
    y: clamp(offset.y, Math.min(minY, maxY), Math.max(minY, maxY)),
  };
}

function applyCameraShakeToTrackAttentionField(
  overlay: TrackAttentionField | null,
  offset: CameraShakeOffset,
): TrackAttentionField | null {
  if (!overlay || (offset.x === 0 && offset.y === 0)) {
    return overlay;
  }

  return {
    ...overlay,
    center: {
      x: overlay.center.x + offset.x,
      y: overlay.center.y + offset.y,
    },
  };
}

function drawTrackAttentionField(
  context: CanvasRenderingContext2D,
  overlay: TrackAttentionField,
) {
  const centerDimOpacity = 1 - overlay.spotStrength;
  const shoulderDimOpacity = Math.min(1, centerDimOpacity + 0.33);
  const gradient = context.createRadialGradient(
    overlay.center.x,
    overlay.center.y,
    0,
    overlay.center.x,
    overlay.center.y,
    overlay.radius,
  );

  gradient.addColorStop(
    0,
    `rgba(17, 24, 39, ${0.5 * centerDimOpacity * overlay.dimOpacity})`,
  );
  gradient.addColorStop(
    0.46,
    `rgba(17, 24, 39, ${0.5 * shoulderDimOpacity * overlay.dimOpacity})`,
  );
  gradient.addColorStop(1, `rgba(17, 24, 39, ${0.5 * overlay.dimOpacity})`);

  context.save();
  context.fillStyle = gradient;
  context.fillRect(0, 0, overlay.viewportWidth, overlay.viewportHeight);
  context.restore();
}

function drawFocusEffect(
  context: CanvasRenderingContext2D,
  sourceImage: HTMLImageElement,
  image: UploadedImage,
  placement: ReturnType<typeof getPreviewShotPlacement>,
  activeFocusEffect: ActiveFocusEffect,
  settings: ExportVideoSettings,
  focusTreatmentStyle: FocusTreatmentStyle,
) {
  const focusPhaseDim = getFocusPhaseDim(activeFocusEffect, placement);

  drawDimOutsideRect(
    context,
    placement,
    focusPhaseDim.aperture,
    getFocusBackgroundDimOpacity(
      activeFocusEffect.effectType,
      focusTreatmentStyle,
    ),
  );

  if (activeFocusEffect.effectType === "lift") {
    drawLiftEffect(
      context,
      sourceImage,
      image,
      placement,
      activeFocusEffect,
      settings,
    );
    return;
  }

  const animation = getFocusEffectAnimationStyle(
    activeFocusEffect.progress,
    !activeFocusEffect.nextRegion,
  );
  const aperture =
    activeFocusEffect.effectType === "zoom"
      ? getZoomAperture(activeFocusEffect, placement)
      : getSpotlightAperture(activeFocusEffect, placement);

  context.save();
  context.globalAlpha = animation.opacity;
  context.strokeStyle =
    activeFocusEffect.effectType === "zoom" ? "rgb(186 230 253)" : "#ffffff";
  context.lineWidth = 3;
  context.shadowColor =
    activeFocusEffect.effectType === "zoom"
      ? "rgb(186 230 253 / 0.65)"
      : "rgb(255 255 255 / 0.55)";
  context.shadowBlur = 18;
  context.translate(0, animation.translateY);
  context.strokeRect(aperture.left, aperture.top, aperture.width, aperture.height);
  context.restore();
}

function drawLiftEffect(
  context: CanvasRenderingContext2D,
  sourceImage: HTMLImageElement,
  image: UploadedImage,
  placement: ReturnType<typeof getPreviewShotPlacement>,
  activeFocusEffect: ActiveFocusEffect,
  settings: ExportVideoSettings,
) {
  if (
    activeFocusEffect.previousRegion &&
    activeFocusEffect.previousEffectType === "lift" &&
    activeFocusEffect.transitionProgress < 1
  ) {
    drawLiftedFocusRegion(
      context,
      sourceImage,
      placement,
      activeFocusEffect.previousRegion,
      settings,
      getPreviousLiftProgress(activeFocusEffect.transitionProgress),
    );
  }

  drawLiftedFocusRegion(
    context,
    sourceImage,
    placement,
    activeFocusEffect.region,
    settings,
    activeFocusEffect.progress,
    activeFocusEffect.nextEffectType !== "lift",
  );

  void image;
}

function drawLiftedFocusRegion(
  context: CanvasRenderingContext2D,
  sourceImage: HTMLImageElement,
  placement: ReturnType<typeof getPreviewShotPlacement>,
  focusRegion: FocusRegion,
  settings: ExportVideoSettings,
  progress: number,
  shouldFadeOut = true,
) {
  const projected = getProjectedFocusRegionStyle(focusRegion, placement);
  const projectedCenterX =
    placement.shotWindowX + projected.left + projected.width / 2;
  const projectedCenterY =
    placement.shotWindowY + projected.top + projected.height / 2;
  const targetScale = Math.max(
    placement.scale,
    Math.min(
      (settings.width * LIFT_MAX_WIDTH_RATIO) / focusRegion.width,
      (settings.height * LIFT_MAX_HEIGHT_RATIO) / focusRegion.height,
    ),
  );
  const targetWidth = focusRegion.width * targetScale;
  const targetHeight = focusRegion.height * targetScale;
  const targetCenterX = clamp(
    projectedCenterX,
    targetWidth / 2 + LIFT_PADDING,
    settings.width - targetWidth / 2 - LIFT_PADDING,
  );
  const targetCenterY = clamp(
    projectedCenterY,
    targetHeight / 2 + LIFT_PADDING,
    settings.height - targetHeight / 2 - LIFT_PADDING,
  );
  const animation = getLiftAnimationStyle(progress, shouldFadeOut);
  const width = interpolate(projected.width, targetWidth, animation.liftProgress);
  const height = interpolate(projected.height, targetHeight, animation.liftProgress);
  const centerX = interpolate(
    projectedCenterX,
    targetCenterX,
    animation.liftProgress,
  );
  const centerY = interpolate(
    projectedCenterY,
    targetCenterY,
    animation.liftProgress,
  );

  context.save();
  context.translate(0, animation.translateY);
  context.globalAlpha = animation.opacity;
  context.fillStyle = "#111827";
  context.shadowColor = "rgb(0 0 0 / 0.42)";
  context.shadowBlur = 32;
  context.fillRect(centerX - width / 2, centerY - height / 2, width, height);
  context.beginPath();
  context.rect(centerX - width / 2, centerY - height / 2, width, height);
  context.clip();
  context.drawImage(
    sourceImage,
    focusRegion.x,
    focusRegion.y,
    focusRegion.width,
    focusRegion.height,
    centerX - width / 2,
    centerY - height / 2,
    width,
    height,
  );
  context.restore();

  context.save();
  context.translate(0, animation.translateY);
  context.globalAlpha = animation.opacity;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 3;
  context.strokeRect(centerX - width / 2, centerY - height / 2, width, height);
  context.restore();
}

function getExportFramePlacement({
  image,
  cameraShots,
  focusRegions,
  settings,
  timelineFrame,
  currentShot,
  phase,
  phaseRatios,
  basePlacement,
  viewportSize,
  activeMotionAnchor,
}: {
  image: UploadedImage;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  settings: ExportVideoSettings;
  timelineFrame: Extract<ExportTimelineFrame, { segment: "shot" }>;
  currentShot: CameraShot;
  phase: PreviewPhase;
  phaseRatios: ShotPhaseRatios;
  basePlacement: PreviewShotPlacement;
  viewportSize: ViewportSize;
  activeMotionAnchor: ActiveAttentionAnchor | null;
}): PreviewShotPlacement {
  if (phase === "travel" && timelineFrame.shotIndex > 0) {
    const previousShot = cameraShots[timelineFrame.shotIndex - 1];
    const previousBasePlacement = getPreviewShotPlacement(
      previousShot,
      image,
      settings.width,
      settings.height,
    );
    const outgoingPlacement =
      getFinalMotionAnchorPlacement(
        previousBasePlacement,
        image,
        viewportSize,
        previousShot,
        focusRegions,
      ) ?? previousBasePlacement;
    const currentStartPlacement =
      getShotPlaybackStartPlacement(
        basePlacement,
        image,
        viewportSize,
        currentShot,
        focusRegions,
      ) ?? basePlacement;
    const hasCustomTravelEndpoint =
      !arePlacementsNearlyEqual(outgoingPlacement, previousBasePlacement) ||
      !arePlacementsNearlyEqual(currentStartPlacement, basePlacement);
    const travelProgress = getCameraTravelProgress(
      timelineFrame.shotProgress,
      phaseRatios.travelRatio,
    );

    if (hasCustomTravelEndpoint) {
      return interpolateShotPlacement(
        outgoingPlacement,
        currentStartPlacement,
        travelProgress,
      );
    }

    return getPreviewShotPlacement(
      interpolateCameraShotGeometry(previousShot, currentShot, travelProgress),
      image,
      settings.width,
      settings.height,
    );
  }

  if (phase === "focus" && activeMotionAnchor) {
    return getMotionAnchorPlacement(
      basePlacement,
      image,
      viewportSize,
      currentShot,
      activeMotionAnchor,
      shouldStartActiveAnchorAtFirstFocus(currentShot, activeMotionAnchor),
    );
  }

  if (phase === "exit") {
    return (
      getFinalMotionAnchorPlacement(
        basePlacement,
        image,
        viewportSize,
        currentShot,
        focusRegions,
      ) ?? basePlacement
    );
  }

  return (
    getShotPlaybackStartPlacement(
      basePlacement,
      image,
      viewportSize,
      currentShot,
      focusRegions,
    ) ?? basePlacement
  );
}

function drawDimOutsideRect(
  context: CanvasRenderingContext2D,
  placement: PreviewShotPlacement,
  aperture: { left: number; top: number; width: number; height: number },
  opacity: number,
) {
  const shotLeft = placement.shotWindowX;
  const shotTop = placement.shotWindowY;
  const shotRight = placement.shotWindowX + placement.shotWindowWidth;
  const shotBottom = placement.shotWindowY + placement.shotWindowHeight;
  const left = clamp(aperture.left, shotLeft, shotRight);
  const top = clamp(aperture.top, shotTop, shotBottom);
  const right = clamp(aperture.left + aperture.width, shotLeft, shotRight);
  const bottom = clamp(aperture.top + aperture.height, shotTop, shotBottom);

  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = "#000000";
  context.fillRect(shotLeft, shotTop, placement.shotWindowWidth, top - shotTop);
  context.fillRect(shotLeft, bottom, placement.shotWindowWidth, shotBottom - bottom);
  context.fillRect(shotLeft, top, left - shotLeft, bottom - top);
  context.fillRect(right, top, shotRight - right, bottom - top);
  context.restore();
}

function getTimelineFrame(
  cameraShots: CameraShot[],
  elapsedMs: number,
  guidedPageOptions: GuidedPageOptions | undefined,
): ExportTimelineFrame {
  let remainingMs = elapsedMs;

  if (guidedPageOptions?.showPageEnter) {
    if (remainingMs <= GUIDED_PAGE_SEGMENT_DURATION_MS) {
      return {
        segment: "pageEnter",
        progress: clamp(remainingMs / GUIDED_PAGE_SEGMENT_DURATION_MS, 0, 1),
      };
    }

    remainingMs -= GUIDED_PAGE_SEGMENT_DURATION_MS;
  }

  for (let index = 0; index < cameraShots.length; index += 1) {
    const durationMs = Math.max(1, cameraShots[index].durationMs);

    if (
      remainingMs <= durationMs ||
      (index === cameraShots.length - 1 && !guidedPageOptions?.showPageExit)
    ) {
      return {
        segment: "shot",
        shotIndex: index,
        shotProgress: clamp(remainingMs / durationMs, 0, 1),
      };
    }

    remainingMs -= durationMs;
  }

  if (guidedPageOptions?.showPageExit) {
    return {
      segment: "pageExit",
      progress: clamp(remainingMs / GUIDED_PAGE_SEGMENT_DURATION_MS, 0, 1),
    };
  }

  return {
    segment: "shot",
    shotIndex: 0,
    shotProgress: 0,
  };
}

function getTotalExportDurationMs(
  cameraShots: CameraShot[],
  guidedPageOptions: GuidedPageOptions | undefined,
) {
  const shotDurationMs = cameraShots.reduce(
    (total, shot) => total + Math.max(1, shot.durationMs),
    0,
  );
  const pageEnterDurationMs = guidedPageOptions?.showPageEnter
    ? GUIDED_PAGE_SEGMENT_DURATION_MS
    : 0;
  const pageExitDurationMs = guidedPageOptions?.showPageExit
    ? GUIDED_PAGE_SEGMENT_DURATION_MS
    : 0;

  return shotDurationMs + pageEnterDurationMs + pageExitDurationMs;
}

function getFullPagePlacement(image: UploadedImage, viewportSize: ViewportSize) {
  return getPreviewShotPlacement(
    {
      id: "full-page",
      label: "Full page",
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
      durationMs: GUIDED_PAGE_SEGMENT_DURATION_MS,
    },
    image,
    viewportSize.width,
    viewportSize.height,
  );
}

function getShotPhaseRatios(
  shot: CameraShot,
  isFirstShot: boolean,
): ShotPhaseRatios {
  const durationMs = Math.max(1, shot.durationMs ?? 2500);
  const minimumTravelRatio = SHOT_TRAVEL_MIN_DURATION_MS / durationMs;
  const travelRatio = isFirstShot
    ? 0
    : clamp(
        Math.max(TRAVEL_PHASE_RATIO, minimumTravelRatio),
        0,
        SHOT_TRAVEL_MAX_RATIO,
      );
  const availableRatio = Math.max(0, 1 - travelRatio - EXIT_PHASE_RATIO);
  const holdRatio = clamp(
    shot.sceneHoldRatio ?? HOLD_PHASE_RATIO,
    0,
    availableRatio,
  );
  const defaultFocusRatio =
    shot.focusAttentionRatio ??
    (isFirstShot ? FOCUS_PHASE_RATIO + TRAVEL_PHASE_RATIO : FOCUS_PHASE_RATIO);
  let focusRatio = clamp(defaultFocusRatio, 0, availableRatio - holdRatio);

  if (isFirstShot) {
    focusRatio += Math.max(0, availableRatio - holdRatio - focusRatio);
  }

  return {
    travelRatio,
    holdRatio,
    focusRatio,
  };
}

function getPreviewPhase(
  progress: number,
  phaseRatios: ShotPhaseRatios,
): PreviewPhase {
  const holdEnd = phaseRatios.travelRatio + phaseRatios.holdRatio;
  const focusEnd = holdEnd + phaseRatios.focusRatio;
  const exitStart = Math.min(1 - EXIT_PHASE_RATIO, focusEnd);

  if (phaseRatios.travelRatio > 0 && progress < phaseRatios.travelRatio) {
    return "travel";
  }

  if (progress < holdEnd) {
    return "hold";
  }

  if (progress < exitStart) {
    return "focus";
  }

  return "exit";
}

function getFocusPhaseProgress(
  progress: number,
  phaseRatios: ShotPhaseRatios,
) {
  const holdEnd = phaseRatios.travelRatio + phaseRatios.holdRatio;

  if (phaseRatios.focusRatio <= 0) {
    return 1;
  }

  return clamp((progress - holdEnd) / phaseRatios.focusRatio, 0, 1);
}

function getCameraTravelProgress(progress: number, travelRatio: number) {
  return easeInOutSine(getRawTravelProgress(progress, travelRatio));
}

function getRawTravelProgress(progress: number, travelRatio: number) {
  if (travelRatio <= 0) {
    return 1;
  }

  return clamp(progress / travelRatio, 0, 1);
}

function getShotTravelVeilIntensity(rawTravelProgress: number) {
  return Math.sin(clamp(rawTravelProgress, 0, 1) * Math.PI);
}

function getGuidedPageTravelProgress(
  segment: "pageEnter" | "pageExit",
  progress: number,
) {
  const holdRatio = clamp(GUIDED_PAGE_HOLD_RATIO, 0, 0.9);
  const travelRatio = 1 - holdRatio;
  const rawTravelProgress =
    segment === "pageEnter"
      ? (progress - holdRatio) / travelRatio
      : progress / travelRatio;

  return smootherStep(clamp(rawTravelProgress, 0, 1));
}

function interpolateCameraShotGeometry(
  from: CameraShot,
  to: CameraShot,
  progress: number,
): CameraShot {
  const fromCenterX = from.x + from.width / 2;
  const fromCenterY = from.y + from.height / 2;
  const toCenterX = to.x + to.width / 2;
  const toCenterY = to.y + to.height / 2;
  const width = interpolate(from.width, to.width, progress);
  const height = interpolate(from.height, to.height, progress);
  const centerX = interpolate(fromCenterX, toCenterX, progress);
  const centerY = interpolate(fromCenterY, toCenterY, progress);

  return {
    ...to,
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  };
}

function getExplicitAttentionAnchorSequence(
  currentShot: CameraShot,
  focusRegions: FocusRegion[],
) {
  const attentionPath = currentShot.attentionPath;

  if (!attentionPath || attentionPath.length === 0) {
    return [];
  }

  const focusRegionById = new Map(
    focusRegions.map((focusRegion) => [focusRegion.id, focusRegion]),
  );

  return [...attentionPath]
    .sort((first, second) => first.order - second.order)
    .flatMap((pathItem) => {
      const focusRegion = focusRegionById.get(pathItem.focusRegionId);

      if (!focusRegion) {
        return [];
      }

      const anchor = getAttentionAnchor(
        pathItem.motionRole,
        pathItem.durationWeight,
        pathItem.effectCues,
        pathItem.effectCueTiming,
        focusRegion,
      );

      return anchor ? [anchor] : [];
    });
}

function getAttentionAnchor(
  motionRole: ShotAttentionMotionRole | undefined,
  durationWeight: number | undefined,
  effectCues: ShotAttentionEffectCues | undefined,
  effectCueTiming: ShotEffectCueTiming | undefined,
  focusRegion: FocusRegion,
): AttentionAnchor | null {
  const activeRole =
    motionRole === undefined
      ? getLegacyEffectFallbackMotionRole(focusRegion.effectType)
      : getActiveMotionRole(motionRole);

  if (!activeRole) {
    return null;
  }

  return {
    region: focusRegion,
    motionRole: activeRole,
    durationWeight: durationWeight ?? 1,
    effectCues,
    effectCueTiming,
  };
}

function getActiveMotionRole(
  motionRole: ShotAttentionMotionRole,
): ActiveShotAttentionMotionRole | null {
  if (
    motionRole === "track" ||
    motionRole === "pushIn" ||
    motionRole === "pushOut"
  ) {
    return motionRole;
  }

  if (motionRole === "reveal") {
    return "pushOut";
  }

  if (motionRole === "emphasis") {
    return "pushIn";
  }

  return null;
}

function getLegacyEffectFallbackMotionRole(
  effectType: FocusRegionEffectType | undefined,
): ActiveShotAttentionMotionRole | null {
  if (effectType === "zoom") {
    return "pushIn";
  }

  if (effectType === "spotlight" || effectType === "lift") {
    return "track";
  }

  return null;
}

function getActiveAttentionAnchor(
  anchors: AttentionAnchor[],
  focusProgress: number,
  startsAtFirstFocus = false,
): ActiveAttentionAnchor | null {
  if (anchors.length === 0) {
    return null;
  }

  const weights = anchors.map((_anchor, index) =>
    getAttentionAnchorDurationWeight(anchors, index, startsAtFirstFocus),
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  if (totalWeight <= 0) {
    return null;
  }

  const weightedProgress = clamp(focusProgress, 0, 1) * totalWeight;
  let elapsedWeight = 0;

  for (let index = 0; index < anchors.length; index += 1) {
    const segmentWeight = weights[index];
    if (segmentWeight <= 0) {
      continue;
    }

    const segmentStart = elapsedWeight;
    const segmentEnd = segmentStart + segmentWeight;

    if (weightedProgress <= segmentEnd || index === anchors.length - 1) {
      const segmentProgress = clamp(
        (weightedProgress - segmentStart) / segmentWeight,
        0,
        1,
      );

      return {
        anchor: anchors[index],
        previousAnchor: index > 0 ? anchors[index - 1] : null,
        nextAnchor: index < anchors.length - 1 ? anchors[index + 1] : null,
        progress: segmentProgress,
        transitionProgress: getAttentionTravelProgress(
          anchors[index].motionRole,
          segmentProgress,
        ),
        durationShare: segmentWeight / totalWeight,
      };
    }

    elapsedWeight = segmentEnd;
  }

  return null;
}

function getAttentionAnchorDurationWeight(
  anchors: AttentionAnchor[],
  index: number,
  startsAtFirstFocus: boolean,
) {
  const normalWeight = Math.max(0.1, anchors[index].durationWeight || 1);

  if (isFirstFocusTrackStart(anchors, index, startsAtFirstFocus)) {
    return 0;
  }

  if (isPassThroughTrackStart(anchors, index)) {
    return Math.min(normalWeight, TRACK_CHAIN_ENTRY_DURATION_WEIGHT);
  }

  return normalWeight;
}

function isPassThroughTrackStart(anchors: AttentionAnchor[], index: number) {
  const anchor = anchors[index];
  const previousAnchor = index > 0 ? anchors[index - 1] : null;
  const nextAnchor = index < anchors.length - 1 ? anchors[index + 1] : null;

  return (
    anchor.motionRole === "track" &&
    previousAnchor !== null &&
    previousAnchor.motionRole !== "track" &&
    nextAnchor?.motionRole === "track"
  );
}

function isFirstFocusTrackStart(
  anchors: AttentionAnchor[],
  index: number,
  startsAtFirstFocus: boolean,
) {
  const anchor = anchors[index];
  const nextAnchor = index < anchors.length - 1 ? anchors[index + 1] : null;

  return (
    startsAtFirstFocus &&
    index === 0 &&
    anchor.motionRole === "track" &&
    nextAnchor?.motionRole === "track"
  );
}

function getMotionAnchorPlacement(
  basePlacement: PreviewShotPlacement,
  image: UploadedImage,
  viewportSize: ViewportSize,
  currentShot: CameraShot,
  activeAnchor: ActiveAttentionAnchor,
  startsAtFirstFocus = false,
) {
  void basePlacement;

  if (activeAnchor.anchor.motionRole === "pushOut") {
    return getPushOutAnchorPlacement(
      image,
      viewportSize,
      currentShot,
      activeAnchor,
      startsAtFirstFocus,
    );
  }

  const fromWindow = startsAtFirstFocus
    ? getAnchorEntryWindow(currentShot, activeAnchor.anchor)
    : activeAnchor.previousAnchor
      ? getAnchorEndWindow(
          currentShot,
          activeAnchor.previousAnchor,
          activeAnchor.anchor,
        )
      : currentShot;
  const toWindow = getAnchorEndWindow(
    currentShot,
    activeAnchor.anchor,
    activeAnchor.nextAnchor,
  );

  if (areSourceWindowsNearlyEqual(fromWindow, toWindow)) {
    return getPlacementForSourceWindow(toWindow, image, viewportSize);
  }

  return getPlacementForSourceWindow(
    interpolateSourceWindow(fromWindow, toWindow, activeAnchor.transitionProgress),
    image,
    viewportSize,
  );
}

function getPushOutAnchorPlacement(
  image: UploadedImage,
  viewportSize: ViewportSize,
  currentShot: CameraShot,
  activeAnchor: ActiveAttentionAnchor,
  startsAtFirstFocus = false,
) {
  const previousWindow = startsAtFirstFocus
    ? getPushInWindow(currentShot, activeAnchor.anchor.region)
    : activeAnchor.previousAnchor
      ? getAnchorEndWindow(
          currentShot,
          activeAnchor.previousAnchor,
          activeAnchor.anchor,
        )
      : currentShot;
  const closeupWindow = getPushInWindow(currentShot, activeAnchor.anchor.region);
  const contextWindow = getPushOutWindow(currentShot, activeAnchor.nextAnchor);
  const closeupRatio = startsAtFirstFocus ? 0 : PUSH_OUT_CLOSEUP_RATIO;

  if (closeupRatio > 0 && activeAnchor.progress < closeupRatio) {
    const closeupProgress = getRoleTravelEase(
      "pushIn",
      clamp(activeAnchor.progress / closeupRatio, 0, 1),
    );

    if (areSourceWindowsNearlyEqual(previousWindow, closeupWindow)) {
      return getPlacementForSourceWindow(closeupWindow, image, viewportSize);
    }

    return getPlacementForSourceWindow(
      interpolateSourceWindow(previousWindow, closeupWindow, closeupProgress),
      image,
      viewportSize,
    );
  }

  const expansionProgress = getRoleTravelEase(
    "pushOut",
    clamp(
      (activeAnchor.progress - closeupRatio) / (1 - closeupRatio),
      0,
      1,
    ),
  );

  if (areSourceWindowsNearlyEqual(closeupWindow, contextWindow)) {
    return getPlacementForSourceWindow(contextWindow, image, viewportSize);
  }

  return getPlacementForSourceWindow(
    interpolateSourceWindow(closeupWindow, contextWindow, expansionProgress),
    image,
    viewportSize,
  );
}

function getFinalMotionAnchorPlacement(
  basePlacement: PreviewShotPlacement,
  image: UploadedImage,
  viewportSize: ViewportSize,
  currentShot: CameraShot,
  focusRegions: FocusRegion[],
): PreviewShotPlacement | null {
  const anchors = getExplicitAttentionAnchorSequence(currentShot, focusRegions);

  if (anchors.length === 0) {
    return null;
  }

  return getMotionAnchorPlacement(basePlacement, image, viewportSize, currentShot, {
    anchor: anchors[anchors.length - 1],
    previousAnchor: anchors.length > 1 ? anchors[anchors.length - 2] : null,
    nextAnchor: null,
    progress: 1,
    transitionProgress: 1,
    durationShare: 1,
  });
}

function getShotPlaybackStartPlacement(
  basePlacement: PreviewShotPlacement,
  image: UploadedImage,
  viewportSize: ViewportSize,
  currentShot: CameraShot,
  focusRegions: FocusRegion[],
): PreviewShotPlacement | null {
  if (currentShot.shotStartFraming !== "firstFocus") {
    return null;
  }

  const firstAnchor = getExplicitAttentionAnchorSequence(
    currentShot,
    focusRegions,
  )[0];

  if (
    !firstAnchor ||
    (firstAnchor.motionRole !== "track" && firstAnchor.motionRole !== "pushOut")
  ) {
    return null;
  }

  const startWindow = getAnchorEntryWindow(currentShot, firstAnchor);

  if (areSourceWindowsNearlyEqual(currentShot, startWindow)) {
    return basePlacement;
  }

  return getPlacementForSourceWindow(startWindow, image, viewportSize);
}

function shouldStartActiveAnchorAtFirstFocus(
  currentShot: CameraShot,
  activeAnchor: ActiveAttentionAnchor,
) {
  return (
    currentShot.shotStartFraming === "firstFocus" &&
    activeAnchor.previousAnchor === null &&
    (activeAnchor.anchor.motionRole === "track" ||
      activeAnchor.anchor.motionRole === "pushOut")
  );
}

function getFirstFocusTrackAttentionField(
  currentShot: CameraShot,
  anchors: AttentionAnchor[],
  placement: PreviewShotPlacement,
  phase: PreviewPhase,
) {
  const firstAnchor = anchors[0];
  const nextAnchor = anchors[1];

  if (
    currentShot.shotStartFraming !== "firstFocus" ||
    phase === "focus" ||
    phase === "exit" ||
    firstAnchor?.motionRole !== "track" ||
    nextAnchor?.motionRole !== "track"
  ) {
    return null;
  }

  return getTrackAttentionField(
    {
      anchor: firstAnchor,
      previousAnchor: null,
      nextAnchor,
      progress: 0,
      transitionProgress: 0,
      durationShare: 1,
    },
    placement,
  );
}

function getAnchorEndWindow(
  currentShot: CameraShot,
  anchor: AttentionAnchor,
  nextAnchor: AttentionAnchor | null,
) {
  if (anchor.motionRole === "pushIn") {
    return getPushInWindow(currentShot, anchor.region);
  }

  if (anchor.motionRole === "pushOut") {
    return getPushOutWindow(currentShot, nextAnchor);
  }

  return getTrackWindow(currentShot, anchor.region);
}

function getTrackWindow(currentShot: CameraShot, focusRegion: FocusRegion) {
  const padding = Math.max(
    Math.min(currentShot.width, currentShot.height) *
      TRACK_READABILITY_PADDING_RATIO,
    1,
  );
  const width = Math.max(
    currentShot.width * TRACK_WINDOW_WIDTH_RATIO,
    focusRegion.width + padding * 2,
  );
  const height = Math.max(
    currentShot.height * TRACK_WINDOW_HEIGHT_RATIO,
    focusRegion.height + padding * 2,
  );

  return clampSourceWindowToBounds(
    {
      x: focusRegion.x + focusRegion.width / 2 - width / 2,
      y: focusRegion.y + focusRegion.height / 2 - height / 2,
      width,
      height,
    },
    currentShot,
  );
}

function getPushInWindow(currentShot: CameraShot, focusRegion: FocusRegion) {
  return getExpandedFocusWindow(
    currentShot,
    focusRegion,
    PUSH_IN_CONTEXT_SCALE,
    0,
    0,
  );
}

function getPushOutWindow(
  currentShot: CameraShot,
  nextAnchor: AttentionAnchor | null,
) {
  if (!nextAnchor) {
    return currentShot;
  }

  return getAnchorEntryWindow(currentShot, nextAnchor);
}

function getAnchorEntryWindow(
  currentShot: CameraShot,
  anchor: AttentionAnchor,
) {
  if (anchor.motionRole === "pushOut" || anchor.motionRole === "pushIn") {
    return getPushInWindow(currentShot, anchor.region);
  }

  return getTrackWindow(currentShot, anchor.region);
}

function getExpandedFocusWindow(
  currentShot: CameraShot,
  focusRegion: FocusRegion,
  scale: number,
  minimumPaddingX: number,
  minimumPaddingY: number,
) {
  return clampSourceWindowToBounds(
    expandSourceWindow(focusRegion, scale, minimumPaddingX, minimumPaddingY),
    currentShot,
  );
}

function expandSourceWindow(
  sourceWindow: SourceWindow,
  scale: number,
  minimumPaddingX: number,
  minimumPaddingY: number,
) {
  const paddingX = Math.max(
    sourceWindow.width * (scale - 1) * 0.5,
    minimumPaddingX,
  );
  const paddingY = Math.max(
    sourceWindow.height * (scale - 1) * 0.5,
    minimumPaddingY,
  );

  return {
    x: sourceWindow.x - paddingX,
    y: sourceWindow.y - paddingY,
    width: sourceWindow.width + paddingX * 2,
    height: sourceWindow.height + paddingY * 2,
  };
}

function clampSourceWindowToBounds(
  sourceWindow: SourceWindow,
  bounds: SourceWindow,
) {
  const width = Math.min(Math.max(1, sourceWindow.width), bounds.width);
  const height = Math.min(Math.max(1, sourceWindow.height), bounds.height);
  const centerX = sourceWindow.x + sourceWindow.width / 2;
  const centerY = sourceWindow.y + sourceWindow.height / 2;
  const minX = bounds.x;
  const minY = bounds.y;
  const maxX = bounds.x + bounds.width - width;
  const maxY = bounds.y + bounds.height - height;

  return {
    x: clamp(centerX - width / 2, minX, maxX),
    y: clamp(centerY - height / 2, minY, maxY),
    width,
    height,
  };
}

function interpolateSourceWindow(
  from: SourceWindow,
  to: SourceWindow,
  progress: number,
) {
  return {
    x: interpolate(from.x, to.x, progress),
    y: interpolate(from.y, to.y, progress),
    width: interpolate(from.width, to.width, progress),
    height: interpolate(from.height, to.height, progress),
  };
}

function areSourceWindowsNearlyEqual(first: SourceWindow, second: SourceWindow) {
  return (
    Math.abs(first.x - second.x) < 1 &&
    Math.abs(first.y - second.y) < 1 &&
    Math.abs(first.width - second.width) < 1 &&
    Math.abs(first.height - second.height) < 1
  );
}

function getPlacementForSourceWindow(
  sourceWindow: SourceWindow,
  image: UploadedImage,
  viewportSize: ViewportSize,
) {
  return getPreviewShotPlacement(
    {
      id: "export-motion-target",
      label: "Export motion target",
      durationMs: 1,
      x: sourceWindow.x,
      y: sourceWindow.y,
      width: sourceWindow.width,
      height: sourceWindow.height,
    },
    image,
    viewportSize.width,
    viewportSize.height,
  );
}

function interpolateShotPlacement(
  from: PreviewShotPlacement,
  to: PreviewShotPlacement,
  progress: number,
) {
  return {
    scale: interpolate(from.scale, to.scale, progress),
    shotWindowWidth: interpolate(
      from.shotWindowWidth,
      to.shotWindowWidth,
      progress,
    ),
    shotWindowHeight: interpolate(
      from.shotWindowHeight,
      to.shotWindowHeight,
      progress,
    ),
    shotWindowX: interpolate(from.shotWindowX, to.shotWindowX, progress),
    shotWindowY: interpolate(from.shotWindowY, to.shotWindowY, progress),
    imageWidth: interpolate(from.imageWidth, to.imageWidth, progress),
    imageHeight: interpolate(from.imageHeight, to.imageHeight, progress),
    imageX: interpolate(from.imageX, to.imageX, progress),
    imageY: interpolate(from.imageY, to.imageY, progress),
  };
}

function arePlacementsNearlyEqual(
  first: PreviewShotPlacement,
  second: PreviewShotPlacement,
) {
  return (
    Math.abs(first.scale - second.scale) < 0.001 &&
    Math.abs(first.shotWindowWidth - second.shotWindowWidth) < 1 &&
    Math.abs(first.shotWindowHeight - second.shotWindowHeight) < 1 &&
    Math.abs(first.shotWindowX - second.shotWindowX) < 1 &&
    Math.abs(first.shotWindowY - second.shotWindowY) < 1 &&
    Math.abs(first.imageWidth - second.imageWidth) < 1 &&
    Math.abs(first.imageHeight - second.imageHeight) < 1 &&
    Math.abs(first.imageX - second.imageX) < 1 &&
    Math.abs(first.imageY - second.imageY) < 1
  );
}

function getTrackAttentionField(
  activeAnchor: ActiveAttentionAnchor,
  motionPlacement: PreviewShotPlacement,
): TrackAttentionField | null {
  if (
    TRACK_ATTENTION_OVERLAY_MODE === "none" ||
    activeAnchor.anchor.motionRole !== "track" ||
    (activeAnchor.previousAnchor?.motionRole !== "track" &&
      activeAnchor.nextAnchor?.motionRole !== "track")
  ) {
    return null;
  }

  const currentRegion = getProjectedSourceWindow(
    activeAnchor.anchor.region,
    motionPlacement,
  );
  const viewportWidth =
    motionPlacement.shotWindowX * 2 + motionPlacement.shotWindowWidth;
  const viewportHeight =
    motionPlacement.shotWindowY * 2 + motionPlacement.shotWindowHeight;
  const currentCenter = getProjectedWindowCenter(currentRegion);
  const fromRegion = getProjectedSourceWindow(
    activeAnchor.previousAnchor?.motionRole === "track"
      ? activeAnchor.previousAnchor.region
      : activeAnchor.anchor.region,
    motionPlacement,
  );
  const fromCenter = getProjectedWindowCenter(fromRegion);
  const spotCenter = {
    x: interpolate(fromCenter.x, currentCenter.x, activeAnchor.transitionProgress),
    y: interpolate(fromCenter.y, currentCenter.y, activeAnchor.transitionProgress),
  };
  const fromRadius = getTrackFollowSpotRegionRadius(
    fromRegion,
    viewportWidth,
    viewportHeight,
  );
  const currentRadius = getTrackFollowSpotRegionRadius(
    currentRegion,
    viewportWidth,
    viewportHeight,
  );

  return {
    center: spotCenter,
    radius: interpolate(
      fromRadius,
      currentRadius,
      activeAnchor.transitionProgress,
    ),
    dimOpacity: TRACK_ATTENTION_DIM_OPACITY,
    spotStrength: TRACK_FOLLOW_SPOT_CLEAR_STRENGTH,
    viewportWidth,
    viewportHeight,
  };
}

function getProjectedSourceWindow(
  sourceWindow: SourceWindow,
  shotPlacement: PreviewShotPlacement,
) {
  return {
    left:
      shotPlacement.shotWindowX +
      shotPlacement.imageX +
      sourceWindow.x * shotPlacement.scale,
    top:
      shotPlacement.shotWindowY +
      shotPlacement.imageY +
      sourceWindow.y * shotPlacement.scale,
    width: sourceWindow.width * shotPlacement.scale,
    height: sourceWindow.height * shotPlacement.scale,
  };
}

function getProjectedWindowCenter(window: ProjectedSourceWindow): Point {
  return {
    x: window.left + window.width / 2,
    y: window.top + window.height / 2,
  };
}

function getTrackFollowSpotRegionRadius(
  region: ProjectedSourceWindow,
  viewportWidth: number,
  viewportHeight: number,
) {
  const viewportMinorAxis = Math.min(viewportWidth, viewportHeight);
  const regionMinorAxis = Math.min(region.width, region.height);
  const halfDiagonal = Math.hypot(region.width, region.height) / 2;
  const padding = clamp(regionMinorAxis * 0.12, 6, 24);
  const minimumRadius = clamp(viewportMinorAxis * 0.035, 16, 32);
  const maximumRadius = viewportMinorAxis * 0.45;

  return clamp(halfDiagonal + padding, minimumRadius, maximumRadius);
}

function getActiveFocusEffect(
  focusRegions: FocusRegion[],
  focusProgress: number,
  focusTreatmentStyle: FocusTreatmentStyle,
): ActiveFocusEffect | null {
  if (focusRegions.length === 0) {
    return null;
  }

  const regionProgress = clamp(focusProgress, 0, 0.999999) * focusRegions.length;
  const regionIndex = Math.min(
    focusRegions.length - 1,
    Math.floor(regionProgress),
  );
  const region = focusRegions[regionIndex];
  const previousRegion =
    regionIndex > 0 ? focusRegions[regionIndex - 1] : null;
  const nextRegion =
    regionIndex < focusRegions.length - 1 ? focusRegions[regionIndex + 1] : null;
  const progressInRegion = regionProgress - regionIndex;

  return {
    region,
    effectType: getActiveFocusRegionEffectType(region),
    previousRegion,
    previousEffectType: previousRegion
      ? getActiveFocusRegionEffectType(previousRegion)
      : null,
    nextRegion,
    nextEffectType: nextRegion ? getActiveFocusRegionEffectType(nextRegion) : null,
    progress: progressInRegion,
    transitionProgress: previousRegion
      ? getSliceTransitionProgress(progressInRegion, focusTreatmentStyle)
      : 1,
  };
}

function getEligibleFocusRegions(
  currentShot: CameraShot,
  focusRegions: FocusRegion[],
) {
  return focusRegions
    .map((focusRegion, index) => ({ focusRegion, index }))
    .filter(
      ({ focusRegion }) =>
        getFocusRegionEffectType(focusRegion) !== "none" &&
        getFocusRegionInclusionRatio(currentShot, focusRegion) >=
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

function getFocusRegionEffectType(
  focusRegion: FocusRegion,
): FocusRegionEffectType {
  return focusRegion.effectType ?? "lift";
}

function getActiveFocusRegionEffectType(
  focusRegion: FocusRegion,
): Exclude<FocusRegionEffectType, "none"> {
  const effectType = getFocusRegionEffectType(focusRegion);

  return effectType === "none" ? "lift" : effectType;
}

function getProjectedFocusRegionStyle(
  focusRegion: FocusRegion,
  placement: ReturnType<typeof getPreviewShotPlacement>,
) {
  return {
    left: placement.imageX + focusRegion.x * placement.scale,
    top: placement.imageY + focusRegion.y * placement.scale,
    width: focusRegion.width * placement.scale,
    height: focusRegion.height * placement.scale,
  };
}

function getTransitionedFocusRegionStyle(
  focusEffect: ActiveFocusEffect,
  placement: ReturnType<typeof getPreviewShotPlacement>,
) {
  const currentStyle = getProjectedFocusRegionStyle(focusEffect.region, placement);

  if (!focusEffect.previousRegion || focusEffect.transitionProgress >= 1) {
    return currentStyle;
  }

  const previousStyle = getProjectedFocusRegionStyle(
    focusEffect.previousRegion,
    placement,
  );
  const progress = easeInOut(focusEffect.transitionProgress);

  return {
    left: interpolate(previousStyle.left, currentStyle.left, progress),
    top: interpolate(previousStyle.top, currentStyle.top, progress),
    width: interpolate(previousStyle.width, currentStyle.width, progress),
    height: interpolate(previousStyle.height, currentStyle.height, progress),
  };
}

function getZoomFocusStyle(
  focusEffect: ActiveFocusEffect,
  placement: ReturnType<typeof getPreviewShotPlacement>,
) {
  const projectedFocus = getTransitionedFocusRegionStyle(focusEffect, placement);
  const animation = getFocusEffectAnimationStyle(
    focusEffect.progress,
    !focusEffect.nextRegion,
  );
  const originX = clamp(
    projectedFocus.left + projectedFocus.width / 2,
    0,
    placement.shotWindowWidth,
  );
  const originY = clamp(
    projectedFocus.top + projectedFocus.height / 2,
    0,
    placement.shotWindowHeight,
  );

  return {
    originX,
    originY,
    scale: interpolate(1, ZOOM_MAX_SCALE, animation.effectProgress),
    focusLeft: interpolate(
      projectedFocus.left,
      originX + (projectedFocus.left - originX) * ZOOM_MAX_SCALE,
      animation.effectProgress,
    ),
    focusTop: interpolate(
      projectedFocus.top,
      originY + (projectedFocus.top - originY) * ZOOM_MAX_SCALE,
      animation.effectProgress,
    ),
    focusWidth: interpolate(
      projectedFocus.width,
      projectedFocus.width * ZOOM_MAX_SCALE,
      animation.effectProgress,
    ),
    focusHeight: interpolate(
      projectedFocus.height,
      projectedFocus.height * ZOOM_MAX_SCALE,
      animation.effectProgress,
    ),
  };
}

function getFocusPhaseDim(
  focusEffect: ActiveFocusEffect,
  placement: ReturnType<typeof getPreviewShotPlacement>,
) {
  if (focusEffect.effectType === "spotlight") {
    return {
      aperture: getSpotlightAperture(focusEffect, placement),
    };
  }

  if (focusEffect.effectType === "zoom") {
    return {
      aperture: getZoomAperture(focusEffect, placement),
    };
  }

  return {
    aperture: {
      left: placement.shotWindowX,
      top: placement.shotWindowY,
      width: 0,
      height: 0,
    },
  };
}

function getFocusBackgroundDimOpacity(
  effectType: Exclude<FocusRegionEffectType, "none">,
  focusTreatmentStyle: FocusTreatmentStyle,
) {
  if (focusTreatmentStyle === "clean") {
    return effectType === "zoom" ? 0.18 : 0.22;
  }

  if (focusTreatmentStyle === "soft-focus") {
    return effectType === "zoom" ? 0.28 : 0.32;
  }

  if (effectType === "zoom") {
    return 0.38;
  }

  return 0.42;
}

function getSpotlightAperture(
  focusEffect: ActiveFocusEffect,
  placement: ReturnType<typeof getPreviewShotPlacement>,
) {
  const focus = getTransitionedFocusRegionStyle(focusEffect, placement);

  return {
    left: placement.shotWindowX + focus.left,
    top: placement.shotWindowY + focus.top,
    width: focus.width,
    height: focus.height,
  };
}

function getZoomAperture(
  focusEffect: ActiveFocusEffect,
  placement: ReturnType<typeof getPreviewShotPlacement>,
) {
  const focus = getZoomFocusStyle(focusEffect, placement);

  return {
    left: placement.shotWindowX + focus.focusLeft,
    top: placement.shotWindowY + focus.focusTop,
    width: focus.focusWidth,
    height: focus.focusHeight,
  };
}

function getLiftAnimationStyle(progress: number, shouldFadeOut = true) {
  if (progress < 0.18) {
    const entranceProgress = easeInOut(progress / 0.18);

    return {
      opacity: entranceProgress,
      liftProgress: entranceProgress,
      translateY: 18 - entranceProgress * 18,
    };
  }

  if (shouldFadeOut && progress > 0.82) {
    const exitProgress = easeInOut((progress - 0.82) / 0.18);

    return {
      opacity: 1 - exitProgress,
      liftProgress: 1,
      translateY: -exitProgress * 18,
    };
  }

  return {
    opacity: 1,
    liftProgress: 1,
    translateY: 0,
  };
}

function getFocusEffectAnimationStyle(progress: number, shouldFadeOut = true) {
  if (progress < 0.2) {
    const entranceProgress = easeInOut(progress / 0.2);

    return {
      opacity: entranceProgress,
      effectProgress: entranceProgress,
      translateY: 8 - entranceProgress * 8,
    };
  }

  if (shouldFadeOut && progress > 0.82) {
    const exitProgress = easeInOut((progress - 0.82) / 0.18);

    return {
      opacity: 1 - exitProgress,
      effectProgress: 1 - exitProgress,
      translateY: -exitProgress * 8,
    };
  }

  return {
    opacity: 1,
    effectProgress: 1,
    translateY: 0,
  };
}

function getSliceTransitionProgress(
  progress: number,
  focusTreatmentStyle: FocusTreatmentStyle,
) {
  return clamp(progress / getFocusTransitionRatio(focusTreatmentStyle), 0, 1);
}

function getFocusTransitionRatio(focusTreatmentStyle: FocusTreatmentStyle) {
  if (focusTreatmentStyle === "soft-focus") {
    return 0.34;
  }

  if (focusTreatmentStyle === "clean") {
    return 0.18;
  }

  return 0.22;
}

function getPreviousLiftProgress(transitionProgress: number) {
  return interpolate(0.82, 1, easeInOut(transitionProgress));
}

function getSupportedVideoMimeTypes(includeAudio = false) {
  if (typeof MediaRecorder === "undefined") {
    return [];
  }

  const mimeTypes = includeAudio
    ? VIDEO_WITH_AUDIO_MIME_TYPES
    : VIDEO_ONLY_MIME_TYPES;

  return mimeTypes.filter((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function createVideoExportFileName(fileName: string, mimeType: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "") || "comic-video";
  const extension = mimeType.includes("mp4") ? "mp4" : "webm";

  return `${baseName}-video-prototype.${extension}`;
}

function loadImageElement(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The source image could not be loaded for video export."));
    image.src = source;
  });
}

function throwIfExportAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw createExportCanceledError();
  }
}

function createExportCanceledError() {
  return new DOMException("Video export was canceled.", "AbortError");
}

class VideoRecorderStartupError extends Error {}

function isVideoRecorderStartupError(error: unknown) {
  return error instanceof VideoRecorderStartupError;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function easeInOut(progress: number) {
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
}

function smootherStep(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

function easeInOutSine(progress: number) {
  return -(Math.cos(Math.PI * clamp(progress, 0, 1)) - 1) / 2;
}

function getAttentionTravelProgress(
  motionRole: ActiveShotAttentionMotionRole,
  progress: number,
) {
  const settleRatio = ATTENTION_SETTLE_RATIO[motionRole];
  const travelRatio = Math.max(0.01, 1 - settleRatio);

  return getRoleTravelEase(motionRole, clamp(progress / travelRatio, 0, 1));
}

function getRoleTravelEase(
  motionRole: ActiveShotAttentionMotionRole,
  progress: number,
) {
  if (motionRole === "track") {
    return easeInOutSine(progress);
  }

  if (motionRole === "pushIn") {
    return easeOutCubic(progress);
  }

  return smootherStep(progress);
}

function easeOutCubic(progress: number) {
  const clampedProgress = clamp(progress, 0, 1);

  return 1 - Math.pow(1 - clampedProgress, 3);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
