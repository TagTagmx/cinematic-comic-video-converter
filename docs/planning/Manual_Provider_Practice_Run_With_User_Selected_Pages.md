# Manual Provider Practice Run With User-Selected Pages

This document completes T0111 as a provider-backed practice run using user-supplied local practice images from `D:\project_c\practice_images`. The image files are local practice inputs and are not added by this ticket.

No source behavior, provider routes, provider features, bundled fixtures, Project JSON schema, preview/export behavior, audio/SFX behavior, dependencies, OCR timing, parallax, character cutouts, segmentation animation, new motion roles, automatic accepted-state mutation, audio fetching, audio generation, or automatic SFX placement changed.

## Ticket Scope

T0111 is an evaluation/reporting ticket. This run used user-selected local/legal pages to test AI Page Understanding through `/api/analyze-page` and provider AI Director Suggestions through `/api/generate-director-suggestions`. It did not verify the full browser AI Camera Suggestions review surface, temporary Draft Motion helpers, read-only Audio Notes, or manual review actions.

## Run Method

Run date: 2026-06-19.

Provider/model: `gpt-5.4` through the existing local provider route.

Input directory: `D:\project_c\practice_images`.

Run path:

1. Started the existing Vite dev server inside a bounded script.
2. Sent each practice image to the existing `/api/analyze-page` route.
3. Sent each successful page-understanding result to the existing `/api/generate-director-suggestions` route for provider AI Director Suggestions.
4. Saved only summarized counts and warning text for documentation.

Not run:

- Browser UI inspection of AI Review cards or the full AI Camera Suggestions review surface.
- Browser `Create Draft Motion` helper creation.
- Browser read-only `Generate Audio Notes`.
- Manual accept/reject/edit actions.

Those remain useful follow-up verification because they require the interactive browser workflow rather than provider-route-only calls.

## Results Summary

| Practice image | Scenario | AI Page Understanding via `/api/analyze-page` | Provider AI Director Suggestions via `/api/generate-director-suggestions` | Motion roles | Timing hints | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `Screenshot 2026-06-17 161726.jpg` | Simple dialogue strip / two-character conversation | Completed; 3 panels, 4 speech regions, reading order `p1, p2, p3` | Completed; 3 suggestions | `pushIn`, `track` | `medium`, `slow` | Correctly summarized the three-panel dialogue/setup/payoff. Warnings called out panel framing as primary and speech/detail/action boxes as approximate support. |
| `Screenshot 2026-06-19 225400.jpg` | Simple dialogue gag / setup-payoff prop detail | Completed; 3 panels, 2 speech regions, 4 detail regions, reading order `p1, p2, p3` | Completed; 3 suggestions | `pushIn`, `track` | `medium`, `slow` | Correctly identified sunglasses as the prop/detail payoff. Warnings treated overlapping character/detail/action detections as one panel-level beat cluster. |
| `Screenshot 2026-06-17 145548.jpg` | Action page / multi-panel gag payoff | Completed; 6 panels, 7 detail regions, 6 action regions, reading order `p1, p2, p3, p4, p5, p6` | Completed; 6 suggestions | `pushIn`, `pushOut`, `track` | `medium`, `slow` | Correctly summarized the bird-feed sequence and final reveal. Warnings were appropriately cautious about broad/approximate action boxes and panel-level staging. |
| `Screenshot 2026-06-19 225425.jpg` | Establishing/context reveal / silent reaction sequence | Completed; 6 panels, 10 character regions, 5 action regions, reading order `p1, p2, p3, p4, p5, p6` | Completed; 6 suggestions | `pushIn`, `pushOut`, `track` | `medium`, `slow` | Correctly summarized the upward-looking setup and final "made you look" payoff. Warnings preserved the empty-room establishing beat as panel-level context. |

## Quality Findings

Page understanding:

- Pass: panel count matched the visible panels for all four supplied pages.
- Pass: reading order was correctly returned as left-to-right for three-panel strips and panel sequence `p1` through `p6` for six-panel pages.
- Pass: page summaries captured the core gag/setup/payoff for all four pages.
- Mixed: speech/detail/action counts were plausible but not manually pixel-verified in the browser overlay.

Provider AI Director Suggestions:

- Pass: suggestions were generated for every detected panel.
- Pass: movement stayed within the accepted `track`, `pushIn`, and `pushOut` grammar.
- Pass: dialogue/setup pages used restrained `track` plus selective `pushIn` rather than zooming every speech balloon.
- Pass: action/reveal pages used all three accepted roles where broader context or payoff emphasis was useful.
- Pass: timing hints stayed in `medium` and `slow`; no unsupported timing category or frantic default appeared.

T0109 tuning signal:

- Positive: warning copy repeatedly described raw detections as approximate support and panel boxes as primary shot units.
- Positive: beat-cluster warnings were understandable on pages with overlapping character/action/detail detections.
- Positive: setup/payoff and speaker-exchange pages did not produce one motion per speech balloon.
- No threshold change is justified from this run.

Browser AI Camera Suggestions review surface:

- Not run in browser.
- No conclusion should be drawn about card inspection, target highlighting, edit/reject controls, stale/blocked UI state, or Create Draft Motion controls from T0111.

Draft Motion:

- Not run in browser.
- Provider-route results suggest the browser review surface should have usable panel-first inputs, but Draft Motion creation was not verified interactively.

Audio Notes:

- Not run in browser.
- No conclusion should be drawn about BGM/SFX note usefulness from T0111.

Accepted-data boundary:

- Preserved. The run used provider routes and summarized temporary output only.
- No accepted Camera Shots, Focus Regions, Shot Attention Path items, Project JSON, preview/export behavior, audio, or SFX markers were mutated by this documentation pass.

## Follow-Up Recommendation

Recommended next ticket: T0112 - Browser Draft Motion and Audio Notes Practice Verification.

T0112 should use the same supplied practice images in the browser UI. It should inspect the full AI Camera Suggestions review surface and AI Review card highlighting, create temporary Draft Motion helpers from representative suggestions, generate read-only Audio Notes, and record whether the route-level quality observed in T0111 survives the interactive workflow. It should remain docs/reporting first unless a repeated browser-specific failure justifies a narrow source ticket.

## Manual Verification

For T0111:

- Confirm this document records real provider/model output for the four supplied practice images.
- Confirm it does not claim the full browser AI Camera Suggestions review surface, Draft Motion, or Audio Notes were run.
- Confirm no fixture assets were added by this ticket.
- Confirm no source files, package files, Project JSON schema, preview/export behavior, audio/SFX behavior, dependencies, OCR timing, parallax, character cutouts, segmentation animation, new motion roles, provider routes, or accepted-state mutation changed.
- Confirm T0112 is the next recommended ticket for browser UI verification.
