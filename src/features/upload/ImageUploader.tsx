import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { ProjectImageMetadata, UploadedImage } from "../../lib/projectTypes";

type ImageUploaderProps = {
  image: UploadedImage | null;
  expectedImage: ProjectImageMetadata | null;
  needsImage: boolean;
  onImageLoaded: (image: UploadedImage) => void;
};

const acceptedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function ImageUploader({
  image,
  expectedImage,
  needsImage,
  onImageLoaded,
}: ImageUploaderProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingObjectUrlRef.current) {
        URL.revokeObjectURL(pendingObjectUrlRef.current);
      }
    };
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage(null);

    if (pendingObjectUrlRef.current) {
      URL.revokeObjectURL(pendingObjectUrlRef.current);
      pendingObjectUrlRef.current = null;
    }

    if (!acceptedMimeTypes.has(file.type)) {
      setErrorMessage("Choose a PNG, JPG, JPEG, or WEBP image.");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    pendingObjectUrlRef.current = objectUrl;
    const img = new Image();

    img.onload = () => {
      if (pendingObjectUrlRef.current !== objectUrl) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      pendingObjectUrlRef.current = null;
      onImageLoaded({
        objectUrl,
        fileName: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        mimeType: file.type,
      });
      event.target.value = "";
    };

    img.onerror = () => {
      if (pendingObjectUrlRef.current === objectUrl) {
        pendingObjectUrlRef.current = null;
      }

      URL.revokeObjectURL(objectUrl);
      setErrorMessage("That file could not be loaded as an image.");
      event.target.value = "";
    };

    img.src = objectUrl;
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="panel-kicker">Input</span>
        <h2>Upload area</h2>
      </div>

      <div className="upload-content">
        <label className="file-picker">
          <span>Select comic page image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {image ? (
          <dl className="image-metadata" aria-label="Uploaded image metadata">
            <div>
              <dt>File name</dt>
              <dd>{image.fileName}</dd>
            </div>
            <div>
              <dt>Width</dt>
              <dd>{image.width}px</dd>
            </div>
            <div>
              <dt>Height</dt>
              <dd>{image.height}px</dd>
            </div>
            <div>
              <dt>MIME type</dt>
              <dd>{image.mimeType || "Unavailable"}</dd>
            </div>
          </dl>
        ) : needsImage && expectedImage ? (
          <div className="imported-image-needed">
            <p>Source image needed.</p>
            <span>
              This project expects the original page image. Re-select the image
              below before editing or previewing.
            </span>
            <dl className="image-metadata" aria-label="Expected image metadata">
              <div>
                <dt>Expected file</dt>
                <dd>{expectedImage.fileName}</dd>
              </div>
              <div>
                <dt>Width</dt>
                <dd>{expectedImage.width}px</dd>
              </div>
              <div>
                <dt>Height</dt>
                <dd>{expectedImage.height}px</dd>
              </div>
              <div>
                <dt>MIME type</dt>
                <dd>{expectedImage.mimeType || "Unavailable"}</dd>
              </div>
            </dl>
          </div>
        ) : needsImage ? (
          <div className="placeholder-box upload-empty">
            <p>Source image needed.</p>
            <span>
              The imported project did not include image metadata. Re-select the
              source image before editing or previewing.
            </span>
          </div>
        ) : (
          <div className="placeholder-box upload-empty">
            <p>No page loaded.</p>
            <span>Upload one PNG, JPG, JPEG, or WEBP file.</span>
          </div>
        )}
      </div>
    </section>
  );
}
