# Documentation Index

This folder keeps the active project documentation organized by purpose.

## Root Docs

- `Tickets.md` - scoped ticket roadmap and implementation status.
- `Repo_Current_State.md` - current project state, build notes, and next recommended ticket.
- `Manual_Verification_Guide.md` - manual checks for app behavior and docs-only tickets.
- `Known_Issues_And_Followups.md` - known issues and follow-up notes.
- `Codex_Ticket_Handoff_Template.md` - handoff format for future ticket work.

## Subfolders

- `model/` - product model, roadmap status classification, and semantic rules for camera shots, focus regions, preview frame, and Shot Attention Path.
- `planning/` - broader design and implementation planning docs.
- `automation/` - suggestion-system, panel-detection, OCR/text-weight, and smart camera path spike/planning docs.
- `research/` - external research notes and source references.

Key model docs:

- `model/Cinematic_Guided_View_Model.md` - current product direction.
- `model/Camera_Frame_vs_Focus_Region.md` - preview frame, Camera Shot, Focus Region, and Shot Attention Path semantics.
- `model/Roadmap_Status_Classification.md` - current Core/Frozen/Deprecated/Legacy/Later/Human Decision roadmap status layer.

Key planning docs:

- `planning/AI_Director_Assistant_Roadmap.md` - AI director-assistant sequence and safety boundaries.
- `planning/AI_Director_Assistant_Roadmap_Reassessment.md` - post-T0084 AI branch reassessment and next-step recommendation.
- `planning/AI_Director_Suggestion_Contract_Planning.md` - corrected page-understanding to AI camera suggestion contract planning.
- `planning/AI_Draft_Shots_Focus_Regions_Planning.md` - later AI Camera Shot / Focus Region draft suggestion planning.
- `planning/AI_Budget_Provider_Decision_Gate_Planning.md` - provider, budget, privacy, consent, latency, and failure-handling decision gate planning before real AI integration.
- `planning/AI_Vision_Page_Understanding_Contract_Planning.md` - provider-neutral future page-understanding response contract planning.
- `planning/Audio_BGM_SFX_Suggestions_Planning.md` - advisory AI audio direction suggestion planning.
- `planning/Audio_SFX_Suggestion_Pass.md` - T0103 advisory BGM/SFX note contract after AI camera suggestion and Draft Motion grounding.
- `planning/Audio_Suggestion_Apply_Guardrails_Planning.md` - T0105 guardrails for any future safe apply behavior from audio notes.
- `planning/Director_Rulebook_v1_Planning.md` - T0106 shared director rulebook plan for camera motion, Draft Motion, timing, BGM, and SFX suggestions.
- `planning/DynamicManga_Director_Rulebook_Knowledge_Pack_Planning.md` - director knowledge-pack planning for future page-understanding suggestions.
- `planning/Practice_Fixture_Evaluation_Pass.md` - practice page set and evaluation checklist for page understanding, AI camera suggestions, and Draft Motion.
- `planning/Manual_Provider_Practice_Run_With_User_Selected_Pages.md` - T0111 provider-route practice results for user-selected local images.
- `planning/Practice_Page_Provider_Evaluation_Run.md` - T0110 provider evaluation-run record and future manual run sheet.
- `planning/Rulebook_Evaluation_Pass.md` - T0108 evaluation report comparing rulebook behavior against the practice scenarios.
- `planning/Unified_Suggestion_Review_Surface_Planning.md` - unified review model for current and future suggestion families.

Keep root docs focused on navigation, current state, verification, and ticket execution. Put deeper design or spike material in the closest matching subfolder.
