import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAttributionReceiptByCode } from "@/lib/ledger/attribution";

export const dynamic = "force-dynamic";

/** Public verify endpoint for signed attribution receipts. */
export async function GET(
  _request: Request,
  context: { params: { code: string } }
) {
  const receipt = await getAttributionReceiptByCode(context.params.code, prisma);
  if (!receipt) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: receipt.chainValid && receipt.signaturesValid,
    receiptCode: receipt.receiptCode,
    orderId: receipt.orderId,
    tipHash: receipt.tipHash,
    tipSeq: receipt.tipSeq,
    chainValid: receipt.chainValid,
    signaturesValid: receipt.signaturesValid,
    events: receipt.events.map((ev) => ({
      seq: ev.seq,
      eventType: ev.eventType,
      payload: ev.payload,
      eventHash: ev.eventHash,
      createdAt: ev.createdAt,
    })),
  });
}
