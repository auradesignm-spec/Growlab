"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function CreativeDropzone({
  previewUrl,
  kind,
  onFile,
  onClear,
}: {
  previewUrl: string | null;
  kind: "image" | "video" | "audio" | null;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const t = useTranslations("dashboardApp.merchant.adCoach");
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function take(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onFile(file);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        className="sr-only"
        onChange={(e) => {
          take(e.target.files);
          e.target.value = "";
        }}
      />
      {previewUrl && kind === "image" ? (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-night">
          <img src={previewUrl} alt="" className="mx-auto max-h-72 w-full object-contain" />
          <button type="button" className="gl-btn-ghost absolute end-3 top-3 min-h-11" onClick={onClear}>
            {t("dropClear")}
          </button>
        </div>
      ) : previewUrl && kind === "video" ? (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-night">
          <video src={previewUrl} className="mx-auto max-h-72 w-full" controls playsInline muted />
          <button type="button" className="gl-btn-ghost absolute end-3 top-3 min-h-11" onClick={onClear}>
            {t("dropClear")}
          </button>
        </div>
      ) : previewUrl && kind === "audio" ? (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-night p-6">
          <audio src={previewUrl} className="w-full" controls />
          <button type="button" className="gl-btn-ghost absolute end-3 top-3 min-h-11" onClick={onClear}>
            {t("dropClear")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`flex min-h-[11rem] w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition-colors ${
            drag ? "border-signal bg-signal/10" : "border-line bg-[var(--paper)]"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            take(e.dataTransfer.files);
          }}
        >
          <span className="text-[16px] font-semibold text-frost">{t("dropTitle")}</span>
          <span className="mt-2 max-w-md text-[13px] leading-relaxed text-frost-dim">{t("dropHint")}</span>
        </button>
      )}
    </div>
  );
}
