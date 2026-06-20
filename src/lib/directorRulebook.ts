import type {
  ActiveShotAttentionMotionRole,
  CameraShot,
  FocusRegion,
  ShotAttentionPathItem,
} from "./projectTypes";

export const DIRECTOR_RULEBOOK_ID = "director-rulebook-v1";
export const DIRECTOR_RULEBOOK_VERSION = "1.0";

export type DirectorBeatType =
  | "establishingEnvironment"
  | "normalReadingFlow"
  | "dialogueSpeechHeavy"
  | "speakerToSpeakerExchange"
  | "reactionEmotion"
  | "actionImpact"
  | "detailInspectionClue"
  | "revealContextRestoration"
  | "transitionSceneChange"
  | "punchlineGagPayoff"
  | "tensionMood";

export type DirectorRulebookAcceptedContext = {
  cameraShots: Array<{
    id: string;
    label: string;
    purpose?: CameraShot["shotPurpose"];
    durationMs: number;
    attentionPathCount: number;
  }>;
  focusRegions: Array<{
    id: string;
    label: string;
    kind?: FocusRegion["kind"];
    sequenceOrder?: number;
  }>;
  acceptedDetails: Array<{
    id: string;
    label: string;
    sequenceOrder?: number;
  }>;
  pathBeats: Array<{
    shotId: string;
    pathItemId: string;
    focusRegionId: string;
    motionRole?: ShotAttentionPathItem["motionRole"];
    effectCues?: ShotAttentionPathItem["effectCues"];
  }>;
};

export const DIRECTOR_RULEBOOK_PROMPT_SUMMARY = [
  `${DIRECTOR_RULEBOOK_ID} ${DIRECTOR_RULEBOOK_VERSION}`,
  "Accepted/corrected project data outranks raw AI detections.",
  "Comic-reading hierarchy: page sequence first, then panel as shot, then optional internal focus region, then optional attention path.",
  "Panels are the natural shot units; detections are not shots.",
  "Focus Regions are not required for every detection and should be skipped when the shot frame already covers the intended beat.",
  "Shot attention path items are only for meaningful internal movement inside a panel, usually 0-1 item and rarely 2.",
  "Adjacent panels matter: preserve reading continuity and avoid repeated aggressive push-ins across a continuing character, action, or conversation.",
  "Use only camera roles: track, pushIn, pushOut.",
  "track = normal reading flow, speaker-to-speaker, multi-target eye guidance, calm pan/glide.",
  "pushIn = reaction, emotion, realization, threat, inspection, impact, meaningful detail.",
  "pushOut = context restoration, reveal, environment, relationship, re-orientation.",
  "Prefer fewer meaningful beats over many detected targets.",
  "Speaker exchange, back-and-forth dialogue, setup/payoff, and response beats usually use track or restrained hold unless a specific reaction needs emphasis.",
  "Detections are not directing beats: overlapping or nearby face/action/detail boxes should be consolidated into one beat cluster before motion is suggested.",
  "One beat cluster should usually create one camera-motion idea; supporting detections can influence timing/confidence but should not create extra motion.",
  "Speech regions mostly affect timing/hold and should not become automatic motion targets.",
  "Raw character/face/detail regions need narrative justification before becoming motion targets.",
  "BGM follows page/sequence mood; SFX only supports visible action, impact, object, environment, or transition cues.",
  "Audio supports camera/story beats and must not create hidden story beats or automatic markers.",
].join("\n");

export function createDirectorRulebookAcceptedContext(
  cameraShots: CameraShot[],
  focusRegions: FocusRegion[],
): DirectorRulebookAcceptedContext {
  return {
    cameraShots: cameraShots.map((shot) => ({
      id: shot.id,
      label: shot.label,
      purpose: shot.shotPurpose,
      durationMs: shot.durationMs,
      attentionPathCount: shot.attentionPath?.length ?? 0,
    })),
    focusRegions: focusRegions.map((region) => ({
      id: region.id,
      label: region.label,
      kind: region.kind,
      sequenceOrder: region.sequenceOrder,
    })),
    acceptedDetails: focusRegions
      .filter((region) => region.kind === "detail")
      .map((region) => ({
        id: region.id,
        label: region.label,
        sequenceOrder: region.sequenceOrder,
      })),
    pathBeats: cameraShots.flatMap((shot) =>
      [...(shot.attentionPath ?? [])]
        .sort((first, second) => first.order - second.order)
        .map((pathItem) => ({
          shotId: shot.id,
          pathItemId: pathItem.id,
          focusRegionId: pathItem.focusRegionId,
          motionRole: pathItem.motionRole,
          effectCues: pathItem.effectCues,
        })),
    ),
  };
}

export function getDirectorBeatTypeFromText(
  text: string,
  fallback: DirectorBeatType = "normalReadingFlow",
): DirectorBeatType {
  const normalizedText = text.toLowerCase();

  if (/\b(speaker|exchange|back.?and.?forth|two.?character|reply|response|responds|alternat(?:e|es|ing))\b/.test(normalizedText)) {
    return "speakerToSpeakerExchange";
  }

  if (/\b(action|impact|hit|crash|attack|fall|burst|motion line)\b/.test(normalizedText)) {
    return "actionImpact";
  }

  if (/\b(reaction|emotion|realization|expression|face|fear|sad|shock)\b/.test(normalizedText)) {
    return "reactionEmotion";
  }

  if (/\b(gag|punchline|joke|payoff|comedy|setup)\b/.test(normalizedText)) {
    return "punchlineGagPayoff";
  }

  if (/\b(detail|clue|inspect|object|prop|symbol)\b/.test(normalizedText)) {
    return "detailInspectionClue";
  }

  if (/\b(reveal|context|relationship|widen|environment)\b/.test(normalizedText)) {
    return "revealContextRestoration";
  }

  if (/\b(establish|establishing|wide|room|street|setting|background)\b/.test(normalizedText)) {
    return "establishingEnvironment";
  }

  if (/\b(dialogue|speech|balloon|caption|conversation)\b/.test(normalizedText)) {
    return "dialogueSpeechHeavy";
  }

  if (/\b(tension|suspense|threat|mood|dread)\b/.test(normalizedText)) {
    return "tensionMood";
  }

  return fallback;
}

export function getRecommendedMotionForBeat(
  beatType: DirectorBeatType,
): ActiveShotAttentionMotionRole {
  if (
    beatType === "reactionEmotion" ||
    beatType === "actionImpact" ||
    beatType === "detailInspectionClue" ||
    beatType === "punchlineGagPayoff" ||
    beatType === "tensionMood"
  ) {
    return "pushIn";
  }

  if (
    beatType === "establishingEnvironment" ||
    beatType === "revealContextRestoration" ||
    beatType === "transitionSceneChange"
  ) {
    return "pushOut";
  }

  return "track";
}

export function getTimingHintForBeat(
  beatType: DirectorBeatType,
): "slow" | "medium" | "fast" {
  if (
    beatType === "dialogueSpeechHeavy" ||
    beatType === "reactionEmotion" ||
    beatType === "establishingEnvironment" ||
    beatType === "detailInspectionClue" ||
    beatType === "punchlineGagPayoff"
  ) {
    return "slow";
  }

  if (beatType === "actionImpact") {
    return "fast";
  }

  return "medium";
}

export function formatDirectorRuleWarning(ruleId: string, message: string) {
  return `Director rulebook ${ruleId}: ${message}`;
}
