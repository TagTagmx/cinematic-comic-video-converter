# Manual Verification Guide

Manual verification is required because a successful build does not prove the editor workflow is correct.

## General Checks

Run when source code changes:

```bash
npm install
npm run dev
npm run build
```

For docs-only tickets, build is optional. Always check that documentation matches the current app behavior and ticket scope.

For the T0073 - Special Effects Direction Doc docs-only ticket, no browser verification is required. Read `docs/planning/Special_Effects_Direction_Plan.md`, `docs/Tickets.md`, and `docs/Repo_Current_State.md`; confirm special effects are rendering-layer modifiers only, the active camera grammar remains `track`, `pushIn`, and `pushOut`, no Project JSON schema/source/preview/export/UI behavior changed, and T0074 - Camera Shake Preview Spike is the next recommended implementation ticket.

For the AI Automation Architecture Plan docs-only ticket, no browser verification is required. Read `docs/planning/AI_Automation_Architecture_Plan.md`, `docs/Tickets.md`, and `docs/Repo_Current_State.md`; confirm the roadmap describes suggestion-based AI planning only, does not claim real AI implementation, and note that T0079 later narrowed the broad AI branch into the AI Director Suggestions roadmap.

For the T0079 - AI Director Suggestions Planning docs-only ticket, no browser verification is required. Read `docs/planning/AI_Director_Assistant_Roadmap.md`, `docs/Tickets.md`, and `docs/Repo_Current_State.md`; confirm the roadmap describes AI as reviewable director-assistant suggestions, forbids automatic Camera Shot / Focus Region / Shot Attention Path creation in the first phase, keeps `track`, `pushIn`, and `pushOut` as the accepted camera grammar, and treats Shake and Impact Pulse as supporting mood/timing layers. T0080 later implemented the first UI spike.

For T0080 - AI Director Suggestions UI Spike, browser verification is required. Confirm the Mock AI Director Notes panel appears after a page/project is loaded, suggestions include target, mood, motion role, effect, cue timing, confidence, and reason, and inspecting them does not mutate Camera Shots, Focus Regions, Shot Attention Paths, effect settings, timing, Project JSON, preview, or export behavior.

For T0081 - AI Suggestion Accept/Apply Spike, browser verification is required. Confirm Apply buttons in Mock AI Director Notes update only existing accepted shot effect settings or existing Shot Attention Path item motion/effect/cue timing fields. Confirm no Camera Shots, Focus Regions, or Shot Attention Paths are created by applying a director suggestion.

For T0081A - AI Suggestion Target Binding Guardrails, browser verification is required. Confirm path-item motion suggestions apply only when the target Camera Shot, Shot Attention Path item, and referenced Focus Region all exist. Confirm selected shots with no Shot Attention Path items show a blocked warning, stale Focus Region references are blocked, and shot-level Shake / Impact Pulse suggestions still apply without Focus Regions.

For T0082 - AI Draft Attention Path Spike, browser verification is required. Confirm Draft AI Attention Path creates a temporary suggestion from existing manual Focus Regions only, shows proposed motion roles and duration weights, and writes normal Shot Attention Path items only after explicit Accept.

For T0083 - AI Draft Shots/Focus Regions Planning, no browser verification is required. Review `docs/planning/AI_Draft_Shots_Focus_Regions_Planning.md` and confirm it treats future AI-suggested Camera Shots and Focus Regions as temporary reviewable suggestions only, requires explicit accept/reject/edit workflow, preserves ownership rules, and leaves source behavior unchanged.

For T0084 - Audio/BGM/SFX Suggestions Planning, no browser verification is required. Review `docs/planning/Audio_BGM_SFX_Suggestions_Planning.md` and confirm it treats future AI-assisted audio direction as advisory BGM/SFX suggestions only, explains why audio follows accepted director intent, preserves existing manual audio workflows as accepted project data, and leaves source behavior unchanged.

For T0085 - AI Director-Assistant Roadmap Reassessment, no browser verification is required. Review `docs/planning/AI_Director_Assistant_Roadmap_Reassessment.md` and confirm it recommends unified mock/review planning before real provider work, keeps accepted project data as the source of truth, and leaves source behavior unchanged.

For T0086 - Unified Suggestion Review Surface Planning, no browser verification is required. Review `docs/planning/Unified_Suggestion_Review_Surface_Planning.md` and confirm it covers current and future suggestion types, frames future vision/page understanding as the real AI value, keeps current mock notes as scaffolding, and leaves source behavior unchanged.

For T0087 - AI Vision Page Understanding Contract Planning, no browser verification is required. Review `docs/planning/AI_Vision_Page_Understanding_Contract_Planning.md` and confirm it defines a provider-neutral future vision response contract, keeps all outputs temporary and reviewable, leaves room for a later DynamicManga director rulebook and budget/provider decision gate, and leaves source behavior unchanged.

For T0088 - DynamicManga Director Rulebook / Knowledge Pack Planning, no browser verification is required. Review `docs/planning/DynamicManga_Director_Rulebook_Knowledge_Pack_Planning.md` and confirm it defines a director knowledge layer for future AI suggestions, maps page-understanding evidence to readable cinematic guidance, keeps all outputs temporary and reviewable, and leaves source behavior unchanged.

For T0089 - AI Budget / Provider Decision Gate Planning, no browser verification is required. Review `docs/planning/AI_Budget_Provider_Decision_Gate_Planning.md` and confirm it defines go/no-go criteria, provider selection criteria, budget/cost constraints, latency, cancellation, retry, rate limits, failure states, consent, privacy, copyright, data retention, provider disclosure, accepted-data boundaries, and leaves source behavior unchanged.

For T0090 - Real AI Page Understanding Spike, browser verification is required in a local dev session with `OPENAI_API_KEY` available in `.env.local`. If the local network requires V2Ray or another outbound proxy for Node/Vite server requests, also add `AI_HTTP_PROXY=http://127.0.0.1:10808` to `.env.local` and restart the Vite dev server. Upload a comic page, click `Analyze page with AI`, confirm the review UI shows temporary page-understanding output or a provider error, and confirm accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, and SFX markers do not change from analysis alone.

For T0090A - AI Review UI Cleanup and Stale Suggestion Control Removal, browser verification is required. Confirm the sidebar shows `AI Review` with `Analyze page with AI` as the primary action, no `Add Test Shot Suggestion` or `Add Test Focus Suggestion` buttons in the normal UI, compact/collapsible Overview, Page Understanding, Director Notes, Warnings, Usage, and Helper Drafts sections where applicable, and no accepted Camera Shot, Focus Region, Shot Attention Path, Project JSON, preview, export, audio, or SFX mutation from viewing AI review output.

For T0091 - AI Analysis Validation / Review Hardening, browser verification is required. Analyze a page and confirm normal provider output still renders in AI Review. Expand Page Understanding and confirm region groups use compact horizontal flashcard decks with only type/title visible until `Inspect card` is opened. Confirm validation or provider warnings appear in Warnings/provider-error cards. If a malformed/partial local fixture is available, confirm malformed output does not crash the review UI, unusable geometry is skipped, out-of-bounds geometry is clamped or warned, stale image metadata is marked, and accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, and SFX markers remain unchanged by analysis alone.

For T0092 - AI Page Understanding Card-to-Page Highlighting, browser verification is required. Analyze a page, expand Page Understanding, then hover, focus, and click cards from Panels, Characters / Faces, Speech, Details, and Action when present. Confirm the editor canvas shows a distinct review-only AI SVG highlight over the selected card's analyzed-image geometry, the active card is visibly highlighted in the deck, clicking a card keeps the highlight selected, and accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, and SFX markers remain unchanged. For the GPT-5.4 model test drive, add `OPENAI_AI_PAGE_MODEL=gpt-5.4` to `.env.local`, restart the Vite dev server, confirm the provider log shows the selected model, and confirm the latest-analysis status shows the provider model. If provider JSON parsing fails, confirm the local proxy reports incomplete/invalid page-analysis JSON rather than a raw parser crash; T0092 currently uses a higher `max_output_tokens` budget for the strict schema.

For T0093 - AI Director Suggestion Drafts from Page Understanding, browser verification is required in a local dev session with `OPENAI_API_KEY` available in `.env.local`. Set `OPENAI_AI_PAGE_MODEL=gpt-5.4`, restart the Vite dev server, upload the Garfield test page, run AI page understanding, then click `Generate AI Director Suggestions`. Confirm the AI Director Suggestions section shows temporary cards grouped by AI panel, uses only `track`, `pushIn`, and `pushOut`, references panel/region ids from the AI understanding result when available, includes speed/timing, confidence, reason, optional SFX/BGM note, and warning text when geometry is approximate or missing, remains useful even when character/speech/detail boxes are not pixel-perfect, and does not mutate Camera Shots, Focus Regions, Shot Attention Paths, Project JSON, preview, export, audio, or SFX markers. Run `npm.cmd run build`.

For editable detail highlights, browser verification is required. Upload a page and confirm the canvas can show the image with no Camera Shots. Click `Detail Highlight`, draw a detail box on the page, and confirm an accepted project detail card appears in AI Review / Details. Edit its label, description, and numeric geometry; drag/resize the detail box on the canvas; select the detail card and confirm its canvas highlight is selected; delete it and confirm only that accepted detail is removed. Enter invalid or out-of-bounds `x`, `y`, `width`, and `height` values and confirm accepted detail geometry stays inside the page, zero-area detail boxes are blocked, and a validation message appears when a numeric edit is clamped or invalid. After AI page understanding returns detail suggestions, accept one AI detail and confirm it becomes editable project data, reject another and confirm only the AI suggestion is hidden, then re-run AI understanding and confirm accepted/manual detail edits are not overwritten and the same accepted/rejected AI detail boxes stay hidden when their geometry returns with new transient ids. Confirm accepted detail cards are visually distinct from AI detail suggestion cards. Run `npm.cmd run build`.

For the post-T0096 merged roadmap planning update, no browser verification is required. Review `docs/Tickets.md` and `docs/Repo_Current_State.md`; confirm T0094, T0095, T0096, and T0097 are treated as implemented; confirm that update historically made T0098 - AI Director Suggestion Contract Planning the next recommended ticket; confirm T0098 through T0103 move from corrected page understanding to AI camera suggestions, user review, accepted suggestions becoming draft motion, fixture/evaluation, natural timing, and advisory audio/SFX notes; confirm each ticket keeps risky boundaries explicit and avoids automatic accepted-state mutation unless T0100 explicitly scopes user-accepted draft motion. Build is not required because the original merged-roadmap update was docs-only.

For T0098 - AI Director Suggestion Contract Planning, no browser verification is required. Review `docs/planning/AI_Director_Suggestion_Contract_Planning.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/README.md`; confirm the contract separates accepted corrected inputs from normalized raw AI page-understanding evidence, prefers accepted detail highlights over raw AI detail guesses, defines temporary camera suggestion records with target, movement role, timing hint, reason, confidence, review state, validation, and stale/blocking fields, limits movement roles to `track`, `pushIn`, and `pushOut`, keeps suggestions review-only, and leaves source behavior unchanged. Build is not required because T0098 is docs-only.

For T0099 - AI Camera Suggestion Review Surface, browser verification is required in a local dev session with `OPENAI_API_KEY` available in `.env.local`. Run AI page understanding, optionally correct or accept detail highlights, then generate AI Camera Suggestions. Confirm temporary review cards appear grouped by AI panel, show target/supporting references, movement role, timing hint, confidence, reason, validation warnings, and review status. Use Inspect controls to confirm AI targets highlight through the existing AI page-understanding overlay and accepted detail targets select the accepted detail highlight. Edit movement, timing, and reason; reject suggestions; confirm accepted project data remains unchanged. In current builds after T0100, `Create Draft Motion` should create only a temporary helper suggestion until that helper is explicitly accepted. Run `npm.cmd run build`.

For T0099A - AI Camera Suggestion UI Rework / Responsive Simplification Pass, browser verification is required in a local dev session with `OPENAI_API_KEY` available in `.env.local`. Open the app at the narrow sidebar width shown in the current review screenshots. Upload a practice image, run AI page understanding, and generate AI Camera Suggestions. Confirm the AI Review header shows `Analyze page with AI` and a compact `Latest: ...` status line. Confirm the summary row uses readable compact pills such as Evidence, Camera, Drafts, and Audio with counts, with no split words. Confirm sections are labeled Evidence, Camera, Drafts, and Audio. Confirm Camera Suggestion cards do not overlap, action buttons do not cover text, and no normal UI word is split into letter fragments. Confirm default camera cards show only title/status, motion summary, one short reason, and `Draft` / `Reject`, while long reason text, target ids, geometry, warnings, and raw evidence stay behind Inspect. Create Draft Motion from a camera suggestion and confirm it appears as a visually distinct temporary Drafts item, not accepted project data. Reject a camera suggestion and confirm accepted Camera Shots, Focus Regions, Shot Attention Path records, Project JSON export data, preview/export, audio, and SFX markers are unchanged. Reject Draft Motion and confirm accepted project data is unchanged. Accept Draft Motion and confirm only then normal Camera Shot, Focus Region, and Shot Attention Path records are created. Generate Audio Notes if accepted shots exist and confirm notes remain read-only/advisory with no audio apply behavior. Run `npm.cmd run build`.

For T0100 - Accepted Suggestion to Draft Motion, browser verification is required in a local dev session with `OPENAI_API_KEY` available in `.env.local`. Run AI page understanding, generate AI Camera Suggestions, then click `Create Draft Motion` on a usable, non-stale suggestion. Confirm a temporary Draft Motion helper suggestion appears, the canvas shows temporary shot/focus overlays, and no accepted Camera Shot, Focus Region, Shot Attention Path, Project JSON export data, preview/export behavior, audio, or SFX marker changes occur before accepting the helper. Click `Analyze page with AI` again and confirm the previous page-understanding cards, AI Camera Suggestions, AI-derived helper suggestions, Draft Motion overlays, selected AI highlight, and hidden/rejected AI detail suggestions are cleared for a clean new analysis while accepted project objects remain. Reject one Draft Motion helper and confirm accepted project data remains unchanged. Accept another Draft Motion helper and confirm it creates one editable Camera Shot, draft-derived Focus Regions, and ordered Shot Attention Path items with `track`, `pushIn`, or `pushOut` only. Confirm blocked/stale/rejected/already-drafted AI camera suggestions cannot create duplicate draft motion. Run `npm.cmd run build`.

For T0100A - Track v2 Stable-Scale Eye-Guidance Motion, browser verification is required. Create or load a shot with at least three Focus Regions of different sizes and set their Shot Attention Path roles to `track`. In Preview Auto, confirm the camera calmly pans/glides from FR to FR with mostly stable scale, smooth ease-in-out travel, and readable arrival/settle timing; confirm there is no default dimmed follow-spot, rail, aperture, or flashlight-like overlay. Change one anchor to `pushIn` and confirm it still makes a deliberate close/emphasis move. Change one anchor to `pushOut` and confirm it still restores/reveals context. Export video and confirm canvas export visually matches the Track v2 behavior. Generate or review AI camera suggestions and confirm ordinary multi-FR reading flow uses `track` unless the suggestion reason clearly supports emphasis, inspection, reveal, or context restoration. Run `npm.cmd run build`.

For T0101 - Practice Fixture and Evaluation Pass, no browser verification is required. Review `docs/planning/Practice_Fixture_Evaluation_Pass.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/README.md`; confirm the practice set covers simple dialogue, emotional close-up, establishing panel, two-character conversation, action page, and multi-detail page; confirm Garfield/simple comic pages are optional local/legal practice material only and are not bundled; confirm pass/fail notes cover panel ordering, detail correction, motion role suggestions, timing hints, and Draft Motion usefulness; confirm no source files changed. Build is not required because T0101 is docs-only.

For T0102 - Motion Naturalness and Timing Pass, browser verification is required. Use the T0101 practice set where available and compare dialogue/gag, reaction/emotion, establishing, action, and multi-detail Draft Motion or accepted attention paths. Confirm `track` glides and then settles instead of moving for the full beat, `pushIn` arrives with stronger but restrained emphasis and leaves readable settle time, and `pushOut` holds the close view slightly longer before expanding to context. Confirm browser preview and canvas export match for the changed timing, manual duration/hold/focus/weight controls remain editable and authoritative, and no new motion roles, parallax, character cutouts, face tracking, OCR timing, foreground animation, AI regeneration, audio/SFX behavior, Project JSON schema changes, or dependencies were added. Run `npm.cmd run build`.

For T0102A - AI Camera Suggestion Density Guardrails, browser verification is required. Use the T0101 practice scenarios and generate AI Camera Suggestions. Confirm a simple dialogue strip does not create motion for every speech balloon; a two-character conversation favors a small `track` path; an emotional close-up may justify one `pushIn`; an establishing panel preserves context; an action page can use sharper timing without unsupported roles; and a multi-detail page prefers accepted/corrected details over raw AI guesses. Confirm density guardrail warnings appear when raw provider suggestions or supporting targets are trimmed, Draft Motion creates only the Focus Regions needed for the selected suggestion/path, and blocked/stale/rejected/already-drafted suggestions still cannot create duplicate Draft Motion. Confirm AI Page Understanding, AI Camera Suggestions, and Draft Motion helpers remain temporary/review-only until explicit acceptance, accepted project data remains the source of truth, Project JSON schema is unchanged, and no audio/SFX suggestion behavior, OCR timing, parallax, character cutouts, segmentation animation, or automatic accepted-state mutation was added. Run `npm.cmd run build`.

For T0103 - Audio/SFX Suggestion Pass, no browser verification is required. Review `docs/planning/Audio_SFX_Suggestion_Pass.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/README.md`; confirm it defines advisory BGM/SFX note fields, target binding, review behavior, stale/blocked states, and provider/privacy/licensing caveats; confirm notes bind only to accepted Camera Shots, accepted Shot Attention Path items, accepted Focus Regions, existing accepted audio metadata, or Draft Motion output after explicit acceptance into normal project data; confirm temporary AI Page Understanding, AI Camera Suggestions, Draft Motion helpers, and future audio notes are not accepted export source-of-truth data; confirm the plan avoids automatic audio fetching, downloading, generation, copyrighted asset recommendations, hidden downloads, SFX marker placement, Project JSON suggestion persistence, preview/export changes, source behavior changes, OCR, dialogue, narration, and dependencies; confirm no source files changed. Build is not required because T0103 is docs-only.

For T0104 - Read-Only Audio Suggestion Notes UI, browser verification is required. Upload or import a project with accepted Camera Shots, open AI Review / Audio Notes, and click `Generate Audio Notes`. Confirm notes appear with kind, target, timing, confidence, status, reason, warnings, and provider-neutral search terms where applicable. Confirm `Copy Terms` copies only search terms and marks the temporary note copied without changing Background Audio, SFX markers, Camera Shots, Focus Regions, Shot Attention Path data, preview, export, or Project JSON. Confirm `Reject` hides the note for the current temporary review session without changing accepted data. Delete or change an accepted target referenced by a note and confirm the note becomes stale instead of applying changes. Export Project JSON / archive and confirm temporary audio notes are not persisted. Confirm no automatic audio fetching, downloading, uploading, generation, SFX marker placement, accepted audio setting mutation, OCR, dialogue, narration, or provider call was added. Run `npm.cmd run build`.

For T0105 - Audio Suggestion Apply Guardrails Planning, no browser verification is required. Review `docs/planning/Audio_Suggestion_Apply_Guardrails_Planning.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/README.md`; confirm it limits future apply behavior to existing accepted Background Audio settings or existing accepted SFX marker settings only; confirm new SFX marker creation, audio fetching/downloading/generation, provider integration, Project JSON suggestion persistence, preview/export changes, OCR, dialogue, and narration remain out of scope; confirm stale/blocked rules prevent mutation when accepted targets change, disappear, or have out-of-bounds proposed values; confirm no source files changed. Build is not required because T0105 is docs-only.

For T0106 - Director Rulebook v1 Planning, no browser verification is required. Review `docs/planning/Director_Rulebook_v1_Planning.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/README.md`; confirm it defines a shared director/taste layer for AI Camera Suggestions, Draft Motion, timing hints, BGM notes, SFX notes, and future apply guardrails; confirm accepted/corrected project data outranks raw AI detections; confirm the beat taxonomy maps only to `track`, `pushIn`, and `pushOut`; confirm speech regions mostly inform timing/hold instead of automatic motion targets; confirm audio remains advisory/review-only; confirm runtime integration is deferred to T0107; confirm no source files changed. Build is not required because T0106 is docs-only.

For T0106A - Track Chain Entry Continuity Repair, browser/export verification is required. Create one Camera Shot with three Focus Regions in its attention path: FR1 = `pushIn`, FR2 = `track`, and FR3 = `track`; confirm browser preview smoothly travels from the pushed-in FR1 close-up into FR2 before tracking to FR3. Compare `pushIn -> track -> pushIn`, `pushOut -> track -> track`, `track -> track -> track`, and `track -> pushIn -> track`; confirm same-role `track -> track` remains stable-scale and calm. Confirm Shot Starts At = First focus still works. Export video and confirm canvas export matches browser preview for the repaired case. Run `npm.cmd run build`.

For T0107 - Director Rulebook Runtime Integration, browser verification is required in a local dev session with `OPENAI_API_KEY` available in `.env.local`. Run AI page understanding, optionally add/correct accepted detail highlights and accepted Focus Regions, then generate AI Camera Suggestions. Confirm temporary camera review cards stay review-only, cite Director Rulebook beat reasoning or warnings where motion/timing was constrained, use only `track`, `pushIn`, and `pushOut`, prefer accepted/corrected details over raw AI detail guesses, and still honor T0102A density guardrails. Create Draft Motion from a usable card and confirm it remains a temporary helper until explicit acceptance. Generate Audio Notes and confirm BGM notes describe page/sequence mood, SFX notes are tied only to accepted visible action/detail/reaction/effect-cue beats, speech regions produce restraint notes instead of SFX cues, and no audio assets or markers are created. Confirm no Project JSON schema, accepted-state mutation, audio apply behavior, OCR timing, provider page-analysis behavior, parallax, character cutouts, segmentation animation, or new motion roles were added. Run `npm.cmd run build`.

For T0107A - AI Motion Suggestion Overlap Consolidation, browser verification is required in a local dev session with `OPENAI_API_KEY` available in `.env.local`. Use a Garfield-style page or similar simple comic where ACTION and FACE detections overlap on the same character, then run AI page understanding and generate AI Camera Suggestions. Confirm overlapping ACTION / FACE / DETAIL detections in the same panel become one primary motion suggestion with supporting targets or rulebook warnings instead of separate redundant motions. Confirm DETAIL inside or attached to the same ACTION/FACE area does not become its own motion unless accepted/corrected or clearly story-critical. Confirm dialogue/speaker exchange prefers `track` or no extra push-in, emotional close-up can still justify one `pushIn`, action-follow prefers `track` unless the reason is a tight impact/payoff, and only `track`, `pushIn`, and `pushOut` appear. Create Draft Motion from a kept suggestion and confirm the temporary helper creates fewer Focus Regions than raw AI detections. Confirm manual editing, accepting/rejecting suggestions, project import/export, and preview playback still work. Run `npm.cmd run build`.

For T0107B - AI Draft Panel-First Continuity Tuning, browser verification is required in a local dev session with `OPENAI_API_KEY` available in `.env.local`. Run AI page understanding and generate AI Camera Suggestions on a normal comic page. Create Draft Motion from representative suggestions and confirm the baseline is one detected panel becoming one draft shot, with the shot crop framing the whole panel or main readable panel area rather than every detected target. Confirm redundant Focus Regions are skipped when the shot crop already covers the intended target, and a one-beat panel often has 0 or 1 path item. Confirm speaker-to-speaker, setup-to-payoff, or action-to-reaction panels may have 2 path items and that those shots have longer duration than equivalent 0-1 path-item shots. Confirm adjacent panels continuing the same character/action/conversation look restrained, using track/hold/soft emphasis rather than repeated aggressive push-ins. Confirm manual editing, accepting/rejecting suggestions, preview playback, Project JSON import/export, and archive behavior still work. Run `npm.cmd run build`.

For T0108 - Rulebook Evaluation Pass, no browser verification is required. Review `docs/planning/Rulebook_Evaluation_Pass.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/README.md`; confirm the report evaluates simple dialogue, emotional close-up, establishing panel, two-character conversation, action page, and multi-detail page; confirm it compares density, target selection, motion-role choice, timing clarity, Draft Motion usefulness, and audio-note restraint before/after rulebook integration; confirm it separates deterministic rulebook findings from provider-dependent page-understanding quality and does not claim live provider results or bundled fixture assets; confirm no source files changed. Build is not required because T0108 is docs-only.

For T0109 - Rulebook Evaluation Findings Tuning, source review and build verification are required. Review `src/lib/directorRulebook.ts` and confirm the prompt summary adds only restrained speaker-exchange/setup-payoff guidance and the text classifier still maps into the existing beat taxonomy. Review `src/app/App.tsx` and confirm warning text for density trimming, beat clustering, dialogue restraint, raw-detail evidence, and timing readability is clearer without adding new accepted-state mutation, provider routes, Project JSON fields, audio behavior, OCR timing, parallax, cutouts, segmentation animation, or motion roles. Review `docs/planning/Rulebook_Evaluation_Pass.md`, `docs/Tickets.md`, and `docs/Repo_Current_State.md`; confirm T0109 documents only narrow prompt/classification/warning tuning and recommends T0110 - Practice Page Provider Evaluation Run. Run `npm.cmd run build`.

For T0110 - Practice Page Provider Evaluation Run, no browser verification is required for the docs-only completion record. Review `docs/planning/Practice_Page_Provider_Evaluation_Run.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, `docs/Manual_Verification_Guide.md`, and `docs/README.md`; confirm the report explicitly says live provider evaluation was not completed in this workspace session; confirm it makes no claims about provider page-order quality, speech-to-speaker association, detail recall, camera suggestion quality, Draft Motion usefulness, or audio-note usefulness; confirm no fixture assets were added; confirm no source behavior, provider route, Project JSON schema, preview/export behavior, audio/SFX behavior, dependency, OCR timing, parallax, cutout, segmentation animation, motion role, or accepted-state mutation changed; confirm T0111 - Manual Provider Practice Run With User-Selected Pages is the next recommended ticket. Build is optional because T0110 is docs-only.

For T0111 - Manual Provider Practice Run With User-Selected Pages, provider-route verification has been run with user-supplied local images. Review `docs/planning/Manual_Provider_Practice_Run_With_User_Selected_Pages.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, and `docs/README.md`; confirm it records real `gpt-5.4` provider output for four practice images; confirm AI Page Understanding completed through `/api/analyze-page` and provider AI Director Suggestions completed through `/api/generate-director-suggestions` for all four images; confirm it does not claim the full browser AI Camera Suggestions review surface, browser Draft Motion, or Audio Notes were run; confirm no fixture assets were added by this ticket; confirm no source behavior, provider route, Project JSON schema, preview/export behavior, audio/SFX behavior, dependency, OCR timing, parallax, cutout, segmentation animation, motion role, or accepted-state mutation changed; confirm T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed. Run `npm.cmd run build`.

For T0112 - Browser Draft Motion and Audio Notes Practice Verification, review `docs/planning/Browser_Draft_Motion_Audio_Notes_Practice_Verification.md`, `docs/Tickets.md`, and `docs/Repo_Current_State.md`; confirm the report records both the initial agent automation limitation and the later user manual browser verification pass. Confirm AI Page Understanding, AI Review highlighting, AI Camera Suggestions, Draft Motion helper creation, manual review boundaries, and read-only Audio Notes were accepted by user manual verification after T0112A audio-note simplification. Confirm no repeated browser-specific failure is documented and no provider route, Project JSON schema, accepted-state automation, audio fetching/generation/SFX placement, OCR timing, parallax, cutout, segmentation animation, or new motion role changed for T0112. Run `npm.cmd run build`.

For T0112A - Audio Notes Simplicity Tuning, browser verification is required. Accept at least one representative Draft Motion helper so Audio Notes can use accepted Camera Shots, then click `Generate Audio Notes`. Confirm only one page-level BGM note appears for the whole page, and on a casual/family/daily-life page it suggests a soft peaceful daily-life or light family-comedy bed rather than panel-by-panel scoring. Confirm SFX notes are sparse: explicit accepted effect cues and strong action-impact beats may produce cues, but soft character entrances, ordinary dialogue, mild reactions, and normal detail inspection do not each create SFX notes. Confirm notes remain temporary/read-only with copy/reject only, and no audio asset, Background Audio setting, SFX marker, Project JSON/archive, preview, or export data changes. Run `npm.cmd run build`.

Use at least one tall comic page, one wide image, and one larger image if available. Confirm image aspect ratio is preserved and overlays stay aligned when the browser window changes size.

## Current App Checklist

Current browser-preview grammar is only `track`, `pushIn`, and `pushOut`, with `Shot Starts At` as a per-shot start-framing control for accepted first-focus starts. Shot-to-shot travel also uses the accepted subtle travel veil: smoother eased travel, a midpoint dim/softness peak, and a clear image again on arrival. Sections marked Historical/Legacy document older tickets or compatibility checks; do not treat them as current product behavior.

### Special Effects Direction Plan

- Review `docs/planning/Special_Effects_Direction_Plan.md`.
- Confirm special effects are defined as optional rendering-layer modifiers on top of already resolved camera placement.
- Confirm special effects do not decide where the camera goes and do not create new Camera Shot geometry, Focus Region ownership rules, Shot Attention Path ownership, timeline ownership systems, or motion roles.
- Confirm the active camera grammar remains `track`, `pushIn`, and `pushOut`.
- Confirm allowed MVP+ effect candidates are camera shake, flash / impact pulse, vignette / tension dim, and cautious motion blur.
- Confirm the plan describes storytelling use, per-shot/global scope, preview behavior, export behavior, and risks for each allowed effect.
- Confirm parallax, character cutouts, face tracking, AI-driven emphasis, moving real manga motion lines, segmentation-dependent foreground animation, and punch-in as a separate motion grammar are delayed or forbidden.
- Confirm impact pulse is allowed only as a temporary visual modifier on top of existing camera placement, not as a new camera role competing with `pushIn`.
- Confirm Project JSON schema changes are delayed until preview-only experiments prove useful.
- Confirm future UI direction is preset-first: None, Subtle tension, Impact, Fast action, and Dramatic focus.
- Confirm accepted effects require eventual export parity, while preview-only spikes remain experimental.
- Confirm future implementation tickets must verify effect off looks identical to the accepted baseline, effects do not mutate shot boxes or Focus Regions, effects stack on top of `track` / `pushIn` / `pushOut`, export parity matches preview closely enough once accepted, and effects do not reintroduce old demoted concepts like reveal/lift/spotlight/zoom as separate grammar.
- Confirm no `src/`, package, Project JSON schema, preview, export, UI, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.
- Build is not required because T0073 is docs-only.

### AI Director Suggestions Planning

- Review `docs/planning/AI_Director_Assistant_Roadmap.md`.
- Confirm the plan defines AI as a director-assistant layer, not an auto-generator.
- Confirm AI suggestions are reviewable and manually accepted before they affect project data.
- Confirm first-phase AI may read existing project context but does not automatically create Camera Shots, Focus Regions, or Shot Attention Paths.
- Confirm the suggestion output contract includes target reference, mood, suggested motion role, suggested effect, cue timing idea, timing idea, reason, and confidence/caution.
- Confirm accepted motion roles remain limited to `track`, `pushIn`, and `pushOut`.
- Confirm Shake and Impact Pulse are supporting mood/timing layers, not replacements for camera movement.
- Confirm T0080 through T0084 are listed in `docs/Tickets.md`.
- Confirm T0080 - AI Director Suggestions UI Spike is listed as the follow-up UI ticket and that current state now points through T0081A before T0082.
- Confirm no source, package, Project JSON schema, preview, export, OCR, panel detection, dependency, audio editing, or multi-page behavior changed.
- Build is not required because T0079 is docs-only.

### AI Director Suggestions UI Spike

- Upload or import a project with at least one Camera Shot.
- Confirm the inspector sidebar shows a Mock AI Director Notes panel.
- Confirm each visible director note includes target, mood, motion role, effect, cue timing, confidence, and reason.
- Select a Camera Shot and confirm the notes update to that selected-shot context.
- Add Shot Attention Path items and confirm the panel can show path-item notes referencing existing Focus Regions.
- Confirm T0081 now owns the Apply controls and that merely viewing notes does not change Camera Shots, Focus Regions, Shot Attention Paths, effect settings, cue timing, or shot timing.
- Export Project JSON and confirm no unaccepted AI director suggestions are persisted.
- Confirm preview and canvas export behavior remain based only on accepted project data.
- Run `npm.cmd run build`.

### AI Suggestion Accept/Apply Spike

- Upload or import a project with at least one Camera Shot.
- Apply a shot-level Mock AI Director Note and confirm only the selected existing shot's Effect Preset changes to None, Shake, or Impact Pulse.
- Create existing Focus Regions and an existing Shot Attention Path item, then apply a path-item director note.
- Confirm the existing path item's Motion Role updates only to `track`, `pushIn`, or `pushOut`.
- Confirm the existing path item's Shake Cue or Impact Cue updates as an accepted once cue when the suggestion includes Shake or Impact Pulse.
- Confirm the existing path item's Cue Timing updates to Early or Arrival.
- Confirm applying a note selects the affected existing Camera Shot and shows a project status message.
- Confirm no new Camera Shots, Focus Regions, or Shot Attention Path records are created by applying a director note.
- Confirm manual inspector controls can revise or clear the applied fields.
- Export/import Project JSON and confirm only accepted applied fields persist.
- Run `npm.cmd run build`.

### AI Suggestion Target Binding Guardrails

- Select a shot with no Focus Regions and no Shot Attention Path. Confirm the Mock AI Director Notes panel still offers shot-level effect suggestions and shows: "No Shot Attention Path items available. Add Focus Regions to this shot's attention path before applying motion suggestions."
- Select a shot that has page-level Focus Regions available but no Shot Attention Path items. Confirm no motion Apply button appears until the user manually adds Focus Regions to that shot's attention path.
- Select a shot with valid Shot Attention Path items. Confirm path-item suggestions target existing path items and applying one updates only that item.
- Delete or import a project where a Shot Attention Path item references a missing Focus Region. Confirm the suggestion is blocked with: "This suggestion is blocked because its Focus Region target is missing."
- Confirm shot-level Shake and Impact Pulse suggestions still work without Focus Regions because they apply only existing shot-level effect settings.
- Confirm no Camera Shots, Focus Regions, or Shot Attention Path items are created by the Mock AI Director Notes panel.
- Run `npm.cmd run build`.

### AI Draft Attention Path Spike

- Create or select one existing Camera Shot and several existing manual Focus Regions that overlap the shot.
- Click Draft AI Attention Path and confirm the temporary suggestion appears in the Suggestions panel.
- Confirm each draft item references an existing Focus Region and shows a proposed `track`, `pushIn`, or `pushOut` role, duration weight, and reason.
- Confirm creating the draft does not mutate the selected Camera Shot's accepted Shot Attention Path.
- Accept the draft and confirm the selected shot receives normal editable Shot Attention Path items with the suggested roles and duration weights.
- Reject another draft and confirm the existing accepted Shot Attention Path remains unchanged.
- Delete or otherwise stale one referenced Focus Region before accepting and confirm the draft is blocked instead of creating a broken path.
- Confirm no Camera Shots or Focus Regions are created.
- Run `npm.cmd run build`.

### AI Draft Shots/Focus Regions Planning

- Review `docs/planning/AI_Draft_Shots_Focus_Regions_Planning.md`.
- Confirm the plan is documentation-only and does not claim real AI provider calls or source behavior exist.
- Confirm suggested Camera Shots and Focus Regions are temporary reviewable suggestions only.
- Confirm accepted project data changes only through explicit user acceptance.
- Confirm the plan preserves Camera Shots as page-level reading containers and Focus Regions as page-level reusable attention targets.
- Confirm the plan defines stale or blocked suggestion cases, including changed images, missing targets, out-of-bounds geometry, duplicates, and unsupported fields.
- Confirm Project JSON/archive persistence and schema decisions remain open until a later ticket.
- Confirm privacy, copyright, provider disclosure, consent, cancellation, and failure states are called out before any real AI image upload.
- Confirm no source files changed.
- Build is not required because T0083 is docs-only.

### Audio/BGM/SFX Suggestions Planning

- Review `docs/planning/Audio_BGM_SFX_Suggestions_Planning.md`.
- Review `docs/planning/Audio_SFX_Suggestion_Pass.md` for the post-T0102A focused T0103 contract.
- Confirm the plan is documentation-only and does not claim real AI provider calls, source behavior, audio editing, audio generation, fetching, or downloading exist.
- Confirm audio suggestions are advisory until explicit user action.
- Confirm the plan explains why audio follows accepted shot mood, timing, motion intent, Shot Attention Path beats, and accepted effect cues.
- Confirm existing Background music and Sound effects marker workflows remain the accepted project data path.
- Confirm SFX suggestions bind only to existing project, shot, or Shot Attention Path targets and do not automatically create hidden audio tracks or markers.
- Confirm T0104's read-only or copy-assist UI keeps notes temporary and does not imply automatic apply behavior.
- Confirm Project JSON/archive persistence for unaccepted suggestions remains an open decision.
- Confirm no source files changed.
- Build is not required because T0084 is docs-only.

### AI Director-Assistant Roadmap Reassessment

- Review `docs/planning/AI_Director_Assistant_Roadmap_Reassessment.md`.
- Confirm the plan is documentation-only.
- Confirm it chooses unified mock/review workflow planning before real provider work.
- Confirm it recommends T0086 - Unified Suggestion Review Surface Planning as the next ticket.
- Confirm it keeps accepted project data as the source of truth.
- Confirm it keeps real provider calls, automatic generation, audio fetching/downloading, automatic SFX placement, Project JSON schema changes, source behavior, preview behavior, and export behavior out of scope.
- Confirm no source files changed.
- Build is not required because T0085 is docs-only.

### Unified Suggestion Review Surface Planning

- Review `docs/planning/Unified_Suggestion_Review_Surface_Planning.md`.
- Confirm the plan is documentation-only.
- Confirm it covers director notes, draft attention paths, draft Camera Shot / Focus Region candidates, audio/BGM/SFX suggestions, and future vision/page-understanding suggestions.
- Confirm it explicitly says future vision suggestions are the real AI value and JSON/mock notes are scaffolding.
- Confirm it defines target, type, confidence, reason, warning, stale/blocked state, and accept/reject/edit actions.
- Confirm accepted project data remains the source of truth and suggestions remain temporary until explicit user action.
- Confirm the historical T0087 recommendation has since been superseded by T0088 through T0111, and T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.
- Confirm it keeps source behavior, Project JSON schema changes, provider/API code, preview/export behavior, real AI calls, and automatic generation out of scope.
- Confirm no source files changed.
- Build is not required because T0086 is docs-only.

### AI Vision Page Understanding Contract Planning

- Review `docs/planning/AI_Vision_Page_Understanding_Contract_Planning.md`.
- Confirm the plan is documentation-only.
- Confirm it defines future vision response fields, target types, confidence, reasons, warnings, stale/blocked rules, validation needs, consent/provider/privacy notes, and failure states.
- Confirm it covers panels, reading order, characters/faces, speech/detail/action regions, mood, shot candidates, Focus Region candidates, Shot Attention Path/motion intent, and audio direction.
- Confirm all outputs remain temporary reviewable suggestions.
- Confirm accepted project data remains the source of truth.
- Confirm it leaves room for a later DynamicManga/article-derived director rulebook.
- Confirm it leaves room for a later AI budget/provider decision gate before real API integration.
- Confirm the historical T0088 recommendation has since been completed by T0089 through T0111, and T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.
- Confirm it keeps source behavior, Project JSON schema changes, provider/API code, real AI calls, preview/export behavior, suggestion persistence, and automatic generation out of scope.
- Confirm no source files changed.
- Build is not required because T0087 is docs-only.

### DynamicManga Director Rulebook / Knowledge Pack Planning

- Review `docs/planning/DynamicManga_Director_Rulebook_Knowledge_Pack_Planning.md`.
- Confirm the plan is documentation-only.
- Confirm it defines a DynamicManga/article-derived director rulebook or knowledge pack.
- Confirm it defines guidance for page context preservation, reading order, speech-heavy pacing, action emphasis, readable `track` / `pushIn` / `pushOut` motion, mood/effects, and audio direction.
- Confirm it maps normalized page-understanding evidence to temporary reviewable suggestions.
- Confirm accepted project data remains the source of truth.
- Confirm the historical T0089 recommendation has since been completed by T0090 through T0111, and T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.
- Confirm it keeps source behavior, Project JSON schema changes, provider/API code, real AI calls, preview/export behavior, suggestion persistence, and automatic generation out of scope.
- Confirm no source files changed.
- Build is not required because T0088 is docs-only.

### AI Budget / Provider Decision Gate Planning

- Review `docs/planning/AI_Budget_Provider_Decision_Gate_Planning.md`.
- Confirm the plan is documentation-only.
- Confirm it defines go, go-with-limits, and no-go outcomes before real provider/API implementation.
- Confirm it defines provider selection criteria for comic-page vision capability, structured output reliability, cost, privacy terms, rate limits, API stability, and mock fallback support.
- Confirm it defines budget constraints for image size, call count, retry count, per-page cost, regeneration, and whether accepted project context or director-rulebook guidance is sent.
- Confirm it defines latency, pending state, cancellation, retry, rate-limit, quota, timeout, malformed-response, partial-response, and no-useful-suggestions failure states.
- Confirm it defines consent, provider disclosure, privacy, copyright, and data-retention requirements before sending comic page images to a provider.
- Confirm accepted project data remains the source of truth.
- Confirm all AI outputs remain temporary reviewable suggestions.
- Confirm the historical T0090 recommendation has since been completed through T0111 - Manual Provider Practice Run With User-Selected Pages and T0112 - Browser Draft Motion and Audio Notes Practice Verification has since been completed.
- Confirm it keeps source behavior, provider/API code, real AI calls, credentials/settings UI, Project JSON schema changes, suggestion persistence, preview/export behavior, and automatic generation out of scope.
- Confirm no source files changed.
- Build is not required because T0089 is docs-only.

### Real AI Page Understanding Spike

- Confirm `.env.local` contains `OPENAI_API_KEY` locally and that the key is not committed.
- Optional model test override: add `OPENAI_AI_PAGE_MODEL=gpt-5.4` to `.env.local` to test GPT-5.4 page-understanding geometry. Restart the Vite dev server after changing this env value.
- If direct provider calls time out locally, add `AI_HTTP_PROXY=http://127.0.0.1:10808` to `.env.local`; `HTTPS_PROXY` and `HTTP_PROXY` are also accepted fallbacks. Restart the Vite dev server after changing proxy env.
- Start the normal Vite dev server for manual browser verification.
- Upload a comic page.
- Click `Analyze page with AI` in the Suggestions panel.
- Confirm the uploaded page is analyzed through the local `/api/analyze-page` provider proxy and the server-side OpenAI endpoint remains `https://api.openai.com/v1/responses`.
- Confirm timeout errors mention the optional local proxy setting, missing-key errors mention `OPENAI_API_KEY`, and provider HTTP failures show a provider error without exposing the API key.
- Confirm the UI shows temporary page summary, mood, reading order, panels, character/face regions, speech/detail/action regions, confidence, warnings, usage, or provider error.
- Confirm analysis results clear after uploading/replacing the page or importing another project.
- Confirm Camera Shots, Focus Regions, Shot Attention Paths, Project JSON export/import, preview, video export, background audio, and SFX markers do not change from analysis alone.
- Confirm no automatic repeated analysis starts without clicking the action again.
- Run `npm.cmd run build`.

### AI Page Understanding Card-to-Page Highlighting

- Confirm `.env.local` contains `OPENAI_API_KEY`; optionally set `OPENAI_AI_PAGE_MODEL=gpt-5.4` for the current model-quality test drive.
- Restart the Vite dev server after changing `.env.local` or provider code.
- Upload the Garfield 547x365 test page when available.
- Click `Analyze page with AI` and confirm the local provider log prints `[ai-page-understanding] model` with the selected model.
- Confirm the returned analysis follows the strict app schema: `schemaName: "comicPageUnderstanding"`, `schemaVersion: 1`, top-level `mood`, string confidence enums, region-level `geometrySpace: "analyzedImage"`, and no nested `geometry.geometrySpace`.
- Expand Page Understanding and hover/click panel cards first. Confirm the SVG highlight aligns with panel geometry at zoom 1 and after editor zoom/pan.
- Then check character, speech, detail, and action cards. Confirm highlights remain review-only and do not mutate accepted project data.
- If the provider returns incomplete JSON, confirm the app shows a readable incomplete/invalid page-analysis JSON error and not a raw `Unterminated string` crash.
- Run `npm.cmd run build`.

### AI Review UI Cleanup and Stale Suggestion Control Removal

- Upload or import a comic page.
- Confirm the right sidebar shows `AI Review`, not a generic Suggestions/test-suggestion workflow.
- Confirm `Analyze page with AI` is the primary visible action.
- Confirm `Add Test Shot Suggestion` and `Add Test Focus Suggestion` are not visible in the normal UI.
- Confirm latest AI analysis status appears compactly under the primary action.
- Run or review an AI analysis and confirm Overview is visible while Page Understanding and Usage remain collapsible.
- Confirm Warnings appears only when provider analysis has warnings or a provider error.
- Open Director Notes and confirm they are labeled as local notes derived from accepted project data, not provider page understanding.
- Open Helper Drafts and confirm the action is named `Draft path from existing Focus Regions` and described as a manual helper using existing Focus Regions only.
- Confirm helper draft suggestions, if created, remain temporary until explicit Accept/Reject.
- Confirm viewing AI Review output does not mutate accepted Camera Shots, Focus Regions, Shot Attention Paths, Project JSON export/import, preview, video export, background audio, or SFX markers.
- Run `npm.cmd run build`.

### Canvas Export Effect Parity

- Export an effect-off project and compare against the accepted current export baseline.
- Enable shot-level Shake, Impact Pulse, and Shake + Impact Pulse on representative shots and confirm export matches browser preview closely enough.
- Confirm shot-level Impact Pulse does not flash during incoming travel from the previous shot.
- Assign Shake Cue Once and Repeat to Shot Attention Path items and confirm export shake starts as attention arrives, without a settled pause on the target FR, and remains limited to the active beat.
- Assign Impact Cue Once and Repeat to Shot Attention Path items and confirm export pulses as attention arrives or repeats after arrival while the beat is active.
- Assign a cue to a `pushOut` path item and confirm the effect starts shortly before the push-out completes, not after a visible hold on the completed frame.
- Confirm exported effects stack on top of `track`, `pushIn`, and `pushOut` camera placement without changing camera targets.
- Confirm the exported track follow-spot stays aligned with shaken image content.
- Confirm text-heavy panels remain readable and no empty edges appear during shake.
- Confirm background audio and sound effect markers still export as before.
- Run `npm.cmd run build`.

### Attention Cue Timing Presets

- Create one Camera Shot with at least two Focus Regions in its Shot Attention Path.
- Assign Shake Cue or Impact Cue to one path item.
- Set Cue Timing to Early and confirm the cue runs during motion and ends when the camera reaches the destination position.
- Set Cue Timing to Arrival and confirm the cue starts when the camera reaches the destination position and runs during the remaining settle/hold portion.
- Confirm the Cue Timing control does not expose an Impact option.
- Assign a cue to a `pushOut` path item and confirm Early and Arrival remain later than equivalent `track` or `pushIn` timing.
- Export the same timing cases and confirm canvas export broadly matches browser preview timing.
- Export Project JSON and confirm `attentionPath[].effectCueTiming` appears only for path items with accepted cues and a selected timing value.
- Import Project JSON with valid `early` and `arrival` values and confirm the Cue Timing control restores.
- Import malformed cue timing values and confirm they behave as Arrival/default without corrupting cue controls.
- Run `npm.cmd run build`.

### Camera Shake Preview Spike

- Upload an image and create at least one Camera Shot with accepted Shot Attention Path anchors.
- Toggle Shake off and preview a baseline `track`, `pushIn`, and `pushOut` sequence.
- Toggle Shake on and preview the same sequence.
- Confirm shake appears only as a visual jitter layered on top of the existing camera placement.
- Confirm `track`, `pushIn`, and `pushOut` still move to the same underlying camera targets.
- Confirm the track follow-spot stays aligned with the shaken image.
- Confirm shake does not expose empty clipped-shot edges when the shot is near the source image boundary.
- Toggle Shake off again and confirm preview returns to the accepted baseline.
- Confirm Shake is a local preview control and is not persisted in Project JSON.
- Export Project JSON and confirm no special-effect or shake fields were added.
- Confirm canvas export behavior is unchanged if checked.
- Confirm shot boxes, Focus Regions, and Shot Attention Path data are not mutated.
- Run `npm.cmd run build`.

### Historical Flash / Vignette / Motion Blur Preview Spike

- Upload an image and create Camera Shots that exercise `track`, `pushIn`, and `pushOut`.
- Toggle Flash off and preview the accepted baseline.
- Toggle Flash on and preview the same sequence.
- Confirm Flash appears as a brief stage-level pulse at the start of shot playback.
- Confirm Flash does not move the camera, does not act like a new `pushIn`, and does not change the active motion role.
- Toggle Vignette on and confirm it appears as a broad edge dim over the stage.
- Confirm Vignette does not look like a Focus Region-shaped mask, old spotlight, old reveal mask, aperture, or punched cutout.
- Toggle Blur on and preview movement phases.
- Confirm Blur is visible during travel or active attention movement but not during held reading moments.
- Confirm text-heavy held panels remain readable with Blur enabled.
- Toggle each effect off and confirm the accepted preview baseline returns.
- Confirm Flash, Vignette, and Blur are local preview controls and are not persisted in Project JSON.
- Export Project JSON and confirm no special-effect, flash, vignette, or blur fields were added.
- Confirm canvas export behavior is unchanged if checked.
- Confirm shot boxes, Focus Regions, and Shot Attention Path data are not mutated.
- Run `npm.cmd run build`.

Historical note: T0075A later accepted only Shake and Impact Pulse. Vignette and current Blur are not accepted as standalone MVP+ user-facing effects.

### Special Effects Spike Acceptance Cleanup

- Confirm Preview controls include Shake.
- Confirm Preview controls include Impact Pulse.
- Confirm Preview controls do not include Vignette.
- Confirm Preview controls do not include Blur as a standalone user-facing special effect.
- Preview with Impact Pulse enabled and confirm it behaves like the previous short shot-start pulse.
- Confirm Impact Pulse does not move the camera, does not act like a new `pushIn`, and does not change the active motion role.
- Preview shot-to-shot travel and confirm the existing subtle travel veil still works as internal transition behavior.
- Confirm current Blur is not listed as an accepted special effect for T0076.
- Confirm Vignette is not listed as an accepted special effect for T0076.
- Confirm T0076 is scoped to persist only Shake and Impact Pulse.
- Export Project JSON and confirm no special-effect fields were added by this cleanup.
- Confirm canvas export behavior is unchanged if checked.
- Confirm camera placement, shot boxes, Focus Regions, and Shot Attention Path data are not mutated.
- Run `npm.cmd run build`.

### Shot Effect Model

- Export Project JSON from a project with no persisted effect UI changes and confirm `cameraShots[].specialEffects` is absent when no accepted effect is enabled.
- Import an older Project JSON file with no `specialEffects` field and confirm the project loads with the same camera shots, focus regions, attention paths, and preview behavior.
- Import manually authored JSON with one camera shot containing `"specialEffects": { "shake": true, "impactPulse": true }`.
- Export that project again and confirm `cameraShots[].specialEffects.shake` and `cameraShots[].specialEffects.impactPulse` round-trip when true.
- Import manually authored JSON with missing, false, empty, malformed, or rejected effect data such as `vignette` or `blur` and confirm no accepted special effect is added from those values.
- Confirm T0076 itself only added the model/import/export behavior; T0077 later added the persisted inspector preset UI.
- Confirm camera placement, shot boxes, Focus Regions, Shot Attention Path ownership, `track`, `pushIn`, and `pushOut` behavior are unchanged.
- Confirm canvas export behavior is unchanged if checked.
- Confirm effects are documented as rendering-layer modifiers only, not new motion roles or old demoted visual grammar such as reveal, lift, spotlight, or zoom.
- Run `npm.cmd run build`.

### Simple Effect Presets UI

- Select a Camera Shot and confirm the inspector exposes an Effect Preset control.
- Confirm the available presets are None, Shake, Impact Pulse, and Shake + Impact Pulse.
- Select each preset on representative shots.
- Export Project JSON and confirm None omits `cameraShots[].specialEffects`, Shake writes only `shake: true`, Impact Pulse writes only `impactPulse: true`, and the combined preset writes both true flags.
- Import that Project JSON and confirm the selected presets restore in the inspector.
- Confirm Vignette and current Blur are not exposed as standalone user-facing effect presets.
- Confirm changing presets does not mutate shot boxes, Focus Regions, Shot Attention Paths, motion roles, timing, audio, suggestions, AI, OCR, panel detection, dependencies, or multi-page behavior.
- Confirm canvas export includes the accepted effect cues after T0078.
- Run `npm.cmd run build`.

### Preview Uses Persisted Effect Presets

- Select a Camera Shot and set Effect Preset to None.
- Preview in Auto mode and confirm the shot uses the normal effect-off baseline.
- Set the shot to Shake and preview without using any separate preview effect toggle; confirm shake appears only on that shot during shot playback.
- Set the shot to Impact Pulse and preview without using any separate preview effect toggle; confirm the pulse appears only on that shot during shot playback.
- Set the shot to Shake + Impact Pulse and confirm both accepted effects appear together.
- Create at least two shots with different presets and confirm each shot uses its own persisted preset.
- Enable Guided Page Enter / Exit if available and confirm those page segments do not receive per-shot effects.
- Confirm the Preview panel no longer exposes separate local Shake or Impact Pulse buttons.
- Confirm canvas export behavior is unchanged until T0078.
- Run `npm.cmd run build`.

### Attention Path Effect Cues

- Create one Camera Shot with at least two Focus Regions in its Shot Attention Path.
- Set Impact Cue to Once on one path item and preview in Auto mode. Confirm the pulse fires when attention reaches that focus beat.
- Set Impact Cue to Repeat on another path item and confirm the pulse repeats after attention arrives while that beat is active.
- Set Shake Cue to Once and Repeat on representative path items and confirm shake starts as attention arrives, without a settled pause on the target FR, and is limited to the active beat.
- Set Shake Cue or Impact Cue on a `pushOut` path item and confirm the cue starts shortly before the push-out completes, not after the camera has visibly held on the completed frame.
- Change Cue Timing between Early and Arrival and confirm Early runs during approach while Arrival starts after destination arrival.
- Enable shot-level Impact Pulse and confirm it does not flash during incoming travel from the previous shot.
- Confirm path-item cues do not change camera shot boxes, Focus Region geometry, Shot Attention Path order, or motion roles.
- Export Project JSON and confirm `attentionPath[].effectCues` appears only on path items with accepted cues.
- Import that Project JSON and confirm Shake Cue and Impact Cue controls restore.
- Import manually authored cue data with missing, malformed, empty, or unsupported cue values and confirm those cues import as Off.
- Confirm Focus Regions do not own effect cue state.
- Confirm canvas export behavior is unchanged until T0078.
- Run `npm.cmd run build`.

### Upload and Base Image

- Upload PNG, JPG/JPEG, and WEBP images.
- Confirm file name, width, height, and MIME type display.
- Try a non-image file and confirm the app rejects it safely.
- Replace the image and confirm the new image starts a fresh editable project unless attaching a matching image after JSON import.

### Basic Audio Layer

- Upload one audio file in the Background music panel and confirm file name, duration, and MIME type display.
- Try a non-audio file and confirm the app rejects it safely.
- Toggle Include and Loop, then adjust Trim start, Trim end, Fade in, Fade out, and Volume. Confirm values stay inside the uploaded audio duration and the app remains editable.
- Export video with Include enabled and confirm the downloaded video contains the background audio under the visual export.
- Export video with Include disabled and confirm the visual export still succeeds without background audio.
- Export Project JSON and confirm `backgroundAudio` contains metadata/settings but not binary data.
- Import that Project JSON and confirm the project loads while requiring the audio file to be uploaded again before audio export.
- Export a `.ccvproject` archive with background audio, import it, and confirm the source image and background audio are both restored.
- Confirm no sound effect markers, dialogue/narration, waveform editor, per-shot audio timing, AI, OCR, panel detection, multi-page behavior, backend export, FFmpeg, or new dependency behavior was added.
- Run `npm.cmd run build`.

### Simple Sound Effect Markers

- Add one SFX marker to the first shot and export. Confirm the export succeeds and the status reports an audio track when the browser supports mixed audio export.
- Add one MP3 SFX marker and export. Confirm the MP3 sound is audible when the browser can decode MP3 through Web Audio.
- Add multiple SFX markers on different shots and export. Confirm each marker remains tied to its selected target shot and offset.
- Edit an SFX marker's Play length and Lasts shots controls, export, and confirm the sound cuts off at the configured duration or shot-span boundary.
- Upload background music plus at least one SFX marker and export. Confirm BGM + SFX can export together.
- Export with BGM only and no SFX markers. Confirm existing background-music export still works.
- Export with SFX only and no BGM. Confirm export still succeeds and schedules one-shot SFX.
- Export with no audio. Confirm existing video-only export still works.
- Export Project JSON and confirm `soundEffectMarkers` contains marker metadata/settings but not audio binary.
- Import an older project with no `soundEffectMarkers` field and confirm it imports safely with an empty SFX marker list.
- Export a project that has older/live SFX marker objects missing `playDurationMs` or `shotSpan` and confirm export treats them as full-file one-shot markers instead of skipping all SFX.
- Import Project JSON containing SFX markers and confirm missing SFX files appear as metadata-only markers rather than playable/exportable audio.
- Export and import a `.ccvproject` archive with SFX markers and confirm uploaded SFX files restore when bundled.
- If MP4 recorder startup fails in a browser that reported MP4 support, confirm export falls back to another reported format such as WebM rather than failing before recording.
- Confirm no dialogue/narration track, AI sound generation, beat detection, automatic sound matching, waveform editor, per-frame audio editor, multitrack mixer, shot-motion changes, visual export changes, panel detection, OCR, suggestion behavior, backend export, FFmpeg, or new dependency behavior was added.
- Run `npm.cmd run build`.

### Camera Shots

- Upload an image and confirm a default camera shot appears.
- Use Zoom In, Zoom Out, Pan, and Reset View to inspect the image.
- Confirm zooming or panning alone does not change inspector coordinates.
- Add multiple shots and confirm each has a unique ID and selectable overlay.
- Drag shots to each edge and confirm they stay inside the source image.
- Resize selected shots from the bottom-right handle into tall, wide, square, and narrow shapes.
- Zoom and pan, then drag and resize camera shots again. Confirm overlays stay aligned and inspector coordinates update from the edit only.
- Confirm flexible camera shot ratios are allowed and are not forced to 16:9.
- Rename shots and edit positive durations in the inspector.
- Try invalid duration drafts and confirm the UI handles them safely.
- Reorder shots with Up/Down controls and confirm timeline order updates.

### Focus Regions

- Enable Focus Region drawing mode and draw regions with tall, wide, and small ratios.
- Zoom and pan, then draw a focus region. Confirm it appears where drawn and source coordinates are correct.
- Select focus regions and confirm the inspector switches to focus-region fields.
- Edit label and kind values: panel, speech, face, detail, action, and other.
- Confirm the focus-region inspector does not expose the old Effect selector.
- Drag selected focus regions around the page and confirm they stay inside bounds.
- Resize selected focus regions from the bottom-right handle and confirm arbitrary aspect ratios remain allowed.
- Zoom and pan, then drag and resize focus regions again. Confirm overlays stay aligned and inspector coordinates update from the edit only.
- Delete a selected focus region and confirm camera shots are unchanged.
- Delete a camera shot and confirm page-level focus regions are not deleted by default.

### Active Camera Grammar Cleanup

- Confirm the app header no longer exposes the old Focus Style control.
- Confirm the Focus Region inspector no longer exposes old `lift`, `spotlight`, `zoom`, or `none` effect playback controls.
- Create one Camera Shot and at least three Focus Regions inside or mostly inside it.
- Add the Focus Regions to the selected shot's Shot Attention Path.
- Confirm the Motion Role selector exposes only `track`, `pushIn`, and `pushOut`.
- Confirm the `Shot Starts At` control appears in the Shot Attention Path section and enables `First focus` only when the first active path role is `track` or `pushOut`.
- Preview in Auto mode and confirm the camera follows accepted path anchors without rendering lift cutouts, spotlight masks, zoom outlines, reveal masks, or decorative focus-effect playback.
- Import an older Project JSON with `focusRegions[].effectType` values and confirm it still imports.
- Confirm old `effectType: none` does not block a Focus Region from being added to an attention path.
- Confirm old `effectType: zoom` can still provide a `pushIn` fallback only when the path item has no explicit motion role.
- Confirm old `effectType: spotlight` or `effectType: lift` can still provide a `track` fallback only when the path item has no explicit motion role.
- Confirm old `hold` path items behave as unset/default and do not keep the old hold role active.
- Confirm old `reveal` path items behave as `pushOut` placeholders without reveal masking.
- Confirm old `emphasis` path items behave as `pushIn` placeholders without emphasis-specific settle effects.
- Confirm Manual mode still steps camera shots only.
- Confirm canvas export remains legacy/unchanged if checked.
- Run `npm.cmd run build`.

### Basic Camera Grammar Preview Implementation

- Create one Camera Shot with at least three Focus Regions inside or mostly inside it.
- Add all three Focus Regions to the accepted Shot Attention Path.
- Assign all three path items to `track`.
- Preview in Auto mode and confirm movement feels rail-like and continuous from Focus Region 1 to Focus Region 2 to Focus Region 3.
- Make the Focus Regions noticeably different sizes and confirm the preview smoothly interpolates viewport size/scale instead of jumping.
- Assign one path item to `pushIn` and confirm the destination is exact or near-exact Focus Region close-up, not a generous context view.
- Assign one path item to `pushOut` and confirm it starts from a close-up and expands toward the next anchor context or the full Camera Shot when no next anchor exists.
- Confirm there is no reset to the base Camera Shot frame between accepted anchors.
- Confirm the track attention field is subtle and follows track movement only.
- Confirm old lift cutouts, spotlight masks, zoom outlines, reveal masks, and decorative focus-effect playback do not appear.
- Confirm missing or invalid imported `effectType` does not create active motion.
- Confirm explicit legacy `effectType` values only act as fallback when no explicit `motionRole` exists.
- Confirm Manual mode remains shot-by-shot only and does not step attention keys.
- Confirm canvas export remains legacy/unchanged if checked.
- Run `npm.cmd run build`.

### Track Attention Field Dim Tuning

- Create one Camera Shot with at least three Focus Regions inside or mostly inside it.
- Add all three Focus Regions to the accepted Shot Attention Path and assign all three to `track`.
- Preview in Auto mode and confirm `track` reads as calm stable-scale camera panning/gliding between FR centers.
- Confirm there is no default dimmed background, follow-spot, rail, aperture, cursor, or flashlight-like overlay during `track`.
- With `Shot Starts At = Shot frame`, confirm the first track anchor does not show any square, rectangle, oval, capsule, local aperture, endpoint blob, cutout, ribbon, tick mark, dimmed background, or follow-spot before the first `track -> track` movement.
- With `Shot Starts At = First focus`, confirm a first `track -> track` chain begins framed on FR1 without adding a dimmed follow-spot.
- Confirm FR1-to-FR2 and FR2-to-FR3 move the camera smoothly along the Focus Region center path because both anchors are `track`.
- Assign FR1 to `pushOut` and FR2/FR3 to `track`; confirm the camera pushes out from FR1 toward FR2, then FR2-to-FR3 continues as stable-scale track without a follow-spot.
- Confirm no visible rail, ribbon, corridor, wedge, rectangle, trapezoid, capsule, or Focus Region-shaped highlight is drawn as the main effect.
- Confirm no tiny sliding aperture, cursor, clear box, moving square, endpoint oval, endpoint capsule, or punched corridor appears.
- Use differently sized Focus Regions and confirm the camera scale stays mostly constant, with only small correction when needed to keep a larger FR readable or framed.
- Confirm surrounding panel context remains visible enough to understand the scene.
- Confirm the treatment is tied only to `track`, not old `effectType` values.
- Confirm old lift cutouts, spotlight masks, zoom outlines, reveal masks, and decorative focus-effect playback do not appear.
- Assign `pushIn` and confirm exact/near-exact Focus Region close-up behavior is unchanged.
- Assign `pushOut` and confirm context recovery behavior is unchanged.
- Confirm there is no reset between accepted anchors.
- Confirm Manual mode remains shot-by-shot only.
- Confirm canvas export remains legacy/unchanged if checked.
- Run `npm.cmd run build`.

### PushOut Motion Continuity Repair

- Create one Camera Shot with at least three Focus Regions.
- Add FR1, FR2, and FR3 to the accepted Shot Attention Path in that order.
- Assign FR1 to `pushOut` and assign FR2 and FR3 to `track`.
- Preview in Auto mode.
- Confirm FR1 pushes out toward the FR2 track area.
- Confirm the ending frame of FR1's `pushOut` motion matches the starting frame of FR2's motion.
- Confirm FR2 acts as a pass-through start point for FR2-to-FR3 and does not create a noticeable hold-like pause after FR1 finishes pushing out.
- Confirm FR2 does not show the dimmed follow-spot overlay when entered from FR1=`pushOut`.
- Confirm FR2-to-FR3 uses stable-scale track movement without a dimmed moving follow-spot.
- Confirm no camera reset or framing mismatch appears between motion anchors.
- Confirm Manual mode remains shot-by-shot only.
- Confirm Project JSON schema/import/export behavior and canvas export behavior are unchanged.
- Run `npm.cmd run build`.

### Shot Starts At First Focus

- Create one Camera Shot with at least three Focus Regions.
- Add FR1, FR2, and FR3 to the accepted Shot Attention Path in that order.
- Assign FR1, FR2, and FR3 to `track`.
- Set `Shot Starts At` to `First focus`.
- Preview in Auto mode and confirm the shot begins framed on FR1 without a dimmed follow-spot.
- Confirm the moving follow-spot then travels smoothly FR1 -> FR2 -> FR3.
- Change `Shot Starts At` back to `Shot frame` and confirm the shot establishes normally before the track-chain attention movement.
- Assign FR1 to `pushOut` and FR2/FR3 to `track`; set `Shot Starts At` to `First focus`.
- Confirm the shot starts close on FR1, pushes out toward FR2, and then tracks FR2 -> FR3 without changing the accepted push-out behavior.
- Change the first path role to `pushIn` or unset and confirm `First focus` is disabled or reset.
- Historical note: this browser-preview ticket originally left canvas export legacy/unchanged; T0068 has since implemented export parity.

### Shot-to-Shot Travel Veil

- Create at least two Camera Shots with visibly different positions or sizes.
- Preview in Auto mode and confirm shot-to-shot travel uses smooth acceleration/deceleration rather than linear movement.
- Confirm the image subtly dims and softens near the middle of shot-to-shot movement.
- Confirm dimming and softness clear as the camera arrives at the next shot.
- Confirm the travel veil does not appear during intra-shot `track`, `pushIn`, or `pushOut` attention motion.
- Set the next shot to `Shot Starts At = First focus` with either a first `track -> track` chain or first `pushOut` anchor.
- Confirm shot-to-shot travel arrives directly at that next shot's selected first-focus start frame, with the travel veil clearing on arrival.
- Confirm Page Enter / Page Exit export parity is covered by the later Export Verification + Bug Repair section.
- Historical note: this browser-preview ticket originally left canvas export legacy/unchanged; T0068 has since implemented export parity.

### Global Shot Transition Softening / Natural Camera Travel Polish

- Create three Camera Shots with varied positions and sizes, including one short-duration shot.
- Preview in Auto mode and confirm global shot-to-shot movement feels gentler at the midpoint than the older sharper smootherstep travel.
- Confirm short shots are not dominated by camera travel and still leave time for the shot's hold/focus content.
- Confirm the midpoint travel veil is subtle: dimming and softness are visible but not heavy, and both clear on arrival.
- Confirm intra-shot `track`, `pushIn`, and `pushOut` attention motion does not show the global travel veil and keeps the accepted motion-anchor behavior.
- Export the same project and confirm canvas export broadly matches the browser-preview shot-to-shot travel pacing and softer travel veil.
- Run `npm.cmd run build`.

### Export Verification + Bug Repair

- Enable Page Enter and Page Exit, then preview in Auto mode and confirm playback starts from a full-page fitted view and exits back to a full-page fitted view.
- Confirm Page Enter holds on the full-page view before moving into the first shot.
- Confirm Page Exit moves out to the full-page view and then holds there before stopping.
- Export the same project and confirm the exported video includes the same Page Enter and Page Exit full-page travel segments.
- Confirm export progress duration includes the optional page-enter/page-exit time.
- With the first shot set to `Shot Starts At = First focus`, confirm exported Page Enter arrives at the selected first-focus start placement instead of the broader shot frame.
- With a final accepted motion anchor, confirm exported Page Exit starts from the final motion-anchor placement instead of snapping back to the base shot frame.
- Repeat with Page Enter and Page Exit disabled and confirm export starts/ends on the shot timeline as before.
- Run `npm.cmd run build`.

### Export Parity After Motion Model Plan

- Review `docs/planning/Export_Parity_After_Motion_Model_Plan.md`.
- Confirm the plan defines export parity for accepted Shot Attention Path anchors, accepted path order, `durationWeight`, missing-reference safety, and fallback behavior.
- Confirm the plan defines active export parity targets as `track`, `pushIn`, and `pushOut`.
- Confirm the plan treats `track` as camera-motion-first and documents the current follow-spot as the accepted practical baseline, not as a final/perfect visual style.
- Confirm the follow-spot candidate is described as a darkened active shot/background with a soft transparent radial spot on accepted `track -> track` behavior, including `Shot Starts At = First focus` track-chain starts, invisible center-path travel, and smooth spot-size interpolation across Focus Region sizes.
- Confirm the plan explicitly excludes rails, ribbons, corridors, aperture masks, endpoint capsules, endpoint ovals, endpoint blobs, moving squares, sliding boxes, punched cutouts, and Focus Region-shaped highlights as active `track` export language.
- Confirm the plan does not revive old lift, spotlight, zoom, or reveal effect-first playback as core export behavior.
- Confirm Guided Page Enter / Page Exit parity is marked as repaired by Export Verification + Bug Repair.
- Confirm DOM/CSS/SVG-to-canvas risks are listed before source implementation.
- Confirm a later export implementation checklist exists but does not implement export behavior.
- Confirm Browser Preview Motion Grammar Acceptance Review accepted the current browser-preview `track`, `pushIn`, `pushOut`, and `Shot Starts At` behavior as the practical baseline.
- Confirm `docs/Tickets.md` marks T0068 as implemented after baseline acceptance.
- Confirm `docs/Repo_Current_State.md` recommends the basic audio layer next.
- Confirm no `src/`, package, Project JSON schema, preview, export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.
- Build is not required because T0067 is docs-only.

### Browser Preview Motion Grammar Acceptance Review

- Confirm current browser-preview `track`, `pushIn`, `pushOut`, `Shot Starts At`, and shot-to-shot travel veil behavior is accepted as the practical baseline for export parity.
- Confirm acceptance does not claim the visual style is final or perfect.
- Confirm no additional browser-preview visual repair should block export parity unless a future ticket explicitly reopens preview behavior.
- Confirm T0068 export parity implementation has been completed.
- Confirm T0068 must target the accepted browser-preview baseline and must not revive rails, ribbons, corridors, aperture masks, endpoint capsules, endpoint ovals, endpoint blobs, moving squares, sliding boxes, punched cutouts, or Focus Region-shaped highlights as active `track` language.
- Confirm Guided Page Enter / Page Exit parity is covered by the later Export Verification + Bug Repair ticket.
- Confirm package files, canvas export, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior are unchanged.
- Build is not required for this docs update because it does not modify source or package files.

### Historical/Legacy Focus Effects and Sequencing

- Treat Focus Region `effectType` as Project JSON compatibility data, not active browser-preview direction.
- Treat `sequenceOrder` as fallback ordering/draft metadata, not the primary accepted Shot Attention Path order.
- Confirm full `track` / `pushIn` / `pushOut` browser-preview behavior, accepted `Shot Starts At` first-focus starts, and accepted shot-to-shot travel veil pacing are implemented and accepted as the current practical baseline before T0068.

### Planned Shot Attention Path Semantics

- Confirm documentation distinguishes Preview Frame, Camera Shot, Focus Region, and Shot Attention Path.
- Confirm Camera Shots are described as flexible panel/scene reading containers and main timeline destinations.
- Confirm Focus Regions are described as reusable page-level attention targets, not shot-owned records.
- Confirm planned Shot Attention Path data references existing focus-region IDs instead of copying or owning focus-region geometry.
- Confirm future manual mode can step camera shots first and optionally step attention keys inside a shot later.
- Confirm automation remains suggestion-based and is not allowed to replace manual shot or focus-region editing.

### Documentation Organization

- Review `docs/README.md`.
- Confirm root docs are focused on tickets, current state, manual verification, known issues, and handoff material.
- Confirm product model docs live under `docs/model/`.
- Confirm broader design and implementation planning docs live under `docs/planning/`.
- Confirm automation and suggestion-system spike/planning docs live under `docs/automation/`.
- Confirm external research notes remain under `docs/research/`.
- Confirm moved document references in `README.md`, `docs/Tickets.md`, `docs/Repo_Current_State.md`, and this guide point to the organized paths.

### Roadmap Status Classification

- Review `docs/model/Roadmap_Status_Classification.md`.
- Confirm the document defines Core, Frozen, Deprecated as Default, Legacy Optional, Later, and Human Decision Required.
- Confirm stale/effect-first concepts are demoted but not deleted.
- Confirm Frozen features may remain available but are not roadmap expansion targets unless explicitly unfrozen.
- Confirm Deprecated-as-default features may remain for compatibility/testing but are not presented as the main product direction.
- Confirm Legacy Optional features remain optional visual treatments.
- Confirm Later features are blocked from next-ticket recommendations until prerequisites are complete.
- Confirm Human Decision Required items are not changed automatically.
- Confirm `docs/README.md` points to the classification layer under `docs/model/`.
- Confirm `docs/Repo_Current_State.md` marks T0058 implemented and recommends roadmap planning before new automation.
- Confirm `docs/Tickets.md` includes T0058 and notes that historical implemented tickets may contain older wording.
- Confirm no source files changed.
- Confirm panel/text/AI suggestions are delayed until the Shot Attention Path motion-anchor model is clarified.
- Build is not required because T0058 is docs-only.

### Motion-Anchor Roadmap Rebuild Plan

- Review `docs/planning/Motion_Anchor_Roadmap_Rebuild_Plan.md`.
- Confirm the roadmap rebuild plan exists.
- Confirm T0060 through T0071 are listed or explained by the refined active roadmap.
- Confirm T0067 - Export Parity After Motion Model Plan, Browser Preview Motion Grammar Acceptance Review, and T0068 are implemented.
- Confirm T0068 - Canvas Export Parity for Accepted Motion Anchors, Global Shot Transition Softening / Natural Camera Travel Polish, Export verification + bug repair, and Project archive save/load with source image bundled are implemented, and the next recommended ticket is the basic audio layer.
- Confirm the documented roadmap is Basic audio layer; then later sound effect markers, dialogue/narration, and AI assistance.
- Confirm panel suggestions are delayed until after motion-anchor work.
- Confirm text/OCR timing and AI suggestions are delayed until after motion-anchor prerequisites.
- Confirm T0068 export implementation was unblocked by practical browser-preview baseline acceptance and is now complete.
- Confirm audio, sound effect markers, dialogue/narration, and AI assistance remain out of T0068 and export-verification repair scope until their later roadmap steps.
- Confirm no package, export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed during this docs update.
- Build is not required because T0059 is docs-only.

### T0068 - Canvas Export Parity for Accepted Motion Anchors

- Export a project with accepted `track`, `pushIn`, and `pushOut` Shot Attention Path anchors.
- Confirm export follows accepted path order, `durationWeight`, pass-through track-start timing, and motion-chain continuity without resetting to the base Camera Shot between anchors.
- Export a shot using `Shot Starts At = First focus` with a first `track -> track` chain; confirm export begins on the first track target without a dimmed follow-spot.
- Export a shot using `Shot Starts At = First focus` with a first `pushOut` anchor; confirm export begins close on that Focus Region and pushes out toward the next anchor or shot context.
- Export adjacent shots where the destination shot uses `Shot Starts At = First focus`; confirm shot-to-shot travel arrives at that selected start frame.
- Enable Page Enter and Page Exit and confirm export includes those full-page travel segments.
- Confirm shot-to-shot travel uses eased movement, subtle midpoint dim/softness, and clears on arrival.
- Confirm export does not render rails, ribbons, aperture masks, endpoint capsules/ovals/blobs, moving squares, sliding boxes, punched cutouts, or Focus Region-shaped highlights as active `track` language.
- Confirm shots without usable accepted anchors still export with the legacy fallback behavior.
- Run `npm.cmd run build`.

### Historical/Legacy Shot Attention Path Motion Semantics

- Review `docs/model/Shot_Attention_Path_Motion_Semantics.md`.
- Confirm Shot Attention Path is described as ordered intra-shot camera-motion anchors.
- Confirm each path item is defined as an anchor, attention beat, camera target, and optional visual-treatment trigger.
- Confirm the current active `motionRole` values are documented as `track`, `pushIn`, and `pushOut`.
- Confirm legacy parseable `motionRole` values `hold`, `reveal`, and `emphasis` are documented as compatibility-only, not active basic grammar.
- Confirm `durationWeight` is documented as future relative attention-beat timing guidance that does not change current behavior.
- Confirm relationships are documented for path item order, focus region `sequenceOrder`, focus region `effectType`, `shotPurpose`, `focusPurpose`, and `outgoingTransitionPurpose`.
- Confirm current behavior, intended future behavior, legacy optional behavior, and human-decision-required behavior are separated.
- Confirm Focus Regions remain reusable page-level attention targets and not replacement Camera Shots.
- Confirm Camera Shots remain flexible panel/scene reading containers and main timeline destinations.
- Confirm lift, spotlight, zoom, and none are compatibility metadata, not active browser-preview grammar.
- Confirm panel/text/AI suggestions remain delayed.
- Confirm export parity remains delayed until T0066C browser preview role behavior, reveal mask transition behavior, and shot-exit continuity are manually checked.
- Confirm `docs/Tickets.md` marks T0060 implemented.
- Confirm `docs/Repo_Current_State.md` marks T0068, Global Shot Transition Softening / Natural Camera Travel Polish, Export verification + bug repair, and Project archive save/load with source image bundled implemented and recommends the basic audio layer next.
- Confirm no source, package, Project JSON schema, preview, export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.
- Build is not required because T0060 is docs-only.

### Historical/Legacy Manual Motion Role and Duration Weight Controls

- Upload an image.
- Create at least one Camera Shot.
- Create at least three page-level Focus Regions.
- Select a Camera Shot and add Focus Regions to its Shot Attention Path.
- For current UI, confirm `motionRole` choices are only `track`, `pushIn`, and `pushOut`.
- For imported legacy JSON only, confirm old `hold`, `reveal`, and `emphasis` values remain accepted as compatibility data.
- Leave `motionRole` unset for one path item and confirm the path item remains valid.
- Edit `durationWeight` to valid positive values such as 1, 2, and 0.5.
- Try invalid `durationWeight` drafts such as blank, 0, a negative number, and non-number text; confirm the UI handles them safely and state is not corrupted.
- Move path items Up and Down and confirm `motionRole` and `durationWeight` remain attached to the correct path item.
- Remove a path item and confirm the referenced Focus Region remains on the page.
- Export Project JSON and confirm accepted path items include expected `motionRole` and `durationWeight` values when set.
- Import that Project JSON and confirm the values are restored.
- Preview the project and confirm Auto preview now uses accepted `motionRole` and `durationWeight` as T0062 motion-anchor inputs.
- Confirm canvas video export behavior is unchanged if checked.
- Run `npm.cmd run build`.
- Confirm `docs/Tickets.md` and `docs/Repo_Current_State.md` mark Browser Preview Motion Grammar Acceptance Review implemented and T0068 unblocked.

### Shot Attention Path Controls

- Create at least three page-level focus regions.
- Select a camera shot and confirm the Shot Attention Path section appears in the shot inspector.
- Add existing focus regions to the selected shot attention path.
- Confirm focus regions already in the selected shot path are not available for duplicate addition.
- Move path items Up and Down and confirm their visible order changes.
- Remove a path item and confirm the referenced focus region remains on the page.
- Export Project JSON and confirm the selected shot includes `attentionPath` entries with stable item IDs, focusRegionId references, and deterministic order values.
- Import that Project JSON and confirm the shot attention path is restored.
- Confirm manual path add/reorder/remove controls remain usable after T0062 preview motion behavior.

### Historical/Legacy Intra-Shot Motion Preview Prototype

- Upload an image.
- Create at least one Camera Shot.
- Create at least three page-level Focus Regions inside or mostly inside that shot.
- Add those Focus Regions to the selected shot's Shot Attention Path in a non-default order.
- Treat old `hold`, `reveal`, and `emphasis` role checks in this section as historical T0062 verification only.
- Current active path roles are `track`, `pushIn`, and `pushOut`.
- Assign different `durationWeight` values such as 1, 2, and 0.5.
- Preview in Auto mode and confirm attention follows accepted path order.
- Confirm `durationWeight` changes the relative time spent on each anchor.
- Confirm current preview does not preserve old role-specific behavior for `hold`, `reveal`, or `emphasis`.
- Set one referenced Focus Region to `effectType: none` and confirm it remains safe as a motion anchor while skipping visual treatment.
- Delete or remove a referenced Focus Region and confirm preview does not crash.
- Clear the selected shot's attention path and confirm fallback behavior still works.
- Confirm Manual mode still steps camera shots only and does not step attention keys.
- Confirm canvas video export behavior is unchanged if checked.
- Confirm Project JSON schema/import/export behavior and suggestion behavior are unchanged.
- Run `npm.cmd run build`.

### Historical/Legacy Continuous Intra-Shot Attention Path Motion

- Upload an image.
- Create one Camera Shot with at least three page-level Focus Regions inside or mostly inside that shot.
- Add those Focus Regions to the selected shot's accepted Shot Attention Path in a deliberate order.
- Treat old `hold`, `reveal`, and `emphasis` role checks in this section as historical T0063 verification only.
- Current active path roles are `track`, `pushIn`, and `pushOut`.
- Assign varied `durationWeight` values such as 1, 2, and 0.5.
- Preview in Auto mode and confirm the camera glides from the shot framing toward the first accepted anchor, then from anchor to anchor.
- Confirm the camera no longer appears to reset or return to the base shot framing between accepted attention anchors.
- Confirm movement remains restrained and readable.
- Set one referenced Focus Region to `effectType: none` and confirm it still acts as a motion anchor while skipping visual treatment.
- Delete or remove a referenced Focus Region and confirm preview does not crash.
- Clear the selected shot's attention path and confirm fallback behavior still works.
- Confirm Manual mode still steps camera shots only and does not step attention keys.
- Confirm canvas video export behavior is unchanged if checked.
- Confirm Project JSON schema/import/export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior are unchanged.
- Run `npm.cmd run build`.

### Historical/Legacy Intra-Panel Motion Grammar Roadmap Sync

- Review `docs/research/Intra_Panel_Motion_Grammar_Study.md`.
- Confirm the active roadmap says simple guided camera movement is not the final product target.
- Confirm the active roadmap points toward semantic intra-panel camera motion driven by panel energy, attention, emotion, and implied motion.
- Confirm `docs/Tickets.md` marks T0064 implemented and records T0065 - Motion Role Behavior Definitions as the follow-up ticket.
- Confirm older T0065 role behavior is historical and the active grammar has since narrowed to `track`, `pushIn`, and `pushOut`.
- Confirm T0065 decides whether `pullBack`, `drift`, and `transfer` should be added later.
- Confirm export parity remains planned but delayed until after browser preview role behavior is implemented and stabilized.
- Confirm no source, package, Project JSON schema, runtime preview, export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.
- Build is not required because T0064 is docs-only.

### Historical/Legacy Motion Role Behavior Definitions

- Review `docs/model/Shot_Attention_Path_Motion_Semantics.md`.
- Confirm old `hold`, `reveal`, and `emphasis` definitions are historical/legacy, not active browser-preview grammar.
- Confirm current active grammar is `track`, `pushIn`, and `pushOut`.
- Confirm each existing role documents expected camera behavior.
- Confirm each existing role documents pacing or duration tendency.
- Confirm each existing role documents when to use it and when not to use it.
- Confirm each existing role documents how it should interact with `effectType`.
- Confirm each existing role documents how it should interact with `durationWeight`.
- Confirm `effectType` remains visual treatment only and `motionRole` remains camera-motion intent.
- Confirm `effectType: none` may still act as a motion anchor.
- Confirm `pullBack` is classified as a future possible role.
- Confirm `drift` is classified as a shot-level/profile concept for now.
- Confirm `transfer` is merged into `track` for now.
- Confirm schema expansion is delayed unless a later ticket explicitly approves it.
- Confirm export parity remains planned but delayed until browser preview role behavior is implemented and stabilized.
- Confirm `docs/Tickets.md` marks T0065 implemented and makes T0066 - Preview Applies Motion Role Profiles the next recommended ticket.
- Confirm no source, package, Project JSON schema, runtime preview, canvas export, suggestion, OCR, AI, panel detection, dependency, audio, or multi-page behavior changed.
- Build is not required because T0065 is docs-only.

### Historical/Legacy Preview Applies Motion Role Profiles

- Create one Camera Shot.
- Create at least five Focus Regions inside or mostly inside it.
- Add those Focus Regions to the selected shot's accepted Shot Attention Path.
- Treat old `hold`, `reveal`, and `emphasis` role-profile checks as historical T0066 verification only.
- Current UI should expose only `track`, `pushIn`, and `pushOut`.
- Assign varied `durationWeight` values such as 1, 2, and 0.5.
- Preview in Auto mode.
- Confirm `hold` feels mostly stable with minimal movement.
- Confirm `pushIn` gently increases attention without aggressive zoom.
- Confirm `track` transfers attention from the previous anchor toward the current anchor.
- Confirm `reveal` subtly stages the anchor rather than jumping directly to it.
- Confirm `emphasis` adds restrained weight, such as a small push/settle/hold feeling, without shake or flashy effects.
- Confirm each role feels distinguishable but restrained.
- Confirm the camera remains continuous and does not reset between accepted anchors.
- Set one referenced Focus Region to `effectType: none` and confirm it still acts as a motion anchor while skipping visual treatment.
- Confirm Manual mode still steps camera shots only and does not step attention keys.
- Confirm canvas video export behavior is unchanged if checked.
- Confirm Project JSON schema/import/export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, and multi-page behavior are unchanged.
- Run `npm.cmd run build`.

### Historical/Legacy Motion Role Profile Tuning Pass

- Create one Camera Shot with five Focus Regions inside or mostly inside it.
- Add all five Focus Regions to the selected shot's accepted Shot Attention Path.
- Treat old `hold`, `reveal`, and `emphasis` tuning checks as historical T0066A verification only.
- Current UI should expose only `track`, `pushIn`, and `pushOut`.
- Assign varied `durationWeight` values such as 1, 2, and 0.5.
- Preview in Auto mode.
- Confirm the camera remains continuous and does not reset between accepted anchors.
- Confirm `hold` remains mostly stable.
- Confirm `track` remains readable as attention transfer.
- Confirm `pushIn` is more noticeable than it was before T0066A while staying restrained.
- Confirm `emphasis` feels stronger than `pushIn` or at least more weighted, without shake or flashy effects.
- Confirm `reveal` has a recognizable staging or uncovering feeling instead of reading like a weaker push-in.
- Confirm motion remains restrained, readable, page-preserving, and not ugly.
- Set one referenced Focus Region to `effectType: none` and confirm it still acts as a motion anchor while skipping visual treatment.
- Confirm Manual mode still steps camera shots only and does not step attention keys.
- Confirm canvas video export behavior is unchanged if checked.
- Confirm Project JSON schema/import/export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, UI, and multi-page behavior are unchanged.
- Run `npm.cmd run build`.

### Exit Continuity and Reveal Mask Behavior

- Create two Camera Shots.
- In the first Camera Shot, create at least three Focus Regions and add them to the accepted Shot Attention Path.
- Make the last path item `pushIn`.
- Preview in Auto mode.
- Confirm the camera does not reset to the base shot framing before moving to the second Camera Shot.
- Confirm the transition begins from the final pushed-in intra-shot placement and relaxes or moves naturally toward the second shot.
- Repeat with `emphasis` as the final path item.
- Repeat with `reveal` as the final path item and confirm the T0066A staged reveal still reads as a before-to-after staging feeling.
- Test `reveal` in the middle of a shot path and confirm it feels like isolate -> reveal -> reconnect.
- Confirm the surrounding shot area dims or blackens enough for reveal to read clearly.
- Confirm reveal does not feel like just another `pushIn`.
- Set the final referenced Focus Region to `effectType: none` and confirm it still acts as a motion anchor while skipping visual treatment.
- Clear or avoid accepted paths on another shot pair and confirm shots without accepted paths still use existing transition behavior.
- Confirm Manual mode still steps camera shots only and does not step attention keys.
- Confirm canvas video export behavior is unchanged if checked.
- Confirm Project JSON schema/import/export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, UI, and multi-page behavior are unchanged.
- Run `npm.cmd run build`.

### Historical/Legacy Reveal Mask Transition Continuity Repair

- Create one Camera Shot with at least three accepted Shot Attention Path anchors.
- Put `reveal` in the middle of the path.
- Treat this as historical T0066C verification only. Current browser preview should not render reveal masking as active basic grammar.
- Preview in Auto mode.
- Confirm the page does not flash bright before the reveal mask appears.
- Confirm the reveal isolation fades in smoothly.
- Confirm the reveal reconnect fades or opens out smoothly.
- Confirm the page does not flash bright after reveal before the next anchor.
- Repeat with the reveal Focus Region set to `effectType: none`.
- Repeat with `reveal` as the final anchor before moving to the next Camera Shot.
- Confirm final intra-shot exit continuity from T0066B still works.
- Confirm Manual mode still steps camera shots only and does not step attention keys.
- Confirm canvas video export behavior is unchanged if checked.
- Confirm Project JSON schema/import/export behavior, suggestion behavior, OCR, AI, panel detection, dependencies, audio, UI, and multi-page behavior are unchanged.
- Run `npm.cmd run build`.

### Historical/Legacy Shot Attention Path Preview

- Create one camera shot and three page-level focus regions inside or mostly inside that shot.
- Assign the selected shot attention path in a non-default order, such as Focus Region 3 then Focus Region 1.
- Preview in Auto mode and confirm focus attention follows the explicit path order.
- Confirm a focus region not listed in a valid attention path is not automatically included for that shot.
- Treat `effectType` checks here as legacy compatibility checks only.
- Remove or clear the selected shot attention path and confirm missing legacy data does not create active track/pushIn behavior by default.
- Delete a referenced focus region and confirm preview does not crash.
- Confirm Manual mode still steps shot by shot and does not step through attention keys yet.
- Confirm canvas video export behavior is unchanged for now.

### Panel Detection Suggestions Spike

- Review `docs/automation/Panel_Detection_Suggestions_Spike.md`.
- Confirm panel detection is framed as suggestion-based, not mandatory automation.
- Confirm manual editing remains required and available.
- Confirm detected panel candidates map to editable Camera Shot suggestions, not destructive crops.
- Confirm detected details, speech bubbles, faces, or action regions map to page-level Focus Region suggestions.
- Confirm detected reading order can map to camera shot order.
- Confirm detected intra-panel detail order can map to Shot Attention Path references.
- Confirm Focus Regions are not treated as replacement camera frames.
- Confirm T0051 remains a separate OCR/text-weight timing spike.
- Confirm no production panel detection, OCR, AI, preview, export, schema, package, or editor behavior was added for T0050.

### Text Weight / OCR Timing Spike

- Review `docs/automation/Text_Weight_OCR_Timing_Spike.md`.
- Confirm OCR and text-weight analysis are framed as exploratory and suggestion-based.
- Confirm manual shot duration, shot timing, focus-region, and attention-path editing remain required and available.
- Confirm the docs cover speech bubbles, captions, narration, sound effects, signs, tiny labels, and dense dialogue as different timing inputs.
- Confirm text-heavy Camera Shots map to editable duration/timing suggestions, not automatic overrides.
- Confirm prominent text regions may become page-level Focus Region suggestions only when useful as attention targets.
- Confirm Shot Attention Path suggestions reference page-level Focus Regions and do not make Focus Regions replacement camera frames.
- Confirm the docs explain how to avoid over-focusing every speech bubble.
- Confirm fragile cases include vertical manga text, stylized lettering, overlapping bubbles, text crossing panel borders, handwritten SFX, poor scan/photo quality, and multilingual pages.
- Confirm no production OCR, AI, preview, export, schema, package, or editor behavior was added for T0051.

### Smart Camera Path Draft Generator Spike

- Review `docs/automation/Smart_Camera_Path_Draft_Generator_Spike.md`.
- Confirm smart camera path generation is framed as temporary editable suggestions, not automatic final video generation.
- Confirm manual shot, focus-region, timing, and attention-path editing remain available before and after generation.
- Confirm draft inputs include accepted or suggested panels, page-level Focus Regions, Shot Attention Paths, purpose metadata, text-weight timing notes, reading-order hints, and user-authored edits.
- Confirm draft outputs are suggested Camera Shots, shot order, optional Focus Regions, optional Shot Attention Paths, timing values, purpose metadata, confidence notes, and warnings.
- Confirm generated Camera Shots remain full-page camera framing containers, not destructive panel crops.
- Confirm generated Focus Regions remain page-level attention targets, not replacement camera frames.
- Confirm Shot Attention Path suggestions reference page-level Focus Regions and describe intra-shot attention order.
- Confirm text-heavy regions can affect timing without forcing focus on every speech bubble.
- Confirm fragile cases include unusual layouts, splash art, overlapping panels, cross-panel characters, vertical manga flow, unclear reading order, webtoon layouts, borderless panels, poor scans, and multilingual/stylized text.
- Confirm no production smart path generation, OCR, AI, panel detection, preview, export, schema, package, or editor behavior was added for T0052.

### Post-Spike Automation Roadmap

- Review `docs/Tickets.md` for T0053.
- Review `docs/automation/Post_Spike_Automation_Suggestion_System_Plan.md`.
- Confirm T0053 is recommended before T0052A or any automation prototype.
- Confirm the roadmap prefers a generic suggestion workflow/foundation before smart camera path generation.
- Confirm T0054 is the recommended next ticket after T0053.
- Confirm future work is split into smaller tickets such as suggestion state, suggestion review UI, accept/edit/delete workflow, smart draft prototype using existing manual data, panel suggestion prototype, text-weight timing prototype, preview/export parity planning, manual attention-key stepping, and export/archive reassessment.
- Confirm suggestions must remain temporary until explicit user acceptance.
- Confirm accepted suggestions become normal project data only after explicit user action.
- Confirm suggestion persistence would require a future schema ticket.
- Confirm manual editing remains available before and after suggestions.
- Confirm Camera Shots remain main timeline framing containers, Focus Regions remain page-level attention targets, and Shot Attention Path remains per-shot references to Focus Regions.
- Confirm no source, package, schema, preview, export, OCR, AI, panel detection, dependency, audio, or multi-page behavior is changed for this roadmap update.

### Temporary Suggestion State Model Plan

- Review `docs/automation/Temporary_Suggestion_State_Model_Plan.md`.
- Confirm common fields include id, type, source, confidence, reason/warnings, proposed values, edited draft values, related refs, batch/timestamp metadata, and status.
- Confirm source values include manualDraft, panelHeuristic, textWeight, smartCameraPath, and importedSuggestion.
- Confirm confidence values include high, medium, low, and unknown.
- Confirm variants cover Camera Shot, Focus Region, Shot Attention Path, timing, purpose metadata, and warning/confidence suggestions.
- Confirm suggestions can reference existing project data without mutating it.
- Confirm suggestions can reference other temporary suggestions before acceptance.
- Confirm acceptance resolves temporary IDs into real project IDs.
- Confirm suggestions remain temporary UI state and are not persisted in Project JSON yet.
- Confirm persisted suggestions would require a future schema ticket.
- Confirm manual user-authored project data takes priority and stale suggestions are handled safely.
- Confirm T0055 is the recommended next ticket.
- Confirm no source, package, schema, preview, export, OCR, AI, panel detection, dependency, audio, or multi-page behavior is changed for T0054.

### Suggestion Review UI Plan

- Review `docs/automation/Suggestion_Review_UI_Plan.md`.
- Confirm the plan prefers a dedicated Suggestions panel or drawer rather than mixing all suggestions directly into the normal inspector.
- Confirm suggested Camera Shot and Focus Region overlays are visually distinct from accepted project overlays.
- Confirm Shot Attention Path suggestions are shown as temporary references and are not confused with accepted `attentionPath` records.
- Confirm timing and purpose suggestions compare accepted, proposed, and edited draft values without silently changing accepted values.
- Confirm confidence, source, status, stale/blocked state, warnings, proposed values, and draft values are visible in the plan.
- Confirm filtering/grouping by batch, type, source, confidence, and status is documented.
- Confirm future accept, edit, delete/reject, reorder, regenerate, ignore, and accept-all actions are prepared but not implemented by this docs ticket.
- Confirm manual project data remains the source of truth and normal editor tools remain available.
- Confirm narrow/mobile layout planning is included.
- Confirm T0056 is the recommended next ticket.
- Confirm no source, package, schema, preview, export, OCR, AI, panel detection, dependency, audio, or multi-page behavior is changed for T0055.

### Manual Suggestion Accept/Edit/Delete Prototype

- Historical only: the old normal UI exposed Add Test Shot Suggestion and Add Test Focus Suggestion controls beside the inspector.
- Current T0090A behavior removes those test controls from the normal user-facing AI Review UI.
- Reject one suggestion and confirm only the temporary suggestion and its suggested overlay disappear.
- Accept a Camera Shot suggestion and confirm it becomes a normal editable camera shot in the timeline and editor.
- Accept a Focus Region suggestion and confirm it becomes a normal page-level focus region that can be selected, edited, moved, resized, and deleted with existing tools.
- Export Project JSON and confirm temporary suggestions are not included; accepted suggestions appear only as normal `cameraShots` or `focusRegions`.
- Import Project JSON and confirm temporary suggestions are not restored because suggestions are intentionally not persisted.
- Confirm manual camera shot editing, focus-region editing, Shot Attention Path controls, preview, and canvas video export behavior remain unchanged.
- Run `npm.cmd run build`.

### Historical/Legacy Smart Attention Path Draft Suggestions

- Upload an image, create or select a camera shot, and create at least two page-level focus regions that mostly belong to the selected shot.
- Click Draft Attention Path and confirm a temporary Attention Path suggestion appears in the Suggestions panel, not in accepted project data.
- Confirm the suggestion identifies the targeted shot and lists the included focus regions.
- Treat old `effectType: none` suggestion filtering as historical. Current active direction treats `effectType` as compatibility metadata only.
- Set different Sequence Order values on eligible focus regions, draft again, and confirm the suggested order follows numeric sequenceOrder before page-level fallback order.
- Accept the Attention Path suggestion and confirm the selected shot's Shot Attention Path section updates with ordered references to the suggested focus regions.
- Reject an Attention Path suggestion and confirm the targeted shot's existing `attentionPath` is unchanged.
- Accept a suggestion, then use the normal manual Shot Attention Path controls to add, move, and remove path items.
- Export Project JSON and confirm temporary suggestions are not included; accepted attention paths appear only as normal camera-shot `attentionPath` data.
- Confirm preview, canvas video export, import/export schema, OCR, AI, panel detection, dependencies, audio, and multi-page behavior are unchanged.
- Run `npm.cmd run build`.

### Shot Timing

- Select a shot and adjust Scene Hold % and Focus Attention %.
- Confirm the controls clamp to the allowed budget and do not break duration editing.
- Preview the shot and confirm focus attention starts after the camera settles.

### Historical/Legacy Preview

- Use Final mode and confirm editor/debug labels are hidden.
- Use Debug mode and confirm diagnostic focus labels/treatments are visible.
- Create three or more camera shots with varied positions, sizes, and aspect ratios. Preview playback and confirm camera travel moves smoothly between timeline shots while keeping the fixed 16:9 stage and clipped shot-window rendering.
- Do not treat lift, spotlight, or zoom effect playback as current browser-preview behavior.
- Create several accepted path focus regions and confirm old focus effects do not drive browser preview.
- Stop playback and confirm the preview returns to a safe stopped state.

### Export JSON

- Upload an image, create multiple camera shots, draw/edit focus regions, adjust timing, and export JSON.
- Zoom and pan before export, then confirm exported geometry still uses source-image coordinates and is unaffected by editor view state.
- Inspect the file and confirm it is readable schemaVersion 1 JSON.
- Confirm cameraShots are in timeline order.
- Confirm focusRegions preserve explicit legacy `effectType` when present, and missing/invalid imported `effectType` does not become `lift`.
- Confirm image binary is not included and binaryIncluded is false.

### Project Archive Save/Load With Source Image Bundled

- Upload an image, create multiple camera shots, draw/edit focus regions, set guided page options, and add at least one accepted Shot Attention Path item.
- Click Export Archive and confirm a `.ccvproject` file downloads.
- Import the `.ccvproject` archive in a fresh app session.
- Confirm the source image appears without re-uploading or reselecting the image.
- Confirm camera shots, focus regions, Shot Attention Path data, timing fields, guided page options, and metadata are restored.
- Confirm preview and video export can use the restored bundled image.
- Confirm existing Import JSON / Export JSON behavior remains available and JSON import still asks for source image re-selection.
- Run `npm.cmd run build`.

### Historical/Legacy Export Video Prototype

- Upload an image and create at least two camera shots.
- Use varied camera shot positions, sizes, and aspect ratios.
- Export video prototype and confirm a video file downloads when the browser supports canvas capture and MediaRecorder.
- Open the exported file locally and confirm it shows the source image moving through the camera shot timeline in a fixed 16:9 frame.
- Include one shot with no focus regions and confirm export still completes.
- Treat lift, spotlight, zoom, and none export behavior as legacy canvas-export behavior only. Browser preview should not use those effects as active grammar.
- Confirm the status message reports the browser recorder format, such as MP4 when supported or WebM fallback.
- Confirm existing preview playback still works after exporting.
- Confirm Project JSON export/import behavior is unchanged after exporting.

### Import JSON

- Import a valid project JSON exported by the app.
- Confirm camera shots, labels, durations, geometry, timing fields, and timeline order are restored.
- Confirm page-level focus regions, labels, kinds, effectType, sequenceOrder, geometry, and sourceShotId are restored.
- Import older JSON where `effectType` is missing or invalid and confirm it does not become `lift`.
- Import older JSON with explicit `effectType: lift`, `spotlight`, `zoom`, or `none` and confirm explicit values are preserved as compatibility metadata.
- Confirm the app shows that the source image must be re-uploaded/reselected.
- Reselect the matching source image and confirm imported shots and focus regions remain usable.
- Select a mismatched image and confirm the app warns and starts a fresh project from the selected image.
- Import invalid JSON and confirm a clear error appears.
- Import JSON with an unsupported schemaVersion and confirm a clear error appears.

## Project JSON Schema v1

Project JSON stores the creative project structure for one page. It does not bundle the source image binary.

Top-level fields:

- `schemaVersion`: number. Version 1 is the only supported import schema.
- `exportedAt`: ISO timestamp string written by export. Import treats it as metadata.
- `image`: source image metadata object.
- `cameraShots`: array of camera shots in timeline order.
- `focusRegions`: array of page-level focus regions.

`image` fields:

- `fileName`: original source image file name.
- `width`: source image width in pixels.
- `height`: source image height in pixels.
- `mimeType`: image MIME type, or null/empty when unavailable.
- `binaryIncluded`: false in current exports.
- `note`: human-readable reminder that the image binary is not included.

`cameraShots[]` fields:

- `id`: stable shot ID.
- `label`: editable shot label.
- `x`, `y`, `width`, `height`: source-image coordinate geometry.
- `durationMs`: positive shot duration in milliseconds.
- `attentionPath`: optional array of ordered references to page-level focus regions for future intra-shot attention/motion.
- `shotStartFraming`: optional camera-shot value. Current active values are `establishShot` and `firstFocus`; missing values behave as `establishShot`.
- `sceneHoldRatio`: optional shot-level hold timing ratio.
- `focusAttentionRatio`: optional shot-level focus timing ratio.
- `specialEffects`: optional object for accepted per-shot special effects. Supported fields are `shake?: true` and `impactPulse?: true`; missing, false, malformed, empty, or rejected fields such as `vignette` and `blur` import as effect-off.

`attentionPath[]` fields:

- `id`: stable path item ID.
- `focusRegionId`: string reference to a page-level focus region.
- `order`: positive numeric order within the shot.
- `motionRole`: optional active value: track, pushIn, or pushOut. Legacy imports may also contain hold, reveal, or emphasis for compatibility.
- `durationWeight`: optional positive numeric weight for future timing use.
- `effectCues`: optional object for accepted per-attention-beat effect cues. Supported fields are `shake?: "once" | "repeat"` and `impactPulse?: "once" | "repeat"`; missing, malformed, empty, or unsupported cue values import as cue-off.
- `effectCueTiming`: optional accepted cue timing preset for that path item. Supported values are `early` and `arrival`; missing or malformed values behave as the default Arrival timing.

Current import behavior accepts missing `attentionPath` for older schema version 1 projects. Malformed `attentionPath` arrays or malformed path items are ignored defensively. Import does not require `focusRegionId` to match an existing focus region yet, so projects can preserve references even if validation order or later user edits temporarily leave a dangling reference.

`focusRegions[]` fields:

- `id`: stable focus-region ID.
- `label`: editable region label.
- `kind`: panel, speech, face, detail, action, or other.
- `effectType`: optional legacy compatibility value: lift, spotlight, zoom, or none. Missing or invalid imported values remain unset rather than defaulting to lift.
- `sequenceOrder`: optional numeric attention order.
- `x`, `y`, `width`, `height`: source-image coordinate geometry.
- `sourceShotId`: optional shot ID used as selection/context metadata only.

Unsupported or future fields:

- Import validates the required structure and supported schemaVersion.
- Future unknown fields may be ignored by current import behavior.
- Future schema versions must not be assumed compatible until a migration or explicit support is implemented.

## State Review Notes

- `uploadedImage` represents a real browser object URL plus source image metadata.
- Imported expected image metadata is separate from `uploadedImage`; it tells the user which source image to reselect but is not treated as a usable image URL.
- `cameraShots` are the ordered timeline source for editor, timeline, preview, export, and import.
- `attentionPath` entries on camera shots are ordered references to page-level focus regions for future intra-shot attention/motion; they do not own focus regions and do not change preview/export behavior yet.
- `focusRegions` are page-level annotations, not shot-owned records. `sourceShotId` is optional context.
- `selectedShotId` and `selectedFocusRegionId` are UI selection state; import clears selected focus region and selects the first imported shot when available.
- Export serializes the current editable project structure and explicitly excludes image binary.
- Import restores project structure first, then waits for the user to attach the separate source image.
- Replacing an image normally starts a fresh project; reselecting a dimension-matching image after import attaches it to the imported project without wiping imported shots or focus regions.
