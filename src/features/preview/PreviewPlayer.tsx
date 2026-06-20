import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ActiveShotAttentionMotionRole,
  CameraShot,
  FocusRegion,
  FocusRegionEffectType,
  GuidedPageOptions,
  ShotAttentionEffectCues,
  ShotAttentionMotionRole,
  ShotEffectCueMode,
  ShotEffectCueTiming,
  UploadedImage,
} from "../../lib/projectTypes";
import {
  getFocusRegionInclusionRatio,
  getPreviewShotPlacement,
} from "../../lib/coordinateMath";

type PreviewPlayerProps = {
  image: UploadedImage | null;
  shots: CameraShot[];
  focusRegions: FocusRegion[];
  guidedPageOptions: GuidedPageOptions;
};

type ViewportSize = {
  width: number;
  height: number;
};

type PreviewShotPlacement = {
  scale: number;
  shotWindowWidth: number;
  shotWindowHeight: number;
  shotWindowX: number;
  shotWindowY: number;
  imageWidth: number;
  imageHeight: number;
  imageX: number;
  imageY: number;
};

type SourceWindow = Pick<CameraShot, "x" | "y" | "width" | "height">;

type PreviewPhase = "idle" | "travel" | "hold" | "focus" | "exit";
type PreviewMode = "final" | "debug";
type PreviewPlaybackMode = "automatic" | "manual";
type PlaybackSegment = "shot" | "pageEnter" | "pageExit";

type ShotPhaseRatios = {
  travelRatio: number;
  holdRatio: number;
  focusRatio: number;
};

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

export function PreviewPlayer({
  image,
  shots,
  focusRegions,
  guidedPageOptions,
}: PreviewPlayerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const playbackRef = useRef({
    segment: "shot" as PlaybackSegment,
    shotIndex: 0,
    startedAt: 0,
    from: null as PreviewShotPlacement | null,
    to: null as PreviewShotPlacement | null,
    fromShot: null as CameraShot | null,
    toShot: null as CameraShot | null,
  });
  const [viewportSize, setViewportSize] = useState<ViewportSize | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [previewPhase, setPreviewPhase] = useState<PreviewPhase>("idle");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("final");
  const [playbackMode, setPlaybackMode] =
    useState<PreviewPlaybackMode>("automatic");
  const [focusPhaseProgress, setFocusPhaseProgress] = useState(0);
  const [travelVeilIntensity, setTravelVeilIntensity] = useState(0);
  const [previewClockMs, setPreviewClockMs] = useState(0);
  const [placement, setPlacement] = useState<PreviewShotPlacement>({
    scale: 1,
    shotWindowWidth: 0,
    shotWindowHeight: 0,
    shotWindowX: 0,
    shotWindowY: 0,
    imageWidth: 0,
    imageHeight: 0,
    imageX: 0,
    imageY: 0,
  });

  const previewPlacements = useMemo(() => {
    if (!image || !viewportSize) {
      return [];
    }

    return shots.map((shot) =>
      getPreviewShotPlacement(
        shot,
        image,
        viewportSize.width,
        viewportSize.height,
      ),
    );
  }, [image, shots, viewportSize]);
  const fullPagePlacement = useMemo(() => {
    if (!image || !viewportSize) {
      return null;
    }

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
  }, [image, viewportSize]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setViewportSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      return;
    }

    const clampedShotIndex = clamp(
      currentShotIndex,
      0,
      Math.max(0, previewPlacements.length - 1),
    );
    const currentPlacement = previewPlacements[clampedShotIndex];

    if (currentShotIndex !== clampedShotIndex) {
      setCurrentShotIndex(clampedShotIndex);
    }

    if (currentPlacement) {
      setPlacement(currentPlacement);
    }

    setPreviewPhase("idle");
    setFocusPhaseProgress(0);
    setTravelVeilIntensity(0);
    setPreviewClockMs(0);
  }, [currentShotIndex, isPlaying, previewPlacements]);

  useEffect(() => {
    if (currentShotIndex >= shots.length) {
      setCurrentShotIndex(0);
    }
  }, [currentShotIndex, shots.length]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  function stopPlayback() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsPlaying(false);
    setCurrentShotIndex(0);
    setPreviewPhase("idle");
    setFocusPhaseProgress(0);
    setTravelVeilIntensity(0);
    setPreviewClockMs(0);

    if (previewPlacements[0]) {
      setPlacement(previewPlacements[0]);
    }
  }

  function changePlaybackMode(nextPlaybackMode: PreviewPlaybackMode) {
    if (nextPlaybackMode === playbackMode) {
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setPlaybackMode(nextPlaybackMode);
    setIsPlaying(false);
    setPreviewPhase("idle");
    setFocusPhaseProgress(0);
    setTravelVeilIntensity(0);
    setPreviewClockMs(0);

    const nextShotIndex = nextPlaybackMode === "manual" ? currentShotIndex : 0;

    setCurrentShotIndex(nextShotIndex);

    if (previewPlacements[nextShotIndex]) {
      setPlacement(previewPlacements[nextShotIndex]);
    }
  }

  function stepManualPreview(direction: "previous" | "next") {
    if (!canPreview || isPlaying || playbackMode !== "manual") {
      return;
    }

    const offset = direction === "previous" ? -1 : 1;
    const nextShotIndex = clamp(
      currentShotIndex + offset,
      0,
      Math.max(0, previewPlacements.length - 1),
    );

    setCurrentShotIndex(nextShotIndex);
    setPreviewPhase("idle");
    setFocusPhaseProgress(0);
    setTravelVeilIntensity(0);
    setPreviewClockMs(0);

    if (previewPlacements[nextShotIndex]) {
      setPlacement(previewPlacements[nextShotIndex]);
    }
  }

  function play() {
    if (!image || previewPlacements.length === 0) {
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const firstBasePlacement = previewPlacements[0];
    const firstCustomStartPlacement = getShotPlaybackStartPlacement(
      firstBasePlacement,
      image,
      viewportSize,
      shots[0],
      focusRegions,
    );
    const firstPlacement = firstCustomStartPlacement ?? firstBasePlacement;
    const shouldShowPageEnter =
      guidedPageOptions.showPageEnter && fullPagePlacement !== null;
    const startingPlacement = shouldShowPageEnter
      ? fullPagePlacement
      : firstPlacement;

    setPlacement(startingPlacement);
    setIsPlaying(true);
    setCurrentShotIndex(0);
    setPreviewPhase(shouldShowPageEnter ? "travel" : "hold");
    setFocusPhaseProgress(0);
    setTravelVeilIntensity(0);
    setPreviewClockMs(0);

    playbackRef.current = {
      segment: shouldShowPageEnter ? "pageEnter" : "shot",
      shotIndex: 0,
      startedAt: performance.now(),
      from: startingPlacement,
      to: firstPlacement,
      fromShot: firstCustomStartPlacement ? null : shots[0],
      toShot: firstCustomStartPlacement ? null : shots[0],
    };

    animationFrameRef.current = requestAnimationFrame(stepPlayback);
  }

  function stepPlayback(now: number) {
    const playback = playbackRef.current;

    if (!playback.from || !playback.to) {
      stopPlayback();
      return;
    }

    const currentShot = shots[playback.shotIndex];

    if (!currentShot) {
      stopPlayback();
      return;
    }

    if (playback.segment !== "shot") {
      stepGuidedPagePlayback(now, playback.segment);
      return;
    }

    const durationMs = Math.max(1, currentShot.durationMs ?? 2500);
    const progress = Math.min((now - playback.startedAt) / durationMs, 1);
    const phaseRatios = getShotPhaseRatios(
      currentShot,
      playback.shotIndex === 0,
    );
    const phase = getPreviewPhase(progress, phaseRatios);

    setCurrentShotIndex(playback.shotIndex);
    setPreviewPhase(phase);
    setPreviewClockMs(now - playback.startedAt);

    const focusProgress =
      phase === "focus"
        ? getFocusPhaseProgress(progress, phaseRatios)
        : 0;

    setFocusPhaseProgress(focusProgress);

    if (phase === "travel") {
      const travelProgress = getCameraTravelProgress(
        progress,
        phaseRatios.travelRatio,
      );
      const rawTravelProgress = getRawTravelProgress(
        progress,
        phaseRatios.travelRatio,
      );

      setTravelVeilIntensity(getShotTravelVeilIntensity(rawTravelProgress));

      if (image && viewportSize && playback.fromShot && playback.toShot) {
        setPlacement(
          getPreviewShotPlacement(
            interpolateCameraShotGeometry(
              playback.fromShot,
              playback.toShot,
              travelProgress,
            ),
            image,
            viewportSize.width,
            viewportSize.height,
          ),
        );
      } else {
        setPlacement(
          interpolateShotPlacement(
            playback.from,
            playback.to,
            travelProgress,
          ),
        );
      }
    } else if (phase === "exit") {
      setTravelVeilIntensity(0);
      setPlacement(
        getFinalMotionAnchorPlacement(
          playback.to,
          image,
          viewportSize,
          currentShot,
          focusRegions,
        ) ?? playback.to,
      );
    } else {
      setTravelVeilIntensity(0);
      setPlacement(playback.to);
    }

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(stepPlayback);
      return;
    }

    const nextShotIndex = playback.shotIndex + 1;

    if (nextShotIndex >= previewPlacements.length) {
      if (guidedPageOptions.showPageExit && fullPagePlacement) {
        const outgoingPlacement =
          getFinalMotionAnchorPlacement(
            previewPlacements[playback.shotIndex],
            image,
            viewportSize,
            currentShot,
            focusRegions,
          ) ?? previewPlacements[playback.shotIndex];

      setPreviewPhase("exit");
      setFocusPhaseProgress(0);
      setTravelVeilIntensity(0);
      setPreviewClockMs(0);
        playbackRef.current = {
          segment: "pageExit",
          shotIndex: playback.shotIndex,
          startedAt: now,
          from: outgoingPlacement,
          to: fullPagePlacement,
          fromShot: null,
          toShot: null,
        };
        animationFrameRef.current = requestAnimationFrame(stepPlayback);
        return;
      }

      animationFrameRef.current = null;
      setIsPlaying(false);
      setPreviewPhase("idle");
      setFocusPhaseProgress(0);
      setTravelVeilIntensity(0);
      setPreviewClockMs(0);
      setCurrentShotIndex(Math.max(0, previewPlacements.length - 1));
      return;
    }

    const previousShot = shots[nextShotIndex - 1];
    const previousBasePlacement = previewPlacements[nextShotIndex - 1];
    const nextBasePlacement = previewPlacements[nextShotIndex];
    const nextCustomStartPlacement = getShotPlaybackStartPlacement(
      nextBasePlacement,
      image,
      viewportSize,
      shots[nextShotIndex],
      focusRegions,
    );
    const nextStartPlacement = nextCustomStartPlacement ?? nextBasePlacement;
    const outgoingPlacement = getFinalMotionAnchorPlacement(
      previousBasePlacement,
      image,
      viewportSize,
      previousShot,
      focusRegions,
    );

    setCurrentShotIndex(nextShotIndex);
    setPreviewPhase("travel");
    setFocusPhaseProgress(0);
    setTravelVeilIntensity(0);
    setPreviewClockMs(0);
    playbackRef.current = {
      segment: "shot",
      shotIndex: nextShotIndex,
      startedAt: now,
      from: outgoingPlacement ?? previousBasePlacement,
      to: nextStartPlacement,
      fromShot: outgoingPlacement || nextCustomStartPlacement ? null : previousShot,
      toShot: outgoingPlacement || nextCustomStartPlacement ? null : shots[nextShotIndex],
    };
    animationFrameRef.current = requestAnimationFrame(stepPlayback);
  }

  function stepGuidedPagePlayback(
    now: number,
    segment: Exclude<PlaybackSegment, "shot">,
  ) {
    const playback = playbackRef.current;

    if (!playback.from || !playback.to) {
      stopPlayback();
      return;
    }

    const progress = Math.min(
      (now - playback.startedAt) / GUIDED_PAGE_SEGMENT_DURATION_MS,
      1,
    );
    const travelProgress = getGuidedPageTravelProgress(segment, progress);

    setCurrentShotIndex(playback.shotIndex);
    setPreviewPhase(getGuidedPagePreviewPhase(segment, progress));
    setFocusPhaseProgress(0);
    setTravelVeilIntensity(0);
    setPreviewClockMs(now - playback.startedAt);
    setPlacement(
      interpolateShotPlacement(playback.from, playback.to, travelProgress),
    );

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(stepPlayback);
      return;
    }

    if (segment === "pageEnter") {
      setPreviewPhase("hold");
      setTravelVeilIntensity(0);
      setPreviewClockMs(0);
      playbackRef.current = {
        segment: "shot",
        shotIndex: 0,
        startedAt: now,
        from: playback.to,
        to: playback.to,
        fromShot: null,
        toShot: null,
      };
      animationFrameRef.current = requestAnimationFrame(stepPlayback);
      return;
    }

    animationFrameRef.current = null;
    setIsPlaying(false);
    setPreviewPhase("idle");
    setFocusPhaseProgress(0);
    setTravelVeilIntensity(0);
    setPreviewClockMs(0);
    setCurrentShotIndex(Math.max(0, previewPlacements.length - 1));
    setPlacement(playback.to);
  }

  const canPreview = Boolean(image && shots.length > 0);
  const currentShot = shots[currentShotIndex] ?? shots[0];
  const canStepPrevious =
    canPreview && playbackMode === "manual" && !isPlaying && currentShotIndex > 0;
  const canStepNext =
    canPreview &&
    playbackMode === "manual" &&
    !isPlaying &&
    currentShotIndex < shots.length - 1;
  const attentionAnchorSequence = currentShot
    ? getExplicitAttentionAnchorSequence(currentShot, focusRegions)
    : [];
  const activeMotionAnchor =
    isPlaying &&
    previewPhase === "focus" &&
    currentShot &&
    attentionAnchorSequence.length > 0
      ? getActiveAttentionAnchor(
          attentionAnchorSequence,
          focusPhaseProgress,
          currentShot.shotStartFraming === "firstFocus",
        )
      : null;
  const motionPlacement =
    image && viewportSize && currentShot && activeMotionAnchor
      ? getMotionAnchorPlacement(
          placement,
          image,
          viewportSize,
          currentShot,
          activeMotionAnchor,
          shouldStartActiveAnchorAtFirstFocus(currentShot, activeMotionAnchor),
        )
      : placement;
  const isShotPlaybackSegment = playbackRef.current.segment === "shot";
  const currentShotEffects = currentShot?.specialEffects;
  const currentShotPhaseRatios = currentShot
    ? getShotPhaseRatios(currentShot, currentShotIndex === 0)
    : null;
  const currentShotDurationMs = Math.max(1, currentShot?.durationMs ?? 2500);
  const shouldApplyShotEffects =
    isPlaying &&
    isShotPlaybackSegment &&
    previewPhase !== "travel" &&
    previewPhase !== "exit";
  const shotEffectElapsedMs = currentShotPhaseRatios
    ? Math.max(
        0,
        previewClockMs -
          currentShotDurationMs * currentShotPhaseRatios.travelRatio,
      )
    : previewClockMs;
  const focusDurationMs =
    currentShot && currentShotPhaseRatios
      ? currentShotDurationMs * currentShotPhaseRatios.focusRatio
      : 0;
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
  const cameraShakeOffset = getCameraShakeOffset(
    (shouldApplyShotEffects && currentShotEffects?.shake === true) ||
      shouldApplyAttentionEffectCue(
        activeMotionAnchor?.anchor.effectCues?.shake,
        shakeCueClock,
        CAMERA_SHAKE_CUE_ONCE_DURATION_MS,
      ),
    isPlaying,
    previewPhase,
    previewClockMs,
    motionPlacement,
  );
  const trackAttentionField =
    currentShot &&
    activeMotionAnchor?.anchor.motionRole === "track"
      ? applyCameraShakeToTrackAttentionField(
          getTrackAttentionField(activeMotionAnchor, motionPlacement),
          cameraShakeOffset,
        )
      : currentShot
        ? applyCameraShakeToTrackAttentionField(
            getFirstFocusTrackAttentionField(
              currentShot,
              attentionAnchorSequence,
              placement,
              isPlaying,
              previewPhase,
            ),
            cameraShakeOffset,
          )
        : null;
  const travelVeil =
    travelVeilIntensity > 0
      ? {
          dimOpacity: travelVeilIntensity * TRAVEL_VEIL_DIM_PEAK_OPACITY,
          blurPx: travelVeilIntensity * TRAVEL_VEIL_BLUR_PEAK_PX,
      }
      : null;
  const shotImpactPulseOpacity = getImpactPulsePreviewOpacity(
    shouldApplyShotEffects && currentShotEffects?.impactPulse === true,
    isPlaying,
    previewPhase,
    shotEffectElapsedMs,
  );
  const cueImpactPulseOpacity = getAttentionImpactPulseOpacity(
    activeMotionAnchor?.anchor.effectCues?.impactPulse,
    shouldApplyShotEffects,
    previewPhase,
    impactPulseCueClock,
  );
  const impactPulseOpacity = Math.max(
    shotImpactPulseOpacity,
    cueImpactPulseOpacity,
  );
  const imageFilter = getPreviewImageFilter(travelVeil?.blurPx);

  return (
    <section className="panel preview-panel">
      <div className="panel-heading panel-heading-row">
        <div>
          <span className="panel-kicker">Preview</span>
          <h2>Camera preview</h2>
        </div>
        <div className="preview-controls">
          <div className="preview-mode-toggle" aria-label="Preview mode">
            <button
              className={
                previewMode === "final"
                  ? "preview-mode-button is-active"
                  : "preview-mode-button"
              }
              type="button"
              aria-pressed={previewMode === "final"}
              onClick={() => setPreviewMode("final")}
            >
              Final
            </button>
            <button
              className={
                previewMode === "debug"
                  ? "preview-mode-button is-active"
                  : "preview-mode-button"
              }
              type="button"
              aria-pressed={previewMode === "debug"}
              onClick={() => setPreviewMode("debug")}
            >
              Debug
            </button>
          </div>
          <div className="preview-mode-toggle" aria-label="Playback mode">
            <button
              className={
                playbackMode === "automatic"
                  ? "preview-mode-button is-active"
                  : "preview-mode-button"
              }
              type="button"
              aria-pressed={playbackMode === "automatic"}
              onClick={() => changePlaybackMode("automatic")}
            >
              Auto
            </button>
            <button
              className={
                playbackMode === "manual"
                  ? "preview-mode-button is-active"
                  : "preview-mode-button"
              }
              type="button"
              aria-pressed={playbackMode === "manual"}
              onClick={() => changePlaybackMode("manual")}
            >
              Manual
            </button>
          </div>
          <button
            className="secondary-action"
            type="button"
            disabled={!canPreview || isPlaying || playbackMode !== "automatic"}
            onClick={play}
          >
            Play
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={!canPreview}
            onClick={stopPlayback}
          >
            Stop
          </button>
          <div className="preview-step-controls" aria-label="Manual shot controls">
            <button
              className="secondary-action"
              type="button"
              disabled={!canStepPrevious}
              onClick={() => stepManualPreview("previous")}
            >
              Previous
            </button>
            <span className="preview-step-status" aria-live="polite">
              {canPreview
                ? `Shot ${currentShotIndex + 1} / ${shots.length}`
                : "Shot 0 / 0"}
            </span>
            <button
              className="secondary-action"
              type="button"
              disabled={!canStepNext}
              onClick={() => stepManualPreview("next")}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div
        className={
          previewMode === "debug"
            ? "preview-viewport is-debug-mode"
            : "preview-viewport"
        }
        ref={viewportRef}
      >
        {image ? (
          <>
            <div
              className="preview-shot-window"
              style={{
                left: `${motionPlacement.shotWindowX}px`,
                top: `${motionPlacement.shotWindowY}px`,
                width: `${motionPlacement.shotWindowWidth}px`,
                height: `${motionPlacement.shotWindowHeight}px`,
              }}
            >
              <div className="preview-shot-content">
                <img
                  className="preview-image"
                  src={image.objectUrl}
                  draggable={false}
                  alt="Camera preview"
                  style={{
                    width: `${motionPlacement.imageWidth}px`,
                    height: `${motionPlacement.imageHeight}px`,
                    transform: `translate(${motionPlacement.imageX + cameraShakeOffset.x}px, ${motionPlacement.imageY + cameraShakeOffset.y}px)`,
                    filter: imageFilter,
                  }}
                />
                {travelVeil ? (
                  <div
                    className="preview-travel-veil"
                    style={{
                      background: `rgba(17, 24, 39, ${travelVeil.dimOpacity.toFixed(3)})`,
                    }}
                  />
                ) : null}
              </div>
            </div>
            {trackAttentionField ? (
              <TrackAttentionOverlay overlay={trackAttentionField} />
            ) : null}
            {impactPulseOpacity > 0 ? (
              <div
                className="preview-effect-impact-pulse"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background: `rgba(255, 255, 255, ${impactPulseOpacity.toFixed(3)})`,
                }}
              />
            ) : null}
          </>
        ) : (
          <div className="preview-empty">
            <p>No preview yet.</p>
            <span>Upload an image and create shots to preview camera movement.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function interpolateShotPlacement(
  from: PreviewShotPlacement,
  to: PreviewShotPlacement,
  progress: number,
): PreviewShotPlacement {
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

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function getCameraShakeOffset(
  isEnabled: boolean,
  isPlaying: boolean,
  previewPhase: PreviewPhase,
  previewClockMs: number,
  placement: PreviewShotPlacement,
): CameraShakeOffset {
  if (!isEnabled || !isPlaying || previewPhase === "idle") {
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
  isPlaying: boolean,
  previewPhase: PreviewPhase,
  previewClockMs: number,
) {
  if (
    !isEnabled ||
    !isPlaying ||
    previewPhase === "idle" ||
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

  return getImpactPulsePreviewOpacity(
    true,
    true,
    previewPhase,
    cueClockMs,
  );
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

function getPreviewImageFilter(travelBlurPx: number | undefined) {
  return travelBlurPx && travelBlurPx > 0
    ? `blur(${travelBlurPx.toFixed(2)}px)`
    : undefined;
}

function getCameraShakePhaseIntensity(previewPhase: PreviewPhase) {
  if (previewPhase === "focus") {
    return 1;
  }

  if (previewPhase === "hold") {
    return 0.65;
  }

  if (previewPhase === "travel") {
    return 0.45;
  }

  if (previewPhase === "exit") {
    return 0.35;
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

function easeInOut(progress: number) {
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
}

function getShotPhaseRatios(
  shot: CameraShot,
  isFirstShot: boolean,
): ShotPhaseRatios {
  const travelRatio = isFirstShot
    ? 0
    : clamp(
        Math.max(
          TRAVEL_PHASE_RATIO,
          SHOT_TRAVEL_MIN_DURATION_MS / Math.max(1, shot.durationMs),
        ),
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
  const { travelRatio, holdRatio, focusRatio } = phaseRatios;
  const holdEnd = travelRatio + holdRatio;
  const focusEnd = holdEnd + focusRatio;
  const exitStart = Math.min(1 - EXIT_PHASE_RATIO, focusEnd);

  if (travelRatio > 0 && progress < travelRatio) {
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
  segment: Exclude<PlaybackSegment, "shot">,
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

function getGuidedPagePreviewPhase(
  segment: Exclude<PlaybackSegment, "shot">,
  progress: number,
): PreviewPhase {
  if (segment === "pageEnter" && progress < GUIDED_PAGE_HOLD_RATIO) {
    return "hold";
  }

  return segment === "pageEnter" ? "travel" : "exit";
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

      if (
        !focusRegion ||
        getFocusRegionInclusionRatio(currentShot, focusRegion) <
          FOCUS_REGION_INCLUSION_THRESHOLD
      ) {
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
  if (activeAnchor.anchor.motionRole === "pushOut") {
    return getPushOutAnchorPlacement(
      basePlacement,
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
  basePlacement: PreviewShotPlacement,
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
  const contextWindow = getPushOutWindow(
    currentShot,
    activeAnchor.nextAnchor,
  );

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
  image: UploadedImage | null,
  viewportSize: ViewportSize | null,
  currentShot: CameraShot,
  focusRegions: FocusRegion[],
): PreviewShotPlacement | null {
  if (!image || !viewportSize) {
    return null;
  }

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
  image: UploadedImage | null,
  viewportSize: ViewportSize | null,
  currentShot: CameraShot,
  focusRegions: FocusRegion[],
): PreviewShotPlacement | null {
  if (
    !image ||
    !viewportSize ||
    currentShot.shotStartFraming !== "firstFocus"
  ) {
    return null;
  }

  const firstAnchor = getExplicitAttentionAnchorSequence(currentShot, focusRegions)[0];

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
  isPlaying: boolean,
  previewPhase: PreviewPhase,
) {
  const firstAnchor = anchors[0];
  const nextAnchor = anchors[1];

  if (
    !isPlaying ||
    currentShot.shotStartFraming !== "firstFocus" ||
    previewPhase === "focus" ||
    previewPhase === "exit" ||
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
  const paddingX = Math.max(sourceWindow.width * (scale - 1) * 0.5, minimumPaddingX);
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

function getUnionSourceWindow(first: SourceWindow, second: SourceWindow) {
  const left = Math.min(first.x, second.x);
  const top = Math.min(first.y, second.y);
  const right = Math.max(first.x + first.width, second.x + second.width);
  const bottom = Math.max(first.y + first.height, second.y + second.height);

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
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
      id: "preview-motion-target",
      label: "Preview motion target",
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
  const viewportWidth = motionPlacement.shotWindowX * 2 + motionPlacement.shotWindowWidth;
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
    left: shotPlacement.shotWindowX + shotPlacement.imageX + sourceWindow.x * shotPlacement.scale,
    top: shotPlacement.shotWindowY + shotPlacement.imageY + sourceWindow.y * shotPlacement.scale,
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

function TrackAttentionOverlay({ overlay }: { overlay: TrackAttentionField }) {
  const centerDimOpacity = 1 - overlay.spotStrength;
  const shoulderDimOpacity = Math.min(1, centerDimOpacity + 0.33);

  return (
    <svg
      aria-hidden="true"
      width={overlay.viewportWidth}
      height={overlay.viewportHeight}
      viewBox={`0 0 ${overlay.viewportWidth} ${overlay.viewportHeight}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <defs>
        <radialGradient
          id="track-follow-spot-dim-gradient"
          gradientUnits="userSpaceOnUse"
          cx={overlay.center.x}
          cy={overlay.center.y}
          r={overlay.radius}
        >
          <stop
            offset="0%"
            stopColor="white"
            stopOpacity={centerDimOpacity}
          />
          <stop
            offset="46%"
            stopColor="white"
            stopOpacity={shoulderDimOpacity}
          />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </radialGradient>
        <mask
          id="track-follow-spot-dim-mask"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <rect
            x="0"
            y="0"
            width={overlay.viewportWidth}
            height={overlay.viewportHeight}
            fill="url(#track-follow-spot-dim-gradient)"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width={overlay.viewportWidth}
        height={overlay.viewportHeight}
        fill="rgba(17, 24, 39, 0.50)"
        opacity={overlay.dimOpacity}
        mask="url(#track-follow-spot-dim-mask)"
      />
    </svg>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
