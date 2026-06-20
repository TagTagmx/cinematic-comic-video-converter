import type { CameraShot, FocusRegion, ProjectImageMetadata } from "./projectTypes";
import type { DirectorRulebookAcceptedContext } from "./directorRulebook";

export type AiPageUnderstandingConfidence =
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type AiPageUnderstandingGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AiPageUnderstandingGeometrySpace =
  | "analyzedImage"
  | "sourceImage";

export type AiPageUnderstandingRegion = {
  id: string;
  label: string;
  kind:
    | "panel"
    | "character"
    | "face"
    | "speech"
    | "detail"
    | "action"
    | "establishing"
    | "background"
    | "other";
  geometry: AiPageUnderstandingGeometry;
  rawGeometry: AiPageUnderstandingGeometry;
  geometrySpace: AiPageUnderstandingGeometrySpace;
  analyzedGeometry?: AiPageUnderstandingGeometry;
  sourceGeometry?: AiPageUnderstandingGeometry;
  panelId?: string;
  confidence: AiPageUnderstandingConfidence;
  description: string;
  warnings: string[];
};

export type AiPageUnderstandingAnalysis = {
  schemaName: "comicPageUnderstanding";
  schemaVersion: 1;
  pageSummary: string;
  mood: {
    label: string;
    confidence: AiPageUnderstandingConfidence;
    reason: string;
  };
  readingOrder: string[];
  panels: AiPageUnderstandingRegion[];
  characterRegions: AiPageUnderstandingRegion[];
  speechRegions: AiPageUnderstandingRegion[];
  detailRegions: AiPageUnderstandingRegion[];
  actionRegions: AiPageUnderstandingRegion[];
  warnings: string[];
};

export type AiProviderUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
};

export type AiDirectorSuggestionMotion = "track" | "pushIn" | "pushOut";
export type AiDirectorSuggestionTiming = "slow" | "medium" | "fast";

export type AiDirectorSuggestionCard = {
  id: string;
  targetPanelId: string;
  targetPanelLabel: string;
  panelSummary: string;
  moodMotionInterpretation: string;
  suggestedCameraMotion: AiDirectorSuggestionMotion;
  suggestedAttentionPath: string;
  referencedRegionIds: string[];
  suggestedSpeedTiming: AiDirectorSuggestionTiming;
  sfxBgmNote?: string;
  confidence: AiPageUnderstandingConfidence;
  reason: string;
  warning?: string;
};

export type AiDirectorSuggestionsResult = {
  id: string;
  source: "openai";
  providerModel: string;
  createdAt: string;
  pageUnderstandingId: string;
  suggestions: AiDirectorSuggestionCard[];
  providerError?: string;
  validationWarnings?: string[];
  usage?: AiProviderUsage;
};

export type AiPageUnderstandingResult = {
  id: string;
  source: "openai";
  providerModel: string;
  createdAt: string;
  image: ProjectImageMetadata & {
    analyzedWidth: number;
    analyzedHeight: number;
  };
  analysis: AiPageUnderstandingAnalysis | null;
  providerError?: string;
  validationWarnings?: string[];
  isStale?: boolean;
  usage?: AiProviderUsage;
};

export type AnalyzePageRequest = {
  image: ProjectImageMetadata;
  compressedImageDataUrl: string;
  compressedImageWidth: number;
  compressedImageHeight: number;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
};

export type GenerateAiDirectorSuggestionsRequest = {
  pageUnderstanding: AiPageUnderstandingResult;
  acceptedContext?: DirectorRulebookAcceptedContext;
};

const AI_CONFIDENCE_VALUES: AiPageUnderstandingConfidence[] = [
  "high",
  "medium",
  "low",
  "unknown",
];

const AI_DIRECTOR_MOTION_VALUES: AiDirectorSuggestionMotion[] = [
  "track",
  "pushIn",
  "pushOut",
];
const AI_DIRECTOR_TIMING_VALUES: AiDirectorSuggestionTiming[] = [
  "slow",
  "medium",
  "fast",
];
const AI_REGION_KIND_VALUES: AiPageUnderstandingRegion["kind"][] = [
  "panel",
  "character",
  "face",
  "speech",
  "detail",
  "action",
  "establishing",
  "background",
  "other",
];

const MAX_PROVIDER_REGIONS_PER_GROUP = 24;
const MAX_PROVIDER_WARNINGS = 30;
const MAX_DIRECTOR_SUGGESTION_CARDS = 16;

type NormalizedAiGeometry = {
  rawGeometry: AiPageUnderstandingGeometry;
  sourceGeometry: AiPageUnderstandingGeometry;
  analyzedGeometry: AiPageUnderstandingGeometry;
};

export function normalizeAiPageUnderstandingResult(
  value: unknown,
  expectedImage: ProjectImageMetadata,
): AiPageUnderstandingResult {
  const warnings: string[] = [];

  if (!isPlainRecord(value)) {
    return createInvalidAiPageUnderstandingResult(
      "Provider response was not a JSON object.",
      expectedImage,
    );
  }

  const providerModel = asNonEmptyString(value.providerModel, "OpenAI");
  const createdAt = asNonEmptyString(value.createdAt, new Date().toISOString());
  const responseImage = normalizeResultImage(value.image, expectedImage, warnings);
  const isStale = !imageMetadataMatches(responseImage, expectedImage);
  const analysis = normalizeAnalysis(value.analysis, responseImage, warnings);
  const providerError = asOptionalString(value.providerError);

  if (isStale) {
    warnings.unshift(
      "This AI analysis was returned for different image metadata and may be stale.",
    );
  }

  if (!analysis && !providerError) {
    warnings.push("Provider response did not include usable page analysis.");
  }

  return {
    id: asNonEmptyString(value.id, `ai-page-${Date.now()}`),
    source: "openai",
    providerModel,
    createdAt,
    image: responseImage,
    analysis,
    providerError,
    validationWarnings: uniqueWarnings(warnings),
    isStale,
    usage: normalizeUsage(value.usage),
  };
}

export function normalizeAiDirectorSuggestionsResult(
  value: unknown,
  pageUnderstanding: AiPageUnderstandingResult,
): AiDirectorSuggestionsResult {
  const warnings: string[] = [];

  if (!isPlainRecord(value)) {
    return createInvalidAiDirectorSuggestionsResult(
      "Provider response was not a JSON object.",
      pageUnderstanding,
    );
  }

  const providerModel = asNonEmptyString(
    value.providerModel,
    pageUnderstanding.providerModel,
  );
  const createdAt = asNonEmptyString(value.createdAt, new Date().toISOString());
  const pageUnderstandingId = asNonEmptyString(
    value.pageUnderstandingId,
    pageUnderstanding.id,
  );

  if (pageUnderstandingId !== pageUnderstanding.id) {
    warnings.push(
      "Director suggestions were returned for a different page-understanding result and may be stale.",
    );
  }

  const suggestions = normalizeDirectorSuggestionCards(
    value.suggestions,
    pageUnderstanding,
    warnings,
  );
  const providerError = asOptionalString(value.providerError);

  if (suggestions.length === 0 && !providerError) {
    warnings.push("Provider response did not include usable director suggestions.");
  }

  return {
    id: asNonEmptyString(value.id, `ai-director-${Date.now()}`),
    source: "openai",
    providerModel,
    createdAt,
    pageUnderstandingId,
    suggestions,
    providerError,
    validationWarnings: uniqueWarnings(warnings),
    usage: normalizeUsage(value.usage),
  };
}

function createInvalidAiDirectorSuggestionsResult(
  reason: string,
  pageUnderstanding: AiPageUnderstandingResult,
): AiDirectorSuggestionsResult {
  return {
    id: `ai-director-invalid-${Date.now()}`,
    source: "openai",
    providerModel: pageUnderstanding.providerModel,
    createdAt: new Date().toISOString(),
    pageUnderstandingId: pageUnderstanding.id,
    suggestions: [],
    providerError: reason,
    validationWarnings: [reason],
  };
}

function normalizeDirectorSuggestionCards(
  value: unknown,
  pageUnderstanding: AiPageUnderstandingResult,
  warnings: string[],
) {
  if (!Array.isArray(value)) {
    warnings.push("Provider response did not include suggestions as a list.");
    return [];
  }

  const panels = pageUnderstanding.analysis?.panels ?? [];
  const regions = pageUnderstanding.analysis
    ? [
        ...pageUnderstanding.analysis.panels,
        ...pageUnderstanding.analysis.characterRegions,
        ...pageUnderstanding.analysis.speechRegions,
        ...pageUnderstanding.analysis.detailRegions,
        ...pageUnderstanding.analysis.actionRegions,
      ]
    : [];

  return value
    .slice(0, MAX_DIRECTOR_SUGGESTION_CARDS)
    .map((item, index) =>
      normalizeDirectorSuggestionCard(
        `director-suggestion-${index + 1}`,
        item,
        panels,
        regions,
        warnings,
      ),
    )
    .filter((item): item is AiDirectorSuggestionCard => item !== null);
}

function normalizeDirectorSuggestionCard(
  fallbackId: string,
  value: unknown,
  panels: AiPageUnderstandingRegion[],
  regions: AiPageUnderstandingRegion[],
  warnings: string[],
): AiDirectorSuggestionCard | null {
  if (!isPlainRecord(value)) {
    warnings.push(`Skipped malformed director suggestion ${fallbackId}.`);
    return null;
  }

  const targetPanelId = asNonEmptyString(value.targetPanelId, "");
  const panel = panels.find((item) => item.id === targetPanelId);

  if (!targetPanelId || !panel) {
    warnings.push(
      `Director suggestion ${fallbackId} targeted a missing AI panel id.`,
    );
    return null;
  }

  const referencedRegionIds = normalizeStringArray(value.referencedRegionIds).filter(
    (regionId) => regions.some((region) => region.id === regionId),
  );
  const droppedReferenceCount =
    normalizeStringArray(value.referencedRegionIds).length - referencedRegionIds.length;

  if (droppedReferenceCount > 0) {
    warnings.push(
      `Director suggestion ${fallbackId} referenced missing AI region ids.`,
    );
  }

  return {
    id: asNonEmptyString(value.id, fallbackId),
    targetPanelId,
    targetPanelLabel: asNonEmptyString(value.targetPanelLabel, panel.label),
    panelSummary: asNonEmptyString(
      value.panelSummary,
      "Provider did not return a panel summary.",
    ),
    moodMotionInterpretation: asNonEmptyString(
      value.moodMotionInterpretation,
      "Provider did not return a mood or motion interpretation.",
    ),
    suggestedCameraMotion: normalizeDirectorMotion(
      value.suggestedCameraMotion,
      warnings,
    ),
    suggestedAttentionPath: asNonEmptyString(
      value.suggestedAttentionPath,
      "Provider did not return an attention-path description.",
    ),
    referencedRegionIds,
    suggestedSpeedTiming: normalizeDirectorTiming(
      value.suggestedSpeedTiming,
      warnings,
    ),
    sfxBgmNote: asOptionalString(value.sfxBgmNote),
    confidence: normalizeConfidence(value.confidence, warnings),
    reason: asNonEmptyString(value.reason, "Provider did not return a reason."),
    warning: asOptionalString(value.warning),
  };
}

function createInvalidAiPageUnderstandingResult(
  reason: string,
  expectedImage: ProjectImageMetadata,
): AiPageUnderstandingResult {
  return {
    id: `ai-page-invalid-${Date.now()}`,
    source: "openai",
    providerModel: "OpenAI",
    createdAt: new Date().toISOString(),
    image: {
      ...expectedImage,
      analyzedWidth: expectedImage.width,
      analyzedHeight: expectedImage.height,
    },
    analysis: null,
    providerError: reason,
    validationWarnings: [reason],
  };
}

function normalizeResultImage(
  value: unknown,
  expectedImage: ProjectImageMetadata,
  warnings: string[],
): AiPageUnderstandingResult["image"] {
  if (!isPlainRecord(value)) {
    warnings.push("Provider response was missing image metadata.");
    return {
      ...expectedImage,
      analyzedWidth: expectedImage.width,
      analyzedHeight: expectedImage.height,
    };
  }

  const width = asPositiveNumber(value.width, expectedImage.width);
  const height = asPositiveNumber(value.height, expectedImage.height);

  return {
    fileName: asNonEmptyString(value.fileName, expectedImage.fileName),
    width,
    height,
    mimeType: asNonEmptyString(value.mimeType, expectedImage.mimeType),
    analyzedWidth: asPositiveNumber(value.analyzedWidth, width),
    analyzedHeight: asPositiveNumber(value.analyzedHeight, height),
  };
}

function normalizeAnalysis(
  value: unknown,
  image: AiPageUnderstandingResult["image"],
  warnings: string[],
): AiPageUnderstandingAnalysis | null {
  if (!isPlainRecord(value)) {
    return null;
  }

  if (value.schemaName !== "comicPageUnderstanding") {
    warnings.push("Provider response used an unsupported analysis schema.");
  }

  if (value.schemaVersion !== 1) {
    warnings.push("Provider response used an unsupported analysis schema version.");
  }

  const mood = isPlainRecord(value.mood) ? value.mood : {};
  const analysisWarnings = normalizeStringArray(value.warnings).slice(
    0,
    MAX_PROVIDER_WARNINGS,
  );

  return {
    schemaName: "comicPageUnderstanding",
    schemaVersion: 1,
    pageSummary: asNonEmptyString(
      value.pageSummary,
      "Provider did not return a page summary.",
    ),
    mood: {
      label: asNonEmptyString(mood.label, "unknown"),
      confidence: normalizeConfidence(mood.confidence, warnings),
      reason: asNonEmptyString(
        mood.reason,
        "Provider did not return a mood reason.",
      ),
    },
    readingOrder: normalizeStringArray(value.readingOrder).slice(0, 30),
    panels: normalizeRegionGroup(
      "panels",
      value.panels,
      image,
      warnings,
    ),
    characterRegions: normalizeRegionGroup(
      "characterRegions",
      value.characterRegions,
      image,
      warnings,
    ),
    speechRegions: normalizeRegionGroup(
      "speechRegions",
      value.speechRegions,
      image,
      warnings,
    ),
    detailRegions: normalizeRegionGroup(
      "detailRegions",
      value.detailRegions,
      image,
      warnings,
    ),
    actionRegions: normalizeRegionGroup(
      "actionRegions",
      value.actionRegions,
      image,
      warnings,
    ),
    warnings: uniqueWarnings(analysisWarnings),
  };
}

function normalizeRegionGroup(
  groupName: string,
  value: unknown,
  image: AiPageUnderstandingResult["image"],
  warnings: string[],
) {
  if (!Array.isArray(value)) {
    warnings.push(`Provider response did not include ${groupName} as a list.`);
    return [];
  }

  return value
    .slice(0, MAX_PROVIDER_REGIONS_PER_GROUP)
    .map((item, index) =>
      normalizeRegion(
        `${groupName}-${index + 1}`,
        item,
        image,
        warnings,
      ),
    )
    .filter((region): region is AiPageUnderstandingRegion => region !== null);
}

function normalizeRegion(
  fallbackId: string,
  value: unknown,
  image: AiPageUnderstandingResult["image"],
  warnings: string[],
): AiPageUnderstandingRegion | null {
  if (!isPlainRecord(value)) {
    warnings.push(`Skipped malformed provider region ${fallbackId}.`);
    return null;
  }

  const geometrySpace = normalizeGeometrySpace(
    fallbackId,
    value.geometrySpace,
    warnings,
  );
  const geometry = normalizeGeometry(
    fallbackId,
    value.geometry,
    image,
    warnings,
    geometrySpace,
  );

  if (!geometry) {
    return null;
  }

  const rawKind = value.kind;
  const kind = AI_REGION_KIND_VALUES.includes(
    rawKind as AiPageUnderstandingRegion["kind"],
  )
    ? (rawKind as AiPageUnderstandingRegion["kind"])
    : "other";

  if (kind === "other" && rawKind !== "other") {
    warnings.push(`Provider region ${fallbackId} used an unsupported kind.`);
  }

  return {
    id: asNonEmptyString(value.id, fallbackId),
    label: asNonEmptyString(value.label, fallbackId),
    kind,
    geometry: geometry.sourceGeometry,
    rawGeometry: geometry.rawGeometry,
    geometrySpace,
    analyzedGeometry: geometry.analyzedGeometry,
    sourceGeometry: geometry.sourceGeometry,
    panelId: asOptionalString(value.panelId),
    confidence: normalizeConfidence(value.confidence, warnings),
    description: asNonEmptyString(
      value.description,
      "Provider did not return a description for this card.",
    ),
    warnings: normalizeStringArray(value.warnings),
  };
}

function normalizeGeometry(
  fallbackId: string,
  value: unknown,
  image: AiPageUnderstandingResult["image"],
  warnings: string[],
  geometrySpace: AiPageUnderstandingGeometrySpace,
): NormalizedAiGeometry | null {
  if (!isPlainRecord(value)) {
    warnings.push(`Skipped ${fallbackId}: missing geometry.`);
    return null;
  }

  const x = asFiniteNumber(value.x);
  const y = asFiniteNumber(value.y);
  const width = asFiniteNumber(value.width);
  const height = asFiniteNumber(value.height);

  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    warnings.push(`Skipped ${fallbackId}: geometry was malformed.`);
    return null;
  }

  if (width <= 0 || height <= 0) {
    warnings.push(`Skipped ${fallbackId}: geometry had no visible area.`);
    return null;
  }

  const scaleX = image.width / Math.max(1, image.analyzedWidth);
  const scaleY = image.height / Math.max(1, image.analyzedHeight);
  const sourceX = geometrySpace === "analyzedImage" ? x * scaleX : x;
  const sourceY = geometrySpace === "analyzedImage" ? y * scaleY : y;
  const sourceWidth = geometrySpace === "analyzedImage" ? width * scaleX : width;
  const sourceHeight =
    geometrySpace === "analyzedImage" ? height * scaleY : height;
  const analyzedX = geometrySpace === "sourceImage" ? x / scaleX : x;
  const analyzedY = geometrySpace === "sourceImage" ? y / scaleY : y;
  const analyzedWidth = geometrySpace === "sourceImage" ? width / scaleX : width;
  const analyzedHeight =
    geometrySpace === "sourceImage" ? height / scaleY : height;
  const clampedX = clampNumber(sourceX, 0, image.width);
  const clampedY = clampNumber(sourceY, 0, image.height);
  const clampedRight = clampNumber(sourceX + sourceWidth, 0, image.width);
  const clampedBottom = clampNumber(sourceY + sourceHeight, 0, image.height);
  const clampedWidth = Math.max(0, clampedRight - clampedX);
  const clampedHeight = Math.max(0, clampedBottom - clampedY);
  const clampedAnalyzedX = clampNumber(analyzedX, 0, image.analyzedWidth);
  const clampedAnalyzedY = clampNumber(analyzedY, 0, image.analyzedHeight);
  const clampedAnalyzedRight = clampNumber(
    analyzedX + analyzedWidth,
    0,
    image.analyzedWidth,
  );
  const clampedAnalyzedBottom = clampNumber(
    analyzedY + analyzedHeight,
    0,
    image.analyzedHeight,
  );
  const clampedAnalyzedWidth = Math.max(
    0,
    clampedAnalyzedRight - clampedAnalyzedX,
  );
  const clampedAnalyzedHeight = Math.max(
    0,
    clampedAnalyzedBottom - clampedAnalyzedY,
  );

  if (clampedWidth <= 0 || clampedHeight <= 0) {
    warnings.push(`Skipped ${fallbackId}: geometry was outside the source image.`);
    return null;
  }

  if (
    clampedX !== sourceX ||
    clampedY !== sourceY ||
    clampedWidth !== sourceWidth ||
    clampedHeight !== sourceHeight
  ) {
    warnings.push(`Clamped ${fallbackId}: geometry exceeded the source image.`);
  }

  return {
    rawGeometry: {
      x,
      y,
      width,
      height,
    },
    sourceGeometry: {
      x: Math.round(clampedX),
      y: Math.round(clampedY),
      width: Math.round(clampedWidth),
      height: Math.round(clampedHeight),
    },
    analyzedGeometry: {
      x: Math.round(clampedAnalyzedX),
      y: Math.round(clampedAnalyzedY),
      width: Math.round(clampedAnalyzedWidth),
      height: Math.round(clampedAnalyzedHeight),
    },
  };
}

function normalizeGeometrySpace(
  fallbackId: string,
  value: unknown,
  warnings: string[],
): AiPageUnderstandingGeometrySpace {
  if (value === "analyzedImage" || value === "sourceImage") {
    return value;
  }

  warnings.push(
    `Provider region ${fallbackId} omitted geometrySpace; treating geometry as analyzedImage coordinates.`,
  );
  return "analyzedImage";
}

function normalizeUsage(value: unknown): AiProviderUsage | undefined {
  if (!isPlainRecord(value)) {
    return undefined;
  }

  return {
    inputTokens: asOptionalFiniteNumber(value.inputTokens),
    outputTokens: asOptionalFiniteNumber(value.outputTokens),
    totalTokens: asOptionalFiniteNumber(value.totalTokens),
    estimatedCostUsd: asOptionalFiniteNumber(value.estimatedCostUsd),
  };
}

function normalizeConfidence(
  value: unknown,
  warnings: string[],
): AiPageUnderstandingConfidence {
  if (AI_CONFIDENCE_VALUES.includes(value as AiPageUnderstandingConfidence)) {
    return value as AiPageUnderstandingConfidence;
  }

  warnings.push("Provider returned unsupported confidence data.");
  return "unknown";
}

function normalizeDirectorMotion(
  value: unknown,
  warnings: string[],
): AiDirectorSuggestionMotion {
  if (AI_DIRECTOR_MOTION_VALUES.includes(value as AiDirectorSuggestionMotion)) {
    return value as AiDirectorSuggestionMotion;
  }

  warnings.push("Provider returned unsupported director camera motion.");
  return "track";
}

function normalizeDirectorTiming(
  value: unknown,
  warnings: string[],
): AiDirectorSuggestionTiming {
  if (AI_DIRECTOR_TIMING_VALUES.includes(value as AiDirectorSuggestionTiming)) {
    return value as AiDirectorSuggestionTiming;
  }

  warnings.push("Provider returned unsupported director speed/timing.");
  return "medium";
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function imageMetadataMatches(
  responseImage: AiPageUnderstandingResult["image"],
  expectedImage: ProjectImageMetadata,
) {
  return (
    responseImage.fileName === expectedImage.fileName &&
    responseImage.width === expectedImage.width &&
    responseImage.height === expectedImage.height &&
    responseImage.mimeType === expectedImage.mimeType
  );
}

function uniqueWarnings(warnings: string[]) {
  return [...new Set(warnings.filter((warning) => warning.trim() !== ""))];
}

function asNonEmptyString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function asFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asPositiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function asOptionalFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
