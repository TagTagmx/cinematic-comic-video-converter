# Text Weight / OCR Timing Spike

T0051 investigates text-heavy region detection and OCR-assisted timing suggestions. It does not implement production OCR, AI, editor UI changes, preview behavior, export behavior, schema changes, package changes, or automatic timing overrides.

## Product Boundary

Text analysis must support the manual-first guided-view model:

- Camera Shots remain editable camera framing containers over the full comic page.
- Focus Regions remain reusable page-level attention targets, not replacement camera frames.
- Shot Attention Path remains an ordered list of references to page-level Focus Regions inside a Camera Shot.
- Panel detection remains suggestion-based and non-destructive.
- OCR and text-weight analysis should suggest timing and pacing, not force playback behavior.
- Manual duration, timing, focus-region, and attention-path editing must remain available.

The expected future output is suggestion metadata or temporary suggestions that users can accept, edit, delete, or ignore.

## Text That Matters For Timing

Different text types should influence timing differently:

- Speech bubbles: usually increase reading time inside the current Camera Shot and may justify a Focus Region suggestion when the bubble is visually important or spatially isolated.
- Captions and narration boxes: often affect whole-shot duration because they set scene context, time jumps, or exposition.
- Sound effects: may influence emphasis or pacing, but should not always increase reading duration like dialogue.
- Signs, screens, labels, and environmental text: usually add light timing weight unless central to the scene.
- Tiny labels or background text: should often remain timing metadata only, because focusing every label would interrupt the cinematic flow.
- Multi-bubble exchanges: may justify more shot hold time, a small number of Focus Region suggestions, or an ordered Shot Attention Path if the reading order is clear.

Text analysis should distinguish "needs more time to read" from "deserves its own visual attention target." Not every readable text region should become a Focus Region.

## Timing Suggestion Approaches

### Text-Weight Scoring Without Full OCR

Estimate likely text density from bubble-like shapes, high-contrast glyph clusters, caption boxes, and small repeated strokes. This can suggest duration without recognizing exact words.

Possible outputs:

- Per-Camera Shot text weight: none, light, medium, heavy.
- Suggested duration adjustment range.
- Suggested focus-attention ratio adjustment when text is concentrated in a few regions.

Strengths:

- Avoids storing or exposing dialogue text.
- Lower privacy risk than full transcription.
- Can work as a rough pacing helper before OCR is reliable.

Limitations:

- Cannot know true reading complexity.
- Can confuse hatching, textures, symbols, or sound effects with text.
- May undercount stylized, vertical, or low-contrast lettering.

### OCR-Assisted Timing

Use OCR only as an exploratory future option to estimate word or character count, text confidence, and language/script hints. The text content itself should not be required for the core timing model.

Possible outputs:

- Estimated word/character count per Camera Shot.
- Confidence score.
- Suggested extra hold time.
- Optional warning when OCR confidence is low.

Strengths:

- Better duration estimates for dialogue-heavy panels.
- Can identify extremely dense narration or caption areas.
- Can support user-visible explanation for timing suggestions.

Limitations:

- Adds dependency, performance, privacy, and accuracy risk.
- Multilingual and stylized comics are hard.
- OCR errors can produce misleading timing if treated as authoritative.

### Bubble / Caption Region Detection

Detect speech bubbles, captions, or text blocks as geometry without necessarily transcribing the text.

Possible outputs:

- Temporary Focus Region suggestions for prominent text areas.
- Timing weight for the parent Camera Shot.
- Candidate Shot Attention Path order when a few text regions should be read in sequence.

Strengths:

- Fits the existing page-level Focus Region model.
- Can provide editable attention targets without requiring full OCR.
- Keeps text suggestions tied to user-reviewable geometry.

Limitations:

- Bubble detection is fragile when bubbles overlap art, cross panel borders, or lack clean outlines.
- Captions can look like panel borders or signs.
- Too many detected bubbles can create noisy suggestions.

## How Text Should Affect Shot Duration

Future timing suggestions should be conservative and editable:

- A Camera Shot with no meaningful text should keep purpose-based timing defaults unless user edits it.
- Light text may add a small hold-time suggestion.
- Medium text may suggest a longer `durationMs` and preserve enough scene hold for reading.
- Heavy dialogue, narration, or dense captions may suggest a larger `durationMs` increase and a gentler transition pace.
- Low-confidence OCR or uncertain text detection should produce a warning or low-confidence suggestion, not an automatic change.

Timing suggestions should be expressed as optional recommendations. The system should never silently override user-authored `durationMs`, `sceneHoldRatio`, or `focusAttentionRatio`.

## Text Inside A Camera Shot And Focus Timing

Text inside the active Camera Shot can influence focus timing in two ways:

- Shot-level timing: increase the overall Camera Shot duration when the text belongs to the whole reading container.
- Focus-level timing: suggest more focus-attention time when one or a few page-level Focus Regions contain the main readable text or narrative detail.

If a Camera Shot has a Shot Attention Path, future text timing should be able to suggest relative attention weights for path items. This should not change the definition of Shot Attention Path: path items still reference existing page-level Focus Regions, and Focus Regions are not owned by the shot.

## When To Suggest Focus Regions

OCR or text detection should suggest a Focus Region only when the region is likely useful as an attention target:

- A large speech bubble or caption that dominates the shot.
- A key narration box that explains the scene.
- A sign, screen, or label that is important to understanding the action.
- A clear sequence of bubbles where attention-path ordering would help reading flow.

OCR should only influence timing metadata when:

- Text is spread across the shot and does not need separate visual focus.
- The text is too tiny or uncertain to become a reliable attention target.
- There are many bubbles and focusing each one would feel mechanical.
- The Camera Shot already frames the readable region well.

## Avoiding Over-Focus

Future text suggestions should avoid creating one Focus Region per detected text object by default. The system should prefer:

- Grouping nearby bubbles or captions into one suggested Focus Region when they are read as a unit.
- Suggesting shot duration increases for dense text instead of adding many attention targets.
- Respecting user-authored Shot Attention Path order.
- Limiting automatic path suggestions to a small number of high-value attention targets.
- Showing low-confidence or low-importance text as timing notes, not focus targets.

The goal is readable pacing, not a checklist tour of every bubble.

## Interaction With Purpose Metadata

Text-weight suggestions should complement existing purpose metadata:

- `shotPurpose: dialogue`: text weight may increase duration more aggressively and favor readable holds.
- `shotPurpose: establishing`: text should only dominate timing when captions or signs are central to context.
- `shotPurpose: action`: sound effects may support emphasis, but dialogue timing should not flatten action pacing unless text is clearly important.
- `focusPurpose: dialogue`: text evidence may support longer attention time or higher priority inside a Shot Attention Path.
- `focusPurpose: detail`: environmental text may reinforce a detail focus, but should not turn every label into dialogue timing.
- `outgoingTransitionPurpose: reading`: text-heavy shots may prefer less abrupt transitions.
- `outgoingTransitionPurpose: cinematic` or `sceneChange`: text weight may suggest extra hold time before transition, but should not override the authored transition purpose.

Purpose metadata should remain editable user intent. OCR or text-weight evidence should explain suggestions, not redefine intent.

## Fragile Cases

Text and OCR suggestions are fragile because comics use varied lettering and layouts:

- Vertical manga text and right-to-left reading order.
- Stylized lettering, handwritten sound effects, and decorative captions.
- Bubbles overlapping each other or crossing panel boundaries.
- Text crossing panel borders or placed over full-page splash art.
- Characters, tails, or effects touching bubble outlines.
- Low-contrast text, halftone texture, heavy shadows, skewed photos, glare, or page curl.
- Multilingual pages, mixed scripts, furigana, ruby text, and translated overlays.
- Very small signs, background labels, UI screens, or dense technical text.
- Webtoon layouts with long vertical rhythm and uneven spacing.

Low-confidence results must stay editable and should never be treated as final timing.

## Privacy, Accuracy, Performance, And Dependency Risks

Future OCR work should explicitly choose where analysis runs and what data is stored:

- Privacy: local-only OCR has fewer data-sharing risks; hosted OCR or AI services would require clear user consent and policy review.
- Accuracy: OCR confidence should be visible or reflected in suggestion confidence.
- Performance: OCR can be slow on large pages and should be user-triggered, cancellable, or scoped to selected regions.
- Dependencies: OCR libraries can be large and should not be added without a dedicated implementation ticket.
- Persistence: recognized text should not be stored in Project JSON unless a future schema ticket explicitly requires it.

For the near term, text-weight metadata can be considered without storing dialogue transcripts.

## Accept / Edit / Delete Workflow

A future implementation should create temporary text suggestions before committing anything to project data:

1. User runs a text-weight or OCR timing suggestion action.
2. The app creates a temporary suggestion set for the current page or selected Camera Shot.
3. Suggestions can include shot duration changes, focus-region candidates, attention-path candidates, and confidence notes.
4. The user can accept a timing suggestion, edit the proposed values, delete/reject it, or ignore it.
5. Accepted Focus Region suggestions become normal page-level Focus Regions.
6. Accepted Shot Attention Path suggestions reference existing or newly accepted Focus Regions.
7. Accepted timing suggestions update normal editable shot timing fields only after explicit user action.
8. All accepted results remain manually editable afterward.

Suggested UI states:

- Suggested: temporary OCR/text-weight recommendation.
- Accepted: applied to normal editable project data.
- Edited: user-adjusted before or after acceptance.
- Rejected: removed from the suggestion set.
- Low confidence: visible caution that the suggestion may be wrong.

## What Must Not Happen

Future text or OCR features must not:

- Implement production OCR without a specific implementation ticket.
- Add AI or OCR dependencies without a specific implementation ticket.
- Store dialogue transcripts by default.
- Automatically override shot duration or focus timing.
- Replace manual timing controls.
- Replace Camera Shots with text regions.
- Treat Focus Regions as camera frames.
- Force a Focus Region for every speech bubble.
- Change browser preview, canvas export, Project JSON schema, or import/export behavior implicitly.
- Make OCR mandatory before editing or exporting.

## Future Implementation Path

A narrow future implementation ticket could prototype timing suggestions without productionizing OCR:

Title: T0051A - Text Weight Timing Suggestion Prototype

Allowed scope:

- Add a user-triggered experimental text-weight analysis action.
- Prefer non-transcription text-density heuristics before full OCR.
- Store suggestions in temporary UI state only.
- Suggest editable shot duration and focus-attention adjustments.
- Optionally suggest a small number of page-level Focus Regions for prominent text blocks.
- Do not store recognized text in Project JSON.
- Do not change preview/export behavior.
- Do not add production OCR, AI, schema changes, or package dependencies unless explicitly approved in that ticket.

Acceptance criteria:

- Suggestions are clearly labeled as suggestions.
- Manual timing controls remain available.
- Accepted timing changes are normal editable shot fields.
- Accepted text regions become normal page-level Focus Regions.
- Focus Regions remain attention targets, not camera frames.

## Relationship To Later Tickets

T0052 can use accepted or suggested panels, Focus Regions, Shot Attention Paths, purpose metadata, and text-weight timing suggestions to draft an editable camera path. T0052 should remain suggestion/correction based and should not require OCR, panel detection, or AI to be mandatory.
