# Cinematic Guided View Model

This document records the product direction reset for Cinematic Comic Video Converter.

The product direction is a manual-first, AI-ready, page-preserving cinematic guided-view editor. It is not full character animation, not destructive panel extraction, and not an effects-first video toy.

The intended experience is closer to a directed reading path over an intact comic page: the user keeps the page as the world, places camera shots as main framing destinations, marks focus regions as attention targets, and shapes pacing so the reader understands where to look and when.

## Product Identity

The product should become a semi-automatic cinematic guided-view editor.

Core identity:

- The source comic page remains intact.
- The page is the world.
- Camera shots define panel/scene reading containers and main timeline destinations for the fixed 16:9 preview/export stage.
- Focus regions are reusable page-level attention targets inside or near those shots, not replacement camera frames.
- Shot attention paths let each camera shot reference ordered focus regions for future intra-shot attention/motion.
- Camera movement should guide the reader's eye and support story pacing.
- Effects are secondary to reading purpose, story purpose, and transition purpose.
- Manual editing remains required and valuable.
- Future automation should suggest, not replace, user correction.

The editor should help a user produce an intentional guided reading sequence from one page before it tries to produce a polished final video or automate creative decisions.

## Inspirations

DynamicManga-style direction is useful because it shows how still comic and manga pages can feel cinematic through camera movement, holds, emphasis, and semantic pacing. The lesson is not "add more effects." The lesson is that camera movement should express story beats and guide attention over existing art.

Comixology/Kindle Guided View-style reading is useful because it emphasizes orientation and readability. The reader should understand the full-page context, then move through guided close-ups at a readable pace while retaining user control. Guided View teaches that the sequence exists to support reading, not to hide the page or overwhelm it.

Together, these references point toward a cinematic guided-view model:

- Start from page context.
- Move through readable story beats.
- Use close-ups only when they clarify attention.
- Let the user control and correct the path.
- Preserve the source artwork as the stable foundation.

## Research Anchors

Research and product-experience notes are tracked separately:

- [DynamicManga Study Notes](research/DynamicManga_Study_Notes.md)
- [Guided View User Experience Notes](research/Guided_View_User_Experience_Notes.md)
- [Research Sources](research/Research_Sources.md)

## Camera Shots

Camera shots are flexible panel/scene reading containers and the main timeline destinations.

They answer: what panel, scene area, or reading container should be visible for this story beat?

Current direction:

- Camera shots remain manually editable.
- Camera shots are stored in source image coordinates.
- Camera shots are flexible subject regions that carry reading intent.
- Camera shots are not fixed output-ratio frames.
- Camera shots are not merely crop boxes; they define the story beat container that preview/export fits into the output stage.
- The preview/export stage remains fixed 16:9 unless a future ticket changes output aspect ratio behavior.
- The renderer should fit the camera shot subject region into the fixed 16:9 stage rather than destructively cropping the page.

Every camera move should eventually have a purpose such as:

- Establishing page or scene context.
- Moving to the next reading beat.
- Holding long enough for text or visual comprehension.
- Revealing a reaction, action detail, or relationship between panels.
- Exiting a page or preparing the next beat.

Until that purpose model exists, new effect work should be treated cautiously.

## Focus Regions

Focus regions are reusable page-level attention targets.

They answer: what part of the page can deserve attention during or after a shot?

Current direction:

- Keep focus regions.
- Keep them page-level by default.
- Keep them free-ratio because panels, speech bubbles, faces, objects, and action details are not always 16:9.
- Do not treat focus regions as replacement camera frames.
- Do not make focus regions shot-owned timeline data.
- Deleting a camera shot should not delete page-level focus regions.

Focus regions can support emphasis, sequencing, timing, intra-shot attention, intra-shot motion, and future automation. They should not become the primary framing system.

## Shot Attention Path

Shot Attention Path is a model-level bridge between camera shots and focus regions.

It answers: which page-level focus regions should this camera shot use as ordered attention or motion keys?

Current model direction:

- A shot attention path belongs to a camera shot.
- It stores an ordered list of references to existing page-level focus regions.
- It does not copy focus-region geometry into the shot.
- It does not transfer focus-region ownership to the shot.
- It does not make focus regions replacement camera frames.
- It is intended to realize intra-shot motion and attention inside the camera shot's panel/scene reading container.
- It has model+persistence support and manual inspector controls.
- Browser preview uses it for focus attention when a usable explicit path exists.
- Canvas video export must not use it until explicitly ticketed.

Automatic browser preview prefers explicit shot attention paths when they exist and include at least one usable focus-region reference. If no usable explicit path exists for a shot, browser preview falls back to the current intersection-based eligible focus-region behavior. Future export can adopt the same preference in a separate parity ticket.

Manual tap-through preview currently advances camera shot by camera shot. A future manual mode can optionally step through attention keys inside a shot by following its shot attention path.

## Shot And Focus Purpose Model

T0041 adds a shared purpose vocabulary for camera shots and focus regions. Purpose describes reading and storytelling intent. It does not change preview behavior, export behavior, timing, or visual effects by itself.

`shotPurpose` describes why a camera shot exists in the guided reading sequence. It should answer questions such as whether the shot establishes context, carries dialogue, shows an action beat, supports a reveal, or bridges to another scene beat.

`focusPurpose` describes why a focus region deserves attention during or around a shot. It should answer what the reader should notice, understand, or feel from that attention target.

Allowed purpose values:

- `establishing`: Orient the reader to the page, scene, location, or relationship between page elements.
- `panel`: Follow a normal panel or reading-order beat.
- `dialogue`: Give readable time and attention to dialogue or text-heavy content.
- `reaction`: Emphasize a character response, glance, pause, or expression after an event or line.
- `emotion`: Slow down on mood, intimacy, tension, fear, surprise, or other emotional weight.
- `action`: Move quickly through impact, motion, fighting, chase, or high-energy visual beats.
- `detail`: Draw attention to a small object, clue, gesture, background element, or visual detail.
- `reveal`: Delay or stage attention so new information lands clearly.
- `transition`: Bridge between beats, locations, panels, or scene states.
- `other`: Preserve manual flexibility when none of the named purposes fit.

Purpose differs from focus region `kind`. `kind` describes what a focus region is on the page, such as panel, speech, face, detail, action, or other. `focusPurpose` describes why that region matters to the guided sequence.

Purpose also differs from focus region `effectType`. `effectType` describes the optional visual treatment, such as lift, spotlight, zoom, or none. `focusPurpose` describes the reading or storytelling reason for attention before any treatment is chosen.

Focus regions remain page-level attention targets, not replacement camera frames. Camera shots remain the main framing destinations and reading containers for the fixed 16:9 preview/export stage. Manual editing remains required and valuable, and there is no automatic purpose assignment in T0041.

Later tickets can use purpose to support timing defaults, transition purpose, Guided View-style page enter/page exit behavior, manual tap-through reading, and suggestion-based automation. Those later systems should suggest and correct rather than replace user control.

## Transition Purpose Model

T0044 adds a transition purpose vocabulary for classifying why the sequence moves from one camera shot to the next. Transition purpose is metadata for reading and storytelling intent. It does not change preview behavior, export behavior, timing, focus effects, or camera framing by itself.

`outgoingTransitionPurpose` describes the transition from the current camera shot to the next camera shot in timeline order. It is optional and may be absent, especially on the final shot or in older project JSON.

Allowed transition purpose values:

- `orientation`: Move in a way that helps the reader understand page, scene, spatial, or character context before the next beat.
- `reading`: Move cleanly through normal reading order, preserving comprehension and pacing between adjacent beats.
- `cinematic`: Use the transition as a directed dramatic move, such as tension, emphasis, energy, or a stylized reveal, without changing the underlying camera-shot contract.
- `sceneChange`: Bridge a stronger shift in location, time, subject, or story state.

Transition purpose differs from `shotPurpose`. `shotPurpose` describes why a camera shot exists as a destination or story beat. `outgoingTransitionPurpose` describes why the movement away from that shot toward the next shot exists.

Transition purpose also differs from `focusPurpose`. `focusPurpose` describes why an attention target matters inside or near a shot. Transition purpose describes the connective movement between camera shots and does not make focus regions replacement camera frames.

Transition purpose also differs from the planned shot attention path. Transition purpose describes why the sequence moves from one camera shot to the next. Shot attention path describes ordered attention keys inside one camera shot.

Manual editing remains required and valuable. T0044 only defines and persists transition purpose metadata; it does not add automatic transition generation, transition UI, timing changes, new focus effects, OCR, AI, audio, or production rendering changes.

## Guided Page Enter And Exit

T0045 adds explicit browser-preview options for orienting the reader with full-page context at the beginning and end of playback.

`guidedPageOptions.showPageEnter` enables a preview-only full-page fitted view before the first camera shot. The full page remains intact, then preview moves into the first camera shot as the main framing destination.

`guidedPageOptions.showPageExit` enables a preview-only move from the final camera shot back to a full-page fitted view before playback stops.

These options are manual user choices. They do not change camera shot geometry, focus region geometry, transition purpose metadata, focus-region visual effects, or canvas video export behavior. Camera shots remain the main sequence destinations, and focus regions remain attention targets.

## Effects And Purpose

The project has explored lift/pop-out, spotlight, zoom, focus sequencing, transition motion, and style presets. Those features are existing optional focus treatments; they should not define the product identity or become the flagship behavior.

The reset direction is:

- Keep lift as an optional dramatic effect.
- Stop treating lift/pop-out as the default or flagship focus behavior.
- Freeze focus style presets as experimental until shot purpose and focus purpose exist.
- Do not add new focus effects for now.
- Pause additional export/effect parity polish after current MVP stabilization unless it fixes a bug.

The next meaningful design layer is purpose, not more visual treatments:

- Why does this shot exist?
- Why is this focus region active?
- Why does this transition move this way?
- Is the reader being oriented, guided, surprised, slowed down, or moved forward?

## Future Automation

Automation should be correction-based.

Later systems may detect or suggest:

- Panels.
- Text-heavy areas.
- Likely focus regions.
- Reading order.
- Timing based on text density.
- Draft camera paths.
- Shot attention paths that reference page-level focus regions.
- Shot and focus purpose labels.

The user should be able to accept, edit, delete, reorder, and override those suggestions. Automation should speed up manual direction without removing manual control.

Do not implement automatic panel detection, OCR, AI, audio, multi-page support, or production rendering until specific tickets request them.

## Feature Direction: Keep, Freeze, Deprecate, Later

### Keep

- Camera shots.
- Focus regions.
- Shot attention path as the next planned semantic bridge.
- Fixed 16:9 preview/export stage.
- Manual editing.
- JSON/archive project persistence direction.

### Freeze

- Focus style presets.
- Additional focus effect polish.
- Export/effect parity polish beyond MVP stabilization.

### Deprecate as default

- Lift/pop-out as the default focus behavior.
- Simple focus-region kind buttons as a major roadmap item.

### Later

- Shot/focus purpose.
- Transition purpose.
- Page enter/page exit guided view behavior.
- Manual tap-through reader mode.
- Shot attention path data and controls.
- Panel detection suggestions.
- OCR/text-weight timing.
- Smart camera path draft generation.
- AI assistance.

## Roadmap Guidance

Near-term roadmap decisions should favor:

- Clarifying shot, focus, and transition purpose.
- Clarifying shot attention paths before automation.
- Improving manual correction and readability.
- Preserving page context.
- Keeping existing focus features available but no longer treating them as the main creative direction.

Near-term roadmap decisions should avoid:

- New focus effects.
- More effect presets.
- Treating export/effect parity as the main path after MVP stabilization.
- Reviving simple focus-region kind buttons as-is.
- Adding automation before the manual purpose and attention-path model is clear.

The stronger replacement for simple kind buttons is a shot/focus purpose model. It should describe what each shot and focus target does for the reader rather than only labeling what object type it contains.

Before panel detection suggestions become the immediate roadmap focus, the project should first add a narrow shot attention path model and manual controls so suggested panels or regions have a clear editable destination.
