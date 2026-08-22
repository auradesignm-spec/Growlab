"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { BrowseProductRow } from "@/lib/dashboard/browse";
import { applyToCampaign } from "@/app/(dashboard)/dashboard/campaign-actions";
import { scanForContactLeak } from "@/lib/security/antiLeak";
import type { CampaignApplyPath } from "@/lib/domain/enums";

export default function ApplyCampaignModal({
  row,
  onClose,
  onApplied,
}: {
  row: BrowseProductRow;
  onClose: () => void;
  onApplied: (path: CampaignApplyPath) => void;
}) {
  const t = useTranslations("dashboardApp.browse.applyModal");
  const tBrowse = useTranslations("dashboardApp.browse");
  const [note, setNote] = useState("");
  const [ack, setAck] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ path: CampaignApplyPath; referralLink: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const leak = useMemo(() => scanForContactLeak(note), [note]);
  const hasMediaKit = row.mediaAssets.length > 0;
  const fullLink = useMemo(
    () => (result ? `${typeof window !== "undefined" ? window.location.origin : ""}${result.referralLink}` : ""),
    [result]
  );

  function apply(path: CampaignApplyPath) {
    if (path === "sample_ugc" && leak.flagged) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await applyToCampaign(row.productId, path, path === "sample_ugc" ? note : "");
        setResult({ path: res.path, referralLink: res.referralLink });
        onApplied(res.path);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable (insecure context, permissions) — silently ignore.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/10 bg-white/[0.04] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {result ? (
          <div>
            <p className="font-display text-xl">{t("successTitle")}</p>
            <p className="mt-3 font-serif text-sm italic text-frost-dim">
              {result.path === "media_kit" ? t("successMediaKit") : t("successSample")}
            </p>
            <div className="mt-6 border border-signal/30 bg-signal/10 p-4">
              <p className="font-west text-[10px] uppercase tracking-[0.24em] text-frost-dim">{t("linkLabel")}</p>
              <p className="mt-1.5 break-all font-mono text-sm">{fullLink}</p>
              <button type="button" onClick={copyLink} className="gl-btn-primary mt-3">
                {copied ? t("copied") : t("copyCta")}
              </button>
            </div>
            <button type="button" onClick={onClose} className="gl-btn-ghost mt-6 w-full">
              {t("close")}
            </button>
          </div>
        ) : (
          <div>
            <p className="font-display text-xl">{t("title")}</p>
            <p className="mt-1.5 font-serif text-sm italic text-frost-dim">
              {t("subtitle", {
                merchant: row.merchantBusinessName,
                amount: formatMoney(row.estimatedNetProfit, row.currency),
              })}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-between border border-white/10 p-4">
                <div>
                  <p className="font-display text-base">{t("mediaKitTitle")}</p>
                  <p className="mt-2 font-serif text-xs italic text-frost-dim">{t("mediaKitDesc")}</p>
                  {hasMediaKit ? (
                    <div className="mt-3 space-y-2">
                      <p className="font-mono text-xs text-pulse">
                        {t("mediaKitCount", { count: row.mediaAssets.length })}
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {row.mediaAssets.slice(0, 4).map((asset) =>
                          asset.type === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={asset.id}
                              src={asset.url}
                              alt={asset.caption ?? ""}
                              className="h-14 w-14 border border-white/10 object-cover"
                            />
                          ) : (
                            <a
                              key={asset.id}
                              href={asset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-14 w-14 items-center justify-center border border-white/10 font-mono text-[10px] uppercase text-frost-dim"
                            >
                              ▶ video
                            </a>
                          )
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 border border-dashed border-white/15 px-3 py-3 font-serif text-xs italic text-frost-dim">
                      {t("mediaKitEmpty")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!hasMediaKit || pending}
                  onClick={() => apply("media_kit")}
                  className="gl-btn-primary mt-4 w-full disabled:opacity-40"
                >
                  {t("mediaKitCta")}
                </button>
              </div>

              <div className="flex flex-col justify-between border border-white/10 p-4">
                <div>
                  <p className="font-display text-base">{t("sampleTitle")}</p>
                  <p className="mt-2 font-serif text-xs italic text-frost-dim">{t("sampleDesc")}</p>
                  <p className="mt-3 font-mono text-xs text-danger">
                    {t("depositNotice", { amount: formatMoney(row.basePrice, row.currency) })}
                  </p>
                  <p className="mt-1.5 font-serif text-xs italic text-frost-dim">{t("deadlineNotice")}</p>

                  <input
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setError(null);
                    }}
                    placeholder={tBrowse("sampleNotePlaceholder")}
                    aria-label={tBrowse("sampleNotePlaceholder")}
                    className={`mt-3 w-full border bg-transparent px-3 py-2 font-serif text-sm italic ${
                      leak.flagged ? "border-danger/60" : "border-white/10"
                    }`}
                  />
                  {leak.flagged && (
                    <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-danger" role="alert">
                      {tBrowse("leakWarning")}
                    </p>
                  )}

                  <label className="mt-3 flex items-start gap-2 font-serif text-xs italic text-frost-dim">
                    <input
                      type="checkbox"
                      checked={ack}
                      onChange={(e) => setAck(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>{t("ackLabel")}</span>
                  </label>
                </div>
                <button
                  type="button"
                  disabled={!ack || leak.flagged || pending}
                  onClick={() => apply("sample_ugc")}
                  className="gl-btn-primary mt-4 w-full disabled:opacity-40"
                >
                  {t("sampleCta")}
                </button>
              </div>
            </div>

            {pending && <p className="mt-4 font-mono text-xs text-frost-dim">{t("submitting")}</p>}
            {error && <p className="mt-4 font-mono text-xs text-danger">{error}</p>}

            <button type="button" onClick={onClose} className="gl-btn-ghost mt-6">
              {t("close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
