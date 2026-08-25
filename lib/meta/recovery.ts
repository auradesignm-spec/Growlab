/**
 * Recovery nudges for WhatsApp InterestLeads still chatting/interested.
 * Free-form only inside the 24h customer-care window (no marketing templates yet).
 */

import { prisma } from "@/lib/db";
import { connectionAccessToken, sendWhatsAppText } from "@/lib/meta/whatsapp";

const HOUR = 60 * 60 * 1000;
const WINDOW_MS = 24 * HOUR;

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * HOUR);
}

export function scheduleFirstFollowUp(from = new Date()): Date {
  return new Date(from.getTime() + 1 * HOUR);
}

export function isYesIntent(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(نعم|اي|أي|اه|آه|yes|y|ok|موافق|ابي|أبي|اطلب|أطلب)[\s!.]*$/i.test(t);
}

export async function stopLeadRecovery(leadId: string, status?: string): Promise<void> {
  await prisma.interestLead.update({
    where: { id: leadId },
    data: {
      nextFollowUpAt: null,
      followUpStep: 3,
      ...(status ? { status } : {}),
    },
  });
}

/**
 * Process due recovery messages. Safe to call from cron every 10–15 minutes.
 */
export async function processDueRecoveryFollowUps(limit = 40): Promise<{ sent: number; skipped: number }> {
  const now = new Date();
  const due = await prisma.interestLead.findMany({
    where: {
      status: { in: ["chatting", "interested"] },
      followUpStep: { lt: 3 },
      nextFollowUpAt: { lte: now },
    },
    orderBy: { nextFollowUpAt: "asc" },
    take: limit,
  });

  let sent = 0;
  let skipped = 0;

  for (const lead of due) {
    const connection = await prisma.metaConnection.findUnique({
      where: { merchantId: lead.merchantId },
    });
    if (!connection || connection.status !== "active" || !connection.recoveryEnabled) {
      await prisma.interestLead.update({
        where: { id: lead.id },
        data: { nextFollowUpAt: null },
      });
      skipped += 1;
      continue;
    }

    const lastIn = lead.lastInboundAt?.getTime() ?? lead.createdAt.getTime();
    if (Date.now() - lastIn > WINDOW_MS) {
      // Outside 24h window — stop free-form recovery (templates = later wave).
      await prisma.interestLead.update({
        where: { id: lead.id },
        data: { nextFollowUpAt: null, followUpStep: 3 },
      });
      skipped += 1;
      continue;
    }

    const step = lead.followUpStep;
    const body =
      step <= 0
        ? connection.recoveryText1h
        : step === 1
          ? connection.recoveryText6h
          : connection.recoveryText24h;

    if (!body.trim()) {
      skipped += 1;
      continue;
    }

    try {
      const token = connectionAccessToken(connection.accessTokenEnc);
      await sendWhatsAppText({
        phoneNumberId: connection.phoneNumberId,
        accessToken: token,
        toPhone: lead.phone,
        body: body.trim(),
      });

      const nextStep = Math.min(3, step + 1);
      const nextAt =
        nextStep >= 3
          ? null
          : nextStep === 1
            ? hoursFromNow(5) // ~6h from first touch (already waited 1h)
            : hoursFromNow(18); // ~24h from first touch

      await prisma.interestLead.update({
        where: { id: lead.id },
        data: {
          followUpStep: nextStep,
          nextFollowUpAt: nextAt,
          lastOutboundAt: new Date(),
          lastMessagePreview: body.trim().slice(0, 280),
        },
      });
      sent += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Recovery send failed";
      await prisma.metaConnection.update({
        where: { id: connection.id },
        data: { lastError: `Recovery: ${msg}`.slice(0, 500) },
      });
      // Back off 30 minutes so we don't hammer a broken token.
      await prisma.interestLead.update({
        where: { id: lead.id },
        data: { nextFollowUpAt: new Date(Date.now() + 30 * 60 * 1000) },
      });
      skipped += 1;
    }
  }

  return { sent, skipped };
}
