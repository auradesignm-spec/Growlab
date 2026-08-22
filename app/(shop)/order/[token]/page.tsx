import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { getCheckoutByToken } from "@/lib/shop/tracking";

export default async function OrderTrackingPage({ params }: { params: { token: string } }) {
  const t = await getTranslations("shop");
  const checkout = await getCheckoutByToken(params.token);
  if (!checkout) notFound();

  const currency = checkout.lines[0]?.currency ?? "OMR";
  const total = checkout.lines.reduce((sum, line) => sum + line.unitPriceCharged * line.quantity, 0);

  return (
    <main>
      <div className="flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-5 sm:px-8">
        <Link href="/" className="text-[15px] font-medium">
          Growlab
        </Link>
        <LocaleSwitcher compact />
      </div>
      <div className="mx-auto max-w-wrap px-5 py-16 sm:px-8">
        <p className="gl-eyebrow">{t("trackEyebrow")}</p>
        <h1 className="mt-2 text-display-lg font-semibold">{t("trackTitle")}</h1>
        <p className="gl-lede mt-3">{t("trackLede", { name: checkout.buyerName })}</p>
        <p className="mt-2 font-mono text-[13px] text-frost-faint">
          {t("trackRef", { token: checkout.trackingToken })}
        </p>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {checkout.lines.map((line) => (
            <li key={line.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
              <div>
                <p className="font-medium">{line.productTitle}</p>
                <p className="mt-1 text-[13px] text-frost-dim">
                  {line.size ? `${line.size} · ` : ""}×{line.quantity} · {t(`status.${line.status}` as "status.pending")}
                </p>
                <p className="mt-1 text-[13px] text-frost-faint">{t(`escrow.${line.escrowStatus}` as "escrow.held")}</p>
              </div>
              <p className="font-mono text-[14px]">
                {(line.unitPriceCharged * line.quantity).toFixed(2)} {line.currency}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-4 font-mono text-[18px]">
          {t("total")} {total.toFixed(2)} {currency}
        </p>
        <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-frost-dim">{t("returnsPolicy")}</p>
        <Link href={`/creator/${checkout.storeUsername}`} className="mt-8 inline-flex text-[14px] underline">
          @{checkout.storeUsername}
        </Link>
      </div>
    </main>
  );
}
