"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { uploadProductMedia } from "@/app/(dashboard)/dashboard/media-actions";

export interface PickedMedia {
  url: string;
  kind: "image" | "video";
}

export default function ProductMediaPicker({
  value,
  onChange,
  accept = "both",
  label,
  hint,
}: {
  value: PickedMedia | null;
  onChange: (next: PickedMedia | null) => void;
  accept?: "image" | "video" | "both";
  label?: string;
  hint?: string;
}) {
  const t = useTranslations("dashboardApp.merchant.mediaUpload");
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const acceptAttr =
    accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("file", file);
        const result = await uploadProductMedia(form);
        if (accept === "image" && result.kind !== "image") {
          setError(t("imageOnly"));
          return;
        }
        if (accept === "video" && result.kind !== "video") {
          setError(t("videoOnly"));
          return;
        }
        onChange(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("failed"));
      }
    });
  }

  return (
    <div className="space-y-3">
      {(label || hint) && (
        <div>
          {label ? (
            <span className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{label}</span>
          ) : null}
          {hint ? <span className="mt-0.5 block font-serif text-[11px] italic text-frost-dim">{hint}</span> : null}
        </div>
      )}

      <input
        ref={galleryRef}
        type="file"
        accept={acceptAttr}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={acceptAttr}
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => galleryRef.current?.click()}
          className="gl-btn-ghost disabled:opacity-40"
        >
          {pending ? t("uploading") : t("fromDevice")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => cameraRef.current?.click()}
          className="gl-btn-ghost disabled:opacity-40"
        >
          {t("fromCamera")}
        </button>
        {value ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => onChange(null)}
            className="font-west text-[10px] uppercase tracking-[0.2em] text-danger disabled:opacity-40"
          >
            {t("remove")}
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.03]">
          {value.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt="" className="max-h-48 w-full object-cover" />
          ) : (
            <video src={value.url} controls playsInline className="max-h-48 w-full bg-night" />
          )}
          <p className="truncate px-3 py-2 font-mono text-[10px] text-frost-faint">{value.url}</p>
        </div>
      ) : null}

      {error ? <p className="font-mono text-xs text-danger">{error}</p> : null}
    </div>
  );
}
