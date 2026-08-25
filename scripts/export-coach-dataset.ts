/**
 * Export approved merchant creatives as JSONL for a future LoRA job.
 * Usage: npx tsx scripts/export-coach-dataset.ts > data/coach-sft.jsonl
 */
import { prisma } from "../lib/db";

async function main() {
  const rows = await prisma.adCreativeDraft.findMany({
    where: { status: { in: ["approved", "exported", "launched"] } },
    take: 500,
    orderBy: { updatedAt: "desc" },
    include: { merchant: { select: { businessName: true } } },
  });

  for (const row of rows) {
    const user = JSON.stringify({
      locale: row.locale,
      originalHook: row.originalHook,
      originalCaption: row.originalCaption,
    });
    const assistant = JSON.stringify({
      suggestedHook: row.suggestedHook,
      suggestedCaption: row.suggestedCaption,
      suggestedScript: row.suggestedScript,
      suggestedVisualHook: row.suggestedVisualHook,
      suggestedCta: row.suggestedCta,
      rationale: row.rationale,
    });
    process.stdout.write(
      `${JSON.stringify({
        messages: [
          { role: "user", content: user },
          { role: "assistant", content: assistant },
        ],
        merchant: row.merchant.businessName,
      })}\n`,
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
