import { useEffect, useState } from "react";
import type {
  ActiveShotAttentionMotionRole,
  CameraShot,
  FocusRegion,
  FocusRegionKind,
  ReadingPurpose,
  ShotAttentionEffectCues,
  ShotAttentionMotionRole,
  ShotAttentionPathItem,
  ShotEffectCueMode,
  ShotEffectCueTiming,
  ShotSpecialEffects,
  ShotStartFraming,
  UploadedImage,
} from "../../lib/projectTypes";

type ShotInspectorProps = {
  image: UploadedImage | null;
  selectedShot: CameraShot | null;
  selectedFocusRegion: FocusRegion | null;
  focusRegions: FocusRegion[];
  shotCount: number;
  onChangeShot: (shot: CameraShot) => void;
  onChangeFocusRegion: (focusRegion: FocusRegion) => void;
  onDeleteShot: (shotId: string) => void;
  onDeleteFocusRegion: (focusRegionId: string) => void;
};

const FOCUS_REGION_KINDS: FocusRegionKind[] = [
  "panel",
  "speech",
  "face",
  "detail",
  "action",
  "other",
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
const SHOT_ATTENTION_MOTION_ROLE_LABELS: Record<
  ActiveShotAttentionMotionRole,
  string
> = {
  track: "Track",
  pushIn: "Push In",
  pushOut: "Push Out",
};
const SHOT_ATTENTION_MOTION_ROLES: ActiveShotAttentionMotionRole[] = [
  "track",
  "pushIn",
  "pushOut",
];
type ShotEffectPreset = "none" | "shake" | "impactPulse" | "shakeImpactPulse";
const SHOT_EFFECT_PRESETS: Array<{
  value: ShotEffectPreset;
  label: string;
}> = [
  { value: "none", label: "None" },
  { value: "shake", label: "Shake" },
  { value: "impactPulse", label: "Impact Pulse" },
  { value: "shakeImpactPulse", label: "Shake + Impact Pulse" },
];
const SHOT_EFFECT_CUE_LABELS: Record<ShotEffectCueMode, string> = {
  once: "Once",
  repeat: "Repeat",
};
const SHOT_EFFECT_CUE_MODES: ShotEffectCueMode[] = ["once", "repeat"];
const SHOT_EFFECT_CUE_TIMING_LABELS: Record<ShotEffectCueTiming, string> = {
  early: "Early",
  arrival: "Arrival",
};
const SHOT_EFFECT_CUE_TIMINGS: ShotEffectCueTiming[] = [
  "early",
  "arrival",
];
const DEFAULT_SCENE_HOLD_RATIO = 0.1;
const DEFAULT_FOCUS_ATTENTION_RATIO = 0.6;
const MAX_HOLD_AND_FOCUS_RATIO = 0.7;

type PurposeTimingSuggestion = {
  durationMs: number;
  sceneHoldRatio: number;
  focusAttentionRatio: number;
  guidance: string;
};

const PURPOSE_TIMING_SUGGESTIONS: Record<
  ReadingPurpose,
  PurposeTimingSuggestion
> = {
  establishing: {
    durationMs: 3800,
    sceneHoldRatio: 0.28,
    focusAttentionRatio: 0.4,
    guidance: "Wider/longer view: orient first, then move gently.",
  },
  panel: {
    durationMs: 2700,
    sceneHoldRatio: 0.14,
    focusAttentionRatio: 0.56,
    guidance: "Standard panel beat: brief read hold, then guided attention.",
  },
  dialogue: {
    durationMs: 4000,
    sceneHoldRatio: 0.26,
    focusAttentionRatio: 0.48,
    guidance: "Longer hold: preserve text time before speaker-to-speaker motion.",
  },
  reaction: {
    durationMs: 2800,
    sceneHoldRatio: 0.18,
    focusAttentionRatio: 0.54,
    guidance: "Held response: arrive cleanly and let the reaction settle.",
  },
  emotion: {
    durationMs: 3800,
    sceneHoldRatio: 0.22,
    focusAttentionRatio: 0.56,
    guidance: "Slower close-up: move in, then hold mood and expression.",
  },
  action: {
    durationMs: 1900,
    sceneHoldRatio: 0.06,
    focusAttentionRatio: 0.52,
    guidance: "Faster movement: keep momentum but leave a readable landing.",
  },
  detail: {
    durationMs: 3200,
    sceneHoldRatio: 0.16,
    focusAttentionRatio: 0.58,
    guidance: "Inspection beat: move into detail and let it settle.",
  },
  reveal: {
    durationMs: 3400,
    sceneHoldRatio: 0.2,
    focusAttentionRatio: 0.58,
    guidance: "Context recovery: stage the close view, then reveal context.",
  },
  transition: {
    durationMs: 1900,
    sceneHoldRatio: 0.06,
    focusAttentionRatio: 0.46,
    guidance: "Bridge timing: move briskly with a small arrival pause.",
  },
  other: {
    durationMs: 2700,
    sceneHoldRatio: 0.14,
    focusAttentionRatio: 0.56,
    guidance: "Neutral timing: use the existing balanced default.",
  },
};

export function ShotInspector({
  image,
  selectedShot,
  selectedFocusRegion,
  focusRegions,
  shotCount,
  onChangeShot,
  onChangeFocusRegion,
  onDeleteShot,
  onDeleteFocusRegion,
}: ShotInspectorProps) {
  const [durationDraft, setDurationDraft] = useState("");
  const [durationError, setDurationError] = useState<string | null>(null);
  const [attentionFocusRegionId, setAttentionFocusRegionId] = useState("");
  const [attentionDurationWeightDrafts, setAttentionDurationWeightDrafts] =
    useState<Record<string, string>>({});

  useEffect(() => {
    setDurationDraft(selectedShot ? String(selectedShot.durationMs) : "");
    setDurationError(null);
  }, [selectedShot]);

  useEffect(() => {
    setAttentionFocusRegionId("");
  }, [selectedShot?.id, focusRegions]);

  useEffect(() => {
    const orderedPath = getOrderedAttentionPath(selectedShot?.attentionPath ?? []);

    setAttentionDurationWeightDrafts(
      Object.fromEntries(
        orderedPath.map((pathItem) => [
          pathItem.id,
          pathItem.durationWeight ? String(pathItem.durationWeight) : "",
        ]),
      ),
    );
  }, [selectedShot?.id, selectedShot?.attentionPath]);

  function handleLabelChange(label: string) {
    if (!selectedShot) {
      return;
    }

    onChangeShot({
      ...selectedShot,
      label,
    });
  }

  function handleShotPurposeChange(shotPurpose: ReadingPurpose) {
    if (!selectedShot) {
      return;
    }

    onChangeShot({
      ...selectedShot,
      shotPurpose,
    });
  }

  function handleApplyPurposeTiming(purpose: ReadingPurpose) {
    if (!selectedShot) {
      return;
    }

    const timingSuggestion = PURPOSE_TIMING_SUGGESTIONS[purpose];

    setDurationDraft(String(timingSuggestion.durationMs));
    setDurationError(null);
    onChangeShot({
      ...selectedShot,
      durationMs: timingSuggestion.durationMs,
      sceneHoldRatio: timingSuggestion.sceneHoldRatio,
      focusAttentionRatio: timingSuggestion.focusAttentionRatio,
    });
  }

  function handleFocusRegionLabelChange(label: string) {
    if (!selectedFocusRegion) {
      return;
    }

    onChangeFocusRegion({
      ...selectedFocusRegion,
      label,
    });
  }

  function handleFocusRegionPurposeChange(focusPurpose: ReadingPurpose) {
    if (!selectedFocusRegion) {
      return;
    }

    onChangeFocusRegion({
      ...selectedFocusRegion,
      focusPurpose,
    });
  }

  function handleFocusRegionKindChange(kind: FocusRegionKind) {
    if (!selectedFocusRegion) {
      return;
    }

    onChangeFocusRegion({
      ...selectedFocusRegion,
      kind,
    });
  }

  function handleFocusRegionSequenceOrderChange(value: string) {
    if (!selectedFocusRegion) {
      return;
    }

    const sequenceOrder = Number(value);

    if (!Number.isFinite(sequenceOrder) || sequenceOrder < 1) {
      return;
    }

    onChangeFocusRegion({
      ...selectedFocusRegion,
      sequenceOrder: Math.round(sequenceOrder),
    });
  }

  function handleDurationChange(value: string) {
    setDurationDraft(value);

    if (!selectedShot) {
      return;
    }

    const nextDuration = Number(value);

    if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
      setDurationError("Duration must be a positive number.");
      return;
    }

    const durationMs = Math.round(nextDuration);

    setDurationError(null);
    onChangeShot({
      ...selectedShot,
      durationMs,
    });
  }

  function handleSceneHoldRatioChange(value: string) {
    if (!selectedShot) {
      return;
    }

    const sceneHoldRatio = parsePercentageRatio(value);

    if (sceneHoldRatio === null) {
      return;
    }

    const focusAttentionRatio = Math.min(
      selectedShot.focusAttentionRatio ?? DEFAULT_FOCUS_ATTENTION_RATIO,
      MAX_HOLD_AND_FOCUS_RATIO - sceneHoldRatio,
    );

    onChangeShot({
      ...selectedShot,
      sceneHoldRatio,
      focusAttentionRatio: roundRatio(Math.max(0, focusAttentionRatio)),
    });
  }

  function handleFocusAttentionRatioChange(value: string) {
    if (!selectedShot) {
      return;
    }

    const focusAttentionRatio = parsePercentageRatio(value);

    if (focusAttentionRatio === null) {
      return;
    }

    const sceneHoldRatio = Math.min(
      selectedShot.sceneHoldRatio ?? DEFAULT_SCENE_HOLD_RATIO,
      MAX_HOLD_AND_FOCUS_RATIO - focusAttentionRatio,
    );

    onChangeShot({
      ...selectedShot,
      sceneHoldRatio: roundRatio(Math.max(0, sceneHoldRatio)),
      focusAttentionRatio,
    });
  }

  function handleShotStartFramingChange(shotStartFraming: ShotStartFraming) {
    if (!selectedShot) {
      return;
    }

    onChangeShot({
      ...selectedShot,
      shotStartFraming:
        shotStartFraming === "establishShot" ? undefined : shotStartFraming,
    });
  }

  function handleShotEffectPresetChange(effectPreset: ShotEffectPreset) {
    if (!selectedShot) {
      return;
    }

    onChangeShot({
      ...selectedShot,
      specialEffects: createShotSpecialEffectsFromPreset(effectPreset),
    });
  }

  function handleAddAttentionPathItem() {
    if (!selectedShot || !attentionFocusRegionId) {
      return;
    }

    const existingPath = getOrderedAttentionPath(selectedShot.attentionPath ?? []);

    if (
      existingPath.some(
        (pathItem) => pathItem.focusRegionId === attentionFocusRegionId,
      )
    ) {
      return;
    }

    const nextPath = normalizeAttentionPathOrder([
      ...existingPath,
      {
        id: createAttentionPathItemId(selectedShot.id, attentionFocusRegionId),
        focusRegionId: attentionFocusRegionId,
        order: existingPath.length + 1,
      },
    ]);

    onChangeShot({
      ...selectedShot,
      attentionPath: nextPath,
    });
    setAttentionFocusRegionId("");
  }

  function handleMoveAttentionPathItem(pathItemId: string, direction: "up" | "down") {
    if (!selectedShot?.attentionPath) {
      return;
    }

    const orderedPath = getOrderedAttentionPath(selectedShot.attentionPath);
    const currentIndex = orderedPath.findIndex((item) => item.id === pathItemId);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex < 0 || nextIndex >= orderedPath.length) {
      return;
    }

    const nextPath = [...orderedPath];
    const [movedPathItem] = nextPath.splice(currentIndex, 1);

    nextPath.splice(nextIndex, 0, movedPathItem);

    onChangeShot({
      ...selectedShot,
      attentionPath: normalizeAttentionPathOrder(nextPath),
    });
  }

  function handleRemoveAttentionPathItem(pathItemId: string) {
    if (!selectedShot?.attentionPath) {
      return;
    }

    const nextPath = normalizeAttentionPathOrder(
      getOrderedAttentionPath(selectedShot.attentionPath).filter(
        (pathItem) => pathItem.id !== pathItemId,
      ),
    );

    onChangeShot({
      ...selectedShot,
      attentionPath: nextPath.length > 0 ? nextPath : undefined,
    });
  }

  function handleAttentionPathMotionRoleChange(
    pathItemId: string,
    motionRole: ActiveShotAttentionMotionRole | "",
  ) {
    const firstPathItem = getOrderedAttentionPath(selectedShot?.attentionPath ?? [])[0];
    const shouldResetShotStart =
      selectedShot?.shotStartFraming === "firstFocus" &&
      firstPathItem?.id === pathItemId &&
      motionRole !== "track" &&
      motionRole !== "pushOut";

    if (shouldResetShotStart && selectedShot?.attentionPath) {
      onChangeShot({
        ...selectedShot,
        shotStartFraming: undefined,
        attentionPath: selectedShot.attentionPath.map((pathItem) =>
          pathItem.id === pathItemId
            ? {
                ...pathItem,
                motionRole: motionRole || undefined,
              }
            : pathItem,
        ),
      });
      return;
    }

    updateAttentionPathItem(pathItemId, {
      motionRole: motionRole || undefined,
    });
  }

  function handleAttentionPathDurationWeightChange(
    pathItemId: string,
    value: string,
  ) {
    setAttentionDurationWeightDrafts((drafts) => ({
      ...drafts,
      [pathItemId]: value,
    }));

    const durationWeight = Number(value);

    if (!Number.isFinite(durationWeight) || durationWeight <= 0) {
      return;
    }

    updateAttentionPathItem(pathItemId, {
      durationWeight,
    });
  }

  function handleAttentionPathDurationWeightBlur(pathItemId: string) {
    const currentPathItem = selectedShot?.attentionPath?.find(
      (pathItem) => pathItem.id === pathItemId,
    );

    setAttentionDurationWeightDrafts((drafts) => ({
      ...drafts,
      [pathItemId]: currentPathItem?.durationWeight
        ? String(currentPathItem.durationWeight)
        : "",
    }));
  }

  function handleAttentionPathEffectCueChange(
    pathItemId: string,
    effectName: keyof ShotAttentionEffectCues,
    cueMode: ShotEffectCueMode | "",
  ) {
    const currentPathItem = selectedShot?.attentionPath?.find(
      (pathItem) => pathItem.id === pathItemId,
    );

    if (!currentPathItem) {
      return;
    }

    const nextEffectCues = createUpdatedEffectCues(
      currentPathItem.effectCues,
      effectName,
      cueMode || undefined,
    );

    updateAttentionPathItem(pathItemId, {
      effectCues: nextEffectCues,
      effectCueTiming: nextEffectCues
        ? currentPathItem.effectCueTiming
        : undefined,
    });
  }

  function handleAttentionPathEffectCueTimingChange(
    pathItemId: string,
    effectCueTiming: ShotEffectCueTiming,
  ) {
    updateAttentionPathItem(pathItemId, {
      effectCueTiming,
    });
  }

  function updateAttentionPathItem(
    pathItemId: string,
    patch: Partial<
      Pick<
        ShotAttentionPathItem,
        "motionRole" | "durationWeight" | "effectCues" | "effectCueTiming"
      >
    >,
  ) {
    if (!selectedShot?.attentionPath) {
      return;
    }

    onChangeShot({
      ...selectedShot,
      attentionPath: selectedShot.attentionPath.map((pathItem) =>
        pathItem.id === pathItemId
          ? {
              ...pathItem,
              ...patch,
            }
          : pathItem,
      ),
    });
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="panel-kicker">Controls</span>
        <h2>Inspector</h2>
      </div>

      {!image ? (
        <div className="inspector-empty">
          <p>No page loaded.</p>
          <span>Upload an image before editing camera shots.</span>
        </div>
      ) : !selectedShot ? (
        <div className="inspector-empty">
          <p>No shot selected.</p>
          <span>Select a shot rectangle on the page.</span>
        </div>
      ) : selectedFocusRegion ? (
        <div className="inspector-form">
          <div className="readonly-field">
            <span>Focus Region ID</span>
            <strong>{selectedFocusRegion.id}</strong>
          </div>

          <label className="field">
            <span>Label</span>
            <input
              type="text"
              value={selectedFocusRegion.label}
              onChange={(event) =>
                handleFocusRegionLabelChange(event.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Purpose</span>
            <select
              value={selectedFocusRegion.focusPurpose ?? ""}
              onChange={(event) =>
                handleFocusRegionPurposeChange(
                  event.target.value as ReadingPurpose,
                )
              }
            >
              <option value="" disabled>
                Unassigned
              </option>
              {READING_PURPOSES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {formatPurpose(purpose)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Kind</span>
            <select
              value={selectedFocusRegion.kind}
              onChange={(event) =>
                handleFocusRegionKindChange(
                  event.target.value as FocusRegionKind,
                )
              }
            >
              {FOCUS_REGION_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Sequence Order</span>
            <input
              type="number"
              min="1"
              step="1"
              value={selectedFocusRegion.sequenceOrder ?? 1}
              onChange={(event) =>
                handleFocusRegionSequenceOrderChange(event.target.value)
              }
            />
          </label>

          <dl className="coordinate-grid">
            <div>
              <dt>X</dt>
              <dd>{selectedFocusRegion.x}px</dd>
            </div>
            <div>
              <dt>Y</dt>
              <dd>{selectedFocusRegion.y}px</dd>
            </div>
            <div>
              <dt>Width</dt>
              <dd>{selectedFocusRegion.width}px</dd>
            </div>
            <div>
              <dt>Height</dt>
              <dd>{selectedFocusRegion.height}px</dd>
            </div>
          </dl>

          <button
            className="danger-action"
            type="button"
            onClick={() => onDeleteFocusRegion(selectedFocusRegion.id)}
          >
            Delete Focus Region
          </button>
        </div>
      ) : (
        <div className="inspector-form">
          <div className="readonly-field">
            <span>Shot ID</span>
            <strong>{selectedShot.id}</strong>
          </div>

          <label className="field">
            <span>Label</span>
            <input
              type="text"
              value={selectedShot.label}
              onChange={(event) => handleLabelChange(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Purpose</span>
            <select
              value={selectedShot.shotPurpose ?? ""}
              onChange={(event) =>
                handleShotPurposeChange(event.target.value as ReadingPurpose)
              }
            >
              <option value="" disabled>
                Unassigned
              </option>
              {READING_PURPOSES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {formatPurpose(purpose)}
                </option>
              ))}
            </select>
          </label>

          {selectedShot.shotPurpose ? (
            <PurposeTimingSuggestionPanel
              applyLabel="Apply Purpose Timing"
              purpose={selectedShot.shotPurpose}
              onApply={handleApplyPurposeTiming}
            />
          ) : null}

          <label className="field">
            <span>Effect Preset</span>
            <select
              value={getShotEffectPreset(selectedShot.specialEffects)}
              onChange={(event) =>
                handleShotEffectPresetChange(
                  event.target.value as ShotEffectPreset,
                )
              }
            >
              {SHOT_EFFECT_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <p className="inspector-note">
            Effects are rendering-layer metadata used by browser preview and
            canvas export.
          </p>

          <label className="field">
            <span>Duration</span>
            <input
              type="number"
              min="1"
              step="100"
              value={durationDraft}
              onChange={(event) => handleDurationChange(event.target.value)}
              onBlur={() => {
                if (selectedShot) {
                  setDurationDraft(String(selectedShot.durationMs));
                  setDurationError(null);
                }
              }}
            />
          </label>

          {durationError ? <p className="form-error">{durationError}</p> : null}

          <label className="field">
            <span>Scene Hold %</span>
            <input
              type="number"
              min="0"
              max="70"
              step="5"
              value={ratioToPercentage(
                selectedShot.sceneHoldRatio ?? DEFAULT_SCENE_HOLD_RATIO,
              )}
              onChange={(event) =>
                handleSceneHoldRatioChange(event.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Focus Attention %</span>
            <input
              type="number"
              min="0"
              max="70"
              step="5"
              value={ratioToPercentage(
                selectedShot.focusAttentionRatio ??
                  DEFAULT_FOCUS_ATTENTION_RATIO,
              )}
              onChange={(event) =>
                handleFocusAttentionRatioChange(event.target.value)
              }
            />
          </label>

          <p className="inspector-note">
            Hold and focus share up to 70% of the shot duration.
          </p>

          <ShotAttentionPathControls
            selectedShot={selectedShot}
            focusRegions={focusRegions}
            selectedFocusRegionId={attentionFocusRegionId}
            durationWeightDrafts={attentionDurationWeightDrafts}
            onSelectFocusRegion={setAttentionFocusRegionId}
            onAddPathItem={handleAddAttentionPathItem}
            onMovePathItem={handleMoveAttentionPathItem}
            onRemovePathItem={handleRemoveAttentionPathItem}
            onChangeMotionRole={handleAttentionPathMotionRoleChange}
            onChangeDurationWeight={handleAttentionPathDurationWeightChange}
            onBlurDurationWeight={handleAttentionPathDurationWeightBlur}
            onChangeEffectCue={handleAttentionPathEffectCueChange}
            onChangeEffectCueTiming={handleAttentionPathEffectCueTimingChange}
            onChangeShotStartFraming={handleShotStartFramingChange}
          />

          <dl className="coordinate-grid">
            <div>
              <dt>X</dt>
              <dd>{selectedShot.x}px</dd>
            </div>
            <div>
              <dt>Y</dt>
              <dd>{selectedShot.y}px</dd>
            </div>
            <div>
              <dt>Width</dt>
              <dd>{selectedShot.width}px</dd>
            </div>
            <div>
              <dt>Height</dt>
              <dd>{selectedShot.height}px</dd>
            </div>
          </dl>

          <button
            className="danger-action"
            type="button"
            disabled={shotCount <= 1}
            onClick={() => onDeleteShot(selectedShot.id)}
          >
            Delete Shot
          </button>

          {shotCount <= 1 ? (
            <p className="inspector-note">At least one shot is required.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function ShotAttentionPathControls({
  selectedShot,
  focusRegions,
  selectedFocusRegionId,
  durationWeightDrafts,
  onSelectFocusRegion,
  onAddPathItem,
  onMovePathItem,
  onRemovePathItem,
  onChangeMotionRole,
  onChangeDurationWeight,
  onBlurDurationWeight,
  onChangeEffectCue,
  onChangeEffectCueTiming,
  onChangeShotStartFraming,
}: {
  selectedShot: CameraShot;
  focusRegions: FocusRegion[];
  selectedFocusRegionId: string;
  durationWeightDrafts: Record<string, string>;
  onSelectFocusRegion: (focusRegionId: string) => void;
  onAddPathItem: () => void;
  onMovePathItem: (pathItemId: string, direction: "up" | "down") => void;
  onRemovePathItem: (pathItemId: string) => void;
  onChangeMotionRole: (
    pathItemId: string,
    motionRole: ActiveShotAttentionMotionRole | "",
  ) => void;
  onChangeDurationWeight: (pathItemId: string, value: string) => void;
  onBlurDurationWeight: (pathItemId: string) => void;
  onChangeEffectCue: (
    pathItemId: string,
    effectName: keyof ShotAttentionEffectCues,
    cueMode: ShotEffectCueMode | "",
  ) => void;
  onChangeEffectCueTiming: (
    pathItemId: string,
    effectCueTiming: ShotEffectCueTiming,
  ) => void;
  onChangeShotStartFraming: (shotStartFraming: ShotStartFraming) => void;
}) {
  const orderedPath = getOrderedAttentionPath(selectedShot.attentionPath ?? []);
  const firstPathItem = orderedPath[0];
  const firstMotionRole = getActiveMotionRoleValue(firstPathItem?.motionRole);
  const canStartAtFirstFocus =
    firstMotionRole === "track" || firstMotionRole === "pushOut";
  const shotStartFraming = canStartAtFirstFocus
    ? selectedShot.shotStartFraming ?? "establishShot"
    : "establishShot";
  const pathFocusRegionIds = new Set(
    orderedPath.map((pathItem) => pathItem.focusRegionId),
  );
  const availableFocusRegions = focusRegions.filter(
    (focusRegion) => !pathFocusRegionIds.has(focusRegion.id),
  );

  return (
    <section className="attention-path-section" aria-label="Shot Attention Path">
      <div className="inspector-subheading">
        <span>Shot Attention Path</span>
        <p>
          Ordered camera-anchor route through page-level focus regions inside
          this shot.
        </p>
      </div>

      <label className="field">
        <span>Shot Starts At</span>
        <select
          value={shotStartFraming}
          disabled={!canStartAtFirstFocus}
          onChange={(event) =>
            onChangeShotStartFraming(event.target.value as ShotStartFraming)
          }
        >
          <option value="establishShot">Shot frame</option>
          <option value="firstFocus">First focus</option>
        </select>
      </label>
      <p className="inspector-note">
        First focus start is available when the first attention role is Track or
        Push Out.
      </p>

      <div className="attention-path-add-row">
        <label className="field attention-path-picker">
          <span>Add Focus Region</span>
          <select
            value={selectedFocusRegionId}
            disabled={availableFocusRegions.length === 0}
            onChange={(event) => onSelectFocusRegion(event.target.value)}
          >
            <option value="">
              {availableFocusRegions.length === 0
                ? "No available focus regions"
                : "Choose a focus region"}
            </option>
            {availableFocusRegions.map((focusRegion) => (
              <option key={focusRegion.id} value={focusRegion.id}>
                {formatFocusRegionOption(focusRegion)}
              </option>
            ))}
          </select>
        </label>
        <button
          className="secondary-action"
          type="button"
          disabled={!selectedFocusRegionId}
          onClick={onAddPathItem}
        >
          Add
        </button>
      </div>

      {orderedPath.length > 0 ? (
        <ol className="attention-path-list">
          {orderedPath.map((pathItem, index) => {
            const focusRegion = focusRegions.find(
              (region) => region.id === pathItem.focusRegionId,
            );

            return (
              <li className="attention-path-item" key={pathItem.id}>
                <div className="attention-path-item-main">
                  <div className="attention-path-item-title">
                    <strong>
                      {focusRegion?.label ?? "Missing focus region"}
                    </strong>
                    <span>
                      {focusRegion
                        ? `${focusRegion.kind} | ${focusRegion.id}`
                        : pathItem.focusRegionId}
                    </span>
                  </div>
                  <div className="attention-path-metadata-controls">
                    <label className="field attention-path-metadata-field">
                      <span>Motion Role</span>
                      <select
                        value={getActiveMotionRoleValue(pathItem.motionRole)}
                        onChange={(event) =>
                          onChangeMotionRole(
                            pathItem.id,
                            event.target
                              .value as ActiveShotAttentionMotionRole | "",
                          )
                        }
                      >
                        <option value="">Unset</option>
                        {SHOT_ATTENTION_MOTION_ROLES.map((motionRole) => (
                          <option key={motionRole} value={motionRole}>
                            {SHOT_ATTENTION_MOTION_ROLE_LABELS[motionRole]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field attention-path-metadata-field">
                      <span>Duration Weight</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={durationWeightDrafts[pathItem.id] ?? ""}
                        placeholder="Unset"
                        onChange={(event) =>
                          onChangeDurationWeight(pathItem.id, event.target.value)
                        }
                        onBlur={() => onBlurDurationWeight(pathItem.id)}
                      />
                    </label>
                    <label className="field attention-path-metadata-field">
                      <span>Shake Cue</span>
                      <select
                        value={pathItem.effectCues?.shake ?? ""}
                        onChange={(event) =>
                          onChangeEffectCue(
                            pathItem.id,
                            "shake",
                            event.target.value as ShotEffectCueMode | "",
                          )
                        }
                      >
                        <option value="">Off</option>
                        {SHOT_EFFECT_CUE_MODES.map((cueMode) => (
                          <option key={cueMode} value={cueMode}>
                            {SHOT_EFFECT_CUE_LABELS[cueMode]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field attention-path-metadata-field">
                      <span>Impact Cue</span>
                      <select
                        value={pathItem.effectCues?.impactPulse ?? ""}
                        onChange={(event) =>
                          onChangeEffectCue(
                            pathItem.id,
                            "impactPulse",
                            event.target.value as ShotEffectCueMode | "",
                          )
                        }
                      >
                        <option value="">Off</option>
                        {SHOT_EFFECT_CUE_MODES.map((cueMode) => (
                          <option key={cueMode} value={cueMode}>
                            {SHOT_EFFECT_CUE_LABELS[cueMode]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field attention-path-metadata-field">
                      <span>Cue Timing</span>
                      <select
                        value={pathItem.effectCueTiming ?? "arrival"}
                        onChange={(event) =>
                          onChangeEffectCueTiming(
                            pathItem.id,
                            event.target.value as ShotEffectCueTiming,
                          )
                        }
                      >
                        {SHOT_EFFECT_CUE_TIMINGS.map((cueTiming) => (
                          <option key={cueTiming} value={cueTiming}>
                            {SHOT_EFFECT_CUE_TIMING_LABELS[cueTiming]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <small>
                    Browser preview and export use track, push-in, and push-out
                    as camera anchor grammar.
                  </small>
                </div>
                <div className="attention-path-actions">
                  <button
                    className="timeline-move-button"
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMovePathItem(pathItem.id, "up")}
                  >
                    Up
                  </button>
                  <button
                    className="timeline-move-button"
                    type="button"
                    disabled={index === orderedPath.length - 1}
                    onClick={() => onMovePathItem(pathItem.id, "down")}
                  >
                    Down
                  </button>
                  <button
                    className="timeline-move-button"
                    type="button"
                    onClick={() => onRemovePathItem(pathItem.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="inspector-note">
          No attention path items yet. Add existing page-level focus regions to
          define a manual order.
        </p>
      )}
    </section>
  );
}

function PurposeTimingSuggestionPanel({
  applyLabel,
  purpose,
  onApply,
}: {
  applyLabel: string;
  purpose: ReadingPurpose;
  onApply: (purpose: ReadingPurpose) => void;
}) {
  const timingSuggestion = PURPOSE_TIMING_SUGGESTIONS[purpose];

  return (
    <div className="readonly-field">
      <span>Timing suggestion</span>
      <strong>
        {formatDurationMs(timingSuggestion.durationMs)} |{" "}
        {ratioToPercentage(timingSuggestion.sceneHoldRatio)}% hold |{" "}
        {ratioToPercentage(timingSuggestion.focusAttentionRatio)}% focus
      </strong>
      <p className="inspector-note">{timingSuggestion.guidance}</p>
      <button
        className="secondary-action"
        type="button"
        onClick={() => onApply(purpose)}
      >
        {applyLabel}
      </button>
    </div>
  );
}

function formatPurpose(purpose: ReadingPurpose) {
  return purpose.charAt(0).toUpperCase() + purpose.slice(1);
}

function formatFocusRegionOption(focusRegion: FocusRegion) {
  return `${focusRegion.label} (${focusRegion.kind})`;
}

function formatDurationMs(durationMs: number) {
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function getShotEffectPreset(
  specialEffects: ShotSpecialEffects | undefined,
): ShotEffectPreset {
  const hasShake = specialEffects?.shake === true;
  const hasImpactPulse = specialEffects?.impactPulse === true;

  if (hasShake && hasImpactPulse) {
    return "shakeImpactPulse";
  }

  if (hasShake) {
    return "shake";
  }

  if (hasImpactPulse) {
    return "impactPulse";
  }

  return "none";
}

function createShotSpecialEffectsFromPreset(
  preset: ShotEffectPreset,
): ShotSpecialEffects | undefined {
  if (preset === "shake") {
    return { shake: true };
  }

  if (preset === "impactPulse") {
    return { impactPulse: true };
  }

  if (preset === "shakeImpactPulse") {
    return { shake: true, impactPulse: true };
  }

  return undefined;
}

function createUpdatedEffectCues(
  currentEffectCues: ShotAttentionEffectCues | undefined,
  effectName: keyof ShotAttentionEffectCues,
  cueMode: ShotEffectCueMode | undefined,
): ShotAttentionEffectCues | undefined {
  const nextEffectCues: ShotAttentionEffectCues = {
    ...currentEffectCues,
    [effectName]: cueMode,
  };

  return nextEffectCues.shake || nextEffectCues.impactPulse
    ? nextEffectCues
    : undefined;
}

function createAttentionPathItemId(shotId: string, focusRegionId: string) {
  return `attention-${shotId}-${focusRegionId}-${Date.now()}`;
}

function getOrderedAttentionPath(attentionPath: ShotAttentionPathItem[]) {
  return [...attentionPath].sort((first, second) => first.order - second.order);
}

function normalizeAttentionPathOrder(attentionPath: ShotAttentionPathItem[]) {
  return attentionPath.map((pathItem, index) => ({
    ...pathItem,
    order: index + 1,
  }));
}

function getActiveMotionRoleValue(
  motionRole: ShotAttentionMotionRole | undefined,
): ActiveShotAttentionMotionRole | "" {
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

  return "";
}

function parsePercentageRatio(value: string) {
  const percentage = Number(value);

  if (!Number.isFinite(percentage)) {
    return null;
  }

  return roundRatio(clamp(percentage, 0, 70) / 100);
}

function ratioToPercentage(ratio: number) {
  return Math.round(clamp(ratio, 0, MAX_HOLD_AND_FOCUS_RATIO) * 100);
}

function roundRatio(value: number) {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
