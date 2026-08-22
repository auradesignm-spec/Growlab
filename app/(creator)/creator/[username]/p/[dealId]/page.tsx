import { notFound, redirect } from "next/navigation";
import { creatorProductPath, getStorefrontDeal } from "@/lib/storefront";

export default async function LegacyDealIdProductPage({
  params,
}: {
  params: { username: string; dealId: string };
}) {
  const data = await getStorefrontDeal(params.username, params.dealId);
  if (!data) notFound();
  redirect(creatorProductPath(data.username, data.deal.slug));
}
