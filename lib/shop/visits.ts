import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/shop/rateLimit";

export async function recordStorefrontVisit(username: string, dealId?: string | null) {
  try {
    const ip = clientIpFromHeaders(headers());
    if (!consumeRateLimit(`visit:ip:${ip}`, 20, 10 * 60 * 1000)) return;

    await prisma.storefrontVisit.create({
      data: {
        username: username.trim().toLowerCase(),
        dealId: dealId || null,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[storefrontVisit]", error);
    }
  }
}

export async function countVisitsForUsername(username: string): Promise<number> {
  return prisma.storefrontVisit.count({ where: { username: username.trim().toLowerCase() } });
}

export async function countVisitsByDealIds(dealIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (dealIds.length === 0) return counts;
  const rows = await prisma.storefrontVisit.groupBy({
    by: ["dealId"],
    where: { dealId: { in: dealIds } },
    _count: { _all: true },
  });
  for (const row of rows) {
    if (row.dealId) counts.set(row.dealId, row._count._all);
  }
  return counts;
}
