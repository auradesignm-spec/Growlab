"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CREATOR_KYC_KINDS, type CreatorKycKind } from "@/lib/domain/enums";
import { submitCreatorKyc } from "@/app/(dashboard)/dashboard/kyc-actions";

const FACE_STEPS: CreatorKycKind[] = ["face_right", "face_left", "face_up", "face_down"];

export default function CreatorKycCapture({
  initialLegalName,
  reviewNote,
}: {
  initialLegalName?: string;
  reviewNote?: string | null;
}) {
  const t = useTranslations("kyc.creator");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [legalName, setLegalName] = useState(initialLegalName ?? "");
  const [step, setStep] = useState<CreatorKycKind>("national_id_front");
  const [captures, setCaptures] = useState<Partial<Record<CreatorKycKind, Blob>>>({});
  const [error, setError] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const startCamera = useCallback(async () => {
    setCamError(null);
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCamError(t("cameraDenied"));
    }
  }, [t]);

  useEffect(() => {
    void startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [startCamera]);

  function capture() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCaptures((prev) => ({ ...prev, [step]: blob }));
      },
      "image/jpeg",
      0.88
    );
  }

  const stepIndex = CREATOR_KYC_KINDS.indexOf(step);
  const currentBlob = captures[step];
  const allReady = CREATOR_KYC_KINDS.every((kind) => captures[kind]);

  function goNext() {
    const next = CREATOR_KYC_KINDS[stepIndex + 1];
    if (next) setStep(next);
  }

  function goPrev() {
    const prev = CREATOR_KYC_KINDS[stepIndex - 1];
    if (prev) setStep(prev);
  }

  function submit() {
    if (!legalName.trim() || !allReady) return;
    setError(null);
    const form = new FormData();
    form.set("legalName", legalName.trim());
    for (const kind of CREATOR_KYC_KINDS) {
      const blob = captures[kind];
      if (!blob) return;
      form.set(kind, blob, `${kind}.jpg`);
    }
    startTransition(async () => {
      try {
        await submitCreatorKyc(form);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  const isFace = FACE_STEPS.includes(step);

  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="gl-eyebrow">{t("kicker")}</p>
      <h2 className="mt-3 max-w-xl font-display text-display-md text-frost">{t("title")}</h2>
      <p className="gl-lede mt-3">{t("lede")}</p>
      {reviewNote && (
        <p className="mt-4 max-w-xl border border-danger/40 bg-danger/10 px-4 py-3 font-serif text-sm italic text-danger">
          {t("rejectedNote", { note: reviewNote })}
        </p>
      )}

      <label className="mt-8 block max-w-xl">
        <span className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{t("legalName")}</span>
        <input
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          className="gl-input mt-1.5"
          placeholder={t("legalNamePlaceholder")}
        />
      </label>

      <ol className="mt-8 flex flex-wrap gap-2">
        {CREATOR_KYC_KINDS.map((kind, index) => (
          <li key={kind}>
            <button
              type="button"
              onClick={() => setStep(kind)}
              className={`rounded-lg border px-3 py-1.5 text-[12px] ${
                step === kind
                  ? "border-white/25 bg-white/[0.06] text-frost"
                  : captures[kind]
                    ? "border-ok/40 text-ok"
                    : "border-white/15 text-frost-dim"
              }`}
            >
              {String(index + 1).padStart(2, "0")} · {t(`steps.${kind}`)}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid max-w-4xl gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
          <video ref={videoRef} playsInline muted autoPlay className="aspect-[4/3] w-full object-cover" />
          <p className="px-4 py-3 font-serif text-sm italic text-frost-dim">{t(`hints.${step}`)}</p>
        </div>
        <div className="flex flex-col justify-between rounded-lg border border-white/10 p-5">
          <div>
            <p className="text-[12px] text-frost-faint">
              {isFace ? t("faceGuide") : t("idGuide")}
            </p>
            <p className="mt-2 font-display text-xl text-frost">{t(`steps.${step}`)}</p>
            {currentBlob && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(currentBlob)}
                alt=""
                className="mt-4 aspect-[4/3] w-full rounded-2xl object-cover"
              />
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={capture} className="gl-btn-primary">
              {currentBlob ? t("retake") : t("capture")}
            </button>
            <button type="button" onClick={goPrev} disabled={stepIndex === 0} className="gl-btn-ghost disabled:opacity-40">
              {t("back")}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!currentBlob || stepIndex === CREATOR_KYC_KINDS.length - 1}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("next")}
            </button>
          </div>
        </div>
      </div>

      {camError && <p className="mt-4 font-mono text-xs text-danger">{camError}</p>}
      {error && <p className="mt-4 font-mono text-xs text-danger">{error}</p>}

      <button
        type="button"
        disabled={pending || !legalName.trim() || !allReady}
        onClick={submit}
        className="gl-btn-primary mt-8 disabled:opacity-40"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </section>
  );
}
