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
    <section className="px-5 py-10 sm:px-8 text-white">
      <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-400">
        {t("kicker")}
      </p>
      <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl">{t("title")}</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-2xl">{t("lede")}</p>
      {reviewNote && (
        <p className="mt-4 max-w-xl rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
          {t("rejectedNote", { note: reviewNote })}
        </p>
      )}

      <label className="mt-6 block max-w-xl">
        <span className="text-xs font-semibold text-slate-300">{t("legalName")}</span>
        <input
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder={t("legalNamePlaceholder")}
        />
      </label>

      {/* Visual Progress Stepper Card */}
      <div className="mt-8 max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl">
        {/* Stepper Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-xs font-bold text-amber-400 border border-amber-500/30">
              {stepIndex + 1}
            </span>
            <div>
              <p className="text-xs font-bold text-white sm:text-sm">
                {t("stepProgress", { current: stepIndex + 1, total: CREATOR_KYC_KINDS.length })}:{" "}
                <span className="text-amber-400">{t(`steps.${step}`)}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {isFace ? t("stageFaceScan") : t("stageIdCard")}
              </p>
            </div>
          </div>

          {/* Remaining Steps Badge */}
          <div className="flex items-center gap-2">
            {CREATOR_KYC_KINDS.length - Object.keys(captures).filter((k) => captures[k as CreatorKycKind]).length === 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {t("allCapturesDone")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                {t("remainingCaptures", {
                  count:
                    CREATOR_KYC_KINDS.length -
                    Object.keys(captures).filter((k) => captures[k as CreatorKycKind]).length,
                })}
              </span>
            )}
            <span className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-mono font-bold text-slate-300">
              {t("capturesCount", {
                completed: Object.keys(captures).filter((k) => captures[k as CreatorKycKind]).length,
                total: CREATOR_KYC_KINDS.length,
              })}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-3.5 relative">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 ease-out"
              style={{
                width: `${Math.round(
                  (Object.keys(captures).filter((k) => captures[k as CreatorKycKind]).length /
                    CREATOR_KYC_KINDS.length) *
                    100
                )}%`,
              }}
            />
          </div>
          {/* Step tick markers */}
          <div className="mt-1 flex justify-between px-0.5 text-[9px] font-mono text-slate-400">
            <span>0%</span>
            <span>33% (الهوية)</span>
            <span>66% (الوجه)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Visual Interactive Step Nodes */}
        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {CREATOR_KYC_KINDS.map((kind, index) => {
            const isCurrent = step === kind;
            const isDone = !!captures[kind];
            return (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => setStep(kind)}
                  className={`flex w-full items-center gap-2 rounded-xl border p-2 text-right transition-all sm:flex-col sm:items-center sm:text-center ${
                    isCurrent
                      ? "border-amber-500 bg-amber-500/20 text-white shadow-xs ring-2 ring-amber-500/40 font-bold"
                      : isDone
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-800 bg-slate-950/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-amber-500 text-black font-extrabold"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {isDone ? "✓" : String(index + 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-[11px] font-semibold ${isCurrent ? "text-amber-300" : isDone ? "text-emerald-300" : "text-slate-200"}`}>
                      {t(`steps.${kind}`)}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {isDone ? "ملتقطة ✓" : isCurrent ? "الخطوة الحالية" : "قيد الانتظار"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 grid max-w-4xl gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black">
          <video ref={videoRef} playsInline muted autoPlay className="aspect-[4/3] w-full object-cover" />
          <p className="px-4 py-3 text-xs text-slate-400 bg-slate-900 border-t border-slate-800">{t(`hints.${step}`)}</p>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div>
            <p className="text-xs text-slate-400">
              {isFace ? t("faceGuide") : t("idGuide")}
            </p>
            <p className="mt-2 text-lg font-bold text-white">{t(`steps.${step}`)}</p>
            {currentBlob && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(currentBlob)}
                alt=""
                className="mt-4 aspect-[4/3] w-full rounded-2xl object-cover border border-slate-700"
              />
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={capture}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-amber-500 px-5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition"
            >
              {currentBlob ? t("retake") : t("capture")}
            </button>
            <button
              type="button"
              onClick={goPrev}
              disabled={stepIndex === 0}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              {t("back")}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!currentBlob || stepIndex === CREATOR_KYC_KINDS.length - 1}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              {t("next")}
            </button>
          </div>
        </div>
      </div>

      {camError && <p className="mt-4 text-xs text-rose-400 font-medium">{camError}</p>}
      {error && <p className="mt-4 text-xs text-rose-400 font-medium">{error}</p>}

      <button
        type="button"
        disabled={pending || !legalName.trim() || !allReady}
        onClick={submit}
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-500 px-8 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 disabled:opacity-40 transition active:scale-95"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </section>
  );
}
