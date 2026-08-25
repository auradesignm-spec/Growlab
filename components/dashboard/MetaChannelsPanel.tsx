"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  disconnectMetaConnection,
  setInterestLeadStatus,
  updateAutoReplySettings,
  updateRecoverySettings,
  type ChannelConnectionView,
  type InterestLeadView,
} from "@/app/(dashboard)/dashboard/channel-actions";

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

type SessionInfo = {
  phone_number_id?: string;
  waba_id?: string;
  business_id?: string;
  page_ids?: string[];
};

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
    const existing = document.getElementById("facebook-jssdk");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Meta SDK"));
    document.body.appendChild(script);
  });
}

export default function MetaChannelsPanel({
  initialConnection,
  initialLeads,
  initialStats,
}: {
  initialConnection: ChannelConnectionView;
  initialLeads: InterestLeadView[];
  initialStats: { total: number; fromAd: number; organic: number };
}) {
  const t = useTranslations("dashboardApp.merchant.channels");
  const [connection, setConnection] = useState(initialConnection);
  const [leads, setLeads] = useState(initialLeads);
  const [stats, setStats] = useState(initialStats);
  const [autoText, setAutoText] = useState(initialConnection.autoReplyText);
  const [autoEnabled, setAutoEnabled] = useState(initialConnection.autoReplyEnabled);
  const [recoveryEnabled, setRecoveryEnabled] = useState(initialConnection.recoveryEnabled);
  const [recovery1h, setRecovery1h] = useState(initialConnection.recoveryText1h);
  const [recovery6h, setRecovery6h] = useState(initialConnection.recoveryText6h);
  const [recovery24h, setRecovery24h] = useState(initialConnection.recoveryText24h);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const sessionRef = useRef<SessionInfo | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!event.origin.includes("facebook.com") && !event.origin.includes("instagram.com")) {
        return;
      }
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "WA_EMBEDDED_SIGNUP" && data?.event === "FINISH") {
          sessionRef.current = (data.data ?? data) as SessionInfo;
        }
      } catch {
        /* ignore non-JSON */
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    if (!connection.configured || !connection.appId || !connection.configId) {
      setError(t("notConfigured"));
      return;
    }
    setBusy(true);
    try {
      await loadFacebookSdk(connection.appId);
      const code = await new Promise<string>((resolve, reject) => {
        if (!window.FB) {
          reject(new Error(t("sdkMissing")));
          return;
        }
        window.FB.login(
          (response) => {
            const c = response.authResponse?.code;
            if (c) resolve(c);
            else reject(new Error(t("loginCancelled")));
          },
          {
            config_id: connection.configId,
            response_type: "code",
            override_default_response_type: true,
            extras: {
              setup: {},
              featureType: "",
              sessionInfoVersion: "3",
            },
          },
        );
      });

      // Session info may arrive slightly after login finishes.
      await new Promise((r) => setTimeout(r, 400));
      const session = sessionRef.current;
      const phoneNumberId = session?.phone_number_id?.trim();
      const wabaId = session?.waba_id?.trim();
      if (!phoneNumberId || !wabaId) {
        throw new Error(t("sessionMissing"));
      }

      const res = await fetch("/api/meta/whatsapp/embedded-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          wabaId,
          phoneNumberId,
          businessId: session?.business_id,
          pageId: session?.page_ids?.[0],
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        connection?: ChannelConnectionView & { id: string };
      };
      if (!res.ok) throw new Error(json.error || t("connectFailed"));

      setConnection((prev) => ({
        ...prev,
        connected: true,
        displayPhone: json.connection?.displayPhone ?? prev.displayPhone,
        phoneNumberId: json.connection?.phoneNumberId ?? phoneNumberId,
        wabaId: json.connection?.wabaId ?? wabaId,
        status: json.connection?.status ?? "active",
        autoReplyEnabled: json.connection?.autoReplyEnabled ?? prev.autoReplyEnabled,
        autoReplyText: json.connection?.autoReplyText ?? prev.autoReplyText,
        connectedAt: json.connection?.connectedAt ?? new Date().toISOString(),
        lastError: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("connectFailed"));
    } finally {
      setBusy(false);
    }
  }, [connection.appId, connection.configId, connection.configured, sessionRef, t]);

  function saveAutoReply() {
    setError(null);
    startTransition(async () => {
      try {
        await updateAutoReplySettings({ enabled: autoEnabled, text: autoText });
        setConnection((c) => ({ ...c, autoReplyEnabled: autoEnabled, autoReplyText: autoText }));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  function saveRecovery() {
    setError(null);
    startTransition(async () => {
      try {
        await updateRecoverySettings({
          enabled: recoveryEnabled,
          text1h: recovery1h,
          text6h: recovery6h,
          text24h: recovery24h,
        });
        setConnection((c) => ({
          ...c,
          recoveryEnabled,
          recoveryText1h: recovery1h,
          recoveryText6h: recovery6h,
          recoveryText24h: recovery24h,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("saveFailed"));
      }
    });
  }

  function disconnect() {
    setError(null);
    startTransition(async () => {
      try {
        await disconnectMetaConnection();
        setConnection((c) => ({ ...c, connected: false, status: "disconnected" }));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("disconnectFailed"));
      }
    });
  }

  function markLead(id: string, status: "interested" | "rejected" | "chatting") {
    startTransition(async () => {
      try {
        await setInterestLeadStatus(id, status);
        setLeads((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
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

        {!connection.configured ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            {t("notConfigured")}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {connection.connected ? (
            <>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-medium text-emerald-800">
                {t("statusActive", { phone: connection.displayPhone || connection.phoneNumberId })}
              </span>
              <button
                type="button"
                className="gl-btn-ghost"
                disabled={pending || busy}
                onClick={disconnect}
              >
                {t("disconnect")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="gl-btn-primary"
              disabled={busy || !connection.configured}
              onClick={() => void connect()}
            >
              {busy ? t("connecting") : t("connect")}
            </button>
          )}
        </div>

        {connection.lastError ? (
          <p className="mt-3 text-[12px] text-frost-faint">{t("lastError", { error: connection.lastError })}</p>
        ) : null}
      </section>

      {connection.connected ? (
        <section className="rounded-2xl border border-line bg-white p-5">
          <h3 className="text-[15px] font-semibold text-frost">{t("autoReplyTitle")}</h3>
          <p className="mt-1 text-[13px] text-frost-dim">{t("autoReplyLede")}</p>
          <label className="mt-4 flex items-center gap-2 text-[13px] text-frost">
            <input
              type="checkbox"
              checked={autoEnabled}
              onChange={(e) => setAutoEnabled(e.target.checked)}
            />
            {t("autoReplyEnabled")}
          </label>
          <textarea
            className="mt-3 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
            rows={4}
            value={autoText}
            onChange={(e) => setAutoText(e.target.value)}
            maxLength={1000}
          />
          <button
            type="button"
            className="gl-btn-primary mt-3"
            disabled={pending}
            onClick={saveAutoReply}
          >
            {t("saveAutoReply")}
          </button>
        </section>
      ) : null}

      {connection.connected ? (
        <section className="rounded-2xl border border-line bg-white p-5">
          <h3 className="text-[15px] font-semibold text-frost">{t("recoveryTitle")}</h3>
          <p className="mt-1 text-[13px] text-frost-dim">{t("recoveryLede")}</p>
          <label className="mt-4 flex items-center gap-2 text-[13px] text-frost">
            <input
              type="checkbox"
              checked={recoveryEnabled}
              onChange={(e) => setRecoveryEnabled(e.target.checked)}
            />
            {t("recoveryEnabled")}
          </label>
          <label className="mt-3 block text-[12px] text-frost-dim">
            {t("recovery1h")}
            <textarea
              className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
              rows={2}
              value={recovery1h}
              onChange={(e) => setRecovery1h(e.target.value)}
              maxLength={1000}
            />
          </label>
          <label className="mt-3 block text-[12px] text-frost-dim">
            {t("recovery6h")}
            <textarea
              className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
              rows={2}
              value={recovery6h}
              onChange={(e) => setRecovery6h(e.target.value)}
              maxLength={1000}
            />
          </label>
          <label className="mt-3 block text-[12px] text-frost-dim">
            {t("recovery24h")}
            <textarea
              className="mt-1 w-full rounded-xl border border-line bg-[var(--paper)] px-3 py-2 text-[14px] text-frost"
              rows={2}
              value={recovery24h}
              onChange={(e) => setRecovery24h(e.target.value)}
              maxLength={1000}
            />
          </label>
          <button
            type="button"
            className="gl-btn-primary mt-3"
            disabled={pending}
            onClick={saveRecovery}
          >
            {t("saveRecovery")}
          </button>
          {connection.datasetId ? (
            <p className="mt-3 text-[11px] text-frost-faint">{t("capiDataset", { id: connection.datasetId })}</p>
          ) : (
            <p className="mt-3 text-[11px] text-frost-faint">{t("capiDatasetPending")}</p>
          )}
        </section>
      ) : null}

      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-frost">{t("leadsTitle")}</h3>
            <p className="mt-1 text-[13px] text-frost-dim">{t("leadsLede")}</p>
          </div>
          <div className="flex gap-3 text-[12px] text-frost-dim">
            <span>{t("statTotal", { count: stats.total })}</span>
            <span>{t("statAd", { count: stats.fromAd })}</span>
            <span>{t("statOrganic", { count: stats.organic })}</span>
          </div>
        </div>

        {leads.length === 0 ? (
          <p className="mt-6 text-[14px] text-frost-faint">{t("leadsEmpty")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {leads.map((lead) => (
              <li key={lead.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-frost" dir="ltr">
                    +{lead.phone}
                  </p>
                  <p className="mt-1 text-[13px] text-frost-dim line-clamp-2">
                    {lead.lastMessagePreview || "—"}
                  </p>
                  <p className="mt-1 text-[11px] text-frost-faint">
                    {lead.fromAd ? t("badgeAd") : t("badgeOrganic")} · {lead.status}
                    {lead.metaAdId ? ` · ad ${lead.metaAdId}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    className="gl-btn-ghost text-[12px]"
                    disabled={pending}
                    onClick={() => markLead(lead.id, "interested")}
                  >
                    {t("markInterested")}
                  </button>
                  <button
                    type="button"
                    className="gl-btn-ghost text-[12px]"
                    disabled={pending}
                    onClick={() => markLead(lead.id, "rejected")}
                  >
                    {t("markRejected")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
