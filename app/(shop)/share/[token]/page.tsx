import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import ShareClaimPanel from "@/components/shop/ShareClaimPanel";
import { getShareEntitlementByToken } from "@/lib/shop/tracking";

export default async function SharePage({ params }: { params: { token: string } }) {
  const t = await getTranslations("share");
  const data = await getShareEntitlementByToken(params.token);
  if (!data) notFound();

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
        <p className="gl-lede mt-3">{t("lede", { product: data.productTitle, store: data.storeName })}</p>
        <ShareClaimPanel data={data} />
      </div>
    </main>
  );
}
