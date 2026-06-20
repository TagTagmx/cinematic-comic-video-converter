# AI Automation Architecture Plan

This document defines the next roadmap branch before any AI implementation. It is a planning document only. It does not add API support, AI runtime behavior, source types, provider configuration, or automatic project mutation.

## Core Principle

The manual editor remains the source of truth.

AI may draft suggestions, but accepted project data changes only when the user explicitly accepts or applies a suggestion. Users must be able to accept, edit, reject, or ignore AI output. Export uses only accepted project data: uploaded image, camera shots, focus regions, Shot Attention Paths, timing, background music, and SFX marker data already present in the project model.

The first implementation phase must not let AI directly mutate accepted camera shots, focus regions, paths, timing, background music, or SFX. AI output should live in temporary suggestion state until user review.

## Initial AI Scope

The first AI branch should be an AI Vision Analysis Spike, not full automatic video generation.

The AI analysis may eventually suggest:

- Camera shots / panel-like reading containers.
- Focus regions / attention targets.
- Reading order.
- Shot Attention Path candidates.
- Motion roles limited to the current active grammar: `track`, `pushIn`, and `pushOut`.
- Rough timing suggestions.
- Uncertainty notes and warnings.

The expected output is a draft authoring aid for a guided-view editor, not a finished video.

## Explicitly Out Of Scope For The First AI Phase

- No fully automatic final video generation.
- No automatic destructive panel cropping.
- No character animation.
- No dialogue/narration generation yet.
- No AI sound generation yet.
- No automatic SFX placement yet.
- No OCR/dialogue timing as the first implementation unless a later ticket explicitly opens it.
- No mutation of accepted camera shots, focus regions, paths, timing, background music, or SFX without user acceptance.

## Suggested Architecture

Keep AI automation separated from accepted project state:

1. AI provider / adapter layer
   - Owns provider-specific request/response handling.
   - Can later support real APIs, local mocks, or test fixtures.
   - Should keep image upload/privacy/cost concerns explicit.

2. AI response schema
   - Defines the expected structured draft response.
   - Must tolerate incomplete or malformed provider output.
   - Should not directly reuse accepted project types as mutable project state.

3. Validation / normalization layer
   - Converts raw AI output into safe temporary suggestions.
   - Clamps geometry to source image bounds.
   - Rejects unsupported motion roles.
   - Drops references to missing suggestions or missing accepted project records.
   - Attaches warnings when confidence is low or structure is incomplete.

4. Temporary suggestion state
   - Stores draft suggestions separate from accepted camera shots, focus regions, and paths.
   - Keeps suggestion IDs stable for review.
   - Preserves source metadata, confidence, and warnings.

5. Suggestion review UI
   - Lets the user inspect, accept, edit, reject, or ignore suggestions.
   - Should make uncertainty visible without forcing acceptance.
   - Should support partial acceptance, such as accepting camera shots while rejecting timing.

6. Accepted project state
   - Changes only through explicit user action.
   - Remains the only state used by preview, export, Project JSON, and archive save/load.

The first source implementation can use a mock AI response before real API integration. That allows UI/data-flow testing without API keys, network cost, provider latency, image-upload privacy risk, or provider availability problems.

## Suggested AI Response Shape

Conceptual TypeScript-style shape:

```ts
type AiVisionAnalysisDraft = {
  requestId: string;
  source: {
    provider: "mock" | "openai" | "other";
    model?: string;
    createdAt: string;
  };
  confidence: "low" | "medium" | "high";
  warnings: AiDraftWarning[];
  suggestedCameraShots: AiSuggestedCameraShot[];
  suggestedFocusRegions: AiSuggestedFocusRegion[];
  suggestedAttentionPaths: AiSuggestedAttentionPath[];
  suggestedTiming: AiSuggestedTiming[];
};

type AiDraftWarning = {
  code: string;
  message: string;
  targetId?: string;
};

type AiSuggestedCameraShot = {
  draftId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  readingOrder: number;
  confidence: "low" | "medium" | "high";
  reason?: string;
};

type AiSuggestedFocusRegion = {
  draftId: string;
  label: string;
  kind: "panel" | "speech" | "face" | "detail" | "action" | "other";
  sourceCameraShotDraftId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: "low" | "medium" | "high";
  reason?: string;
};

type AiSuggestedAttentionPath = {
  draftId: string;
  cameraShotDraftId: string;
  focusRegionDraftIds: string[];
  items: {
    focusRegionDraftId: string;
    order: number;
    motionRole?: "track" | "pushIn" | "pushOut";
    durationWeight?: number;
    confidence: "low" | "medium" | "high";
  }[];
  confidence: "low" | "medium" | "high";
  reason?: string;
};

type AiSuggestedTiming = {
  targetDraftId: string;
  targetType: "cameraShot" | "attentionPathItem";
  durationMs?: number;
  durationWeight?: number;
  confidence: "low" | "medium" | "high";
  reason?: string;
};
```

This is conceptual documentation, not an implementation requirement for source types. A later implementation ticket should define the exact runtime schema and validation behavior.

## Relationship To Existing Project Model

AI suggestions should map onto existing manual concepts:

- Camera Shots are flexible panel/scene reading containers over the full source page, not destructive output-ratio crops.
- Focus Regions are reusable page-level attention targets.
- Shot Attention Path is a per-shot ordered list of references to Focus Regions.
- `motionRole` is limited to the active grammar: `track`, `pushIn`, and `pushOut`.
- `durationWeight` can be suggested for Shot Attention Path items, but not automatically applied.
- Shot duration can be suggested, but not automatically applied.
- Export uses only accepted project data, so rejected or unreviewed AI suggestions must not affect video output.

## Future Phases

1. Phase 1: AI Automation Architecture Plan
   - Documentation-only planning.
   - Defines boundaries, response shape, and staged implementation.

2. Phase 2: AI Vision Analysis Mock UI / mock response display
   - Source implementation using mock data only.
   - Displays temporary suggestions without real API integration.
   - Tests review UX and validation flow.

3. Phase 3: Real AI Vision Analysis Spike
   - Introduces a real provider adapter behind the same architecture.
   - Measures quality, latency, cost, privacy, and JSON reliability.
   - Still keeps output temporary and suggestion-based.

4. Phase 4: AI Suggestion Review Integration
   - Lets users accept, edit, reject, or ignore AI suggestions.
   - Supports partial acceptance and safe normalization.
   - Accepted project state changes only through explicit user action.

5. Phase 5: AI Draft Guided View
   - Generates a draft guided-view structure from suggestions.
   - Still requires user review before accepted state changes.
   - Export continues to use accepted data only.

6. Phase 6: AI audio suggestions
   - May suggest high-level audio moments or SFX ideas.
   - Must not place SFX automatically unless a later ticket explicitly scopes reviewable audio suggestions.

7. Later: dialogue/narration and OCR-assisted timing
   - Can be opened after AI vision architecture and suggestion review are stable.
   - Should stay reviewable and user-controlled.

## Risks And Guardrails

- Image privacy/API upload concerns: user comic pages may be sensitive or copyrighted. Any real provider integration must make upload behavior explicit and avoid hidden network calls.
- Model hallucination / bad JSON: provider output may be invalid, incomplete, or overconfident. Validation must be strict and tolerant of failure.
- Unreliable panel detection: comic layouts vary widely, and the product must not treat AI panel guesses as destructive crops.
- Reading order uncertainty: manga/comics can use different reading directions, irregular layouts, splash panels, and overlapping artwork.
- Copyright-sensitive user content handling: the app should avoid storing or transmitting user content beyond explicit user action and documented provider behavior.
- Cost/latency: AI analysis may be slow or expensive, so mock mode and graceful cancellation/fallback matter.
- Browser-only app limitations: local browser state, file object URLs, memory limits, and lack of backend storage constrain how AI analysis can run.
- AI unavailable fallback: the app must remain fully usable as a manual editor when AI is unavailable, disabled, unauthenticated, slow, or wrong.

## Acceptance Criteria For The Planning Phase

- The plan keeps manual project data as the source of truth.
- The plan defines suggestion-based AI output and explicit user acceptance.
- The plan does not claim real AI API support exists.
- The plan does not reopen old effect-first roadmap items.
- The plan does not make dialogue/narration or OCR-assisted timing the immediate next implementation.
- The plan identifies the next implementation ticket as AI Vision Analysis Mock UI / mock response display.
