import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import BuyerReceiveForm from "@/components/shop/BuyerReceiveForm";

export default async function ReceiveConfirmPage({ params }: { params: { token: string } }) {
  const t = await getTranslations("shop");
  const token = params.token.trim();
  if (token.length < 16) notFound();

  const order = await prisma.order.findFirst({
    where: { receiveConfirmToken: token },
    include: { deal: { include: { product: true } } },
  });
  if (!order || order.status !== "confirmed" || !order.merchantMarkedDeliveredAt) {
    notFound();
  }

  const serial = order.trackingToken || order.id.slice(-8);
  const details = [order.deal.product.title, order.variantLabel, `×${order.quantity}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <p className="gl-eyebrow">{t("receiveEyebrow")}</p>
      <h1 className="mt-2 text-display-lg font-semibold">{t("receiveTitle")}</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-frost">{details}</p>
      <p className="mt-2 font-mono text-[13px] text-frost-faint">{t("receiveSerial", { serial })}</p>
      <p className="gl-lede mt-4">{t("receiveLede")}</p>
      <BuyerReceiveForm token={token} trackingToken={order.trackingToken} />
    </main>
  );
}
