import { prisma } from "@/lib/db";

export type MerchantLesson = {
  productHint: string;
  hook: string;
  caption: string;
  note: string;
};

/** Approved (or launched) creatives this merchant already trusted — continuous learning without GPU LoRA. */
export async function loadMerchantLessons(merchantId: string): Promise<MerchantLesson[]> {
  const rows = await prisma.adCreativeDraft.findMany({
    where: {
      merchantId,
      status: { in: ["approved", "exported", "launched"] },
      suggestedHook: { not: "" },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      suggestedHook: true,
      suggestedCaption: true,
      suggestedCta: true,
      rationale: true,
      productId: true,
    },
  });

  const productIds = [...new Set(rows.map((r) => r.productId).filter(Boolean))] as string[];
  const products =
    productIds.length === 0
      ? []
      : await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, title: true, category: true },
        });
  const titleById = new Map(products.map((p) => [p.id, `${p.title} (${p.category})`]));

  return rows.map((row) => ({
    productHint: (row.productId && titleById.get(row.productId)) || "campaign",
    hook: row.suggestedHook.slice(0, 160),
    caption: row.suggestedCaption.slice(0, 280),
    note: row.suggestedCta.slice(0, 80),
  }));
}
