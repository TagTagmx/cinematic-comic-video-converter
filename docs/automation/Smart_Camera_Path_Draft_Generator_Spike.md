# Smart Camera Path Draft Generator Spike

T0052 defines how a future Smart Camera Path Draft Generator could create an initial editable camera path. It does not implement production draft generation, editor UI, preview behavior, export behavior, Project JSON schema changes, OCR, AI, panel detection, dependencies, audio, or multi-page support.

## Product Boundary

The draft generator must support the manual-first guided-view editor:

- The source comic page remains intact.
- Camera Shots remain editable main timeline framing containers over the full page.
- Focus Regions remain reusable page-level attention targets, not replacement camera frames.
- Shot Attention Path remains an ordered per-shot list of references to page-level Focus Regions.
- Panel detection, OCR/text weight, purpose metadata, and smart camera paths remain suggestion/correction based.
- Generated results must be editable, rejectable, reorderable, regenerable, and manually overridable.

The generator should produce a starting point for user review. It should not claim to know the correct cinematic direction and should not produce an automatic final video path.

## Inputs

A future draft generator can use accepted, suggested, and user-authored project context:

- Existing user-authored Camera Shots, including order, geometry, timing, and purpose metadata.
- Accepted or temporary panel suggestions from a panel-detection workflow.
- Page-level Focus Regions, including kind, purpose, effect type, sequence order, and geometry.
- Existing Shot Attention Paths authored by the user.
- Suggested Shot Attention Path candidates from panel/detail/text analysis.
- `shotPurpose`, `focusPurpose`, and `outgoingTransitionPurpose` metadata.
- Text-weight or OCR-assisted timing notes, without requiring stored dialogue transcripts.
- Reading-order hints from panel suggestions, user corrections, or page flow assumptions.
- Page-level context such as source image dimensions and existing Page Enter/Page Exit options.

All detection-derived inputs should be treated as uncertain suggestions. User-authored edits should carry higher authority than generated or detected hints.

## Draft Outputs

The generator should output temporary suggestions before changing normal project data:

- Editable Camera Shot suggestions.
- Suggested camera shot order.
- Optional page-level Focus Region suggestions.
- Optional Shot Attention Path suggestions that reference page-level Focus Regions.
- Suggested `durationMs`, `sceneHoldRatio`, and `focusAttentionRatio` values.
- Suggested `shotPurpose`, `focusPurpose`, or `outgoingTransitionPurpose` metadata where confidence is reasonable.
- Confidence notes and reasons, such as "panel candidate from border detection" or "duration increased for text-heavy caption."
- Warnings for ambiguous layout, low-confidence ordering, or fragile text/panel interpretation.

Accepted output should become normal editable Camera Shots, Focus Regions, Shot Attention Path references, and timing fields only after explicit user action.

## Suggestion Lifecycle

A future implementation should separate generated suggestions from committed project state:

1. User runs a draft-generation action on the current page.
2. The app creates a temporary suggestion set.
3. Suggestions are displayed separately from accepted project data.
4. The user reviews individual suggestions or the whole draft path.
5. The user accepts, edits, deletes, reorders, or regenerates suggestions.
6. Accepted suggestions become normal project data.
7. Rejected suggestions disappear without changing project data.
8. Manual editing remains available before and after generation.

Regeneration should not overwrite accepted user edits unless the user explicitly asks to replace or rebuild a draft.

## Camera Shot Generation Rules

Generated Camera Shot suggestions should remain flexible reading containers:

- Suggest Camera Shots from full panel candidates, scene areas, or deliberate multi-panel reading groups.
- Keep each suggested shot as source-image geometry over the intact page.
- Do not destructively crop, extract, or duplicate panel art.
- Do not force shot boxes to 16:9; the preview/export stage remains the fixed 16:9 output frame.
- Prefer readable subject regions that can be contained inside the fixed stage.
- Preserve user-authored shots unless the user explicitly asks to regenerate or replace them.
- Treat splash pages, wide establishing art, and multi-panel compositions as possible wide or full-page shot suggestions.

The generator should avoid creating overly tight shots around every detected object. Camera Shots are the main timeline destinations, not a list of all visual details.

## Focus Region Generation Rules

Generated Focus Region suggestions should remain page-level attention targets:

- Suggest Focus Regions for important faces, speech/caption areas, action details, reveal details, signs, or other attention targets.
- Keep Focus Regions reusable at page level, independent of any one Camera Shot.
- Do not treat Focus Regions as replacement camera frames.
- Do not delete Focus Regions when a Camera Shot suggestion is rejected or deleted.
- Prefer a small set of high-value attention targets over exhaustive detection.
- Group related text or details when focusing each item would feel mechanical.

Accepted Focus Region suggestions should become normal editable page-level Focus Regions.

## Shot Attention Path Generation Rules

Shot Attention Path suggestions should describe intra-shot attention order without replacing Camera Shots:

- Build path suggestions only from page-level Focus Regions, including existing or newly accepted Focus Region suggestions.
- Reference Focus Regions by ID instead of copying or owning focus-region geometry.
- Preserve user-authored Shot Attention Paths unless the user explicitly asks to regenerate them.
- Use reading order, panel composition, focus purpose, and text/detail importance to suggest path order.
- Keep path suggestions optional; a Camera Shot can be valid without a Shot Attention Path.
- Limit generated paths to a few meaningful keys inside a shot.

Shot Attention Path should guide intra-shot attention/motion in future preview/export work. It should not make Focus Regions into timeline camera destinations.

## Timing Suggestion Rules

Timing suggestions should combine purpose and content evidence conservatively:

- Start from user-authored shot timing when present.
- Use purpose-based defaults as a baseline for new generated Camera Shot suggestions.
- Increase duration for text-heavy dialogue, captions, or narration when confidence is reasonable.
- Preserve more scene hold for readable text and orientation-heavy shots.
- Use `focusAttentionRatio` when a shot has meaningful Focus Regions or Shot Attention Path keys.
- Use `outgoingTransitionPurpose` to suggest gentler reading transitions or clearer scene-change separation.
- Keep action shots from becoming slow text holds unless readable text is central.

Timing suggestions should be explicit recommendations. They should never silently override `durationMs`, `sceneHoldRatio`, or `focusAttentionRatio`.

## Confidence / Uncertainty Handling

The generator should make uncertainty visible:

- High confidence: clean panel candidate, clear reading order, or user-authored input.
- Medium confidence: plausible layout or text-weight hint with some ambiguity.
- Low confidence: unclear panel boundaries, overlapping art, uncertain text, or ambiguous reading direction.

Low-confidence suggestions should be easy to reject or edit. When confidence is low, the generator should prefer fewer suggestions and broader shots rather than a brittle sequence of precise regions.

The system should explain suggestions in practical terms, such as "wide shot suggested for splash-style page" or "path order suggested from accepted focus-region sequence."

## Accept / Edit / Delete / Reorder Workflow

A future UI should support correction-first review:

- Accept one suggestion.
- Accept all visible suggestions.
- Edit geometry before accepting.
- Delete or reject suggestions without changing project data.
- Reorder suggested Camera Shots before accepting.
- Reorder suggested Shot Attention Path items before accepting.
- Regenerate a draft while preserving accepted user edits by default.
- Compare generated suggestions with existing manual shots without hiding either set.

After acceptance, all generated data should behave like normal project data and remain manually editable through the existing editor workflows.

## Preserving Manual Editing

Manual workflows must remain available at all times:

- Users can create Camera Shots without running the generator.
- Users can draw Focus Regions without running the generator.
- Users can author Shot Attention Paths manually.
- Users can override generated timing and purpose metadata.
- Users can delete, reorder, or relabel generated items after acceptance.

The app should remain useful if the user never runs panel detection, OCR/text analysis, AI, or smart draft generation.

## Text-Heavy Regions

Text-weight notes should influence pacing without over-focusing every speech bubble:

- Dense dialogue or captions may increase shot duration.
- A large or narratively important text block may become a Focus Region suggestion.
- Multiple nearby bubbles may be grouped into one Focus Region suggestion.
- Many small bubbles should usually affect duration or confidence notes rather than becoming one focus target each.
- Text-heavy Shot Attention Path suggestions should remain short and user-reviewable.

The generator should avoid turning text detection into a mechanical tour of every bubble.

## Fragile Cases

The generator should degrade gracefully on hard pages:

- Unusual page layouts and decorative panel frames.
- Splash art where the whole page is one composition.
- Overlapping panels and characters crossing panel boundaries.
- Cross-panel effects, speech bubbles, weapons, or sound effects.
- Vertical manga flow, right-to-left reading order, or mixed reading directions.
- Webtoon-style long vertical layouts.
- Borderless panels and unclear gutters.
- Low-quality scans, skewed photos, glare, shadows, or page curl.
- Multilingual text or stylized lettering.

For these cases, the generator should prefer low-confidence notes, broader draft shots, and fewer automatic assumptions. It should ask for user correction through editable suggestions rather than pretending the layout is solved.

## Non-Goals

T0052 does not implement:

- Production smart path generation.
- Automatic final video generation.
- Mandatory AI, OCR, or panel detection.
- Dependency installation.
- Dialogue transcription.
- Project JSON schema changes.
- Browser preview changes.
- Canvas export changes.
- Editor behavior changes.
- Package changes.
- Source-code changes.
- Audio or multi-page support.

## Future Implementation Path

A narrow future implementation ticket could prototype draft suggestions without production automation:

Title: T0052A - Smart Camera Path Draft Suggestions Prototype

Allowed scope:

- Add a user-triggered draft-generation action.
- Use existing accepted project data first.
- Optionally consume temporary panel/text/focus suggestions if available.
- Store generated output in temporary UI state until accepted.
- Let users accept, edit, delete, reorder, and regenerate suggestions.
- Convert accepted suggestions into normal Camera Shots, page-level Focus Regions, and Shot Attention Path references.
- Keep manual editing available before and after generation.
- Do not add production AI, OCR, panel detection, schema changes, preview changes, export changes, dependencies, audio, or multi-page support.

Acceptance criteria:

- Suggestions are clearly labeled as suggestions.
- Accepted Camera Shot suggestions become editable Camera Shots.
- Accepted Focus Region suggestions become page-level Focus Regions.
- Accepted Shot Attention Path suggestions reference page-level Focus Regions.
- Rejected suggestions do not change project data.
- Manual shot, focus-region, timing, and attention-path editing remain available.
