# Guided View User Experience Notes

## Why this matters

Guided View is not mainly cinematic animation. It is reader orientation and readability.

For this project, Guided View-style reading is the usability anchor. Camera movement should first help the reader understand the page, follow the intended order, read comfortably, and keep enough spatial context to avoid feeling lost.

## User-experience lessons

- Readers like full-page context before and after guided close-ups because it helps them understand the page layout.
- Close-up panels make small-screen reading easier when the original page is too dense or text is too small.
- Transition speed and control matter because some readers prefer quick movement while others need slower orientation.
- Manual or tap-through pacing matters because readers read at different speeds.
- Guided view can hurt pages designed as full-page compositions, splash pages, maps, diagrams, or dense layouts where the whole page is the experience.
- Guided mode should be optional and adjustable rather than mandatory.

## Transition lessons

Transitions should preserve spatial orientation when that helps the reader.

Useful transition patterns:

- Full page -> shot: orient the reader before entering a close-up.
- Shot -> nearby shot: use spatial pan/zoom when the movement helps preserve location on the page.
- Unrelated or awkward movement: use fade, blur, or a neutral transition instead of forcing a confusing camera move.
- Page or scene changes: use stronger transitions when the sequence crosses a larger story boundary.

Transition choice should be based on reader clarity first. Cinematic expression can be layered on top only after orientation is safe.

## Design implications for this project

- Add page enter/page exit options later.
- Support manual tap-through preview later.
- Allow transition speed/mask strength options later.
- Avoid over-fragmenting splash pages and full-page compositions.
- Treat the page as the world and shots/focus regions as destinations.

## Source references

- Kindle/Comixology Guided View product behavior and user experience are treated as product inspiration, not copied UI. Amazon/Kindle reader references describe Guided View-style panel-by-panel comic reading and app-level reading controls.
- Public reader discussions and product documentation commonly emphasize panel close-ups, full-page orientation, reading control, and transition comfort. These notes summarize product lessons only and do not copy proprietary UI or copyrighted comics.

## Product rule from this source

Guide the reader's eye before adding cinematic expression.
