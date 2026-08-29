"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeEmailInput,
  sanitizePhoneInput,
  sanitizeTextInput,
} from "@/lib/validation";

export interface SettingsInitialData {
  user: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    locale: string;
    createdAt: string;
  };
  merchant: {
    id: string;
    businessName: string;
    businessType: string;
    projectDescription: string;
    instagramUrl: string;
    tiktokUrl: string;
    commercialRegNo: string;
    taxNumber: string;
    ownerFullName: string;
    city: string;
    verificationStatus: string;
    plan: string;
    planExpiresAt: string | null;
  } | null;
  creator: {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    instagramUrl: string;
    tiktokUrl: string;
    youtubeUrl: string;
    city: string;
    verificationStatus: string;
  } | null;
  store: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    description: string;
    shippingFlatOmr: number;
    freeShippingThreshold: number | null;
    customDomain: string | null;
  } | null;
}

export async function loadAccountSettings(): Promise<SettingsInitialData> {
  const viewer = await getCurrentUser();
  if (!viewer) {
    throw new Error("يجب تسجيل الدخول للوصول للإعدادات.");
  }

  let store = null;
  if (viewer.merchantProfile) {
    const s = await prisma.merchantStore.findUnique({
      where: { merchantId: viewer.merchantProfile.id },
    });
    if (s) {
      store = {
        id: s.id,
        name: s.name,
        slug: s.slug,
        currency: s.currency,
        description: s.description || "",
        shippingFlatOmr: Number(s.shippingFlatOmr || 0),
        freeShippingThreshold: s.freeShippingThreshold ? Number(s.freeShippingThreshold) : null,
        customDomain: (s as any).customDomain || null,
      };
    }
  }

  return {
    user: {
      id: viewer.id,
      name: viewer.name,
      firstName: viewer.firstName,
      lastName: viewer.lastName,
      email: viewer.email,
      phone: viewer.phone,
      role: viewer.role,
      locale: viewer.locale,
      createdAt: viewer.createdAt.toISOString(),
    },
    merchant: viewer.merchantProfile
      ? {
          id: viewer.merchantProfile.id,
          businessName: viewer.merchantProfile.businessName,
          businessType: viewer.merchantProfile.businessType,
          projectDescription: viewer.merchantProfile.projectDescription,
          instagramUrl: viewer.merchantProfile.instagramUrl,
          tiktokUrl: viewer.merchantProfile.tiktokUrl,
          commercialRegNo: viewer.merchantProfile.commercialRegNo,
          taxNumber: viewer.merchantProfile.taxNumber,
          ownerFullName: viewer.merchantProfile.ownerFullName,
          city: viewer.merchantProfile.city,
          verificationStatus: viewer.merchantProfile.verificationStatus,
          plan: viewer.merchantProfile.plan,
          planExpiresAt: viewer.merchantProfile.planExpiresAt?.toISOString() || null,
        }
      : null,
    creator: viewer.creatorProfile
      ? {
          id: viewer.creatorProfile.id,
          username: viewer.creatorProfile.username,
          displayName: viewer.creatorProfile.displayName,
          bio: viewer.creatorProfile.bio,
          instagramUrl: viewer.creatorProfile.instagramUrl,
          tiktokUrl: viewer.creatorProfile.tiktokUrl,
          youtubeUrl: viewer.creatorProfile.youtubeUrl,
          city: viewer.creatorProfile.city,
          verificationStatus: viewer.creatorProfile.verificationStatus,
        }
      : null,
    store,
  };
}

export async function updateProfileInfo(input: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  bio?: string;
}) {
  const viewer = await getCurrentUser();
  if (!viewer) throw new Error("سجّل دخولك أولاً.");

  const firstName = sanitizeTextInput(input.firstName, 80);
  const lastName = sanitizeTextInput(input.lastName, 80);
  const phone = sanitizePhoneInput(input.phone);
  const email = sanitizeEmailInput(input.email);

  if (!isValidName(firstName)) throw new Error("أدخل الاسم الأول بشكل صحيح (حرفان على الأقل).");
  if (!isValidName(lastName)) throw new Error("أدخل اسم العائلة بشكل صحيح (حرفان على الأقل).");
  if (phone && !isValidPhone(phone)) throw new Error("أدخل رقم هاتف صحيحاً.");
  if (email && !isValidEmail(email)) throw new Error("أدخل بريداً إلكترونياً صحيحاً.");

  const name = `${firstName} ${lastName}`.trim();

  await prisma.user.update({
    where: { id: viewer.id },
    data: {
      firstName,
      lastName,
      name,
      phone,
      email,
    },
  });

  if (viewer.creatorProfile && input.bio !== undefined) {
    await prisma.creatorProfile.update({
      where: { id: viewer.creatorProfile.id },
      data: {
        bio: sanitizeTextInput(input.bio, 500),
      },
    });
  }

  if (viewer.merchantProfile && input.bio !== undefined) {
    await prisma.merchantProfile.update({
      where: { id: viewer.merchantProfile.id },
      data: {
        projectDescription: sanitizeTextInput(input.bio, 500),
      },
    });
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true, message: "تم تحديث البيانات الشخصية بنجاح." };
}

export async function updateWorkspaceSettings(input: {
  businessName: string;
  city: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  customDomain?: string;
}) {
  const viewer = await getCurrentUser();
  if (!viewer) throw new Error("سجّل دخولك أولاً.");

  if (viewer.merchantProfile) {
    await prisma.merchantProfile.update({
      where: { id: viewer.merchantProfile.id },
      data: {
        businessName: sanitizeTextInput(input.businessName, 120),
        city: sanitizeTextInput(input.city, 80),
        instagramUrl: sanitizeTextInput(input.instagramUrl || "", 200),
        tiktokUrl: sanitizeTextInput(input.tiktokUrl || "", 200),
      },
    });

    const store = await prisma.merchantStore.findUnique({
      where: { merchantId: viewer.merchantProfile.id },
    });
    if (store) {
      await prisma.merchantStore.update({
        where: { id: store.id },
        data: {
          name: sanitizeTextInput(input.businessName, 120),
        },
      });
    }
  }

  revalidatePath("/dashboard/settings");
  return { success: true, message: "تم حفظ إعدادات مساحة العمل والمتجر بنجاح." };
}
