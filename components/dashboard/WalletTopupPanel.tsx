"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import { requestWalletTopup } from "@/app/(dashboard)/dashboard/wallet-actions";

export interface TopupRow {
  id: string;
  amount: number;
  currency: string;
  proofNote: string;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

export default function WalletTopupPanel({ requests }: { requests: TopupRow[] }) {
  const t = useTranslations("dashboardApp.merchant.walletTopup");
  const [amount, setAmount] = useState(20);
  const [proofNote, setProofNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await requestWalletTopup({ amount, proofNote });
        setProofNote("");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failed"));
      }
    });
  }

  return (
    <div className="px-5 py-6 sm:px-8">
      <p className="gl-eyebrow">{t("kicker")}</p>
      <h2 className="mt-2 text-[20px] font-semibold text-frost">{t("title")}</h2>
      <p className="mt-2 max-w-xl text-[14px] text-frost-dim">{t("lede")}</p>

      <form onSubmit={submit} className="mt-8 max-w-md space-y-4">
        <label className="block">
          <span className="text-[13px] text-frost-dim">{t("amount")}</span>
          <input
            type="number"
            min={5}
            max={500}
            step={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[13px] text-frost-dim">{t("proof")}</span>
          <input
            type="text"
            value={proofNote}
            onChange={(e) => setProofNote(e.target.value)}
            placeholder={t("proofPlaceholder")}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[14px]"
            required
          />
        </label>
        {error ? <p className="text-[13px] text-danger">{error}</p> : null}
        <button type="submit" disabled={pending} className="gl-btn gl-btn-primary">
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      {requests.length > 0 ? (
        <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {requests.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-4 text-[13px]">
              <div>
                <p className="font-mono text-frost">{formatMoney(row.amount, row.currency)}</p>
                <p className="text-frost-dim">{row.proofNote}</p>
                <p className="text-frost-faint">{new Date(row.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="text-frost-dim">{t(`status.${row.status}` as "status.pending")}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
