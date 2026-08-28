import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

interface QueuedAction {
  id: string;
  actionType: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { actions?: QueuedAction[] };
    const actions = body.actions || [];
    const processedIds: string[] = [];

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json({ ok: true, processedIds: [] });
    }

    const viewer = await getCurrentUser();

    for (const act of actions) {
      try {
        if (act.actionType === "ORDER_STATUS_UPDATE") {
          const orderId = String(act.payload.orderId ?? "");
          const status = String(act.payload.status ?? "");
          if (orderId && status) {
            await prisma.order.update({
              where: { id: orderId },
              data: { status },
            });
            processedIds.push(act.id);
          }
        } else if (act.actionType === "SAVE_STORE_CONFIG") {
          const merchantId = viewer?.merchantProfile?.id;
          if (merchantId) {
            const tagline = String(act.payload.tagline ?? "");
            const description = String(act.payload.description ?? "");
            await prisma.merchantStore.upsert({
              where: { merchantId },
              create: {
                merchantId,
                tagline,
                description,
                themeAccent: String(act.payload.accent ?? "#111318"),
              },
              update: {
                tagline,
                description,
                themeAccent: String(act.payload.accent ?? "#111318"),
              },
            });
            processedIds.push(act.id);
          }
        } else if (act.actionType === "UPDATE_SHIPPING_REF") {
          const orderId = String(act.payload.orderId ?? "");
          const shippingRef = String(act.payload.shippingRef ?? "");
          if (orderId) {
            await prisma.order.update({
              where: { id: orderId },
              data: { shippingRef },
            });
            processedIds.push(act.id);
          }
        } else {
          // Mark unknown or generic action as acknowledged
          processedIds.push(act.id);
        }
      } catch (innerErr) {
        console.warn(`Failed to process action ${act.id}:`, innerErr);
      }
    }

    return NextResponse.json({
      ok: true,
      processedCount: processedIds.length,
      processedIds,
    });
  } catch (error) {
    console.error("Offline sync error:", error);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 500 });
  }
}
