# DynamicManga Study Notes

## Why this matters

DynamicManga validates the project's core direction: preserve still comic or manga artwork, avoid full character animation as the default product path, and create storytelling motion through virtual camera movement over the existing page.

For Cinematic Comic Video Converter, the important lesson is that a still page can become cinematic when the system understands where the reader should look, why that moment matters, and how camera movement should support the story beat.

## Core pipeline

The DynamicManga pipeline can be summarized as:

- Element extraction: identify page structure such as panels, characters, and balloons.
- Semantic estimation: infer or assign motion, emotion, and story meaning from visual comic-language cues.
- Camera movement simulation: use that meaning to drive virtual pans, zooms, holds, transitions, duration, speed, and selective effects.

This maps directly to the project's long-term direction: build a manual-first editor now, then add suggestion-based automation later.

## Element extraction lesson

DynamicManga extracts panels, characters, and balloons so the camera simulator has meaningful page regions to work with.

Character extraction does not need to become perfect cutout masking for this project. Bounding regions or regions of interest can be enough for framing, attention, and timing decisions. That supports the current model:

- Camera shots are practical framing destinations.
- Focus regions are practical attention targets.
- The source page remains intact.

This project should not require users to manually extract every character or balloon. Future automation should suggest panels, text-heavy areas, and likely focus regions, then let users correct, accept, edit, delete, or ignore those suggestions.

## Semantic estimation lesson

DynamicManga estimates motion and emotion states from manga/comic visual language. The relevant cues include motion lines, background texture or intensity, balloon shape, and panel shape.

For this project, manual purpose tags are the practical first version of semantic intent. `shotPurpose` and `focusPurpose` let users say why a shot or focus region matters before the app tries to infer that automatically.

Later, those purpose values can drive:

- Shot duration.
- Focus attention timing.
- Transition choice.
- Camera movement speed.
- Camera movement path.
- Optional effects when justified by the story beat.

## Camera movement lesson

DynamicManga's camera movement idea includes pans, zooms, holds, transitions, and selective special effects. The important point is not the number of available effects. The important point is that movement type, path, and speed should depend on story purpose.

Sometimes the correct move is no movement. A hold may be better than a pan or zoom when the reader needs time to read dialogue, understand a relationship between elements, or absorb an emotional beat.

Shot duration should consider text and balloon reading needs. Dialogue-heavy shots usually need longer readable holds than short reaction or action beats.

## What we should borrow

- Page-preserving camera movement.
- ROI/framing-region logic.
- Motion/emotion/purpose-driven timing.
- Context-aware transition choice.
- Optional effects only when justified.

## What we should not copy yet

- Full automatic manga element extraction.
- Full character/balloon segmentation.
- Research-grade semantic inference.
- Mandatory automation.
- Character animation as the core product.

## Mapping to our project

- DynamicManga panel window -> our camera shot.
- DynamicManga ROI -> our focus region / attention target.
- DynamicManga motion/emotion state -> our `shotPurpose` / `focusPurpose` for now.
- DynamicManga camera simulator -> future purpose-driven timing / transition / camera grammar.

## Source reference

- DynamicManga: Animating Still Manga via Camera Movement, Ying Cao, Xufang Pang, Antoni B. Chan, Rynson W.H. Lau. Project/source reference: `https://www.cse.cuhk.edu.hk/~ttwong/papers/dymanga/dymanga.html`

## Product rule from this source

Every camera movement should have a reading or storytelling purpose.
