"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireActiveUser } from "@/lib/auth/guards";
import {
  CREATOR_KYC_KINDS,
  MERCHANT_KYC_KINDS,
  type CreatorKycKind,
  type MerchantKycKind,
} from "@/lib/domain/enums";
import { CONTACT_LEAK_WARNING_AR, scanForContactLeak } from "@/lib/security/antiLeak";
import { fileFromForm, removeKycFile, saveKycFile } from "@/lib/kyc/storage";

async function replaceDocuments(
  userId: string,
  kinds: readonly string[],
  incoming: Array<{ kind: string; bytes: Buffer; mimeType: string; originalName: string }>
) {
  const existing = await prisma.kycDocument.findMany({
    where: { userId, kind: { in: [...kinds] } },
  });
  for (const doc of existing) {
    await removeKycFile(doc.storagePath);
  }
  await prisma.kycDocument.deleteMany({ where: { userId, kind: { in: [...kinds] } } });

  for (const item of incoming) {
    const saved = await saveKycFile({
      userId,
      kind: item.kind as MerchantKycKind | CreatorKycKind,
      bytes: item.bytes,
      mimeType: item.mimeType,
      originalName: item.originalName,
    });
    await prisma.kycDocument.create({
      data: {
        userId,
        kind: item.kind,
        originalName: item.originalName.slice(0, 180),
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        storagePath: saved.storagePath,
      },
    });
  }
}

export async function submitMerchantKyc(formData: FormData) {
  const viewer = await requireActiveUser();
  if (viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only a merchant can submit business verification.");
  }
  if (viewer.merchantProfile.verificationStatus === "verified") {
    throw new Error("This business is already verified.");
  }

  const hasCommercialReg = formData.get("hasCommercialReg") !== "false";
  const businessType = hasCommercialReg ? "cr" : "freelancer";
  const businessName = String(formData.get("businessName") ?? "").trim().slice(0, 120);
  const projectDescription = String(formData.get("projectDescription") ?? "").trim().slice(0, 500);
  const commercialRegNo = hasCommercialReg
    ? String(formData.get("commercialRegNo") ?? "").trim().slice(0, 40)
    : "بدون سجل تجاري (مشروع منزلي/فردي)";
  const taxNumber = String(formData.get("taxNumber") ?? "").trim().slice(0, 40);
  const ownerFullName = String(formData.get("ownerFullName") ?? "").trim().slice(0, 80);
  const city = String(formData.get("city") ?? "").trim().slice(0, 60);
  const instagramUrl = String(formData.get("instagramUrl") ?? "").trim().slice(0, 180);
  const tiktokUrl = String(formData.get("tiktokUrl") ?? "").trim().slice(0, 180);

  if (!businessName || !ownerFullName || !city) {
    throw new Error("يرجى ملء جميع الحقول الإلزامية لهوية النشاط التجاري والمالك.");
  }
  if (hasCommercialReg && !formData.get("commercialRegNo")) {
    throw new Error("يرجى إدخال رقم السجل التجاري المعتمد.");
  }

  for (const field of [businessName, projectDescription, commercialRegNo, taxNumber, ownerFullName, city]) {
    if (field && scanForContactLeak(field).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);
  }

  const incoming = [];
  const requiredKinds = hasCommercialReg
    ? (["commercial_register", "owner_id_front", "owner_id_back"] as const)
    : (["owner_id_front", "owner_id_back"] as const);

  for (const kind of requiredKinds) {
    const rawVal = formData.get(kind);
    const parsed = await fileFromForm(rawVal as File | string | null);
    if (!parsed) {
      const labels: Record<string, string> = {
        commercial_register: "وثيقة السجل التجاري",
        owner_id_front: "البطاقة الشخصية من الأمام",
        owner_id_back: "البطاقة الشخصية من الخلف",
      };
      throw new Error(`يرجى إرفاق ${labels[kind] || kind}`);
    }
    incoming.push({ kind, ...parsed });
  }

  // Biometric Face scan (Liveness / Geometry)
  const rawFace = formData.get("face_scan");
  if (rawFace) {
    const parsedFace = await fileFromForm(rawFace as File | string | null);
    if (parsedFace) {
      incoming.push({ kind: "face_scan", ...parsedFace });
    }
  }

  await replaceDocuments(viewer.id, MERCHANT_KYC_KINDS, incoming);
  await prisma.merchantProfile.update({
    where: { id: viewer.merchantProfile.id },
    data: {
      businessType,
      businessName,
      projectDescription,
      commercialRegNo,
      taxNumber,
      ownerFullName,
      city,
      instagramUrl,
      tiktokUrl,
      verificationStatus: "pending",
      kycSubmittedAt: new Date(),
      kycReviewNote: null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function submitCreatorKyc(formData: FormData) {
  const viewer = await requireActiveUser();
  if (viewer.role !== "creator" || !viewer.creatorProfile) {
    throw new Error("Only a marketer can submit identity verification.");
  }
  if (viewer.creatorProfile.verificationStatus === "verified") {
    throw new Error("This account is already verified.");
  }

  const legalName = String(formData.get("legalName") ?? "").trim().slice(0, 80);
  if (!legalName) throw new Error("Legal name is required.");
  if (scanForContactLeak(legalName).flagged) throw new Error(CONTACT_LEAK_WARNING_AR);

  const incoming = [];
  for (const kind of CREATOR_KYC_KINDS) {
    const parsed = await fileFromForm(formData.get(kind) as File | null);
    if (!parsed) throw new Error(`Missing capture: ${kind}`);
    incoming.push({ kind, ...parsed });
  }

  await replaceDocuments(viewer.id, CREATOR_KYC_KINDS, incoming);
  await prisma.creatorProfile.update({
    where: { id: viewer.creatorProfile.id },
    data: {
      legalName,
      verificationStatus: "pending",
      kycSubmittedAt: new Date(),
      kycReviewNote: null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
}
