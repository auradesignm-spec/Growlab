"use server";

import { prisma } from "@/lib/db";
import { validateContactForm } from "@/lib/validation";
import type { ContactFormData } from "@/lib/types";

export async function submitContactLead(input: ContactFormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const { sanitized, isValid } = validateContactForm(input);
  if (!isValid) return { ok: false, error: "invalid" };

  await prisma.contactLead.create({
    data: {
      name: sanitized.name,
      biz: sanitized.biz,
      phone: sanitized.phone,
      msg: sanitized.msg,
    },
  });

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (resendKey && from) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [from],
          subject: `مساعد ريادة — استفسار جديد: ${sanitized.biz}`,
          text: `${sanitized.name}\n${sanitized.biz}\n${sanitized.phone}\n\n${sanitized.msg}`,
        }),
      });
    } catch {
      /* lead is already stored */
    }
  }

  return { ok: true };
}
