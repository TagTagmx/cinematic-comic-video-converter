# Temporary Suggestion State Model Plan

T0054 defines a TypeScript/data-shape plan for temporary in-memory suggestions. It does not implement source code, editor UI, Project JSON schema changes, import/export persistence, preview behavior, export behavior, OCR, AI, panel detection, dependencies, audio, or multi-page support.

## Model Boundary

Suggestions are temporary review data. They are not project data until the user explicitly accepts them.

The first implementation should keep suggestions in memory or local component/app state only. Project JSON should continue to persist accepted Camera Shots, page-level Focus Regions, Shot Attention Paths, timing fields, and purpose metadata. Suggestion data should not be included in Project JSON until a dedicated schema ticket explicitly scopes persisted suggestions.

## Common Fields

All suggestion variants should share a small base shape:

```ts
type SuggestionType =
  | "cameraShot"
  | "focusRegion"
  | "shotAttentionPath"
  | "timing"
  | "purpose"
  | "warning";

type SuggestionSource =
  | "manualDraft"
  | "panelHeuristic"
  | "textWeight"
  | "smartCameraPath"
  | "importedSuggestion";

type SuggestionConfidence = "high" | "medium" | "low" | "unknown";

type SuggestionStatus =
  | "visible"
  | "hidden"
  | "rejected"
  | "edited"
  | "acceptedPending";

interface SuggestionBase {
  id: string;
  type: SuggestionType;
  source: SuggestionSource;
  confidence: SuggestionConfidence;
  status: SuggestionStatus;
  reason?: string;
  warnings?: string[];
  relatedRefs?: SuggestionRelatedRef[];
  generationBatchId?: string;
  createdAt: string;
  updatedAt?: string;
}
```

Suggested field meanings:

- `id`: stable temporary suggestion ID. It is not a future project entity ID.
- `type`: suggestion variant.
- `source`: where the suggestion came from.
- `confidence`: confidence level used for review and filtering.
- `status`: temporary review status.
- `reason`: short explanation for why the suggestion exists.
- `warnings`: fragile-case notes or user-facing caveats.
- `relatedRefs`: references to existing project data or other temporary suggestions.
- `generationBatchId`: groups suggestions created in one run.
- `createdAt` / `updatedAt`: review metadata for ordering, stale detection, and debugging.

## Related References

Suggestions need to point at accepted project data without mutating it, and sometimes at other temporary suggestions that do not have real project IDs yet.

```ts
type ProjectRefKind =
  | "cameraShot"
  | "focusRegion"
  | "shotAttentionPathItem";

type TemporaryRefKind =
  | "suggestedCameraShot"
  | "suggestedFocusRegion"
  | "suggestedShotAttentionPath"
  | "suggestedTiming"
  | "suggestedPurpose";

interface ProjectRef {
  scope: "project";
  kind: ProjectRefKind;
  id: string;
}

interface TemporarySuggestionRef {
  scope: "suggestion";
  kind: TemporaryRefKind;
  id: string;
}

type SuggestionRelatedRef = ProjectRef | TemporarySuggestionRef;
```

Rules:

- A project ref points to accepted project data and must not mutate that data.
- A suggestion ref points to another temporary suggestion in the same suggestion set or generation batch.
- A temporary ref must be resolved during acceptance before any accepted project data is written.
- Missing refs should make the suggestion low confidence or invalid for acceptance, not crash the app.

## Suggestion Status

Use status as temporary review state:

- `visible`: available for review.
- `hidden`: temporarily filtered or suppressed without rejecting.
- `rejected`: explicitly dismissed and not accepted.
- `edited`: user changed the draft suggestion values before acceptance.
- `acceptedPending`: selected for acceptance but not yet committed to project data.

Once a suggestion is committed, the accepted project data becomes the source of truth. The suggestion can be removed from temporary state or retained only as non-persisted session history.

## Variant: Camera Shot Suggestion

Camera Shot suggestions propose full-page camera framing containers.

```ts
interface CameraShotSuggestion extends SuggestionBase {
  type: "cameraShot";
  proposed: {
    label?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    order?: number;
    durationMs?: number;
    sceneHoldRatio?: number;
    focusAttentionRatio?: number;
    shotPurpose?: string;
    outgoingTransitionPurpose?: string;
  };
  draft?: Partial<CameraShotSuggestion["proposed"]>;
}
```

Acceptance result:

- Creates a normal editable Camera Shot.
- Uses accepted/draft values for geometry, timing, order, and metadata.
- Does not crop or duplicate source art.
- Does not force 16:9 geometry.

## Variant: Focus Region Suggestion

Focus Region suggestions propose reusable page-level attention targets.

```ts
interface FocusRegionSuggestion extends SuggestionBase {
  type: "focusRegion";
  proposed: {
    label?: string;
    kind?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    effectType?: string;
    sequenceOrder?: number;
    focusPurpose?: string;
    sourceShotId?: string;
  };
  draft?: Partial<FocusRegionSuggestion["proposed"]>;
}
```

Acceptance result:

- Creates a normal page-level Focus Region.
- Does not attach ownership to a Camera Shot.
- May keep source context metadata such as `sourceShotId` if useful.
- Does not become a camera frame.

## Variant: Shot Attention Path Suggestion

Shot Attention Path suggestions propose ordered references from one Camera Shot to Focus Regions.

```ts
interface ShotAttentionPathSuggestion extends SuggestionBase {
  type: "shotAttentionPath";
  targetShotRef: ProjectRef | TemporarySuggestionRef;
  proposed: {
    items: Array<{
      id: string;
      focusRegionRef: ProjectRef | TemporarySuggestionRef;
      order: number;
      motionRole?: "hold" | "pushIn" | "track" | "reveal" | "emphasis";
      durationWeight?: number;
    }>;
  };
  draft?: Partial<ShotAttentionPathSuggestion["proposed"]>;
}
```

Acceptance result:

- Resolves `targetShotRef` to an accepted Camera Shot ID.
- Resolves every `focusRegionRef` to an accepted Focus Region ID.
- Creates normal `attentionPath` items on the Camera Shot.
- Skips or blocks invalid path items if referenced temporary Focus Region suggestions were not accepted.

Shot Attention Path suggestions must not copy Focus Region geometry or make Focus Regions shot-owned.

## Variant: Timing Suggestion

Timing suggestions propose edits to existing or suggested Camera Shot timing.

```ts
interface TimingSuggestion extends SuggestionBase {
  type: "timing";
  targetShotRef: ProjectRef | TemporarySuggestionRef;
  proposed: {
    durationMs?: number;
    sceneHoldRatio?: number;
    focusAttentionRatio?: number;
    durationReason?: string;
  };
  draft?: Partial<TimingSuggestion["proposed"]>;
}
```

Acceptance result:

- Updates timing fields on an accepted Camera Shot, or applies timing values while accepting a Camera Shot suggestion.
- Never silently overrides user-authored timing.
- Should show reasons such as text weight, dialogue density, or purpose defaults.

## Variant: Purpose Metadata Suggestion

Purpose suggestions propose metadata values.

```ts
interface PurposeSuggestion extends SuggestionBase {
  type: "purpose";
  targetRef: ProjectRef | TemporarySuggestionRef;
  proposed: {
    shotPurpose?: string;
    focusPurpose?: string;
    outgoingTransitionPurpose?: string;
  };
  draft?: Partial<PurposeSuggestion["proposed"]>;
}
```

Acceptance result:

- Updates purpose metadata on an accepted Camera Shot or Focus Region.
- Applies purpose metadata while accepting a Camera Shot or Focus Region suggestion.
- Does not change preview or export behavior by itself.

## Variant: Warning / Confidence Note

Warning suggestions are advisory notes that may never become project data.

```ts
interface WarningSuggestion extends SuggestionBase {
  type: "warning";
  proposed: {
    severity: "info" | "warning";
    message: string;
    affectedRefs?: SuggestionRelatedRef[];
  };
  draft?: never;
}
```

Acceptance result:

- Usually none.
- A future UI may allow users to acknowledge or hide warnings.
- Warning notes should not be exported or persisted without a future schema ticket.

## Suggestion Set

Suggestion sets group temporary suggestions from one generation run.

```ts
interface SuggestionSet {
  id: string;
  source: SuggestionSource;
  createdAt: string;
  label?: string;
  suggestions: TemporarySuggestion[];
}

type TemporarySuggestion =
  | CameraShotSuggestion
  | FocusRegionSuggestion
  | ShotAttentionPathSuggestion
  | TimingSuggestion
  | PurposeSuggestion
  | WarningSuggestion;
```

Batching makes it easier to regenerate a group, hide stale results, compare runs, and apply "accept all visible" safely.

## Referencing Temporary Suggestions Before Acceptance

Some suggestions depend on other suggestions.

Example:

- A `FocusRegionSuggestion` proposes a speech bubble region.
- A `CameraShotSuggestion` proposes a panel reading container.
- A `ShotAttentionPathSuggestion` proposes that the Camera Shot should reference the speech bubble Focus Region.

Before acceptance, the path item can reference the Focus Region suggestion by temporary ID. During acceptance:

1. Accept or create required Focus Region suggestions first.
2. Record the real accepted Focus Region IDs.
3. Accept or create the Camera Shot suggestion.
4. Resolve the path suggestion to real `focusRegionId` values.
5. Write the final `attentionPath` onto the accepted Camera Shot only after all required refs resolve.

If a required temporary suggestion is rejected, the dependent suggestion should become blocked, lower confidence, or require user correction.

## Acceptance Resolution

Acceptance should be a deterministic conversion from temporary suggestions into normal project data:

- Temporary suggestion IDs do not become project IDs.
- Accepted Camera Shot suggestions receive normal Camera Shot IDs.
- Accepted Focus Region suggestions receive normal Focus Region IDs.
- Accepted Shot Attention Path suggestions receive normal path item IDs and real `focusRegionId` references.
- Timing and purpose suggestions apply only to accepted project records.
- Warnings can be hidden or acknowledged but should not become project records by default.

Acceptance should produce clear feedback when dependencies cannot resolve.

## Temporary State Versus Project Data

Keep temporary:

- Suggestion IDs and batch IDs.
- Confidence levels.
- Source/reason/warning metadata.
- Rejected/hidden/edited/accepted-pending statuses.
- Draft geometry/timing/purpose values before acceptance.
- References to other temporary suggestions.
- Warning/confidence notes.

Commit only after explicit acceptance:

- Camera Shot records.
- Focus Region records.
- Camera Shot `attentionPath` records.
- Timing fields.
- Purpose metadata.

## Persistence Position

Do not persist suggestions in Project JSON yet.

Reasons:

- Suggestions can become stale after manual edits.
- Rejected suggestions may not belong in a portable project file.
- Temporary IDs and dependency refs need migration rules.
- Suggestion source/confidence semantics may change as prototypes evolve.
- Persisting suggestions would increase schema complexity before the review workflow is proven.

If persisted suggestions are later desired, create a dedicated schema ticket. That ticket should define:

- `schemaVersion` migration behavior.
- Suggestion set storage shape.
- Stale-suggestion detection after project edits.
- Whether rejected or hidden suggestions persist.
- How temporary suggestion refs migrate across sessions.
- Import validation for malformed or partially stale suggestion data.

## Manual Data Priority And Staleness

Manual user-authored data remains the source of truth.

Rules:

- Do not overwrite user-authored Camera Shots, Focus Regions, Shot Attention Paths, timing, or purpose metadata without explicit action.
- Prefer linking suggestions to existing records over duplicating them.
- Mark suggestions stale when referenced project records are edited or deleted.
- Lower confidence or require regeneration when geometry, order, timing, or purpose data changes after suggestion generation.
- Keep stale suggestions reviewable when safe, but block acceptance if required references are missing.

Stale suggestions should guide review, not force rollback of user edits.

## Preparation For T0055 And T0056

T0055 can use this model to plan review UI around:

- Suggestion groups/batches.
- Filters by type, source, confidence, and status.
- Inline editing of proposed values.
- Warnings for stale or blocked suggestions.
- Clear accept/reject controls.

T0056 can use this model to prototype:

- In-memory suggestion state.
- Accept/edit/delete/reorder actions.
- Dependency resolution from temporary IDs to real project IDs.
- Conversion of accepted suggestions into normal project data.
- Rejection without project mutation.

Neither T0055 nor T0056 should require Project JSON schema changes unless explicitly re-scoped.

## Manual Verification

For T0054, verification is documentation-only:

- Confirm common fields include id, type, source, confidence, reason/warnings, proposed values, draft values, related refs, batch/timestamp metadata, and status.
- Confirm variants cover Camera Shot, Focus Region, Shot Attention Path, timing, purpose metadata, and warning/confidence suggestions.
- Confirm temporary suggestions can reference accepted project data and other temporary suggestions.
- Confirm acceptance resolves temporary IDs into real project IDs.
- Confirm suggestions are not persisted in Project JSON yet.
- Confirm manual user-authored data takes priority.
- Confirm T0055 is the recommended next ticket.
