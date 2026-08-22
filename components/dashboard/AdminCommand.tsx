"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate, formatMoney } from "@/lib/format";
import { getDirectWhatsAppUrl } from "@/lib/constants";
import { adminSetAccountStatus, adminSetProductActive } from "@/app/(dashboard)/dashboard/admin-actions";
import type { AdminDashboardData, AdminFlagRow, AdminUserRow } from "@/lib/dashboard/admin";
import { EmptyState, Metric, TableShell } from "@/components/dashboard/ui";

export function MonitorTab({ data }: { data: AdminDashboardData }) {
  const t = useTranslations("dashboardApp.admin.monitor");
  const maxVisits = Math.max(1, ...data.trafficDays.map((day) => day.visits));

  return (
    <section className="px-5 py-10 sm:px-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label={t("users")} value={String(data.totals.users)} />
        <Metric label={t("visitsToday")} value={String(data.totals.visitsToday)} />
        <Metric label={t("visits7d")} value={String(data.totals.visits7d)} />
        <Metric label={t("walletCash")} value={formatMoney(data.totals.walletCash)} />
        <Metric label={t("orders")} value={String(data.totals.orders)} />
        <Metric label={t("gmv")} value={formatMoney(data.totals.attributedGmv)} />
        <Metric label={t("platformShare")} value={formatMoney(data.totals.platformShare)} />
        <Metric label={t("flagged")} value={String(data.totals.flaggedContent)} />
      </div>

      <p className="gl-eyebrow mt-12">{t("trafficTitle")}</p>
      <ul className="mt-4 space-y-2" aria-label={t("trafficTitle")}>
        {data.trafficDays.map((day) => (
          <li key={day.date} className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-[12px] text-frost-dim">{day.date.slice(5)}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-night" aria-hidden="true">
              <span
                className="block h-full bg-signal"
                style={{ width: `${Math.max(4, (day.visits / maxVisits) * 100)}%` }}
              />
            </span>
            <span className="w-8 text-end font-mono text-[12px]">{day.visits}</span>
          </li>
        ))}
      </ul>

      {data.trafficStores.length > 0 ? (
        <>
          <p className="gl-eyebrow mt-12">{t("storesTitle")}</p>
          <ul className="mt-4 space-y-1.5">
            {data.trafficStores.map((store) => (
              <li key={store.username} className="flex items-baseline justify-between border-b border-white/10 pb-1.5 font-mono text-sm">
                <span>@{store.username}</span>
                <span>{store.visits}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="gl-eyebrow mt-12">{t("leadsTitle")}</p>
      {data.leads.length === 0 ? (
        <EmptyState text={t("leadsEmpty")} />
      ) : (
        <ul className="mt-4 space-y-3">
          {data.leads.map((lead) => {
            const wa = getDirectWhatsAppUrl(lead.phone, t("warnLead", { name: lead.name }));
            return (
              <li key={lead.id} className="rounded-2xl border border-line px-4 py-3">
                <p className="font-display text-base">{lead.name}</p>
                <p className="text-[13px] text-frost-dim">{lead.biz}</p>
                <p className="mt-1 font-mono text-[12px]">{lead.phone}</p>
                <p className="mt-2 text-[13px] text-frost-faint">{lead.msg}</p>
                {wa ? (
                  <a href={wa} target="_blank" rel="noreferrer" className="gl-btn-ghost mt-3 inline-flex min-h-11">
                    {t("whatsapp")}
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function UsersTab({ data }: { data: AdminDashboardData }) {
  const t = useTranslations("dashboardApp.admin.users");
  const locale = useLocale();

  if (data.users.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("empty")} />
      </section>
    );
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="max-w-lg text-[14px] leading-relaxed text-frost-dim">{t("hint")}</p>
      <TableShell head={[t("columns.person"), t("columns.role"), t("columns.contact"), t("columns.status"), t("columns.actions")]}>
        {data.users.map((user) => (
          <UserRow key={user.id} user={user} locale={locale} />
        ))}
      </TableShell>
    </section>
  );
}

function UserRow({ user, locale }: { user: AdminUserRow; locale: string }) {
  const t = useTranslations("dashboardApp.admin.users");
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState(user.banReason ?? "");
  const [error, setError] = useState<string | null>(null);
  const warnText = t("warnMessage", { name: user.firstName || user.name });
  const wa = getDirectWhatsAppUrl(user.phone, warnText);
  const mail = user.email ? `mailto:${user.email}?subject=${encodeURIComponent("Growlab")}&body=${encodeURIComponent(warnText)}` : null;

  function run(status: "active" | "suspended" | "banned") {
    setError(null);
    startTransition(async () => {
      try {
        await adminSetAccountStatus(user.id, status, reason);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <tr className="border-b border-white/10 align-top">
      <td className="px-4 py-3">
        <p className="font-display text-base">{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.name}</p>
        <p className="text-[12px] text-frost-dim">{user.handle}</p>
        <p className="font-mono text-[11px] text-frost-faint">{formatDate(user.createdAt, locale)}</p>
      </td>
      <td className="px-4 py-3 font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">{user.role}</td>
      <td className="px-4 py-3">
        <p className="font-mono text-[12px]">{user.phone || "—"}</p>
        <p className="font-mono text-[12px] text-pulse">{user.email || "—"}</p>
      </td>
      <td className="px-4 py-3 font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">
        {t(`status.${user.accountStatus}` as "status.active")}
      </td>
      <td className="px-4 py-3">
        <div className="flex min-w-[14rem] flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {wa ? (
              <a href={wa} target="_blank" rel="noreferrer" className="gl-btn-ghost min-h-11">
                {t("whatsapp")}
              </a>
            ) : null}
            {mail ? (
              <a href={mail} className="gl-btn-ghost min-h-11">
                {t("email")}
              </a>
            ) : null}
          </div>
          {user.accountStatus === "active" ? (
            <>
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t("reason")}
                className="gl-input"
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={pending} onClick={() => run("suspended")} className="gl-btn-ghost min-h-11 disabled:opacity-40">
                  {t("suspend")}
                </button>
                <button type="button" disabled={pending} onClick={() => run("banned")} className="gl-btn-ghost min-h-11 disabled:opacity-40">
                  {t("ban")}
                </button>
              </div>
            </>
          ) : (
            <button type="button" disabled={pending} onClick={() => run("active")} className="gl-btn-ghost min-h-11 disabled:opacity-40">
              {t("restore")}
            </button>
          )}
          {error ? <p className="font-mono text-xs text-danger">{error}</p> : null}
        </div>
      </td>
    </tr>
  );
}

export function FilterTab({ data }: { data: AdminDashboardData }) {
  const t = useTranslations("dashboardApp.admin.filter");

  if (data.flags.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("empty")} />
      </section>
    );
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="max-w-lg text-[14px] leading-relaxed text-frost-dim">{t("hint")}</p>
      <ul className="mt-6 space-y-3">
        {data.flags.map((flag) => (
          <FlagCard key={flag.id} flag={flag} />
        ))}
      </ul>
    </section>
  );
}

function FlagCard({ flag }: { flag: AdminFlagRow }) {
  const t = useTranslations("dashboardApp.admin.filter");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <li className="rounded-2xl border border-line px-4 py-4">
      <p className="font-west text-[11px] uppercase tracking-[0.16em] text-pulse">{t(`kind.${flag.kind}`)}</p>
      <p className="mt-1 font-display text-base">{flag.title}</p>
      <p className="text-[13px] text-frost-dim">{flag.owner}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-frost-faint">{flag.excerpt}</p>
      <p className="mt-2 font-mono text-[11px] text-danger">
        {flag.reasons.map((reason) => t(`reason.${reason}`)).join(" · ")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {flag.productId ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetProductActive(flag.productId!, false))}
            className="gl-btn-ghost min-h-11 disabled:opacity-40"
          >
            {t("hideProduct")}
          </button>
        ) : null}
        {flag.userId ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetAccountStatus(flag.userId!, "suspended", t("autoSuspend")))}
            className="gl-btn-ghost min-h-11 disabled:opacity-40"
          >
            {t("suspendUser")}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-2 font-mono text-xs text-danger">{error}</p> : null}
    </li>
  );
}
