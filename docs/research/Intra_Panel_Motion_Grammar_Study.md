# Intra-Panel Motion Grammar Study

## Purpose

This document studies how the project should move beyond simple guided camera movement.

The current product should not be treated as a basic "zoom to panel, then zoom to focus region" reader. The intended direction is a restrained cinematic comic system that interprets the visual energy already present inside static comic artwork.

The main design question is:

> How should camera motion express what is happening inside a panel, without turning the comic into full animation?

## Source Inspiration

This study is mainly inspired by the DynamicManga paper, which treats manga animation as camera movement over still artwork. The important lesson is not merely that manga pages can be animated with pan and zoom. The important lesson is that camera movement should be driven by panel content, visual cues, motion state, emotion state, and story pace.

For this project, that means motion polish should not be reduced to easing tweaks. Motion polish should become a small "motion grammar."

## Project Translation

### Current project concepts

The project currently has:

- Camera Shots
- Focus Regions
- Shot Attention Path
- Focus effects
- Motion roles
- Duration weights
- Preview playback

These are close to the article's ideas, but they need to be interpreted carefully.

### Better conceptual mapping

| Project concept | Better meaning |
|---|---|
| Camera Shot | The panel or scene-stage being interpreted |
| Focus Region | A visual attention anchor inside the shot |
| Shot Attention Path | The intended route of visual attention / internal movement |
| motionRole | The semantic reason for movement |
| durationWeight | How long the viewer needs to understand or feel the anchor |
| effectType | Optional visual treatment, not the movement itself |

The key point:

> Focus Regions are not mini-panels. They are motion anchors.

A Focus Region may guide the camera even when it has `effectType: none`. That is important because not every meaningful motion should be visually highlighted. Some motion should be felt only through camera drift, hold, or framing change.

## Why Simple Guided Camera Is Not Enough

A simple guided camera usually does this:

1. Show a panel.
2. Move to the first important region.
3. Move to the next important region.
4. Move to the next panel.

This produces readability, but it may still feel mechanical.

The target product needs more nuance:

1. Some panels should breathe slowly.
2. Some panels should hold still.
3. Some panels should push inward emotionally.
4. Some panels should reveal context by pulling outward.
5. Some panels should follow implied direction.
6. Some panels should scan across multiple subjects.
7. Some panels should preserve the reader's ability to understand speech and page composition.

The camera should not always be "active." Sometimes the best motion is almost no motion.

## Core Motion Principles

### 1. Motion should come from the artwork

The camera should respond to what the panel already suggests.

Possible visual cues:

- Character gaze direction
- Character body direction
- Action lines
- Speed lines
- Impact pose
- Speech bubble placement
- Large empty background
- Character scale inside the panel
- Close-up face or reaction
- Multiple subjects
- Reading order
- Revealed object or hidden information

The app does not need full AI recognition immediately. Manual Focus Regions and Shot Attention Path can act as human-authored versions of these cues.

### 2. Motion should preserve comic readability

The product should not erase the comic-reading feeling.

Avoid:

- Overly strong zoom
- Constant movement
- Repeated reset to default framing
- Random drifting
- Too many visual effects stacked together
- Flash-like background changes between short focus moments

Prefer:

- Restrained camera travel
- Stable holds
- Gentle transitions
- Clear reading order
- Enough time for speech bubbles
- Context-preserving zoom-out when needed

### 3. Camera movement should have semantic purpose

Every motion should answer:

> Why is the camera moving here?

Possible purposes:

- Establish space
- Transfer attention
- Emphasize reaction
- Reveal emotion
- Follow action
- Reveal context
- Create tension
- Slow the reader down
- Preserve reading order
- Exit the panel

If no purpose is clear, the camera should stay mostly stable.

### 4. Motion should be continuous inside a shot

Within one Camera Shot, attention anchors should form one continuous path.

Bad:

> base shot -> FR1 -> reset -> FR2 -> reset -> FR3

Better:

> base shot -> FR1 -> FR2 -> FR3 -> settle or exit

T0063 directly supports this foundation.

### 5. Motion style should depend on panel energy

The paper's useful lesson is that speed and movement should respond to motion/emotion state.

For our project, we can approximate this with manual or semi-manual metadata:

| Panel / shot feeling | Motion behavior |
|---|---|
| Calm dialogue | stable hold, small pan, slow ease |
| Emotional close-up | slow push-in, longer hold |
| Sad / quiet | minimal movement, soft settle |
| Anxious / tense | slight instability, shorter hold, tighter framing |
| Fast action | directional pan, faster travel, possible shake later |
| Establishing view | slow scan or pullback |
| Reveal | begin narrower, then open to context |
| Multi-character exchange | attention transfer between anchors |

## Proposed Motion Role Grammar

### `hold`

Purpose: Let the reader absorb the region.

Behavior:

- Very little camera movement.
- Longer dwell.
- Good for speech bubbles, important objects, or emotional pauses.
- Should not add aggressive zoom.

### `pushIn`

Purpose: Increase intimacy, emotion, or importance.

Behavior:

- Slight zoom toward the anchor.
- Should be slow unless the shot is action-heavy.
- Best for face, reaction, object reveal, important detail.

### `pullBack`

Purpose: Restore context.

Behavior:

- Starts from a tighter anchor and moves outward.
- Useful after a close-up, reveal, or emotional beat.
- Good for showing relationship between character and environment.

### `drift`

Purpose: Create subtle life without changing narrative focus.

Behavior:

- Small pan across available panel space.
- Best for calm panels, background, or transitional shots.
- Should be nearly invisible when the panel is text-heavy.

### `transfer`

Purpose: Move attention from one subject to another.

Behavior:

- Pan from one anchor to the next.
- Should respect reading order unless manually overridden.
- Best for dialogue exchange, reaction sequence, or multiple ROIs.

### `track`

Purpose: Follow implied movement.

Behavior:

- Camera moves in the direction suggested by the subject, pose, gaze, or action line.
- Best for motion lines, running, striking, falling, flying, or directional action.
- Should not be used without a clear directional cue.

### `reveal`

Purpose: Delay information, then expose it.

Behavior:

- Start from a partial or less informative area.
- Move or zoom to reveal the important subject, object, face, or context.
- Should feel intentional, not like random scanning.

### `emphasis`

Purpose: Give weight to a moment.

Behavior:

- Small push, short hold, or subtle settle.
- Should be restrained.
- Useful for dramatic object, expression, impact, or final beat in a shot.

## Effect Type vs Motion Role

`effectType` should not be treated as the main motion system.

It should mean:

> What visual treatment is applied to the Focus Region?

It should not mean:

> Why does the camera move?

Therefore:

- `effectType: none` can still guide camera motion.
- `effectType: spotlight` can visually emphasize an anchor without changing the movement too much.
- `effectType: lift` should be used carefully because it can feel detached from the page.
- `effectType: zoom` should not automatically mean aggressive camera zoom.
- Motion role should decide movement style.
- Effect type should decide visual treatment.

## Duration and Pacing Rules

Duration should depend on what the viewer must process.

Longer duration:

- Speech bubble
- Complex face/reaction
- Important reveal
- Large amount of visual detail
- Emotional pause
- Establishing scene

Shorter duration:

- Fast action
- Small visual cue
- Transitional anchor
- Simple directional movement
- Non-text visual emphasis

Important rule:

> Reading time should dominate action speed when text is involved.

A fast action panel with a speech bubble still needs enough time to read.

## Shot-Level Motion Profiles

Later, we may introduce shot-level motion profiles. These should not be implemented immediately, but they are useful design targets.

### Calm Reading

- Slow transitions
- Longer holds
- Minimal effect use
- Good for dialogue and exposition

### Cinematic Drama

- Slight push-ins
- Delayed reveals
- Stronger hold on emotional anchors
- Good for reactions and tension

### Action Energy

- Faster travel
- Directional movement
- Optional shake / motion blur later
- Good for speed lines and impact panels

### Establishing / Orientation

- Slow scan
- Pullback to panel context
- Avoid too many close-ups
- Good for scene setup

### Detail Discovery

- Move from context to object
- Hold on object
- Return or pull back if needed
- Good for clues, weapons, letters, symbols, or important props

## Implications for the Roadmap

### T0063 should stay narrow

T0063 should only fix continuity between attention anchors.

It should not decide the full motion grammar.

### Roadmap sync ticket

After T0063, create a docs-only ticket:

> T0064 - Intra-Panel Motion Grammar Study

Purpose:

- Add this document to the repo.
- Compare the current project model against article-inspired motion principles.
- Identify which current concepts are enough and which need refinement.
- Do not change runtime behavior yet.

T0064 has since been implemented as `T0064 - Intra-Panel Motion Grammar Roadmap Sync`, promoting this study into active roadmap context and delaying export parity until motion-role grammar and browser-preview behavior are better defined.

### Next implementation directions after study

Current and future directions after T0064:

- `T0065 - Motion Role Behavior Definitions`
  - Define concrete behavior for each motionRole.
  - Implemented as docs/model only.

- `T0066 - Preview Applies Motion Role Profiles`
  - Make preview movement differ based on motionRole.
  - Keep changes restrained.

- Motion verification scene set
  - Create manual test cases:
    - calm dialogue
    - emotional close-up
    - fast action
    - establishing panel
    - reveal panel
    - multi-subject attention transfer

- Text-aware duration planning
  - Later, duration should account for speech bubble / reading time.
  - This may stay manual until OCR exists.

- Optional special motion treatments
  - Shake, motion blur, moving speed-line impression, or other effects.
  - Should be delayed until core camera grammar feels good.

## Product Direction Statement

The project should not become a generic motion comic editor or a simple Guided View clone.

The target is:

> A restrained cinematic comic converter that keeps the original page artwork intact, while using camera motion to reveal the panel's internal attention, emotion, and implied movement.

The camera should feel like it is interpreting the comic, not decorating it.

## Design Guardrails

Do not over-animate.

Do not make every Focus Region visually pop.

Do not make every anchor zoom.

Do not reset to default framing between anchors.

Do not treat Focus Regions as separate panels.

Do not optimize only for smoothness; optimize for readable story motion.

Do not let motion effects overpower the artwork.

Prefer restrained movement with clear purpose.

## Manual Evaluation Questions

When testing motion polish, ask:

1. Does the motion help me understand the panel?
2. Does the motion match the drawing's implied energy?
3. Does the camera preserve reading order?
4. Does the viewer have enough time to read text?
5. Does the motion feel continuous?
6. Does the motion feel too decorative?
7. Does the page still feel like a comic page?
8. Does the shot have a reason to move?
9. Would stillness be better here?
10. Does the motion reveal emotion, action, or context?

## Source Notes

- The DynamicManga paper's pipeline is element extraction, semantic estimation, and camera movement simulation.
- The paper treats camera movement as driven by manga semantics, not only by reading order.
- The paper's useful categories include panel motion state, emotion state, camera movement type, path, speed, and duration.
- The paper's camera rules include establishing scans, motion-line following, emotional zooms, multiple-ROI panning, and context-restoring zoom-outs.
- The paper's comparison suggests that naive ROI panning is weaker than semantic, content-aware camera movement.

Reference:

- `tmm16b.pdf` / DynamicManga paper, previously used in project research notes.

## Current Conclusion

T0063 fixed the foundation continuity problem: accepted attention anchors should feel like one continuous intra-shot path rather than separate reset moments.

T0065 has formalized the current motion-role grammar. The next runtime step can apply those role profiles in browser preview while keeping export parity delayed.

The next real design milestone is not "smoother guided camera."
The next design milestone is:

> semantic intra-panel camera motion.
