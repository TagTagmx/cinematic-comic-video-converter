# Cinematic Comic Video Converter

A tool that turns uploaded comic page images into cinematic motion videos by moving a virtual camera across the full page.

The core idea is simple:

> Keep the comic page intact. Move the camera intelligently.

Instead of destructively cropping comic panels, the app treats the whole page as a large canvas. The user or system defines camera shots over that page, then the renderer creates a video using pan, zoom, hold, and transition movements.

## MVP Goal

The first version should let a user:

1. Upload one comic page image.
2. View the page in an editor.
3. Create and adjust camera shot rectangles over the page.
4. Arrange shots in a timeline.
5. Preview basic pan-and-zoom movement.
6. Export or prepare data for video rendering.

The first MVP does **not** need full AI panel detection, character animation, speech recognition, or automatic sound design.

## Core Principles

- The original page image remains the source canvas.
- Do not crop panels destructively.
- Camera shots are viewport regions over the full page.
- Manual control comes before automation.
- AI assistance should be added only after the manual editor works.
- Small scoped tickets are safer than one large "build everything" task.

## Suggested Stack

Frontend:

- React
- TypeScript
- Vite
- Canvas or SVG overlay for camera boxes
- Local project JSON state

Rendering:

- Early MVP: browser preview only
- Later: FFmpeg or MoviePy backend for MP4 export

Possible backend later:

- Python
- FastAPI
- OpenCV
- FFmpeg/MoviePy

## Project Workflow

Use ChatGPT as the planner and Codex as the scoped implementation worker.

1. Plan or update docs with ChatGPT.
2. Select one ticket from `docs/Tickets.md`.
3. Ask ChatGPT for the Codex prompt.
4. Give Codex only that ticket.
5. Run build/tests/manual checks.
6. Paste Codex's completion report back to ChatGPT.
7. Update `docs/Repo_Current_State.md`.
8. Move to the next ticket.

## Documentation Map

- `AGENTS.md` - repo-level rules for Codex.
- `docs/README.md` - index for the organized documentation folders.
- `docs/planning/Full_Design_Document.md` - full project concept.
- `docs/planning/MVP_Technical_Design.md` - MVP architecture and data model.
- `docs/model/Camera_Frame_vs_Focus_Region.md` - design note for the fixed 16:9 preview frame, flexible camera shots, and page-level focus regions.
- `docs/Tickets.md` - implementation tickets.
- `docs/Manual_Verification_Guide.md` - how to manually test each feature.
- `docs/Repo_Current_State.md` - living record of current repo status.
- `docs/Known_Issues_And_Followups.md` - issues and future work.
- `docs/Codex_Ticket_Handoff_Template.md` - reusable prompt template for Codex.

