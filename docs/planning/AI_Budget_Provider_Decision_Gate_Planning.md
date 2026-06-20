# AI Budget / Provider Decision Gate Planning

This document is planning only for T0089. It does not implement source behavior, provider/API code, real AI calls, Project JSON schema changes, suggestion persistence, preview behavior, export behavior, automatic generation, audio fetching/downloading, automatic SFX placement, dependencies, or accepted project mutation.

## Purpose

T0086 through T0088 planned the unified review surface, provider-neutral page-understanding contract, and DynamicManga-style director knowledge layer. T0089 defines the decision gate that must be passed before any real AI provider integration sends comic page images or project context outside the browser.

The goal is not to choose an implementation today. The goal is to define the constraints that a later provider/API ticket must satisfy: provider disclosure, user consent, budget limits, latency expectations, cancellation, retry behavior, rate-limit handling, privacy, copyright posture, data retention, and failure states.

## Core Rule

Accepted project data remains the source of truth:

- Camera Shots are accepted page-level reading containers.
- Focus Regions are accepted page-level reusable attention targets.
- Shot Attention Paths are accepted per-shot references to page-level Focus Regions.
- Accepted motion roles remain `track`, `pushIn`, and `pushOut`.
- Accepted effects remain supporting layers, currently Shake and Impact Pulse.
- Manual Background music and SFX markers remain accepted audio data.

All AI outputs remain temporary reviewable suggestions until the user explicitly accepts, edits, applies, rejects, or discards them. Provider output must never mutate accepted project data by itself.

## Decision Gate Outcome

A later implementation ticket should not start real provider/API work until this gate has a documented outcome:

- `go`: a provider path, cost envelope, privacy posture, consent UX, and failure model are approved.
- `goWithLimits`: a narrow provider path is approved only for mock/prototype users, small images, no persistence, or explicit opt-in.
- `noGo`: provider work remains blocked because cost, privacy, copyright, latency, reliability, or user-control requirements are unresolved.

The decision should name the approved scope. A `go` for page-understanding suggestions is not a `go` for audio generation, dialogue/narration, automatic SFX placement, project mutation, cloud storage, authentication, or paid production usage.

## Provider Selection Criteria

Provider evaluation should cover:

- Vision capability for comic page layout, panels, reading order, character/face regions, speech-heavy regions, action/detail regions, mood, and motion intent.
- Structured output reliability for the T0087 response contract.
- Ability to follow product guardrails: no automatic accepted-state mutation, no destructive panel cropping, no unsupported motion roles, and no unsupported effects.
- Image input size limits, accepted formats, timeout behavior, and partial-failure behavior.
- Cost model for image input, text output, retries, and possible multi-pass analysis.
- Privacy terms, training/data-use controls, retention options, and enterprise or zero-retention availability if needed.
- Regional availability and legal/compliance constraints for uploaded comic pages.
- Rate limits, burst limits, concurrency limits, and backoff requirements.
- API stability, model versioning, response metadata, and observability.
- Local/mock fallback support for development and demos.

The first provider integration should prefer a narrow page-understanding use case over broad creative generation. It should return temporary suggestions and warnings, not generated media.

## Budget Constraints

The product should define explicit per-page and per-session budget limits before integration:

- Maximum source image dimensions or upload byte size for provider analysis.
- Maximum number of provider calls per page analysis.
- Maximum retry count and maximum cumulative cost per user action.
- Whether accepted project context, existing shots, Focus Regions, audio metadata, or rulebook text is included in the request.
- Whether the DynamicManga knowledge pack is sent in full, summarized, or applied locally after provider response.
- Whether a response may be regenerated and whether regeneration consumes a new budget.

Budget should be visible to the user at the point of consent when real cost matters. The application should never silently issue repeated provider calls after a failed or cancelled analysis.

## Latency And UX Limits

Provider analysis should have a clear interaction model:

- User starts analysis through an explicit action.
- The UI shows pending state, provider/model disclosure, and cancellation.
- A normal request should target a short interactive wait, with timeout handling before the app feels stuck.
- Long-running analysis should remain cancellable.
- The editor should remain usable while suggestions are pending when feasible.
- A cancelled or timed-out request should leave accepted project data unchanged.
- Partial results should be reviewable only if validation can mark warnings clearly.

The first implementation should avoid automatic background analysis on image upload. Analysis should be deliberate because comic page images may be copyrighted or private.

## Consent Requirements

Before sending image pixels or project context to a provider, the user should see a clear consent step that discloses:

- The provider and model family when known.
- That the comic page image may be sent outside the local app.
- What project context may be sent: image dimensions, accepted Camera Shots, Focus Regions, Shot Attention Paths, timing, effect settings, audio metadata, or none.
- Whether the request may include the director rulebook or product guidance text.
- Whether provider responses are stored, cached, logged, or discarded.
- That suggestions are temporary and must be manually reviewed before affecting accepted project data.
- That copyrighted, licensed, private, or sensitive pages should be analyzed only when the user has the right to do so.

Consent should be per analysis action at first. A later settings ticket may define remembered consent or provider defaults, but remembered consent should not be assumed here.

## Privacy, Copyright, And Data Retention

Provider integration should default to the least data needed:

- Send the source image only when vision analysis requires it.
- Avoid sending audio binaries unless a later audio-specific ticket explicitly scopes that behavior.
- Avoid sending user secrets, local file paths, or archive internals.
- Prefer normalized project metadata over raw full Project JSON when possible.
- Do not store raw provider responses in Project JSON until a future persistence ticket defines schema and review behavior.
- Do not cache uploaded image pixels remotely unless provider terms and product UX explicitly disclose it.

The app should treat comic pages as potentially copyrighted and private. Provider disclosure should not imply that analysis grants rights to reproduce, transform, distribute, or publish the source material.

## Request Shape Boundaries

A first real provider request should be constrained to page understanding and reviewable authoring suggestions:

- Allowed inputs: source image, source image dimensions, limited accepted project context, requested analysis scope, and product guardrails.
- Allowed outputs: normalized temporary suggestions, confidence, evidence, warnings, stale/blocked data, provider metadata, and failure state.
- Disallowed outputs: accepted Camera Shots, accepted Focus Regions, accepted Shot Attention Paths, automatic timeline edits, downloadable/generated audio, generated images, hidden provider asset IDs, or direct Project JSON mutation.

The future implementation should preserve a provider adapter boundary:

- Provider raw output is parsed defensively.
- Normalization converts raw output into the T0087-style contract.
- The DynamicManga rulebook may rank, filter, explain, or generate temporary guidance.
- The unified review surface presents suggestions.
- User actions are the only path to accepted project data.

## Cancellation, Retry, And Rate Limits

The future UX should define:

- A cancel action while the provider request is pending.
- No accepted-state mutation on cancellation.
- No automatic retry after user cancellation.
- Retry only after provider/network failures that are safe to retry.
- Bounded retry count with exponential or provider-recommended backoff.
- Clear messages for rate limits, quota exhaustion, authentication failure, provider downtime, and malformed provider responses.
- A cooldown or disabled action state while retry is unsafe.

Retries should keep the same analysis scope unless the user explicitly changes the request. A retry should not create duplicate visible suggestion batches without a clear batch identity.

## Failure States

The provider gate should require reviewable failure states for:

- No provider configured.
- Missing user consent.
- Unsupported image type.
- Image too large.
- Provider unavailable.
- Network failure.
- Timeout.
- Request cancelled.
- Rate limited.
- Quota or budget exhausted.
- Authentication or permission failure.
- Provider safety refusal.
- Malformed response.
- Invalid geometry or unsupported fields after normalization.
- Partial response with warnings.
- No useful suggestions.

Every failure state should leave accepted project data unchanged. Failures may create a visible status or temporary warning, but not accepted shots, focus regions, attention paths, effects, audio markers, or Project JSON records.

## Go / No-Go Checklist

Real provider/API implementation should remain blocked until a later ticket can answer:

- Which provider and model are approved for first integration?
- What exact analysis scope is allowed?
- What image and metadata are sent?
- What is the expected cost per page and maximum user-triggered cost?
- What latency target and timeout are acceptable?
- What cancellation and retry behavior is implemented?
- What rate-limit and quota states are shown?
- What provider terms cover training, retention, logging, and deletion?
- What consent copy and provider disclosure does the user see?
- Are copyrighted/private comic page warnings present?
- Are provider responses transient, cached, or persisted?
- How are malformed or partial responses validated?
- How does the implementation prevent automatic accepted-state mutation?
- What mock/offline fallback exists for development and demos?

If any answer is missing, the first provider ticket should remain planning or mock-only.

## Recommended Next Ticket

Recommended next ticket: T0090 - AI Provider Adapter Boundary Planning.

Rationale: T0089 defines the decision gate. The next safe planning step is to define the adapter boundary, mock/offline fallback, validation handoff, and provider metadata shape before adding real API credentials, network calls, or runtime provider behavior.

## Non-Goals

T0089 does not implement:

- Source code changes.
- Provider/API code.
- Real AI calls.
- Provider credentials or settings UI.
- Project JSON schema changes.
- Suggestion persistence.
- Automatic Camera Shot, Focus Region, Shot Attention Path, effect, timing, or audio generation.
- Preview or export behavior changes.
- Audio fetching/downloading, audio generation, dialogue/narration, or automatic SFX placement.
- OCR, panel detection runtime, face detection runtime, or speech bubble recognition.
- New dependencies.

## Manual Verification Expectations

For this planning ticket:

- Confirm this document is planning-only.
- Confirm it defines go/no-go criteria before real provider/API implementation.
- Confirm it covers provider selection, budget/cost constraints, latency, cancellation, retry, rate limits, and failure states.
- Confirm it defines consent, privacy, copyright, data retention, and provider disclosure requirements.
- Confirm accepted project data remains the source of truth.
- Confirm all AI outputs remain temporary reviewable suggestions.
- Confirm it recommends T0090 - AI Provider Adapter Boundary Planning.
- Confirm it does not claim source behavior, provider/API code, real AI calls, Project JSON schema changes, suggestion persistence, preview/export behavior, or automatic generation exists.
