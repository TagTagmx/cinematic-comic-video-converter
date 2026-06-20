import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import {
  clampCameraShotToImage,
  resizeCameraShotFromBottomRight,
} from "../../lib/coordinateMath";
import type {
  CameraShot,
  FocusRegion,
  UploadedImage,
} from "../../lib/projectTypes";
import type { TemporarySuggestion } from "../../lib/suggestionTypes";

type PageViewerProps = {
  image: UploadedImage | null;
  shots: CameraShot[];
  focusRegions: FocusRegion[];
  suggestions: TemporarySuggestion[];
  aiPageHighlight: AiPageHighlight | null;
  selectedShotId: string | null;
  selectedFocusRegionId: string | null;
  onSelectShot: (shotId: string) => void;
  onSelectFocusRegion: (focusRegionId: string) => void;
  onChangeShot: (shot: CameraShot) => void;
  onAddFocusRegion: (focusRegion: FocusRegion) => void;
  onChangeFocusRegion: (focusRegion: FocusRegion) => void;
  onDeleteFocusRegion: (focusRegionId: string) => void;
  onAddShot: () => void;
};

export type AiPageHighlight = {
  id: string;
  label: string;
  kind: string;
  rawGeometry?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  geometrySpace?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  analyzedX?: number;
  analyzedY?: number;
  analyzedWidth?: number;
  analyzedHeight?: number;
  analyzedImageWidth?: number;
  analyzedImageHeight?: number;
  sourceImageWidth?: number;
  sourceImageHeight?: number;
};

type DragState = {
  pointerId: number;
  shotId: string;
  mode: "move" | "resize";
  offsetX: number;
  offsetY: number;
};

type DrawingState = {
  pointerId: number;
  mode: "focusRegion" | "detail";
  shotId?: string;
  startX: number;
  startY: number;
};

type FocusRegionDragState = {
  pointerId: number;
  focusRegionId: string;
  mode: "move" | "resize";
  offsetX: number;
  offsetY: number;
};

type SourceRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PanState = {
  pointerId: number;
  lastClientX: number;
  lastClientY: number;
};

const MIN_FOCUS_REGION_SIZE = 4;
const MIN_EDITABLE_FOCUS_REGION_SIZE = 12;
const MIN_VIEW_ZOOM = 0.5;
const MAX_VIEW_ZOOM = 4;
const VIEW_ZOOM_STEP = 0.25;

export function PageViewer({
  image,
  shots,
  focusRegions,
  suggestions,
  aiPageHighlight,
  selectedShotId,
  selectedFocusRegionId,
  onSelectShot,
  onSelectFocusRegion,
  onChangeShot,
  onAddFocusRegion,
  onChangeFocusRegion,
  onDeleteFocusRegion,
  onAddShot,
}: PageViewerProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const focusRegionDragStateRef = useRef<FocusRegionDragState | null>(null);
  const drawingStateRef = useRef<DrawingState | null>(null);
  const panStateRef = useRef<PanState | null>(null);
  const nextFocusRegionNumberRef = useRef(1);
  const [isFocusRegionDrawing, setIsFocusRegionDrawing] = useState(false);
  const [isDetailDrawing, setIsDetailDrawing] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [viewZoom, setViewZoom] = useState(1);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [drawingRect, setDrawingRect] = useState<SourceRect | null>(null);

  const selectedShot =
    shots.find((shot) => shot.id === selectedShotId) ?? null;
  const canDrawFocusRegion = Boolean(image && selectedShot);
  const canDrawDetail = Boolean(image);
  const selectedFocusRegion = focusRegions.find(
    (region) => region.id === selectedFocusRegionId,
  );

  useEffect(() => {
    if (!canDrawFocusRegion) {
      setIsFocusRegionDrawing(false);
    }
  }, [canDrawFocusRegion]);

  useEffect(() => {
    setDrawingRect(null);
    drawingStateRef.current = null;
    focusRegionDragStateRef.current = null;
    panStateRef.current = null;
    resetEditorView();
    setIsDetailDrawing(false);
    nextFocusRegionNumberRef.current = 1;
  }, [image]);

  useEffect(() => {
    setDrawingRect(null);
    drawingStateRef.current = null;

    if (
      selectedFocusRegionId &&
      !focusRegions.some((region) => region.id === selectedFocusRegionId)
    ) {
      if (selectedShot) {
        onSelectShot(selectedShot.id);
      }
    }
  }, [focusRegions, onSelectShot, selectedFocusRegionId, selectedShot]);

  function handleShotPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    shot: CameraShot,
  ) {
    if (!image || !stageRef.current || isFocusRegionDrawing || isDetailDrawing) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectShot(shot.id);

    const sourcePoint = getSourcePointFromEvent(event, image);

    dragStateRef.current = {
      pointerId: event.pointerId,
      shotId: shot.id,
      mode: "move",
      offsetX: sourcePoint.x - shot.x,
      offsetY: sourcePoint.y - shot.y,
    };
  }

  function handleShotPointerMove(
    event: PointerEvent<HTMLButtonElement>,
    shot: CameraShot,
  ) {
    if (
      !image ||
      !stageRef.current ||
      isFocusRegionDrawing ||
      isDetailDrawing ||
      dragStateRef.current?.pointerId !== event.pointerId ||
      dragStateRef.current.shotId !== shot.id ||
      dragStateRef.current.mode !== "move"
    ) {
      return;
    }

    event.preventDefault();

    const sourcePoint = getSourcePointFromEvent(event, image);

    onChangeShot(
      clampCameraShotToImage(
        {
          ...shot,
          x: sourcePoint.x - dragStateRef.current.offsetX,
          y: sourcePoint.y - dragStateRef.current.offsetY,
        },
        image,
      ),
    );
  }

  function handleResizePointerDown(
    event: PointerEvent<HTMLSpanElement>,
    shot: CameraShot,
  ) {
    if (!image || !stageRef.current || isFocusRegionDrawing || isDetailDrawing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectShot(shot.id);

    dragStateRef.current = {
      pointerId: event.pointerId,
      shotId: shot.id,
      mode: "resize",
      offsetX: 0,
      offsetY: 0,
    };
  }

  function handleResizePointerMove(
    event: PointerEvent<HTMLSpanElement>,
    shot: CameraShot,
  ) {
    if (
      !image ||
      !stageRef.current ||
      isFocusRegionDrawing ||
      isDetailDrawing ||
      dragStateRef.current?.pointerId !== event.pointerId ||
      dragStateRef.current.shotId !== shot.id ||
      dragStateRef.current.mode !== "resize"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sourcePoint = getSourcePointFromEvent(event, image);

    onChangeShot(
      resizeCameraShotFromBottomRight(shot, image, sourcePoint.x, sourcePoint.y),
    );
  }

  function handleResizePointerEnd(event: PointerEvent<HTMLSpanElement>) {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    event.stopPropagation();
    dragStateRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleShotPointerEnd(event: PointerEvent<HTMLButtonElement>) {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleFocusRegionPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    region: FocusRegion,
  ) {
    if (!image || !stageRef.current || isFocusRegionDrawing || isDetailDrawing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectFocusRegion(region.id);

    const sourcePoint = getSourcePointFromEvent(event, image);

    focusRegionDragStateRef.current = {
      pointerId: event.pointerId,
      focusRegionId: region.id,
      mode: "move",
      offsetX: sourcePoint.x - region.x,
      offsetY: sourcePoint.y - region.y,
    };
  }

  function handleFocusRegionPointerMove(
    event: PointerEvent<HTMLButtonElement>,
    region: FocusRegion,
  ) {
    if (
      !image ||
      !stageRef.current ||
      isFocusRegionDrawing ||
      isDetailDrawing ||
      focusRegionDragStateRef.current?.pointerId !== event.pointerId ||
      focusRegionDragStateRef.current.focusRegionId !== region.id ||
      focusRegionDragStateRef.current.mode !== "move"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sourcePoint = getSourcePointFromEvent(event, image);

    onChangeFocusRegion(
      clampFocusRegionToImage(
        {
          ...region,
          x: sourcePoint.x - focusRegionDragStateRef.current.offsetX,
          y: sourcePoint.y - focusRegionDragStateRef.current.offsetY,
        },
        image,
      ),
    );
  }

  function handleFocusRegionResizePointerDown(
    event: PointerEvent<HTMLSpanElement>,
    region: FocusRegion,
  ) {
    if (!image || !stageRef.current || isFocusRegionDrawing || isDetailDrawing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectFocusRegion(region.id);

    focusRegionDragStateRef.current = {
      pointerId: event.pointerId,
      focusRegionId: region.id,
      mode: "resize",
      offsetX: 0,
      offsetY: 0,
    };
  }

  function handleFocusRegionResizePointerMove(
    event: PointerEvent<HTMLSpanElement>,
    region: FocusRegion,
  ) {
    if (
      !image ||
      !stageRef.current ||
      isFocusRegionDrawing ||
      isDetailDrawing ||
      focusRegionDragStateRef.current?.pointerId !== event.pointerId ||
      focusRegionDragStateRef.current.focusRegionId !== region.id ||
      focusRegionDragStateRef.current.mode !== "resize"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sourcePoint = getSourcePointFromEvent(event, image);

    onChangeFocusRegion(
      resizeFocusRegionFromBottomRight(region, image, sourcePoint.x, sourcePoint.y),
    );
  }

  function handleFocusRegionPointerEnd(event: PointerEvent<HTMLElement>) {
    if (focusRegionDragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    event.stopPropagation();
    focusRegionDragStateRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleDeleteSelectedFocusRegion() {
    if (!selectedFocusRegionId) {
      return;
    }

    onDeleteFocusRegion(selectedFocusRegionId);
  }

  function handleStagePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (image && isPanMode && !isFocusRegionDrawing && !isDetailDrawing) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      panStateRef.current = {
        pointerId: event.pointerId,
        lastClientX: event.clientX,
        lastClientY: event.clientY,
      };
      return;
    }

    if (
      !image ||
      !stageRef.current ||
      (!isFocusRegionDrawing && !isDetailDrawing) ||
      (isFocusRegionDrawing && !selectedShot)
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const sourcePoint = clampSourcePoint(
      getSourcePointFromEvent(event, image),
      image,
    );

    drawingStateRef.current = {
      pointerId: event.pointerId,
      mode: isDetailDrawing ? "detail" : "focusRegion",
      shotId: selectedShot?.id,
      startX: sourcePoint.x,
      startY: sourcePoint.y,
    };
    setDrawingRect({
      x: sourcePoint.x,
      y: sourcePoint.y,
      width: 0,
      height: 0,
    });
  }

  function handleStagePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      isPanMode &&
      panStateRef.current?.pointerId === event.pointerId &&
      !isFocusRegionDrawing &&
      !isDetailDrawing
    ) {
      event.preventDefault();

      const deltaX = event.clientX - panStateRef.current.lastClientX;
      const deltaY = event.clientY - panStateRef.current.lastClientY;

      panStateRef.current = {
        pointerId: event.pointerId,
        lastClientX: event.clientX,
        lastClientY: event.clientY,
      };
      setViewOffset((offset) => ({
        x: offset.x + deltaX,
        y: offset.y + deltaY,
      }));
      return;
    }

    if (
      !image ||
      !stageRef.current ||
      drawingStateRef.current?.pointerId !== event.pointerId ||
      (!isFocusRegionDrawing && !isDetailDrawing)
    ) {
      return;
    }

    event.preventDefault();

    const sourcePoint = clampSourcePoint(
      getSourcePointFromEvent(event, image),
      image,
    );

    setDrawingRect(
      createSourceRect(
        drawingStateRef.current.startX,
        drawingStateRef.current.startY,
        sourcePoint.x,
        sourcePoint.y,
      ),
    );
  }

  function handleStagePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (panStateRef.current?.pointerId === event.pointerId) {
      panStateRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      return;
    }

    const currentDrawingState = drawingStateRef.current;

    if (
      !image ||
      !stageRef.current ||
      !currentDrawingState ||
      currentDrawingState.pointerId !== event.pointerId ||
      (!isFocusRegionDrawing && !isDetailDrawing)
    ) {
      return;
    }

    const sourcePoint = clampSourcePoint(
      getSourcePointFromEvent(event, image),
      image,
    );
    const finalRect = createSourceRect(
      currentDrawingState.startX,
      currentDrawingState.startY,
      sourcePoint.x,
      sourcePoint.y,
    );

    drawingStateRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDrawingRect(null);

    const shot = currentDrawingState.shotId
      ? shots.find((item) => item.id === currentDrawingState.shotId)
      : null;

    if (
      (currentDrawingState.mode === "focusRegion" && !shot) ||
      !finalRect ||
      finalRect.width < MIN_FOCUS_REGION_SIZE ||
      finalRect.height < MIN_FOCUS_REGION_SIZE
    ) {
      return;
    }

    const focusRegionNumber = nextFocusRegionNumberRef.current;
    nextFocusRegionNumberRef.current += 1;

    const focusRegion: FocusRegion = {
      id: `focus-${focusRegionNumber}-${Date.now()}`,
      sourceShotId: shot?.id,
      label:
        currentDrawingState.mode === "detail"
          ? `Detail ${focusRegionNumber}`
          : `Focus ${focusRegionNumber}`,
      kind: currentDrawingState.mode === "detail" ? "detail" : "panel",
      effectType: currentDrawingState.mode === "detail" ? "none" : "lift",
      sequenceOrder: focusRegionNumber,
      x: finalRect.x,
      y: finalRect.y,
      width: finalRect.width,
      height: finalRect.height,
    };

    onAddFocusRegion(focusRegion);
    onSelectFocusRegion(focusRegion.id);
  }

  function getSourcePointFromEvent(
    event: PointerEvent<HTMLElement>,
    currentImage: UploadedImage,
  ) {
    if (!stageRef.current) {
      return { x: 0, y: 0 };
    }

    const displayRect = stageRef.current.getBoundingClientRect();

    return {
      x: ((event.clientX - displayRect.left) / displayRect.width) * currentImage.width,
      y:
        ((event.clientY - displayRect.top) / displayRect.height) *
        currentImage.height,
    };
  }

  function handleZoomIn() {
    setViewZoom((zoom) => clamp(zoom + VIEW_ZOOM_STEP, MIN_VIEW_ZOOM, MAX_VIEW_ZOOM));
  }

  function handleZoomOut() {
    setViewZoom((zoom) => clamp(zoom - VIEW_ZOOM_STEP, MIN_VIEW_ZOOM, MAX_VIEW_ZOOM));
  }

  function resetEditorView() {
    setViewZoom(1);
    setViewOffset({ x: 0, y: 0 });
    setIsPanMode(false);
    panStateRef.current = null;
  }

  function handleFocusRegionModeToggle() {
    setIsPanMode(false);
    setIsDetailDrawing(false);
    setIsFocusRegionDrawing((isDrawing) => !isDrawing);
  }

  function handleDetailModeToggle() {
    setIsPanMode(false);
    setIsFocusRegionDrawing(false);
    setDrawingRect(null);
    drawingStateRef.current = null;
    setIsDetailDrawing((isDrawing) => !isDrawing);
  }

  function handlePanModeToggle() {
    setIsFocusRegionDrawing(false);
    setIsDetailDrawing(false);
    setDrawingRect(null);
    drawingStateRef.current = null;
    setIsPanMode((isEnabled) => !isEnabled);
  }

  return (
    <section className="panel editor-panel">
      <div className="panel-heading panel-heading-row">
        <div>
          <span className="panel-kicker">Canvas</span>
          <h2>Editor canvas</h2>
        </div>
        <div className="editor-toolbar">
          <button
            className={
              isFocusRegionDrawing
                ? "secondary-action is-active"
                : "secondary-action"
            }
            type="button"
            disabled={!canDrawFocusRegion}
            aria-pressed={isFocusRegionDrawing}
            onClick={handleFocusRegionModeToggle}
          >
            Focus Region
          </button>
          <button
            className={isDetailDrawing ? "secondary-action is-active" : "secondary-action"}
            type="button"
            disabled={!canDrawDetail}
            aria-pressed={isDetailDrawing}
            onClick={handleDetailModeToggle}
          >
            Detail Highlight
          </button>
          <button
            className={isPanMode ? "secondary-action is-active" : "secondary-action"}
            type="button"
            disabled={!image}
            aria-pressed={isPanMode}
            onClick={handlePanModeToggle}
          >
            Pan
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={!image || viewZoom >= MAX_VIEW_ZOOM}
            onClick={handleZoomIn}
          >
            Zoom In
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={!image || viewZoom <= MIN_VIEW_ZOOM}
            onClick={handleZoomOut}
          >
            Zoom Out
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={!image}
            onClick={resetEditorView}
          >
            Reset View
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={!selectedFocusRegion}
            onClick={handleDeleteSelectedFocusRegion}
          >
            Delete Focus
          </button>
          {image ? (
            <button
              className="secondary-action"
              type="button"
              onClick={onAddShot}
            >
              Add Shot
            </button>
          ) : null}
        </div>
      </div>

      <div className="page-viewer">
        {image ? (
          <div
            className={
              [
                "page-stage",
                isFocusRegionDrawing ? "is-focus-region-drawing" : "",
                isDetailDrawing ? "is-detail-drawing" : "",
                isPanMode ? "is-pan-mode" : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
            ref={stageRef}
            style={{
              transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${viewZoom})`,
            }}
            onPointerDown={handleStagePointerDown}
            onPointerMove={handleStagePointerMove}
            onPointerUp={handleStagePointerEnd}
            onPointerCancel={handleStagePointerEnd}
          >
            <img
              className="page-viewer-image"
              src={image.objectUrl}
              draggable={false}
              alt={`Uploaded comic page: ${image.fileName}`}
            />
            {shots.map((shot) => (
              <button
                key={shot.id}
                className={
                  shot.id === selectedShotId
                    ? "camera-shot-box is-selected"
                    : "camera-shot-box"
                }
                style={{
                  left: `${(shot.x / image.width) * 100}%`,
                  top: `${(shot.y / image.height) * 100}%`,
                  width: `${(shot.width / image.width) * 100}%`,
                  height: `${(shot.height / image.height) * 100}%`,
                  zIndex: shot.id === selectedShotId ? 2 : 1,
                }}
                type="button"
                aria-label={`Select ${shot.label}`}
                onClick={() => onSelectShot(shot.id)}
                onPointerDown={(event) => handleShotPointerDown(event, shot)}
                onPointerMove={(event) => handleShotPointerMove(event, shot)}
                onPointerUp={handleShotPointerEnd}
                onPointerCancel={handleShotPointerEnd}
              >
                <span className="camera-shot-label">{shot.label}</span>
                {shot.id === selectedShotId ? (
                  <span
                    className="camera-resize-handle"
                    aria-hidden="true"
                    onPointerDown={(event) => handleResizePointerDown(event, shot)}
                    onPointerMove={(event) => handleResizePointerMove(event, shot)}
                    onPointerUp={handleResizePointerEnd}
                    onPointerCancel={handleResizePointerEnd}
                  />
                ) : null}
              </button>
            ))}
            {focusRegions.map((region) => (
              <button
                key={region.id}
                className={
                  region.id === selectedFocusRegionId
                    ? "focus-region-box is-selected"
                    : "focus-region-box"
                }
                style={{
                  left: `${(region.x / image.width) * 100}%`,
                  top: `${(region.y / image.height) * 100}%`,
                  width: `${(region.width / image.width) * 100}%`,
                  height: `${(region.height / image.height) * 100}%`,
                }}
                type="button"
                aria-label={`Select ${region.label}`}
                onClick={() => onSelectFocusRegion(region.id)}
                onPointerDown={(event) =>
                  handleFocusRegionPointerDown(event, region)
                }
                onPointerMove={(event) =>
                  handleFocusRegionPointerMove(event, region)
                }
                onPointerUp={handleFocusRegionPointerEnd}
                onPointerCancel={handleFocusRegionPointerEnd}
              >
                <span className="focus-region-label">{region.kind}</span>
                {region.id === selectedFocusRegionId ? (
                  <span
                    className="focus-region-resize-handle"
                    aria-hidden="true"
                    onPointerDown={(event) =>
                      handleFocusRegionResizePointerDown(event, region)
                    }
                    onPointerMove={(event) =>
                      handleFocusRegionResizePointerMove(event, region)
                    }
                    onPointerUp={handleFocusRegionPointerEnd}
                    onPointerCancel={handleFocusRegionPointerEnd}
                  />
                ) : null}
              </button>
            ))}
            {suggestions.flatMap((suggestion) => {
              if (suggestion.type === "shotAttentionPath") {
                return [];
              }

              if (suggestion.type === "draftMotion") {
                const shotOverlay = suggestion.proposedValues.cameraShot;
                const focusOverlays = suggestion.proposedValues.focusRegions;

                return [
                  <div
                    key={`${suggestion.id}-shot`}
                    className="suggestion-overlay suggestion-overlay-shot"
                    style={{
                      left: `${(shotOverlay.x / image.width) * 100}%`,
                      top: `${(shotOverlay.y / image.height) * 100}%`,
                      width: `${(shotOverlay.width / image.width) * 100}%`,
                      height: `${(shotOverlay.height / image.height) * 100}%`,
                    }}
                    aria-hidden="true"
                  >
                    <span>{shotOverlay.label}</span>
                  </div>,
                  ...focusOverlays.map((focusOverlay) => (
                    <div
                      key={`${suggestion.id}-${focusOverlay.draftFocusRegionId}`}
                      className="suggestion-overlay suggestion-overlay-focus"
                      style={{
                        left: `${(focusOverlay.x / image.width) * 100}%`,
                        top: `${(focusOverlay.y / image.height) * 100}%`,
                        width: `${(focusOverlay.width / image.width) * 100}%`,
                        height: `${(focusOverlay.height / image.height) * 100}%`,
                      }}
                      aria-hidden="true"
                    >
                      <span>{focusOverlay.label}</span>
                    </div>
                  )),
                ];
              }

              return [
                <div
                  key={suggestion.id}
                  className={
                    suggestion.type === "cameraShot"
                      ? "suggestion-overlay suggestion-overlay-shot"
                      : "suggestion-overlay suggestion-overlay-focus"
                  }
                  style={{
                    left: `${(suggestion.proposedValues.x / image.width) * 100}%`,
                    top: `${(suggestion.proposedValues.y / image.height) * 100}%`,
                    width: `${
                      (suggestion.proposedValues.width / image.width) * 100
                    }%`,
                    height: `${
                      (suggestion.proposedValues.height / image.height) * 100
                    }%`,
                  }}
                  aria-hidden="true"
                >
                  <span>{suggestion.proposedValues.label}</span>
                </div>,
              ];
            })}
            {aiPageHighlight?.analyzedImageWidth &&
            aiPageHighlight.analyzedImageHeight &&
            aiPageHighlight.analyzedX !== undefined &&
            aiPageHighlight.analyzedY !== undefined &&
            aiPageHighlight.analyzedWidth !== undefined &&
            aiPageHighlight.analyzedHeight !== undefined ? (
              <svg
                className="ai-page-understanding-overlay"
                viewBox={`0 0 ${aiPageHighlight.analyzedImageWidth} ${aiPageHighlight.analyzedImageHeight}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  className="ai-page-understanding-overlay-rect"
                  x={aiPageHighlight.analyzedX}
                  y={aiPageHighlight.analyzedY}
                  width={aiPageHighlight.analyzedWidth}
                  height={aiPageHighlight.analyzedHeight}
                  rx="4"
                  ry="4"
                />
              </svg>
            ) : aiPageHighlight ? (
              <div
                className="ai-page-understanding-highlight"
                style={{
                  left: `${(aiPageHighlight.x / image.width) * 100}%`,
                  top: `${(aiPageHighlight.y / image.height) * 100}%`,
                  width: `${(aiPageHighlight.width / image.width) * 100}%`,
                  height: `${(aiPageHighlight.height / image.height) * 100}%`,
                }}
                aria-hidden="true"
              >
                <span>
                  AI {aiPageHighlight.kind}: {aiPageHighlight.label}
                </span>
              </div>
            ) : null}
            {drawingRect ? (
              <div
                className="focus-region-box is-drawing"
                style={{
                  left: `${(drawingRect.x / image.width) * 100}%`,
                  top: `${(drawingRect.y / image.height) * 100}%`,
                  width: `${(drawingRect.width / image.width) * 100}%`,
                  height: `${(drawingRect.height / image.height) * 100}%`,
                }}
                aria-hidden="true"
              />
            ) : null}
          </div>
        ) : (
          <div className="page-viewer-empty">
            <div className="page-frame" aria-hidden="true">
              <div className="page-rule" />
              <div className="page-rule short" />
              <div className="page-rule" />
            </div>
            <p>No comic page loaded.</p>
            <span>Upload an image to display it here.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function clampSourcePoint(
  point: { x: number; y: number },
  image: UploadedImage,
) {
  return {
    x: clamp(Math.round(point.x), 0, image.width),
    y: clamp(Math.round(point.y), 0, image.height),
  };
}

function createSourceRect(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): SourceRect {
  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };
}

function clampFocusRegionToImage(
  focusRegion: FocusRegion,
  image: UploadedImage,
): FocusRegion {
  const width = clamp(
    Math.round(focusRegion.width),
    MIN_EDITABLE_FOCUS_REGION_SIZE,
    image.width,
  );
  const height = clamp(
    Math.round(focusRegion.height),
    MIN_EDITABLE_FOCUS_REGION_SIZE,
    image.height,
  );
  const maxX = Math.max(0, image.width - width);
  const maxY = Math.max(0, image.height - height);

  return {
    ...focusRegion,
    x: clamp(Math.round(focusRegion.x), 0, maxX),
    y: clamp(Math.round(focusRegion.y), 0, maxY),
    width,
    height,
  };
}

function resizeFocusRegionFromBottomRight(
  focusRegion: FocusRegion,
  image: UploadedImage,
  sourceX: number,
  sourceY: number,
): FocusRegion {
  const maxWidth = Math.max(1, image.width - focusRegion.x);
  const maxHeight = Math.max(1, image.height - focusRegion.y);
  const minimumWidth = Math.min(MIN_EDITABLE_FOCUS_REGION_SIZE, maxWidth);
  const minimumHeight = Math.min(MIN_EDITABLE_FOCUS_REGION_SIZE, maxHeight);

  return {
    ...focusRegion,
    width: clamp(Math.round(sourceX - focusRegion.x), minimumWidth, maxWidth),
    height: clamp(Math.round(sourceY - focusRegion.y), minimumHeight, maxHeight),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
