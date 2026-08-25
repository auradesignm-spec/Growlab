"use client";

import { useCallback, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  analyzeMerchantAdCreative,
  applyApprovedSuggestions,
  disconnectMetaAdAccount,
  launchApprovedAdCampaign,
  refreshMetaAdOptions,
  selectMetaAdTargets,
  setAdDraftStatus,
  setAdLaunchPaused,
  type AdAccountView,
  type AdDraftView,
  type AdLaunchView,
  type AdProductOption,
  type MetaAdOptionLists,
} from "@/app/(dashboard)/dashboard/ad-actions";
import type { AdPerformanceContext } from "@/lib/meta/adAgent";

declare global {
  interface Window {
    FB?: {
      init: (opts: Record<string, unknown>) => void;
      login: (
        cb: (response: { authResponse?: { code?: string; accessToken?: string } }) => void,
        opts: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

function loadFacebookSdk(appId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve();
      return;
    }
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v21.0",
      });
      resolve();
    };
    if (document.getElementById("facebook-jssdk")) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Meta SDK"));
    document.body.appendChild(script);
  });
}

export default function AdCoachPanel({
  initialDrafts,
  products,
  context,
  locale,
  initialAdAccount,
  initialLaunches,
  whatsappPhone,
  whatsappConnected,
}: {
  initialDrafts: AdDraftView[];
  products: AdProductOption[];
  context: AdPerformanceContext;
  locale: "ar" | "en";
  initialAdAccount: AdAccountView;
  initialLaunches: AdLaunchView[];
  whatsappPhone: string;
  whatsappConnected: boolean;
}) {
  const t = useTranslations("dashboardApp.merchant.adCoach");
  const [drafts, setDrafts] = useState(initialDrafts);
  const [launches, setLaunches] = useState(initialLaunches);
  const [adAccount, setAdAccount] = useState(initialAdAccount);
  const [options, setOptions] = useState<MetaAdOptionLists | null>(null);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [hook, setHook] = useState("");
  const [caption, setCaption] = useState("");
  const [script, setScript] = useState("");
  const [visualHook, setVisualHook] = useState("");
  const [budget, setBudget] = useState("5");
  const [imageUrl, setImageUrl] = useState(products[0]?.imageUrl ?? "");
  const [confirmSpend, setConfirmSpend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(initialDrafts[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [busyAds, setBusyAds] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const productImages = selectedProduct?.images ?? [];

  const active = drafts.find((d) => d.id === activeId) ?? drafts[0] ?? null;
  const canLaunch =
    Boolean(active) &&
    (active?.status === "approved" || active?.status === "exported") &&
    adAccount.connected &&
    whatsappConnected &&
    Boolean(adAccount.pageId);

  function runAnalyze() {
    setError(null);
    startTransition(async () => {
      try {
        const row = await analyzeMerchantAdCreative({
          locale,
          productId: productId || undefined,
          hook,
          caption,
          script,
          visualHook,
        });
        setDrafts((prev) => [row, ...prev]);
        setActiveId(row.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("analyzeFailed"));
      }
    });
  }

  function act(status: "approved" | "rejected" | "exported") {
    if (!active) return;
    setError(null);
    startTransition(async () => {
      try {
        if (status === "exported") {
          const row = await applyApprovedSuggestions(active.id);
          setDrafts((prev) => prev.map((d) => (d.id === row.id ? row : d)));
          setHook(row.originalHook);
          setCaption(row.originalCaption);
          setScript(row.originalScript);
          setVisualHook(row.originalVisualHook);
          return;
        }
        await setAdDraftStatus(active.id, status);
        setDrafts((prev) => prev.map((d) => (d.id === active.id ? { ...d, status } : d)));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  const connectAds = useCallback(async () => {
    setError(null);
    setBusyAds(true);
    try {
      // Local simulation: skip Facebook Login entirely.
      if (adAccount.dryRun) {
        const res = await fetch("/api/meta/ads/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          error?: string;
          account?: {
            adAccountId: string;
            adAccountName: string;
            currency: string;
            pageId: string;
            status: string;
          };
        };
        if (!res.ok || !json.ok || !json.account) throw new Error(json.error || t("adsConnectFailed"));
        setAdAccount((prev) => ({
          ...prev,
          connected: true,
          adAccountId: json.account!.adAccountId,
          adAccountName: json.account!.adAccountName,
          currency: json.account!.currency,
          pageId: json.account!.pageId,
          status: "active",
        }));
        setOptions({
          accounts: [
            {
              id: json.account!.adAccountId,
              name: json.account!.adAccountName,
              currency: json.account!.currency,
              currencyOffset: 1000,
            },
          ],
          pages: [{ id: json.account!.pageId || "dry_page", name: "Dry-run Page" }],
        });
        return;
      }
      if (!adAccount.appId) {
        setError(t("adsNotConfigured"));
        return;
      }
      await loadFacebookSdk(adAccount.appId);
      const accessToken = await new Promise<string>((resolve, reject) => {
        if (!window.FB) {
          reject(new Error(t("adsSdkMissing")));
          return;
        }
        window.FB.login(
          (response) => {
            const token = response.authResponse?.accessToken;
            if (token) resolve(token);
            else reject(new Error(t("adsLoginCancelled")));
          },
          {
            scope:
              "ads_management,ads_read,business_management,pages_show_list,pages_read_engagement",
            return_scopes: true,
          },
        );
      });

      const res = await fetch("/api/meta/ads/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        account?: {
          adAccountId: string;
          adAccountName: string;
          currency: string;
          pageId: string;
          status: string;
        };
        options?: MetaAdOptionLists | { accounts?: MetaAdOptionLists["accounts"]; pages?: MetaAdOptionLists["pages"] };
      };
      if (!res.ok || !json.ok || !json.account) {
        throw new Error(json.error || t("adsConnectFailed"));
      }
      setAdAccount((prev) => ({
        ...prev,
        connected: true,
        adAccountId: json.account!.adAccountId,
        adAccountName: json.account!.adAccountName,
        currency: json.account!.currency,
        pageId: json.account!.pageId,
        status: json.account!.status,
      }));
      const opts = json.options;
      if (opts && Array.isArray(opts.accounts)) {
        setOptions({
          accounts: opts.accounts.map((a) => ({
            id: a.id,
            name: a.name,
            currency: a.currency,
            currencyOffset: "currencyOffset" in a ? Number(a.currencyOffset) || 100 : 100,
          })),
          pages: Array.isArray(opts.pages) ? opts.pages : [],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("adsConnectFailed"));
    } finally {
      setBusyAds(false);
    }
  }, [adAccount.appId, adAccount.dryRun, t]);

  function loadOptions() {
    setError(null);
    startTransition(async () => {
      try {
        const lists = await refreshMetaAdOptions();
        setOptions(lists);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  function applyTargets(nextAccountId: string, nextPageId: string) {
    setError(null);
    startTransition(async () => {
      try {
        const row = await selectMetaAdTargets({
          adAccountId: nextAccountId,
          pageId: nextPageId,
        });
        setAdAccount(row);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  function runLaunch() {
    if (!active) return;
    setError(null);
    startTransition(async () => {
      try {
        const row = await launchApprovedAdCampaign({
          draftId: active.id,
          dailyBudgetOmr: Number(budget),
          imageUrl,
          confirmSpend,
        });
        setLaunches((prev) => [row, ...prev]);
        setDrafts((prev) => prev.map((d) => (d.id === active.id ? { ...d, status: "launched" } : d)));
        setConfirmSpend(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("launchFailed"));
      }
    });
  }

  function togglePause(launch: AdLaunchView, paused: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const row = await setAdLaunchPaused(launch.id, paused);
        setLaunches((prev) => prev.map((l) => (l.id === row.id ? row : l)));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  return (
    <div className="space-y-8 p-5 sm:p-8">
      <section className="rounded-2xl border border-line bg-[var(--paper)] p-5">
        <p className="gl-eyebrow">{t("kicker")}</p>
        <h2 className="mt-1 text-xl font-semibold text-frost">{t("title")}</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-frost-dim">{t("lede")}</p>
        <p className="mt-3 rounded-xl border border-line bg-white px-4 py-3 text-[12px] text-frost-dim">
          {t("launchNotice")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-frost-dim">
          <span>{t("ctxLeads", { count: context.leadsTotal })}</span>
          <span>{t("ctxAd", { count: context.leadsFromAd })}</span>
          <span>{t("ctxWa", { state: context.whatsappConnected ? t("waOn") : t("waOff") })}</span>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h3 className="text-[15px] font-semibold text-frost">{t("adsAccountTitle")}</h3>
        <p className="mt-1 text-[13px] text-frost-dim">{t("adsAccountLede")}</p>
        {adAccount.connected ? (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[13px] text-frost">
                {t("adsAccountConnected", {
                  name: adAccount.adAccountName || adAccount.adAccountId,
                  currency: adAccount.currency,
                })}
                {adAccount.dryRun ? ` · ${t("dryRunBadge")}` : ""}
              </p>
              <button
                type="button"
                className="gl-btn-ghost"
                disabled={pending}
                onClick={loadOptions}
              >
                {t("refreshTargets")}
              </button>
              <button
                type="button"
                className="gl-btn-ghost"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await disconnectMetaAdAccount();
                    setOptions(null);
                    setAdAccount((prev) => ({
                      ...prev,
                      connected: false,
                      adAccountId: "",
                      adAccountName: "",
                      pageId: "",
                      status: "disconnected",
                    }));
                  })
                }
              >
                {t("adsDisconnect")}
              </button>
            </div>
            {options && (options.accounts.length > 0 || options.pages.length > 0) ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-[13px] text-frost-dim">
                  {t("pickAdAccount")}
                  <select
                    className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
                    value={adAccount.adAccountId}
                    disabled={pending}
                    onChange={(e) => applyTargets(e.target.value, adAccount.pageId || options.pages[0]?.id || "")}
                  >
                    {options.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.currency})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[13px] text-frost-dim">
                  {t("pickPage")}
                  <select
                    className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
                    value={adAccount.pageId}
                    disabled={pending || options.pages.length === 0}
                    onChange={(e) => applyTargets(adAccount.adAccountId, e.target.value)}
                  >
                    {options.pages.length === 0 ? (
                      <option value="">{t("noPages")}</option>
                    ) : (
                      options.pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              </div>
            ) : (
              <p className="text-[12px] text-frost-faint">
                {t("pageHint", { pageId: adAccount.pageId || "—" })}
              </p>
            )}
          </div>
        ) : (
          <button type="button" className="gl-btn-primary mt-3" disabled={busyAds} onClick={connectAds}>
            {busyAds ? t("adsConnecting") : t("adsConnect")}
          </button>
        )}
        {!whatsappConnected ? (
          <p className="mt-3 text-[12px] text-amber-800">{t("needWhatsapp")}</p>
        ) : (
          <p className="mt-3 text-[12px] text-frost-faint">
            {t("whatsappReady", { phone: whatsappPhone || "—" })}
          </p>
        )}
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">{error}</p>
      ) : null}

      <section className="rounded-2xl border border-line bg-white p-5">
        <h3 className="text-[15px] font-semibold text-frost">{t("formTitle")}</h3>
        {products.length > 0 ? (
          <label className="mt-3 block text-[13px] text-frost-dim">
            {t("product")}
            <select
              className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
              value={productId}
              onChange={(e) => {
                const id = e.target.value;
                setProductId(id);
                const p = products.find((x) => x.id === id);
                if (p?.images[0]) setImageUrl(p.images[0]);
                else if (p?.imageUrl) setImageUrl(p.imageUrl);
              }}
            >
              <option value="">{t("productNone")}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="mt-3 block text-[13px] text-frost-dim">
          {t("hook")}
          <input
            className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            maxLength={300}
          />
        </label>
        <label className="mt-3 block text-[13px] text-frost-dim">
          {t("caption")}
          <textarea
            className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
          />
        </label>
        <label className="mt-3 block text-[13px] text-frost-dim">
          {t("script")}
          <textarea
            className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
            rows={4}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            maxLength={2200}
          />
        </label>
        <label className="mt-3 block text-[13px] text-frost-dim">
          {t("visualHook")}
          <input
            className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
            value={visualHook}
            onChange={(e) => setVisualHook(e.target.value)}
            maxLength={400}
          />
        </label>

        <button type="button" className="gl-btn-primary mt-4" disabled={pending} onClick={runAnalyze}>
          {pending ? t("analyzing") : t("analyze")}
        </button>
      </section>

      {active?.analysis ? (
        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-frost">{t("resultTitle")}</h3>
            <span className="rounded-full bg-[var(--paper)] px-3 py-1 text-[11px] text-frost-dim">
              {active.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(
              [
                ["hook", active.analysis.scores.hookStrength],
                ["psych", active.analysis.scores.psychFit],
                ["meta", active.analysis.scores.metaAlgorithmFit],
                ["cta", active.analysis.scores.ctaClarity],
                ["overall", active.analysis.scores.overall],
              ] as const
            ).map(([key, score]) => (
              <div key={key} className="rounded-xl border border-line bg-[var(--paper)] p-3 text-center">
                <p className="text-[11px] text-frost-faint">{t(`score.${key}`)}</p>
                <p className="mt-1 font-mono text-lg text-frost">{score}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[13px] text-frost-dim">{active.rationale}</p>
          <p className="mt-2 text-[12px] text-frost-faint">
            {t("predict", {
              lift: active.analysis.predicted.interestLift,
              confidence: active.analysis.predicted.confidence,
            })}{" "}
            — {active.analysis.predicted.note}
          </p>

          {active.analysis.issues.length > 0 ? (
            <ul className="mt-4 list-disc space-y-1 ps-5 text-[13px] text-amber-900">
              {active.analysis.issues.map((issue, i) => (
                <li key={`issue-${i}`}>{issue}</li>
              ))}
            </ul>
          ) : null}
          {active.analysis.opportunities.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 ps-5 text-[13px] text-frost-dim">
              {active.analysis.opportunities.map((item, i) => (
                <li key={`opp-${i}`}>{item}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <DiffBlock title={t("suggestedHook")} before={active.originalHook} after={active.suggestedHook} />
            <DiffBlock
              title={t("suggestedVisual")}
              before={active.originalVisualHook}
              after={active.suggestedVisualHook}
            />
            <DiffBlock
              title={t("suggestedCaption")}
              before={active.originalCaption}
              after={active.suggestedCaption}
            />
            <DiffBlock
              title={t("suggestedScript")}
              before={active.originalScript}
              after={active.suggestedScript}
            />
          </div>
          <p className="mt-3 text-[13px] font-medium text-frost">
            {t("suggestedCta")}: {active.suggestedCta}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="gl-btn-primary"
              disabled={pending || active.status !== "analyzed"}
              onClick={() => act("approved")}
            >
              {t("approve")}
            </button>
            <button
              type="button"
              className="gl-btn-ghost"
              disabled={pending || (active.status !== "analyzed" && active.status !== "approved")}
              onClick={() => act("rejected")}
            >
              {t("reject")}
            </button>
            <button
              type="button"
              className="gl-btn-ghost"
              disabled={pending || active.status !== "approved"}
              onClick={() => act("exported")}
            >
              {t("applyExport")}
            </button>
          </div>
        </section>
      ) : null}

      {canLaunch ? (
        <section className="rounded-2xl border border-frost/20 bg-white p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-[15px] font-semibold text-frost">{t("launchTitle")}</h3>
          <p className="mt-1 text-[13px] text-frost-dim">{t("launchLede")}</p>

          <label className="mt-4 block text-[13px] text-frost-dim">
            {t("dailyBudget")}
            <input
              type="number"
              min={1}
              max={500}
              step={1}
              className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </label>
          <label className="mt-3 block text-[13px] text-frost-dim">
            {t("imageUrl")}
            <input
              className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://"
            />
          </label>
          {productImages.length > 0 ? (
            <div className="mt-3">
              <p className="text-[13px] text-frost-dim">{t("pickProductImage")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {productImages.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setImageUrl(url)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                      imageUrl === url ? "border-frost" : "border-line"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <label className="mt-4 flex items-start gap-2 text-[13px] text-frost">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmSpend}
              onChange={(e) => setConfirmSpend(e.target.checked)}
            />
            <span>{t("confirmSpend")}</span>
          </label>
          <button
            type="button"
            className="gl-btn-primary mt-4"
            disabled={pending || !confirmSpend}
            onClick={runLaunch}
          >
            {pending ? t("launching") : t("launch")}
          </button>
          <p className="mt-2 text-[12px] text-frost-faint">{t("advantageNote")}</p>
        </section>
      ) : null}

      {launches.length > 0 ? (
        <section className="rounded-2xl border border-line bg-white p-5">
          <h3 className="text-[15px] font-semibold text-frost">{t("launchesTitle")}</h3>
          <ul className="mt-3 divide-y divide-line">
            {launches.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-frost">{l.headline || l.id}</p>
                  <p className="text-[12px] text-frost-faint">
                    {l.status}
                    {l.dryRun ? ` · ${t("dryRunBadge")}` : ""} · {l.dailyBudgetOmr} {l.currency}/day
                    {l.metaCampaignId ? ` · ${l.metaCampaignId}` : ""}
                  </p>
                  {l.lastError ? <p className="text-[12px] text-red-700">{l.lastError}</p> : null}
                </div>
                <div className="flex gap-2">
                  {l.status === "active" || l.status === "dry_run" ? (
                    <button
                      type="button"
                      className="gl-btn-ghost"
                      disabled={pending}
                      onClick={() => togglePause(l, true)}
                    >
                      {t("pause")}
                    </button>
                  ) : null}
                  {l.status === "paused" ? (
                    <button
                      type="button"
                      className="gl-btn-ghost"
                      disabled={pending}
                      onClick={() => togglePause(l, false)}
                    >
                      {t("resume")}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {drafts.length > 0 ? (
        <section className="rounded-2xl border border-line bg-white p-5">
          <h3 className="text-[15px] font-semibold text-frost">{t("historyTitle")}</h3>
          <ul className="mt-3 divide-y divide-line">
            {drafts.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 py-3 text-start text-[13px] text-frost hover:opacity-80"
                  onClick={() => setActiveId(d.id)}
                >
                  <span className="line-clamp-1">{d.suggestedHook || d.originalHook || d.id}</span>
                  <span className="shrink-0 text-frost-faint">{d.status}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function DiffBlock({ title, before, after }: { title: string; before: string; after: string }) {
  return (
    <div className="rounded-xl border border-line bg-[var(--paper)] p-3">
      <p className="text-[12px] font-medium text-frost">{title}</p>
      <p className="mt-2 text-[12px] text-frost-faint line-through opacity-70">{before || "—"}</p>
      <p className="mt-2 whitespace-pre-wrap text-[13px] text-frost">{after || "—"}</p>
    </div>
  );
}
