import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { prisma } from "@/lib/db";
import { getAttributionReceiptByCode } from "@/lib/ledger/attribution";

const EVENT_LABEL_KEYS: Record<string, string> = {
  order_placed: "eventOrderPlaced",
  attribution_bound: "eventAttributionBound",
  share_granted: "eventShareGranted",
  status_changed: "eventStatusChanged",
  earn_recorded: "eventEarnRecorded",
};

export default async function AttributionReceiptPage({ params }: { params: { code: string } }) {
  const t = await getTranslations("attribution");
  const receipt = await getAttributionReceiptByCode(params.code, prisma);
  if (!receipt) notFound();

  const valid = receipt.chainValid && receipt.signaturesValid;

  return (
    <main>
      <div className="flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-5 sm:px-8">
        <Link href="/" className="text-[15px] font-medium">
          Growlab
        </Link>
        <LocaleSwitcher compact />
      </div>
      <div className="mx-auto max-w-wrap px-5 py-16 sm:px-8">
        <p className="gl-eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-2 text-display-lg font-semibold">{t("title")}</h1>
        <p className="gl-lede mt-3">{t("lede")}</p>

        <div
          className={`mt-8 max-w-xl rounded-xl border px-5 py-4 ${
            valid ? "border-signal/40 bg-signal/5" : "border-danger/40 bg-danger/5"
          }`}
        >
          <p className="font-medium text-frost">{valid ? t("valid") : t("invalid")}</p>
          <p className="mt-2 font-mono text-[13px] text-frost-dim">{receipt.receiptCode}</p>
          <p className="mt-1 font-mono text-[11px] break-all text-frost-faint">
            {t("tipHash")}: {receipt.tipHash.slice(0, 16)}…
          </p>
        </div>

        <ol className="mt-10 max-w-xl divide-y divide-line border-y border-line">
          {receipt.events.map((ev) => {
            const labelKey = EVENT_LABEL_KEYS[ev.eventType] ?? "eventGeneric";
            return (
              <li key={ev.eventHash} className="py-4">
                <p className="font-medium text-frost">
                  #{ev.seq} · {t(labelKey as "eventOrderPlaced")}
                </p>
                <p className="mt-1 font-mono text-[11px] text-frost-faint">
                  {new Date(ev.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 font-mono text-[11px] break-all text-frost-dim">
                  {ev.eventHash.slice(0, 24)}…
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 max-w-xl text-[13px] leading-relaxed text-frost-dim">{t("footnote")}</p>
        <Link href={`/api/attribution/${encodeURIComponent(receipt.receiptCode)}`} className="mt-4 inline-flex text-[14px] underline">
          {t("jsonApi")}
        </Link>
      </div>
    </main>
  );
}
