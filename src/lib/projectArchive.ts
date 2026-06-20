import {
  createProjectExportData,
  createProjectExportFileName,
} from "./projectExport";
import { parseProjectImportData } from "./projectImport";
import type { ImportedBackgroundAudio } from "./projectImport";
import type {
  CameraShot,
  FocusRegion,
  GuidedPageOptions,
  SoundEffectMarkerMetadata,
  UploadedBackgroundAudio,
  UploadedImage,
  UploadedSoundEffectMarker,
} from "./projectTypes";

const ARCHIVE_FORMAT = "cinematic-comic-project-archive";
const ARCHIVE_VERSION = 1;

type ProjectArchiveData = {
  archiveFormat: typeof ARCHIVE_FORMAT;
  archiveVersion: typeof ARCHIVE_VERSION;
  exportedAt: string;
  project: ReturnType<typeof createProjectExportData>;
  sourceImage: {
    fileName: string;
    width: number;
    height: number;
    mimeType: string;
    dataUrl: string;
  };
  sourceAudio?: {
    fileName: string;
    durationMs: number;
    mimeType: string;
    dataUrl: string;
  };
  sourceSoundEffects?: {
    id: string;
    fileName: string;
    durationMs: number;
    mimeType: string;
    dataUrl: string;
  }[];
};

export type ImportedProjectArchive = {
  image: UploadedImage;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  guidedPageOptions: GuidedPageOptions;
  backgroundAudio: UploadedBackgroundAudio | null;
  soundEffectMarkers: UploadedSoundEffectMarker[];
  missingSoundEffectMarkers: SoundEffectMarkerMetadata[];
};

export async function createProjectArchiveData({
  image,
  cameraShots,
  focusRegions,
  guidedPageOptions,
  backgroundAudio,
  soundEffectMarkers,
  soundEffectMarkerMetadata,
  exportedAt,
}: {
  image: UploadedImage;
  cameraShots: CameraShot[];
  focusRegions: FocusRegion[];
  guidedPageOptions?: GuidedPageOptions;
  backgroundAudio?: UploadedBackgroundAudio | null;
  soundEffectMarkers?: UploadedSoundEffectMarker[];
  soundEffectMarkerMetadata?: SoundEffectMarkerMetadata[];
  exportedAt: string;
}): Promise<ProjectArchiveData> {
  const project = createProjectExportData({
    image,
    cameraShots,
    focusRegions,
    guidedPageOptions,
    backgroundAudio,
    soundEffectMarkers: soundEffectMarkerMetadata ?? soundEffectMarkers,
    exportedAt,
  });
  const imageDataUrl = await readObjectUrlAsDataUrl(image.objectUrl);
  const audioDataUrl = backgroundAudio
    ? await readObjectUrlAsDataUrl(backgroundAudio.objectUrl, "audio")
    : null;
  const sourceSoundEffects = await Promise.all(
    (soundEffectMarkers ?? []).map(async (marker) => ({
      id: marker.id,
      fileName: marker.fileName,
      durationMs: marker.durationMs,
      mimeType: marker.mimeType,
      dataUrl: await readObjectUrlAsDataUrl(marker.objectUrl, "sound effect"),
    })),
  );

  return {
    archiveFormat: ARCHIVE_FORMAT,
    archiveVersion: ARCHIVE_VERSION,
    exportedAt,
    project: {
      ...project,
      image: {
        ...project.image,
        binaryIncluded: true,
        note: "Image binary data is included in this project archive.",
      },
      backgroundAudio: project.backgroundAudio
        ? {
            ...project.backgroundAudio,
            binaryIncluded: Boolean(audioDataUrl),
            note: audioDataUrl
              ? "Audio binary data is included in this project archive."
              : project.backgroundAudio.note,
          }
        : null,
      soundEffectMarkers: project.soundEffectMarkers.map((marker) => ({
        ...marker,
        binaryIncluded: sourceSoundEffects.some(
          (sourceMarker) => sourceMarker.id === marker.id,
        ),
        note: sourceSoundEffects.some((sourceMarker) => sourceMarker.id === marker.id)
          ? "Sound effect audio data is included in this project archive."
          : marker.note,
      })),
    },
    sourceImage: {
      fileName: image.fileName,
      width: image.width,
      height: image.height,
      mimeType: image.mimeType,
      dataUrl: imageDataUrl,
    },
    ...(backgroundAudio && audioDataUrl
      ? {
          sourceAudio: {
            fileName: backgroundAudio.fileName,
            durationMs: backgroundAudio.durationMs,
            mimeType: backgroundAudio.mimeType,
            dataUrl: audioDataUrl,
          },
        }
      : {}),
    ...(sourceSoundEffects.length > 0 ? { sourceSoundEffects } : {}),
  };
}

export async function parseProjectArchiveData(
  value: unknown,
): Promise<ImportedProjectArchive> {
  if (!isRecord(value)) {
    throw new Error("Project archive must contain an object.");
  }

  if (value.archiveFormat !== ARCHIVE_FORMAT) {
    throw new Error("Project archive format is not recognized.");
  }

  if (value.archiveVersion !== ARCHIVE_VERSION) {
    throw new Error(
      `Unsupported project archive version. Expected version ${ARCHIVE_VERSION}.`,
    );
  }

  const sourceImage = parseArchiveSourceImage(value.sourceImage);
  const importedProject = parseProjectImportData(value.project);
  const image = await createUploadedImageFromDataUrl(sourceImage);
  const sourceAudio = parseArchiveSourceAudio(value.sourceAudio);
  const backgroundAudio =
    sourceAudio && importedProject.backgroundAudio
      ? await createUploadedAudioFromDataUrl(
          sourceAudio,
          importedProject.backgroundAudio,
        )
      : null;
  const sourceSoundEffects = parseArchiveSourceSoundEffects(
    value.sourceSoundEffects,
  );
  const soundEffectMarkers = await createUploadedSoundEffectMarkersFromDataUrls(
    sourceSoundEffects,
    importedProject.soundEffectMarkers,
  );
  const restoredSoundEffectIds = new Set(
    soundEffectMarkers.map((marker) => marker.id),
  );

  if (
    importedProject.image &&
    (importedProject.image.width !== image.width ||
      importedProject.image.height !== image.height)
  ) {
    URL.revokeObjectURL(image.objectUrl);
    throw new Error(
      "Project archive image dimensions do not match the bundled project metadata.",
    );
  }

  return {
    image,
    cameraShots: importedProject.cameraShots,
    focusRegions: importedProject.focusRegions,
    guidedPageOptions: importedProject.guidedPageOptions,
    backgroundAudio,
    soundEffectMarkers,
    missingSoundEffectMarkers: importedProject.soundEffectMarkers.filter(
      (marker) => !restoredSoundEffectIds.has(marker.id),
    ),
  };
}

export function createProjectArchiveFileName(image: UploadedImage) {
  return createProjectExportFileName(image).replace(/\.json$/, ".ccvproject");
}

function parseArchiveSourceImage(value: unknown) {
  if (!isRecord(value)) {
    throw new Error("Project archive must include a sourceImage object.");
  }

  if (
    typeof value.fileName !== "string" ||
    typeof value.mimeType !== "string" ||
    typeof value.dataUrl !== "string" ||
    typeof value.width !== "number" ||
    typeof value.height !== "number"
  ) {
    throw new Error("Project archive sourceImage is incomplete.");
  }

  return {
    fileName: value.fileName,
    mimeType: value.mimeType,
    width: Math.round(value.width),
    height: Math.round(value.height),
    dataUrl: value.dataUrl,
  };
}

function parseArchiveSourceAudio(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (!isRecord(value)) {
    throw new Error("Project archive sourceAudio must be an object when present.");
  }

  if (
    typeof value.fileName !== "string" ||
    typeof value.mimeType !== "string" ||
    typeof value.dataUrl !== "string" ||
    typeof value.durationMs !== "number"
  ) {
    throw new Error("Project archive sourceAudio is incomplete.");
  }

  return {
    fileName: value.fileName,
    mimeType: value.mimeType,
    durationMs: Math.round(value.durationMs),
    dataUrl: value.dataUrl,
  };
}

function parseArchiveSourceSoundEffects(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("Project archive sourceSoundEffects must be an array.");
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    if (
      typeof item.id !== "string" ||
      typeof item.fileName !== "string" ||
      typeof item.mimeType !== "string" ||
      typeof item.dataUrl !== "string" ||
      typeof item.durationMs !== "number"
    ) {
      return [];
    }

    return [
      {
        id: item.id,
        fileName: item.fileName,
        mimeType: item.mimeType,
        durationMs: Math.round(item.durationMs),
        dataUrl: item.dataUrl,
      },
    ];
  });
}

async function readObjectUrlAsDataUrl(objectUrl: string, assetType = "image") {
  const response = await fetch(objectUrl);

  if (!response.ok) {
    throw new Error(
      `Source ${assetType} could not be read for project archive export.`,
    );
  }

  return readBlobAsDataUrl(await response.blob());
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Source file could not be encoded for archive export."));
    };
    reader.onerror = () =>
      reject(new Error("Source file could not be read for archive export."));
    reader.readAsDataURL(blob);
  });
}

async function createUploadedAudioFromDataUrl(
  sourceAudio: {
    fileName: string;
    mimeType: string;
    durationMs: number;
    dataUrl: string;
  },
  importedAudio: ImportedBackgroundAudio,
): Promise<UploadedBackgroundAudio> {
  const response = await fetch(sourceAudio.dataUrl);

  if (!response.ok) {
    throw new Error("Bundled background audio could not be read.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  return {
    objectUrl,
    fileName: sourceAudio.fileName || importedAudio.fileName,
    durationMs: importedAudio.durationMs || sourceAudio.durationMs,
    mimeType: sourceAudio.mimeType || importedAudio.mimeType || blob.type,
    settings: importedAudio.settings,
  };
}

async function createUploadedSoundEffectMarkersFromDataUrls(
  sourceSoundEffects: {
    id: string;
    fileName: string;
    mimeType: string;
    durationMs: number;
    dataUrl: string;
  }[],
  importedMarkers: SoundEffectMarkerMetadata[],
): Promise<UploadedSoundEffectMarker[]> {
  const sourceById = new Map(
    sourceSoundEffects.map((sourceMarker) => [sourceMarker.id, sourceMarker]),
  );
  const markers: UploadedSoundEffectMarker[] = [];

  for (const importedMarker of importedMarkers) {
    const sourceMarker = sourceById.get(importedMarker.id);

    if (!sourceMarker) {
      continue;
    }

    const response = await fetch(sourceMarker.dataUrl);

    if (!response.ok) {
      continue;
    }

    const blob = await response.blob();

    markers.push({
      ...importedMarker,
      objectUrl: URL.createObjectURL(blob),
      fileName: sourceMarker.fileName || importedMarker.fileName,
      durationMs: importedMarker.durationMs || sourceMarker.durationMs,
      mimeType: sourceMarker.mimeType || importedMarker.mimeType || blob.type,
    });
  }

  return markers;
}

async function createUploadedImageFromDataUrl(sourceImage: {
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  dataUrl: string;
}): Promise<UploadedImage> {
  const response = await fetch(sourceImage.dataUrl);

  if (!response.ok) {
    throw new Error("Bundled source image could not be read.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const dimensions = await readImageDimensions(objectUrl);

    if (
      dimensions.width !== sourceImage.width ||
      dimensions.height !== sourceImage.height
    ) {
      throw new Error(
        "Bundled source image dimensions do not match archive metadata.",
      );
    }

    return {
      objectUrl,
      fileName: sourceImage.fileName,
      width: dimensions.width,
      height: dimensions.height,
      mimeType: sourceImage.mimeType || blob.type,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function readImageDimensions(objectUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();

    image.onload = () =>
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    image.onerror = () =>
      reject(new Error("Bundled source image could not be loaded."));
    image.src = objectUrl;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
