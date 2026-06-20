# Tickets

This file lists scoped implementation tickets.

Codex should implement one ticket at a time.

Historical implemented tickets may contain older wording from the feature state at the time they were written. For current roadmap priority and stale-concept demotion, use `docs/model/Roadmap_Status_Classification.md` and `docs/model/Shot_Attention_Path_Motion_Semantics.md` as the current status layer.

The active product direction is now a semi-automatic cinematic comic motion editor. Camera Shots define the larger shot/panel space, Focus Regions are camera anchors inside a shot, and Focus Regions are not independent decorative visual-effect boxes. The accepted baseline browser-preview grammar is `track`, `pushIn`, and `pushOut`: Track v2 is stable-scale pan/glide eye guidance between Focus Regions for normal reading flow; `pushIn` is deliberate zoom-in for emphasis, reaction, threat, realization, or inspection; `pushOut` is deliberate zoom-out for context restoration, reveal, environment, or relationship. Multiple FRs should usually default to `track` unless there is a clear meaning reason for push-in/out. The accepted browser-preview baseline also includes the restrained shot-to-shot travel veil: smoother eased travel, a subtle midpoint dim/softness peak, and a clear image again on arrival. Old Focus Region effect playback (`lift`, `spotlight`, `zoom`, and reveal masking) has been removed from active browser preview/UI direction; legacy `effectType` fields remain import/export compatibility data. T0068 export parity has now been implemented against the accepted browser-preview baseline and must continue not to revive rejected visual language. The manual guided-view foundation is stable enough for carefully scoped MVP+ polish. Special effects are now planned as rendering-layer modifiers on top of existing camera placement only; they must not create new shot geometry, Focus Region ownership rules, timeline ownership systems, or motion roles. AI now resumes as a director-assistant roadmap: AI may suggest mood, motion intent, effects, cue timing, draft attention paths, later draft Camera Shot / Focus Region candidates, audio direction ideas, and future vision/page-understanding candidates for review, but accepted project data must change only through explicit user action. Motion suggestions must stay target-bound to existing Shot Attention Path items and existing referenced Focus Regions. Audio suggestions must stay advisory unless a later ticket explicitly scopes safe apply behavior. Future vision/page-understanding suggestions are the real AI value layer; current JSON/mock notes are scaffolding. The review surface, future response contract, director knowledge rules, and provider/budget/privacy decision gate have been planned. T0090 adds a narrow real OpenAI page-understanding spike through a local provider proxy; results remain temporary review data and accepted project data is not mutated automatically. T0090A cleans the normal AI Review UI so real page analysis is primary and stale test suggestion controls are no longer user-facing. T0091 hardens provider result validation before rendering and keeps page-understanding output temporary and review-only. T0092 highlights selected/hovered page-understanding cards on the source page as review-only SVG overlays using explicit analyzed-image geometry from the provider response. T0093 adds provider-backed AI Director Suggestion cards from the existing page-understanding result; cards use semantic page evidence and approximate region hints, stay review-only, and do not create or edit Camera Shots, Focus Regions, Shot Attention Paths, or Project JSON.

## Completed Implementation Ticket - T0100A Track v2 Stable-Scale Eye-Guidance Motion

Goal: redefine `track` as calm/default eye-guidance camera movement rather than a spotlight/rail attention effect.

Implemented changes:
- Updated the accepted motion grammar: `track` is stable-scale FR-to-FR pan/glide for normal reading guidance; `pushIn` is deliberate emphasis/inspection; `pushOut` is deliberate context/reveal/restoration.
- Added the durable rule that multiple Focus Regions usually default to `track`; do not use push-in/out only because multiple FRs exist.
- Browser preview and canvas export now use stable-size track target windows centered on FRs, with only small scale correction for readability/framing.
- The dimmed radial track follow-spot remains available as internal helper code but is disabled as the default `track` identity in preview/export.
- Local director/helper suggestion heuristics and the provider director prompt now favor `track` for ordinary reading flow and reserve `pushIn`/`pushOut` for clear meaning reasons.
- Preserved existing `pushIn`, `pushOut`, Project JSON import compatibility, accepted motion-role values, shot-to-shot travel veil, audio, SFX, and AI review boundaries.

Historical next recommended ticket: T0101 - Practice Fixture and Evaluation Pass.

## Completed Implementation Ticket - T0093 AI Director Suggestion Drafts from Page Understanding

Goal: use the existing AI page-understanding result to generate temporary provider-backed director suggestion cards without mutating accepted project data.

Implemented changes:
- Added a narrow local provider route at `/api/generate-director-suggestions` that consumes the current normalized AI page-understanding result instead of re-uploading image pixels.
- Added shared AI Director Suggestion result/card types and a normalizer in `src/lib/aiPageUnderstanding.ts`.
- Encoded the accepted camera grammar into the director prompt: `track`, `pushIn`, and `pushOut` only.
- Encoded article-inspired direction rules for panning/track focus shifts, pushIn emotional emphasis, pushOut context, reading-order ROI visits, faster action motion, and slower calm/exposition motion.
- Added an `AI Director Suggestions` section to AI Review with a `Generate AI Director Suggestions` action.
- Cards are grouped by AI panel and include panel target, panel summary, mood/motion interpretation, camera motion, plain-language attention path, referenced AI region ids, speed/timing, optional SFX/BGM note, confidence, reason, and geometry warning text when present.
- Kept provider AI Director Suggestions separate from existing local Director Notes and existing helper drafts.
- Preserved review-only behavior: no automatic Camera Shot creation, Focus Region creation, Shot Attention Path creation, accepted-state editing, Project JSON suggestion persistence, preview/export change, audio generation/fetching, SFX auto-placement, dialogue/narration, OCR, or panel-detection runtime.

Historical next recommended ticket: T0094 - Detail Confidence Badge Color. T0094, T0095, T0096, T0097, T0098, T0099, T0100, T0100A, T0101, T0102, T0102A, T0103, T0104, T0105, T0106, T0106A, T0107, T0107A, T0107B, T0108, T0109, T0110, and T0111 have since been implemented. T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed. The earlier audio apply spike is deferred until the director rulebook path is grounded.

## Completed Implementation Ticket - T0092 AI Page Understanding Card-to-Page Highlighting

Goal: make normalized AI Page Understanding cards easier to inspect against the source page without creating accepted project data.

Implemented changes:
- Added a review-only AI Page Understanding SVG highlight overlay to `PageViewer`.
- Hovering, focusing, or clicking an AI Page Understanding flashcard highlights that card's explicit analyzed-image geometry on the editor canvas.
- Clicking a flashcard keeps it selected for inspection until another AI card is selected.
- The page highlight uses styling distinct from accepted Camera Shots, accepted Focus Regions, and temporary helper suggestions.
- Active flashcards receive a visible selected/highlighted state in the AI Review deck.
- The provider route now supports `OPENAI_AI_PAGE_MODEL` for model-quality test drives, with `OPENAI_PAGE_UNDERSTANDING_MODEL` and `gpt-4.1-mini` as fallbacks.
- The provider schema requires top-level `mood`, string confidence enums, region-level `geometrySpace: "analyzedImage"`, nullable `panelId`, and rejects `geometrySpace` inside the `geometry` object.
- The local provider proxy now uses a larger `max_output_tokens` budget for strict page-understanding JSON and reports incomplete/invalid provider JSON with a clearer diagnostic.
- Preserved temporary review-only behavior and did not add automatic Camera Shot / Focus Region / Shot Attention Path creation, Project JSON suggestion persistence, accepted-state apply behavior, preview/export changes, audio generation/fetching, SFX auto-placement, dialogue/narration, OCR, or panel-detection runtime.

Historical next recommended ticket: T0093 - AI Director Suggestion Drafts from Page Understanding.

## Completed Implementation Ticket - T0091 AI Analysis Validation / Review Hardening

Goal: harden the real AI page-understanding review flow before any accepted-state apply, persistence, or automation behavior.

Implemented changes:
- Added `normalizeAiPageUnderstandingResult` in `src/lib/aiPageUnderstanding.ts`.
- Validates and normalizes provider response envelopes before the AI Review UI stores them.
- Converts malformed confidence and unsupported region kind values to safe review defaults.
- Skips malformed, zero-area, or fully off-page provider regions.
- Clamps partially out-of-bounds region geometry to the source image and records validation warnings.
- Marks image-metadata mismatches as stale review results.
- Ignores superseded in-flight analysis responses after a newer analysis, image load, or project import.
- Shows validation/stale warnings in the AI Review Warnings section and provider-error cards.
- Reworked Page Understanding region groups into compact horizontal flashcard decks, with only type/title visible on the card face and description, confidence, geometry, and warnings folded into `Inspect card`.
- Preserved temporary review-only behavior and did not add automatic Camera Shot / Focus Region / Shot Attention Path creation, Project JSON suggestion persistence, accepted-state apply behavior, preview/export changes, audio generation/fetching, SFX auto-placement, dialogue/narration, OCR, or panel-detection runtime.

Historical next recommended ticket: T0092 - AI Page Understanding Card-to-Page Highlighting.

## Completed Implementation Ticket - T0090A AI Review UI Cleanup and Stale Suggestion Control Removal

Goal: clean up the Suggestions / AI area so normal UI focuses on real AI page analysis and review rather than old spike test scaffolding.

Implemented changes:
- Renamed the user-facing Suggestions panel to `AI Review`.
- Kept `Analyze page with AI` as the primary action and added a compact latest-analysis status line.
- Removed `Add Test Shot Suggestion` and `Add Test Focus Suggestion` from the normal user-facing UI while leaving underlying temporary suggestion types available for compatibility.
- Moved local Director Notes into a compact collapsible section and clarified they are derived from accepted project data, not provider page understanding.
- Renamed `Draft AI Attention Path` to `Draft path from existing Focus Regions` and moved it into a collapsed Helper Drafts section with copy that identifies it as a manual helper, not real provider AI.
- Collapsed detailed page-understanding regions and usage behind compact review sections, with Overview open by default and Warnings open only when present.
- Preserved temporary review-only behavior and did not add provider calls, automatic shot/focus/path creation, Project JSON suggestion persistence, preview/export changes, audio generation/fetching, or SFX auto-placement.

Historical next recommended ticket: T0091 - AI Analysis Validation / Review Hardening.

## Completed Implementation Ticket - T0090 Real AI Page Understanding Spike

Goal: add the first real AI page-understanding flow for the currently uploaded comic page while keeping all results temporary and review-only.

Implemented changes:
- Added a Vite local provider proxy at `/api/analyze-page` that reads `OPENAI_API_KEY` server-side from `.env.local` / process env and never exposes it to Vite client code.
- Confirmed the OpenAI Responses endpoint as `https://api.openai.com/v1/responses` and added optional server-side outbound proxy support through `AI_HTTP_PROXY`, `HTTPS_PROXY`, or `HTTP_PROXY`; direct fetch remains the default when no proxy env is set.
- Added a low-cost default OpenAI model setting, `gpt-4.1-mini`, with optional local override through `OPENAI_PAGE_UNDERSTANDING_MODEL`.
- Added a client-side `Analyze page with AI` action in the existing Suggestions panel.
- Resizes and JPEG-compresses the uploaded page to a bounded 1400px long side before sending it to the local provider proxy.
- Requests concise structured JSON using the T0087-style page-understanding shape for page summary, mood, panels, reading order, character/face regions, speech/detail/action regions, confidence, warnings, and provider errors.
- Caps OpenAI output with `max_output_tokens` and logs usage/cost estimates to the local server console when token usage is returned.
- Displays AI page-understanding output as temporary read-only review cards in the Suggestions panel.
- Clears AI analysis results when a new image/project is loaded so stale output is not carried across projects.
- Preserved accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, and SFX behavior.

Historical next recommended ticket: T0091 - AI Analysis Validation / Review Hardening.

## Completed Planning Ticket - T0089 AI Budget / Provider Decision Gate Planning

Goal: plan provider, budget, privacy, consent, latency, and failure-handling constraints before any real AI API integration.

Implemented changes:
- Added `docs/planning/AI_Budget_Provider_Decision_Gate_Planning.md`.
- Defined go, go-with-limits, and no-go outcomes for real provider/API integration.
- Planned provider selection criteria for comic-page vision capability, structured output reliability, cost, privacy terms, rate limits, API stability, and mock fallback support.
- Defined budget constraints for source image size, call count, retry count, per-page cost, regeneration, and whether accepted project context or the director rulebook is sent.
- Defined consent, provider disclosure, privacy, copyright, data retention, cancellation, retry, rate-limit, and failure-state requirements.
- Reaffirmed accepted project data as the source of truth and all AI outputs as temporary reviewable suggestions.
- Left source behavior, provider/API code, real AI calls, Project JSON schema changes, suggestion persistence, preview/export behavior, automatic generation, audio fetching/downloading, automatic SFX placement, dependencies, and accepted project mutation out of scope.
- Recommended T0090 - Real AI Page Understanding Spike as the next ticket.

Historical note: T0090 has since implemented a narrow real AI page-understanding spike and recommended T0091 - AI Analysis Validation / Review Hardening.

## Completed Planning Ticket - T0088 DynamicManga Director Rulebook / Knowledge Pack Planning

Goal: plan a director knowledge layer that translates page-understanding evidence into cinematic guidance before runtime AI/provider implementation.

Implemented changes:
- Added `docs/planning/DynamicManga_Director_Rulebook_Knowledge_Pack_Planning.md`.
- Planned a DynamicManga/article-derived director rulebook or knowledge pack for future AI suggestion guidance.
- Defined a versioned knowledge-pack shape with source references, rule families, evidence inputs, suggestion outputs, guardrails, confidence influence, and rule IDs.
- Defined guidance for preserving page context, reading order, speech-heavy pacing, action emphasis, character/reaction direction, detail/reveal intent, readable camera movement, mood/effects, and audio direction.
- Mapped page-understanding evidence to temporary suggestions for `track`, `pushIn`, `pushOut`, timing, mood, effects, Camera Shots, Focus Regions, Shot Attention Paths, and audio direction.
- Reaffirmed accepted project data as the source of truth and all AI/rulebook outputs as temporary reviewable suggestions.
- Left provider/API work, real AI calls, Project JSON schema changes, suggestion persistence, preview/export behavior, automatic generation, OCR/panel/face runtime, audio generation, and automatic SFX placement out of scope.
- Recommended T0089 - AI Budget / Provider Decision Gate Planning as the next ticket.

Historical note: T0090 has since implemented the real AI page-understanding spike and recommended T0091 - AI Analysis Validation / Review Hardening.

## Completed Planning Ticket - T0087 AI Vision Page Understanding Contract Planning

Goal: plan the response contract for future AI vision/page-understanding suggestions before provider/API work.

Implemented changes:
- Added `docs/planning/AI_Vision_Page_Understanding_Contract_Planning.md`.
- Defined a provider-neutral response envelope for future page-understanding outputs.
- Defined source-image coordinate rules, target types, suggestion record fields, confidence normalization, reasons, warnings, stale/blocked rules, validation/normalization requirements, consent/provider/privacy notes, and failure states.
- Covered panels, reading order, characters/faces, speech/detail/action regions, mood, Camera Shot candidates, Focus Region candidates, Shot Attention Path/motion intent, and audio direction.
- Reaffirmed that all outputs remain temporary reviewable suggestions and accepted project data remains the source of truth.
- Left room for a later DynamicManga/article-derived director rulebook or knowledge pack.
- Left room for a later AI budget/provider decision gate before real API integration.
- Recommended T0088 - DynamicManga Director Rulebook / Knowledge Pack Planning as the next ticket.
- Kept source behavior, Project JSON schema changes, suggestion persistence, provider/API code, real AI calls, preview/export behavior, automatic generation, audio fetching/downloading, automatic SFX placement, dependencies, and accepted project mutation out of scope.

Historical note: T0088 has since planned the DynamicManga director rulebook / knowledge pack and recommended T0089 - AI Budget / Provider Decision Gate Planning.

## Completed Planning Ticket - T0086 Unified Suggestion Review Surface Planning

Goal: plan one unified suggestion review surface for all current and future suggestion types.

Implemented changes:
- Added `docs/planning/Unified_Suggestion_Review_Surface_Planning.md`.
- Planned a unified review surface for director notes, draft attention paths, draft Camera Shot / Focus Region candidates, audio/BGM/SFX suggestions, and future vision/page-understanding suggestions.
- Explicitly framed current JSON/mock director notes as scaffolding and future AI vision/page understanding as the real value layer.
- Covered future page-understanding outputs including panels, reading order, characters/faces, speech/detail/action regions, mood, shot candidates, Focus Region candidates, motion intent, and audio direction.
- Defined common suggestion fields for type, target, proposed value, confidence, reason, warning, stale/blocked state, source, and created context.
- Defined inspect, accept, apply, edit, reject, discard, copy, and blocked actions by suggestion type and state.
- Reaffirmed accepted project data as the source of truth and unaccepted suggestions as temporary review records.
- Recommended T0087 - AI Vision Page Understanding Contract Planning as the next ticket.
- Kept source behavior, Project JSON schema changes, suggestion persistence, provider/API code, preview/export behavior, real AI calls, automatic generation, audio fetching/downloading, automatic SFX placement, OCR/panel detection runtime, dependencies, and accepted project mutation out of scope.

Historical note: T0087 has since planned the AI vision/page-understanding response contract, and T0088 has since planned the DynamicManga director rulebook / knowledge pack.

## Completed Planning Ticket - T0085 AI Director-Assistant Roadmap Reassessment

Goal: reassess the completed T0079 through T0084 director-assistant branch before real provider, automatic generation, or audio apply work.

Implemented changes:
- Added `docs/planning/AI_Director_Assistant_Roadmap_Reassessment.md`.
- Recorded that the next AI branch should remain mock/review UI work, not real provider integration.
- Recommended T0086 - Unified Suggestion Review Surface Planning as the next ticket.
- Explained why real provider work is premature until suggestion persistence, stale states, consent, validation, provider failure handling, provenance, and edit-before-accept rules are settled.
- Reaffirmed that automatic generation remains out of scope and accepted project data remains the source of truth.
- Kept real AI provider calls, provider configuration, Project JSON schema changes, suggestion persistence, source behavior, preview/export behavior, audio editing/generation/fetching/downloading, automatic SFX placement, OCR, panel detection, dialogue/narration, dependencies, and automatic accepted-state mutation out of scope.

Historical note: T0086 has since planned the unified suggestion review surface and recommended T0087 - AI Vision Page Understanding Contract Planning.

## Completed Planning Ticket - T0084 Audio/BGM/SFX Suggestions Planning

Goal: plan AI-assisted audio direction after shot mood, timing, and intent suggestions exist.

Implemented changes:
- Added `docs/planning/Audio_BGM_SFX_Suggestions_Planning.md`.
- Defined audio suggestions as advisory BGM tone/search-term/pacing ideas and SFX category/search-term/timing ideas.
- Explained why audio suggestions follow AI director suggestions: sound depends on accepted Camera Shot order, duration, mood, motion intent, attention beats, and accepted effect cues.
- Preserved existing manual Background music and Sound effects marker workflows as accepted project data.
- Required suggestions to remain temporary until explicit user action.
- Defined target-binding rules for project-level BGM, shot-level SFX ideas, and beat-level SFX ideas tied to existing Shot Attention Path items and Focus Regions.
- Identified Project JSON/archive open decisions for unaccepted suggestion persistence and accepted suggestion provenance.
- Added provider, licensing, privacy, consent, cancellation, failure-state, and validation questions before any real audio/provider integration.
- Kept source behavior, audio editing, audio generation, fetching/downloading, automatic SFX placement, dialogue/narration, Project JSON schema changes, preview/export behavior, OCR, panel detection, dependencies, and automatic accepted-state mutation out of scope.

Historical note: T0085 has since reassessed the AI director-assistant roadmap and recommended T0086 - Unified Suggestion Review Surface Planning.

## Completed Planning Ticket - T0083 AI Draft Shots/Focus Regions Planning

Goal: plan whether and how a later AI phase may suggest new Camera Shots and Focus Regions.

Implemented changes:
- Added `docs/planning/AI_Draft_Shots_Focus_Regions_Planning.md`.
- Defined future AI-suggested Camera Shots and Focus Regions as temporary reviewable suggestions only.
- Required explicit inspect, accept, reject, and ideally edit workflow before suggestions become accepted project data.
- Preserved Camera Shots as page-level reading containers and Focus Regions as page-level reusable attention targets.
- Defined stale/blocked suggestion cases for changed source images, missing targets, out-of-bounds geometry, duplicate accepted entities, and unsupported fields.
- Identified Project JSON/archive open decisions for optional suggestion persistence, schema migration, stale references, stable suggestion IDs, and provenance.
- Added provider, privacy, copyright, consent, cancellation, failure-state, and validation questions before any real AI image upload.
- Kept source behavior, real AI provider calls, Project JSON schema changes, preview/export behavior, OCR, panel detection, audio behavior, dependencies, and automatic accepted-state mutation out of scope.

Historical note: T0084 has since planned AI-assisted audio direction suggestions. T0085 has since reassessed the AI director-assistant roadmap and recommended unified suggestion review planning next.

## Completed Implementation Ticket - T0082 AI Draft Attention Path Spike

Goal: let AI-style logic suggest a Shot Attention Path from existing manual Focus Regions only.

Implemented changes:
- Upgraded the temporary Draft Attention Path flow into an AI-style attention-path draft action.
- Drafts target only the selected existing Camera Shot.
- Drafts include only existing manual Focus Regions that overlap the selected shot enough to be usable.
- Draft items include proposed `track`, `pushIn`, or `pushOut` motion roles plus duration-weight ideas and per-item reasons.
- Drafts remain temporary suggestions until the user explicitly accepts them.
- Accepting a draft writes normal editable Shot Attention Path items to the existing target Camera Shot.
- Accept validation blocks missing Camera Shot targets, empty drafts, and stale/missing Focus Region targets.
- Rejecting a draft leaves the existing accepted Shot Attention Path unchanged.
- Kept real AI provider calls, new Camera Shot creation, new Focus Region creation, Project JSON suggestion persistence, OCR, panel detection, audio fetching, dependencies, preview/export camera behavior changes, and new motion roles out of scope.

Historical note: T0083 has since planned future AI-drafted Camera Shot and Focus Region suggestions, T0084 has since planned audio direction suggestions, and T0085 has since recommended unified suggestion review planning.

## Completed Repair Ticket - T0081A AI Suggestion Target Binding Guardrails

Goal: repair the T0081 apply flow so AI/mock director suggestions can apply only to valid existing project targets.

Implemented changes:
- Shot-level director suggestions remain effect-only apply actions for existing Camera Shots.
- Path-item motion suggestions are generated only from existing Shot Attention Path items.
- Applying a path-item suggestion now requires an existing Camera Shot, existing Shot Attention Path item, and existing referenced Focus Region.
- Selected shots with no Shot Attention Path items show a warning instead of motion Apply buttons.
- Path items with missing or deleted Focus Region targets are shown as blocked suggestions.
- Blocked suggestions do not render Apply buttons and cannot mutate accepted project data.
- Cue timing apply remains limited to valid shot-level effects or valid path-item cue targets.
- Suggested motion roles remain limited to `track`, `pushIn`, and `pushOut`.
- Suggested effects remain limited to None, Shake, and Impact Pulse.
- Cue timing remains limited to `early` and `arrival`.
- No Camera Shots, Focus Regions, or Shot Attention Path items are created.

Historical note: T0082 has since implemented AI-style draft attention paths from existing manual Focus Regions only. The next recommended ticket is T0083 - AI Draft Shots/Focus Regions Planning.

## Completed Implementation Ticket - T0081 AI Suggestion Accept/Apply Spike

Goal: allow selected AI-style director suggestions to be manually applied to existing project records through explicit user action.

Implemented changes:
- Added explicit Apply buttons to the Mock AI Director Notes panel.
- Shot-level director suggestions can apply only accepted shot-level effect settings: None, Shake, or Impact Pulse.
- Path-item director suggestions can apply only to existing Shot Attention Path items on existing Camera Shots.
- Path-item apply updates the existing path item's `motionRole`, accepted effect cue, and cue timing.
- T0081A later repaired this flow so path-item apply also requires the existing path item's referenced Focus Region to exist.
- Suggested motion roles are limited to `track`, `pushIn`, and `pushOut`.
- Suggested effects are limited to accepted Shake and Impact Pulse cue/settings behavior, or None.
- Suggested cue timing is normalized to `early` or `arrival`.
- Applying a suggestion selects the affected existing Camera Shot and reports an explicit project status message.
- Manual inspector controls remain the way to revise or undo applied results.
- Kept real AI providers, provider configuration, new Camera Shot creation, new Focus Region creation, new Shot Attention Path creation, Project JSON suggestion persistence, preview/export behavior changes, audio fetching/downloading, new motion roles, OCR, panel detection, dependencies, and multi-page behavior out of scope.

Historical note: T0081A has since added target-binding guardrails before T0082.

## Completed Implementation Ticket - T0080 AI Director Suggestions UI Spike

Goal: add a UI surface for showing AI-style directing suggestions without real AI provider integration.

Implemented changes:
- Added a read-only Mock AI Director Notes panel to the inspector sidebar.
- Generates deterministic mock director suggestions from accepted Camera Shots and existing Shot Attention Path items.
- Suggestions include target, mood, suggested `track` / `pushIn` / `pushOut` motion role, suggested Shake / Impact Pulse / None effect, cue timing, confidence, and reason.
- Uses selected-shot context when a Camera Shot is selected and falls back to the first project shots when no shot is selected.
- Kept suggestions inspect-only in T0080; T0081 later added explicit apply buttons.
- Does not mutate Camera Shots, Focus Regions, Shot Attention Paths, effect settings, timing, Project JSON, preview, export, audio, package files, AI provider configuration, OCR, panel detection, dependencies, or multi-page behavior.

Historical note: T0081 added explicit apply behavior for selected mock director suggestions, T0081A later added target-binding guardrails, T0082 added temporary AI-style attention-path drafts, T0083 planned later AI-drafted Camera Shot / Focus Region suggestions, and T0084 planned audio direction suggestions.

## Completed Planning Ticket - T0079 AI Director Suggestions Planning

Goal: define the next AI roadmap phase as a director-assistant layer before any AI source behavior is implemented.

Implemented changes:
- Added `docs/planning/AI_Director_Assistant_Roadmap.md`.
- Defined AI as reviewable director suggestions rather than an auto-generator.
- Defined first-phase readable project context: existing source image metadata, Camera Shots, Focus Regions, Shot Attention Paths, motion roles, duration weights, accepted effect settings, and effect cue timing.
- Defined a suggestion output contract covering target reference, mood, suggested motion role, suggested effect, cue timing idea, timing idea, reason, and confidence/caution.
- Explicitly forbade automatic Camera Shot, Focus Region, and Shot Attention Path creation in the first phase.
- Reaffirmed that manual project data remains the source of truth and export uses only accepted project data.
- Reaffirmed the accepted camera grammar as `track`, `pushIn`, and `pushOut`.
- Reframed Shake and Impact Pulse as supporting mood/timing layers, not replacements for camera movement.
- Sequenced audio/BGM/SFX suggestions after AI director suggestions.
- Added roadmap tickets T0080 through T0084.
- Kept source behavior, package files, build config, generated output, Project JSON schema, preview behavior, export behavior, audio editing, AI runtime behavior, OCR, panel detection, dependencies, and multi-page behavior unchanged.

Historical note: T0080, T0081, T0081A, T0082, T0083, T0084, and T0085 have since implemented mock director notes, explicit apply behavior, target-binding guardrails, temporary AI-style attention-path drafts, later shot/focus suggestion planning, audio direction suggestion planning, and roadmap reassessment.

## Completed Implementation Ticket - T0078A Attention Cue Timing Presets

Goal: let users choose when an accepted attention-path effect cue fires without adding keyframes or a per-frame effect timeline.

Implemented changes:
- Added optional `effectCueTiming` metadata to `ShotAttentionPathItem`.
- Supported only two timing presets: `early` and `arrival`.
- Defined `early` as a cue window that runs during motion and ends when the camera reaches the destination position.
- Defined `arrival` as a cue window that starts when the camera reaches the destination position and runs during the remaining settle/hold portion.
- Added a per-path-item Cue Timing control in the selected Camera Shot inspector.
- Browser preview and canvas export use the selected timing preset for that path item's Shake Cue and Impact Cue.
- Kept missing timing data backward compatible by treating it as `arrival`.
- Kept `pushOut` timing role-aware, so its presets remain later than `track` / `pushIn` and can fire shortly before push-out completion.
- Project JSON import/export preserves valid timing values and ignores malformed values.
- Kept camera placement, shot geometry, Focus Region ownership, Shot Attention Path ownership, motion roles, package files, AI, OCR, panel detection, audio, dependencies, and multi-page behavior unchanged.

Historical note: T0079 has since reopened the AI branch as a director-assistant roadmap. The next recommended implementation ticket is T0080 - AI Director Suggestions UI Spike.

## Completed Implementation Ticket - T0078 Canvas Export Effect Parity

Goal: make canvas export reproduce accepted special effects closely enough to match browser preview behavior.

Implemented changes:
- Canvas export now renders accepted shot-level `specialEffects.shake` and `specialEffects.impactPulse` after normal export camera placement is resolved.
- Shot-level export effects begin after incoming shot travel and do not run during Guided Page Enter / Exit segments.
- Canvas export now carries Shot Attention Path `effectCues` into active attention anchors.
- Exported Shake Cue once/repeat and Impact Cue once/repeat use the same attention-arrival cue timing as browser preview.
- Export shake uses a restrained deterministic image offset clamped inside the shot window and keeps the accepted track follow-spot aligned with the shaken image.
- Export Impact Pulse uses the accepted full-stage white pulse curve and repeat cadence.
- Preserved effect-off export baseline, existing export audio behavior, camera placement, shot geometry, Focus Region ownership, Shot Attention Path ownership, motion roles, Project JSON schema/import/export, package files, AI, OCR, panel detection, dependencies, and multi-page behavior.

Historical note: T0079 has since reopened the AI branch as a director-assistant roadmap. The next recommended implementation ticket is T0080 - AI Director Suggestions UI Spike.

## Completed Implementation Ticket - T0077 Simple Effect Presets UI

Goal: expose accepted per-shot special effects through preset-first controls.

Implemented changes:
- Added a selected-shot inspector Effect Preset control.
- Exposed only accepted presets backed by the T0076 model: None, Shake, Impact Pulse, and Shake + Impact Pulse.
- None clears `specialEffects`; Shake writes only `shake: true`; Impact Pulse writes only `impactPulse: true`; the combined preset writes both true flags.
- Did not expose Vignette or current Blur as standalone user-facing effects.
- Kept controls per-shot with no global defaults, advanced sliders, keyframes, effect timeline, or AI assignment.
- Kept canvas export behavior unchanged; export effect parity remains T0078.
- Kept camera placement, shot geometry, Focus Regions, Shot Attention Path ownership, motion roles, package files, AI, OCR, panel detection, audio, dependencies, and multi-page behavior unchanged.

Next recommended implementation ticket: T0078 - Canvas Export Effect Parity.

## Completed Implementation Ticket - T0077B Attention Path Effect Cues

Goal: allow accepted effects to trigger on specific Shot Attention Path focus beats without making Focus Regions own effect state.

Implemented changes:
- Added optional `effectCues` metadata to `ShotAttentionPathItem`.
- Supported only accepted effect cue names: `shake` and `impactPulse`.
- Supported only simple cue modes: `once` and `repeat`; missing cue data means off.
- Added per-path-item inspector controls for Shake Cue and Impact Cue with Off, Once, and Repeat options.
- Browser preview now applies attention-beat cues after the referenced path item is near focus arrival.
- Impact Pulse once fires when attention arrives at the beat; Impact Pulse repeat pulses periodically after arrival while the beat is active.
- Shake once applies a short arrival shake; Shake repeat keeps shake active after arrival while the beat is active.
- Kept Focus Regions page-level and effect-free.
- Kept shot-level Effect Presets as coarse shot-level effects that begin after incoming shot travel.
- Kept canvas export behavior unchanged; export effect parity remains T0078.
- Kept camera placement, shot geometry, Focus Region ownership, Shot Attention Path ownership rules, motion roles, package files, AI, OCR, panel detection, audio, dependencies, and multi-page behavior unchanged.

Next recommended implementation ticket: T0078 - Canvas Export Effect Parity.

## Completed Implementation Ticket - T0077A Preview Uses Persisted Effect Presets

Goal: make browser preview use the accepted per-shot effect presets instead of separate local preview toggles.

Implemented changes:
- Browser preview now reads `currentShot.specialEffects.shake` and `currentShot.specialEffects.impactPulse`.
- Removed the local preview-only Shake and Impact Pulse buttons from `PreviewPlayer`.
- Preserved the existing accepted Shake and Impact Pulse visual behavior.
- Applied persisted effects only during shot playback segments, not Guided Page Enter / Exit segments.
- Kept effects as rendering-layer modifiers after normal camera placement is resolved.
- Kept Project JSON import/export behavior unchanged because T0076 already persisted the accepted model.
- Kept canvas export behavior unchanged; export effect parity remains T0078.
- Kept camera placement, shot geometry, Focus Regions, Shot Attention Path ownership, motion roles, package files, AI, OCR, panel detection, audio, dependencies, and multi-page behavior unchanged.

Next recommended implementation ticket: T0078 - Canvas Export Effect Parity.

## Completed Acceptance Ticket - T0075A Special Effects Spike Acceptance Cleanup

Goal: record the preview-only special-effects spike decision before adding a persisted effect model.

Implemented changes:
- Accepted Camera Shake as an MVP+ special effect candidate.
- Accepted Flash only when renamed and conceptualized as Impact Pulse.
- Rejected Vignette as a standalone MVP+ user-facing effect because it currently feels too generic.
- Rejected current Blur as a standalone MVP+ user-facing effect because it blurs comic lines and text rather than reading like desirable motion blur.
- Removed the local Vignette and Blur preview toggles from `PreviewPlayer`.
- Renamed the local Flash preview toggle and helper language to Impact Pulse.
- Kept the existing internal shot-to-shot travel veil blur behavior unchanged; Blur is not a user-facing special effect candidate for T0076.
- Narrowed T0076 so it should persist only accepted effects: Shake and Impact Pulse.
- Kept Project JSON schema, UI persistence, canvas export, camera placement behavior, old focus-effect grammar, package files, AI, OCR, panel detection, audio, dependencies, and multi-page behavior unchanged.

Historical note: T0076 has since implemented the narrow Project JSON shot effect model for Shake and Impact Pulse, T0077 has since exposed simple per-shot presets, T0077A has since wired browser preview to those persisted presets, and T0077B has since added attention-path effect cues. The next recommended implementation ticket is T0078 - Canvas Export Effect Parity.

## Completed Implementation Ticket - T0075 Flash / Vignette / Motion Blur Preview Spike

Goal: prototype flash / impact pulse, vignette / tension dim, and cautious motion blur in browser preview as rendering-layer modifiers.

Implemented changes:
- Added local Flash, Vignette, and Blur controls to `PreviewPlayer`.
- Flash renders a brief white stage pulse at the start of shot playback only; it does not move the camera or act as a new `pushIn`.
- Vignette renders a broad stage-level edge dim using a radial overlay, not a Focus Region-shaped mask.
- Blur applies a cautious image blur during movement phases only, with no blur during held reading moments.
- Combined the optional blur modifier with the existing accepted shot-to-shot travel veil blur by using the stronger active blur value.
- Kept all effects preview-only and experimental with no Project JSON persistence.
- Preserved underlying `track`, `pushIn`, and `pushOut` placement behavior.
- Kept shot boxes, Focus Regions, Shot Attention Path data, canvas export, package files, Project JSON schema, AI, OCR, panel detection, audio, dependencies, and multi-page behavior unchanged.

Historical note: T0075A has since accepted Shake and Impact Pulse only. Vignette and current Blur were rejected as standalone MVP+ user-facing effects.

## Completed Implementation Ticket - T0074 Camera Shake Preview Spike

Goal: prototype camera shake in browser preview as a rendering-layer modifier on top of accepted camera placement.

Implemented changes:
- Added a local Shake toggle to `PreviewPlayer`.
- Applied shake as a restrained deterministic image offset after normal preview camera placement is resolved.
- Clamped shake offsets to available image bounds inside the shot window so the clipped preview does not expose empty edges.
- Kept shake preview-only and experimental with no Project JSON persistence.
- Kept the track follow-spot overlay visually aligned with the shaken image by applying the same offset to the overlay center.
- Preserved underlying `track`, `pushIn`, and `pushOut` placement behavior.
- Kept shot boxes, Focus Regions, Shot Attention Path data, canvas export, package files, Project JSON schema, AI, OCR, panel detection, audio, dependencies, and multi-page behavior unchanged.

Historical note: T0075A has since accepted Shake and Impact Pulse only. Vignette and current Blur were rejected as standalone MVP+ user-facing effects.

## Completed Planning Ticket - T0073 Special Effects Direction Doc

Goal: define the Special Effects direction before implementing any visual effects, while preserving the accepted camera-motion model.

Implemented changes:
- Added `docs/planning/Special_Effects_Direction_Plan.md`.
- Defined special effects as optional rendering-layer modifiers layered on top of resolved camera placement.
- Clarified that effects differ from camera motion roles: `track`, `pushIn`, and `pushOut` decide where/why the camera moves; effects modify emotional texture only.
- Allowed only low-risk MVP+ rendering candidates: camera shake, flash / impact pulse, vignette / tension dim, and cautious motion blur.
- Explicitly delayed or forbade parallax, character cutouts, face tracking, AI-driven emphasis, moving real manga motion lines, segmentation-dependent foreground animation, and punch-in as a separate motion grammar.
- Clarified that impact pulse may be a temporary visual modifier only, not a new camera role competing with `pushIn`.
- Recommended delaying Project JSON/schema changes until preview-only experiments prove useful.
- Recommended preset-first future UI: None, Subtle tension, Impact, Fast action, and Dramatic focus.
- Recorded that accepted effects need eventual export parity, while preview-only spikes must be marked experimental.
- Added future manual verification expectations for effect-off baseline parity, no mutation of shot boxes/focus regions, stacking on top of existing motion roles, export parity, and avoiding old demoted visual grammar.
- Adjusted the preferred special-effects ticket sequence because T0069-T0072 are already assigned: T0073 Special Effects Direction Doc, T0074 Camera Shake Preview Spike, T0075 Flash / Vignette / Motion Blur Preview Spike, T0076 Shot Effect Model, T0077 Simple Effect Presets UI, and T0078 Canvas Export Effect Parity.
- Kept source behavior, package files, build config, generated output, Project JSON schema, preview behavior, export behavior, audio behavior, AI runtime behavior, OCR, panel detection, dependencies, and multi-page behavior unchanged.

Historical note: T0074 and T0075 implemented preview-only special-effects spikes, and T0075A accepted Shake and Impact Pulse only. The next recommended implementation ticket is T0076 - Shot Effect Model.

## Completed Planning Ticket - AI Automation Architecture Plan

Goal: define the AI automation architecture before implementation, while preserving the manual editor as the source of truth.

Implemented changes:
- Added `docs/planning/AI_Automation_Architecture_Plan.md`.
- Defined the core AI principle: AI drafts temporary suggestions; users accept, edit, reject, or ignore; export uses only accepted project data.
- Scoped the first AI branch as an AI Vision Analysis Spike, not full automatic video generation.
- Documented future suggestion targets: camera shots, focus regions, reading order, Shot Attention Path candidates, `track` / `pushIn` / `pushOut` motion roles, rough timing, confidence, and warnings.
- Explicitly excluded automatic final-video generation, destructive panel cropping, character animation, dialogue/narration generation, AI sound generation, automatic SFX placement, OCR/dialogue timing as the first implementation, and mutation of accepted project data without user acceptance.
- Defined a suggested architecture that separates provider/adapters, AI response schema, validation/normalization, temporary suggestion state, suggestion review UI, and accepted project state.
- Recommended a mock AI response before real API integration so UI and data flow can be tested without API keys, cost, latency, provider availability, or privacy risk.
- Kept source behavior, package files, build config, generated output, Project JSON schema, preview behavior, export behavior, audio behavior, and AI runtime behavior unchanged.

Historical note: this was the previous recommended branch. T0073 later inserted a Special Effects Direction planning gate before visual-effects implementation, and T0079 later narrowed the AI branch into the AI Director Suggestions roadmap. T0080 - AI Director Suggestions UI Spike is now the next recommended implementation ticket.

## Completed Implementation Ticket - T0068 Canvas Export Parity for Accepted Motion Anchors

Goal: make canvas export follow accepted Shot Attention Path motion-anchor behavior after preview motion-role semantics are stable.

Implemented changes:
- Canvas export now resolves usable accepted Shot Attention Path anchors in accepted path order and ignores missing references safely.
- Export now renders active `track`, `pushIn`, and `pushOut` camera placement behavior using source-window math aligned with the accepted browser-preview baseline.
- Export now respects `durationWeight`, pass-through track-start timing, motion-chain continuity, and final intra-shot placement into shot-to-shot travel.
- Export now respects `Shot Starts At = First focus` for supported first `track` chains and first `pushOut` anchors.
- Export shot-to-shot travel now targets the destination shot's selected start placement and includes the accepted eased midpoint dim/softness veil that clears on arrival.
- Export now renders the accepted track follow-spot using canvas gradients for `track -> track` behavior, including the static first-focus track-chain start state.
- Shots without usable accepted anchors keep the existing legacy focus-effect export fallback.
- Browser preview behavior, Project JSON schema/import/export, package files, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior were unchanged.

Next recommended ticket: AI Automation Architecture Plan.

## Current Repair - PushOut Motion Continuity Repair

Goal: make every browser-preview motion segment end on the same source window where the next motion segment starts.

Implemented changes:
- Browser Auto preview now treats accepted Shot Attention Path anchors as a continuous motion chain.
- `pushOut` now ends on the next anchor's entry window when a next anchor exists, instead of ending on a separate expanded union context.
- A path such as FR1=`pushOut`, FR2=`track`, FR3=`track` now pushes out from FR1 into the FR2 track area, then starts the dimmed follow-spot only on the FR2=`track` to FR3=`track` transition.
- A `track` anchor entered from non-`track` and followed by another `track` now acts as a pass-through start point for the next `track -> track` move instead of consuming a full hold-like timing segment.
- The accepted `track -> track` follow-spot overlay rule is preserved.
- `pushIn`, `durationWeight`, Manual mode, Project JSON schema/import/export, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior were unchanged.

## Current Implementation Ticket - Global Shot Transition Softening / Natural Camera Travel Polish

Goal: polish global shot-to-shot camera travel pacing after T0068 export parity without reopening intra-shot motion-anchor visual behavior.

Implemented changes:
- Browser preview and canvas export now use the same gentler sine ease for global shot-to-shot camera travel.
- Global shot travel now uses a slightly longer default travel budget while capping travel to a lower share of very short shots.
- The midpoint travel veil is softer, with lower dim and blur peaks that still clear on arrival.
- Export remains aligned with browser preview for this global travel polish.
- Intra-shot `track`, `pushIn`, and `pushOut` behavior, accepted follow-spot behavior, `Shot Starts At`, Project JSON schema/import/export, package files, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior were unchanged.

Next recommended ticket: AI Automation Architecture Plan.

## Current Implementation Ticket - Export Verification + Bug Repair

Goal: verify canvas export against the accepted browser-preview baseline and repair export-only parity gaps before moving on to archive save/load.

Implemented changes:
- Canvas video export now receives the existing `guidedPageOptions` state.
- Export now includes optional Guided Page Enter and Guided Page Exit timeline segments when the existing Page Enter / Page Exit toggles are enabled.
- Page Enter holds on the full-page fitted view for 1200ms, then moves into the first shot's selected start placement over 1200ms, including supported `Shot Starts At = First focus` starts.
- Page Exit moves from the final shot's final motion-anchor placement back to the full-page fitted view over 1200ms, then holds on the full page for 1200ms.
- Export duration and progress now include the optional 2400ms page enter/exit segments.
- Browser preview behavior, Project JSON schema/import/export, package files, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior were unchanged.

Next recommended ticket: AI Automation Architecture Plan.

## Current Implementation Ticket - Project Archive Save/Load With Source Image Bundled

Goal: let users save and reopen a local project archive with the source comic image bundled, while preserving existing standalone Project JSON import/export.

Implemented changes:
- Added Export Archive and Import Archive header actions.
- Export Archive writes a `.ccvproject` archive JSON wrapper containing schema v1 project data and bundled source image data.
- Import Archive restores the source image object URL, camera shots, focus regions, Shot Attention Path data, guided page options, timing, and metadata without manual image re-selection.
- Existing Import JSON / Export JSON behavior remains available and still requires manual source-image reattachment after JSON import.
- Browser preview behavior, canvas video export behavior, package files, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior were unchanged.

Next recommended ticket: AI Automation Architecture Plan.

## Current Implementation Ticket - Basic Audio Layer

Goal: add one project-level background music track with simple trim, loop, fade, volume, and export inclusion.

Implemented changes:
- Added a Background music panel for uploading one audio file, replacing/removing it, enabling/disabling export inclusion, trimming start/end, toggling loop, setting fade-in/fade-out, and adjusting volume.
- Canvas video export now mixes enabled background audio into the existing MediaRecorder stream using the browser Web Audio API and the existing canvas capture stream.
- Project JSON export/import now persists background audio metadata and settings without bundling audio binary.
- Project archive export/import now bundles and restores the uploaded background audio alongside the source comic image.
- The audio layer is project-level only. It does not add sound effect markers, dialogue/narration, per-shot audio timing, waveform editing, AI assistance, OCR, panel detection, multi-page behavior, backend export, FFmpeg, or new dependencies.

Next recommended ticket: AI Automation Architecture Plan.

## Current Implementation Ticket - Simple Sound Effect Markers

Goal: add a narrow project-level SFX marker system for uploaded one-shot sounds tied to camera shots.

Implemented changes:
- Added a Sound effects panel for uploading multiple short SFX files, assigning each marker to a target camera shot, editing label, shot target, shot-relative offset, play length, shot-span cutoff, and volume, and removing markers.
- Canvas video export now schedules uploaded SFX markers as one-shot Web Audio sources alongside existing background music when audio export is supported, stopping each marker at the earliest of source-file length, configured play length, shot-span boundary, or export end.
- MP3 SFX files are supported when the browser can decode them through Web Audio.
- SFX files that cannot be decoded, cannot be scheduled, or are scheduled after export end are skipped with export warnings instead of breaking video export.
- Export defensively backfills older live SFX marker objects that are missing the later play-length or shot-span fields, treating them as full-file one-shot markers so existing projects do not lose SFX during export.
- Browser MediaRecorder startup tries reported supported formats in order, so browsers that advertise MP4 but fail to start can fall back to another reported format such as WebM.
- Project JSON export/import now persists SFX marker metadata and settings without bundling SFX audio binary.
- Project archive export/import now bundles and restores uploaded SFX marker files when present; missing bundled SFX files remain visible as metadata-only markers.
- Existing video-only export, background-music-only export, and no-audio export behavior remain supported.
- The ticket did not add dialogue/narration tracks, AI sound generation, beat detection, automatic sound matching, waveform editing, per-frame audio editing, a multitrack mixer UI, shot-motion changes, preview/export visual changes, panel detection, OCR, suggestion behavior, new dependencies, or backend/FFmpeg export.

Next recommended ticket: AI Automation Architecture Plan.

## Current Acceptance Ticket - Browser Preview Motion Grammar Acceptance Review

Goal: record that the current browser-preview motion grammar is accepted as the practical baseline for the next export-parity phase.

Implemented changes:
- Accepted current browser-preview `track`, `pushIn`, and `pushOut` behavior as the baseline motion grammar for export parity.
- Accepted the current `Shot Starts At` browser-preview behavior as part of that baseline: `First focus` may start directly framed on the first `track` chain target with the dimmed follow-spot already visible, or close on the first `pushOut` target before the push-out begins.
- Accepted the current shot-to-shot travel pacing treatment as part of that baseline: smoother eased travel, a subtle bell-curve dim/softness veil during the middle of shot-to-shot movement, and a clear frame again on arrival.
- Recorded the acceptance as practical baseline acceptance, not a final or perfect visual style.
- Confirmed no additional browser-preview visual repair or polish should block export parity unless a future ticket explicitly reopens preview behavior.
- Unblocked T0068 export parity implementation, provided it targets the accepted browser-preview baseline.
- Preserved the rejected-visual-language guardrail: export must not implement rails, ribbons, corridors, aperture masks, endpoint capsules/ovals/blobs, moving squares, sliding boxes, punched cutouts, or Focus Region-shaped highlights as active `track` language.
- Preserved the product direction: manual-first, page-preserving cinematic guided-view editor.
- Kept Guided Page Enter / Page Exit parity as an explicit item to review during export implementation; the later Export Verification + Bug Repair ticket has now repaired that parity gap.
- Kept package files, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior unchanged.

Historical note: T0068, the later Global Shot Transition Softening / Natural Camera Travel Polish ticket, Export verification + bug repair, Project archive save/load with source image bundled, Basic audio layer, Simple sound effect markers, AI Automation Architecture Plan, T0073 - Special Effects Direction Doc, T0074 - Camera Shake Preview Spike, T0075 - Flash / Vignette / Motion Blur Preview Spike, T0075A - Special Effects Spike Acceptance Cleanup, T0076 - Shot Effect Model, T0077 - Simple Effect Presets UI, T0077A - Preview Uses Persisted Effect Presets, T0077B - Attention Path Effect Cues, T0078 - Canvas Export Effect Parity, T0078A - Attention Cue Timing Presets, and T0079 - AI Director Suggestions Planning have since been implemented. The current next recommended implementation ticket is T0080 - AI Director Suggestions UI Spike.

## Current Roadmap After T0068

The current forward roadmap is:

1. Completed: T0068 - Canvas Export Parity for Accepted Motion Anchors.
2. Completed: Global Shot Transition Softening / Natural Camera Travel Polish.
3. Completed: Export verification + bug repair.
4. Completed: Project archive save/load with source image bundled.
5. Completed: Basic audio layer: upload background music, trim/loop/fade, and include it in export.
6. Completed: sound effect markers.
7. Completed: AI Automation Architecture Plan.
8. Completed: T0073 - Special Effects Direction Doc.
9. Completed: T0074 - Camera Shake Preview Spike.
10. Completed: T0075 - Flash / Vignette / Motion Blur Preview Spike.
11. Completed: T0075A - Special Effects Spike Acceptance Cleanup.
12. Completed: T0076 - Shot Effect Model.
13. Completed: T0077 - Simple Effect Presets UI.
14. Completed: T0077A - Preview Uses Persisted Effect Presets.
15. Completed: T0077B - Attention Path Effect Cues.
16. Completed: T0078 Canvas Export Effect Parity.
17. Completed: T0078A - Attention Cue Timing Presets.
18. Completed: T0079 - AI Director Suggestions Planning.
19. Completed: T0080 - AI Director Suggestions UI Spike.
20. Completed: T0081 - AI Suggestion Accept/Apply Spike.
21. Completed: T0081A - AI Suggestion Target Binding Guardrails.
22. Completed: T0082 - AI Draft Attention Path Spike.
23. Completed: T0083 - AI Draft Shots/Focus Regions Planning.
24. Completed: T0084 - Audio/BGM/SFX Suggestions Planning.
25. Completed: T0085 - AI Director-Assistant Roadmap Reassessment.
26. Completed: T0086 - Unified Suggestion Review Surface Planning.
27. Completed: T0087 - AI Vision Page Understanding Contract Planning.
28. Completed: T0088 - DynamicManga Director Rulebook / Knowledge Pack Planning.
29. Completed: T0089 - AI Budget / Provider Decision Gate Planning.
30. Completed: T0090 - Real AI Page Understanding Spike.
31. Completed: T0090A - AI Review UI Cleanup and Stale Suggestion Control Removal.
32. Completed: T0091 - AI Analysis Validation / Review Hardening.
33. Completed: T0092 - AI Page Understanding Card-to-Page Highlighting.
34. Completed: T0093 - AI Director Suggestion Drafts from Page Understanding.
35. Completed: T0094 - Detail Confidence Badge Color.
36. Completed: T0095 - Editable Detail Highlights.
37. Completed: T0096 - Detail Persistence / Import-Export Parity.
38. Completed: T0097 - Detail Workflow Hardening.
39. Completed: T0098 - AI Director Suggestion Contract Planning.
40. Completed: T0099 - AI Camera Suggestion Review Surface.
41. Completed: T0100 - Accepted Suggestion to Draft Motion.
42. Completed: T0101 - Practice Fixture and Evaluation Pass.
43. Completed: T0102 - Motion Naturalness and Timing Pass.
44. Completed: T0102A - AI Camera Suggestion Density Guardrails.
45. Completed: T0103 - Audio/SFX Suggestion Pass.
46. Completed: T0104 - Read-Only Audio Suggestion Notes UI.
47. Completed: T0105 - Audio Suggestion Apply Guardrails Planning.
48. Completed: T0106 - Director Rulebook v1 Planning.
49. Completed: T0106A - Track Chain Entry Continuity Repair.
50. Completed: T0107 - Director Rulebook Runtime Integration.
51. Completed: T0107A - AI Motion Suggestion Overlap Consolidation.
52. Completed: T0107B - AI Draft Panel-First Continuity Tuning.
53. Completed: T0108 - Rulebook Evaluation Pass.
54. T0109 - Rulebook Evaluation Findings Tuning.
55. T0110 - Practice Page Provider Evaluation Run.
56. T0111 - Manual Provider Practice Run With User-Selected Pages.
57. Completed: T0112 - Browser Draft Motion and Audio Notes Practice Verification.
58. Completed: T0112A - Audio Notes Simplicity Tuning.
59. Completed: T0099A - AI Camera Suggestion UI Rework.
60. Next: choose a new narrow follow-up from manual browser findings or continue with the next roadmap planning pass.

Roadmap guardrails:
- Do not treat older effect-first, panel, OCR/text, or fully automatic AI tickets as the immediate next step.
- Special effects must be rendering-layer modifiers only; they must not define camera placement or add motion roles beyond `track`, `pushIn`, and `pushOut`.
- Keep AI as a director-assistant layer first: reviewable suggestions before explicit user application.
- Do not let first-phase AI automatically create Camera Shots, Focus Regions, or Shot Attention Paths.
- Do not let AI/mock motion suggestions apply unless the target Camera Shot, Shot Attention Path item, and referenced Focus Region already exist.
- Treat Shake and Impact Pulse as supporting mood/timing layers only, not camera movement replacements.
- Keep audio, sound effects, dialogue/narration, online fetching/downloading, and real provider integrations out of scope until separately ticketed.
- Keep the next AI branch focused on corrected page understanding first, then AI camera suggestions, user review, and accepted suggestions becoming draft motion through explicit user control.
- Prefer merged implementation tickets after T0096 so Codex reports less frequently, while keeping risky boundaries clear in each ticket.
- Treat current JSON/mock director notes as scaffolding, not the final AI experience.
- Keep real AI output temporary and review-only until a future ticket explicitly scopes acceptance or persistence behavior.
- Preserve the manual-first, page-preserving cinematic guided-view editor direction.

## Current Planning Ticket - T0067 Export Parity After Motion Model Plan

Goal: define how canvas/video export should eventually match the current browser-preview motion grammar after the browser-preview model is manually accepted.

Implemented changes:
- Added `docs/planning/Export_Parity_After_Motion_Model_Plan.md`.
- Defined export parity for accepted Shot Attention Path motion anchors, including accepted path order, `durationWeight`, missing-reference safety, and fallback behavior.
- Defined later export parity expectations for active `track`, `pushIn`, and `pushOut` role behavior.
- Documented the current `track` follow-spot candidate as a pending-acceptance export target: camera-motion-first, darkened active shot/background, soft moving radial transparent spot only on `track -> track` transitions, and smooth size interpolation across Focus Region sizes.
- Explicitly excluded deprecated `track` visual language from future export parity: rails, ribbons, corridors, aperture masks, endpoint capsules/ovals/blobs, moving squares, sliding boxes, punched cutouts, and Focus Region-shaped highlights.
- Identified DOM/CSS/SVG-to-canvas translation risks before source changes.
- Added a later implementation checklist for export parity without implementing export behavior.
- Kept source behavior, package files, Project JSON schema/import/export, browser preview behavior, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior unchanged.

Historical note: browser-preview `track`, `pushIn`, and `pushOut` grammar has since been accepted as a practical baseline, and T0068 export parity has since been implemented.

## Current Narrow Cleanup Ticket - Active Camera Grammar Runtime Cleanup

Goal: remove stale preview/UI runtime behavior that conflicts with the new camera grammar while keeping Project JSON compatibility.

Implemented changes:
- Browser preview no longer plays Focus Region effects as core behavior: `lift`, `spotlight`, `zoom`, and reveal masking were removed from active preview rendering.
- The inspector no longer exposes the old Focus Region Effect selector.
- Shot Attention Path role UI now exposes only the active grammar values: `track`, `pushIn`, and `pushOut`.
- Legacy motion roles remain parseable for existing JSON. Runtime fallback maps old `reveal` to `pushOut`, old `emphasis` to `pushIn`, old `hold` to unset/default, old `pushIn` to `pushIn`, and old `track` to `track`.
- Legacy `effectType` remains import/export compatible. Browser preview may use old `zoom` as a `pushIn` fallback and old `spotlight`/`lift` as a `track` fallback only when no explicit motion role exists.
- Canvas export remains legacy and is not aligned with the cleaned browser preview yet.

Historical note: this next-ticket recommendation was superseded by later browser-preview grammar implementation, T0067 export parity planning, and Browser Preview Motion Grammar Acceptance Review. The current next step is T0068.

## Current Hardening Pass - Legacy Fallback Guardrails

Goal: prevent legacy compatibility data from accidentally creating active browser-preview grammar before the real `track` / `pushIn` / `pushOut` implementation.

Implemented changes:
- Import no longer defaults missing or invalid `focusRegions[].effectType` to `lift`; missing/invalid values remain unset.
- Export no longer serializes missing `focusRegions[].effectType` as `lift`; only explicit legacy values are written.
- Explicit legacy `effectType` values still import for Project JSON compatibility.
- Browser preview fallback remains limited to explicit legacy `effectType` values when a path item has no explicit `motionRole`.
- Manual verification sections that mention old active `hold`, `reveal`, `emphasis`, `lift`, `spotlight`, `zoom`, reveal masking, or Focus Style behavior are now marked historical/legacy where they remain for older-ticket context.

Historical note: this next-ticket recommendation was superseded by later browser-preview grammar implementation, T0067 export parity planning, and Browser Preview Motion Grammar Acceptance Review. The current next step is T0068.

## Current Implementation Ticket - Basic Camera Grammar Preview Implementation

Goal: make browser Auto preview interpret accepted Shot Attention Path anchors with the active basic camera grammar.

Implemented changes:
- Browser Auto preview now builds source-image camera target windows from usable accepted Shot Attention Path anchors.
- `track` anchors use context-preserving windows around Focus Regions and interpolate continuously along the accepted path order.
- Differently sized `track` Focus Regions now interpolate both center and viewport size/scale.
- `pushIn` anchors move to exact or near-exact Focus Region close-up windows instead of the old restrained nudge.
- `pushOut` anchors use a two-stage close-up-to-context path, expanding toward the next anchor context when available or the full Camera Shot when no next anchor exists.
- A minimal track-only attention field follows the interpolated rail. It is tied to `track` movement and does not restore old spotlight/effectType behavior.
- Final intra-shot placement remains available for the shot exit/next-shot transition.
- Old lift, spotlight, zoom, reveal masking, and decorative focus-effect playback remain removed from browser preview.
- Canvas export remains legacy/unchanged, and export parity remains delayed.

Next recommended ticket: manual browser tuning for the new basic grammar after creator review, or export parity planning only after the browser grammar is accepted.

## Current Tuning Pass - Track Attention Field Dim Strength

Goal: make the track-only attention field more readable during browser Auto preview without changing the camera grammar architecture.

Implemented changes:
- Increased the track-only surrounding dim strength.
- Added a slightly clearer track aperture outline and subtle interior lift so the active rail target reads more clearly.
- Kept the treatment tied only to active `track` grammar, not `effectType`.
- Did not change `track` target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, or old effect playback.

Next recommended ticket: continue manual browser tuning only if creator review finds specific grammar issues; otherwise delay export parity until the browser grammar is accepted.

## Current Repair - Track Attention Field Rail Continuity

Goal: make the track-only attention field travel with the camera rail instead of appearing pinned to the first Focus Region.

Implemented changes:
- Track attention field geometry now interpolates from the outgoing shot/anchor region into the active track Focus Region.
- The first track segment starts from the Camera Shot window and morphs toward the first Focus Region.
- Later track segments morph from the previous anchor region to the current anchor region.
- Camera target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, and old effect playback remain unchanged.

## Current Repair - Track Attention Field Aperture Locality

Goal: keep the visible track attention field local to Focus Region rail geometry instead of lighting a broad Camera Shot chunk.

Implemented changes:
- Track camera motion can still start from broader shot context, but the visible attention aperture no longer starts from the full Camera Shot.
- The first track anchor now uses a local Focus Region aperture with a short opacity ramp.
- Later track anchors morph the visible aperture from previous Focus Region geometry to current Focus Region geometry.
- The aperture uses a small restrained margin around Focus Regions and remains clamped inside the active Camera Shot.
- Camera target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, and old lift/spotlight/zoom/reveal playback remain unchanged.

## Current Repair - Track Rail Attention Overlay

Goal: replace the rectangular track attention aperture with a narrow rail/corridor overlay between Focus Regions.

Implemented changes:
- Track attention now renders as a browser-preview-only SVG dim mask.
- The first track anchor shows a local Focus Region aperture only.
- Later track anchors render a controlled centerline corridor from the previous Focus Region center toward the current Focus Region center, with local endpoint capsules.
- Rail thickness is clamped and based on Focus Region projected size so differing Focus Region sizes do not create a huge trapezoid or broad rectangle.
- Camera target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, and old lift/spotlight/zoom/reveal playback remain unchanged.

## Current Repair - Track Rail Endpoint Visual Repair

Goal: keep `track` rail-first by removing FR-sized endpoint aperture/capsule visuals.

Implemented changes:
- Removed endpoint ellipses/capsules and rounded rectangle apertures from active `track` overlay rendering.
- The first track anchor no longer shows a Focus Region-sized rectangle or oval; it shows only a short narrow rail mark when a next track anchor exists.
- FR-to-FR transitions now render only a narrow rail/beam with tightly clamped thickness.
- Focus Region size may still inform rail thickness, but it no longer creates visible endpoint blobs.
- Camera target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, and old lift/spotlight/zoom/reveal playback remain unchanged.

## Current Repair - Track Rail-Only Visual Repair

Goal: remove every active moving aperture/window/box from `track` and leave only the rail visual.

Implemented changes:
- Removed the SVG mask punch-out behavior for `track`; the overlay no longer cuts a moving clear aperture through the dim layer.
- Removed the first-anchor tick/mark so the first track anchor shows no square, rectangle, oval, capsule, or aperture.
- FR-to-FR transitions now render only a narrow luminous rail stroke over a dimmed shot.
- The rail progressively grows from the previous Focus Region center toward the current Focus Region center and is hidden until it has enough length to avoid appearing as a tiny square.
- Camera target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, and old lift/spotlight/zoom/reveal playback remain unchanged.

## Current Experiment - Track Shrunken Four-Corner Ribbon Overlay

Goal: make `track` feel like a guided attention path shaped by Focus Region geometry without reverting to a spotlight, endpoint blob, UI line, or moving aperture.

Implemented changes:
- Active `track` overlay defaults to local `TRACK_ATTENTION_OVERLAY_MODE: "ribbon"` in `PreviewPlayer.tsx`.
- FR-to-FR track segments project previous/current Focus Region rectangles, shrink them toward their centers, and connect corresponding corners to form a soft ribbon.
- The current ribbon end progressively reveals from the previous Focus Region center toward the current Focus Region center.
- Ribbon width/height are clamped so very different or large Focus Regions do not create a huge lit wedge.
- First track anchors with no previous Focus Region show no rectangle, oval, capsule, square, or aperture.
- Camera target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, and old lift/spotlight/zoom/reveal playback remain unchanged.

## Current Repair - Track Overlay Simplification

Goal: remove active `track` aperture/cutout/mask/ribbon shapes and keep camera motion as the main track effect.

Implemented changes:
- Active `track` no longer renders punched masks, clear apertures, shrunken ribbons, endpoint capsules, endpoint ovals, rounded rectangles, moving squares, or sliding aperture boxes.
- The first track anchor with no previous Focus Region shows no active track overlay.
- FR-to-FR track segments now use only a subtle uniform dim over the preview plus an optional non-aperture rail stroke between interpolated Focus Region centers.
- The rail stroke uses restrained opacity and butt caps so it reads as guidance rather than a blob, spotlight, or debug aperture.
- Camera target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, Project JSON schema/import/export, and old lift/spotlight/zoom/reveal playback remain unchanged.

## Current Repair - Track Follow-Spot Attention Repair

Goal: keep the simplified camera-motion-first `track` direction while adding a subtle moving follow-spot for reader guidance.

Implemented changes:
- Active `track` no longer draws a rail/ribbon/corridor as the main visual guide.
- Browser Auto preview now dims the active shot and uses a soft transparent radial follow-spot only when both the previous Focus Region anchor and current Focus Region anchor are assigned `track`.
- `pushOut -> track` and `pushIn -> track` transitions keep their camera movement without showing the dimmed follow-spot overlay; the first track anchor also shows no follow-spot unless it is reached from another `track` anchor.
- The follow-spot size is mostly stable and tightly clamped by preview dimensions, with only light Focus Region-size influence so large Focus Regions do not create large endpoint ovals and small Focus Regions do not create tiny hard boxes.
- The track overlay uses a stronger but still readable dimmed-shot treatment with a soft circular transparent spot; it does not draw a rectangular, oval, square, ribbon, rail, or corridor highlight.
- The follow-spot dim mask now uses explicit alpha stops so the spot clears the dim layer in browser preview instead of leaving the whole shot uniformly dimmed.
- Camera target windows, `pushIn`, `pushOut`, `durationWeight`, Manual mode, canvas export, Project JSON schema/import/export, and old lift/spotlight/zoom/reveal playback remain unchanged.

## Ticket Format

Each ticket should include:

```txt
Ticket ID:
Title:
Goal:
Dependencies:
Allowed areas:
Do not touch:
Requirements:
Non-goals:
Acceptance criteria:
Manual verification:
```

---

# Phase 0 - Repo Setup and Documentation

## T0001 - Project Skeleton

Goal: Create the initial Vite + React + TypeScript project skeleton.

Dependencies: None.

Allowed areas:
- package files
- src/
- public/
- index.html
- config files

Do not touch:
- Future backend code
- Video rendering/export
- AI detection

Requirements:
- Create a working React + TypeScript app.
- Add a simple home/editor shell.
- Add basic global styling.
- Ensure `npm run dev` and `npm run build` are available.

Non-goals:
- No image upload yet.
- No camera boxes yet.
- No timeline yet.

Acceptance criteria:
- App starts locally.
- Build passes.
- Page displays project name and a simple empty editor layout.

Manual verification:
- Run `npm install`.
- Run `npm run dev`.
- Open the local URL.
- Confirm the app loads.
- Run `npm run build`.

---

## T0002 - Image Upload

Goal: Allow the user to upload one comic page image.

Dependencies:
- T0001

Allowed areas:
- src/features/upload/
- src/app/
- src/lib/projectTypes.ts if needed

Do not touch:
- Video preview
- Timeline
- Backend
- AI detection

Requirements:
- Add an image upload control.
- Accept common image formats.
- Show uploaded image name.
- Store object URL or local image reference in app state.
- Read image dimensions after load.

Non-goals:
- No drag-and-drop required.
- No multiple pages.
- No image cleanup/correction.

Acceptance criteria:
- User can select one image.
- App displays basic metadata: file name, width, height.
- App state knows the uploaded image URL and dimensions.

Manual verification:
- Upload a PNG or JPG.
- Confirm metadata appears.
- Refreshing does not need to preserve the image yet.

---

## T0003 - Page Viewer

Goal: Display the uploaded comic page in an editor area.

Dependencies:
- T0002

Allowed areas:
- src/features/editor/
- src/app/
- src/styles/

Do not touch:
- Camera shot editing
- Timeline
- Preview player

Requirements:
- Render the uploaded image.
- Preserve aspect ratio.
- Fit image inside available editor area.
- Show empty state when no image is uploaded.

Non-goals:
- No camera boxes yet.
- No zoom controls yet.

Acceptance criteria:
- Uploaded page appears correctly.
- Image is not distorted.
- Empty state is clear.

Manual verification:
- Upload a tall comic page.
- Upload a wide image.
- Confirm both fit without distortion.

---

## T0004 - First Camera Shot Box

Goal: Add one camera shot rectangle over the page.

Dependencies:
- T0003

Allowed areas:
- src/features/editor/
- src/lib/coordinateMath.ts
- src/lib/projectTypes.ts

Do not touch:
- Timeline
- Preview player
- Video export

Requirements:
- Create one default camera shot after image upload.
- Display rectangle overlay on top of the page.
- Store shot coordinates in source image coordinate space.
- Select the shot when clicked.

Non-goals:
- No resizing.
- No multiple shots.
- No timeline ordering.

Acceptance criteria:
- Camera box appears over uploaded image.
- Clicking it selects it.
- Coordinate data exists in app state.

Manual verification:
- Upload image.
- Confirm box appears inside image bounds.
- Click box and confirm selected visual state.

---

## T0005 - Drag Camera Shot Box

Goal: Make the camera shot rectangle draggable.

Dependencies:
- T0004

Allowed areas:
- src/features/editor/
- src/lib/coordinateMath.ts

Do not touch:
- Timeline
- Preview player
- Export

Requirements:
- User can drag the camera box.
- Box remains inside page bounds.
- Stored source-image coordinates update correctly.
- Dragging works even when displayed image is scaled.

Non-goals:
- No resizing.
- No snapping.
- No multiple shots.

Acceptance criteria:
- User can drag the box.
- Box cannot leave the image.
- Coordinates update after drag.

Manual verification:
- Upload image.
- Drag box to each corner.
- Confirm box stays inside image.

---

## T0006 - Multiple Camera Shots

Goal: Support multiple camera shots.

Dependencies:
- T0005

Allowed areas:
- src/features/editor/
- src/app/
- src/lib/projectTypes.ts

Do not touch:
- Preview player
- Export
- AI detection

Requirements:
- Add "Add Shot" button.
- Each shot has a unique ID.
- User can select different shots.
- Selected shot has clear visual state.

Non-goals:
- No timeline reordering yet.
- No resizing yet.

Acceptance criteria:
- User can create multiple boxes.
- User can select each one.
- App state stores all shots.

Manual verification:
- Add three shots.
- Select each shot.
- Confirm only one is selected at a time.

---

## T0007 - Shot Inspector

Goal: Add a panel to inspect and edit selected shot properties.

Dependencies:
- T0006

Allowed areas:
- src/features/editor/
- src/lib/projectTypes.ts

Do not touch:
- Preview player
- Export

Requirements:
- Show selected shot ID/label.
- Allow editing label.
- Show x, y, width, height.
- Allow editing durationMs.

Non-goals:
- No advanced movement settings yet.

Acceptance criteria:
- Selecting a shot updates inspector.
- Editing label/duration updates state.

Manual verification:
- Select shot.
- Rename it.
- Change duration.
- Confirm state/UI updates.

---

## T0008 - Basic Timeline List

Goal: Add a simple ordered list of camera shots.

Dependencies:
- T0006

Allowed areas:
- src/features/timeline/
- src/app/

Do not touch:
- Preview player
- Export

Requirements:
- Show shots in order.
- Clicking timeline item selects shot.
- Use shot label when available.

Non-goals:
- No drag reorder yet.
- No preview playback yet.

Acceptance criteria:
- Timeline shows every shot.
- Selecting a timeline item selects corresponding box.

Manual verification:
- Add several shots.
- Click timeline entries.
- Confirm editor selection changes.

---

## T0009 - Timeline Reordering

Goal: Allow moving shots up/down in the timeline.

Dependencies:
- T0008

Allowed areas:
- src/features/timeline/
- src/app/

Do not touch:
- Preview player internals
- Export

Requirements:
- Add up/down controls.
- Reorder shot array.
- Preserve selected shot.

Non-goals:
- No drag-and-drop required.

Acceptance criteria:
- Shots can move up/down.
- Timeline order updates.

Manual verification:
- Add three shots.
- Move third shot to first.
- Confirm order is changed.

---

## T0010 - Basic Preview Player

Goal: Preview camera movement between shots.

Dependencies:
- T0008

Allowed areas:
- src/features/preview/
- src/app/
- src/lib/coordinateMath.ts

Do not touch:
- MP4 export
- Backend
- AI detection

Requirements:
- Create a fixed preview viewport.
- Use source image and shot data.
- Animate from shot to shot.
- Provide Play/Stop button.

Non-goals:
- No export.
- No advanced easing UI.
- No audio.

Acceptance criteria:
- Preview moves between shots.
- Image is not distorted.
- Playback follows timeline order.

Manual verification:
- Upload page.
- Add two or more shots.
- Press Play.
- Confirm movement follows shot order.

---

## T0011 - Resize Camera Shot Box

Goal: Allow the selected camera shot rectangle to be resized while preserving the current video frame aspect ratio.

Dependencies:
- T0010

Allowed areas:
- src/features/editor/
- src/lib/coordinateMath.ts
- src/lib/projectTypes.ts if needed
- src/styles/

Do not touch:
- MP4 export
- Backend
- AI detection
- Focus regions
- Output aspect ratio settings

Requirements:
- Show a resize handle on the selected camera shot box.
- Resize from the bottom-right handle.
- Preserve the fixed 16:9 camera frame aspect ratio.
- Keep the resized camera shot inside the source image bounds.
- Enforce a minimum usable camera shot size.
- Store updated width and height in source image coordinate space.
- Keep editor overlay, inspector coordinates, timeline selection, and preview playback consistent after resize.

Non-goals:
- No free-aspect camera frame resizing.
- No focus region or inner box support.
- No multiple resize handles.
- No output aspect ratio settings.
- No snapping guides.
- No export changes.

Acceptance criteria:
- Selected shot shows a resize handle.
- Dragging the handle changes shot width and height.
- Resized shots remain 16:9.
- Resized shots cannot extend outside the uploaded page.
- Inspector width and height update after resize.
- Preview uses the resized camera frame.

Manual verification:
- Upload a comic page image.
- Select a camera shot.
- Drag the bottom-right resize handle larger and smaller.
- Confirm the box remains 16:9.
- Confirm the box stays inside the page.
- Confirm inspector width and height update.
- Press Play and confirm preview framing uses the resized shot.

---

## T0012 - Roadmap Sync + Camera Frame vs Focus Region Design Note

Goal: Sync the documentation roadmap with the current project state and document the design distinction between 16:9 camera frames and future free-ratio focus regions.

Dependencies:
- T0011

Allowed areas:
- docs/
- AGENTS.md if useful
- README.md if useful

Do not touch:
- src/
- package files
- app behavior
- preview logic
- editor logic
- timeline logic
- resize logic

Requirements:
- Add T0011 through T0015 to this roadmap without renumbering existing tickets.
- Add `docs/model/Camera_Frame_vs_Focus_Region.md`.
- Explain that camera frames are 16:9 video frames.
- Explain that focus regions are future free-ratio boxes for panels and details.
- Explain why focus regions should not replace 16:9 camera frames.
- Explain that preview and future export should continue to use camera frames.
- Add a short AGENTS.md guardrail if useful.
- Update `docs/Repo_Current_State.md` with the completed documentation sync and next recommended ticket.

Non-goals:
- Do not implement focus regions in app code.
- Do not modify source files.
- Do not change camera frame aspect ratio behavior.
- Do not add UI.
- Do not add dependencies.
- Do not change preview behavior.
- Do not change resizing behavior.

Acceptance criteria:
- `docs/Tickets.md` includes T0011, T0012, T0013, T0014, and T0015.
- Existing tickets T0001 through T0010 are not renumbered.
- New tickets use the same format as existing tickets.
- `docs/model/Camera_Frame_vs_Focus_Region.md` exists and clearly explains the two-box model.
- AGENTS.md has a short guardrail if updated.
- `docs/Repo_Current_State.md` reflects the updated roadmap.
- No `src/` files are changed.

Manual verification:
- Confirm no `src/` files changed.
- Confirm this file includes T0011 through T0015.
- Confirm T0011 describes the resize behavior already implemented.
- Confirm the design note clearly separates 16:9 camera frames from future free-ratio focus regions.
- Confirm next recommended ticket is T0013 - Focus Region Data Model.

---

## T0013 - Focus Region Data Model

Goal: Add a project data model for future free-ratio focus regions without changing editor behavior yet.

Dependencies:
- T0012

Allowed areas:
- src/lib/projectTypes.ts
- docs/

Do not touch:
- Editor drawing UI
- Preview behavior
- Timeline behavior
- Camera frame aspect ratio behavior
- Export
- AI detection

Requirements:
- Define a focus region type that uses source image coordinates.
- Support arbitrary width and height values independent of the 16:9 camera frame.
- Associate focus regions with a page, camera shot, or documented owner model.
- Document how focus regions differ from camera shots.
- Preserve existing camera shot behavior.

Non-goals:
- No focus region drawing UI.
- No focus region preview effect.
- No automatic panel detection.
- No speech bubble detection.
- No changes to camera shot resizing.

Acceptance criteria:
- Focus region data shape is documented and typed.
- Camera shots remain 16:9 camera frames.
- Existing app behavior is unchanged.
- Build passes.

Manual verification:
- Run `npm.cmd run build`.
- Confirm existing upload, shot editing, timeline, and preview behavior still work.
- Inspect type definitions and confirm focus regions are separate from camera shots.

---

## T0014 - Add Focus Region Drawing Mode

Goal: Add a manual editor mode for drawing free-ratio focus regions on the uploaded page.

Dependencies:
- T0013

Allowed areas:
- src/features/editor/
- src/app/
- src/lib/projectTypes.ts
- src/lib/coordinateMath.ts
- src/styles/
- docs/

Do not touch:
- Preview effects
- Export
- AI detection
- Camera frame aspect ratio behavior

Requirements:
- Add a way to enter focus region drawing mode.
- Allow drawing a free-ratio focus region over the displayed page.
- Store focus region coordinates in source image coordinate space.
- Keep focus regions visually distinct from 16:9 camera frames.
- Preserve existing camera shot selection, dragging, resizing, timeline, and preview behavior.

Non-goals:
- No automatic panel detection.
- No focus region highlight preview effect.
- No camera frame free-aspect resizing.
- No export changes.

Acceptance criteria:
- User can create at least one focus region manually.
- Focus regions can use arbitrary aspect ratios.
- Camera frames remain 16:9.
- Existing camera shot workflow still works.
- Build passes.

Manual verification:
- Upload a comic page.
- Draw tall, wide, and small focus regions.
- Confirm focus regions are not forced to 16:9.
- Confirm camera shot boxes remain 16:9.
- Confirm preview still follows camera frames, not focus regions.
- Run `npm.cmd run build`.

---

## T0015 - Focus Region Highlight Preview

Goal: Add a simple browser preview effect that can visually emphasize focus regions without replacing camera frame playback.

Dependencies:
- T0014

Allowed areas:
- src/features/preview/
- src/lib/projectTypes.ts
- src/lib/coordinateMath.ts
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera frame aspect ratio behavior
- Timeline reordering behavior

Requirements:
- Use camera frames for preview framing and movement.
- Add a simple visual highlight, dimming, or attention overlay for focus regions when applicable.
- Keep focus region effects optional and clearly separate from camera frame transforms.
- Preserve existing Play and Stop behavior.

Non-goals:
- No MP4 export.
- No blur engine or advanced effects.
- No automatic focus region generation.
- No camera frame free-aspect resizing.
- No audio or sound effects.

Acceptance criteria:
- Preview still frames movement using camera shots.
- Focus regions can be visually emphasized during preview.
- Camera frame transforms are not replaced by focus region bounds.
- Existing basic preview playback still works.
- Build passes.

Manual verification:
- Upload a comic page.
- Create camera shots and focus regions.
- Press Play.
- Confirm movement follows timeline camera frames.
- Confirm focus region highlight appears only as an effect.
- Run `npm.cmd run build`.

---

## T0016 - Preview Shot Phases

Goal: Separate preview playback into clear shot phases: travel, scene hold, focus attention, and exit or next transition.

Dependencies:
- T0015

Allowed areas:
- src/features/preview/
- src/lib/coordinateMath.ts
- src/lib/projectTypes.ts if needed
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera frame aspect ratio behavior
- Focus region drawing behavior
- Timeline reordering behavior

Requirements:
- Model each camera shot as a phased preview segment.
- Add a travel phase where the preview moves into the active 16:9 camera frame.
- Add a scene hold phase where the camera settles on the full active camera frame.
- Add a focus attention phase after the camera has arrived and settled.
- Add an exit or next transition phase that moves toward the next camera shot.
- Ensure focus overlays or focus-region effects do not switch halfway through camera movement.
- Keep preview camera framing driven by 16:9 camera shot boxes.
- Preserve existing Play and Stop behavior.
- Preserve shot duration behavior or document how total shot duration is divided across phases.

Non-goals:
- No focus-region cinematic zoom/pan prototype yet.
- No MP4 export.
- No audio.
- No AI panel detection.
- No output aspect ratio picker.
- No free-aspect camera shot boxes.

Acceptance criteria:
- Preview playback has explicit travel, scene hold, focus attention, and transition timing.
- Focus-region attention starts only after the active camera frame has arrived or settled.
- Focus regions do not switch abruptly halfway through camera movement.
- Preview still uses 16:9 camera shot boxes for camera framing.
- Existing timeline order still controls playback order.
- Build passes.

Manual verification:
- Upload a comic page.
- Create at least two camera shots.
- Add focus regions to the page.
- Press Play.
- Confirm the camera first moves to the active 16:9 frame.
- Confirm the preview holds briefly on the full camera frame.
- Confirm focus attention appears only after the camera settles.
- Confirm the preview then moves to the next shot.
- Run `npm.cmd run build`.

---

## T0017 - Focus Region Cinematic Motion Prototype

Goal: Use focus regions to guide simple cinematic motion inside or around the current 16:9 camera frame.

Dependencies:
- T0016

Allowed areas:
- src/features/preview/
- src/lib/coordinateMath.ts
- src/lib/projectTypes.ts if needed
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera frame aspect ratio behavior
- Focus region drawing behavior
- Focus region drag/resize editing

Requirements:
- Use eligible focus regions during the focus attention phase.
- Prototype subtle cinematic motion such as zoom, pan, or hold guided by focus regions.
- Keep the 16:9 camera frame as the outer preview framing contract.
- Avoid showing editor-like focus box UI in final-style focus motion.
- Keep motion readable and restrained.
- Preserve existing debug overlay behavior only if debug mode still needs it.

Non-goals:
- No MP4 export.
- No audio.
- No advanced blur engine.
- No automatic panel detection.
- No focus region animation editor.
- No free-aspect camera shot boxes.

Acceptance criteria:
- Focus regions can guide a simple cinematic attention movement.
- The preview does not use focus regions as replacement camera frames.
- The image is not distorted.
- Editor-like focus boxes are not required for the final-style motion.
- Existing camera shot timeline playback still works.
- Build passes.

Manual verification:
- Upload a comic page.
- Create a camera shot with one focus region.
- Press Play.
- Confirm the shot travels to the 16:9 frame, holds, then performs a simple focus-region-guided motion.
- Create multiple focus regions and confirm behavior remains readable.
- Confirm focus regions do not turn camera frames into arbitrary-aspect boxes.
- Run `npm.cmd run build`.

---

## T0018 - Focus Region Lift Preview Prototype

Goal: During preview focus phase, show eligible focus regions one at a time as enlarged floating cutouts above the main 16:9 camera frame.

Dependencies:
- T0017

Allowed areas:
- src/features/preview/
- src/lib/coordinateMath.ts
- src/lib/projectTypes.ts if needed
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera frame aspect ratio behavior
- Focus region drawing behavior
- Focus region drag/resize editing
- Timeline reordering behavior

Requirements:
- Use the existing 60% focus region inclusion rule.
- Keep the main preview camera transform driven by 16:9 camera shot boxes.
- Do not make focus regions replace camera frames.
- During the focus phase, show eligible focus regions one at a time.
- If there are multiple eligible focus regions, divide the focus phase time across them.
- Render the active focus region as an enlarged floating cutout using actual image content from the uploaded page.
- Preserve the focus region's original aspect ratio.
- Keep the lifted cutout within the preview viewport.
- Animate the lifted cutout with simple appear, hold, and fade/drop timing.
- Hide lifted focus regions during travel and scene hold phases.
- Clear lifted focus regions before moving to the next camera shot.
- Preserve existing Play and Stop behavior.

Non-goals:
- No MP4 export.
- No backend.
- No audio.
- No advanced blur engine.
- No AI panel detection.
- No OCR.
- No focus region drag/resize editing.
- No focus region label/kind inspector.
- No final preview mode toggle.
- No output aspect ratio picker.
- No free-aspect camera shot boxes.
- No focus region ownership refactor.

Acceptance criteria:
- Preview still uses 16:9 camera shot boxes as the main camera frames.
- During travel, no lifted focus region appears.
- During scene hold, no lifted focus region appears.
- During focus phase, eligible focus regions appear one at a time.
- A lifted focus region shows actual image content from the focus region.
- The lifted focus region preserves its aspect ratio.
- A shot with multiple focus regions steps through them during the focus phase.
- Other focus regions do not visually compete with the active focus region.
- A shot with no focus regions previews safely.
- Stop clears the lifted focus region safely.
- Build passes.

Manual verification:
- Upload a comic page.
- Create one camera shot.
- Draw one focus region inside it.
- Press Play.
- Confirm the camera holds on the full 16:9 scene first.
- Confirm the focus region appears as an enlarged floating cutout with actual image content.
- Confirm it disappears before playback leaves the shot.
- Draw multiple focus regions inside the same camera shot.
- Press Play and confirm the preview steps through them one at a time.
- Create a second camera shot with its own focus regions.
- Confirm playback handles each shot's focus regions.
- Run `npm.cmd run build`.

---

## T0019 - Focus Region Label/Kind Inspector

Goal: Allow users to edit focus region labels and kinds.

Dependencies:
- T0014

Allowed areas:
- src/features/editor/
- src/app/
- src/lib/projectTypes.ts
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera frame aspect ratio behavior
- Preview cinematic motion behavior
- Focus region drag/resize editing unless already implemented

Requirements:
- Show selected focus region metadata in an inspector or focused editor control.
- Allow editing focus region label.
- Allow editing focus region kind.
- Support existing kinds: panel, speech, face, detail, action, and other.
- Preserve existing shot inspector behavior.
- Preserve existing focus region drawing, selection, and deletion behavior.

Non-goals:
- No automatic kind detection.
- No OCR.
- No speech bubble recognition.
- No MP4 export.
- No free-aspect camera shot boxes.

Acceptance criteria:
- Selecting a focus region exposes its label and kind for editing.
- Editing label updates focus region state.
- Editing kind updates focus region state.
- Camera shot labels and durations still work.
- Build passes.

Manual verification:
- Upload a comic page.
- Draw a focus region.
- Select the focus region.
- Change its label.
- Change its kind to speech, face, detail, action, and other.
- Confirm existing camera shot inspector behavior still works.
- Run `npm.cmd run build`.

---

## T0020 - Preview Overlay Toggle / Debug vs Final Preview

Goal: Add a way to distinguish debug/editor preview overlays from final cinematic preview.

Dependencies:
- T0017

Allowed areas:
- src/features/preview/
- src/app/
- src/lib/projectTypes.ts if needed
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera frame aspect ratio behavior
- Focus region drawing behavior
- Focus region drag/resize editing

Requirements:
- Add a preview mode control or equivalent state for debug versus final-style preview.
- In debug mode, focus regions may show glowing boxes, labels, and diagnostic overlays.
- In final preview mode, editor-like focus boxes and labels should be hidden.
- In final preview mode, focus regions should guide cinematic motion or effects instead of appearing as editor UI.
- Preserve existing camera shot playback order and 16:9 framing.

Non-goals:
- No MP4 export.
- No backend rendering.
- No advanced effect editor.
- No AI panel detection.
- No output aspect ratio picker.
- No free-aspect camera shot boxes.

Acceptance criteria:
- User can distinguish debug overlay preview from final-style preview.
- Debug mode can show focus region boxes and labels.
- Final preview hides editor-like focus boxes and labels.
- Final preview still uses focus regions for cinematic attention behavior when available.
- Camera frames remain 16:9.
- Build passes.

Manual verification:
- Upload a comic page.
- Create camera shots and focus regions.
- Preview in debug mode and confirm focus overlays are visible.
- Preview in final mode and confirm editor-like boxes/labels are hidden.
- Confirm camera shot playback order still follows the timeline.
- Run `npm.cmd run build`.

---

## T0021 - Focus Region Drag and Resize Editing

Goal: Allow users to move and resize existing focus regions after drawing them.

Dependencies:
- T0014
- T0019

Allowed areas:
- src/features/editor/
- src/app/
- src/lib/projectTypes.ts if needed
- src/lib/coordinateMath.ts if needed
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera shot geometry behavior
- Preview cinematic behavior
- Timeline ordering behavior
- Project JSON import/export

Requirements:
- Keep focus regions as page-level annotations.
- Allow dragging the selected focus region on the editor canvas.
- Add at least a bottom-right resize handle for the selected focus region.
- Preserve arbitrary focus region aspect ratios while resizing.
- Keep focus regions inside source image bounds.
- Update focus region source-image coordinates after move or resize.
- Preserve existing focus region label, kind, selection, and deletion behavior.
- Do not change camera shot geometry when moving or resizing focus regions.

Non-goals:
- No automatic panel detection.
- No AI ordering.
- No preview cinematic behavior changes.
- No advanced multi-handle resize system.
- No snapping guides.
- No undo/redo.
- No MP4 export.

Acceptance criteria:
- User can select an existing focus region and drag it.
- User can resize an existing focus region from at least the bottom-right corner.
- Focus regions remain free-ratio and are not forced to 16:9.
- Focus regions cannot leave the uploaded page bounds.
- Camera shot boxes are unaffected by focus region edits.
- Inspector coordinates update after focus region move and resize.
- Build passes.

Manual verification:
- Upload a comic page.
- Draw a focus region.
- Select and drag the focus region to several positions.
- Resize the focus region into tall, wide, and square-ish shapes.
- Confirm the focus region stays inside the page.
- Confirm camera shots do not move or resize.
- Confirm inspector label/kind editing still works.
- Run `npm.cmd run build`.

---

## T0022 - Focus Region Effect Type Controls

Goal: Let each focus region choose what kind of cinematic attention effect it should use.

Dependencies:
- T0019
- T0020

Allowed areas:
- src/lib/projectTypes.ts
- src/features/editor/
- src/features/preview/ if needed for default behavior
- src/app/
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera shot resize behavior
- Timeline reordering behavior
- Project JSON import/export unless needed for type documentation only

Requirements:
- Add an `effectType` field to focus regions.
- Start with simple effect type values: `lift`, `spotlight`, `zoom`, and `none`.
- Treat the existing lifted cutout behavior as the default effect.
- Add inspector UI for editing the selected focus region's effect type.
- Preserve existing focus region label and kind editing.
- Preserve page-level focus region ownership.
- Keep preview behavior deterministic if a focus region lacks an explicit effect type.

Non-goals:
- No complex effect editor.
- No effect keyframes.
- No custom durations per focus region.
- No MP4 export.
- No AI effect selection.
- No project JSON export/import implementation.

Acceptance criteria:
- Focus region type definitions include an effect type.
- Selecting a focus region exposes an effect type control in the inspector.
- User can switch between `lift`, `spotlight`, `zoom`, and `none`.
- Existing focus regions without an explicit effect type continue to preview safely.
- Label and kind inspector controls still work.
- Build passes.

Manual verification:
- Upload a comic page.
- Draw a focus region.
- Select the focus region.
- Change its effect type through all supported values.
- Confirm label and kind editing still work.
- Press Play and confirm existing preview behavior remains safe.
- Run `npm.cmd run build`.

---

## T0023 - Focus Region Attention Sequencing

Goal: Allow focus regions inside a shot to play in a controllable order during the focus attention phase.

Dependencies:
- T0021
- T0022

Allowed areas:
- src/lib/projectTypes.ts
- src/features/editor/
- src/features/preview/
- src/app/
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Camera shot timeline ordering behavior
- Project JSON import/export unless documenting future fields

Requirements:
- Add a simple ordering model for focus regions.
- Let the user control or influence focus region sequence order.
- Preview should step through eligible focus regions in the configured order.
- Keep ordering deterministic and readable.
- Preserve page-level focus region ownership.
- Preserve camera shot timeline order.
- Preserve existing focus region eligibility rules unless a ticket explicitly changes them.

Non-goals:
- No AI ordering.
- No reading-order detection.
- No drag-and-drop timeline replacement.
- No advanced keyframes.
- No per-region timing curves.
- No MP4 export.

Acceptance criteria:
- Eligible focus regions have a deterministic sequence order.
- User can change or influence the sequence order.
- Preview steps through focus regions according to that order.
- Camera shot timeline order remains unchanged.
- Existing page-level focus regions still work.
- Build passes.

Manual verification:
- Upload a comic page.
- Create one camera shot with several eligible focus regions.
- Set or adjust their sequence order.
- Press Play and confirm focus attention follows the configured order.
- Reorder camera shots and confirm focus sequence within each shot remains deterministic.
- Run `npm.cmd run build`.

---

## T0024 - Shot-Level Focus Timing Controls

Goal: Give each camera shot simple controls for how much of its duration is used for scene hold versus focus attention.

Dependencies:
- T0016
- T0023

Allowed areas:
- src/lib/projectTypes.ts
- src/features/editor/
- src/features/preview/
- src/app/
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Advanced keyframe animation
- Project JSON import/export unless documenting future fields
- Camera shot flexible aspect behavior

Requirements:
- Add simple shot-level timing fields or presets for scene hold and focus attention.
- Keep total `durationMs` as the main shot time budget.
- Preserve the existing phased preview model.
- Make focus pacing more user-controllable.
- Keep timing validation simple and safe.
- Preserve existing Play and Stop behavior.
- Preserve focus region sequencing behavior.

Non-goals:
- No advanced keyframes.
- No per-focus-region custom timing editor.
- No graph editor.
- No easing editor.
- No MP4 export.
- No AI timing generation.

Acceptance criteria:
- User can adjust a shot's scene hold versus focus attention balance.
- Preview timing changes according to the selected shot-level timing settings.
- Total shot duration remains the main time budget.
- Invalid timing values are prevented or handled safely.
- Existing duration, label, timeline, and preview behavior remain usable.
- Build passes.

Manual verification:
- Upload a comic page.
- Create a camera shot with focus regions.
- Adjust scene hold and focus attention settings.
- Press Play and confirm pacing changes.
- Confirm total shot duration still controls the overall shot time.
- Confirm Play and Stop still work.
- Run `npm.cmd run build`.

---

## T0024A - Real Focus Region Motion Effects

Goal: Add distinct MVP-level preview behavior for focus region effect types before project JSON export/import work.

Dependencies:
- T0022
- T0023
- T0024

Allowed areas:
- src/features/preview/
- src/lib/projectTypes.ts if helper types are needed
- src/lib/coordinateMath.ts if helper math is needed
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Project JSON export/import
- Camera shot ownership or timeline ownership models
- Focus region ownership model

Requirements:
- Preserve fixed 16:9 preview stage behavior.
- Preserve flexible camera shot boxes and clipped shot-window preview rendering.
- Preserve page-level focus region ownership.
- Preserve focus region sequencing and shot-level timing controls.
- Preserve `effectType: none` behavior by skipping cinematic focus effects for that region.
- Keep missing focus region effect types falling back safely to `lift`.
- Keep the existing lifted cutout behavior for `lift`.
- Add a distinct `spotlight` preview effect that dims the active shot window and emphasizes the active focus region without editor-like Final mode boxes.
- Add a distinct `zoom` preview effect that performs a restrained push-in around the active focus region inside the clipped shot window.
- Run effects only during the focus attention phase and in configured focus sequence order.

Non-goals:
- No advanced keyframes.
- No per-region duration controls.
- No custom easing editor.
- No AI effect selection.
- No MP4 export.
- No Project JSON export/import.

Acceptance criteria:
- Lift, spotlight, zoom, and none each have distinct safe preview behavior.
- Final mode looks cinematic and avoids labels or editor handles.
- Debug mode remains useful for diagnosing active focus behavior.
- Focus effects respect eligibility, sequence order, and shot-level timing.
- Focus regions do not become replacement camera shots.
- Build passes.

Manual verification:
- Upload an image.
- Create one camera shot.
- Draw several focus regions inside the shot.
- Set sequence order and shot-level focus timing.
- Set one region to lift, one to spotlight, one to zoom, and one to none.
- Press Play and confirm the configured sequence, effect behavior, Final/Debug presentation, clipping, and timing.
- Confirm deleting a camera shot still does not delete focus regions.
- Run `npm.cmd run build`.

---

## T0024B - Focus Region Transition Motion

Goal: Add simple MVP-level transition motion between active focus regions during the focus attention phase.

Dependencies:
- T0022
- T0023
- T0024
- T0024A

Allowed areas:
- src/features/preview/
- src/lib/coordinateMath.ts if helper math is needed
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Project JSON export/import
- Focus region ownership model
- Camera shot ownership or timeline order model

Requirements:
- Preserve fixed 16:9 preview stage behavior.
- Preserve flexible camera shot boxes and clipped shot-window rendering.
- Preserve page-level focus region ownership.
- Preserve focus region sequence order.
- Preserve shot-level timing controls.
- Preserve `lift`, `spotlight`, `zoom`, and `none` behavior.
- Keep `effectType: none` regions skipped from cinematic focus effects.
- Add simple transition behavior between one active focus region and the next inside the focus attention phase.
- Keep transitions subtle, cinematic, and sequence-order driven.
- Keep Final mode clean and Debug mode useful.
- Do not make focus regions replacement camera shots.

Non-goals:
- No advanced keyframes.
- No custom transition curve UI.
- No per-region duration controls.
- No AI motion planning.
- No MP4 export.
- No Project JSON export/import.

Acceptance criteria:
- Attention transitions between eligible focus regions in sequence order.
- Lift transitions are smoother than abrupt switching.
- Spotlight and zoom emphasis can move or crossfade cleanly between regions.
- `none` regions are skipped.
- Shot timing controls still affect focus pacing.
- Final/Debug modes continue to behave correctly.
- Build passes.

Manual verification:
- Create one camera shot.
- Add three or more eligible focus regions.
- Give them sequence order values.
- Use lift, spotlight, zoom, and none effect types.
- Press Play.
- Confirm attention transitions in sequence order.
- Confirm lift, spotlight, zoom, and none remain safe and distinct.
- Confirm clipped shot-window preview and page-level focus regions still work.
- Run `npm.cmd run build`.

---

## T0025 - Project JSON Export Foundation

Goal: Export the current project state as a JSON file.

Dependencies:
- T0022
- T0024
- T0024A
- T0024B

Allowed areas:
- src/lib/
- src/app/
- src/features/ as needed for export UI
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- Cloud storage
- Authentication
- Payments
- Multi-page support
- Project JSON import implementation

Requirements:
- Export a schema version.
- Export uploaded image metadata or image reference.
- Export camera shots, labels, durations, geometry, timing controls, and timeline order.
- Export page-level focus regions.
- Include focus region `kind`, `label`, `sourceShotId` if present, and `effectType` if implemented.
- Include focus region ordering fields if implemented.
- Do not export image binary unless clearly documented as unsupported or out of scope.
- Keep the exported JSON readable and deterministic.

Non-goals:
- No JSON import in this ticket.
- No image binary bundling.
- No cloud sync.
- No MP4 export.
- No backend persistence.
- No multi-page project support.

Acceptance criteria:
- User can export current project data as JSON.
- JSON includes schema version.
- JSON includes camera shots in timeline order.
- JSON includes page-level focus regions and relevant cinematic fields.
- JSON does not imply image binary is included unless it actually is.
- Build passes.

Manual verification:
- Upload a comic page.
- Create several camera shots.
- Create and edit focus regions.
- Export project JSON.
- Inspect the JSON and confirm expected fields are present.
- Confirm source image binary is not silently implied.
- Run `npm.cmd run build`.

---

## T0026 - Project JSON Import Foundation

Goal: Import a previously exported project JSON file.

Dependencies:
- T0025

Allowed areas:
- src/lib/
- src/app/
- src/features/ as needed for import UI
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- Cloud storage
- Authentication
- Payments
- Multi-page support
- AI detection

Requirements:
- Validate basic schema and version.
- Restore camera shots, labels, durations, geometry, timing controls, and timeline order.
- Restore page-level focus regions.
- Restore focus region labels, kinds, sourceShotId values, effect types, and sequence fields when present.
- Handle missing image binary or unavailable image references gracefully.
- Preserve current upload flow if an imported project needs the user to reselect the image.
- Show a clear error or empty state for invalid JSON.

Non-goals:
- No cloud storage.
- No multi-page project support.
- No image binary archive format.
- No automatic image lookup.
- No MP4 export.
- No schema migration framework beyond basic version handling.

Acceptance criteria:
- User can select a valid exported project JSON file.
- Valid project data restores camera shots and page-level focus regions.
- Invalid JSON is rejected safely with a clear message.
- Missing image data/reference does not crash the app.
- User can continue editing after import.
- Build passes.

Manual verification:
- Export a project JSON from T0025.
- Import that JSON.
- Confirm camera shots, durations, labels, timeline order, and focus regions are restored.
- Confirm focus region cinematic fields are restored when present.
- Try importing invalid JSON and confirm the app handles it safely.
- Run `npm.cmd run build`.

---

## T0027 - Manual Verification, Schema Docs, and State Review

Goal: Refresh manual verification docs, document Project JSON schema v1, and review project state consistency after T0026.

Dependencies:
- T0026

Allowed areas:
- docs/Tickets.md
- docs/Manual_Verification_Guide.md
- docs/Repo_Current_State.md
- docs/Known_Issues_And_Followups.md
- docs/model/Camera_Frame_vs_Focus_Region.md if needed
- README.md if useful
- AGENTS.md if useful

Do not touch:
- src/
- package files
- dist/
- app behavior
- editor logic
- preview logic
- import/export code
- timeline logic

Requirements:
- Refresh manual verification coverage for the current app.
- Document Project JSON schema version 1.
- Review high-level project state consistency after import/export.
- Record findings as follow-ups only.
- Do not fix source issues.

Non-goals:
- No source changes.
- No app behavior changes.
- No import/export implementation changes.
- No bug fixes.

Acceptance criteria:
- Manual verification guide reflects the current app after T0026.
- Project JSON schema v1 is documented.
- State review notes are concise and practical.
- Any findings are recorded as follow-ups only.
- No `src/` files or package files are changed.

Manual verification:
- Confirm no `src/` files changed.
- Confirm this roadmap includes T0027 through T0032.
- Confirm T0028 is the next recommended ticket.
- Build is not required for this docs-only ticket.

---

## T0028 - Editor Zoom/Pan Controls

Goal: Add editor zoom and pan controls so users can accurately place camera shots and focus regions on large comic pages.

Dependencies:
- T0027

Allowed areas:
- src/features/editor/
- src/app/
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Project JSON schema unless needed for documentation

Requirements:
- Add editor zoom controls.
- Add editor pan controls.
- Preserve source-image coordinate storage.
- Keep camera shot and focus region editing accurate while zoomed.
- Preserve existing upload, timeline, preview, import, and export behavior.

Non-goals:
- No image editing.
- No automatic panel detection.
- No minimap unless separately ticketed.
- No MP4 export.

Acceptance criteria:
- Users can zoom and pan the editor canvas.
- Camera shots and focus regions still align with the source image.
- Dragging and resizing remain source-coordinate accurate.
- Build passes.

Manual verification:
- Upload a large image.
- Zoom in, pan, drag/resize camera shots and focus regions.
- Confirm coordinates and preview remain consistent.
- Run `npm.cmd run build`.

---

## T0029 - Focus Region Presets / Quick Kind Buttons

Goal: Speed up focus-region creation with quick kind/effect presets such as Speech, Face, Action, Detail, Panel, and Other.

Status: Deferred. Presets are not valuable enough yet because focus regions currently have only one behavior-changing user-facing parameter, `effectType`, plus kind metadata. Revisit this after focus regions gain more cinematic parameters such as intensity, duration weighting, transition style, lift scale, or spotlight softness.

Dependencies:
- Deferred until focus-region cinematic controls are richer.

Allowed areas:
- src/features/editor/
- src/app/
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Project JSON schema unless needed for documentation

Requirements:
- Add quick controls for common focus region kind/effect combinations.
- Apply the selected preset to newly created focus regions.
- Preserve inspector editing after creation.
- Preserve existing focus region drag/resize behavior.

Non-goals:
- No AI kind detection.
- No speech bubble recognition.
- No OCR.
- No complex preset manager.

Acceptance criteria:
- Users can choose a quick preset before creating a focus region.
- New focus regions get the expected kind/effect defaults.
- Existing inspector controls can still edit kind and effect type.
- Build passes.

Manual verification:
- Create focus regions with each preset.
- Confirm kind/effect values in the inspector.
- Confirm preview remains safe for all effect types.
- Run `npm.cmd run build`.

---

## T0029A - UI Layout Comfort Pass

Goal: Make the current app interface less cramped and easier to scan without changing workflow or behavior.

Dependencies:
- T0028

Allowed areas:
- src/styles/
- src/app/ if markup spacing hooks are necessary
- src/features/ only for layout class names if necessary
- docs/

Do not touch:
- App behavior
- Data models
- Editor coordinate math
- Preview logic
- Import/export logic
- Project JSON schema
- MP4 export
- Backend
- AI detection

Requirements:
- Increase breathing room in the main workspace.
- Improve spacing between panels and controls.
- Improve readability of inspector, timeline, upload, and preview areas.
- Make header actions less cramped.
- Keep editor, preview, timeline, import/export, and inspector behavior unchanged.
- Keep responsive behavior safe.
- Do not redesign the full app.
- Do not add new features.
- Do not change source-coordinate math.
- Do not change preview behavior.
- Keep build passing when implemented later.

Non-goals:
- No workflow changes.
- No new controls.
- No data model changes.
- No preview behavior changes.
- No import/export behavior changes.
- No full visual redesign.

Acceptance criteria:
- The app feels less cramped and easier to scan.
- Existing workflows remain unchanged.
- Responsive layout remains usable.
- Build passes.

Manual verification:
- Upload an image and inspect upload, editor, timeline, preview, and inspector spacing.
- Confirm existing camera shot and focus region workflows still work.
- Confirm import/export controls remain clear and usable.
- Check desktop and narrow viewport layouts.
- Run `npm.cmd run build`.

---

## T0030 - Camera Shot Transition Polish

Goal: Improve transitions between camera shots without adding a full keyframe editor.

Status: Implemented. Camera shot travel now interpolates source-space shot center and size with a deterministic smootherstep ease-in/ease-out curve before deriving clipped preview placement. Focus-region transitions remain scoped to the active shot's focus phase.

Dependencies:
- T0027

Allowed areas:
- src/features/preview/
- src/lib/coordinateMath.ts if needed
- src/styles/
- docs/

Do not touch:
- MP4 export
- Backend
- AI detection
- Project JSON schema unless needed for documentation

Requirements:
- Improve camera movement readability between timeline shots.
- Keep the fixed 16:9 preview stage.
- Preserve flexible camera shot subject regions.
- Preserve focus-region attention timing and effects.

Non-goals:
- No keyframe editor.
- No graph/easing editor.
- No audio.
- No MP4 export.

Acceptance criteria:
- Transitions between camera shots feel smoother and more predictable.
- Focus-region effects still occur during the intended focus attention phase.
- Existing timeline order remains the playback source.
- Build passes.

Manual verification:
- Create three or more camera shots with varied aspect ratios.
- Preview playback and confirm transition polish.
- Confirm focus effects still run at the right time.
- Run `npm.cmd run build`.

---

## T0031 - MVP Export Readiness Plan

Goal: Document the architecture choice for MP4/video export before implementation.

Status: Implemented in `docs/planning/MVP_Export_Readiness_Plan.md`. The recommended MVP direction is a browser-side render-specific canvas pipeline captured with MediaRecorder, while keeping the current DOM/CSS preview as the interactive reference rather than treating it as directly exportable video.

Dependencies:
- T0027

Allowed areas:
- docs/
- README.md if useful
- AGENTS.md if useful

Do not touch:
- src/
- package files
- app behavior
- preview logic
- import/export code

Requirements:
- Compare browser-only canvas recording, browser MediaRecorder, client-side FFmpeg/WASM, backend FFmpeg, and hybrid export approaches.
- Pick an MVP export direction.
- Document data flow from Project JSON/preview state to render output.
- Identify risks, dependencies, and verification needs.

Non-goals:
- No MP4 export implementation.
- No dependency installation.
- No backend scaffold.
- No UI changes.

Acceptance criteria:
- Export architecture recommendation is documented.
- MVP scope and non-goals are clear.
- Follow-up implementation ticket is ready to execute.
- No source files are changed.

Manual verification:
- Review the plan for consistency with the two-box camera/focus-region model.
- Confirm it does not introduce AI, cloud, auth, or multi-page scope.

---

## T0032 - MP4 Export Prototype

Goal: Create a first rough video export prototype based on existing preview/project data.

Status: Implemented. The app now has an Export Video Prototype header action that renders the current single-page project into a fixed 1280x720 canvas and records it with browser MediaRecorder support. MP4 is attempted when the browser supports it; otherwise the prototype falls back to WebM. Focus-region effects are included as rough canvas approximations, not full DOM/CSS preview parity.

Dependencies:
- T0031

Allowed areas:
- `src/features/preview/` or a new narrowly scoped export feature folder
- `src/lib/` for shared render/timing helpers if needed
- `src/styles/` for minimal export UI styling
- `docs/` for verification notes

Do not touch:
- Cloud storage
- Authentication
- Payments
- AI detection
- Multi-page support unless separately ticketed

Requirements:
- Add a rough browser-side export action for the current single-page project.
- Render a fixed 16:9 canvas from the uploaded source image and project state.
- Use camera shots in timeline order.
- Preserve flexible camera shot subject regions and clipped shot-window behavior.
- Preserve shot phase timing and deterministic camera travel.
- Include focus-region effects as scoped for MVP, or document any effect-specific gaps before finishing.
- Capture canvas output with MediaRecorder when supported.
- Show a clear unsupported-browser message when capture is unavailable.
- Keep the prototype scoped and explicitly rough.

Non-goals:
- No production render queue.
- No cloud rendering.
- No audio.
- No advanced export settings unless defined by T0031.
- No backend.
- No dependency installation unless explicitly approved by a later ticket.

Acceptance criteria:
- User can generate a basic video artifact for the current project.
- Output follows camera shot timeline order.
- Output includes the source image and configured camera/focus behavior as scoped by T0031.
- Project JSON export/import behavior remains unchanged.
- Build and export verification pass.

Manual verification:
- Create a small project with at least three shots using varied aspect ratios.
- Include a shot with no focus regions.
- Include focus regions using lift, spotlight, zoom, and none where practical.
- Export a video artifact.
- Play the result locally and compare against preview behavior.

---

## T0033 - Export Stabilization Roadmap + Production Decision Criteria

Goal: Define the export stabilization phase after the rough video export prototype and establish criteria for deciding later whether browser MediaRecorder is enough or whether FFmpeg/WASM/backend rendering is needed.

Dependencies:
- T0032

Allowed areas:
- docs/

Do not touch:
- src/
- package files
- app behavior
- export implementation
- preview implementation
- editor implementation

Requirements:
- Summarize the current T0032 export prototype status.
- Clarify that T0032 is a rough prototype, not production export.
- Define what must be stabilized before export can be considered MVP-reliable.
- Define "good enough export" criteria:
  - output file downloads reliably
  - user understands export progress/status
  - output format is clearly reported
  - browser support limitations are clear
  - camera shot timing is reasonably accurate
  - exported video visually resembles preview enough for MVP
  - large-image performance is acceptable or documented
- Define production export decision criteria:
  - output format reliability
  - browser compatibility
  - render timing accuracy
  - preview/export visual parity
  - large-image performance
  - whether browser MediaRecorder is enough
  - whether FFmpeg/WASM/backend should be considered later
- Do not make the final production export architecture decision yet.
- Set T0034 as the next implementation ticket.
- Mention that sound effects, dialogue/narration, OCR, and AI assistance are later-version features, not part of the current export stabilization phase.

Non-goals:
- No source changes.
- No export implementation.
- No dependency installation.
- No audio.
- No dialogue reading.
- No AI implementation.
- No MP4 production architecture decision yet.

Acceptance criteria:
- T0033 clearly defines the export stabilization phase.
- T0033 defines production export decision criteria.
- T0033 keeps sound/dialogue/AI out of the current scope.
- Repo current state points to T0034 after T0033 is complete.

Manual verification:
- Confirm docs only changed.
- Confirm T0034 is the next implementation ticket.

---

## T0034 - Export Progress, Cancel, and Format Messaging

Goal: Add user-facing export progress/status, cancel behavior if feasible, and clearer output format/browser support messaging for the browser-side video export prototype.

Dependencies:
- T0033

Allowed areas:
- src/app/
- src/lib/canvasVideoExport.ts
- src/styles/
- docs/

Do not touch:
- backend
- FFmpeg/WASM
- audio
- dialogue/narration
- AI detection
- project archive format
- multi-page support

Requirements:
- Show export state clearly.
- Prevent duplicate exports.
- Provide user feedback while rendering/recording.
- Add cancel behavior if feasible with the current export architecture.
- Clearly report actual output format/MIME type.
- Explain MP4 vs WebM fallback clearly.
- Show unsupported-browser errors clearly.
- Preserve existing export behavior.
- Preserve preview behavior.
- Preserve JSON import/export behavior.
- Keep build passing.

Non-goals:
- No backend.
- No audio.
- No FFmpeg/WASM.
- No production render queue.
- No advanced export settings.
- No project archive support.

Acceptance criteria:
- User can tell when export is running.
- Duplicate exports are prevented.
- Output format messaging is clear.
- Cancel exists if feasible, or limitation is documented.
- Build passes.

Manual verification:
- Start video export.
- Confirm progress/status appears.
- Confirm duplicate export cannot start.
- Confirm format message appears after export.
- Confirm unsupported browser path is handled or reasoned through.
- Run `npm.cmd run build`.

---

## T0035 - Canvas Export Parity Pass

Goal: Improve the canvas export renderer so exported video more closely matches the DOM/CSS preview.

Dependencies:
- T0034

Allowed areas:
- src/lib/canvasVideoExport.ts
- src/features/preview/ only for reference or shared helpers if necessary
- src/styles/ only if needed
- docs/

Do not touch:
- backend
- FFmpeg/WASM
- audio
- dialogue/narration
- AI detection
- project archive format
- multi-page support

Requirements:
- Compare preview behavior against exported video behavior.
- Improve camera travel parity.
- Improve shot timing parity.
- Improve focus-region effect parity where practical.
- Prioritize lift, spotlight, zoom, and none behavior.
- Preserve fixed 16:9 output.
- Preserve flexible camera shot subject regions.
- Keep scope MVP-level.
- Keep build passing.

Non-goals:
- No full production renderer.
- No advanced keyframes.
- No custom animation editor.
- No audio.
- No backend.
- No FFmpeg/WASM.

Acceptance criteria:
- Exported video more closely resembles preview for core camera movement and focus effects.
- Any remaining parity gaps are documented.
- Build passes.

Manual verification:
- Create a project with varied shots and focus regions.
- Compare preview and exported video.
- Confirm obvious timing/framing mismatches are reduced.
- Run `npm.cmd run build`.

---

## T0036 - Export Settings: Resolution and FPS

Goal: Add simple export settings for resolution and frame rate.

Dependencies:
- T0035

Allowed areas:
- src/app/
- src/lib/canvasVideoExport.ts
- src/styles/
- docs/

Do not touch:
- backend
- FFmpeg/WASM
- audio
- dialogue/narration
- AI detection
- project archive format
- multi-page support

Requirements:
- Add simple fixed resolution options, such as:
  - 720p
  - 1080p
- Add simple FPS options, such as:
  - 24 fps
  - 30 fps
- Keep defaults safe.
- Preserve current fixed 16:9 output stage.
- Pass selected settings into the canvas export renderer.
- Keep UI simple.
- Keep build passing.

Non-goals:
- No advanced bitrate controls.
- No codec selection UI beyond current format reporting.
- No audio settings.
- No production render queue.
- No backend/FFmpeg.

Acceptance criteria:
- User can choose basic export resolution.
- User can choose basic FPS.
- Export uses selected settings.
- Existing default behavior remains safe.
- Build passes.

Manual verification:
- Export at 720p.
- Export at 1080p if performance allows.
- Test available FPS options.
- Confirm exported file dimensions/timing where practical.
- Run `npm.cmd run build`.

---

## T0036A - Focus Background Treatment Polish

Goal: During cinematic focus-region moments, make the surrounding camera shot/background less distracting so the active focus region is easier to read in preview and exported video.

Dependencies:
- T0036

Allowed areas:
- src/features/preview/
- src/lib/canvasVideoExport.ts
- src/styles/
- docs/

Do not touch:
- backend
- FFmpeg/WASM
- audio
- dialogue/narration
- AI detection
- project archive format
- multi-page support
- bitrate controls
- codec selection UI
- production render queue

Requirements:
- During active focus-region effects, reduce visual attention from the surrounding shot/background.
- Improve visual hierarchy for lift, spotlight, and zoom effects.
- Keep preview and exported video reasonably consistent.
- Prefer simple dimming first.
- Add blur only if it is safe, performant, and easy to keep consistent between preview and canvas export.
- Avoid making the whole scene too dark to understand.
- Keep performance acceptable, especially for 1080p export.
- Keep `effectType: none` behavior safe and non-distracting.
- Preserve T0034 export progress/cancel/format messaging.
- Preserve T0035 canvas export parity work.
- Preserve T0036 export settings.
- Preserve JSON import/export behavior.
- Keep build passing.

Non-goals:
- No backend.
- No audio.
- No FFmpeg/WASM.
- No AI.
- No archive export/import.
- No bitrate controls.
- No codec selection UI.
- No production render queue.
- No new focus effect types.

Acceptance criteria:
- Active lift, spotlight, and zoom focus moments have clearer subject/background hierarchy.
- Preview and canvas export use reasonably consistent background treatment.
- `effectType: none` remains skipped by focus effect playback/export.
- Export settings and export progress/cancel/format messaging remain intact.
- Build passes.

Manual verification:
- Create a project with lift, spotlight, zoom, and none focus regions.
- Preview playback and confirm active focus regions are easier to read.
- Export at 720p and 1080p if performance allows.
- Compare preview and exported video background treatment.
- Confirm `none` focus regions do not add distracting focus treatment.
- Run `npm.cmd run build`.

---

## T0036B - Focus Treatment Style Presets

Goal: Add a small, simple focus-treatment style control so the project can compare different visual approaches for focus-region moments in preview and exported video before locking the default cinematic style.

Dependencies:
- T0036A

Allowed areas:
- src/app/
- src/features/preview/
- src/lib/canvasVideoExport.ts
- src/styles/
- docs/

Do not touch:
- backend
- FFmpeg/WASM
- audio
- dialogue/narration
- AI detection
- project archive format
- multi-page support
- bitrate controls
- codec selection UI
- production render queue

Requirements:
- Add a simple UI control for choosing the focus treatment style.
- Include only a few simple presets:
  - Clean: minimal background treatment, closest to clear comic reading.
  - Cinematic Dim: current stronger dimmed focus treatment.
  - Soft Focus: gentler dimming and smoother focus transition timing so the effect feels less harsh.
- Apply the selected style to preview focus-region rendering.
- Apply the selected style to canvas video export.
- Keep focus-region effect types lift, spotlight, zoom, and none working.
- Keep background treatment stable during a shot's focus phase; avoid flashing between focus regions.
- Keep the scene hold readable.
- Keep performance acceptable for 720p and 1080p export.
- Do not add advanced effect editing.
- Do not add per-region style controls.
- Do not add blur unless it is trivial and safe.
- Preserve T0034 export progress/cancel/format messaging.
- Preserve T0035 canvas export parity work.
- Preserve T0036 export settings.
- Preserve JSON import/export behavior unless a simple project-level style field is clearly needed.
- Document that this is an experimental visual-style comparison, not final advanced effect editing.
- Keep build passing.

Non-goals:
- No backend.
- No audio.
- No FFmpeg/WASM.
- No AI.
- No archive export/import.
- No bitrate controls.
- No codec selection UI.
- No production render queue.
- No per-region style controls.
- No advanced effect editor.

Acceptance criteria:
- User can choose Clean, Cinematic Dim, or Soft Focus.
- The selected style affects preview focus-region rendering.
- The selected style affects canvas video export.
- Lift, spotlight, zoom, and none remain safe.
- Existing export settings and progress/cancel/format messaging remain intact.
- Build passes.

Manual verification:
- Create a project with lift, spotlight, zoom, and none focus regions.
- Switch between Clean, Cinematic Dim, and Soft Focus in preview.
- Export with each style at 720p and at 1080p if performance allows.
- Confirm background treatment is stable during focus-region sequencing.
- Confirm JSON import/export still behaves as before.
- Run `npm.cmd run build`.

---

## T0037 - Project Archive Export Plan

Goal: Plan a bundled project format that includes Project JSON plus the source image.

Dependencies:
- T0036

Allowed areas:
- docs/
- README.md if useful
- AGENTS.md if useful

Do not touch:
- src/
- package files
- app behavior
- import/export code
- editor behavior
- preview behavior
- video export behavior
- build output

Requirements:
- Explain the current limitation: Project JSON does not include image binary.
- Explain why users currently need to reselect the source image after import.
- Explore a ZIP/archive approach.
- Define archive contents:
  - project JSON
  - source image file
  - optional manifest
- Define import behavior for a bundled archive.
- Define relationship to Project JSON schema v1.
- Define file naming approach.
- Define non-goals.
- Keep single-page scope.
- Do not implement archive support yet.

Non-goals:
- No source changes.
- No archive implementation.
- No cloud storage.
- No multi-page support.
- No production export change.

Acceptance criteria:
- Archive format plan exists.
- Archive contents and import behavior are clear.
- Import/export behavior is described.
- Follow-up implementation ticket is ready.

Manual verification:
- Review the plan for consistency with current Project JSON export/import behavior.
- Confirm no source files changed.

---

## T0038 - Project Archive Export / Import Prototype

Goal: Prototype exporting and importing a bundled project archive that includes Project JSON and the source image.

Dependencies:
- T0037

Allowed areas:
- src/app/
- src/lib/
- src/features/upload/ if needed
- src/styles/
- docs/

Do not touch:
- cloud storage
- authentication
- payments
- AI detection
- multi-page support unless separately ticketed
- production MP4 export architecture

Requirements:
- Let users export a bundled project archive.
- Include Project JSON and the source image.
- Let users import that archive and restore both project structure and image.
- Preserve existing JSON export/import behavior if possible.
- Keep single-page scope.
- Keep build passing.

Non-goals:
- No cloud storage.
- No multi-page project archive.
- No collaboration.
- No production video export changes.
- No AI.

Acceptance criteria:
- User can export a project archive.
- User can import the archive without manually reselecting the source image.
- Existing JSON export/import remains usable.
- Build passes.

Manual verification:
- Create a project.
- Export archive.
- Refresh app.
- Import archive.
- Confirm image, shots, focus regions, timing, and effects restore.
- Run `npm.cmd run build`.

---

## T0039 - Production Export Decision Point

Goal: Decide whether browser MediaRecorder remains enough or whether the app needs FFmpeg/WASM or backend rendering.

Dependencies:
- T0034
- T0035
- T0036

Allowed areas:
- docs/
- README.md if useful
- AGENTS.md if useful

Do not touch:
- src/
- package files
- app behavior
- export implementation
- build output

Requirements:
- Review results from T0034 through T0036.
- Compare browser prototype quality, output format reliability, timing accuracy, visual parity, and compatibility.
- Decide next export architecture direction:
  - keep improving browser MediaRecorder path
  - investigate FFmpeg/WASM
  - investigate backend rendering
  - use hybrid approach
- Document reasoning clearly.
- Define the next implementation roadmap after the decision.

Non-goals:
- No implementation.
- No dependencies.
- No backend code.
- No FFmpeg/WASM installation.
- No audio.
- No AI.

Acceptance criteria:
- Production export decision is documented.
- Next export architecture direction is clear.
- Follow-up tickets are identified.
- No source files are changed.

Manual verification:
- Review decision against real results from T0034-T0036.
- Confirm the decision does not depend on untested assumptions.

---

## T0040 - Product Direction Reset: Cinematic Guided View Model

Ticket ID: T0040

Title: Product Direction Reset: Cinematic Guided View Model

Goal: Document the product direction reset from a comic-to-video exporter with focus effects toward a manual-first, AI-ready, page-preserving cinematic guided-view editor.

Dependencies:
- T0039

Allowed areas:
- docs/
- README.md if useful
- AGENTS.md if useful

Do not touch:
- src/
- package files
- app behavior
- editor implementation
- preview implementation
- export implementation
- build output

Requirements:
- Create or update a product direction document for the cinematic guided-view model.
- State that the product is a semi-automatic cinematic guided-view editor, not full character animation.
- State that the source comic page remains intact and acts as the world.
- State that camera shots define the main 16:9 video framing destinations.
- State that focus regions are attention targets, not replacement camera frames.
- State that every camera move should eventually have a reading or storytelling purpose.
- Explain that Guided View-style reader orientation teaches full-page context, guided close-ups, readable pacing, and user control.
- Explain that DynamicManga-style direction teaches camera-based storytelling over still pages and semantic pacing.
- Document that effects are secondary to reading and storytelling purpose.
- Document that new focus effects should not be added until shot purpose, focus purpose, and transition purpose are defined.
- Document that manual editing remains required and valuable.
- Document that future automation should suggest panels, text-heavy areas, likely focus regions, timing, and camera paths, then let the user accept, edit, or delete suggestions.
- Include a section titled "Feature Direction: Keep, Freeze, Deprecate, Later".
- In that section, list:
  - Keep: camera shots, focus regions, fixed 16:9 preview/export stage, manual editing, JSON/archive project persistence direction.
  - Freeze: focus style presets, additional focus effect polish, export/effect parity polish beyond MVP stabilization.
  - Deprecate as default: lift/pop-out as the default focus behavior, simple focus-region kind buttons as a major roadmap item.
  - Later: shot/focus purpose, transition purpose, page enter/page exit guided view behavior, manual tap-through reader mode, panel detection suggestions, OCR/text-weight timing, smart camera path draft generation, AI assistance.
- Update `docs/Repo_Current_State.md` to identify T0040 as the recommended creative-direction reset immediately after T0039.

Non-goals:
- No source changes.
- No package changes.
- No automatic panel detection.
- No OCR.
- No AI implementation.
- No audio.
- No multi-page support.
- No production rendering.
- No new focus effects.
- No UI implementation.
- No removal of existing tickets.
- No removal of implemented code.

Acceptance criteria:
- `docs/Tickets.md` includes T0040 after T0039.
- A cinematic guided-view model document exists and records the new product identity.
- The document clearly separates camera shots from focus regions.
- The document freezes or deprecates effect-first directions as defaults without deleting existing implemented features.
- `docs/Repo_Current_State.md` points to T0040 as the recommended creative-direction reset immediately after T0039.
- No `src/` files are changed.
- No package files are changed.

Manual verification:
- Review `docs/Tickets.md` and confirm T0040 appears after T0039.
- Review the cinematic guided-view model document for consistency with the page-preserving, manual-first direction.
- Review `docs/Repo_Current_State.md` and confirm the next recommended direction is T0040 after T0039.
- Confirm no `src/` files or package files changed.

---

## T0041 - Shot and Focus Purpose Model

Ticket ID: T0041

Title: Shot and Focus Purpose Model

Goal: Add or plan project data fields for `shotPurpose` and `focusPurpose` so the app can distinguish why a camera shot or focus region exists.

Dependencies:
- T0040

Allowed areas:
- docs/
- src/lib/projectTypes.ts only if implementing the safe model fields
- src/lib/projectExport.ts only if implementing persistence for the safe model fields
- src/lib/projectImport.ts only if implementing persistence for the safe model fields

Do not touch:
- package files
- preview effects
- export rendering behavior
- editor drawing behavior
- timeline reordering behavior
- automatic panel detection
- OCR
- AI implementation

Requirements:
- Prefer docs/type-planning only if implementation risk is unclear.
- If implementation is safe and narrow, add model fields for shot purpose and focus purpose without changing current behavior.
- Define the allowed purpose values:
  - establishing
  - panel
  - dialogue
  - reaction
  - emotion
  - action
  - detail
  - reveal
  - transition
  - other
- Document how purpose differs from existing focus region `kind` and `effectType`.
- Document that purpose describes reading/storytelling intent, not visual treatment.
- Document that manual editing must remain available.
- Document that focus regions must not replace camera shots.
- Preserve the page-preserving guided-view model.

Non-goals:
- No inspector UI unless explicitly scoped later.
- No automatic timing changes.
- No new focus effects.
- No automatic panel detection.
- No OCR.
- No AI implementation.
- No audio.
- No multi-page support.
- No production rendering changes.

Acceptance criteria:
- The purpose model is documented or safely typed.
- Shot purpose and focus purpose values are clearly defined.
- Purpose is separated from focus region kind and focus effect type.
- Existing camera shot and focus region semantics remain intact.
- Manual editing remains available.
- Focus regions do not replace camera shots.
- Build passes if source files are changed.

Manual verification:
- Review the purpose model documentation or type definitions.
- Confirm all required purpose values are present.
- Confirm no focus effect behavior changed.
- Confirm no automatic detection, OCR, or AI behavior was added.
- Run `npm.cmd run build` only if source files changed.

---

## T0042 - Purpose Inspector Controls

Ticket ID: T0042

Title: Purpose Inspector Controls

Goal: Let users assign purpose values to camera shots and focus regions in the inspector.

Dependencies:
- T0041

Allowed areas:
- src/features/editor/
- src/app/
- src/lib/projectTypes.ts if needed for narrow type support
- docs/

Do not touch:
- package files
- preview effects
- export rendering behavior
- automatic panel detection
- OCR
- AI implementation
- multi-page support
- production rendering

Requirements:
- Add inspector controls for camera shot purpose.
- Add inspector controls for focus region purpose.
- Use the T0041 purpose values.
- Keep the controls simple and manual.
- Preserve existing label, duration, focus timing, kind, effect type, and sequence controls.
- Ensure manual editing remains available.
- Ensure focus regions remain attention targets and do not replace camera shots.
- Document any persistence behavior if purpose fields are saved in Project JSON.

Non-goals:
- No automatic purpose assignment.
- No timing changes based on purpose.
- No new focus effects.
- No automatic panel detection.
- No OCR.
- No AI implementation.
- No audio.
- No multi-page support.

Acceptance criteria:
- Users can assign a purpose to selected camera shots.
- Users can assign a purpose to selected focus regions.
- Purpose controls do not change camera framing or focus effect behavior by themselves.
- Existing inspector behavior remains intact.
- Manual editing remains available.
- Focus regions do not replace camera shots.
- Build passes.

Manual verification:
- Select a camera shot and assign each purpose value.
- Select a focus region and assign each purpose value.
- Confirm existing inspector controls still work.
- Confirm preview behavior is unchanged except for stored purpose metadata.
- Run `npm.cmd run build`.

---

## T0043 - Purpose-Based Timing Defaults

Ticket ID: T0043

Title: Purpose-Based Timing Defaults

Goal: Use purpose values to suggest or apply better default timing for camera shots and focus attention.

Dependencies:
- T0042

Allowed areas:
- src/features/editor/
- src/app/
- src/lib/projectTypes.ts if needed
- docs/

Do not touch:
- package files
- export rendering architecture
- automatic panel detection
- OCR
- AI implementation
- multi-page support
- production rendering

Requirements:
- Add purpose-based timing suggestions or safe default application.
- Keep user control over timing values.
- Suggested timing guidance should include:
  - dialogue: longer hold
  - reaction: short hold/subtle push
  - emotion: slower hold/zoom
  - action: faster movement
  - establishing: wider/longer view
  - detail/reveal: delayed emphasis or hold-then-push
- Avoid adding new visual effects.
- Avoid overriding user-edited timing unexpectedly.
- Preserve manual editing.
- Ensure focus regions remain attention targets and do not replace camera shots.

Non-goals:
- No automatic panel detection.
- No OCR.
- No AI implementation.
- No advanced keyframe editor.
- No new focus effects.
- No audio.
- No multi-page support.
- No production rendering changes.

Acceptance criteria:
- Purpose values can influence suggested or default timing in a predictable way.
- Users can still manually edit shot duration and focus timing.
- Existing preview and export behavior remain stable.
- Timing defaults do not require focus regions to replace camera shots.
- Build passes.

Manual verification:
- Create shots with dialogue, reaction, emotion, action, establishing, detail, and reveal purposes.
- Confirm timing suggestions or defaults match the documented purpose behavior.
- Confirm manually changed timing is not unexpectedly overwritten.
- Preview a short sequence and confirm camera shots still drive framing.
- Run `npm.cmd run build`.

---

## T0044 - Transition Purpose Model

Ticket ID: T0044

Title: Transition Purpose Model

Goal: Classify transitions by reading or storytelling purpose.

Dependencies:
- T0041

Allowed areas:
- docs/
- src/lib/projectTypes.ts only if implementing safe transition purpose fields
- src/lib/projectExport.ts only if implementing persistence for transition purpose
- src/lib/projectImport.ts only if implementing persistence for transition purpose

Do not touch:
- package files
- preview transition rendering unless explicitly scoped
- export rendering behavior
- automatic panel detection
- OCR
- AI implementation
- multi-page support
- production rendering

Requirements:
- Define transition purpose values:
  - orientation
  - reading
  - cinematic
  - sceneChange
- Document what each transition purpose means.
- Explain how transition purpose differs from shot purpose and focus purpose.
- Prefer model/documentation only unless the implementation is safe and narrow.
- Preserve manual editing.
- Ensure focus regions remain attention targets and do not replace camera shots.

Non-goals:
- No transition UI unless explicitly scoped later.
- No automatic transition generation.
- No new focus effects.
- No automatic panel detection.
- No OCR.
- No AI implementation.
- No audio.
- No production rendering changes.

Acceptance criteria:
- Transition purpose values are defined.
- The relationship between shot purpose, focus purpose, and transition purpose is clear.
- No existing transition behavior changes unless explicitly implemented and documented.
- Manual editing remains available.
- Focus regions do not replace camera shots.
- Build passes if source files are changed.

Manual verification:
- Review transition purpose documentation or type definitions.
- Confirm all four transition purpose values are present.
- Confirm no automatic detection, OCR, or AI behavior was added.
- Run `npm.cmd run build` only if source files changed.

---

## T0045 - Guided Page Enter / Page Exit Options

Ticket ID: T0045

Title: Guided Page Enter / Page Exit Options

Goal: Add Guided View-style options for orienting the reader at the beginning and end of a page sequence.

Dependencies:
- T0044

Allowed areas:
- src/app/
- src/features/preview/
- src/lib/projectTypes.ts if needed
- src/lib/canvasVideoExport.ts if export parity is explicitly scoped
- docs/

Do not touch:
- package files
- automatic panel detection
- OCR
- AI implementation
- audio
- multi-page support
- production rendering architecture

Requirements:
- Add a safe option to show the full page on page enter.
- Add a safe option to show the full page on page exit.
- Add a transition speed setting only if scoped safely.
- Add background mask/dim strength only if scoped safely.
- Keep the page intact.
- Keep camera shots as the main framing destinations.
- Keep focus regions as attention targets.
- Preserve manual editing.
- Ensure focus regions do not replace camera shots.

Non-goals:
- No multi-page page-turn system.
- No new focus effects.
- No automatic panel detection.
- No OCR.
- No AI implementation.
- No audio.
- No production rendering architecture changes.

Acceptance criteria:
- Users can enable or disable full-page entry behavior.
- Users can enable or disable full-page exit behavior.
- Any transition speed or mask/dim setting is scoped, documented, and safe.
- Existing camera shot playback still works.
- Manual editing remains available.
- Focus regions do not replace camera shots.
- Build passes.

Manual verification:
- Enable page enter and preview a sequence.
- Enable page exit and preview a sequence.
- Confirm camera shots remain the main timeline framing destinations.
- Confirm focus regions remain attention targets only.
- Run `npm.cmd run build`.

---

## T0046 - Manual Tap-Through Preview Mode

Ticket ID: T0046

Title: Manual Tap-Through Preview Mode

Goal: Prototype a reader-style mode where the user advances shot by shot instead of only playing a fully automatic video.

Dependencies:
- T0045

Allowed areas:
- src/features/preview/
- src/app/
- src/styles/
- docs/

Do not touch:
- package files
- export rendering architecture
- automatic panel detection
- OCR
- AI implementation
- audio
- multi-page support
- production rendering

Requirements:
- Add a manual tap-through or step-through preview mode.
- Let the user advance to the next camera shot manually.
- Let the user return to the previous camera shot if scoped safely.
- Keep automatic playback available.
- Preserve existing camera shot and focus region behavior.
- Preserve manual editing.
- Ensure focus regions remain attention targets and do not replace camera shots.

Non-goals:
- No full reader app shell.
- No multi-page reading.
- No export changes unless explicitly scoped.
- No automatic panel detection.
- No OCR.
- No AI implementation.
- No audio.
- No new focus effects.

Acceptance criteria:
- User can switch to a manual tap-through preview mode.
- User can advance through camera shots in timeline order.
- Automatic preview playback remains available.
- Camera shots remain the main framing destinations.
- Focus regions remain attention targets.
- Build passes.

Manual verification:
- Create several camera shots with focus regions.
- Switch to tap-through mode.
- Advance shot by shot and confirm timeline order is followed.
- Confirm automatic playback still works.
- Run `npm.cmd run build`.

---

## T0047 - Camera Shot / Focus Region Semantic Rework Plan

Ticket ID: T0047

Title: Camera Shot / Focus Region Semantic Rework Plan

Goal: Document the revised Camera Shot / Focus Region model before automation work.

Dependencies:
- T0046

Allowed areas:
- docs/model/Cinematic_Guided_View_Model.md
- docs/model/Camera_Frame_vs_Focus_Region.md
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md
- docs/Known_Issues_And_Followups.md if useful
- AGENTS.md if a short guardrail is useful

Do not touch:
- src/
- package files
- app behavior
- preview behavior
- export behavior
- project import/export code
- automatic panel detection
- OCR
- AI implementation
- audio
- multi-page support

Requirements:
- Reframe Camera Shot as a flexible panel/scene reading container, not a fixed output-ratio frame and not merely a crop box.
- Reframe Focus Region as a reusable page-level attention target that can later act as an intra-shot motion/attention key.
- Preserve the current rule that the preview/export stage is fixed 16:9 unless a future output-aspect ticket changes it.
- Preserve the current rule that focus regions remain page-level by default and are not deleted when a camera shot is deleted.
- Add a planned Shot Attention Path concept.
- Define Shot Attention Path as an ordered per-camera-shot list of references to page-level focus regions.
- Explain that Shot Attention Path realizes intra-shot motion without making focus regions replacement camera frames.
- Explain that future manual mode should eventually support stepping through camera shots and, optionally, attention keys inside a shot.
- Explain that auto preview/export should eventually prefer explicit shot attention paths before falling back to the current intersection-based eligible focus-region behavior.
- Update the roadmap so T0050 panel detection is delayed until after the CS/FR semantic rework and at least a narrow attention-path model ticket.
- Keep automation suggestion-based.
- Do not add new focus effects.
- Do not remove existing focus effect documentation; mark it as existing/optional rather than flagship behavior.

Non-goals:
- No source code changes.
- No project schema changes yet.
- No UI changes.
- No preview/export behavior changes.
- No automatic panel detection.
- No OCR.
- No AI.
- No audio.
- No production rendering changes.

Acceptance criteria:
- Docs clearly distinguish Preview Frame, Camera Shot, Focus Region, and Shot Attention Path.
- Camera Shots are described as timeline reading containers.
- Focus Regions are described as page-level attention targets / future motion keys.
- Shot Attention Path is documented as references to existing focus regions, not ownership transfer.
- T0050 is no longer recommended as the immediate next step.
- Repo current state recommends T0048 after T0047.
- No src/ files or package files are changed.

Manual verification:
- Confirm no src/ files changed.
- Confirm docs preserve fixed 16:9 preview/export stage.
- Confirm docs preserve flexible camera shot geometry.
- Confirm docs preserve page-level focus-region storage.
- Confirm docs explain intra-shot motion as a shot-level attention path.
- Confirm T0050 remains suggestion-based and later.

---

## T0048 - Shot Attention Path Data Model

Ticket ID: T0048

Title: Shot Attention Path Data Model

Goal: Add a narrow data model for camera shots to reference ordered page-level focus regions as attention keys.

Status: Implemented as model+persistence only. No UI, preview, export-rendering, automation, OCR, AI, audio, or production rendering behavior changed.

Dependencies:
- T0047

Allowed areas:
- src/lib/projectTypes.ts
- src/lib/projectExport.ts
- src/lib/projectImport.ts
- docs/

Do not touch:
- package files
- editor UI controls unless separately scoped
- preview behavior unless separately scoped
- export rendering behavior unless separately scoped
- automatic panel detection
- OCR
- AI implementation
- audio
- multi-page support

Requirements:
- Add a camera-shot field for ordered references to page-level focus regions.
- Store focus-region references by ID, not copied geometry.
- Preserve focus regions as page-level data.
- Deleting a camera shot must not delete focus regions.
- Treat missing attention-path data as compatible with older projects.
- Keep current preview/export behavior unchanged unless a later ticket explicitly opts in.
- Document Project JSON persistence behavior.

Non-goals:
- No UI controls.
- No automatic path generation.
- No preview/export behavior changes unless separately scoped.
- No new focus effects.
- No automatic panel detection.
- No OCR.
- No AI.
- No audio.

Acceptance criteria:
- Camera shots can persist optional ordered references to page-level focus regions.
- Focus-region ownership remains page-level.
- Older project JSON without attention paths remains valid.
- Build passes.

Manual verification:
- Export/import a project with attention-path data once controls or fixtures exist.
- Confirm missing attention-path fields import safely.
- Confirm focus regions remain independent from camera shot deletion.
- Run `npm.cmd run build`.

---

## T0049 - Manual Shot Attention Path Controls

Ticket ID: T0049

Title: Manual Shot Attention Path Controls

Goal: Add simple manual controls for editing a selected camera shot's ordered attention path.

Status: Implemented. Users can add existing page-level focus regions to a selected shot attention path, reorder path references, and remove references without deleting focus regions. Preview/export behavior remains unchanged.

Dependencies:
- T0048

Allowed areas:
- src/features/editor/
- src/app/
- src/styles/
- docs/

Do not touch:
- package files
- automatic panel detection
- OCR
- AI implementation
- audio
- multi-page support
- production rendering

Requirements:
- Let users add existing page-level focus regions to a selected camera shot's attention path.
- Let users remove references from the selected shot's attention path without deleting the focus region.
- Let users reorder attention-path references.
- Keep focus regions page-level.
- Keep camera shots as timeline reading containers.
- Preserve existing automatic preview/export behavior unless a later ticket explicitly opts into using attention paths.
- Keep UI simple and manual.

Non-goals:
- No automatic path generation.
- No new focus effects.
- No OCR.
- No AI.
- No audio.
- No production rendering changes.

Acceptance criteria:
- Users can manually define an ordered attention path for a selected camera shot.
- Removing a path item does not delete the referenced focus region.
- Existing camera shot and focus region editing remains available.
- Build passes.

Manual verification:
- Create multiple focus regions.
- Add focus regions to a shot attention path.
- Reorder and remove references.
- Confirm focus regions remain on the page.
- Run `npm.cmd run build`.

---

## T0049B - Preview Uses Shot Attention Path

Ticket ID: T0049B

Title: Preview Uses Shot Attention Path

Goal: Make browser preview focus attention prefer a camera shot's explicit attentionPath before falling back to intersection-based focus-region sequencing.

Status: Implemented. Browser preview resolves the active shot attentionPath against page-level focus regions, skips missing references and `effectType: none`, follows explicit path order when at least one usable reference exists, and falls back to previous eligible focus-region behavior otherwise. Canvas video export and manual tap-through behavior remain unchanged.

Dependencies:
- T0049

Allowed areas:
- src/features/preview/
- src/lib/coordinateMath.ts only if a small helper is needed
- src/lib/projectTypes.ts only if type refinements are needed
- src/styles/global.css only if minor debug/label styling is needed
- docs/

Do not touch:
- src/lib/canvasVideoExport.ts
- package files
- Project JSON schema
- import/export persistence
- editor attention-path UI unless a tiny type/prop fix is required
- automatic panel detection
- OCR
- AI implementation
- audio
- multi-page support
- production rendering architecture

Requirements:
- During browser preview, when the active camera shot has a non-empty valid attentionPath, use that path to build the shot's focus attention sequence.
- Resolve each attentionPath item by focusRegionId against the page-level focusRegions list.
- Ignore missing or malformed references safely.
- Preserve the explicit attentionPath order.
- If attentionPath exists but all references are missing/invalid/skipped, fall back safely to the old eligible focus-region behavior.
- If attentionPath is absent or empty, keep the old intersection-based behavior.
- For attentionPath-driven preview, still skip focus regions with effectType none.
- Do not make Focus Regions replace Camera Shots.
- Do not change camera shot framing, contain logic, clipped shot window, travel phase, scene hold phase, exit phase, or manual tap-through behavior.
- Do not implement motionRole behavior yet.
- Do not update canvas video export in this ticket.

Non-goals:
- No canvas export parity for attentionPath.
- No manual mode attention-key stepping.
- No motionRole behavior.
- No new focus effects.
- No panel detection.
- No OCR.
- No AI.
- No audio.
- No schema changes.

Acceptance criteria:
- Browser preview uses explicit attentionPath order when available.
- Browser preview still works for shots without attentionPath.
- Missing attentionPath references do not crash preview.
- Existing focus effects still work.
- Existing Final/Debug modes still work.
- Existing Auto/Manual playback mode controls still work.
- Manual tap-through remains shot-by-shot only.
- Canvas export behavior is unchanged.
- Build passes.

Manual verification:
- Create three focus regions inside a camera shot.
- Assign the shot attentionPath in a non-default order, such as FR 3 then FR 1.
- Preview in Auto mode and confirm focus attention follows FR 3 then FR 1.
- Confirm FR 2 is not used for that shot while the valid attentionPath exists.
- Clear/remove the shot attentionPath and confirm fallback behavior still uses the old eligible focus-region sequence.
- Delete a referenced focus region and confirm preview does not crash and falls back or safely ignores the missing reference.
- Confirm Manual mode still steps camera shots only.
- Confirm video export behavior is unchanged for now.
- Run `npm.cmd run build`.

---

## T0050 - Panel Detection Suggestions Spike

Ticket ID: T0050

Title: Panel Detection Suggestions Spike

Goal: Investigate simple panel detection suggestions without replacing manual editing.

Status: Implemented as documentation only in `docs/automation/Panel_Detection_Suggestions_Spike.md`. No production panel detection, OCR, AI, preview, export, schema, package, or editor behavior changed.

Dependencies:
- T0041
- T0049B

Allowed areas:
- docs/
- experimental source files only if explicitly scoped and isolated

Do not touch:
- package files unless a later approved implementation ticket allows dependencies
- production editor behavior
- production preview behavior
- production export behavior
- OCR
- AI implementation
- multi-page support

Requirements:
- Treat this as a spike unless a future ticket explicitly scopes implementation.
- Investigate simple panel detection suggestions.
- Document candidate approaches, limitations, and failure cases.
- Document how suggestions would be presented for user accept/edit/delete.
- Keep manual editing required and available.
- Ensure suggested panels or focus regions do not replace camera shots.
- Ensure suggested panels or focus regions can be mapped into editable camera shots, page-level focus regions, or shot attention paths only after the manual attention-path model exists.
- Do not make panel detection mandatory.

Non-goals:
- No production panel detection implementation.
- No OCR.
- No AI implementation unless separately ticketed.
- No dependency installation unless separately approved.
- No replacement of manual camera shot editing.
- No replacement of focus region drawing/editing.
- No export changes.

Acceptance criteria:
- Spike notes describe at least one feasible suggestion approach.
- Failure cases are documented.
- Manual correction workflow is documented.
- Focus regions are not treated as replacement camera shots.
- No production behavior changes are required.

Manual verification:
- Review spike documentation.
- Confirm the proposed approach is suggestion-based.
- Confirm manual editing remains available.
- Confirm no production panel detection, OCR, or AI behavior was added unless a later ticket explicitly allowed it.

---

## T0051 - Text Weight / OCR Timing Spike

Ticket ID: T0051

Title: Text Weight / OCR Timing Spike

Goal: Investigate text-heavy region detection or OCR-assisted timing, with no requirement to fully extract speech balloons.

Status: Implemented as documentation only in `docs/automation/Text_Weight_OCR_Timing_Spike.md`. No production OCR, AI, preview, export, schema, package, or editor behavior changed.

Dependencies:
- T0043
- T0050

Allowed areas:
- docs/
- experimental source files only if explicitly scoped and isolated

Do not touch:
- package files unless a later approved implementation ticket allows dependencies
- production editor behavior
- production preview behavior
- production export behavior
- automatic panel detection implementation
- AI implementation
- multi-page support

Requirements:
- Treat this as a spike unless a future ticket explicitly scopes implementation.
- Investigate text-heavy region detection or OCR-assisted timing.
- Document whether timing can be suggested without full speech balloon extraction.
- Document privacy, accuracy, performance, and dependency risks.
- Document how suggestions would be presented for user accept/edit/delete.
- Keep manual timing editing required and available.
- Ensure focus regions remain attention targets and do not replace camera shots.
- Explicitly state that OCR is exploratory and suggestion-oriented unless later ticketed otherwise.

Non-goals:
- No production OCR implementation.
- No full speech balloon extraction.
- No dialogue transcription workflow.
- No AI implementation unless separately ticketed.
- No dependency installation unless separately approved.
- No automatic timing override.
- No export changes.

Acceptance criteria:
- Spike notes describe candidate text-weight or OCR-assisted timing approaches.
- The limits of text detection and OCR are documented.
- Manual timing correction remains the expected workflow.
- Focus regions do not replace camera shots.
- No production OCR or AI behavior is required.

Manual verification:
- Review spike documentation.
- Confirm OCR is framed as exploratory and suggestion-based.
- Confirm manual editing remains available.
- Confirm no production OCR or AI behavior was added unless a later ticket explicitly allowed it.

---

## T0052 - Smart Camera Path Draft Generator

Ticket ID: T0052

Title: Smart Camera Path Draft Generator

Goal: Generate an initial editable camera path from suggested panels, focus regions, and purpose defaults.

Status: Implemented as documentation only in `docs/automation/Smart_Camera_Path_Draft_Generator_Spike.md`. No production smart path generation, AI, OCR, panel detection, preview, export, schema, package, or editor behavior changed.

Dependencies:
- T0043
- T0044
- T0050
- T0051

Allowed areas:
- docs/
- src/app/ only if a later implementation scope is approved
- src/features/editor/ only if a later implementation scope is approved
- src/features/timeline/ only if a later implementation scope is approved
- src/lib/ only if a later implementation scope is approved

Do not touch:
- package files unless a later approved implementation ticket allows dependencies
- production export architecture
- audio
- multi-page support
- mandatory AI workflows

Requirements:
- Treat automation as editable draft generation, not mandatory extraction.
- Generate or plan an initial camera path from suggested panels, focus regions, and purpose defaults.
- Let users accept, edit, delete, reorder, and override generated shots and focus regions.
- Keep manual editing available before and after generation.
- Keep the page intact.
- Keep camera shots as the main framing destinations.
- Keep focus regions as attention targets.
- Ensure focus regions do not replace camera shots.
- Explicitly state that AI detection, OCR, and panel detection inputs are suggestions unless later tickets say otherwise.

Non-goals:
- No fully automatic final video generation.
- No mandatory AI.
- No mandatory OCR.
- No mandatory panel detection.
- No replacement of manual editing.
- No new focus effects.
- No audio.
- No multi-page support.
- No production rendering changes.

Acceptance criteria:
- A draft-generation plan or implementation keeps all generated data editable.
- Manual editing remains available.
- Generated or suggested focus regions do not replace camera shots.
- Camera shots remain the main timeline framing destinations.
- AI detection, OCR, and panel detection remain suggestion-based unless explicitly ticketed otherwise.
- Build passes if source files are changed.

Manual verification:
- Review the draft generation plan or prototype.
- Confirm generated camera shots and focus regions can be edited or removed.
- Confirm manual shot and focus region tools remain available.
- Confirm camera shots still drive framing.
- Run `npm.cmd run build` only if source files changed.

---

## T0053 - Post-Spike Automation Roadmap / Suggestion System Planning

Ticket ID: T0053

Title: Post-Spike Automation Roadmap / Suggestion System Planning

Goal: Define the safe post-spike automation roadmap before implementing T0052A or any smart generator prototype.

Status: Implemented as documentation only in `docs/automation/Post_Spike_Automation_Suggestion_System_Plan.md`. No source, package, schema, preview, export, OCR, AI, panel detection, dependency, audio, multi-page, or editor behavior changed.

Dependencies:
- T0050
- T0051
- T0052

Allowed areas:
- docs/

Do not touch:
- src/
- package files
- production editor behavior
- production preview behavior
- production export behavior
- Project JSON schema
- import/export persistence
- automatic panel detection implementation
- OCR implementation
- AI implementation
- dependency installation
- audio
- multi-page support

Core decision:
- Prefer defining a generic suggestion workflow/foundation before implementing smart camera path generation.
- The app should not create permanent Camera Shots, Focus Regions, or Shot Attention Paths until the user explicitly accepts suggestions.
- T0052A should not be the immediate implementation step unless this planning ticket concludes that suggestion-state and review workflows are already sufficiently defined.

Requirements:
- Keep automation suggestion-based.
- Keep manual editing available before and after suggestions.
- Keep Camera Shots as main timeline framing containers.
- Keep Focus Regions as page-level attention targets.
- Keep Shot Attention Path as per-shot references to page-level Focus Regions.
- Do not require AI, OCR, or panel detection.
- Do not change preview/export behavior unless a later ticket explicitly scopes it.
- Do not change Project JSON schema unless a later schema ticket explicitly scopes accepted or persisted suggestion data.
- Do not add dependencies.
- Decide the next safe phase after T0050/T0051/T0052.
- Compare T0052A against a generic suggestion system foundation and document the recommended order.
- Define what suggestion data can stay temporary UI state versus what would need a future schema ticket.
- Define how suggestions should be accepted, edited, deleted, reordered, regenerated, or ignored before becoming project data.
- Define how manual user-authored Camera Shots, Focus Regions, Shot Attention Paths, timing, and purpose metadata take precedence over generated suggestions.
- Define how later panel-detection, OCR/text-weight, and smart-camera-path features can share one suggestion review workflow.
- Identify whether export stabilization, project archive work, preview/export parity for accepted Shot Attention Paths, or manual attention-key stepping should happen before automation prototypes.

Recommended follow-up split to evaluate:
- T0054 - Temporary Suggestion State Model Plan.
- T0055 - Suggestion Review UI Plan.
- T0056 - Manual Suggestion Accept/Edit/Delete Workflow Prototype.
- T0057 - Smart Camera Path Draft Prototype Using Existing Manual Data Only.
- T0058 - Panel Suggestion Overlay Prototype.
- T0059 - Text Weight Timing Suggestion Prototype.
- T0060 - Accepted Shot Attention Path Preview/Export Parity Plan.
- T0061 - Manual Mode Attention-Key Stepping Plan.
- T0062 - Project Archive / Export Stabilization Reassessment.

Non-goals:
- No production smart path generation.
- No automatic final video generation.
- No mandatory AI, OCR, or panel detection.
- No editor UI implementation.
- No source code changes.
- No package changes.
- No dependency installation.
- No schema changes.
- No preview changes.
- No canvas export changes.
- No import/export persistence changes.
- No audio.
- No multi-page support.

Acceptance criteria:
- The roadmap extends beyond T0052 with a clear next safe phase.
- The recommended next ticket is not an all-in-one smart generator prototype.
- The roadmap explicitly prefers a generic suggestion workflow/foundation before smart path generation unless a documented reason says otherwise.
- Future work is split into smaller tickets with clear boundaries.
- Manual editing remains available before and after suggestions.
- Suggestions do not become permanent Camera Shots, Focus Regions, or Shot Attention Paths without explicit acceptance.
- Camera Shots, Focus Regions, and Shot Attention Path semantics remain unchanged.
- No source, package, schema, preview, export, OCR, AI, panel detection, audio, or multi-page behavior is changed.

Manual verification:
- Review the new roadmap ticket.
- Confirm T0053 is recommended before T0052A or any automation prototype.
- Confirm the roadmap preserves manual-first editing and suggestion/correction workflow.
- Confirm future work is split into smaller tickets.
- Confirm no source or package files changed.
- Build is not required for docs-only roadmap planning.

---

## T0054 - Temporary Suggestion State Model Plan

Ticket ID: T0054

Title: Temporary Suggestion State Model Plan

Goal: Define the TypeScript/data-shape plan for temporary in-memory suggestions before implementing suggestion review UI or smart camera path generation.

Status: Implemented as documentation only in `docs/automation/Temporary_Suggestion_State_Model_Plan.md`. No source, package, schema, preview, export, import/export persistence, OCR, AI, panel detection, dependency, audio, multi-page, or editor behavior changed.

Dependencies:
- T0053

Allowed areas:
- docs/
- src/lib/ only if a later implementation scope explicitly asks for type definitions

Do not touch:
- package files
- production editor behavior
- production preview behavior
- production export behavior
- Project JSON schema
- import/export persistence
- OCR implementation
- AI implementation
- automatic panel detection implementation
- dependency installation
- audio
- multi-page support

Requirements:
- Define common temporary suggestion fields such as id, type, source, confidence, warning notes, proposed values, edited draft values, and related project references.
- Define variant shapes for Camera Shot suggestions, Focus Region suggestions, Shot Attention Path suggestions, timing suggestions, purpose metadata suggestions, and warning/confidence notes.
- Define how suggestions can reference existing Camera Shots, Focus Regions, or Shot Attention Path items without mutating them.
- Define which suggestion data must remain temporary UI state.
- Define what data becomes normal project data only after explicit acceptance.
- Preserve Camera Shot, Focus Region, and Shot Attention Path semantics.
- Do not persist suggestions in Project JSON unless a future schema ticket explicitly scopes it.
- Do not implement suggestion review UI in this ticket unless a later scope explicitly allows it.

Non-goals:
- No production smart path generation.
- No panel detection implementation.
- No OCR implementation.
- No AI implementation.
- No editor UI implementation.
- No Project JSON schema changes.
- No preview changes.
- No export changes.
- No package changes.
- No dependencies.

Acceptance criteria:
- The temporary suggestion state model is documented clearly enough for a later implementation ticket.
- Suggestion variants cover camera shots, focus regions, shot attention paths, timing, purpose metadata, and warnings/confidence.
- Suggestions remain temporary until explicit acceptance.
- Manual editing remains the source of truth.
- No source, package, schema, preview, export, OCR, AI, panel detection, audio, or multi-page behavior changes are required.

Manual verification:
- Review the suggestion state model plan.
- Confirm suggestions are temporary and non-persistent by default.
- Confirm accepted suggestions become normal project data only through explicit user action.
- Confirm no build is required unless a later implementation ticket changes source files.

---

## T0055 - Suggestion Review UI Plan

Ticket ID: T0055

Title: Suggestion Review UI Plan

Goal: Plan the UI/UX for reviewing temporary suggestions before implementing accept/edit/delete workflow behavior.

Status: Implemented as documentation only in `docs/automation/Suggestion_Review_UI_Plan.md`. No source, package, schema, preview, export, import/export persistence, OCR, AI, panel detection, dependency, audio, multi-page, or editor behavior changed.

Dependencies:
- T0054

Allowed areas:
- docs/

Do not touch:
- src/
- package files
- production editor behavior
- production preview behavior
- production export behavior
- Project JSON schema
- import/export persistence
- OCR implementation
- AI implementation
- automatic panel detection implementation
- dependency installation
- audio
- multi-page support

Requirements:
- Plan how temporary suggestions should be shown without becoming project data.
- Plan review affordances for suggestion type, source, confidence, status, reasons, warnings, and stale/blocked states.
- Plan filtering/grouping by suggestion batch, type, confidence, and status.
- Plan how users inspect proposed versus edited draft values.
- Plan how the UI should prepare for later accept, edit, delete, reorder, regenerate, and ignore actions.
- Preserve manual editing as the source of truth.
- Do not implement UI or source changes in this planning ticket.

Non-goals:
- No editor UI implementation.
- No production suggestion behavior.
- No Project JSON schema changes.
- No preview/export changes.
- No OCR, AI, panel detection, dependencies, audio, or multi-page support.

Acceptance criteria:
- The suggestion review UI plan is documented clearly enough for a later prototype ticket.
- The plan keeps suggestions temporary until explicit acceptance.
- The plan supports all T0054 suggestion variants.
- Manual editing remains available and authoritative.
- No source/package/schema/preview/export behavior changes are required.

Manual verification:
- Review the suggestion review UI plan.
- Confirm it depends on T0054's temporary suggestion model.
- Confirm it does not implement UI behavior or schema changes.

---

## T0056 - Manual Suggestion Accept/Edit/Delete Workflow Prototype

Ticket ID: T0056

Title: Manual Suggestion Accept/Edit/Delete Workflow Prototype

Goal: Prototype a narrow manual workflow for temporary suggestions using the T0054 model and T0055 UI plan.

Status: Implemented as a narrow source prototype. Temporary manual Camera Shot and Focus Region suggestions are held in in-memory app state, shown in a Suggestions review panel, rendered as distinct non-editable canvas overlays, and accepted or rejected only through explicit user actions. Accepting a suggestion creates normal editable project data. Rejecting a suggestion removes only the temporary suggestion. No smart path generation, panel detection, OCR, AI, dependencies, Project JSON schema, import/export persistence, preview behavior, canvas export behavior, audio, or multi-page support changed.

Dependencies:
- T0054
- T0055

Allowed areas:
- src/app/ only if explicitly implementing the prototype
- src/features/editor/ only if explicitly implementing suggestion review UI
- src/lib/ only if explicitly adding temporary suggestion types/helpers
- src/styles/ only if explicitly styling prototype UI
- docs/

Do not touch:
- package files unless explicitly approved
- Project JSON schema
- import/export persistence
- production preview behavior
- production export behavior
- OCR implementation
- AI implementation
- automatic panel detection implementation
- dependency installation
- audio
- multi-page support

Requirements:
- Keep suggestions temporary until explicit acceptance.
- Start with manually seeded or manually created temporary suggestions only; do not implement smart path generation, panel detection, OCR, or AI.
- Let users review temporary suggestions without changing project data.
- Let users accept a suggestion into normal project data only through explicit action.
- Let users reject/delete a suggestion without mutating project data.
- Let users edit draft suggestion values if scoped narrowly and safely.
- Preserve Camera Shot, Focus Region, and Shot Attention Path semantics.
- Keep preview/export behavior unchanged.
- Keep Project JSON schema unchanged.

Non-goals:
- No smart camera path generation.
- No panel detection.
- No OCR.
- No AI.
- No dependency installation.
- No persisted suggestions.
- No preview/export behavior changes.
- No import/export schema changes.
- No audio or multi-page support.

Acceptance criteria:
- Temporary suggestions can be reviewed without becoming project data.
- Accepted suggestions become normal editable project data through explicit action.
- Rejected suggestions do not change project data.
- Manual editing remains available and authoritative.
- Project JSON, preview, and export behavior remain unchanged.
- Build passes if source files are changed.

Manual verification:
- Create or load a temporary suggestion through the prototype path.
- Confirm it appears as a suggestion, not accepted project data.
- Accept one suggestion and confirm it becomes normal editable project data.
- Reject one suggestion and confirm project data is unchanged.
- Confirm manual editing still works.
- Confirm preview/export behavior is unchanged.
- Run `npm.cmd run build` if source files are changed.

---

## T0057 - Smart Camera Path Draft Prototype Using Existing Manual Data Only

Ticket ID: T0057

Title: Smart Camera Path Draft Prototype Using Existing Manual Data Only

Goal: Prototype a narrow smart camera path draft action that uses existing manual project data to create temporary suggestions only.

Status: Implemented as a narrow source prototype. The Suggestions panel now has a rule-based "Draft Attention Path" action for the selected camera shot. It uses only existing manual camera shots and page-level focus regions, skips focus regions with `effectType: none`, uses the existing 60% focus-region inclusion rule, sorts by `sequenceOrder` with page-level order fallback, creates temporary in-memory Shot Attention Path suggestions, and updates the targeted camera shot's `attentionPath` only after explicit acceptance. Rejecting removes only temporary suggestion state. No Project JSON schema, import/export persistence, preview behavior, canvas export behavior, OCR, AI, panel detection, dependencies, audio, or multi-page behavior changed.

Dependencies:
- T0056

Allowed areas:
- src/app/ only if explicitly implementing the prototype
- src/features/editor/ only if extending the existing Suggestions review surface
- src/lib/ only if adding temporary suggestion helpers
- src/styles/ only if minor styling is needed
- docs/

Do not touch:
- package files
- Project JSON schema
- import/export persistence
- production preview behavior
- production export behavior
- canvas video export behavior
- OCR implementation
- AI implementation
- automatic panel detection implementation
- dependency installation
- audio
- multi-page support

Requirements:
- Use only existing manual project data such as Camera Shots, Focus Regions, Shot Attention Paths, timing, and purpose metadata.
- Do not analyze image pixels.
- Do not implement smart path generation from panel detection, OCR, AI, or external services.
- Create temporary suggestions only; do not create permanent project data automatically.
- Reuse the T0056 suggestion review and accept/reject lifecycle.
- Preserve manual project data as the source of truth.
- Keep suggested Camera Shots as full-page camera framing containers, not destructive crops.
- Keep suggested Focus Regions as page-level attention targets, not replacement camera frames.
- Keep Project JSON schema unchanged and do not persist suggestions.
- Keep preview/export behavior unchanged until suggestions are explicitly accepted as normal project data.

Non-goals:
- No production smart camera path generator.
- No panel detection.
- No OCR.
- No AI.
- No dependency installation.
- No persisted suggestions.
- No preview/export behavior changes.
- No import/export schema changes.
- No audio or multi-page support.

Acceptance criteria:
- The draft action creates reviewable temporary suggestions from existing manual data only.
- Suggestions do not mutate project data until accepted.
- Accepted suggestions become normal editable project data through the existing T0056 flow.
- Rejected suggestions do not change project data.
- Manual editing remains available and authoritative.
- Project JSON, preview, and export behavior remain unchanged.
- Build passes if source files are changed.

Manual verification:
- Create manual shots and focus regions.
- Run the draft action.
- Confirm generated items appear as temporary suggestions, not accepted project data.
- Accept one suggestion and confirm it becomes normal editable project data.
- Reject one suggestion and confirm project data is unchanged.
- Confirm no image analysis, OCR, AI, panel detection, preview/export, or schema behavior changed.
- Run `npm.cmd run build` if source files are changed.

---

## T0058 - Roadmap Status Classification and Stale Concept Demotion

Ticket ID: T0058

Title: Roadmap Status Classification and Stale Concept Demotion

Goal: Create a clear project status layer that demotes stale/effect-first concepts without deleting or rewriting implemented behavior.

Status: Implemented as documentation only in `docs/model/Roadmap_Status_Classification.md`. The classification doc defines Core, Frozen, Deprecated as Default, Legacy Optional, Later, and Human Decision Required statuses; classifies current concepts/features; adds guardrails for frozen, deprecated-default, legacy optional, later, and human-decision items; and delays panel/text/AI suggestions until Shot Attention Path motion-anchor semantics are clarified. No source, package, Project JSON schema, import/export persistence, preview behavior, canvas export behavior, suggestion behavior, dependency, OCR, AI, panel detection, audio, or multi-page behavior changed.

Dependencies:
- T0057
- Stale Concept Audit Report

Allowed areas:
- docs/model/
- docs/README.md
- docs/Repo_Current_State.md
- docs/Tickets.md
- docs/Manual_Verification_Guide.md

Do not touch:
- src/
- package files
- Project JSON schema
- import/export persistence
- production preview behavior
- production export behavior
- canvas video export behavior
- suggestion behavior
- OCR implementation
- AI implementation
- automatic panel detection implementation
- dependency installation
- audio
- multi-page support

Requirements:
- Add `docs/model/Roadmap_Status_Classification.md`.
- Define Core, Frozen, Deprecated as Default, Legacy Optional, Later, and Human Decision Required statuses.
- Classify current concepts and features using the Stale Concept Audit Report as the main input.
- Preserve the manual-first, AI-ready, page-preserving cinematic guided-view direction.
- Demote stale/effect-first concepts without deleting or rewriting implemented behavior.
- Clearly state that Frozen features may remain available but should not receive roadmap expansion unless explicitly unfrozen by a future ticket.
- Clearly state that Deprecated-as-default features may remain for compatibility/testing but should not be presented as the main product direction.
- Clearly state that Legacy Optional features may stay usable but should be treated as optional visual treatments.
- Clearly state that Later features should not become next-ticket recommendations until prerequisites are complete.
- Clearly state that Human Decision Required items must not be changed automatically.
- Update the docs index, current state, tickets, and manual verification guide.
- Fix the stale next-ticket inconsistency after T0057.
- State that the next recommended step is a new roadmap planning ticket, not panel suggestion overlay.
- State that panel/text/AI suggestions are delayed until the motion-anchor model is clarified.

Non-goals:
- No source changes.
- No deletion of lift/spotlight/zoom.
- No removal of Focus Style.
- No preview behavior change.
- No export behavior change.
- No schema change.
- No panel detection.
- No OCR.
- No AI.
- No dependency changes.
- No UI behavior changes.

Acceptance criteria:
- `docs/model/Roadmap_Status_Classification.md` exists.
- The six statuses are defined.
- Current concepts/features are classified.
- Stale concepts are demoted but not deleted.
- Docs explain that old implemented tickets may contain historical wording and that the status classification doc defines current roadmap priority.
- `docs/Repo_Current_State.md` marks T0058 implemented and recommends roadmap planning before new automation.
- `docs/Manual_Verification_Guide.md` includes T0058 docs-only verification.
- No source, package, schema, preview, export, suggestion, OCR, AI, panel detection, audio, or multi-page behavior changes are made.

Manual verification:
- Confirm `docs/model/Roadmap_Status_Classification.md` exists.
- Confirm Core, Frozen, Deprecated as Default, Legacy Optional, Later, and Human Decision Required statuses are defined.
- Confirm stale/effect-first concepts are demoted but not deleted.
- Confirm `docs/README.md` links or points to the classification doc.
- Confirm `docs/Repo_Current_State.md` marks T0058 implemented and recommends roadmap planning before new automation.
- Confirm `docs/Tickets.md` includes T0058 and notes that historical ticket wording may be stale.
- Confirm no source files changed.
- Build is not required because this is docs-only.

---

## Current Roadmap Priority Note

Older implemented tickets may contain historical wording from earlier effect-first or automation-first directions. Those tickets remain historical records and should not be rewritten wholesale. `docs/model/Roadmap_Status_Classification.md`, `docs/planning/Motion_Anchor_Roadmap_Rebuild_Plan.md`, and `docs/model/Shot_Attention_Path_Motion_Semantics.md` define the current roadmap priority: prototype accepted Shot Attention Path motion-anchor behavior in browser preview before returning to panel/text/AI suggestions. Panel suggestion overlay work is delayed until after motion-anchor semantics and near-term preview direction are clarified.

---

## T0059 - Motion-Anchor Roadmap Rebuild Plan

Ticket ID: T0059

Title: Motion-Anchor Roadmap Rebuild Plan

Goal: Rebuild the near-term roadmap after stale concept demotion so Shot Attention Path motion-anchor semantics are clarified before more automation, panel suggestion, OCR/text, AI, preview parity, or export parity work.

Status: Implemented as documentation only in `docs/planning/Motion_Anchor_Roadmap_Rebuild_Plan.md`. The original plan defined T0060 through T0069, made T0060 the next recommended ticket, delayed panel/text/AI suggestions until the motion-anchor model was clarified, delayed export parity until browser preview motion semantics stabilized, and kept demoted features available without expanding them as the default product direction. T0064 later refined this roadmap around intra-panel motion grammar and extended the planned sequence through T0071. No source, package, Project JSON schema, preview, export, suggestion behavior, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.

Dependencies:
- T0058

Allowed areas:
- docs/planning/
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md

Do not touch:
- src/
- package files
- Project JSON schema
- preview behavior
- export behavior
- suggestion behavior
- OCR implementation
- AI implementation
- panel detection implementation
- dependency installation
- audio
- multi-page support

Requirements:
- Add `docs/planning/Motion_Anchor_Roadmap_Rebuild_Plan.md`.
- Define the new roadmap sequence T0060 through T0069.
- Explain why panel suggestions are delayed.
- Explain why export parity is delayed.
- List what not to build next.
- List features kept but demoted.
- List human decision gates.
- Update current state so T0060 is the next recommended ticket.
- Update this roadmap so panel suggestion overlay work is delayed until after motion-anchor work.

Non-goals:
- No source changes.
- No behavior changes.
- No UI changes.
- No schema changes.
- No preview changes.
- No export changes.
- No AI, OCR, panel detection, dependency, audio, or multi-page implementation.

Acceptance criteria:
- `docs/planning/Motion_Anchor_Roadmap_Rebuild_Plan.md` exists.
- T0060 through T0069 are listed as the new roadmap sequence.
- T0060 is marked as the next recommended ticket.
- Panel/text/AI suggestions are delayed.
- Export parity is delayed until motion-anchor preview semantics stabilize.
- T0059 is marked implemented in docs.
- No source, package, schema, preview, export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changes are made.

Manual verification:
- Confirm the roadmap rebuild plan exists.
- Confirm T0060 through T0069 are listed.
- Confirm T0060 is the next recommended ticket.
- Confirm panel/text/AI suggestions are delayed.
- Confirm export parity is delayed.
- Confirm no source files changed.
- Build is not required because this is docs-only.

---

## T0060 - Shot Attention Path Motion Semantics Plan

Ticket ID: T0060

Title: Shot Attention Path Motion Semantics Plan

Goal: Define Shot Attention Path as a route of intra-shot camera-motion anchors before source behavior changes.

Status: Implemented as documentation only in `docs/model/Shot_Attention_Path_Motion_Semantics.md`. The semantics plan defines Shot Attention Path as ordered intra-shot motion anchors; defines each path item as an anchor, attention beat, camera target, and optional visual-treatment trigger; defines `motionRole` and `durationWeight` interpretation; separates current behavior, intended future behavior, legacy optional behavior, and human-decision-required behavior; keeps Focus Regions as page-level reusable attention targets; keeps Camera Shots as flexible timeline destinations; keeps visual treatments separate from motion-anchor identity; and keeps panel/text/AI suggestions and export parity delayed. No source, package, Project JSON schema, preview, export, suggestion behavior, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.

Dependencies:
- T0059

Allowed areas:
- docs/model/
- docs/planning/
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md

Do not touch:
- src/
- package files
- Project JSON schema
- preview behavior
- export behavior
- suggestion behavior

Requirements:
- Define each path item as an anchor, attention beat, camera target, and optional visual treatment.
- Define how `motionRole` and `durationWeight` should be interpreted.
- Define relationships between path order, `sequenceOrder`, `effectType`, `shotPurpose`, `focusPurpose`, and `outgoingTransitionPurpose`.
- Classify current behavior, future behavior, legacy optional behavior, and human-decision-required behavior.

Non-goals:
- No source changes.
- No schema changes.
- No preview/export changes.
- No automation implementation.

Acceptance criteria:
- Motion-anchor semantics are documented clearly enough to guide T0061 and T0062.
- Shot Attention Path is described as ordered intra-shot motion anchors.
- Focus Regions remain page-level reusable attention targets.
- Legacy visual treatments are separated from motion-anchor identity.
- Human decision gates remain explicit.
- Panel/text/AI suggestions remain delayed.
- Export parity remains delayed until browser preview motion-anchor semantics stabilize.
- No source, package, schema, preview, export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changes are made.

Manual verification:
- Review `docs/model/Shot_Attention_Path_Motion_Semantics.md`.
- Confirm Shot Attention Path item meaning covers anchor, attention beat, camera target, and optional visual-treatment trigger.
- Confirm `motionRole` and `durationWeight` interpretation is documented.
- Confirm current/future/legacy/human-decision behavior is separated.
- Confirm T0065 is implemented and T0066 remains the next planned ticket.
- Confirm no source files changed.
- Build is not required because this is docs-only.

---

## T0061 - Manual Motion Role and Duration Weight Controls

Ticket ID: T0061

Title: Manual Motion Role and Duration Weight Controls

Goal: Expose existing Shot Attention Path item metadata for manual editing without changing preview or export behavior.

Status: Implemented as a narrow source metadata-control ticket. The selected Camera Shot inspector's Shot Attention Path section now exposes optional `motionRole` and positive numeric `durationWeight` controls for each accepted path item. Invalid duration-weight drafts do not corrupt state and reset to the last valid value on blur. Existing add/reorder/remove path controls remain available, Focus Regions remain page-level records, and the controls are metadata-only. Project JSON schema version, existing import/export support, browser preview behavior, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior did not change.

Dependencies:
- T0060

Allowed areas:
- src/app/
- src/features/editor/
- src/lib/ only if helper changes are needed
- src/styles/ only for scoped UI styling
- docs/

Do not touch:
- package files
- Project JSON schema unless explicitly required by T0060
- preview behavior
- export behavior
- suggestion behavior
- OCR, AI, panel detection, audio, or multi-page behavior

Requirements:
- Expose `motionRole` on Shot Attention Path items.
- Expose `durationWeight` on Shot Attention Path items.
- Keep the controls metadata-only.
- Preserve normal manual Shot Attention Path add/reorder/remove controls.

Non-goals:
- No preview behavior change.
- No export behavior change.
- No automation behavior change.
- No AI/OCR/panel detection.

Acceptance criteria:
- Users can edit motion role and duration weight for path items.
- Existing path controls remain usable.
- Build passes.
- Browser preview behavior is unchanged.
- Canvas export behavior is unchanged.
- Suggestion behavior is unchanged.

Manual verification:
- Create and edit a Shot Attention Path.
- Change motion role and duration weight.
- Confirm preview/export behavior is unchanged.
- Try invalid duration weight drafts and confirm they reset safely on blur.
- Move path items and confirm metadata stays attached to the correct item.
- Run `npm.cmd run build`.

---

## T0062 - Intra-Shot Motion Preview Prototype

Ticket ID: T0062

Title: Intra-Shot Motion Preview Prototype

Goal: Prototype browser preview motion that uses accepted Shot Attention Path items as camera-motion anchors.

Status: Implemented as a browser-preview-only prototype. Auto preview now uses usable accepted Shot Attention Path items as restrained intra-shot camera-motion anchors during the focus/attention phase. Path items resolve by `focusRegionId`, missing references are ignored safely, `durationWeight` distributes focus-phase timing with safe fallback weighting, and `motionRole` values shape simple hold, pushIn, track, reveal, and emphasis motion. `effectType: none` remains a valid motion anchor while continuing to skip visual treatment. Shots without usable accepted paths fall back to existing eligible focus-region behavior. Manual preview remains shot-by-shot only. Canvas export, Project JSON schema/import/export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior did not change.

Dependencies:
- T0060
- T0061 if metadata controls are required first

Allowed areas:
- src/features/preview/
- src/lib/ only for shared preview math
- docs/

Do not touch:
- package files
- Project JSON schema
- canvas export behavior
- suggestion behavior
- OCR, AI, panel detection, audio, or multi-page behavior

Requirements:
- Use accepted Shot Attention Path path items during the focus/attention phase.
- Implement restrained pan, push, hold, or reveal behavior.
- Treat lift, spotlight, and zoom as optional visual treatments, not the path identity.
- Preserve shot-by-shot preview flow.

Non-goals:
- No canvas export changes.
- No AI/OCR/panel detection.
- No schema changes.

Acceptance criteria:
- Browser preview can demonstrate accepted intra-shot motion anchors.
- Manual project data remains the source of truth.
- Export behavior remains unchanged.
- Build passes.

Manual verification:
- Author a Shot Attention Path.
- Preview the shot and confirm motion follows accepted path items.
- Confirm path item `durationWeight` changes relative attention timing.
- Confirm path item `motionRole` changes the restrained motion behavior.
- Confirm `effectType: none` path items remain safe motion anchors without visual treatment.
- Confirm missing/deleted referenced Focus Regions do not crash preview.
- Confirm clearing the path falls back to existing eligible focus-region behavior.
- Confirm Manual mode still steps shot by shot only.
- Confirm canvas export behavior is unchanged.
- Run `npm.cmd run build`.

---

## T0063 - Continuous Intra-Shot Attention Path Motion

Ticket ID: T0063

Title: Continuous Intra-Shot Attention Path Motion

Goal: Make browser preview motion across accepted Shot Attention Path items feel continuous within a single Camera Shot.

Status: Implemented as a browser-preview-only continuity repair after T0062. Auto preview now resolves accepted Shot Attention Path items as a continuous intra-shot placement path during the focus/attention phase instead of calculating each anchor as a separate reset from the base shot framing. The preview glides from the current shot framing toward the first usable accepted anchor and then from anchor target to anchor target while preserving accepted path order, `durationWeight`, `motionRole`, and existing `effectType` behavior. `effectType: none` remains a valid motion anchor while skipping visual treatment. Shots without usable accepted paths still use the existing fallback behavior. Manual preview remains shot-by-shot only. Canvas export, Project JSON schema/import/export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior did not change.

Dependencies:
- T0060
- T0062

Allowed areas:
- src/features/preview/
- docs/

Do not touch:
- package files
- Project JSON schema
- canvas export behavior
- suggestion behavior
- OCR, AI, panel detection, audio, or multi-page behavior

Requirements:
- Treat usable accepted Shot Attention Path items as one continuous intra-shot motion path during the browser preview focus/attention phase.
- Glide from the current shot framing toward the first usable accepted attention anchor.
- Glide from anchor target to anchor target without returning to the shot's default/base framing between anchors.
- Preserve restrained motion behavior.
- Preserve accepted path order, `motionRole`, `durationWeight`, and existing `effectType` behavior from T0062.
- Keep `effectType: none` usable as a motion anchor while skipping visual treatment.
- Preserve existing fallback behavior when no usable accepted path exists.
- Skip missing or invalid focus-region references without breaking preview.
- Keep Manual mode shot-by-shot only.

Non-goals:
- No export changes.
- No Project JSON schema changes.
- No new UI.
- No automation changes.
- No AI/OCR/panel detection.

Acceptance criteria:
- Browser Auto preview no longer appears to reset to base shot framing between accepted attention anchors.
- Accepted Shot Attention Path anchors form a continuous intra-shot camera path.
- Motion remains subtle and readable.
- Path order, `durationWeight`, `motionRole`, and `effectType` behavior remain intact.
- Missing/deleted referenced Focus Regions do not crash preview.
- Manual mode remains shot-by-shot only.
- Canvas export behavior remains unchanged.
- Project JSON schema/import/export behavior and suggestion behavior remain unchanged.
- Build passes if source changes.

Manual verification:
- Upload an image.
- Create one Camera Shot with at least three page-level Focus Regions inside or mostly inside it.
- Add those Focus Regions to the selected shot's accepted Shot Attention Path in a deliberate order.
- Assign varied `motionRole` and `durationWeight` values.
- Preview in Auto mode and confirm the camera glides from the shot framing to the first accepted anchor, then from anchor to anchor without visibly returning to the base shot framing between anchors.
- Confirm movement remains restrained rather than aggressive.
- Set one referenced Focus Region to `effectType: none` and confirm it still acts as a motion anchor while skipping visual treatment.
- Delete or remove a referenced Focus Region and confirm preview does not crash.
- Clear the selected shot's attention path and confirm fallback behavior still works.
- Confirm Manual mode still steps camera shots only.
- Confirm canvas video export behavior is unchanged if checked.
- Run `npm.cmd run build`.

---

## T0064 - Intra-Panel Motion Grammar Roadmap Sync

Ticket ID: T0064

Title: Intra-Panel Motion Grammar Roadmap Sync

Goal: Promote the intra-panel motion grammar study into the active roadmap and delay export parity until the browser preview motion model is better defined.

Status: Implemented as documentation only. `docs/research/Intra_Panel_Motion_Grammar_Study.md` is now part of the active roadmap context. The roadmap now states that the product should not stop at simple guided camera movement; the target is semantic intra-panel camera motion that expresses panel energy, attention, emotion, and implied movement while preserving page artwork and readability. Export parity remains on the roadmap but is delayed until after motion-role grammar and browser-preview behavior are better defined. No source, package, Project JSON schema, runtime preview behavior, export behavior, suggestion behavior, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.

Dependencies:
- T0063

Allowed areas:
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md
- docs/research/

Do not touch:
- src/
- package files
- Project JSON schema
- preview behavior
- export behavior

Requirements:
- Promote `docs/research/Intra_Panel_Motion_Grammar_Study.md` into the active roadmap context.
- Explain that simple guided camera behavior is not the final product target.
- State that the project direction is semantic intra-panel camera motion.
- Explain that camera movement should express panel energy, attention, emotion, and implied motion.
- Delay export parity until after motion-role grammar and browser-preview behavior are better defined.
- Keep export parity planned, not abandoned.
- Make T0065 - Motion Role Behavior Definitions the next recommended ticket.
- State that T0065 should define current role behavior for `hold`, `pushIn`, `track`, `reveal`, and `emphasis`.
- State that T0065 should decide whether `pullBack`, `drift`, and `transfer` should be added later.

Non-goals:
- No source changes.
- No schema changes.
- No runtime behavior changes.
- No export implementation.
- No AI/OCR/panel detection.

Acceptance criteria:
- The active roadmap points to motion-role grammar before export parity.
- Export parity is explicitly delayed until after motion model stabilization.
- T0065 is the next recommended ticket.
- Current export behavior remains unchanged.
- Current preview behavior remains unchanged.
- Project JSON schema remains unchanged.

Manual verification:
- Review `docs/research/Intra_Panel_Motion_Grammar_Study.md`.
- Confirm `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/Manual_Verification_Guide.md` mark T0064 implemented and recommend T0065.
- Confirm export parity remains planned but delayed.
- Confirm no source files changed.
- Build is not required because this is docs-only.

---

## T0065 - Motion Role Behavior Definitions

Ticket ID: T0065

Title: Motion Role Behavior Definitions

Goal: Define concrete motion behavior for Shot Attention Path motion roles before more preview polish or export parity work.

Status: Implemented as a docs/model planning ticket. `docs/model/Shot_Attention_Path_Motion_Semantics.md` now defines concrete behavior expectations for `hold`, `pushIn`, `track`, `reveal`, and `emphasis`, including semantic purpose, expected camera behavior, pacing tendency, use cases, non-use cases, `effectType` interaction, and `durationWeight` interaction. The docs classify `pullBack` as a future possible role, `drift` as a shot-level/profile concept for now, and `transfer` as merged into `track` for now. `effectType` remains visual treatment only, `motionRole` remains camera-motion intent, and `effectType: none` remains a valid motion anchor. No source, package, Project JSON schema, runtime preview behavior, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.

Dependencies:
- T0064

Allowed areas:
- docs/model/
- docs/planning/
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md
- docs/

Do not touch:
- src/
- package files
- Project JSON schema
- export behavior
- suggestion behavior
- OCR, AI, panel detection, audio, or multi-page behavior

Requirements:
- Define intended behavior for existing roles: `hold`, `pushIn`, `track`, `reveal`, and `emphasis`.
- Define how roles affect pan, zoom, influence, dwell, transition feel, and restraint.
- Decide whether `pullBack`, `drift`, and `transfer` should be added later, and mark any schema/model implications as future work only.
- Keep `effectType` separate from `motionRole`.
- Keep `durationWeight` as timing guidance, not a visual treatment.
- Keep Focus Regions as page-level motion anchors, not mini-panels or replacement Camera Shots.
- Keep export parity delayed until the role grammar is stable.

Non-goals:
- No runtime preview implementation unless explicitly scoped as light constants only.
- No Project JSON schema changes.
- No export changes.
- No AI/OCR/panel detection.
- No new UI.

Acceptance criteria:
- Motion-role behavior is documented clearly enough to guide the next preview implementation ticket.
- The docs explain whether `pullBack`, `drift`, and `transfer` remain future roles or become planned additions.
- Export parity remains delayed until after browser-preview motion-role behavior is better defined.
- No source behavior changes are made.

Manual verification:
- Review the motion-role behavior definitions.
- Confirm the existing role names have clear preview behavior targets.
- Confirm future role additions are marked as future work only if they imply schema/model changes.
- Confirm export parity remains planned but delayed.
- Build is not required for docs-only scope.

---

## T0066 - Preview Applies Motion Role Profiles

Ticket ID: T0066

Title: Preview Applies Motion Role Profiles

Goal: Make browser Auto preview apply the T0065 motion-role behavior definitions while keeping movement restrained and page-preserving.

Status: Implemented as a browser-preview-only source ticket. Browser Auto preview now applies distinct restrained motion-role profiles for accepted Shot Attention Path anchors: `hold` stays mostly stable, `pushIn` gently increases attention, `track` transfers attention anchor-to-anchor, `reveal` delays and stages arrival, and `emphasis` adds a small settle/weight. T0063 continuous intra-shot path behavior is preserved. Accepted path order, `durationWeight` timing, `effectType` visual-treatment separation, `effectType: none` motion-anchor behavior, fallback behavior, missing-reference safety, and Manual mode shot-by-shot behavior are preserved. Canvas export, Project JSON schema, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior did not change.

Dependencies:
- T0065

Allowed areas:
- src/features/preview/
- docs/

Do not touch:
- package files
- Project JSON schema
- canvas export behavior
- suggestion behavior
- OCR, AI, panel detection, audio, or multi-page behavior

Requirements:
- Apply distinct browser-preview behavior for `hold`, `pushIn`, `track`, `reveal`, and `emphasis` based on T0065 definitions.
- Keep motion restrained, readable, and continuous inside the current Camera Shot.
- Preserve accepted Shot Attention Path order.
- Preserve `durationWeight` as timing guidance.
- Preserve `effectType` as visual treatment only.
- Keep `effectType: none` usable as a motion anchor while skipping visual treatment.
- Keep fallback behavior for shots without usable accepted paths.
- Skip missing or invalid focus-region references safely.
- Keep Manual mode shot-by-shot only.

Non-goals:
- No Project JSON schema changes.
- No export changes.
- No new UI.
- No new motion roles.
- No AI/OCR/panel detection.

Acceptance criteria:
- Browser Auto preview visibly distinguishes role behavior without becoming aggressive.
- `hold` remains stable, `pushIn` gently increases attention, `track` transfers attention, `reveal` stages the anchor, and `emphasis` adds restrained weight.
- Existing T0063 continuity is preserved.
- Canvas export behavior remains unchanged.
- Build passes.

Manual verification:
- Author a shot with accepted attention anchors using each current `motionRole`.
- Preview in Auto mode and confirm each role follows T0065 behavior expectations.
- Confirm motion stays continuous and restrained.
- Confirm `effectType: none` remains a motion anchor while skipping visual treatment.
- Confirm Manual mode remains shot-by-shot only.
- Confirm canvas export behavior is unchanged if checked.
- Run `npm.cmd run build`.

---

## T0066A - Motion Role Profile Tuning Pass

Ticket ID: T0066A

Title: Motion Role Profile Tuning Pass

Goal: Tune the browser Auto preview motion-role profiles after manual testing showed role differences were too minimal.

Status: Implemented as a browser-preview-only tuning ticket. T0063 continuous intra-shot motion is preserved, and T0066 role-profile structure is preserved. `hold` remains mostly stable and `track` remains an attention-transfer role. `pushIn` now uses a more visible restrained inward move, `emphasis` now has a stronger weighted push/settle feeling, and `reveal` now starts from a subtly staged offset before arriving at the anchor so it reads more like uncovering or staging than a weak push-in. Accepted path order, `durationWeight` timing, `effectType` visual-treatment separation, `effectType: none` motion-anchor behavior, fallback behavior, missing-reference safety, and Manual mode shot-by-shot behavior are preserved. Canvas export, Project JSON schema, suggestion behavior, OCR, AI, panel detection, dependencies, audio, multi-page behavior, and UI did not change.

Dependencies:
- T0066

Allowed areas:
- src/features/preview/PreviewPlayer.tsx
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md
- docs/model/Shot_Attention_Path_Motion_Semantics.md only for small clarification if needed

Do not touch:
- package files
- Project JSON schema
- src/lib/canvasVideoExport.ts
- canvas export behavior
- suggestion behavior
- OCR
- AI
- panel detection
- dependencies
- audio
- multi-page behavior
- new UI

Requirements:
- Preserve T0063 continuity.
- Preserve T0066 role-profile structure.
- Keep `hold` mostly stable.
- Keep `track` readable as attention transfer.
- Strengthen `pushIn` so it is noticeably more inward than `hold`.
- Strengthen `emphasis` so it creates a clearer weighted beat without shake or flashy effects.
- Clarify `reveal` with a recognizable staging/uncovering feeling.
- Keep all movement restrained, readable, and page-preserving.
- Preserve accepted path order, `durationWeight`, `effectType` separation, `effectType: none` motion-anchor behavior, fallback behavior, missing-reference safety, and Manual mode shot-by-shot behavior.
- Do not add motion roles, schema, UI, export parity, AI, OCR, or panel detection.

Non-goals:
- No canvas export changes.
- No Project JSON schema changes.
- No new UI.
- No new motion roles.
- No suggestion, OCR, AI, panel detection, dependency, audio, or multi-page changes.

Acceptance criteria:
- Browser Auto preview role differences are more visible after manual testing.
- `pushIn` and `emphasis` feel stronger but restrained.
- `reveal` reads as staged or uncovered rather than a weak push-in.
- The camera remains continuous and does not reset between accepted anchors.
- Export parity remains planned but delayed until preview motion roles feel acceptable.

Manual verification:
- Create one Camera Shot with five Focus Regions.
- Add all five Focus Regions to the accepted Shot Attention Path.
- Assign `hold`, `pushIn`, `track`, `reveal`, and `emphasis`.
- Preview in Auto mode and confirm no reset between anchors.
- Confirm `hold` remains stable and `track` remains readable.
- Confirm `pushIn` is more noticeable than before.
- Confirm `emphasis` feels stronger than `pushIn` or at least more weighted.
- Confirm `reveal` has a recognizable staging/uncovering feeling.
- Confirm `effectType: none` remains a motion anchor without visual treatment.
- Confirm Manual mode remains shot-by-shot only.
- Confirm canvas export remains unchanged if checked.
- Run `npm.cmd run build`.

---

## T0066B - Exit Continuity and Reveal Mask Behavior

Ticket ID: T0066B

Title: Exit Continuity and Reveal Mask Behavior

Goal: Make browser Auto preview transition out of a Camera Shot from the final intra-shot motion placement when a usable accepted Shot Attention Path exists, and make `reveal` read as isolate -> reveal -> reconnect.

Status: Implemented as a browser-preview-only repair/tuning ticket. When a shot has usable accepted Shot Attention Path anchors, browser Auto preview now preserves the final intra-shot motion placement through the shot exit phase and uses that placement as the outgoing transition start toward the next Camera Shot or guided page exit. A final `pushIn`, `emphasis`, `reveal`, `track`, or `hold` anchor no longer visibly snaps back to the base Camera Shot framing before the next transition. `reveal` now has a temporary browser-preview-only mask profile: it strongly dims the surrounding shot area around the reveal Focus Region, holds the isolated reveal briefly, then fades/opens back out to reconnect with the next anchor, next transition, or broader shot context. This reveal mask does not change stored `effectType`; `effectType` remains visual-treatment metadata, and `effectType: none` can still skip normal focus treatment while reveal role masking remains available. Shots without usable accepted paths keep the existing base-shot transition behavior. T0063 anchor-to-anchor continuity, T0066/T0066A non-reveal role-profile behavior, accepted path order, `durationWeight` timing, fallback behavior, missing-reference safety, and Manual mode shot-by-shot behavior are preserved. Canvas export, Project JSON schema, suggestion behavior, OCR, AI, panel detection, dependencies, audio, multi-page behavior, and UI did not change.

Dependencies:
- T0066A

Allowed areas:
- src/features/preview/PreviewPlayer.tsx
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md
- docs/model/Shot_Attention_Path_Motion_Semantics.md only for small clarification if needed

Do not touch:
- package files
- Project JSON schema
- src/lib/canvasVideoExport.ts
- canvas export behavior
- suggestion behavior
- OCR
- AI
- panel detection
- dependencies
- audio
- multi-page behavior
- new UI

Requirements:
- Preserve T0063 continuous anchor-to-anchor motion inside a shot.
- Preserve T0066/T0066A role-profile behavior except for the explicit `reveal` mask update in this ticket.
- Preserve the stronger `pushIn` and clearer `emphasis` behavior from T0066A.
- Compute the final intra-shot camera placement at the end of the focus/attention phase when a shot has usable accepted Shot Attention Path anchors.
- Use that final placement as the outgoing transition start when moving to the next Camera Shot.
- Avoid returning to the base shot framing between the final anchor and the next shot transition.
- Keep transition motion restrained and readable.
- Update `reveal` so it reads as isolate -> reveal -> reconnect instead of a weaker `pushIn`.
- Temporarily strengthen surrounding dim/mask for reveal in browser preview without changing stored `effectType`.
- Keep `effectType: none` usable as a motion anchor; reveal may still apply its temporary role mask while skipping normal focus visual treatment.
- Preserve accepted path order, `durationWeight`, `effectType` separation, `effectType: none` motion-anchor behavior, fallback behavior, missing-reference safety, and Manual mode shot-by-shot behavior.
- Do not add motion roles, schema, UI, export parity, AI, OCR, or panel detection.

Non-goals:
- No canvas export changes.
- No Project JSON schema changes.
- No new UI.
- No new motion roles.
- No suggestion, OCR, AI, panel detection, dependency, audio, or multi-page changes.

Acceptance criteria:
- Browser Auto preview does not reset to base shot framing between a final accepted attention anchor and the next Camera Shot transition.
- A final pushed-in anchor naturally relaxes or pulls toward the next shot during transition.
- `reveal` reads as isolate -> reveal -> reconnect, with surrounding context dimmed enough for the reveal Focus Region to read clearly.
- Reveal role masking is temporary browser-preview behavior and does not change stored `effectType`.
- Shots without usable accepted paths keep existing transition behavior.
- Manual mode remains shot-by-shot only.
- Export parity remains planned but delayed.

Manual verification:
- Create two Camera Shots.
- In the first Camera Shot, create at least three Focus Regions and add them to the accepted Shot Attention Path.
- Make the last path item `pushIn`.
- Preview in Auto mode.
- Confirm the camera does not reset to the base shot framing before moving to the second Camera Shot.
- Confirm the transition begins from the final pushed-in intra-shot placement and relaxes/moves naturally toward the second shot.
- Repeat with `emphasis` and `reveal` as the final path item.
- Test `reveal` in the middle of a shot path and confirm it feels like isolate -> reveal -> reconnect.
- Confirm the surrounding shot area dims/blackens enough for reveal to read clearly.
- Confirm reveal does not feel like just another `pushIn`.
- Confirm `effectType: none` still acts as a motion anchor without normal visual treatment.
- Confirm shots without accepted paths still use existing transition behavior.
- Confirm Manual mode remains shot-by-shot only.
- Confirm canvas export remains unchanged if checked.
- Run `npm.cmd run build`.

---

## T0066C - Reveal Mask Transition Continuity Repair

Ticket ID: T0066C

Title: Reveal Mask Transition Continuity Repair

Goal: Make browser Auto preview reveal mask transitions continuous and non-flashy after manual testing found bright page flashes before and after reveal.

Status: Implemented as a browser-preview-only repair ticket. Reveal masking now keeps a low baseline dim during reveal boundary frames instead of returning `null` and unmounting the dim layer at the start or end of the reveal slice. When playback leaves a reveal anchor for the next non-reveal anchor, browser preview now carries an outgoing reveal mask bridge through the next anchor's transition window so the page does not flash bright before the next beat. T0063 anchor-to-anchor continuity, T0066/T0066A role profiles, T0066B final intra-shot placement into the next transition, accepted path order, `durationWeight` timing, stored `effectType` metadata, `effectType: none` reveal-anchor behavior, missing-reference safety, fallback behavior, and Manual mode shot-by-shot behavior are preserved. Canvas export, Project JSON schema, suggestion behavior, OCR, AI, panel detection, dependencies, audio, multi-page behavior, and UI did not change.

Dependencies:
- T0066B

Allowed areas:
- src/features/preview/PreviewPlayer.tsx
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md
- docs/model/Shot_Attention_Path_Motion_Semantics.md only for small clarification if needed

Do not touch:
- package files
- Project JSON schema
- src/lib/canvasVideoExport.ts
- canvas export behavior
- suggestion behavior
- OCR
- AI
- panel detection
- dependencies
- audio
- multi-page behavior
- new UI

Requirements:
- Preserve T0063 continuous anchor-to-anchor motion.
- Preserve T0066/T0066A role-profile behavior.
- Preserve T0066B final intra-shot placement into next shot transition.
- Keep reveal as isolate -> reveal -> reconnect.
- Remove or reduce page flashing before and after reveal.
- Keep the reveal dim/mask layer from abruptly unmounting at reveal boundaries.
- Smoothly fade or bridge reveal mask opacity during boundary moments.
- Ensure reveal with `effectType: none` skips normal focus visual treatment without bright-page flashing.
- Preserve accepted path order, `durationWeight`, stored `effectType` metadata, fallback behavior, and Manual mode shot-by-shot behavior.
- Do not add motion roles, schema, UI, export parity, AI, OCR, or panel detection.

Non-goals:
- No canvas export changes.
- No Project JSON schema changes.
- No new UI.
- No new motion roles.
- No suggestion, OCR, AI, panel detection, dependency, audio, or multi-page changes.

Acceptance criteria:
- Reveal no longer flashes to a bright full page before the mask appears.
- Reveal isolation fades in smoothly.
- Reveal reconnect fades or opens out smoothly.
- The page does not flash bright between reveal and the next anchor.
- `effectType: none` reveal anchors still skip normal focus treatment while preserving reveal mask continuity.
- Final intra-shot exit continuity from T0066B remains intact.
- Export parity remains planned but delayed.

Manual verification:
- Create one Camera Shot with at least three accepted Shot Attention Path anchors.
- Put `reveal` in the middle of the path.
- Preview in Auto mode.
- Confirm the page does not flash bright before the reveal mask appears.
- Confirm the reveal isolation fades in smoothly.
- Confirm the reveal reconnect fades/opens out smoothly.
- Confirm the page does not flash bright after reveal before the next anchor.
- Repeat with reveal set to `effectType: none`.
- Repeat with reveal as the final anchor before moving to the next Camera Shot.
- Confirm final intra-shot exit continuity from T0066B still works.
- Confirm Manual mode remains shot-by-shot only.
- Confirm canvas export remains unchanged if checked.
- Run `npm.cmd run build`.

---

## T0067 - Export Parity After Motion Model Plan

Ticket ID: T0067

Title: Export Parity After Motion Model Plan

Goal: Reassess canvas export parity after motion-role grammar and browser preview motion behavior stabilize.

Status: Implemented as a planning-only documentation ticket. `docs/planning/Export_Parity_After_Motion_Model_Plan.md` defines how canvas/video export should eventually match the accepted browser-preview motion grammar. Browser Preview Motion Grammar Acceptance Review later accepted the current browser-preview grammar as the practical baseline and unblocked T0068. Source behavior, package files, Project JSON schema/import/export, browser preview behavior, canvas export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior did not change.

Dependencies:
- T0066C

Allowed areas:
- docs/planning/
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md

Do not touch:
- src/
- package files
- Project JSON schema
- preview behavior
- export behavior

Requirements:
- Define export parity for accepted motion anchors after role behavior is better defined.
- Define export parity for the active `track`, `pushIn`, and `pushOut` browser-preview grammar.
- Define how later export should treat the current `track` follow-spot candidate if manually accepted.
- Explicitly avoid chasing parity for stale focus-effect sequencing.
- Explicitly avoid resurrecting deprecated `track` visual language such as rails, ribbons, aperture masks, endpoint capsules, rectangular cutouts, moving squares, sliding boxes, or Focus Region-shaped highlights.
- Identify DOM/CSS/SVG-to-canvas implementation risks before source changes.
- Add a later implementation checklist without implementing export behavior.
- Keep export parity on the roadmap without making implementation the next step before manual browser-preview motion grammar acceptance.

Non-goals:
- No source changes.
- No export implementation.
- No schema changes.

Acceptance criteria:
- Export parity scope is defined for a later implementation ticket.
- Current export behavior remains unchanged.
- The plan depends on stabilized preview motion-role semantics.
- Deprecated rail, ribbon, aperture, endpoint, moving-square, sliding-box, and Focus Region-shaped highlight language is excluded from future active `track` export parity.
- The next recommended step does not jump into source implementation until browser-preview motion grammar is manually accepted.

Manual verification:
- Review the plan.
- Confirm it depends on stabilized preview motion-role semantics.
- Confirm no source files changed.
- Confirm `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/Manual_Verification_Guide.md` mark T0067 as a docs-only completed planning ticket.
- Confirm build is not required because this is docs-only.

---

## T0068 - Canvas Export Parity for Accepted Motion Anchors

Ticket ID: T0068

Title: Canvas Export Parity for Accepted Motion Anchors

Goal: Make canvas export follow accepted Shot Attention Path motion-anchor behavior after preview motion-role semantics are stable.

Status: Implemented. Canvas export now targets the accepted browser-preview `track`, `pushIn`, and `pushOut` baseline, including accepted per-shot `Shot Starts At` behavior for first-focus `track` chains and first-focus `pushOut` starts, plus the accepted shot-to-shot travel veil. Browser-preview visual repair remains frozen unless a future ticket explicitly reopens it. T0068 did not revive rejected active `track` visual language such as rails, ribbons, aperture masks, endpoint capsules, rectangular cutouts, moving squares, sliding boxes, punched cutouts, or Focus Region-shaped highlights.

Dependencies:
- T0067

Allowed areas:
- src/lib/
- docs/

Do not touch:
- package files
- Project JSON schema unless explicitly scoped
- suggestion behavior
- OCR, AI, panel detection, audio, or multi-page behavior

Requirements:
- Mirror accepted motion-anchor preview behavior in canvas export after the preview behavior is stable.
- Mirror accepted `Shot Starts At` behavior for `establishShot` and `firstFocus` starts.
- Include first-focus `track -> track` starts that begin dimmed with the follow-spot on the first Focus Region.
- Include first-focus `pushOut` starts that begin close on the first Focus Region without changing accepted push-out expansion behavior.
- Mirror accepted shot-to-shot travel pacing, including eased travel, subtle midpoint dim/softness, and clean arrival.
- Preserve existing export controls and status behavior unless explicitly scoped.
- Keep export tied to accepted project data only.

Non-goals:
- No new production export architecture unless separately ticketed.
- No AI/OCR/panel detection.
- No automatic suggestion acceptance.

Acceptance criteria:
- Canvas export follows accepted motion anchors closely enough for MVP parity.
- Browser preview remains the reference behavior.
- Build passes.

Manual verification:
- Export a project with accepted motion anchors.
- Export a project using `Shot Starts At = First focus` with a first `track -> track` chain.
- Export a project using `Shot Starts At = First focus` with a first `pushOut` anchor.
- Confirm output roughly matches browser preview motion.
- Run `npm.cmd run build`.

---

## T0069 - Rule-Based Path Suggestion Upgrade With Motion Roles

Ticket ID: T0069

Title: Rule-Based Path Suggestion Upgrade With Motion Roles

Goal: Upgrade rule-based attention path suggestions so they can propose motion role and duration weight metadata.

Status: Planned as later/deferred work. The current post-SFX roadmap prioritizes dialogue/narration and AI assistance before returning to older suggestion, panel, or OCR/text work unless the roadmap is explicitly reopened.

Dependencies:
- T0060
- T0061
- T0065 recommended

Allowed areas:
- src/app/
- src/features/editor/
- src/lib/
- docs/

Do not touch:
- package files
- Project JSON schema unless explicitly scoped
- preview behavior
- export behavior
- OCR, AI, panel detection, audio, or multi-page behavior

Requirements:
- Use only existing manual project data.
- Propose `motionRole` and `durationWeight` on temporary suggestions.
- Keep suggestions temporary until explicit acceptance.
- Preserve T0057's no-AI/no-OCR/no-panel-detection boundary.

Non-goals:
- No image analysis.
- No AI.
- No OCR.
- No panel detection.
- No preview/export changes.

Acceptance criteria:
- Temporary suggestions can include motion metadata.
- Accepted suggestions update only the targeted accepted Shot Attention Path.
- Rejected suggestions leave project data unchanged.
- Build passes.

Manual verification:
- Generate a rule-based suggestion.
- Confirm proposed motion metadata is visible.
- Accept and reject suggestions to confirm lifecycle behavior.
- Run `npm.cmd run build`.

---

## T0070 - Panel Suggestion Overlay Prototype

Ticket ID: T0070

Title: Panel Suggestion Overlay Prototype

Goal: Resume panel suggestion overlay work only after motion-anchor semantics exist.

Status: Planned and delayed until after motion-anchor work.

Dependencies:
- T0060
- T0065 recommended

Allowed areas:
- src/app/
- src/features/editor/
- src/lib/
- src/styles/
- docs/

Do not touch:
- package files unless explicitly approved
- Project JSON schema unless explicitly scoped
- preview behavior unless explicitly scoped
- export behavior
- OCR, AI, audio, or multi-page behavior

Requirements:
- Keep panel candidates temporary suggestions.
- Do not treat panel candidates as destructive crops.
- Do not treat Focus Regions as replacement camera frames.
- Require explicit accept/reject workflow.
- No AI unless explicitly scoped.

Non-goals:
- No OCR.
- No AI unless separately scoped.
- No automatic project mutation.
- No export changes.

Acceptance criteria:
- Panel candidates are reviewable temporary suggestions.
- Accepted suggestions become normal manual project data only after explicit user action.
- Build passes.

Manual verification:
- Review panel suggestions.
- Accept and reject suggestions.
- Confirm no automatic project mutation.
- Run `npm.cmd run build`.

---

## T0071 - Text/OCR Timing Suggestion Prototype

Ticket ID: T0071

Title: Text/OCR Timing Suggestion Prototype

Goal: Prototype suggestion-based text/OCR timing only after motion-anchor and panel-suggestion prerequisites are clarified.

Status: Planned and delayed.

Dependencies:
- T0060
- T0070 recommended

Allowed areas:
- src/app/
- src/features/editor/
- src/lib/
- docs/

Do not touch:
- package files unless explicitly approved
- Project JSON schema unless explicitly scoped
- preview behavior unless explicitly scoped
- export behavior
- AI implementation unless explicitly scoped
- audio
- multi-page behavior

Requirements:
- Keep timing suggestions temporary.
- Do not automatically override manual timing.
- Keep manual shot duration and timing controls authoritative.
- Document OCR limitations if OCR is introduced.

Non-goals:
- No automatic timing override.
- No accepted project mutation without explicit acceptance.
- No export changes.
- No AI unless separately scoped.

Acceptance criteria:
- Text/OCR timing suggestions are reviewable and temporary.
- Manual timing remains authoritative.
- Build passes if source changes.

Manual verification:
- Review timing suggestions.
- Accept and reject suggestions.
- Confirm manual timing controls still work.
- Run `npm.cmd run build` if source files change.

---

## T0072 - AI-Assisted Camera Path Spike or Prototype

Ticket ID: T0072

Title: AI-Assisted Camera Path Spike or Prototype

Goal: Explore or prototype AI-assisted camera path suggestions only after motion-anchor and rule-based suggestion behavior are clarified.

Status: Planned as later work only.

Dependencies:
- T0060
- T0069 recommended

Allowed areas:
- docs/ if spike only
- source areas only if explicitly scoped by the ticket

Do not touch:
- package files unless explicitly approved
- Project JSON schema unless explicitly scoped
- preview behavior unless explicitly scoped
- export behavior
- accepted project data without explicit user acceptance

Requirements:
- Keep AI output suggestion-based.
- Explicitly scope inputs, outputs, privacy, accuracy, and failure handling.
- Preserve manual editing before and after suggestions.
- Do not automatically accept AI-generated Camera Shots, Focus Regions, timing, or Shot Attention Path data.

Non-goals:
- No automatic final video generation.
- No destructive panel extraction.
- No replacement of manual editing.
- No accepted project mutation without explicit acceptance.

Acceptance criteria:
- AI-assisted behavior is either documented as a spike or implemented as temporary suggestions only.
- Manual project data remains authoritative.
- Build passes if source changes.

Manual verification:
- Confirm AI output remains temporary and reviewable.
- Confirm accept/reject workflow is explicit.
- Run `npm.cmd run build` if source files change.

---

## T0073 - Special Effects Direction Doc

Ticket ID: T0073

Title: Special Effects Direction Doc

Goal: Define how special effects fit into the MVP+ product model before implementing visual effects.

Status: Implemented as a planning-only documentation ticket. `docs/planning/Special_Effects_Direction_Plan.md` defines special effects as optional rendering-layer modifiers layered on top of existing resolved camera placement. The active camera grammar remains `track`, `pushIn`, and `pushOut`. This ticket did not implement UI, preview behavior, export behavior, Project JSON schema changes, source changes, dependencies, AI, OCR, panel detection, audio changes, or multi-page behavior.

Dependencies:
- T0068
- Global Shot Transition Softening / Natural Camera Travel Polish
- Export verification + bug repair

Allowed areas:
- docs/planning/
- docs/Tickets.md
- docs/Repo_Current_State.md
- docs/Manual_Verification_Guide.md

Do not touch:
- src/
- package files
- Project JSON schema
- preview behavior
- export behavior
- UI
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Define what counts as a special effect in this project.
- Clarify that special effects differ from camera motion roles.
- Preserve the active camera grammar: `track`, `pushIn`, and `pushOut`.
- State that special effects modify emotional texture only and do not decide where the camera goes.
- Define allowed MVP+ effect candidates: camera shake, flash / impact pulse, vignette / tension dim, and cautious motion blur.
- Document intended storytelling use, per-shot/global scope, preview behavior, export behavior, and risks for each allowed effect.
- Explicitly delay parallax, character cutouts, face tracking, AI-driven emphasis, moving real manga motion lines, segmentation-dependent foreground animation, and punch-in as a separate motion grammar.
- Clarify that impact pulse is allowed only as a temporary visual modifier on top of the existing camera, not as a new camera role competing with `pushIn`.
- Recommend no Project JSON changes until preview-only experiments prove the effects feel good.
- Recommend preset-first future UI controls.
- Record that accepted effects need eventual export parity.
- Add manual verification expectations for future effect tickets.

Non-goals:
- No source changes.
- No preview implementation.
- No export implementation.
- No UI implementation.
- No Project JSON schema changes.
- No new motion roles.
- No new shot geometry or ownership model.
- No AI, OCR, panel detection, audio, dependencies, or multi-page behavior.

Acceptance criteria:
- The special-effects direction is documented.
- Effects are clearly rendering-layer modifiers only.
- The active camera grammar remains `track`, `pushIn`, and `pushOut`.
- Allowed MVP+ effect candidates and delayed/forbidden effects are clearly listed.
- Future ticket numbering is adjusted because T0069-T0072 are already assigned.
- Build is not required because this is docs-only.

Manual verification:
- Review `docs/planning/Special_Effects_Direction_Plan.md`.
- Confirm the plan does not add new motion roles.
- Confirm the plan does not change Project JSON schema.
- Confirm the plan does not claim source, preview, export, UI, AI, OCR, panel detection, dependency, audio, or multi-page implementation.
- Confirm T0074 is the next recommended implementation ticket.

---

## T0074 - Camera Shake Preview Spike

Ticket ID: T0074

Title: Camera Shake Preview Spike

Goal: Prototype camera shake in browser preview as a rendering-layer modifier on top of accepted camera placement.

Status: Implemented as a browser-preview-only spike. `PreviewPlayer` now has a local Shake toggle that applies a restrained, deterministic camera-jitter offset after normal camera placement is resolved. The shake modifier affects the rendered preview image and matching track follow-spot overlay only while playback is running, clamps offsets to the available image bounds inside the shot window, and does not persist to Project JSON. `track`, `pushIn`, `pushOut`, shot geometry, Focus Regions, Shot Attention Path data, canvas export, package files, AI, OCR, panel detection, audio, dependencies, and multi-page behavior were unchanged.

Dependencies:
- T0073

Allowed areas:
- src/features/preview/ only if scoped by the implementation ticket
- docs/

Do not touch:
- Project JSON schema
- camera shot geometry ownership
- focus region ownership
- Shot Attention Path ownership
- motion role grammar
- export behavior unless explicitly scoped
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Keep camera shake preview-only and experimental.
- Apply shake as temporary offsets after normal camera placement is computed.
- Preserve `track`, `pushIn`, and `pushOut` behavior underneath the modifier.
- Ensure effect-off baseline is visually identical to the accepted preview baseline.
- Avoid stage-edge exposure through clamping or restrained intensity.
- Do not persist settings in Project JSON yet.

Non-goals:
- No UI beyond minimal spike controls if explicitly scoped.
- No export parity in this ticket.
- No Project JSON changes.
- No new motion roles.

Acceptance criteria:
- Camera shake can be manually evaluated in preview without mutating shot boxes, Focus Regions, or Shot Attention Path data.
- Turning shake off restores the accepted baseline.
- Build passes.

Manual verification:
- Test shake on `track`, `pushIn`, and `pushOut` shots.
- Confirm underlying camera placement remains unchanged when shake is disabled.
- Confirm text-heavy panels remain readable at low intensity.
- Confirm no shot boxes, Focus Regions, or Project JSON data are mutated.
- Run `npm.cmd run build`.

Historical note: T0074 has been implemented. The next recommended ticket is T0075 - Flash / Vignette / Motion Blur Preview Spike.

---

## T0075 - Flash / Vignette / Motion Blur Preview Spike

Ticket ID: T0075

Title: Flash / Vignette / Motion Blur Preview Spike

Goal: Prototype flash / impact pulse, vignette / tension dim, and cautious motion blur in browser preview as rendering-layer modifiers.

Status: Implemented as a browser-preview-only spike. `PreviewPlayer` now has local Flash, Vignette, and Blur controls. Flash is a short stage-level shot-start pulse, Vignette is a broad stage-level edge dim, and Blur is a cautious movement-phase image blur. All three effects are temporary rendering modifiers layered after normal camera placement. Project JSON schema/import/export, shot geometry, Focus Regions, Shot Attention Path data, canvas export, package files, AI, OCR, panel detection, audio, dependencies, and multi-page behavior were unchanged.

Dependencies:
- T0073
- T0074 recommended

Allowed areas:
- src/features/preview/ only if scoped by the implementation ticket
- docs/

Do not touch:
- Project JSON schema
- camera shot geometry ownership
- focus region ownership
- Shot Attention Path ownership
- motion role grammar
- export behavior unless explicitly scoped
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Keep all effects preview-only and experimental.
- Apply all effects after normal camera placement is resolved.
- Keep flash / impact pulse temporary and visual only.
- Keep vignette / tension dim stage-level or broad-shot-level, not Focus Region-shaped.
- Treat motion blur as cautious and avoid text-heavy or held moments.
- Preserve `track`, `pushIn`, and `pushOut` behavior underneath every modifier.
- Do not persist settings in Project JSON yet.

Non-goals:
- No export parity in this ticket.
- No Project JSON changes.
- No new motion roles.
- No punch-in grammar.
- No old reveal/lift/spotlight/zoom revival.

Acceptance criteria:
- Each effect can be evaluated independently in preview.
- Effect-off baseline is unchanged.
- Effects do not create new camera placement behavior.
- Build passes.

Manual verification:
- Test flash on an impact shot and confirm it does not act like a new `pushIn`.
- Test vignette on a dramatic shot and confirm it does not resemble old Focus Region masks.
- Test motion blur on fast movement and confirm held text remains readable.
- Confirm no shot boxes, Focus Regions, or Project JSON data are mutated.
- Run `npm.cmd run build`.

Historical note: T0075 was followed by T0075A - Special Effects Spike Acceptance Cleanup, which accepted only Shake and Impact Pulse for T0076.

---

## T0075A - Special Effects Spike Acceptance Cleanup

Ticket ID: T0075A

Title: Special Effects Spike Acceptance Cleanup

Goal: Record the preview-only special-effects spike decision and narrow the accepted MVP+ effect set before T0076.

Status: Implemented. Shake and Impact Pulse are the only accepted MVP+ effects for T0076. Vignette and current Blur are rejected as standalone user-facing MVP+ effects. The local Vignette and Blur preview toggles were removed from `PreviewPlayer`, and the local Flash preview toggle was renamed to Impact Pulse. Existing internal shot-to-shot travel veil blur remains accepted transition behavior and is not treated as a user-facing special effect. Project JSON schema/import/export, UI persistence, canvas export, camera placement behavior, old focus-effect grammar, package files, AI, OCR, panel detection, audio, dependencies, and multi-page behavior were unchanged.

Dependencies:
- T0074
- T0075

Allowed areas:
- src/features/preview/ for removing rejected local preview controls and renaming Flash to Impact Pulse
- docs/

Do not touch:
- Project JSON schema
- camera shot geometry ownership
- focus region ownership
- Shot Attention Path ownership
- motion role grammar
- canvas export
- UI persistence
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Accept Camera Shake.
- Accept Flash only as Impact Pulse.
- Reject Vignette as a standalone MVP+ user-facing effect.
- Reject current Blur as a standalone MVP+ user-facing effect.
- Keep existing internal transition/travel veil blur behavior if already present.
- Ensure T0076 persists only accepted effects: Shake and Impact Pulse.
- Do not revive old visual grammar or focus effects.
- Do not change camera placement behavior.

Non-goals:
- No Project JSON schema changes.
- No persisted effect UI.
- No canvas export changes.
- No new motion roles.
- No old reveal/lift/spotlight/zoom revival.

Acceptance criteria:
- Preview UI no longer exposes Vignette or Blur special-effect toggles.
- Preview UI exposes Impact Pulse instead of Flash.
- T0076 is scoped to Shake and Impact Pulse only.
- Build passes.

Manual verification:
- Confirm Preview controls include Shake and Impact Pulse.
- Confirm Preview controls do not include Vignette or Blur.
- Confirm Impact Pulse behaves like the previous short shot-start flash/pulse and does not move the camera.
- Confirm the accepted shot-to-shot travel veil still works as internal transition behavior.
- Confirm Project JSON export does not include effect fields.
- Confirm canvas export behavior is unchanged if checked.
- Run `npm.cmd run build`.

---

## T0076 - Shot Effect Model

Ticket ID: T0076

Title: Shot Effect Model

Goal: Add a narrow Project JSON model for accepted per-shot special effects only after preview spikes prove useful.

Status: Implemented. `CameraShot` now has optional `specialEffects` metadata with only accepted `shake` and `impactPulse` boolean flags. Project JSON export writes the field only when at least one accepted effect is enabled, and import accepts only true `shake` / `impactPulse` values. Missing, false, malformed, rejected, or empty effect data imports as effect-off. Preview UI remains local/unwired until T0077, and canvas export remains unchanged until T0078.

Dependencies:
- T0074
- T0075
- T0075A

Allowed areas:
- source model/import/export areas only when explicitly scoped
- docs/

Do not touch:
- motion role grammar
- camera shot geometry ownership
- focus region ownership
- Shot Attention Path ownership
- export parity unless explicitly scoped
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Persist only accepted effect choices or simple preset data.
- Persist only Shake and Impact Pulse as accepted MVP+ effects.
- Do not persist Vignette.
- Do not persist current Blur as a standalone user-facing special effect.
- Keep existing internal transition/travel veil blur behavior separate from user-facing special effects.
- Keep effect data separate from camera geometry and motion roles.
- Ensure missing effect data imports as effect off.
- Preserve old Project JSON compatibility.
- Do not create effect timelines or Focus Region-owned effect state.

Non-goals:
- No effect-heavy editor UI.
- No export parity unless separately scoped.
- No new motion roles.

Acceptance criteria:
- Project JSON can persist accepted shot effect settings without changing camera behavior.
- Imported projects without effect data behave exactly as before.
- Build passes.

Manual verification:
- Export/import projects with no effects and confirm unchanged behavior.
- Export/import projects with accepted effect settings and confirm settings restore.
- Confirm shot boxes, Focus Regions, and Shot Attention Paths are unchanged.
- Run `npm.cmd run build`.

Historical note: T0076 has been implemented. The next recommended ticket is T0077 - Simple Effect Presets UI.

---

## T0077 - Simple Effect Presets UI

Ticket ID: T0077

Title: Simple Effect Presets UI

Goal: Expose accepted special effects through preset-first controls rather than many sliders.

Status: Implemented. The selected Camera Shot inspector now exposes a per-shot Effect Preset selector with None, Shake, Impact Pulse, and Shake + Impact Pulse. The control writes only the accepted T0076 `specialEffects` flags, clears the field for None, does not expose Vignette or current Blur, and does not add sliders, keyframes, effect timelines, global defaults, AI assignment, export parity, or geometry/motion-role changes.

Dependencies:
- T0076

Allowed areas:
- src/features/editor/
- src/app/
- docs/

Do not touch:
- motion role grammar
- camera shot geometry ownership
- focus region ownership
- Shot Attention Path ownership
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Prefer preset-first controls using the accepted effect model.
- Scope initial user-facing persistence to None, Shake, Impact Pulse, and a combined Shake + Impact Pulse option if useful.
- Do not expose Vignette or current Blur as standalone user-facing effects.
- Keep controls per-shot unless a later ticket explicitly adds global defaults.
- Avoid advanced sliders until accepted parameter ranges are clear.
- Make effect-off easy and reliable.

Non-goals:
- No complex keyframe editor.
- No per-frame effect timeline.
- No segmentation-based controls.
- No AI-driven automatic effect assignment.

Acceptance criteria:
- Users can select simple effect presets without editing geometry or motion roles.
- Preset off restores baseline behavior.
- Build passes.

Manual verification:
- Select each preset on representative shots.
- Confirm presets do not mutate shot boxes, Focus Regions, or Shot Attention Paths.
- Confirm Project JSON import/export preserves accepted preset data if T0076 added persistence.
- Run `npm.cmd run build`.

---

## T0077A - Preview Uses Persisted Effect Presets

Ticket ID: T0077A

Title: Preview Uses Persisted Effect Presets

Goal: Make browser preview use the accepted per-shot effect presets selected in the inspector.

Status: Implemented. Browser preview now reads the active shot's persisted `specialEffects.shake` and `specialEffects.impactPulse` flags, and the old local preview-only Shake / Impact Pulse buttons were removed. Effects apply only during shot playback segments and remain visual modifiers layered after normal camera placement. Canvas export remains unchanged until T0078.

Dependencies:
- T0076
- T0077

Allowed areas:
- src/features/preview/
- docs/

Do not touch:
- motion role grammar
- camera shot geometry ownership
- focus region ownership
- Shot Attention Path ownership
- Project JSON schema/import/export unless a bug is discovered
- canvas export
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Browser preview should use persisted per-shot Shake and Impact Pulse settings.
- Remove or neutralize separate local preview toggles so there is one user-facing source of truth.
- Do not expose Vignette or current Blur as standalone user-facing effects.
- Preserve the accepted Shake and Impact Pulse visual behavior.
- Keep effects layered after normal camera placement is resolved.

Non-goals:
- No canvas export effect parity.
- No new special effects.
- No sliders, keyframes, or per-frame effect timeline.
- No new motion roles.

Acceptance criteria:
- A shot set to Shake shakes in browser preview without using a separate preview toggle.
- A shot set to Impact Pulse pulses in browser preview without using a separate preview toggle.
- A shot set to None shows the effect-off preview baseline.
- Build passes.

Manual verification:
- Select each Effect Preset on representative shots and preview in Auto mode.
- Confirm effects appear only on shots whose persisted preset enables them.
- Confirm None restores the preview baseline.
- Confirm Guided Page Enter / Exit do not receive per-shot effects.
- Confirm canvas export behavior is unchanged until T0078.
- Run `npm.cmd run build`.

---

## T0077B - Attention Path Effect Cues

Ticket ID: T0077B

Title: Attention Path Effect Cues

Goal: Let accepted effects fire on specific Shot Attention Path focus beats without making page-level Focus Regions own effect state.

Status: Implemented. `ShotAttentionPathItem` now supports optional `effectCues` metadata for accepted Shake and Impact Pulse cues. The selected Camera Shot inspector exposes Shake Cue and Impact Cue controls for each path item with Off, Once, and Repeat modes. Browser preview applies those cues after the matching attention beat nears focus arrival. Focus Regions remain page-level and effect-free. Canvas export remains unchanged until T0078.

Dependencies:
- T0076
- T0077
- T0077A

Allowed areas:
- src/lib/projectTypes.ts
- src/lib/projectImport.ts
- src/lib/projectExport.ts
- src/features/editor/
- src/features/preview/
- docs/

Do not touch:
- camera shot geometry ownership
- focus region ownership
- Shot Attention Path ownership rules
- motion role grammar
- canvas export
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Add per-path-item effect cues for accepted effects only: Shake and Impact Pulse.
- Support simple cue modes only: Off, Once, Repeat.
- Keep effect cue data on Shot Attention Path items, not Focus Regions.
- Browser preview should fire cue effects when the corresponding attention beat becomes active.
- Repeat mode should keep firing or applying the effect during the active beat.
- Preserve shot-level presets as coarse post-travel shot effects.

Non-goals:
- No canvas export parity.
- No new effects.
- No sliders, keyframes, or per-frame effect timeline.
- No Focus Region-owned effect state.
- No new motion roles.

Acceptance criteria:
- Users can assign Shake and Impact Pulse cues to individual Shot Attention Path items.
- Once cues fire when attention arrives at the active beat.
- Repeat cues stay active or pulse repeatedly after arrival while the beat is active.
- Project JSON import/export preserves accepted cue data and ignores malformed cue data.
- Build passes.

Manual verification:
- Create one shot with multiple Focus Regions in its Shot Attention Path.
- Set Impact Cue to Once on one path item and confirm preview pulses when attention reaches that item.
- Set Impact Cue to Repeat on another path item and confirm preview pulses repeatedly while that beat is active.
- Set Shake Cue to Once and Repeat on representative path items and confirm the cue is limited to the active beat.
- Confirm shot-level Impact Pulse does not flash during incoming travel from the previous shot.
- Export and import Project JSON and confirm cue controls restore.
- Confirm Focus Region records do not own or duplicate effect state.
- Confirm canvas export behavior is unchanged until T0078.
- Run `npm.cmd run build`.

---

## T0078 - Canvas Export Effect Parity

Ticket ID: T0078

Title: Canvas Export Effect Parity

Goal: Make canvas export reproduce accepted special effects closely enough to match browser preview behavior.

Status: Implemented. Canvas export now renders accepted shot-level Shake and Impact Pulse effects after incoming shot travel and carries Shot Attention Path `effectCues` into export attention anchors. Exported attention cues use the accepted attention-arrival timing for once and repeat modes. The export effect layer is applied after normal camera placement is resolved and preserves the effect-off baseline, export audio behavior, camera geometry, Focus Region ownership, Shot Attention Path ownership, and active motion role grammar.

Dependencies:
- T0076
- T0077
- T0077A
- T0077B recommended

Allowed areas:
- src/lib/
- docs/

Do not touch:
- motion role grammar
- camera shot geometry ownership
- focus region ownership
- Shot Attention Path ownership
- AI, OCR, panel detection, audio, dependencies, or multi-page behavior

Requirements:
- Render accepted shot-level effects after normal export camera placement is resolved. Implemented.
- Render accepted Shot Attention Path effect cues during the matching focus beat. Implemented.
- Match preview timing and perceived intensity closely enough for creator acceptance. Implemented for Shake and Impact Pulse.
- Preserve effect-off export baseline. Implemented.
- Preserve existing export audio behavior. Implemented.
- Avoid reviving old demoted visual grammar. Implemented.

Non-goals:
- No backend/FFmpeg export.
- No new production export architecture unless separately ticketed.
- No new motion roles.
- No segmentation-dependent animation.

Acceptance criteria:
- Export broadly matches preview for accepted special effects.
- Effect-off exports match the current accepted export baseline.
- Build passes.

Manual verification:
- Export effect-off baseline and compare to accepted current export behavior.
- Export shot-level Shake, Impact Pulse, and Shake + Impact Pulse treatments.
- Export attention-path Shake Cue and Impact Cue in Once and Repeat modes.
- Confirm effects stack on top of `track`, `pushIn`, and `pushOut`.
- Confirm text-heavy panels remain readable.
- Run `npm.cmd run build`.

---

## T0079 - AI Director Suggestions Planning

Ticket ID: T0079

Title: AI Director Suggestions Planning

Goal: Define the first AI phase as reviewable director-assistant suggestions, not automatic project generation.

Status: Implemented as documentation only in `docs/planning/AI_Director_Assistant_Roadmap.md`. T0080 later added a read-only mock AI Director Notes panel. T0079 itself did not implement AI provider calls, source behavior, Project JSON schema changes, preview behavior, export behavior, OCR, panel detection, audio editing, dependencies, or automatic project mutation.

Allowed areas:
- docs/

Requirements:
- Define what AI is allowed to suggest.
- Define what project data AI may read in the first phase.
- Define the suggestion output contract.
- Define safety boundaries: no automatic project mutation and no auto-creating Camera Shots, Focus Regions, or Shot Attention Paths yet.
- Define how suggestions relate to `track`, `pushIn`, `pushOut`, Shake, Impact Pulse, and cue timing.
- State that current effects support mood/timing and do not replace camera movement.
- State that audio/BGM/SFX suggestions come after director suggestions.
- Add manual verification expectations.

Non-goals:
- No AI provider integration.
- No source changes.
- No Project JSON schema changes.
- No automatic Camera Shot, Focus Region, or Shot Attention Path creation.
- No audio editing, fetching, downloading, or placement.

Acceptance criteria:
- The roadmap separates T0080 through T0084 into clear AI director-assistant tickets.
- The plan keeps manual accepted project data as the source of truth.
- The plan keeps the accepted camera grammar limited to `track`, `pushIn`, and `pushOut`.
- Build is not required because this is docs-only.

Manual verification:
- Review `docs/planning/AI_Director_Assistant_Roadmap.md`.
- Confirm `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/Manual_Verification_Guide.md` reference the AI director-assistant roadmap.
- Confirm T0080 is the next recommended implementation ticket.
- Confirm no source files changed.

---

## T0080 - AI Director Suggestions UI Spike

Ticket ID: T0080

Title: AI Director Suggestions UI Spike

Goal: Add a UI surface for showing AI-style directing suggestions without real AI provider integration.

Status: Implemented. The app now shows a Mock AI Director Notes panel in the inspector sidebar. It derives static suggestions from accepted Camera Shots and existing Shot Attention Path items, including mood, suggested motion role, suggested effect, cue timing, confidence, and reason. T0080 originally kept the panel read-only; T0081 later added explicit apply controls. The panel does not call a real AI provider.

Dependencies:
- T0079

Allowed areas:
- src/features/editor/ or an existing appropriate UI area
- src/app/ only if needed to pass mock suggestion state
- docs/

Requirements:
- Use mock/static suggestions first. Implemented.
- Show suggestions as review candidates, not accepted project data. Implemented.
- Each suggestion should include mood, suggested motion role, suggested effect, cue timing idea when relevant, and a short reason. Implemented.
- Suggestions may target existing Camera Shots or existing Shot Attention Path items. Implemented.
- Suggestions must be inspectable without mutating project data. Implemented.
- The UI must make it clear that suggestions are advisory. Implemented.

Non-goals:
- No real AI API.
- No provider configuration.
- No automatic project mutation.
- No accepting/applying suggestions yet unless separately scoped by T0081.
- No new Camera Shots, Focus Regions, or Shot Attention Paths created by AI.
- No audio suggestions yet.

Acceptance criteria:
- Users can view mock director suggestions in the app. Implemented.
- Existing manual editing remains available. Implemented.
- Project JSON export does not include unaccepted suggestions. Implemented by keeping the panel derived/read-only.
- Preview/export behavior remains based only on accepted project data. Implemented.
- Build passes.

Manual verification:
- Upload or import a project with at least one Camera Shot and one Shot Attention Path item.
- Open the suggestions UI and confirm mock suggestions appear.
- Confirm suggestions include mood, motion role, effect, cue timing when relevant, and reason.
- Inspect suggestions and confirm no Camera Shots, Focus Regions, Shot Attention Paths, effect settings, or timing fields change.
- Export Project JSON and confirm suggestions are not persisted.
- Run `npm.cmd run build`.

---

## T0081 - AI Suggestion Accept/Apply Spike

Ticket ID: T0081

Title: AI Suggestion Accept/Apply Spike

Goal: Allow selected AI-style director suggestions to be manually applied to existing project records through explicit user action.

Status: Implemented. Mock AI Director Notes now expose explicit Apply buttons. Shot-level applies update only existing shot `specialEffects`; path-item applies update only existing Shot Attention Path item `motionRole`, `effectCues`, and `effectCueTiming`. No new Camera Shots, Focus Regions, or Shot Attention Paths are created.

Dependencies:
- T0080

Allowed areas:
- source areas touched by T0080
- existing inspector/app state update paths needed for explicit apply actions
- docs/

Requirements:
- Apply only selected suggestions. Implemented.
- Apply only to existing Camera Shots, existing Shot Attention Path items, or existing accepted effect settings. Implemented.
- Keep every action explicit and visible before it changes accepted data. Implemented.
- Keep actions reversible through existing manual controls after apply. Implemented.
- Preserve Project JSON as accepted-state-only. Implemented.
- Validate suggested motion roles against `track`, `pushIn`, and `pushOut`. Implemented.
- Validate suggested effects against accepted Shake and Impact Pulse settings/cues only. Implemented.
- Validate cue timing against `early` and `arrival`. Implemented.

Non-goals:
- No automatic accept-all by default.
- No real AI API.
- No creation of new Camera Shots, Focus Regions, or Shot Attention Paths.
- No online audio fetching/downloading.
- No new motion roles.

Acceptance criteria:
- Applying a suggestion updates only the targeted existing accepted field. Implemented.
- Ignoring a suggestion leaves project data unchanged. Implemented.
- Manual controls can edit or undo the applied result using normal workflows. Implemented.
- Build passes.

Manual verification:
- Apply a suggested motion role to an existing Shot Attention Path item and confirm only that item changes.
- Apply a suggested Shake or Impact Pulse cue and confirm the accepted cue controls update.
- Apply a suggested cue timing and confirm the accepted Cue Timing control updates.
- Reject/ignore other suggestions and confirm they do not affect preview/export.
- Export/import Project JSON and confirm only accepted applied fields persist.
- Run `npm.cmd run build`.

---

## T0081A - AI Suggestion Target Binding Guardrails

Ticket ID: T0081A

Title: AI Suggestion Target Binding Guardrails

Goal: Repair T0081 behavior so AI/mock suggestions may apply only to valid existing project targets.

Status: Implemented. Shot-level suggestions apply only existing shot-level effect settings. Motion-role suggestions apply only to existing Shot Attention Path items whose referenced Focus Region still exists. Missing path items, missing Camera Shots, and missing Focus Region targets are blocked without mutating accepted project data.

Dependencies:
- T0080
- T0081

Allowed areas:
- source areas touched by T0080/T0081
- existing inspector/app state update paths needed for explicit apply actions
- docs/

Requirements:
- Generate path-item suggestions only from existing Shot Attention Path items on existing Camera Shots. Implemented.
- Require a valid existing Camera Shot, existing Shot Attention Path item, and existing referenced Focus Region before applying motion-role suggestions. Implemented.
- Show a blocked warning when the selected shot has no Shot Attention Path items. Implemented.
- Block path-item suggestions whose Focus Region target is missing or deleted. Implemented.
- Keep shot-level Shake / Impact Pulse suggestions available without Focus Regions. Implemented.
- Apply cue timing only when there is a valid shot-level effect or valid path-item cue target. Implemented.
- Keep suggested motion roles limited to `track`, `pushIn`, and `pushOut`. Implemented.
- Keep suggested effects limited to None, Shake, and Impact Pulse. Implemented.
- Keep cue timing limited to `early` and `arrival`. Implemented.
- Preserve manual inspector controls as the authoritative way to revise or undo applied results. Implemented.

Non-goals:
- No T0082 draft attention paths.
- No new Camera Shots.
- No new Focus Regions.
- No new Shot Attention Path items.
- No real AI provider/API calls.
- No OCR, panel detection, audio fetching, or online search.
- No preview/export camera behavior changes.
- No Project JSON schema changes.
- No new motion roles or effects.

Acceptance criteria:
- A shot with no Shot Attention Path may still receive shot-level effect suggestions. Implemented.
- A shot with no Shot Attention Path does not receive applicable motion-role Apply buttons. Implemented.
- A shot with valid Shot Attention Path items may receive path-item motion suggestions. Implemented.
- Applying a path-item suggestion updates only the existing targeted path item. Implemented.
- Missing or stale targets are blocked safely. Implemented.
- No random/default target selection creates motion. Implemented.
- Build passes.

Manual verification:
- Select a shot with no Focus Regions and no attention path; confirm only shot-level effect apply is available and the no-path warning appears.
- Select a shot with page-level Focus Regions but no Shot Attention Path items; confirm motion apply remains blocked until the path exists.
- Select a shot with valid Shot Attention Path items; apply a path-item suggestion and confirm only that existing item changes.
- Delete or import a project with a path item referencing a missing Focus Region; confirm the suggestion is blocked and cannot apply.
- Confirm shot-level Shake / Impact Pulse suggestions still apply without Focus Regions.
- Run `npm.cmd run build`.

---

## T0082 - AI Draft Attention Path Spike

Ticket ID: T0082

Title: AI Draft Attention Path Spike

Goal: Let AI-style logic suggest a Shot Attention Path from existing manual Focus Regions after the suggestion UI and apply flow are accepted.

Status: Implemented. The Suggestions panel now has a Draft AI Attention Path action that creates temporary path drafts for the selected existing Camera Shot using only existing manual Focus Regions. Draft items include proposed `track`, `pushIn`, or `pushOut` roles, duration-weight ideas, and reasons. Accepting the draft explicitly writes normal editable Shot Attention Path items to the existing target shot; rejecting it leaves accepted project data unchanged.

Dependencies:
- T0080
- T0081
- T0081A

Allowed areas:
- existing suggestion UI/app state areas
- existing Shot Attention Path update paths only for explicit acceptance
- docs/

Requirements:
- Use existing manual Focus Regions only. Implemented.
- Target an existing Camera Shot only. Implemented.
- Suggest an ordered Shot Attention Path with optional `track`, `pushIn`, or `pushOut` roles and duration-weight ideas. Implemented.
- Keep the draft temporary until explicit user acceptance. Implemented.
- Make missing or unsuitable Focus Regions a visible warning, not a reason to create new Focus Regions automatically. Implemented.
- Keep accepted project data unchanged until the user applies the draft. Implemented.

Non-goals:
- No AI-created Focus Regions.
- No AI-created Camera Shots.
- No real AI provider unless separately approved.
- No OCR, panel detection, or speech bubble detection.
- No new Project JSON suggestion persistence.

Acceptance criteria:
- A draft path can be inspected before acceptance. Implemented.
- Accepted draft path writes normal Shot Attention Path references to existing Focus Regions. Implemented.
- Rejected draft path leaves the existing path unchanged. Implemented.
- Build passes.

Manual verification:
- Create one Camera Shot and several manual Focus Regions.
- Generate a draft attention path and confirm it references only existing Focus Regions and shows proposed motion roles, duration weights, and reasons.
- Accept the draft and confirm it becomes normal editable Shot Attention Path data with the suggested roles and weights.
- Reject another draft and confirm the existing path remains unchanged.
- Confirm no Camera Shots or Focus Regions are created.
- Run `npm.cmd run build`.

---

## T0083 - AI Draft Shots/Focus Regions Planning

Ticket ID: T0083

Title: AI Draft Shots/Focus Regions Planning

Goal: Plan whether and how a later AI phase may suggest new Camera Shots and Focus Regions.

Status: Implemented as documentation only in `docs/planning/AI_Draft_Shots_Focus_Regions_Planning.md`. The plan allows only temporary reviewable Camera Shot and Focus Region suggestions, requires explicit inspect/accept/reject/edit workflow before accepted-state mutation, preserves current ownership rules, and records Project JSON/archive/provider/privacy open decisions before implementation.

Dependencies:
- T0082 recommended

Allowed areas:
- docs/planning/
- docs/

Requirements:
- Explore whether AI may later suggest new Camera Shots and Focus Regions. Implemented.
- Define review, accept, reject, edit, and stale-suggestion workflow. Implemented.
- Preserve Camera Shots as flexible page-level reading containers. Implemented.
- Preserve Focus Regions as reusable page-level attention targets. Implemented.
- Define Project JSON/archive compatibility questions before implementation. Implemented.
- Define privacy/copyright/provider-risk questions before any real AI image upload. Implemented.

Non-goals:
- No source changes.
- No AI provider integration.
- No production panel detection or OCR.
- No automatic creation of accepted Camera Shots or Focus Regions.

Acceptance criteria:
- Planning doc exists or is updated. Implemented.
- The plan clearly separates temporary suggestions from accepted project data. Implemented.
- The plan identifies unresolved schema/archive decisions. Implemented.
- Build is not required because this is docs-only.

Manual verification:
- Review the planning doc.
- Confirm it forbids automatic accepted-state mutation.
- Confirm it keeps manual editing as the source of truth.
- Confirm no source files changed.

---

## Completed Planning Ticket - T0084 Audio/BGM/SFX Suggestions Planning

Ticket ID: T0084

Title: Audio/BGM/SFX Suggestions Planning

Goal: Plan AI-assisted audio direction after shot mood, timing, and intent suggestions exist.

Dependencies:
- T0079
- T0080
- T0081
- T0081A
- T0082
- T0083

Allowed areas:
- docs/planning/
- docs/

Implemented changes:
- Added `docs/planning/Audio_BGM_SFX_Suggestions_Planning.md`.
- Planned BGM/SFX search terms, tone, pacing, timing ideas, confidence, warnings, and reasons.
- Tied sound suggestions to accepted shot mood, shot timing, motion intent, Shot Attention Path beats, and accepted effect cues.
- Kept suggestions advisory until explicit user action.
- Preserved existing uploaded BGM and SFX marker workflows as accepted project data.
- Defined target-binding rules for project-level, shot-level, and beat-level sound suggestions.
- Kept online fetching/downloading, audio generation, audio editing, automatic SFX placement, dialogue/narration, waveform editing, multitrack mixing, source changes, dependencies, preview/export changes, and Project JSON schema changes out of scope.

Acceptance criteria:
- Planning doc exists.
- The plan explains why audio suggestions follow AI director suggestions.
- The plan keeps accepted audio project data manual and explicit.
- Build is not required because this is docs-only.

Manual verification:
- Review `docs/planning/Audio_BGM_SFX_Suggestions_Planning.md`.
- Confirm it does not claim audio editing, fetching, downloading, or automatic placement exists.
- Confirm no source files changed.

Historical note: T0084 completed the originally scoped AI director-assistant roadmap through audio planning. T0085 has since reassessed that roadmap and recommended unified suggestion review planning next.

---

## Completed Planning Ticket - T0085 AI Director-Assistant Roadmap Reassessment

Ticket ID: T0085

Title: AI Director-Assistant Roadmap Reassessment

Goal: Reassess the completed T0079 through T0084 AI director-assistant branch before any real provider, automatic generation, or audio apply implementation.

Dependencies:
- T0079
- T0080
- T0081
- T0081A
- T0082
- T0083
- T0084

Allowed areas:
- docs/planning/
- docs/

Implemented changes:
- Added `docs/planning/AI_Director_Assistant_Roadmap_Reassessment.md`.
- Decided the next AI branch should remain mock/review UI work, not real provider integration.
- Recommended T0086 - Unified Suggestion Review Surface Planning.
- Identified unresolved prerequisites before real provider work: suggestion persistence, stale states, consent, validation, provider failure handling, provenance, audio apply boundaries, and edit-before-accept rules.
- Reaffirmed that automatic generation remains out of scope.
- Kept accepted project data as the source of truth.
- Kept source behavior, real AI provider calls, Project JSON schema changes, suggestion persistence, preview/export behavior, OCR, panel detection, dialogue/narration, audio editing/generation/fetching/downloading, automatic SFX placement, dependencies, and automatic accepted-state mutation out of scope.

Acceptance criteria:
- Planning doc exists.
- The plan chooses a conservative next branch before real provider work.
- The plan names the next recommended ticket.
- The plan keeps accepted project data manual and explicit.
- Build is not required because this is docs-only.

Manual verification:
- Review `docs/planning/AI_Director_Assistant_Roadmap_Reassessment.md`.
- Confirm it recommends T0086 - Unified Suggestion Review Surface Planning.
- Confirm it does not claim source behavior, provider calls, suggestion persistence, automatic generation, audio apply behavior, or Project JSON schema changes exist.
- Confirm no source files changed.

---

## Completed Planning Ticket - T0086 Unified Suggestion Review Surface Planning

Ticket ID: T0086

Title: Unified Suggestion Review Surface Planning

Goal: Plan one coherent review model for existing and future suggestion types before additional AI UI or provider work.

Dependencies:
- T0085

Allowed areas:
- docs/planning/
- docs/

Implemented changes:
- Added `docs/planning/Unified_Suggestion_Review_Surface_Planning.md`.
- Planned a unified suggestion review surface for director notes, draft attention paths, draft Camera Shot / Focus Region candidates, audio/BGM/SFX suggestions, and future vision/page-understanding suggestions.
- Explicitly noted that future vision/page-understanding suggestions are the real AI value and current JSON/mock notes are scaffolding.
- Covered page-understanding outputs including panels, reading order, characters/faces, speech/detail/action regions, mood, shot candidates, Focus Region candidates, motion intent, and audio direction.
- Defined common suggestion fields: type, target, proposed value, reason, confidence, warning, stale/blocked status, source, and created context.
- Defined grouping by project, page-level region, Camera Shot, Shot Attention Path beat, audio target, warning status, and future AI vision finding type.
- Defined inspect, copy, apply, accept, edit, reject, discard, and blocked actions by suggestion type.
- Defined stale-state handling when source image, shots, Focus Regions, path items, effects, audio markers, geometry, or project context changes.
- Kept accepted project data clearly separated from temporary suggestions.
- Kept Project JSON suggestion persistence, source changes, real AI provider calls, provider/API code, preview/export behavior, automatic generation, audio fetching/downloading, and automatic SFX placement out of scope.

Acceptance criteria:
- Planning doc exists. Implemented.
- The plan covers all current and planned suggestion families. Implemented.
- The plan defines target binding and stale/blocked behavior. Implemented.
- The plan identifies future vision/page understanding as the actual AI value layer. Implemented.
- Build is not required because this is docs-only.

Manual verification:
- Review `docs/planning/Unified_Suggestion_Review_Surface_Planning.md`.
- Confirm it keeps suggestions temporary and accepted project data explicit.
- Confirm no source files changed.

Historical note: T0087 has since planned the AI vision/page-understanding response contract, and T0088 has since planned the DynamicManga director rulebook / knowledge pack.

---

## Completed Planning Ticket - T0087 AI Vision Page Understanding Contract Planning

Ticket ID: T0087

Title: AI Vision Page Understanding Contract Planning

Goal: Plan the future AI vision/page-understanding response contract before provider integration or UI implementation.

Dependencies:
- T0086

Allowed areas:
- docs/planning/
- docs/

Implemented changes:
- Added `docs/planning/AI_Vision_Page_Understanding_Contract_Planning.md`.
- Defined a provider-neutral response envelope for future AI vision/page-understanding suggestions.
- Defined target types for page, panel candidates, reading order, characters/faces, speech/detail/action regions, shot candidates, Focus Region candidates, Shot Attention Path/motion intent, director notes, audio direction, and warnings.
- Defined suggestion record fields for IDs, targets, geometry, labels, descriptions, confidence, reasons, warnings, evidence, dependencies, proposed actions, blocked reasons, and stale checks.
- Defined confidence normalization, warning categories, stale/blocked rules, validation and normalization needs, consent/provider/privacy/copyright notes, and failure states.
- Kept all outputs temporary and reviewable until explicit user action.
- Kept accepted project data as the source of truth.
- Left room for a later DynamicManga/article-derived director rulebook and a later AI budget/provider decision gate.
- Kept source changes, real provider/API code, Project JSON schema changes, suggestion persistence, preview/export behavior changes, and automatic generation out of scope.

Acceptance criteria:
- Planning doc exists. Implemented.
- The plan defines a provider-neutral AI vision response contract. Implemented.
- The plan keeps vision results temporary and reviewable. Implemented.
- The plan identifies DynamicManga rulebook and budget/provider decision gates as later work. Implemented.
- Build is not required because this is docs-only.

Manual verification:
- Review `docs/planning/AI_Vision_Page_Understanding_Contract_Planning.md`.
- Confirm no source files changed.

Historical note: T0088 has since planned the DynamicManga director rulebook / knowledge pack and recommended T0089 - AI Budget / Provider Decision Gate Planning.

---

## Completed Planning Ticket - T0088 DynamicManga Director Rulebook / Knowledge Pack Planning

Ticket ID: T0088

Title: DynamicManga Director Rulebook / Knowledge Pack Planning

Goal: Plan a director knowledge layer that translates page-understanding evidence into cinematic guidance before runtime AI/provider implementation.

Dependencies:
- T0087

Allowed areas:
- docs/planning/
- docs/

Requirements:
- Plan a DynamicManga/article-derived director rulebook or knowledge pack.
- Define guidance for preserving page context, reading order, action emphasis, speech-heavy pacing, and readable camera movement.
- Map page-understanding evidence to `track`, `pushIn`, `pushOut`, timing, mood, and audio direction suggestions.
- Keep accepted project data as the source of truth.
- Keep all AI outputs temporary and reviewable.

Implemented changes:
- Added `docs/planning/DynamicManga_Director_Rulebook_Knowledge_Pack_Planning.md`.
- Defined a versioned knowledge-pack shape with source references, rule families, evidence inputs, suggestion outputs, guardrails, confidence influence, and rule IDs.
- Defined rule families for page context preservation, reading order, speech-heavy pacing, action emphasis, character/reaction direction, detail/reveal intent, motion grammar, mood/effects, and audio direction.
- Mapped normalized page-understanding evidence to temporary suggestions for `track`, `pushIn`, `pushOut`, timing, mood, effects, Camera Shots, Focus Regions, Shot Attention Paths, and audio direction.
- Reaffirmed accepted project data as the source of truth and all AI/rulebook outputs as temporary reviewable suggestions.
- Left provider/API work, real AI calls, Project JSON schema changes, suggestion persistence, preview/export behavior, automatic generation, OCR/panel/face runtime, audio generation, and automatic SFX placement out of scope.

Non-goals:
- No source changes.
- No provider/API code.
- No real AI calls.
- No Project JSON schema changes.
- No suggestion persistence.
- No automatic generation.

Acceptance criteria:
- Planning doc exists. Implemented.
- The plan defines how director knowledge should guide future AI suggestions. Implemented.
- Build is not required because this is docs-only.

Manual verification:
- Review `docs/planning/DynamicManga_Director_Rulebook_Knowledge_Pack_Planning.md`.
- Confirm no source files changed.

Historical note: T0090 has since implemented the real AI page-understanding spike and recommended T0091 - AI Analysis Validation / Review Hardening.

---

## Completed Planning Ticket - T0089 AI Budget / Provider Decision Gate Planning

Ticket ID: T0089

Title: AI Budget / Provider Decision Gate Planning

Goal: Plan provider, budget, privacy, consent, latency, and failure-handling constraints before any real AI API integration.

Dependencies:
- T0088

Allowed areas:
- docs/planning/
- docs/

Requirements:
- Plan the decision gate for real AI provider/API integration.
- Define provider selection criteria, expected image/token costs, latency limits, cancellation, retry, rate-limit, and failure-state requirements.
- Define consent, privacy, copyright, data retention, and provider disclosure requirements before sending comic page images to any provider.
- Keep accepted project data as the source of truth.
- Keep all AI outputs temporary and reviewable.

Implemented changes:
- Added `docs/planning/AI_Budget_Provider_Decision_Gate_Planning.md`.
- Defined go, go-with-limits, and no-go outcomes before real provider/API implementation.
- Planned provider selection criteria, budget constraints, latency/UX limits, consent, privacy, copyright, data retention, request boundaries, cancellation, retry, rate limits, and failure states.
- Defined a go/no-go checklist for later provider/API implementation.
- Reaffirmed accepted project data as the source of truth and all AI outputs as temporary reviewable suggestions.
- Recommended T0090 - Real AI Page Understanding Spike as the next ticket.

Non-goals:
- No source changes.
- No provider/API code.
- No real AI calls.
- No Project JSON schema changes.
- No suggestion persistence.
- No automatic generation.

Acceptance criteria:
- Planning doc exists. Implemented.
- The plan defines go/no-go criteria before provider/API implementation. Implemented.
- Build is not required because this is docs-only.

Manual verification:
- Review the planning doc.
- Confirm no source files changed.

Historical note: T0090 has since implemented the real AI page-understanding spike and recommended T0091 - AI Analysis Validation / Review Hardening.

---

## Completed Implementation Ticket - T0090 Real AI Page Understanding Spike

Ticket ID: T0090

Title: Real AI Page Understanding Spike

Goal: Add the first real AI page-understanding flow for the currently uploaded comic page through a safe local provider proxy.

Dependencies:
- T0089

Allowed areas:
- docs/
- src/
- vite.config.ts
- tsconfig.node.json

Requirements:
- Add an `Analyze page with AI` action in the existing AI/suggestion area. Implemented.
- Send the currently uploaded source image through a safe local provider/proxy path. Implemented.
- Do not expose `OPENAI_API_KEY` in Vite client code or committed files. Implemented.
- Resize/compress the uploaded page before sending it to the provider proxy. Implemented.
- Use a low-cost vision-capable model by default. Implemented with `gpt-4.1-mini`.
- Request concise structured JSON based on the T0087 page-understanding contract. Implemented.
- Set max output tokens. Implemented.
- Log token usage/cost when provider usage is returned. Implemented in the local server console.
- Return temporary analysis results only. Implemented.
- Display panels, reading order, character/face regions, speech/detail/action regions, mood, confidence, warnings, and provider errors in a simple review UI. Implemented.
- Keep accepted project data as the source of truth. Implemented.
- Do not run repeated automatic analysis calls. Implemented; analysis runs only from the explicit button.

Implemented changes:
- Added shared page-understanding request/result types in `src/lib/aiPageUnderstanding.ts`.
- Added a Vite local `/api/analyze-page` proxy that reads `OPENAI_API_KEY` server-side and calls OpenAI Responses API.
- Added optional server-side outbound proxy support for local networks that require V2Ray or another HTTP proxy, using `AI_HTTP_PROXY`, `HTTPS_PROXY`, or `HTTP_PROXY`, while keeping direct fetch as the default.
- Confirmed the OpenAI Responses endpoint is exactly `https://api.openai.com/v1/responses`.
- Added a bounded client-side JPEG compression path for uploaded pages before analysis.
- Added an `Analyze page with AI` button to the existing Suggestions panel.
- Added read-only AI page-understanding review output for page summary, mood, reading order, region groups, warnings, provider errors, and token usage/cost.
- Cleared analysis output on image/project replacement to avoid stale review data.
- Added compact sidebar styles for AI analysis review cards.
- Updated `tsconfig.node.json` so Vite config can type-check fetch/TextDecoder usage without adding dependencies.

Non-goals:
- No automatic Camera Shot creation.
- No automatic Focus Region creation.
- No automatic Shot Attention Path creation.
- No Project JSON schema changes.
- No suggestion persistence.
- No export/preview behavior changes.
- No audio generation/fetching.
- No automatic SFX placement.
- No dialogue/narration.
- No multi-provider UI.
- No automatic generation.

Acceptance criteria:
- `Analyze page with AI` sends a compressed uploaded page to the local provider proxy. Implemented.
- The OpenAI API key is used only server-side by the local proxy. Implemented.
- The response is shown as temporary review output only. Implemented.
- Accepted project data does not mutate automatically. Implemented.
- Build passes.

Manual verification:
- Add `OPENAI_API_KEY` to `.env.local` locally and start the normal Vite dev server.
- If local provider calls time out, add `AI_HTTP_PROXY=http://127.0.0.1:10808` to `.env.local`; `HTTPS_PROXY` and `HTTP_PROXY` are also accepted fallbacks. Restart the Vite dev server after changing env.
- Upload a comic page.
- Click `Analyze page with AI`.
- Confirm a temporary AI page-understanding review appears with page summary, mood, reading order, panels, character/face regions, speech/detail/action/detail regions, confidence, warnings, or provider error.
- Confirm timeout, missing-key, and provider-response errors are readable and do not expose `OPENAI_API_KEY`.
- Confirm Camera Shots, Focus Regions, Shot Attention Paths, Project JSON export, preview, export, audio, and SFX markers do not change merely from analysis.
- Confirm clicking the action once makes one request and no repeated automatic analysis starts.
- Run `npm.cmd run build`.

Historical note: T0090 recommends T0091 - AI Analysis Validation / Review Hardening as the next ticket.

---

## T0091 - AI Analysis Validation / Review Hardening

Ticket ID: T0091

Title: AI Analysis Validation / Review Hardening

Status: Implemented. Provider page-understanding responses are normalized before rendering, malformed values are made safe, unusable geometry is skipped, partially out-of-bounds geometry is clamped with warnings, stale image metadata is flagged, validation warnings are shown in the AI Review UI, and Page Understanding details are shown as compact inspectable flashcards. Accepted project data remains unchanged by analysis.

Goal: Harden the real AI page-understanding review flow before any accepted-state apply, persistence, or automation behavior.

Dependencies:
- T0090

Allowed areas:
- src/
- docs/

Requirements:
- Validate provider JSON more defensively before rendering.
- Clamp or reject out-of-bounds provider geometry.
- Mark malformed, partial, stale, or unsupported provider output clearly in the review UI.
- Keep AI analysis results temporary and review-only.
- Keep accepted project data as the source of truth.

Non-goals:
- No automatic Camera Shot creation.
- No automatic Focus Region creation.
- No automatic Shot Attention Path creation.
- No Project JSON suggestion persistence.
- No export/preview behavior changes.
- No audio generation/fetching.
- No automatic SFX placement.
- No dialogue/narration.

Acceptance criteria:
- Malformed or partial provider output cannot crash the review UI.
- Out-of-bounds geometry is blocked or visibly warned.
- Build passes.

Manual verification:
- Analyze a page and confirm normal provider output still renders.
- Simulate malformed/partial provider output if a local fixture is available.
- Confirm accepted project data remains unchanged by analysis.
- Run `npm.cmd run build`.

Historical note: T0091 has been implemented, T0092 has since added card-to-page highlighting, T0093 has since added provider-backed director suggestion drafts, T0094 through T0097 have since completed and hardened the detail-correction bridge, T0098 has since planned the AI director suggestion contract, T0099 has since added the AI camera suggestion review surface, T0100 has since added the draft-motion bridge, T0100A has since stabilized Track v2 motion, T0101 has since added the practice fixture/evaluation checklist, T0102 has since tuned motion naturalness, T0102A has since added AI camera suggestion density guardrails, T0103 has since planned advisory audio/SFX notes, T0104 has since added the read-only audio notes UI, T0105 has since planned audio apply guardrails, T0106 has since planned Director Rulebook v1, T0106A has since repaired track-chain entry continuity, T0107 has since integrated the rulebook at runtime, T0108 has since completed the rulebook evaluation pass, T0109 has since tuned rulebook evaluation findings, T0110 has since recorded the provider evaluation-run limitation, and T0111 has since completed the provider-route practice run. T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.

---

## T0092 - AI Page Understanding Card-to-Page Highlighting

Ticket ID: T0092

Title: AI Page Understanding Card-to-Page Highlighting

Status: Implemented. Hovering, focusing, or clicking a normalized AI Page Understanding flashcard highlights that card's explicit analyzed-image geometry on the editor canvas with a separate review-only SVG overlay. The highlight is visually distinct from accepted Camera Shots, accepted Focus Regions, and temporary helper suggestions. Accepted project data remains unchanged. The provider route supports `OPENAI_AI_PAGE_MODEL` for GPT-5.4 test drives, uses a strict app schema with region-level `geometrySpace: "analyzedImage"`, and has a larger output-token budget plus clearer incomplete JSON diagnostics.

Dependencies:
- T0091

Allowed areas:
- src/
- docs/

Requirements:
- Let a user visually relate normalized AI Page Understanding cards to their source-image geometry.
- Highlight the selected or hovered AI card's validated geometry on the page viewer.
- Use review-only overlays that are visually distinct from accepted Camera Shots and Focus Regions.
- Keep AI Page Understanding output temporary and review-only.
- Keep accepted project data as the source of truth.

Non-goals:
- No automatic Camera Shot creation.
- No automatic Focus Region creation.
- No automatic Shot Attention Path creation.
- No Project JSON suggestion persistence.
- No accepted-state apply behavior.
- No preview/export behavior changes.
- No audio generation/fetching.
- No automatic SFX placement.
- No dialogue/narration.
- No OCR or panel-detection runtime.

Acceptance criteria:
- Hovering or selecting an AI Page Understanding card highlights its explicit analyzed-image geometry.
- Highlight overlays do not look like accepted Camera Shots or Focus Regions.
- Build passes.

Manual verification:
- Add `OPENAI_AI_PAGE_MODEL=gpt-5.4` to `.env.local` for the GPT-5.4 model-quality test drive, then restart the Vite dev server.
- Analyze a page and expand Page Understanding.
- Confirm the provider log and latest-analysis status show the selected model.
- Confirm the returned JSON follows the app schema: top-level `mood`, string confidence enums, region-level `geometrySpace: "analyzedImage"`, and no nested `geometry.geometrySpace`.
- Hover or select panel cards first and confirm the SVG highlight follows the card geometry at zoom 1 and after editor zoom/pan.
- Then check character, speech, detail, and action cards.
- Confirm no accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, or SFX state changes.
- Run `npm.cmd run build`.

Historical note: T0092 has been implemented, T0093 has since added provider-backed director suggestion drafts, T0094 through T0097 have since completed and hardened the detail-correction bridge, T0098 has since planned the AI director suggestion contract, T0099 has since added the AI camera suggestion review surface, T0100 has since added the draft-motion bridge, T0100A has since stabilized Track v2 motion, T0101 has since added the practice fixture/evaluation checklist, T0102 has since tuned motion naturalness, T0102A has since added AI camera suggestion density guardrails, T0103 has since planned advisory audio/SFX notes, T0104 has since added the read-only audio notes UI, T0105 has since planned audio apply guardrails, T0106 has since planned Director Rulebook v1, T0106A has since repaired track-chain entry continuity, T0107 has since integrated the rulebook at runtime, T0108 has since completed the rulebook evaluation pass, T0109 has since tuned rulebook evaluation findings, T0110 has since recorded the provider evaluation-run limitation, and T0111 has since completed the provider-route practice run. T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.

---

## T0093 - AI Director Suggestion Drafts from Page Understanding

Ticket ID: T0093

Title: AI Director Suggestion Drafts from Page Understanding

Status: Implemented. Provider-backed AI Director Suggestions can now be generated from the existing normalized AI page-understanding result through a separate local route. Suggestions are temporary review cards grouped by AI panel, use only `track`, `pushIn`, and `pushOut`, reference known AI panel/region ids where available, and keep accepted project data unchanged.

Dependencies:
- T0092

Allowed areas:
- src/
- docs/
- vite.config.ts

Requirements:
- Use the existing AI page-understanding result as semantic evidence for provider AI Director Suggestions.
- Teach the provider the accepted camera grammar: `track`, `pushIn`, and `pushOut`.
- Encode panning/track focus-shift rules, pushIn emotion/reaction rules, pushOut context rules, reading-order ROI rules, action speed rules, and calm/exposition pacing rules.
- Generate temporary suggestion cards with id, target panel id/label, panel summary, mood/motion interpretation, suggested camera motion, plain-language attention path, referenced AI region ids where possible, speed/timing, optional SFX/BGM note, confidence, reason, and warning.
- Use panel boxes first and treat character/speech/detail/action geometry as approximate hints.
- Keep provider AI Director Suggestions separate from local Director Notes and helper drafts.
- Keep accepted project data as the source of truth.

Non-goals:
- No automatic Camera Shot creation.
- No automatic Focus Region creation.
- No automatic Shot Attention Path creation.
- No Project JSON suggestion persistence.
- No accepted-state apply behavior.
- No preview/export behavior changes.
- No audio generation/fetching.
- No automatic SFX placement.
- No dialogue/narration.
- No OCR or panel-detection runtime.

Acceptance criteria:
- AI Review exposes a separate `AI Director Suggestions` section.
- Suggestions can be generated only after usable AI page understanding exists.
- Suggestions use only `track`, `pushIn`, or `pushOut`.
- Suggestion cards reference known AI panel/region ids where available.
- No accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, or SFX markers change from generation or review.
- `npm.cmd run build` passes.

Manual verification:
- Set `OPENAI_AI_PAGE_MODEL=gpt-5.4`.
- Upload the Garfield test page.
- Run AI page understanding.
- Generate AI Director Suggestions.
- Confirm suggestions use only `track`, `pushIn`, and `pushOut`.
- Confirm cards reference panels/regions from the AI understanding result.
- Confirm no project data changes.
- Confirm suggestions remain useful even when some region boxes are approximate.
- Run `npm.cmd run build`.

---

## T0097 - Detail Workflow Hardening

Ticket ID: T0097

Title: Detail Workflow Hardening

Status: Implemented.

Dependencies:
- T0096

Goal: Harden the corrected detail-highlight workflow before using accepted details as reliable AI director inputs.

Implemented changes:
- Accepted detail highlight geometry is normalized through source-image bounds when created, edited numerically, or updated from the canvas.
- Numeric detail `x`, `y`, `width`, and `height` edits now show a validation message when invalid input is ignored or an out-of-bounds value is clamped.
- Accepted AI detail suggestions and rejected AI detail suggestions are hidden by detail geometry fingerprint, so rerunning page understanding does not immediately resurrect the same accepted/rejected detail when the provider returns a new transient region id.
- Accepted project detail cards now use a distinct accepted-detail badge and source-of-truth note, while AI detail cards remain suggestion cards with the existing confidence-based DETAIL badge behavior.
- Accepted/manual detail highlights remain project-state source-of-truth data; raw AI suggestion data still does not overwrite user edits.

Allowed areas:
- src/
- docs/

Requirements:
- Clamp manual and numeric detail geometry edits to source image bounds.
- Add validation messages for invalid detail `x`, `y`, `width`, and `height` edits.
- Improve stale AI detail suggestion handling after AI page-understanding reruns.
- Polish the UI distinction between accepted/manual detail highlights and AI detail suggestions.
- Preserve accepted/manual detail highlights as project-state source of truth.

Non-goals:
- No AI camera suggestion generation.
- No automatic Camera Shot creation.
- No automatic Focus Region creation beyond explicit user accepted/detail workflows.
- No automatic Shot Attention Path creation.
- No preview/export motion behavior changes.
- No audio/SFX behavior changes.

Acceptance criteria:
- Invalid detail geometry edits cannot move highlights outside the source image or create zero-area details.
- Users can tell accepted/manual details from AI suggestions at a glance.
- AI reruns do not overwrite accepted/manual detail edits.
- `npm.cmd run build` passes.

Manual verification:
- Upload a page, create accepted detail highlights, edit numeric geometry, and confirm bounds are enforced.
- Run AI page understanding, accept/reject details, rerun AI page understanding, and confirm accepted/manual detail data remains unchanged.
- Run `npm.cmd run build`.

Historical note: T0097 has been implemented, T0098 has since planned the AI director suggestion contract, T0099 has since added the AI camera suggestion review surface, T0100 has since added the draft-motion bridge, T0100A has since stabilized Track v2 motion, T0101 has since added the practice fixture/evaluation checklist, T0102 has since tuned motion naturalness, T0102A has since added AI camera suggestion density guardrails, T0103 has since planned advisory audio/SFX notes, T0104 has since added the read-only audio notes UI, T0105 has since planned audio apply guardrails, T0106 has since planned Director Rulebook v1, T0106A has since repaired track-chain entry continuity, T0107 has since integrated the rulebook at runtime, T0108 has since completed the rulebook evaluation pass, T0109 has since tuned rulebook evaluation findings, T0110 has since recorded the provider evaluation-run limitation, and T0111 has since completed the provider-route practice run. T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.

---

## T0098 - AI Director Suggestion Contract Planning

Ticket ID: T0098

Title: AI Director Suggestion Contract Planning

Status: Implemented.

Dependencies:
- T0097

Goal: Define the corrected page-understanding inputs and structured AI camera suggestion output before adding a review surface for camera suggestions.

Implemented changes:
- Added `docs/planning/AI_Director_Suggestion_Contract_Planning.md`.
- Defined accepted corrected inputs, normalized AI page-understanding inputs, and derived director context as separate input layers.
- Specified that accepted corrected project data, especially accepted detail highlights, is preferred over raw AI region guesses.
- Defined a temporary AI director suggestion envelope for future validation and review.
- Defined camera suggestion record fields for target references, supporting targets, movement role, timing hint, composition hint, reason, confidence, warnings, validation, review action, and review status.
- Limited movement suggestions to the accepted camera grammar: `track`, `pushIn`, and `pushOut`.
- Defined stale-state, blocked-state, target-binding, duplicate, geometry, and unsupported-field validation rules.
- Preserved review-only behavior: no source behavior changes, provider route changes, suggestion persistence, automatic Camera Shot / Focus Region / Shot Attention Path creation, draft motion creation, Project JSON changes, preview/export changes, audio/SFX behavior changes, OCR, panel detection, dependencies, or accepted project mutation.

Allowed areas:
- docs/

Requirements:
- Define how corrected panels, characters, dialogue, and accepted detail highlights feed AI director suggestions.
- Define structured camera suggestion output fields: target panel/detail/character, movement role, timing hint, reason, confidence, and review status.
- Define stale-state, target-binding, and validation rules for suggestions tied to corrected page-understanding data.
- State that AI suggestions do not overwrite accepted project data.
- State that accepted/manual corrected page-understanding data is preferred over raw AI region guesses.

Non-goals:
- No source behavior changes.
- No provider route changes.
- No suggestion persistence.
- No automatic Camera Shot, Focus Region, or Shot Attention Path creation.
- No draft motion creation.

Acceptance criteria:
- The contract clearly separates raw AI page-understanding suggestions, corrected accepted detail data, and future camera suggestions.
- The contract preserves manual editing control and project data ownership.
- Build is not required because this is docs-only.

Manual verification:
- Review the planning text and confirm it defines inputs, output fields, stale rules, and accepted-data boundaries.
- Confirm no source files changed.

Historical note: T0098, T0099, T0100, T0100A, T0101, T0102, T0102A, T0103, T0104, T0105, T0106, T0106A, and T0107 have been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0099 - AI Camera Suggestion Review Surface

Ticket ID: T0099

Title: AI Camera Suggestion Review Surface

Status: Implemented.

Dependencies:
- T0098

Goal: Add a review UI for AI camera suggestions while keeping suggestions separate from accepted project objects.

Implemented changes:
- Renamed the provider-backed review section to `AI Camera Suggestions`.
- Added temporary in-memory camera suggestion review drafts derived from provider AI Director Suggestions.
- Added review cards grouped by AI panel with target reference, supporting target references, movement role, timing hint, confidence, reason, validation warnings, and review status.
- Added inspect controls that link AI panel/character/speech/detail/action targets back to the existing AI page-understanding highlight and accepted detail targets back to accepted detail selection.
- Added edit controls for temporary movement role, timing hint, and reason.
- Added Mark Accepted and Reject review actions that only update temporary review-card state and do not create Camera Shots, Focus Regions, Shot Attention Paths, or draft motion.
- Added stale/blocked validation for stale page understanding, missing AI target regions, missing usable target, and unsupported movement roles.
- Preserved the existing provider route and kept accepted project data, Project JSON, preview, export, audio, and SFX behavior unchanged.

Allowed areas:
- src/
- docs/
- vite.config.ts only if a narrow provider route is needed

Requirements:
- Add a review UI for AI camera suggestions.
- Let users inspect, accept, reject, or edit suggestions.
- Link suggestions back to panels, characters, dialogue regions, and accepted detail highlights when available.
- Keep suggestions review-only until explicit user action.
- Show confidence, reason, target references, stale/blocked state, and edited draft values.

Non-goals:
- No automatic Camera Shot creation.
- No automatic Focus Region creation.
- No automatic Shot Attention Path creation.
- No draft motion creation yet.
- No preview/export behavior changes.
- No audio/SFX behavior changes.

Acceptance criteria:
- Users can review AI camera suggestions without accepted project data changing.
- Suggestion cards link back to corrected page-understanding targets where possible.
- Rejected suggestions are hidden or marked without deleting accepted project data.
- `npm.cmd run build` passes.

Manual verification:
- Run AI page understanding, correct detail highlights, generate/review camera suggestions, inspect linked targets, edit/reject suggestions, and confirm accepted project data remains unchanged.
- Run `npm.cmd run build`.

Historical note: T0099, T0100, T0100A, T0101, T0102, T0102A, T0103, T0104, T0105, T0106, T0106A, T0107, T0112, T0112A, and T0099A have been implemented. Use the current status section for the next recommended ticket.

---

## T0099A - AI Camera Suggestion UI Rework

Ticket ID: T0099A

Title: AI Camera Suggestion UI Rework / Responsive Simplification Pass

Status: Implemented.

Dependencies:
- T0100

Goal: Rework the AI Camera Suggestions review UI after the draft-motion flow has had manual testing.

Implemented changes:
- Added a compact workflow strip inside AI Review that separates AI Page Understanding evidence, AI Camera Suggestions, Draft Motion helpers, and read-only Audio Notes.
- Wrapped AI Page Understanding in an explicit raw-evidence section and kept AI Camera Suggestions in a separate temporary camera-suggestion section.
- Reworked AI Camera Suggestion cards with shorter status labels, compact summary metadata, short `Draft` / `Reject` actions, and longer target/reason/warning details behind Inspect.
- Split Draft Motion helpers out of the generic temporary helper list into a distinct temporary Draft Motion Helpers section with `Accept Draft` and `Reject Draft` actions.
- Kept Audio Notes visually separate and documented as read-only advice.
- Updated helper copy to clarify that camera suggestions and Draft Motion are temporary review data and accepted project objects are created only after explicit Draft Motion acceptance.
- Preserved inspect/highlight behavior by keeping the existing target-inspection callbacks and accepted detail selection paths.
- Added the responsive simplification pass after browser screenshots showed narrow-card problems: summary tiles are now compact count pills, section labels are short, the latest-analysis line is compact, camera cards show only title/status/motion/short reason/actions by default, long details are behind Inspect, and action rows wrap without shrinking buttons into unreadable fragments.
- Removed narrow equal-column pressure and normal-word splitting from the AI Review card/pill styles so labels like Camera, Drafts, and Draft do not split into letter fragments at the current sidebar width.

Non-goals:
- No provider behavior changes.
- No project data model changes.
- No automatic accepted-state mutation.
- No Project JSON schema changes.
- No preview/export behavior changes.
- No motion role, rulebook, OCR/panel detection, or audio apply behavior changes.

Verification:
- `npm.cmd run build` passes.
- Browser manual verification should follow `docs/Manual_Verification_Guide.md` for T0099A.

---

## T0100 - Accepted Suggestion to Draft Motion

Ticket ID: T0100

Title: Accepted Suggestion to Draft Motion

Status: Implemented.

Dependencies:
- T0099

Goal: Convert explicitly accepted camera suggestions into reviewable draft motion using existing project models.

Implemented changes:
- Added a bundled temporary `draftMotion` suggestion type that can hold one proposed Camera Shot, draft Focus Regions, and draft Shot Attention Path items together.
- AI Camera Suggestion targets now carry source-image geometry so accepted detail highlights and AI page-understanding targets can seed draft motion.
- `Create Draft Motion` on an AI Camera Suggestion creates a temporary Draft Motion helper suggestion instead of directly writing accepted project data.
- Blocked, stale, rejected, and already-drafted AI camera suggestions cannot create duplicate draft motion.
- Draft Motion suggestions render temporary shot/focus overlays on the canvas and summarize the proposed shot, focus count, path count, timing, and motion roles.
- Accepting a Draft Motion helper suggestion explicitly creates normal editable Camera Shot, Focus Region, and Shot Attention Path records with remapped stable project ids.
- Preserved manual review control: draft motion is visible and rejectable before accepted project data changes.

Allowed areas:
- src/
- docs/

Requirements:
- Accepting a camera suggestion can create draft Camera Shots, Focus Regions, and Shot Attention Paths using existing project models.
- Draft motion remains reviewable before becoming final accepted project data.
- Preserve manual editing control for every generated shot, region, and attention path.
- Keep target binding to corrected panels, characters, dialogue regions, and accepted detail highlights where available.
- Make blocked/stale suggestions non-applicable until regenerated or repaired.

Non-goals:
- No automatic acceptance without user action.
- No new motion roles beyond `track`, `pushIn`, and `pushOut`.
- No destructive panel cropping.
- No preview/export behavior changes beyond using existing accepted project data after explicit acceptance.
- No audio/SFX behavior changes.

Acceptance criteria:
- Users can accept a camera suggestion into draft motion, review/edit it, and only then allow it to become normal project data.
- Existing manual editing remains available and authoritative.
- Project JSON remains the source of truth for accepted objects.
- `npm.cmd run build` passes.

Manual verification:
- Accept a suggestion into draft motion, inspect created draft shots/regions/attention paths, edit them, reject/cancel where applicable, and confirm no automatic finalization occurs.
- Run `npm.cmd run build`.

Historical note: T0100 has been implemented, T0100A has since stabilized Track v2 motion, T0101 has since added the practice fixture/evaluation checklist, T0102 has since tuned motion naturalness, T0102A has since added AI camera suggestion density guardrails, T0103 has since planned advisory audio/SFX notes, T0104 has since added the read-only audio notes UI, T0105 has since planned audio apply guardrails, T0106 has since planned Director Rulebook v1, T0106A has since repaired track-chain entry continuity, and T0107 has since integrated the rulebook at runtime. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0101 - Practice Fixture and Evaluation Pass

Ticket ID: T0101

Title: Practice Fixture and Evaluation Pass

Status: Implemented.

Dependencies:
- T0100

Goal: Create a controlled practice set and expected-behavior checklist for corrected detection, AI suggestions, and draft motion.

Allowed areas:
- docs/
- test/fixtures or public fixtures only if existing project conventions support them

Requirements:
- Create or document a controlled practice set: simple dialogue, emotional close-up, establishing panel, two-character conversation, action page, and multi-detail page.
- Include Garfield/simple comic pages as real-world practice material where locally available and legally appropriate.
- Document expected behavior for detection, correction, AI suggestions, and draft motion.
- Define pass/fail notes for panel ordering, detail correction, motion role suggestions, timing hints, and draft motion usefulness.

Non-goals:
- No new provider features.
- No source behavior changes unless fixture plumbing is explicitly needed.
- No copyrighted asset bundling without a clear local/legal basis.
- No automatic scoring system unless separately ticketed.

Acceptance criteria:
- The practice set/checklist gives Codex and humans repeatable scenarios for evaluation.
- Expected behavior is concrete enough to catch regressions in page understanding, correction, suggestion review, and draft motion.
- Build is not required if this remains docs-only.

Implementation note: T0101 added `docs/planning/Practice_Fixture_Evaluation_Pass.md` as a documentation-only practice set and checklist. No fixture assets, source behavior, provider features, Project JSON schema changes, preview/export behavior, audio/SFX behavior, dependencies, or automatic scoring were added. T0102, T0102A, T0103, T0104, T0105, T0106, T0106A, and T0107 have since been implemented; the next recommended ticket is T0108 - Rulebook Evaluation Pass.

Manual verification:
- Review the fixture checklist and confirm it covers the required page types and expected outcomes.
- Confirm no source files changed unless fixture plumbing was explicitly added.

---

## T0102 - Motion Naturalness and Timing Pass

Ticket ID: T0102

Title: Motion Naturalness and Timing Pass

Status: Implemented.

Dependencies:
- T0101

Goal: Improve the feel of accepted/draft camera motion after the suggestion-to-draft workflow exists.

Allowed areas:
- src/
- docs/

Requirements:
- Improve gag/dialogue timing, reaction holds, rhythm presets, and transition naturalness.
- Focus on making accepted/draft motion feel less mechanical.
- Preserve the accepted camera grammar: `track`, `pushIn`, and `pushOut`.
- Keep manual timing and motion edits available.

Implemented changes:
- Browser preview and canvas export now reserve a small role-specific settle portion inside each attention beat so `track`, `pushIn`, and `pushOut` arrive before the beat ends instead of moving mechanically for the full segment.
- `track` keeps smooth sine travel, `pushIn` uses a stronger ease-out arrival for emphasis/reaction/detail beats, and `pushOut` keeps staged close-up-to-context travel with a slightly longer close-up portion before expansion.
- AI-created Draft Motion suggestions now choose duration, scene hold ratio, focus attention ratio, and attention duration weights from timing hint, target type, shot purpose, and motion role instead of using one generic timing profile.
- Manual purpose timing presets were tuned for more readable dialogue, reaction, emotion, action, detail, reveal, transition, panel, and establishing baselines while keeping all manual timing controls editable.
- Preview/export parity is preserved for the changed motion timing.

Non-goals:
- No new motion roles unless a separate planning ticket approves them.
- No parallax, character cutouts, face tracking, OCR timing, or foreground animation.
- No automatic AI regeneration of accepted project data.
- No audio/SFX implementation.

Acceptance criteria:
- Draft/accepted motion timing feels more natural on the practice fixture set.
- Manual controls remain authoritative.
- `npm.cmd run build` passes.

Manual verification:
- Run the practice fixture set and compare dialogue, reaction, establishing, action, and multi-detail motion before/after the timing pass.
- Run `npm.cmd run build`.

Historical note: T0102, T0102A, T0103, T0104, T0105, T0106, T0106A, and T0107 have been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0102A - AI Camera Suggestion Density Guardrails

Ticket ID: T0102A

Title: AI Camera Suggestion Density Guardrails

Status: Implemented.

Dependencies:
- T0102

Goal: Keep AI Camera Suggestions and Draft Motion focused on a small number of meaningful camera beats instead of assigning motion to every generated page-understanding target.

Implemented changes:
- Added deterministic client-side density guardrails after provider director-suggestion normalization and before AI Camera Suggestion review cards are shown.
- Added per-page and per-panel caps so ordinary panels prefer one review card, complex panels can keep a small number, and dense action/detail panels remain capped.
- Added ranking that favors accepted/corrected detail highlights, action/impact evidence, narratively useful character/face targets, and role-aligned targets over raw speech or weak raw detail guesses.
- Speech regions are treated as timing/hold evidence rather than primary motion targets unless no better target exists.
- Supporting targets are capped, redundant/similar weaker suggestions are suppressed, and kept cards show density-guardrail warnings when suppression or target trimming happens.
- Draft Motion now filters and caps its generated Focus Region targets, excluding speech-only support targets from automatic Focus Region creation.
- Existing stale/blocked validation and duplicate draft prevention remain in place.

Allowed areas:
- src/
- docs/

Requirements:
- Cap normal camera suggestions per panel/page so the UI and Draft Motion do not become cluttered.
- Prefer one readable suggestion/path per ordinary panel and only a small number for complex/action/detail-heavy panels.
- Treat speech regions mostly as timing/hold evidence.
- Treat raw character/face/detail/action regions as motion targets only when narratively useful or strongly justified.
- Prefer accepted/corrected details over raw AI detail guesses.
- Preserve accepted camera grammar: `track`, `pushIn`, and `pushOut`.
- Preserve temporary/review-only behavior until explicit user acceptance.

Non-goals:
- No new motion roles.
- No audio/SFX suggestion behavior.
- No OCR timing, parallax, character cutouts, segmentation animation, or automatic accepted-state mutation.
- No Project JSON schema changes.

Acceptance criteria:
- Simple dialogue strips do not create motion for every speech balloon.
- Two-character conversations favor a small `track` path.
- Emotional close-ups may justify one `pushIn`.
- Establishing panels preserve context.
- Action pages can use sharper timing without unsupported roles.
- Multi-detail pages prefer accepted/corrected details over raw AI guesses.
- `npm.cmd run build` passes.

Manual verification:
- Run AI page understanding, generate AI Camera Suggestions, and create Draft Motion on T0101 practice scenarios.
- Confirm density guardrail warnings appear when suggestions or supporting targets are trimmed.
- Confirm Draft Motion creates only the needed Focus Regions for the selected suggestion/path.
- Confirm blocked/stale/rejected/already-drafted suggestions still cannot create duplicate Draft Motion.
- Run `npm.cmd run build`.

Historical note: T0102A, T0103, T0104, T0105, T0106, T0106A, and T0107 have been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0103 - Audio/SFX Suggestion Pass

Ticket ID: T0103

Title: Audio/SFX Suggestion Pass

Status: Implemented.

Dependencies:
- T0102

Goal: Plan reviewable AI suggestions for BGM and SFX cue points after camera suggestion/draft motion workflows are grounded.

Implemented changes:
- Added `docs/planning/Audio_SFX_Suggestion_Pass.md`.
- Defined a focused post-T0102A advisory audio note contract for BGM tone, BGM pacing, SFX cues, SFX restraint, and audio warnings.
- Defined provider-neutral note fields for target binding, timing, search terms, reason, confidence, warnings, and temporary review status.
- Bound future audio notes to accepted Camera Shots, accepted Shot Attention Path items, accepted Focus Regions, existing accepted audio metadata, and explicitly accepted Draft Motion output only after it becomes normal project data.
- Kept raw/temporary AI Page Understanding, AI Camera Suggestions, Draft Motion helpers, and future audio notes out of accepted export source-of-truth data.
- Added stale/blocked rules for missing shots, path items, Focus Regions, effect cues, timing changes, SFX markers, and unsupported fetch/generate/place requests.
- Documented provider, privacy, consent, licensing, copyright, cancellation, failure-state, and no-suggestion caveats for later implementation.
- Preserved existing manual Background Audio and Sound Effects workflows as the only accepted audio data path.

Allowed areas:
- docs/
- src/ only if a read-only notes UI is explicitly included

Requirements:
- Plan reviewable AI suggestions for BGM and SFX cue points.
- Keep suggestions as notes only at first.
- Tie audio/SFX notes to accepted camera/draft-motion intent where possible.
- Avoid automatic audio fetching, copyrighted asset use, or hidden downloads.
- Include provider/privacy/licensing caveats for any future audio suggestion workflow.

Non-goals:
- No automatic audio fetching.
- No copyrighted asset recommendation by exact commercial track/library id.
- No automatic SFX marker placement.
- No audio generation.
- No Project JSON audio suggestion persistence unless separately scoped.

Acceptance criteria:
- The plan defines advisory audio/SFX note fields, target binding, review behavior, and non-goals.
- The plan keeps accepted project audio data manual and explicit.
- Build is not required if this remains docs-only.

Manual verification:
- Review the plan and confirm it treats BGM/SFX as reviewable notes only.
- Confirm no source files changed unless a read-only notes UI was explicitly added.

Historical note: T0103, T0104, T0105, T0106, T0106A, and T0107 have been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0104 - Read-Only Audio Suggestion Notes UI

Ticket ID: T0104

Title: Read-Only Audio Suggestion Notes UI

Status: Implemented.

Dependencies:
- T0103

Goal: Add the first read-only or copy-assist UI for advisory BGM/SFX notes without mutating accepted audio data.

Implemented changes:
- Added a new `Audio Notes` section inside AI Review.
- Added local in-memory audio note records for BGM tone, BGM pacing, SFX cue, SFX restraint, and audio warning notes.
- Notes are deterministically derived from accepted Camera Shots, accepted Shot Attention Path items, accepted Focus Regions, existing Background Audio metadata, and existing SFX marker metadata.
- Added `Generate Audio Notes`, `Copy Terms`, and `Reject` actions.
- Copying only copies provider-neutral search phrases to the clipboard and marks the temporary note copied.
- Rejecting hides the note for the current review session without changing accepted project data.
- Notes are cleared on new page/project import and are marked stale if their accepted target disappears.
- Notes are not persisted to Project JSON or archives and do not create or edit audio assets, Background Audio settings, SFX markers, preview, export, Camera Shots, Focus Regions, or Shot Attention Path data.

Allowed areas:
- src/
- docs/

Requirements:
- Show temporary audio notes in AI Review or an adjacent audio review section.
- Include copyable provider-neutral search terms.
- Include target, timing, confidence, reason, warnings, and stale/blocking context.
- Allow reject/copy review actions only.
- Keep existing manual Background Audio and Sound Effects panels as the only accepted audio workflows.

Non-goals:
- No automatic audio fetching.
- No audio generation.
- No automatic SFX marker placement.
- No Project JSON audio suggestion persistence unless separately scoped.
- No accepted audio setting mutation unless a later apply ticket explicitly allows it.

Acceptance criteria:
- Users can generate read-only advisory BGM/SFX notes from accepted project data.
- Users can copy search terms or reject notes.
- Notes never create, fetch, download, upload, place, persist, or apply audio.
- `npm.cmd run build` passes.

Manual verification:
- Upload or import a project with accepted Camera Shots.
- Click `Generate Audio Notes` in AI Review / Audio Notes and confirm notes appear with target, timing, confidence, reason, warnings, and provider-neutral search terms where applicable.
- Copy search terms and confirm the note is marked copied while accepted audio data remains unchanged.
- Reject a note and confirm it is hidden for the session while accepted audio data remains unchanged.
- Delete or change an accepted target for a note and confirm the note becomes stale instead of applying changes.
- Export Project JSON / archive and confirm temporary audio notes are not persisted.
- Run `npm.cmd run build`.

Historical note: T0104, T0105, T0106, T0106A, and T0107 have been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0105 - Audio Suggestion Apply Guardrails Planning

Ticket ID: T0105

Title: Audio Suggestion Apply Guardrails Planning

Status: Implemented.

Dependencies:
- T0104

Goal: Plan whether any future audio suggestion apply behavior is safe, and define guardrails before source implementation.

Implemented changes:
- Added `docs/planning/Audio_Suggestion_Apply_Guardrails_Planning.md`.
- Defined that future apply behavior may target only existing accepted Background Audio settings or existing accepted SFX marker settings.
- Kept new SFX marker creation, audio file creation, fetching, downloading, generation, bundling, and provider asset selection out of scope.
- Defined required apply preconditions for non-stale/non-blocked notes, existing targets, in-bounds timing, valid duration, valid volume, valid trim/fade settings, and explicit one-note user action.
- Defined stale and blocked rules for missing targets, changed accepted context, unloaded audio files, unsupported fields, and out-of-bounds values.
- Kept temporary audio note persistence out of Project JSON and archives unless a separate schema ticket explicitly approves it.
- Documented provider, privacy, licensing, and consent boundaries for any later provider-assisted audio workflow.

Allowed areas:
- docs/

Non-goals:
- No source behavior changes.
- No automatic audio fetching or generation.
- No automatic new SFX marker placement.
- No Project JSON suggestion persistence unless separately scoped.

Acceptance criteria:
- The plan defines exactly what future audio apply behavior may and may not mutate.
- The plan keeps accepted manual audio data as the source of truth.
- The plan blocks stale, missing, generated, fetched, or new-marker apply behavior.
- Build is not required because this is docs-only.

Manual verification:
- Review `docs/planning/Audio_Suggestion_Apply_Guardrails_Planning.md`.
- Confirm future apply behavior is limited to existing Background Audio settings or existing SFX marker settings.
- Confirm new marker creation remains a separate ticket.
- Confirm no source files changed.

Historical note: T0105 and T0106 have been implemented as docs-only, T0106A has since repaired track-chain entry continuity, and T0107 has since integrated the rulebook at runtime. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0106 - Director Rulebook v1 Planning

Ticket ID: T0106

Title: Director Rulebook v1 Planning

Status: Implemented.

Dependencies:
- T0105

Goal: Define a concrete v1 director rulebook structure, rule families, examples, and consumption boundaries before runtime integration.

Scope note: This is a planning ticket. It should turn the earlier T0088 DynamicManga knowledge-pack planning into a practical v1 rulebook specification that AI camera suggestions, Draft Motion, and advisory audio notes can consume. It should define rule families, rule ids, examples, inputs, outputs, confidence effects, suppression/blocking rules, and how camera/audio paths cite rules.

Implemented changes:
- Added `docs/planning/Director_Rulebook_v1_Planning.md`.
- Defined the Director Rulebook v1 purpose as a shared director/taste layer for AI Camera Suggestions, Draft Motion, timing hints, BGM notes, SFX notes, and future apply guardrails.
- Defined accepted/corrected project data as higher-priority input than raw AI detections.
- Defined a practical beat taxonomy covering establishing/environment, normal reading flow, dialogue, speaker exchange, reaction/emotion, action/impact, detail/clue, reveal/context restoration, transition, punchline/payoff, and tension/mood.
- Mapped beats to the existing `track`, `pushIn`, and `pushOut` camera grammar only.
- Planned timing guidance for dialogue readability, reaction settle, action sharpness, establishing context, detail pauses, punchline holds, and restrained intensity.
- Planned BGM/SFX guidance that supports valid camera/story beats without creating new hidden audio beats or automatic apply behavior.
- Defined priority/ranking rules, suppression/blocking rules, a future machine-readable rule shape, T0107 runtime integration points, and compact practice examples.

Non-goals:
- No source behavior changes.
- No provider changes.
- No Project JSON schema changes.
- No automatic accepted-state mutation.
- No new motion roles.
- No audio fetching, generation, automatic placement, or apply behavior.

Manual verification:
- Review `docs/planning/Director_Rulebook_v1_Planning.md`.
- Confirm it is planning-only and does not describe runtime source behavior as implemented.
- Confirm it connects AI Camera Suggestions, Draft Motion, timing hints, BGM notes, SFX notes, and future apply guardrails through one beat taxonomy.
- Confirm camera recommendations use only `track`, `pushIn`, and `pushOut`.
- Confirm accepted/corrected project data outranks raw AI detections.
- Confirm audio suggestions remain temporary/review-only until future explicit apply behavior.
- Confirm no source files changed. Build is not required because this is docs-only.

Historical note: T0106, T0106A, and T0107 have been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0106A - Track Chain Entry Continuity Repair

Ticket ID: T0106A

Title: Track Chain Entry Continuity Repair

Status: Implemented.

Dependencies:
- T0102
- T0106

Goal: Repair browser preview and canvas export continuity when a non-track attention anchor enters a `track -> track` chain.

Implemented changes:
- Updated browser preview attention-anchor duration weighting so the first `track` after a non-track anchor and before another `track` receives a short travel segment instead of zero duration.
- Updated canvas export with the same track-chain entry duration weighting for preview/export parity.
- Preserved first-focus track-chain starts as zero-duration because Shot Starts At = First focus already begins at the first track focus.
- Preserved stable-scale `track -> track` motion after the chain entry.
- Preserved existing motion roles, Project JSON schema, AI/provider behavior, audio/SFX behavior, and T0102A density guardrails.

Root cause:
- The prior pass-through track-start logic gave the first `track` after a non-track anchor zero duration whenever another `track` followed it.
- In `pushIn -> track -> track`, playback skipped the first track anchor as an active segment and began the next track segment from the skipped anchor's window, producing a visible teleport from the pushed-in window to the track-entry window.

Non-goals:
- No new motion roles.
- No Project JSON schema changes.
- No provider prompt, AI suggestion, audio/SFX, or Director Rulebook runtime changes.
- No old track visuals such as spotlight, rail, aperture, ribbon, endpoint blobs, or Focus Region-shaped masks.

Manual verification:
- Create one Camera Shot with three Focus Regions in its attention path: FR1 = `pushIn`, FR2 = `track`, FR3 = `track`.
- Confirm browser preview smoothly travels from the FR1 close-up into FR2 before tracking to FR3.
- Compare `pushIn -> track -> pushIn`, `pushOut -> track -> track`, `track -> track -> track`, and `track -> pushIn -> track`.
- Confirm same-role `track -> track` remains stable-scale and calm.
- Confirm Shot Starts At = First focus still works.
- Confirm canvas export matches browser preview for the repaired case.
- Run `npm.cmd run build`.

Historical note: T0106A and T0107 have been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0107 - Director Rulebook Runtime Integration

Ticket ID: T0107

Title: Director Rulebook Runtime Integration

Status: Implemented.

Dependencies:
- T0106

Goal: Feed the Director Rulebook v1 into AI camera/audio suggestion generation and deterministic post-processing.

Scope note: Runtime integration should keep accepted project data as the source of truth and keep generated camera/audio output temporary/review-only until existing explicit accept/apply flows are used. It may add deterministic post-processing only where it enforces the rulebook's guardrails.

Implemented changes:
- Added `src/lib/directorRulebook.ts` as a small source-level Director Rulebook v1 runtime helper.
- Added rulebook id/version constants, a compact provider-prompt summary, accepted-context shaping, beat-type classification, beat-to-motion timing recommendations, and formatted rule warnings.
- Sent accepted Camera Shot, Focus Region, accepted detail, and accepted path-beat context with `/api/generate-director-suggestions` requests.
- Added the Director Rulebook v1 summary and accepted-context priority instructions to the local provider prompt for AI camera suggestions.
- Added deterministic client-side rulebook post-processing after provider suggestion normalization and target selection.
- Camera post-processing can downgrade weak speech/detail/panel/context motion choices, adjust overly fast non-action timing, append rulebook beat reasoning, and add review-card warnings.
- Audio notes now cite the rulebook, keep BGM sequence-level, block speech Focus Regions from SFX cue generation, and tie SFX notes only to accepted visible action/detail/reaction/effect-cue beats.
- Existing T0102A density guardrails, stale/blocked handling, duplicate Draft Motion prevention, and review-only behavior remain in place.

Non-goals:
- No new motion roles.
- No automatic accepted-state mutation.
- No automatic audio fetching, generation, or SFX marker placement.
- No Project JSON suggestion persistence unless separately scoped.

Manual verification:
- Run AI page understanding, then generate AI Camera Suggestions on the T0101 scenarios.
- Confirm provider camera suggestions mention only `track`, `pushIn`, and `pushOut`.
- Confirm review cards show Director Rulebook warnings/reasons when speech/detail/panel/context/timing choices are constrained.
- Confirm accepted/corrected detail targets still outrank raw AI details.
- Confirm Draft Motion still creates only temporary helper suggestions until explicitly accepted.
- Generate Audio Notes and confirm BGM notes describe sequence mood, SFX notes are tied to accepted visual beats, and speech regions produce restraint rather than SFX cues.
- Confirm no Project JSON schema, accepted-state mutation, audio apply behavior, OCR timing, provider image-analysis behavior, parallax, character cutouts, segmentation animation, or new motion roles were added.
- Run `npm.cmd run build`.

Historical note: T0107 and T0107A have been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0107A - AI Motion Suggestion Overlap Consolidation

Ticket ID: T0107A

Title: AI Motion Suggestion Overlap Consolidation

Status: Implemented.

Dependencies:
- T0107

Goal: Consolidate overlapping AI FACE / ACTION / DETAIL detections into one local directing beat before AI camera suggestion targets and Draft Motion helpers become cluttered.

Implemented changes:
- Added Director Rulebook prompt guidance that detections are not directing beats and overlapping FACE / ACTION / DETAIL boxes should become one beat cluster.
- Added client-side beat clustering during AI Camera Suggestion target selection using overlap, containment, and center-distance checks.
- A cluster now chooses one dominant target based on beat intent: action impact, reaction/emotion, accepted or clearly justified detail, dialogue, or normal reading flow.
- Non-dominant detections remain as supporting targets and review-card warnings instead of becoming separate primary motion targets.
- Tightened rulebook post-processing so action-follow beats prefer `track`, dialogue/normal reading flow avoids repeated `pushIn`, and only `track`, `pushIn`, and `pushOut` remain valid.
- Strengthened anti-redundancy filtering so near-identical suggestions in the same panel can suppress each other even when their raw target types differ.
- Preserved accepted project data as the source of truth, review-only AI suggestions, T0102A density caps, stale/blocked behavior, duplicate Draft Motion prevention, Project JSON schema, manual editing, import/export, preview playback, and audio/SFX boundaries.

Manual verification:
- On a Garfield-style page or similar simple comic page, run AI page understanding and generate AI Camera Suggestions.
- Confirm overlapping ACTION and FACE boxes on the same character produce one primary motion suggestion, not separate action and face motions for the same area.
- Confirm DETAIL boxes inside or attached to the same ACTION/FACE area remain support unless accepted/corrected or clearly story-critical.
- Confirm dialogue/speaker exchange prefers `track` or no extra push-in, while emotional close-ups can still justify one `pushIn`.
- Confirm action-follow suggestions prefer `track` unless the reason is a tight impact/payoff.
- Create Draft Motion from a kept suggestion and confirm it uses fewer Focus Regions than raw AI detections.
- Confirm manual editing, accepting/rejecting suggestions, project import/export, and preview playback still work.
- Run `npm.cmd run build`.

Historical note: T0107A has been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0107B - AI Draft Panel-First Continuity Tuning

Ticket ID: T0107B

Title: AI Draft Panel-First Continuity Tuning

Status: Implemented.

Dependencies:
- T0107A

Goal: Reduce AI Draft Motion clutter by making detected panels the default shot unit and treating Focus Regions / Shot Attention Path items as optional internal guidance.

Implemented changes:
- Updated Director Rulebook and provider prompt guidance with the comic-reading hierarchy: page sequence, panel as shot, optional internal Focus Region, optional attention path.
- Draft Motion now frames the detected panel as the camera shot when panel geometry is available instead of building the shot from every selected target.
- Draft Motion may now produce zero Focus Regions and zero path items when the panel shot itself is the directing choice.
- Added helper logic to skip internal Focus Regions when the target is already covered by the shot frame or redundant with an existing internal target.
- Capped Draft Motion internal path items to a restrained budget: usually 0-1, with 2 only for distinct internal exchange/payoff/movement.
- Shot duration now scales with path complexity and camera moves so two-path-item drafts get more time than simpler panel shots.
- Provider guidance now tells AI that panels are shots, detections are not shots, path items are only for meaningful internal movement, and adjacent panel continuity should stay restrained.

Non-goals:
- No UI redesign.
- No Project JSON schema change.
- No new motion roles.
- No automatic accepted-state mutation.
- No audio/SFX apply behavior, OCR timing, parallax, character cutouts, segmentation animation, or provider page-analysis behavior changes.

Manual verification:
- On a normal comic page, run AI page understanding and generate AI Camera Suggestions.
- Create Draft Motion from representative suggestions and confirm the baseline is roughly one draft shot per detected panel.
- Confirm the draft shot usually frames the whole panel or readable panel area.
- Confirm redundant Focus Regions are skipped when the panel shot already covers the intended target.
- Confirm a one-beat panel has 0 or 1 path item, while speaker-to-speaker or setup-to-payoff may have 2.
- Confirm two-path-item shots have longer duration than equivalent 0-1 path-item shots.
- Confirm adjacent panels that continue the same character/action/conversation use restrained continuity instead of repeated aggressive push-ins.
- Confirm manual editing, accepting/rejecting suggestions, preview playback, import/export, and archive behavior still work.
- Run `npm.cmd run build`.

Historical note: T0107B has been implemented. The next recommended ticket is T0108 - Rulebook Evaluation Pass.

---

## T0108 - Rulebook Evaluation Pass

Ticket ID: T0108

Title: Rulebook Evaluation Pass

Status: Implemented.

Dependencies:
- T0107

Goal: Re-run the T0101 practice scenarios and compare AI camera/audio suggestions and Draft Motion behavior before and after rulebook integration.

Scope note: This should be an evaluation/reporting pass. It should use the existing T0101 practice scenarios to check whether the rulebook improves density, target selection, motion-role choice, timing clarity, and audio-note restraint.

Non-goals:
- No new provider behavior unless required by T0107 output verification.
- No automatic accepted-state mutation.
- No bundled copyrighted fixture assets.
- No audio fetching, generation, or automatic SFX placement.

Implemented changes:
- Added `docs/planning/Rulebook_Evaluation_Pass.md`.
- Evaluated the Director Rulebook path against the T0101 scenarios: simple dialogue, emotional close-up, establishing panel, two-character conversation, action page, and multi-detail page.
- Compared the pre-rulebook baseline with the current T0107/T0107A/T0107B behavior for density, target selection, motion-role choice, timing clarity, Draft Motion usefulness, and audio-note restraint.
- Recorded that deterministic rulebook behavior has improved suggestion restraint, accepted-detail priority, panel-first Draft Motion, and audio-note restraint.
- Separated deterministic rulebook findings from provider-dependent page-understanding quality because no live provider session or bundled fixture assets were used for this docs-only pass.
- Recommended T0109 - Rulebook Evaluation Findings Tuning as a narrow follow-up for evidence-driven warning/threshold/prompt tuning only.

Manual verification:
- Review `docs/planning/Rulebook_Evaluation_Pass.md`.
- Confirm it evaluates all T0101 practice scenarios.
- Confirm it does not claim live provider results or bundled fixture assets.
- Confirm it keeps accepted project data as the source of truth and leaves source behavior unchanged.
- Confirm T0109 is the next recommended ticket.
- Build is not required because this is docs-only.

Historical note: T0108, T0109, T0110, and T0111 have been implemented. T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.

---

## T0109 - Rulebook Evaluation Findings Tuning

Ticket ID: T0109

Title: Rulebook Evaluation Findings Tuning

Status: Implemented.

Dependencies:
- T0108

Goal: make small, evidence-driven rulebook tuning changes from the T0108 evaluation findings without expanding product scope.

Scope note: This ticket should use the T0108 report and any available local/legal practice pages to tune only warning clarity, prompt wording, or deterministic thresholds when a repeated real-page failure is documented. It should keep all AI outputs temporary/review-only and keep accepted project data as the source of truth.

Allowed areas:
- docs/
- src/lib/directorRulebook.ts
- narrow AI camera/audio suggestion post-processing helpers in `src/app/App.tsx` only if a specific evaluation finding requires it

Non-goals:
- No new provider route or provider feature.
- No automatic accepted-state mutation.
- No bundled copyrighted fixtures.
- No Project JSON schema changes.
- No audio fetching, generation, downloading, automatic SFX placement, or audio apply behavior.
- No OCR timing, parallax, character cutouts, segmentation animation, or new motion roles.

Implemented changes:
- Added Director Rulebook prompt guidance for speaker exchange, back-and-forth dialogue, setup/payoff, and response beats so providers are nudged toward restrained `track` or hold behavior unless a specific reaction needs emphasis.
- Tuned text beat classification so speaker exchange/reply language maps to the existing `speakerToSpeakerExchange` beat and setup/payoff/gag language maps to the existing `punchlineGagPayoff` beat before generic detail classification.
- Clarified AI Camera Suggestion density and beat-cluster warnings so trimmed raw detections are described as supporting review evidence rather than separate required motion targets.
- Clarified deterministic downgrade warnings for dialogue restraint, raw-detail evidence requirements, and timing readability adjustments.
- Added a T0109 practice tuning note template to `docs/planning/Rulebook_Evaluation_Pass.md` for recording provider/model, observed behavior, confusing/helpful warning text, and recommended future tuning without bundling fixture assets.

Manual verification:
- Review `src/lib/directorRulebook.ts` and confirm the prompt summary and text classification changes still use only the existing beat taxonomy and accepted `track`, `pushIn`, and `pushOut` grammar.
- Review `src/app/App.tsx` warning copy and confirm it does not create new provider behavior, accepted-state mutation, schema changes, audio behavior, OCR timing, parallax, cutouts, segmentation animation, or new motion roles.
- Review `docs/planning/Rulebook_Evaluation_Pass.md` and confirm the T0109 practice tuning note format is documentation-only.
- Run `npm.cmd run build`.

Historical note: T0109, T0110, and T0111 have been implemented. T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.

---

## T0110 - Practice Page Provider Evaluation Run

Ticket ID: T0110

Title: Practice Page Provider Evaluation Run

Status: Implemented.

Dependencies:
- T0109

Goal: run local/legal practice pages through the existing provider-backed page-understanding, AI Camera Suggestion, Draft Motion, and Audio Notes flows and record provider-dependent quality findings before further tuning.

Scope note: This should be an evaluation/reporting pass using only local or legally usable practice material. It should record provider/model, page-understanding quality, rulebook warning clarity, Draft Motion usefulness, audio-note usefulness, and whether T0109 warning/prompt tuning helped. It should not bundle copyrighted fixtures or change source behavior unless a specific, repeated, evidence-backed failure is split into a later ticket.

Allowed areas:
- docs/

Non-goals:
- No source behavior changes.
- No new provider route or provider feature.
- No automatic accepted-state mutation.
- No bundled copyrighted fixtures.
- No Project JSON schema changes.
- No audio fetching, generation, downloading, automatic SFX placement, or audio apply behavior.
- No OCR timing, parallax, character cutouts, segmentation animation, or new motion roles.

Implemented changes:
- Added `docs/planning/Practice_Page_Provider_Evaluation_Run.md` as the T0110 evaluation-run record.
- Recorded that provider configuration was present locally, but no local/legal practice page image files were available in the workspace.
- Recorded that a foreground Vite startup check reached the normal ready state, but background scripted supervision did not stay reachable long enough for a provider run.
- Explicitly marked AI Page Understanding, AI Camera Suggestions, Draft Motion, and Audio Notes as not run for all six T0101 scenarios.
- Added a provider run sheet for future local/legal practice pages, including provider/model, panel order, speech association, detail recall, warning clarity, Draft Motion usefulness, Audio Notes usefulness, and T0109 tuning signal.
- Preserved the boundary that no live provider quality claims should be made until real page results are captured.
- Recommended T0111 - Manual Provider Practice Run With User-Selected Pages as the next ticket.

Manual verification:
- Review `docs/planning/Practice_Page_Provider_Evaluation_Run.md`.
- Confirm it does not claim live provider results.
- Confirm it records why provider-dependent quality was not evaluated in this workspace session.
- Confirm no fixture assets were added.
- Confirm no source behavior, provider route, Project JSON schema, preview/export behavior, audio/SFX behavior, dependency, OCR timing, parallax, character cutout, segmentation animation, new motion role, or accepted-state mutation changed.
- Confirm T0111 is the next recommended ticket.
- Build is optional because this is docs-only.

Historical note: T0110 and T0111 have been implemented. T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.

---

## T0111 - Manual Provider Practice Run With User-Selected Pages

Ticket ID: T0111

Title: Manual Provider Practice Run With User-Selected Pages

Status: Implemented.

Dependencies:
- T0110

Goal: run the T0101 practice scenarios with user-selected local/legal comic pages through the existing provider routes and record real provider/model output before any further rulebook, Draft Motion, or audio-note tuning.

Scope note: This should be a manual evaluation/reporting ticket. It should use local/legal pages selected by the user, test AI Page Understanding through `/api/analyze-page`, test provider AI Director Suggestions through `/api/generate-director-suggestions`, and record concrete results in docs. The full browser AI Camera Suggestions review surface, temporary Draft Motion helper creation, and read-only Audio Notes workflow remain for T0112. Source changes should be split into later tickets only when repeated failures are documented.

Allowed areas:
- docs/

Non-goals:
- No source behavior changes.
- No new provider route or provider feature.
- No automatic accepted-state mutation.
- No bundled copyrighted fixtures.
- No Project JSON schema changes.
- No audio fetching, generation, downloading, automatic SFX placement, or audio apply behavior.
- No OCR timing, parallax, character cutouts, segmentation animation, or new motion roles.

Implemented changes:
- Updated `docs/planning/Manual_Provider_Practice_Run_With_User_Selected_Pages.md` with a real provider-backed practice run using the four user-supplied local images under `D:\project_c\practice_images`.
- Ran the existing `/api/analyze-page` provider route on all four images with `gpt-5.4` to test AI Page Understanding.
- Ran the existing `/api/generate-director-suggestions` provider route for each successful page-understanding result to test provider AI Director Suggestions.
- Recorded that panel counts matched the visible panel layouts: two three-panel strips and two six-panel pages.
- Recorded that reading order was correct for all four pages.
- Recorded that director suggestions were generated for every detected panel and stayed within `track`, `pushIn`, and `pushOut`.
- Recorded positive T0109 tuning evidence: warnings treated raw detections as approximate support, preserved panel-first framing, and explained beat clustering on overlapping character/detail/action detections.
- Recorded remaining limitations: the full browser AI Camera Suggestions review surface, browser AI Review card inspection, temporary Draft Motion helper creation, read-only Audio Notes generation, and manual accept/reject/edit behavior were not run.
- Recommended T0112 - Browser Draft Motion and Audio Notes Practice Verification as the next ticket.

Manual verification:
- Review `docs/planning/Manual_Provider_Practice_Run_With_User_Selected_Pages.md`.
- Confirm it records real provider/model output for the four supplied practice images.
- Confirm it does not claim the full browser AI Camera Suggestions review surface, Draft Motion, or Audio Notes were run.
- Confirm no fixture assets were added by this ticket.
- Confirm no source behavior, provider route, Project JSON schema, preview/export behavior, audio/SFX behavior, dependency, OCR timing, parallax, character cutout, segmentation animation, new motion role, or accepted-state mutation changed.
- Confirm T0112 is the next recommended ticket.
- Run `npm.cmd run build`.

Historical note: T0111 has been implemented. T0112 has since completed browser/manual verification by user report, and T0112A has since tuned Audio Notes simplicity.

---

## T0112 - Browser Draft Motion and Audio Notes Practice Verification

Ticket ID: T0112

Title: Browser Draft Motion and Audio Notes Practice Verification

Status: Implemented. `docs/planning/Browser_Draft_Motion_Audio_Notes_Practice_Verification.md` records the initial bounded source/build verification pass, the agent browser-automation limitation, and the later user manual browser verification result. The user reported the workflow is good after T0112A audio-note simplification.

Dependencies:
- T0111

Goal: use the same supplied practice images in the browser UI to verify the full AI Camera Suggestions review surface, AI Review card inspection/highlighting, temporary Draft Motion helper creation, read-only Audio Notes generation, and manual review boundaries after the successful T0111 provider-route run.

Scope note: This should be a browser/manual verification ticket. It should not change source behavior unless a repeated browser-specific failure is documented and split into a separate narrow implementation ticket.

Allowed areas:
- docs/

Non-goals:
- No source behavior changes.
- No new provider route or provider feature.
- No automatic accepted-state mutation.
- No bundled copyrighted fixtures.
- No Project JSON schema changes.
- No audio fetching, generation, downloading, automatic SFX placement, or audio apply behavior.
- No OCR timing, parallax, character cutouts, segmentation animation, or new motion roles.

Implemented changes:
- Added `docs/planning/Browser_Draft_Motion_Audio_Notes_Practice_Verification.md`.
- Confirmed the four T0111 practice images are present locally.
- Reviewed the current AI Review source paths for provider AI Camera Suggestions, AI Page Understanding highlighting, temporary Draft Motion helpers, read-only Audio Notes, and stale/rejected/accepted-data boundaries.
- Confirmed a bounded PowerShell job can start the Vite dev server locally.
- Attempted dependency-free browser automation through local Chrome and Edge DevTools endpoints; Chrome exited before exposing a page target and Edge did not expose the expected localhost endpoint.
- Recorded user manual browser verification as passing after T0112A audio-note simplification.

Manual verification completed by user report:
- Use the four supplied practice images in the browser UI.
- Run AI Page Understanding and inspect AI Review card-to-page highlighting.
- Generate AI Camera Suggestions and inspect/edit/reject representative cards.
- Create temporary Draft Motion helpers and verify their overlays remain temporary until explicit acceptance.
- Accept representative Draft Motion helpers and verify accepted Camera Shot, Focus Region, and Shot Attention Path data are created only through that explicit action.
- Generate read-only Audio Notes from accepted camera context.
- Export Project JSON/archive and confirm temporary AI review data is not persisted.
- Run `npm.cmd run build`.

---

## T0112A - Audio Notes Simplicity Tuning

Ticket ID: T0112A

Title: Audio Notes Simplicity Tuning

Status: Implemented.

Dependencies:
- T0104
- T0107
- T0112 manual feedback

Goal: simplify read-only Audio Notes so BGM is one page-level recommendation and SFX notes stay sparse instead of suggesting a cue for every minor action or soft character movement.

Scope note: This is a narrow deterministic audio-note tuning pass from browser/manual feedback. It changes only temporary advisory note generation; it does not create, fetch, place, persist, or apply audio assets.

Allowed areas:
- `src/app/App.tsx`
- docs/

Implemented changes:
- Audio Notes now generate one whole-page BGM recommendation instead of separate BGM tone and BGM pacing cards.
- Casual/dialogue-heavy pages now prefer soft peaceful daily-life BGM search terms such as gentle comic/family-comedy beds.
- SFX note eligibility is stricter: explicit accepted effect cues still qualify, and non-effect SFX notes are limited to strong accepted action-impact beats.
- Soft character entrances, ordinary dialogue, reaction faces, and normal detail inspection no longer automatically produce SFX cue notes.
- Existing read-only/copy/reject behavior, stale handling, Project JSON/archive exclusion, provider routes, audio assets, Background Audio settings, SFX markers, preview/export behavior, OCR timing, parallax, cutouts, segmentation animation, and motion roles remain unchanged.

Manual verification:
- In the browser, accept at least one representative Draft Motion helper so Audio Notes can use accepted camera context.
- Click `Generate Audio Notes`.
- Confirm only one page-level BGM note appears for the whole page.
- On a casual/family/daily-life comic page, confirm BGM suggests a soft peaceful daily-life/comedy bed rather than panel-by-panel scoring.
- Confirm SFX notes are sparse and limited to explicit effect cues or strong action-impact beats.
- Confirm soft character entrances, ordinary dialogue, and mild reaction/detail beats do not each create SFX notes.
- Confirm notes remain temporary/read-only, copy/reject only, and no audio asset, Background Audio setting, SFX marker, Project JSON, archive, preview, or export data is changed.
- Run `npm.cmd run build`.

Historical note: T0112 and T0112A are implemented. No repeated browser-specific failure is currently documented.

---

## Deferred - Existing Audio Suggestion Apply Spike

Status: Deferred.

Reason: Audio apply remains valid later, but the current recommended path is to ground camera/audio suggestions in a Director Rulebook first. When resumed, this work should apply only validated settings to an existing Background Audio record or an existing SFX marker. It must not create, fetch, download, upload, generate, bundle, or place audio assets or new SFX markers. It must not persist temporary audio suggestions unless a separate schema ticket explicitly scopes it.
