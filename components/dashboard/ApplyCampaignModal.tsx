"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { BrowseProductRow } from "@/lib/dashboard/browse";
import type { SamplePolicy } from "@/lib/domain/ugc";
import { applyToCampaign } from "@/app/(dashboard)/dashboard/campaign-actions";
import { scanForContactLeak } from "@/lib/security/antiLeak";
import type { CampaignApplyPath } from "@/lib/domain/enums";
import ShareSheet from "@/components/dashboard/ShareSheet";

export default function ApplyCampaignModal({
  row,
  samplePolicy,
  onClose,
  onApplied,
}: {
  row: BrowseProductRow;
  samplePolicy: SamplePolicy;
  onClose: () => void;
  onApplied: (path: CampaignApplyPath) => void;
}) {
  const t = useTranslations("dashboardApp.browse.applyModal");
  const tBrowse = useTranslations("dashboardApp.browse");
  const [note, setNote] = useState("");
  const [ack, setAck] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ path: CampaignApplyPath; referralLink: string; status: string } | null>(null);

  const leak = useMemo(() => scanForContactLeak(note), [note]);
  const hasMediaKit = row.mediaAssets.length > 0;

  function apply(path: CampaignApplyPath) {
    if (path === "sample_ugc" && leak.flagged) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await applyToCampaign(row.productId, path, path === "sample_ugc" ? note : "");
        setResult({ path: res.path, referralLink: res.referralLink, status: res.status });
        onApplied(res.path);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-frost/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-white p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {result ? (
          <div>
            <p className="text-[20px] font-semibold text-frost">{t("successTitle")}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-frost-dim">
              {result.path === "media_kit" ? t("successMediaKit") : t("successSample")}
            </p>
            {result.status === "active" ? (
              <ShareSheet productTitle={row.title} sharePath={result.referralLink} />
            ) : (
              <p className="mt-6 rounded-2xl border border-line bg-night px-4 py-3 text-[14px] leading-relaxed text-frost-dim">
                {t("pendingNote")}
              </p>
            )}
            <button type="button" onClick={onClose} className="gl-btn-ghost mt-6 w-full">
              {t("close")}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[20px] font-semibold text-frost">{t("title")}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-frost-dim">
              {t("subtitle", {
                merchant: row.merchantBusinessName,
                amount: formatMoney(row.estimatedNetProfit, row.currency),
              })}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-2xl border border-line bg-night p-4">
                <div>
                  <p className="text-[16px] font-semibold text-frost">{t("mediaKitTitle")}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-frost-dim">{t("mediaKitDesc")}</p>
                  {hasMediaKit ? (
                    <div className="mt-3 space-y-2">
                      <p className="font-mono text-[12px] text-frost-faint">
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
                              className="h-14 w-14 rounded-lg border border-line object-cover"
                            />
                          ) : (
                            <a
                              key={asset.id}
                              href={asset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-14 w-14 items-center justify-center rounded-lg border border-line bg-white font-mono text-[10px] text-frost"
                            >
                              {tBrowse("videoBadge")}
                            </a>
                          )
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 rounded-2xl border border-dashed border-line bg-white px-3 py-3 text-[13px] text-frost-dim">
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

              <div className="flex flex-col justify-between rounded-2xl border border-line bg-night p-4">
                <div>
                  <p className="text-[16px] font-semibold text-frost">{t("sampleTitle")}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-frost-dim">{t("sampleDesc")}</p>
                  <p className="mt-3 font-mono text-[12px] text-danger">
                    {!samplePolicy.allowed
                      ? t("sampleLockedNew")
                      : samplePolicy.depositPct === 0
                        ? t("depositElite")
                        : t("depositNotice", {
                            amount: formatMoney(row.sampleDeposit ?? 0, row.currency),
                          })}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-frost-dim">{t("deadlineNotice")}</p>

                  <input
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setError(null);
                    }}
                    placeholder={tBrowse("sampleNotePlaceholder")}
                    aria-label={tBrowse("sampleNotePlaceholder")}
                    className={`mt-3 w-full rounded-xl border bg-white px-3 py-2 text-[14px] ${
                      leak.flagged ? "border-danger/60" : "border-line"
                    }`}
                  />
                  {leak.flagged && (
                    <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-danger" role="alert">
                      {tBrowse("leakWarning")}
                    </p>
                  )}

                  <label className="mt-3 flex items-start gap-2 text-[13px] text-frost-dim">
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
                  disabled={!samplePolicy.allowed || !ack || leak.flagged || pending}
                  onClick={() => apply("sample_ugc")}
                  className="gl-btn-primary mt-4 w-full disabled:opacity-40"
                >
                  {t("sampleCta")}
                </button>
              </div>
            </div>

            {pending && <p className="mt-4 font-mono text-[12px] text-frost-dim">{t("submitting")}</p>}
            {error && <p className="mt-4 font-mono text-[12px] text-danger">{error}</p>}

            <button type="button" onClick={onClose} className="gl-btn-ghost mt-6">
              {t("close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
