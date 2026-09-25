"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { mediaTypes, mediaLimits } from "@/lib/media";

export default function MediaPicker({
  kind,
  value,
  disabled,
  onChange,
  onBusy,
}: {
  kind: "image" | "video";
  value: string;
  disabled: boolean;
  onChange: (url: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  async function select(file?: File) {
    if (!file) return;
    setError("");
    if (!mediaTypes[kind].includes(file.type)) {
      setError(
        kind === "image"
          ? "Choose a JPG, PNG, WebP, GIF or AVIF photo. Export HEIC photos as JPG first."
          : "Choose an MP4, WebM or MOV video. MP4 plays on the widest range of devices.",
      );
      return;
    }
    if (!file.size || file.size > mediaLimits[kind]) {
      setError(
        `Choose a non-empty file up to ${kind === "image" ? 10 : 100} MB.`,
      );
      return;
    }
    onBusy(true);
    setProgress(0);
    try {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 10) || "file";
      const result = await upload(
        `media/${kind}/${crypto.randomUUID()}.${extension}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/media/upload",
          contentType: file.type,
          multipart: file.size > 5 * 1024 * 1024,
          onUploadProgress: ({ percentage }) =>
            setProgress(Math.round(percentage)),
        },
      );
      onChange(result.url);
    } catch {
      setError(
        "Upload failed. Check your connection and try again. If it continues, check that Vercel Blob is connected and sign in again.",
      );
    } finally {
      setProgress(null);
      onBusy(false);
    }
  }
  return (
    <div className="media-picker">
      <label>
        {kind === "image" ? "Photo" : "Video (optional)"}
        <input
          type="file"
          accept={mediaTypes[kind].join(",")}
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void select(file);
          }}
        />
      </label>
      <p className="hint">
        {kind === "image"
          ? "Choose a photo from your gallery or computer. Up to 10 MB."
          : "Choose a video from your gallery or computer. Up to 100 MB. MP4 recommended."}
      </p>
      {progress !== null && (
        <div role="status">
          <progress value={progress} max={100} aria-label="Upload progress" />{" "}
          Uploading {progress}%
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {value && (
        <div className="media-preview">
          {kind === "image" ? (
            <img src={value} alt="Selected photo" />
          ) : (
            <video src={value} controls playsInline preload="metadata" />
          )}
          <button
            type="button"
            className="text-link"
            disabled={disabled}
            onClick={() => onChange("")}
          >
            Remove {kind === "image" ? "photo" : "video"}
          </button>
          <p className="hint">Save the item to apply your changes.</p>
        </div>
      )}
    </div>
  );
}
