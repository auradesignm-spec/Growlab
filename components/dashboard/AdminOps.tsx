"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { AdminCreatorRow, AdminDashboardData, AdminMerchantRow } from "@/lib/dashboard/admin";
import {
  adminCreateMerchant,
  adminCreditMerchantWallet,
  adminEditCreator,
  adminEditMerchant,
  adminSetAccountStatus,
  adminSetCreatorVerification,
  adminSetMerchantVerification,
} from "@/app/(dashboard)/dashboard/admin-actions";
import { formatMoney } from "@/lib/format";
import { EmptyState } from "@/components/dashboard/ui";
import type { VerificationStatus } from "@/lib/domain/enums";

export function KycQueueTab({ data }: { data: AdminDashboardData }) {
  const t = useTranslations("dashboardApp.admin.kyc");
  const pendingMerchants = data.merchants.filter((m) => m.verificationStatus === "pending");
  const pendingCreators = data.creators.filter((c) => c.verificationStatus === "pending");

  if (pendingMerchants.length === 0 && pendingCreators.length === 0) {
    return (
      <section className="px-5 py-10 sm:px-8">
        <EmptyState text={t("empty")} />
      </section>
    );
  }

  return (
    <section className="space-y-10 px-5 py-10 sm:px-8">
      {pendingMerchants.map((m) => (
        <KycCard
          key={m.id}
          title={m.businessName}
          subtitle={`${m.ownerFullName} · ${m.city} · ${m.commercialRegNo}`}
          documents={m.documents}
          onApprove={() => adminSetMerchantVerification(m.id, "verified")}
          onReject={(note) => adminSetMerchantVerification(m.id, "rejected", note)}
        />
      ))}
      {pendingCreators.map((c) => (
        <KycCard
          key={c.id}
          title={`@${c.username}`}
          subtitle={c.legalName || t("noLegalName")}
          documents={c.documents}
          onApprove={() => adminSetCreatorVerification(c.id, "verified")}
          onReject={(note) => adminSetCreatorVerification(c.id, "rejected", note)}
        />
      ))}
    </section>
  );
}

function KycCard({
  title,
  subtitle,
  documents,
  onApprove,
  onReject,
}: {
  title: string;
  subtitle: string;
  documents: Array<{ id: string; kind: string }>;
  onApprove: () => Promise<void>;
  onReject: (note: string) => Promise<void>;
}) {
  const t = useTranslations("dashboardApp.admin.kyc");
  const [note, setNote] = useState("");
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
    <article className="gl-glass p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-frost">{title}</h3>
          <p className="mt-1 font-serif text-sm italic text-frost-dim">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pending} onClick={() => run(onApprove)} className="gl-btn-primary disabled:opacity-40">
            {t("approve")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => onReject(note))}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("reject")}
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {documents.map((doc) => (
          <figure key={doc.id} className="overflow-hidden rounded-xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/kyc/${doc.id}`} alt={doc.kind} className="aspect-[3/4] w-full object-cover" />
            <figcaption className="px-2 py-1.5 font-mono text-[10px] uppercase text-frost-dim">{doc.kind}</figcaption>
          </figure>
        ))}
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("rejectPlaceholder")}
        className="gl-input mt-4"
      />
      {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
    </article>
  );
}

export function AddMerchantTab() {
  const t = useTranslations("dashboardApp.admin.addMerchant");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    setDone(false);
    startTransition(async () => {
      try {
        await adminCreateMerchant({
          businessName: String(formData.get("businessName") ?? ""),
          commercialRegNo: String(formData.get("commercialRegNo") ?? ""),
          ownerFullName: String(formData.get("ownerFullName") ?? ""),
          city: String(formData.get("city") ?? ""),
          inviteEmail: String(formData.get("inviteEmail") ?? ""),
          verifyNow: formData.get("verifyNow") === "on",
        });
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <section className="px-5 py-10 sm:px-8">
      <p className="max-w-lg font-serif text-sm italic text-frost-dim">{t("hint")}</p>
      <form action={onSubmit} className="mt-6 max-w-xl space-y-4">
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("businessName")}</span>
          <input name="businessName" required className="gl-input mt-1.5" />
        </label>
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("commercialRegNo")}</span>
          <input name="commercialRegNo" required className="gl-input mt-1.5" />
        </label>
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("ownerFullName")}</span>
          <input name="ownerFullName" required className="gl-input mt-1.5" />
        </label>
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("city")}</span>
          <input name="city" required className="gl-input mt-1.5" />
        </label>
        <label className="block">
          <span className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">{t("inviteEmail")}</span>
          <input name="inviteEmail" type="email" required className="gl-input mt-1.5" />
        </label>
        <label className="flex items-center gap-2 font-serif text-sm italic text-frost-dim">
          <input name="verifyNow" type="checkbox" defaultChecked className="accent-signal" />
          {t("verifyNow")}
        </label>
        {error && <p className="font-mono text-xs text-danger">{error}</p>}
        {done && <p className="font-serif text-sm italic text-pulse">{t("done")}</p>}
        <button type="submit" disabled={pending} className="gl-btn-primary disabled:opacity-40">
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>
    </section>
  );
}

export function MerchantAccountRow({
  merchant,
  t,
  tStatus,
}: {
  merchant: AdminMerchantRow;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
}) {
  const [open, setOpen] = useState(false);
  const [banReason, setBanReason] = useState(merchant.banReason ?? "");
  const [topup, setTopup] = useState("");
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
    <tr className="border-b border-white/10 align-top">
      <td className="px-4 py-3">
        <p className="font-display text-base">{merchant.businessName}</p>
        <p className="font-mono text-[11px] text-frost-dim">
          {merchant.commercialRegNo || "—"} · {merchant.city || "—"}
        </p>
        <p className="mt-1 text-[12px] text-frost-dim">
          {[merchant.firstName, merchant.lastName].filter(Boolean).join(" ") || merchant.ownerFullName}
        </p>
        {merchant.phone ? <p className="font-mono text-[11px] text-frost-dim">{merchant.phone}</p> : null}
        {(merchant.email || merchant.inviteEmail) && (
          <p className="font-mono text-[11px] text-pulse">{merchant.email || merchant.inviteEmail}</p>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-sm">{merchant.productsCount}</td>
      <td className="px-4 py-3">
        <p className="font-mono text-sm text-frost">{formatMoney(merchant.walletAvailable)}</p>
        <p className="font-mono text-[11px] text-frost-dim">
          {t("merchants.walletReserved", { amount: formatMoney(merchant.walletReserved) })}
        </p>
        <form
          className="mt-2 flex max-w-[11rem] gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = Number(topup);
            run(async () => {
              await adminCreditMerchantWallet(merchant.id, amount, t("merchants.walletTopupNote"));
              setTopup("");
            });
          }}
        >
          <input
            value={topup}
            onChange={(e) => setTopup(e.target.value)}
            placeholder={t("merchants.walletTopup")}
            className="gl-input w-20"
          />
          <button type="submit" disabled={pending} className="gl-btn-ghost disabled:opacity-40">
            {t("merchants.walletCredit")}
          </button>
        </form>
      </td>
      <td className="px-4 py-3">
        <p className="font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">
          {tStatus(`verification.${merchant.verificationStatus}` as "verification.pending")}
        </p>
        <p className="mt-1 font-west text-[10px] uppercase tracking-[0.16em] text-danger">
          {merchant.accountStatus === "banned" ? t("merchants.banned") : ""}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetMerchantVerification(merchant.id, "verified"))}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("merchants.approve")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetMerchantVerification(merchant.id, "rejected", "Rejected by admin"))}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("merchants.reject")}
          </button>
          {merchant.accountStatus === "banned" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetAccountStatus(merchant.userId, "active"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("merchants.unban")}
            </button>
          ) : (
            <div className="flex min-w-[12rem] flex-col gap-2">
              <input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={t("merchants.banReason")}
                className="gl-input"
              />
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminSetAccountStatus(merchant.userId, "banned", banReason))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("merchants.ban")}
              </button>
            </div>
          )}
          <button type="button" onClick={() => setOpen((v) => !v)} className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
            {t("merchants.edit")}
          </button>
        </div>
        {open && (
          <form
            className="mt-3 grid max-w-lg grid-cols-2 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              run(() =>
                adminEditMerchant(merchant.id, {
                  businessName: String(form.get("businessName") ?? ""),
                  commercialRegNo: String(form.get("commercialRegNo") ?? ""),
                  ownerFullName: String(form.get("ownerFullName") ?? ""),
                  city: String(form.get("city") ?? ""),
                })
              );
            }}
          >
            <input name="businessName" defaultValue={merchant.businessName} className="gl-input col-span-2" />
            <input name="commercialRegNo" defaultValue={merchant.commercialRegNo} className="gl-input" />
            <input name="city" defaultValue={merchant.city} className="gl-input" />
            <input name="ownerFullName" defaultValue={merchant.ownerFullName} className="gl-input col-span-2" />
            <button type="submit" disabled={pending} className="gl-btn-primary col-span-2 disabled:opacity-40">
              {t("merchants.save")}
            </button>
          </form>
        )}
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}

export function CreatorAccountRow({
  creator,
  t,
  tStatus,
}: {
  creator: AdminCreatorRow;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [banReason, setBanReason] = useState(creator.banReason ?? "");

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
    <tr className="border-b border-white/10 align-top">
      <td className="px-4 py-3">
        <p className="font-display text-base">@{creator.username}</p>
        <p className="text-[12px] text-frost-dim">
          {[creator.firstName, creator.lastName].filter(Boolean).join(" ") || creator.legalName || "—"}
        </p>
        {creator.phone ? <p className="font-mono text-[11px] text-frost-dim">{creator.phone}</p> : null}
        {creator.email ? <p className="font-mono text-[11px] text-pulse">{creator.email}</p> : null}
      </td>
      <td className="px-4 py-3 font-mono text-sm">{creator.tier}</td>
      <td className="px-4 py-3 font-mono text-sm">{creator.dealsCount}</td>
      <td className="px-4 py-3 font-west text-[11px] uppercase tracking-[0.16em] text-frost-dim">
        {tStatus(`verification.${creator.verificationStatus}` as "verification.pending")}
        {creator.accountStatus === "banned" ? ` · ${t("creators.banned")}` : ""}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminSetCreatorVerification(creator.id, "verified" as VerificationStatus))}
            className="gl-btn-ghost disabled:opacity-40"
          >
            {t("creators.approve")}
          </button>
          {creator.accountStatus === "banned" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => adminSetAccountStatus(creator.userId, "active"))}
              className="gl-btn-ghost disabled:opacity-40"
            >
              {t("creators.unban")}
            </button>
          ) : (
            <div className="flex min-w-[12rem] flex-col gap-2">
              <input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={t("creators.banReason")}
                className="gl-input"
              />
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => adminSetAccountStatus(creator.userId, "banned", banReason))}
                className="gl-btn-ghost disabled:opacity-40"
              >
                {t("creators.ban")}
              </button>
            </div>
          )}
          <button type="button" onClick={() => setOpen((v) => !v)} className="font-west text-[10px] uppercase tracking-[0.2em] text-frost-dim">
            {t("creators.edit")}
          </button>
        </div>
        {open && (
          <form
            className="mt-3 grid max-w-lg gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              run(() =>
                adminEditCreator(creator.id, {
                  username: String(form.get("username") ?? ""),
                  legalName: String(form.get("legalName") ?? ""),
                })
              );
            }}
          >
            <input name="username" defaultValue={creator.username} className="gl-input" />
            <input name="legalName" defaultValue={creator.legalName} className="gl-input" />
            <button type="submit" disabled={pending} className="gl-btn-primary disabled:opacity-40">
              {t("creators.save")}
            </button>
          </form>
        )}
        {error && <p className="mt-2 font-mono text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}
