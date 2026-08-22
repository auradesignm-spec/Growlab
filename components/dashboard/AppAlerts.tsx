"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import type { AppAlert } from "@/lib/dashboard/alerts";
import ShareSheet from "@/components/dashboard/ShareSheet";

const SEEN_KEY = "gl-seen-alerts";

export default function AppAlerts({ alerts }: { alerts: AppAlert[] }) {
  const t = useTranslations("appShell.alerts");
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SEEN_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      setSeen(new Set(ids));
    } catch {
      setSeen(new Set());
    }
    setReady(true);
  }, []);

  const unseen = useMemo(() => alerts.filter((alert) => !seen.has(alert.id)), [alerts, seen]);

  useEffect(() => {
    if (!ready || unseen.length === 0) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const latest = unseen[0];
    try {
      new Notification(t(`kinds.${latest.kind}` as "kinds.new_order"), {
        body: latest.productTitle,
        tag: latest.id,
      });
    } catch {
      // Notification constructor can throw if the page is not allowed to notify.
    }
  }, [ready, t, unseen]);

  function markSeen() {
    const next = new Set(seen);
    for (const alert of alerts) next.add(alert.id);
    setSeen(next);
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...next]));
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }

  if (alerts.length === 0) return null;

  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-wrap items-center justify-between gap-3 px-4 py-2 sm:px-8">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            markSeen();
          }}
          className="min-h-11 text-start text-[13px] text-frost"
        >
          {unseen.length > 0 ? t("unseen", { count: unseen.length }) : t("title")}
        </button>
        {unseen.length > 0 ? (
          <span className="font-mono text-[12px] text-frost-dim">{unseen.length}</span>
        ) : null}
      </div>
      {open ? (
        <ul className="mx-auto max-w-wrap space-y-2 px-4 pb-4 sm:px-8">
          {alerts.map((alert) => (
            <li key={alert.id} className="rounded-2xl border border-line bg-night px-4 py-3">
              <p className="text-[12px] text-frost-faint">{t(`kinds.${alert.kind}` as "kinds.new_order")}</p>
              <p className="mt-1 text-[15px] font-medium text-frost">{alert.productTitle}</p>
              {alert.creatorUsername ? (
                <p className="mt-0.5 font-mono text-[12px] text-frost-dim">@{alert.creatorUsername}</p>
              ) : null}
              {alert.amount != null ? (
                <p className="mt-1 font-mono text-[13px] text-frost">{formatMoney(alert.amount)}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Link href={alert.href} className="inline-flex text-[13px] text-frost-dim underline">
                  {t("open")}
                </Link>
                {alert.notifyWhatsAppUrl ? (
                  <a
                    href={alert.notifyWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-[13px] text-frost-dim underline"
                  >
                    {t("notifyWhatsapp")}
                  </a>
                ) : null}
              </div>
              {alert.sharePath ? <ShareSheet productTitle={alert.productTitle} sharePath={alert.sharePath} /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
