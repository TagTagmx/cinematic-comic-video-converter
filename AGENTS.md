# AGENTS.md

This file defines the working rules for AI coding agents in this repository.

## Project Identity

Project name: Cinematic Comic Video Converter

Purpose: Turn uploaded comic page images into cinematic videos using virtual camera movement over the full page.

The system should not try to perfectly cut panels out of the page in the MVP. The page remains intact, and camera shots define what part of the page is visible at each moment.

## Core Product Rules

1. The source comic page image is the base canvas.
2. Do not destructively crop panel art.
3. Camera shots are rectangular panel/scene reading containers over the full page, not fixed output-ratio frames or mere crop boxes.
4. The preview/export stage should remain 16:9 unless a future ticket explicitly changes output aspect ratio behavior.
5. Camera shot boxes are flexible panel/scene reading containers that should be contained inside the fixed preview/export stage.
6. Free-ratio panel/detail marking should be implemented as page-level focus regions, not by making focus regions shot-owned timeline data.
7. Future shot attention paths should reference page-level focus regions from camera shots; they should not transfer focus-region ownership or make focus regions replacement camera frames.
8. Project JSON is the source of truth for page, shot, and timeline state.
9. Manual editing comes before AI automation.
10. AI panel detection should not be implemented until a specific ticket asks for it.
11. Video export should not be implemented until a specific ticket asks for it.
12. Keep rendering/preview logic separate from editor UI state.

## Codex Working Rules

When implementing a ticket:

1. Implement only the assigned ticket.
2. Do not add future-ticket features.
3. Do not refactor unrelated code.
4. Do not introduce new dependencies unless the ticket explicitly allows it or there is a clear reason.
5. Prefer simple, readable TypeScript over clever abstractions.
6. Keep components small and focused.
7. Preserve existing behavior unless the ticket says otherwise.
8. Run available checks before finishing.
9. Report exactly what changed.

## Required Completion Report

At the end of every Codex task, provide:

```txt
Summary:
Files changed:
Commands run:
Build/test results:
Manual verification steps:
Risks or limitations:
Suggested follow-up tickets:
Docs that should be updated:
```

## Branching Rule

Use one branch per ticket when possible.

Example:

```txt
feature/t0001-project-skeleton
feature/t0002-image-upload
feature/t0003-page-viewer
```

## Non-Goals Unless Ticketed

Do not implement these unless the current ticket explicitly requests them:

- Full AI panel detection
- OCR
- Speech bubble recognition
- Face detection
- Character cutouts
- Parallax animation
- Audio/music/sound effects
- MP4 export
- Multi-page project support
- Cloud storage
- Authentication
- Payments

