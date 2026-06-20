# Suggestion Review UI Plan

T0055 plans the UI/UX for reviewing temporary suggestions before implementing accept/edit/delete workflow behavior. It does not implement source code, editor UI, Project JSON schema changes, import/export persistence, preview behavior, export behavior, OCR, AI, panel detection, dependencies, audio, or multi-page support.

## Product Boundary

Suggestion review should preserve the manual-first editor:

- Suggestions are temporary until explicitly accepted.
- Manual Camera Shots, Focus Regions, Shot Attention Paths, timing, and purpose metadata remain the source of truth.
- Camera Shots remain main timeline framing containers over the intact page.
- Focus Regions remain page-level attention targets.
- Shot Attention Path remains per-shot references to page-level Focus Regions.
- Suggestions must not affect preview, canvas export, timeline playback, or Project JSON until accepted by a later implementation ticket.

The UI should communicate "review these candidates" rather than "generate the final video."

## Recommended Placement

Use a dedicated Suggestions review panel or drawer as the primary surface.

Recommended layout:

- A Suggestions panel/drawer next to the existing inspector/timeline/editor workspace.
- Optional geometry overlays on the page for selected or visible geometry suggestions.
- Optional draft lane or grouped list for Camera Shot order suggestions.
- Lightweight summary badges near existing panels only when useful.

Avoid mixing all suggestions directly into the normal inspector. The inspector should remain focused on accepted project data. When a suggestion is selected, the Suggestions panel can show its proposed and draft values without making it look like an accepted Camera Shot or Focus Region.

## Suggested Overlays

Geometry suggestions can use visual overlays, but they must be distinct from accepted editor geometry:

- Camera Shot suggestions: dashed or translucent boxes with a "Suggested Shot" label.
- Focus Region suggestions: dashed or tinted boxes with a "Suggested Focus" label.
- Selected suggestion: stronger outline and linked row highlight in the Suggestions panel.
- Accepted project data: keeps existing solid/editor styling.
- Hidden/rejected suggestions: not shown on canvas unless a debug/filter option requests them.

Suggestion overlays should be non-destructive and should not participate in dragging/resizing behavior until a later edit workflow explicitly scopes that behavior.

## Camera Shot Suggestions

Camera Shot suggestions should be shown as proposed timeline reading containers, not real shots.

UI plan:

- Show each Camera Shot suggestion in the Suggestions panel with label, source, confidence, status, order, and geometry summary.
- Show a suggested order number when present.
- Show a page overlay for geometry review.
- If a timeline draft lane is later implemented, keep it visually separate from the real timeline.
- Use wording such as "Suggested Camera Shot" rather than "Shot" alone.

Must not happen:

- Do not add the suggestion to the real timeline until accepted.
- Do not let preview/manual playback treat it as a Camera Shot.
- Do not export it.
- Do not hide existing manual Camera Shots.

## Focus Region Suggestions

Focus Region suggestions should be shown as proposed page-level attention targets.

UI plan:

- Show kind, source, confidence, purpose/effect hints, and geometry summary.
- Show optional overlay with a distinct suggested-focus style.
- Show related Camera Shot or text/panel source context when available.
- Group nearby or related Focus Region suggestions when they were generated as a set.

Must not happen:

- Do not attach the suggestion as shot-owned data.
- Do not make it a camera frame.
- Do not include it in preview focus sequencing until accepted by a later implementation.

## Shot Attention Path Suggestions

Shot Attention Path suggestions need careful labeling because they depend on Camera Shots and Focus Regions.

UI plan:

- Show the target Camera Shot reference as accepted or suggested.
- Show ordered path items as references to accepted or suggested Focus Regions.
- Use dependency labels such as "uses suggested Focus Region" or "blocked until Focus Region is accepted."
- Show path order in the Suggestions panel rather than inside the normal Shot Attention Path inspector.
- If a path item references a suggested Focus Region, make the dependency clear.

Must not happen:

- Do not make suggested path items appear as accepted `attentionPath` records.
- Do not make Manual preview step through suggested attention keys.
- Do not let suggested paths change Auto preview or canvas export.

## Timing And Purpose Suggestions

Timing and purpose suggestions should be shown as proposed changes, not silent updates.

UI plan:

- Show current accepted value beside proposed value.
- Show edited draft value if the user changes the proposal before acceptance.
- Include reason text, such as "text-heavy dialogue" or "purpose default."
- Show source and confidence.
- For timing, show `durationMs`, `sceneHoldRatio`, and `focusAttentionRatio` deltas clearly.
- For purpose, show suggested `shotPurpose`, `focusPurpose`, or `outgoingTransitionPurpose` with explanation.

Must not happen:

- Do not mutate accepted timing or purpose metadata until explicit acceptance.
- Do not change preview/export behavior based on unaccepted suggestions.

## Warning And Confidence Notes

Warnings and confidence notes should be visible but not noisy.

UI plan:

- Show a compact warning count per suggestion batch.
- Show inline warning chips on affected suggestions.
- Use clear confidence labels: high, medium, low, unknown.
- Show stale or blocked state near the suggestion title.
- Keep warning text short and practical.

Examples:

- "Low confidence: unclear panel boundary."
- "Blocked: suggested Focus Region was rejected."
- "Stale: source Camera Shot changed after generation."
- "Unknown confidence: imported suggestion."

Warnings should help review, not prevent manual editing.

## Proposed Versus Edited Draft Values

The UI should distinguish three states:

- Current accepted value: existing project data.
- Proposed value: generated suggestion.
- Draft value: user-edited suggestion before acceptance.

Recommended display:

- For geometry: show proposed source coordinates and optionally edited draft coordinates.
- For order: show proposed order and user draft order.
- For timing/purpose: show accepted value, proposed value, and edited draft value in a compact comparison.
- For dependencies: show accepted project refs and temporary suggestion refs separately.

Edited draft values should remain temporary until accepted.

## Filtering And Grouping

Suggestions should be filterable and groupable without changing project data.

Filters:

- Type: Camera Shot, Focus Region, Shot Attention Path, timing, purpose, warning.
- Source: manualDraft, panelHeuristic, textWeight, smartCameraPath, importedSuggestion.
- Confidence: high, medium, low, unknown.
- Status: visible, hidden, rejected, edited, accepted-pending.
- Stale/blocked state.

Grouping:

- Generation batch.
- Suggested shot order.
- Related accepted Camera Shot.
- Related suggested Camera Shot.
- Source workflow, such as panel suggestions or text-weight suggestions.

Default view should favor visible, actionable suggestions and hide rejected items unless the user asks to see them.

## Future Actions

T0055 does not implement actions, but the UI should prepare for them:

- Accept one suggestion.
- Accept selected suggestions.
- Accept all visible suggestions.
- Edit draft values.
- Delete/reject suggestions.
- Hide suggestions.
- Reorder Camera Shot suggestions.
- Reorder Shot Attention Path suggestions.
- Regenerate a batch.
- Ignore a batch and keep manual editing.

Action controls should be disabled or marked blocked when dependencies cannot resolve.

## Manual Data Priority

The UI should make accepted project data visually and conceptually primary:

- Existing editor overlays and timeline remain visible.
- Suggestions appear as candidates, not replacements.
- Manual editing tools remain available while suggestions exist.
- If accepted data changes, dependent suggestions can show stale state.
- The user can ignore all suggestions and continue manually.

When a suggestion conflicts with accepted data, the UI should say so rather than choosing automatically.

## Stale And Blocked Suggestions

Stale suggestions happen when accepted project data changes after generation.

Stale examples:

- Referenced Camera Shot geometry changed.
- Referenced Focus Region was deleted.
- Suggested order conflicts with current timeline order.
- Text-weight timing suggestion was generated before the shot duration was manually changed.

Blocked examples:

- Shot Attention Path suggestion references a rejected Focus Region suggestion.
- Timing suggestion targets a Camera Shot suggestion that was rejected.
- Purpose suggestion targets missing project data.

UI plan:

- Show stale/blocked badges.
- Keep details inspectable.
- Disable acceptance until dependencies are fixed or the suggestion is regenerated.
- Allow rejection/hiding without fixing dependencies.

## Mobile And Narrow Layouts

For narrow layouts, suggestions should move into a drawer or tabbed panel rather than crowding the editor.

Planning guidance:

- Use a single-column Suggestions drawer.
- Keep filters collapsible.
- Keep overlay visibility toggle accessible.
- Avoid wide comparison tables; stack accepted/proposed/draft values.
- Preserve access to normal editor tools.

Mobile planning should prioritize clarity over dense dashboards.

## What Not To Show Yet

To avoid overwhelming users, the first UI plan should not show:

- A "generate final video" control.
- AI branding or automation claims not backed by implemented behavior.
- Every low-level coordinate field by default.
- All rejected suggestions by default.
- Hidden dependency graphs unless needed for a selected suggestion.
- Preview/export toggles tied to unaccepted suggestions.
- Persistent suggestion archive controls before a schema ticket exists.

The first review UI should focus on understanding, filtering, and selecting suggestions.

## Recommended Next Ticket

T0056 - Manual Suggestion Accept/Edit/Delete Workflow Prototype is the recommended next ticket.

T0056 should implement a narrow prototype only if it can preserve the T0054/T0055 boundaries:

- Suggestions remain temporary until acceptance.
- Accepted suggestions become normal project data.
- Rejected suggestions do not mutate project data.
- Project JSON schema remains unchanged.
- Preview/export behavior remains unchanged.
- Manual editing remains available.

## Manual Verification

For T0055, verification is documentation-only:

- Confirm the plan prefers a dedicated Suggestions panel/drawer.
- Confirm suggested overlays are visually distinct from accepted Camera Shots and Focus Regions.
- Confirm Shot Attention Path suggestions are not confused with accepted paths.
- Confirm timing and purpose suggestions do not silently change values.
- Confirm source, confidence, status, stale/blocked state, warnings, proposed values, and draft values are visible in the plan.
- Confirm filtering/grouping is documented.
- Confirm future accept/edit/delete/reorder/regenerate/ignore actions are planned but not implemented.
- Confirm normal editor tools remain available.
- Confirm T0056 is recommended next.
