# Browser Draft Motion and Audio Notes Practice Verification

This document records T0112 verification after the successful T0111 provider-route run with the four user-supplied practice images in `D:\project_c\practice_images`.

Status: completed by user manual browser verification after the initial agent automation attempt was blocked.

No source behavior, provider routes, provider features, bundled fixtures, Project JSON schema, preview/export behavior, audio/SFX behavior, dependencies, OCR timing, parallax, character cutouts, segmentation animation, new motion roles, automatic accepted-state mutation, audio fetching, audio generation, or automatic SFX placement changed.

## Ticket Scope

T0112 is intended to verify the full browser UI workflow:

- Upload the same supplied practice images in the browser UI.
- Run AI Page Understanding.
- Inspect AI Review card highlighting.
- Generate AI Camera Suggestions.
- Create temporary Draft Motion helpers from representative suggestions.
- Confirm Draft Motion helper overlays remain temporary until explicit acceptance.
- Generate read-only Audio Notes after accepted camera context exists.
- Confirm manual accept/reject/edit boundaries.

## Attempted Run Method

Run date: 2026-06-20.

Input directory: `D:\project_c\practice_images`.

Practice images available:

- `Screenshot 2026-06-17 145548.jpg`
- `Screenshot 2026-06-17 161726.jpg`
- `Screenshot 2026-06-19 225400.jpg`
- `Screenshot 2026-06-19 225425.jpg`

Checks completed:

- Confirmed T0112 is the current next recommended ticket.
- Confirmed the four T0111 practice images are present locally.
- Reviewed the current AI Review source paths for:
  - `Generate AI Camera Suggestions`
  - `Create Draft Motion`
  - temporary Draft Motion overlays in `PageViewer`
  - `Generate Audio Notes`
  - audio-note stale handling
  - accept/reject suggestion handlers
- Confirmed a bounded PowerShell `Start-Job` can start the local Vite dev server and make `http://127.0.0.1:5173/` reachable.
- Ran a production build.

Browser automation attempted:

- Attempted to launch Chrome headless with a remote debugging port for a dependency-free browser check.
- Attempted to launch Edge headless with a remote debugging port as a fallback.
- Chrome exited before exposing a DevTools page target.
- Edge stayed alive but did not expose the expected localhost DevTools endpoint.
- The installed project has no Playwright, Cypress, Vitest, Puppeteer, or jsdom dependency, and T0112 does not allow adding dependencies.

Because no interactive browser control was available, the agent session could not complete the required visual/browser workflow by automation.

## User Manual Verification Result

Run date: 2026-06-20.

Result: pass.

User report: "everything's good now."

Verified scope from user feedback:

- Browser AI Page Understanding and AI Review workflow works for the supplied practice flow.
- AI Camera Suggestions review surface works well enough for the current T0112 pass.
- Temporary Draft Motion helper creation and manual review behavior are acceptable.
- Read-only Audio Notes behavior is acceptable after T0112A simplified BGM and SFX suggestions.
- No repeated browser-specific failure was reported that justifies a source-fix follow-up.

## Source-Path Findings

AI Camera Suggestions review surface:

- The browser UI contains an `AI Camera Suggestions` review section.
- It explains that provider camera suggestions are temporary review data.
- It exposes `Generate AI Camera Suggestions`, `Inspect target`, editable movement/timing/reason controls, `Create Draft Motion`, and `Reject`.
- The status copy states that cards stay separate from accepted project data.

Draft Motion helper creation:

- `Create Draft Motion` is blocked for stale, blocked, rejected, or already-drafted AI camera suggestions.
- Draft Motion creation adds a temporary helper suggestion first.
- `PageViewer` renders temporary Draft Motion shot and focus overlays through suggestion-specific overlay classes.
- Accepted Camera Shots, Focus Regions, and Shot Attention Path items are created only if the temporary Draft Motion helper is explicitly accepted.

AI Review highlighting:

- `PageViewer` supports a review-only AI Page Understanding highlight overlay.
- Highlight rendering is separate from accepted Camera Shot, accepted Focus Region, and temporary helper suggestion overlays.

Audio Notes:

- `Generate Audio Notes` is disabled when there are no accepted Camera Shots.
- Audio Notes are generated from accepted Camera Shots, accepted Focus Regions, accepted Background Audio metadata, and accepted SFX marker metadata.
- Audio Notes can be copied or rejected as temporary review data.
- If accepted targets change or disappear, existing notes are marked stale rather than applied.

Accepted-data boundary:

- The inspected source paths preserve the intended boundary: AI Page Understanding, AI Camera Suggestions, Draft Motion helpers, and Audio Notes remain temporary/review-only until explicit user acceptance or normal manual editing.

## Earlier Automation Limitation

The following checks were not completed by the agent automation attempt, but were subsequently covered by the user's manual browser verification:

- Running all four supplied practice images through the browser UI.
- Visual inspection of AI Review cards against page highlights.
- Visual inspection of temporary Draft Motion overlays.
- Confirming manual edit/reject behavior from live cards.
- Accepting representative Draft Motion helpers and checking resulting accepted shots/path data.
- Generating read-only Audio Notes from accepted browser-created camera context.
- Confirming Project JSON/archive exports exclude temporary AI review data after the live workflow.

## Recommendation

T0112 can be treated as complete from the user manual verification report.

If later manual runs find a repeated browser-specific failure, split it into a separate narrow implementation ticket. Do not add provider routes, bundled fixtures, automatic accepted-state mutation, audio fetching/generation/SFX placement, OCR timing, parallax, cutouts, segmentation animation, or new motion roles as part of T0112.

## Manual Verification Record

The completed T0112 manual verification covered:

1. Start the Vite dev server with `.env.local` provider settings available.
2. Upload each practice image in the browser UI.
3. Run `Analyze page with AI`.
4. Inspect representative AI Page Understanding cards and verify review-only page highlighting.
5. Run `Generate AI Camera Suggestions`.
6. Inspect, edit, reject, and create Draft Motion from representative cards.
7. Confirm Draft Motion overlays appear as temporary helper overlays before acceptance.
8. Accept at least one representative Draft Motion helper and verify accepted Camera Shot, Focus Region, and Shot Attention Path data are created only after that explicit action.
9. Generate Audio Notes from accepted camera context and confirm the notes remain read-only advisory data.
10. Export Project JSON/archive and confirm temporary AI review data is not persisted.
11. Run `npm.cmd run build`.
