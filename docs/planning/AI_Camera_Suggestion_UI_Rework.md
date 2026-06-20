# AI Camera Suggestion UI Rework

T0099A is a UI-only pass over the AI Review browser workflow after Draft Motion and Audio Notes were manually verified. The responsive simplification pass repairs the narrow-sidebar layout seen in browser screenshots.

## Implemented Shape

- AI Review now shows a compact workflow strip for Evidence, Camera, Draft Motion, and Audio.
- The workflow strip uses compact count pills instead of tall narrow summary cards.
- AI Page Understanding is labeled as raw AI evidence.
- AI Camera Suggestions are labeled as temporary camera suggestions and remain grouped by source panel.
- Draft Motion helpers have their own temporary section and visually distinct styling.
- Audio Notes remain a separate read-only advisory section.
- Camera suggestion card faces show only title/status, motion summary, one short reason, and short actions.
- Long camera suggestion details stay behind Inspect controls.
- Draft Motion path/object details stay behind Inspect draft objects.
- Normal UI words should not split into letter fragments at the current sidebar width.
- Action buttons wrap as readable buttons instead of overlapping card content.

## Preserved Boundaries

- Provider routes and prompts did not change.
- AI output contracts did not change.
- Project JSON/schema did not change.
- Accepted Camera Shot, Focus Region, and Shot Attention Path creation still happens only when a Draft Motion helper is explicitly accepted.
- Preview/export behavior did not change.
- Motion roles, rulebook behavior, audio apply behavior, OCR/panel detection, and automatic object creation did not change.

## Manual Verification

Use a local dev browser session with `OPENAI_API_KEY` available in `.env.local` if provider calls are required.

1. Upload a practice image.
2. Run AI page understanding.
3. Generate AI Camera Suggestions.
4. Confirm Evidence, Camera, Drafts, and Audio pills are readable and compact.
5. Confirm Camera Suggestion cards do not overlap, buttons do not cover text, and normal words are not split into fragments.
6. Inspect suggestion cards and confirm source highlights still work.
7. Create Draft Motion from a camera suggestion.
8. Confirm Draft Motion appears in Drafts as temporary review data.
9. Reject a camera suggestion and confirm accepted project data is unchanged.
10. Reject Draft Motion and confirm accepted project data is unchanged.
11. Accept Draft Motion and confirm normal Camera Shot, Focus Region, and Shot Attention Path records are created only then.
12. Generate Audio Notes if accepted shots exist and confirm they remain read-only/advisory.

Build verification: `npm.cmd run build`.
