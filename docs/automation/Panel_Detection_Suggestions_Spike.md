# Panel Detection Suggestions Spike

T0050 investigates simple panel detection as suggestion support only. It does not implement production panel detection, OCR, AI, preview behavior, export behavior, schema changes, or editor workflow changes.

## Product Boundary

Panel detection must preserve the current manual-first guided-view model:

- The source comic page remains intact.
- Camera Shots remain flexible panel/scene reading containers and main timeline destinations.
- Focus Regions remain reusable page-level attention targets, not replacement camera frames.
- Shot Attention Path remains an ordered list of references to page-level Focus Regions inside a Camera Shot.
- Browser preview can use explicit Shot Attention Path order, but detection must not force or replace that authoring choice.
- Automation should suggest draft structures that users can accept, edit, delete, reorder, or ignore.

Detection output should be treated as proposed project data, not as a final video path and not as cropped image assets.

## Candidate Approaches

### Border / Contour Detection

Find strong rectangular outlines by thresholding high-contrast edges, then group contours that look like panel borders.

Possible output:

- Rectangular panel candidates.
- Confidence scores based on closed borders, area, aspect ratio, and border strength.
- Optional grouping for nested or adjacent panels.

Strengths:

- Simple to explain and debug.
- Works well on pages with clear black gutters and rectangular panel borders.
- Can produce Camera Shot suggestions directly from detected panel boxes.

Limitations:

- Fails on borderless panels, painted layouts, white-on-white gutters, decorative borders, and open compositions.
- Can confuse speech balloons, sound effects, or page decorations for panel boundaries.
- Can split one panel into many fragments when characters or effects cross borders.

### Whitespace / Gutter Detection

Analyze large connected white or low-detail gaps between art regions, then infer panel rectangles from the negative space.

Possible output:

- Candidate panel separators.
- Reading-order groups based on rows, columns, or flow.
- Page layout hints, such as multi-row grid, manga column flow, or webtoon vertical stack.

Strengths:

- Useful when gutters are consistent even if borders are subtle.
- Can support reading-order suggestions.
- May work on clean scanned comic pages with visible panel spacing.

Limitations:

- Fails when gutters are dark, textured, or covered by art.
- Struggles with splash pages, overlapping panels, diagonal panels, and dense backgrounds.
- Can mistake speech balloons or empty sky/background areas for gutters.

### Connected Component / Rectangular Region Heuristics

Segment the page into connected blocks of ink or visual density, then fit simple rectangles around likely panel regions.

Possible output:

- Large visual content boxes.
- Candidate reading regions when panel borders are absent.
- Secondary detail candidates for high-density objects.

Strengths:

- Can find regions even without explicit borders.
- Can be tuned for rough "suggest something editable" behavior.
- Useful as a fallback for pages where contour detection returns too little.

Limitations:

- Not semantically aware.
- Can merge multiple panels into one region when artwork touches across gutters.
- Can split one busy panel into many unrelated fragments.

### Manual-Assisted Detection

Let the user provide light hints before or after detection, such as selecting a page type, drawing rough guide lines, marking a first panel, or choosing accepted/rejected candidates.

Possible output:

- Candidate boxes constrained by user hints.
- Faster correction workflow instead of a fully automatic result.
- Improved confidence through user confirmation.

Strengths:

- Best fit for the manual-first product direction.
- Keeps users in control.
- Allows useful automation without pretending detection is reliable.

Limitations:

- Requires more UI design.
- Still needs clear accept/edit/delete behavior.
- Should not become mandatory before manual editing is complete.

## Why Panel Detection Is Fragile

Comic pages are not uniform documents. Detection can fail or create misleading suggestions because of:

- Irregular panels and diagonal panel borders.
- Borderless panels.
- Overlapping art and characters crossing panel boundaries.
- Speech bubbles touching or crossing borders.
- Effects, weapons, speed lines, and sound effects spanning multiple panels.
- Splash pages where the whole page is one composition.
- Decorative frames and non-panel ornaments.
- Webtoon layouts with long vertical flow, inconsistent spacing, and merged scene beats.
- Low-quality photos, skewed scans, shadows, glare, page curl, or perspective distortion.
- Manga layouts with different reading direction expectations.

Because of these cases, detection should always be presented as editable suggestions. It should never be treated as the source of truth.

## Mapping Suggestions Into The Current Model

Detected suggestions should map into existing editable concepts:

- Detected full panel candidate -> possible Camera Shot.
- Detected scene area or multi-panel composition -> possible wider Camera Shot.
- Detected speech bubble, face, object, action detail, or visual clue -> possible page-level Focus Region.
- Detected reading order -> possible camera shot order.
- Detected intra-panel detail order -> possible Shot Attention Path references to existing or suggested Focus Regions.
- Detected page-level establishing context -> possible first/last wide Camera Shot or Page Enter/Page Exit guidance.

Focus Regions must not become replacement camera frames. If detection finds a face or speech bubble, that suggestion should become an attention target, not a timeline destination unless the user explicitly turns it into a Camera Shot.

Shot Attention Path should reference Focus Regions by ID. A future implementation may suggest path items only after suggested Focus Regions exist or are accepted.

## Accept / Edit / Delete Workflow

A future implementation should separate suggestion review from committed project data.

Recommended workflow:

1. Run detection on the current page and create a temporary suggestion set.
2. Show detected panel candidates as proposed Camera Shots.
3. Show detected details, speech, faces, or action regions as proposed Focus Regions.
4. Show detected reading order as proposed shot order.
5. Show detected intra-panel detail order as proposed Shot Attention Path entries.
6. Let the user accept individual suggestions, accept all visible suggestions, edit geometry before accepting, or delete/reject suggestions.
7. After acceptance, convert suggestions into normal editable Camera Shots, Focus Regions, and Shot Attention Path references.
8. Keep all accepted data manually editable afterward.

Suggested UI states:

- Suggested: temporary candidate, not exported as project data yet.
- Accepted: converted into normal project data.
- Edited: user-corrected before or after acceptance.
- Rejected: hidden from the suggestion set.

## Manual Correction Requirements

Users must be able to correct:

- Camera Shot geometry.
- Camera Shot order.
- Camera Shot label and purpose.
- Focus Region geometry.
- Focus Region kind, label, purpose, effect type, and sequence/order metadata.
- Shot Attention Path membership and order.
- False positives.
- Missing panels or details.
- Wrong reading direction.
- Over-split or merged panel suggestions.

Manual creation must remain available before and after detection. The app should still work if the user never runs detection.

## What Must Not Happen

Future panel suggestion features must not:

- Destructively crop panel art.
- Make detection mandatory.
- Replace manual camera shot editing.
- Replace page-level focus region drawing/editing.
- Treat focus regions as camera frames.
- Delete focus regions when a camera shot is deleted.
- Hide or discard the source page.
- Override user-authored Shot Attention Path order without explicit user action.
- Change preview/export behavior implicitly.
- Require OCR, AI, audio, multi-page support, or production rendering.

## Future T0050A Implementation Path

A narrow future implementation ticket could prototype suggestion generation without productionizing detection:

Title: T0050A - Panel Suggestion Overlay Prototype

Allowed scope:

- Add an experimental, user-triggered "Suggest Panels" action.
- Use simple contour/gutter heuristics with no new dependencies if feasible.
- Store suggestions in temporary UI state only.
- Render suggestions as non-committed overlays.
- Let users accept selected suggestions as Camera Shots.
- Keep manual editing available.
- Do not export suggestions until accepted as normal project data.
- Do not add OCR, AI, audio, schema changes, or production export behavior.

Acceptance criteria:

- Detection suggestions are clearly labeled as suggestions.
- Accepted panel suggestions become editable Camera Shots.
- Rejected suggestions disappear without changing project data.
- Manual camera shot creation still works.
- Build passes if source files change.

## Relationship To Later Tickets

T0051 should remain a separate OCR/text-weight timing spike. Panel detection can suggest visual layout and rough reading order, but text density, OCR confidence, privacy, and reading-duration estimation have separate risks and should be investigated independently.

T0052 can later use accepted or suggested panels, Focus Regions, Shot Attention Paths, and purpose defaults to draft an editable camera path. It should not make automatic detection mandatory.
