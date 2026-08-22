"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeEmailInput,
  sanitizePhoneInput,
  sanitizeTextInput,
} from "@/lib/validation";

export async function saveProfileDetails(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("سجّل دخولك أولاً.");

  const firstName = sanitizeTextInput(String(formData.get("firstName") ?? ""), 80);
  const lastName = sanitizeTextInput(String(formData.get("lastName") ?? ""), 80);
  const phone = sanitizePhoneInput(String(formData.get("phone") ?? ""));
  const email = sanitizeEmailInput(String(formData.get("email") ?? ""));

  if (!isValidName(firstName)) throw new Error("أدخل الاسم الأول (حرفان على الأقل).");
  if (!isValidName(lastName)) throw new Error("أدخل اسم العائلة (حرفان على الأقل).");
  if (!isValidPhone(phone)) throw new Error("أدخل رقم هاتف صالحاً (7 إلى 15 رقماً).");
  if (!isValidEmail(email)) throw new Error("أدخل بريداً صالحاً.");

  const name = `${firstName} ${lastName}`.trim();

  await prisma.user.update({
    where: { clerkUserId: userId },
    data: {
      firstName,
      lastName,
      phone,
      email,
      name,
      profileCompletedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
}
