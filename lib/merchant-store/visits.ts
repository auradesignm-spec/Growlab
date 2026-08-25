import { prisma } from "@/lib/db";
import { readRefCookie } from "@/lib/shop/cookies";
import { creatorIdFromHandle } from "@/lib/performance/referrer";
import { recordVisitPerformance } from "@/lib/performance/recordEarn";
import { recordMerchantStoreVisit } from "@/lib/shop/visits";

export async function trackMerchantStorePageView(input: {
  storeSlug: string;
  productId: string;
  dealId: string | null;
}) {
  const visitId = await recordMerchantStoreVisit(input.storeSlug, input.dealId);
  if (!visitId) return;

  const refHandle = readRefCookie();
  if (!refHandle) return;

  const referrerCreatorId = await creatorIdFromHandle(refHandle);
  if (!referrerCreatorId) return;

  const campaign = await prisma.performanceCampaign.findUnique({
    where: { productId: input.productId },
    select: { status: true },
  });
  if (!campaign || campaign.status !== "active") return;

  await recordVisitPerformance({
    productId: input.productId,
    dealId: input.dealId,
    referrerCreatorId,
    visitId,
    db: prisma,
  });
}
