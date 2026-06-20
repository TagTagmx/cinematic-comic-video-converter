# Research Sources

## DynamicManga: Animating Still Manga via Camera Movement

- Authors: Ying Cao, Xufang Pang, Antoni B. Chan, Rynson W.H. Lau.
- Source reference: `https://www.cse.cuhk.edu.hk/~ttwong/papers/dymanga/dymanga.html`
- Note: Foundational research source for camera-based animation of still manga.
- Repo usage: Summarized as design inspiration only. Do not commit the PDF unless redistribution rights are confirmed.

## Comixology / Kindle Guided View user experience

- Source reference: Amazon/Kindle/Comixology Guided View product documentation and reader-facing app behavior.
- Note: Product/user-experience reference for guided reading, full-page context, panel close-ups, transition settings, and reader pacing control.
- Repo usage: Summarized as product inspiration. Avoid copying proprietary UI or copyrighted content.

## DynamicManga + Guided View combined lesson

- DynamicManga gives director logic.
- Guided View gives reader comfort/orientation logic.
- This project should merge them into a cinematic guided-view editor.

The combined product direction is:

- Preserve the page.
- Use camera shots as main framing destinations.
- Use focus regions as attention targets.
- Use purpose to drive timing, transitions, and camera motion.
- Keep automation suggestion-based and editable.

## Intra-Panel Motion Grammar Study

- Repo note: `docs/research/Intra_Panel_Motion_Grammar_Study.md`
- Source basis: DynamicManga-inspired camera movement over still comic artwork, interpreted through the project's Camera Shot, Focus Region, Shot Attention Path, `motionRole`, `durationWeight`, and `effectType` concepts.
- Roadmap usage: Promoted into active roadmap context by T0064. T0065 defines the current motion-role behavior grammar. Export parity remains delayed until browser preview role behavior is implemented and stabilized.
- Product lesson: The target is not simple guided camera movement. The target is semantic intra-panel camera motion that expresses panel energy, attention, emotion, and implied motion while preserving comic readability.
