"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { CONTACT_LEAK_WARNING_AR, generateShippingRef, scanForContactLeak } from "@/lib/security/antiLeak";
import { computeUgcDeadline } from "@/lib/domain/ugc";

const MAX_VIDEO_URL_LENGTH = 500;

function isPlausibleUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * A creator asks a merchant to physically ship a product sample for
 * filming/content. The full product price is locked as a deposit at request
 * time — the UGC financial-hold policy — and the 7-day upload clock only
 * starts once the sample is actually marked shipped (see respondToSampleRequest).
 */
export async function requestSample(productId: string, note: string) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "creator" || !viewer.creatorProfile) {
    throw new Error("Only a creator can request a product sample.");
  }
  if (viewer.accountStatus === "banned") throw new Error("This account has been suspended.");
  if (viewer.creatorProfile.verificationStatus !== "verified") {
    throw new Error("Complete identity verification before requesting a sample.");
  }

  const trimmedNote = note.trim().slice(0, 300);
  if (trimmedNote && scanForContactLeak(trimmedNote).flagged) {
    throw new Error(CONTACT_LEAK_WARNING_AR);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    throw new Error("This product isn't available for sample requests.");
  }

  const existing = await prisma.sampleRequest.findFirst({
    where: {
      creatorId: viewer.creatorProfile.id,
      productId,
      status: { in: ["pending", "approved", "shipped"] },
    },
  });
  if (existing) {
    revalidatePath("/dashboard/browse");
    return existing;
  }

  const created = await prisma.sampleRequest.create({
    data: {
      creatorId: viewer.creatorProfile.id,
      productId,
      merchantId: product.merchantId,
      note: trimmedNote || null,
      status: "pending",
      depositAmount: product.basePrice,
      depositCurrency: product.currency,
      ugcStatus: "pending",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/browse");

  return created;
}

/** Merchant-side response to an incoming sample request — approve/reject the ask, or mark an approved one shipped. */
export async function respondToSampleRequest(
  sampleRequestId: string,
  action: "approve" | "reject" | "ship"
) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the owning merchant can respond to a sample request.");
  }

  const request = await prisma.sampleRequest.findUnique({ where: { id: sampleRequestId } });
  if (!request || request.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your sample request.");
  }

  if (action === "ship" && request.status !== "approved") {
    throw new Error("Approve the sample before marking it shipped.");
  }
  if (action !== "ship" && request.status !== "pending") {
    throw new Error("This request was already answered.");
  }

  const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "shipped";
  const now = new Date();

  await prisma.sampleRequest.update({
    where: { id: sampleRequestId },
    data: {
      status: nextStatus,
      respondedAt: now,
      // Generated instead of exchanging a real address/phone — the platform
      // is the only coordinator of the physical handoff.
      ...(action === "ship" ? { shippingRef: generateShippingRef(), ugcDeadline: computeUgcDeadline(now) } : {}),
      // A rejected sample never gets shipped, so there's no deposit to hold or UGC to chase.
      ...(action === "reject" ? { ugcStatus: "not_applicable" } : {}),
    },
  });

  revalidatePath("/dashboard");
}

/** Creator submits their filmed UGC video for merchant review, before the deadline. */
export async function submitUgcVideo(sampleRequestId: string, videoUrl: string) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "creator" || !viewer.creatorProfile) {
    throw new Error("Only the requesting creator can submit UGC for this sample.");
  }

  const request = await prisma.sampleRequest.findUnique({ where: { id: sampleRequestId } });
  if (!request || request.creatorId !== viewer.creatorProfile.id) {
    throw new Error("Not your sample request.");
  }
  if (request.status !== "shipped") {
    throw new Error("The sample must be marked shipped before submitting UGC.");
  }
  if (request.ugcStatus !== "pending" && request.ugcStatus !== "submitted") {
    throw new Error("This UGC request is already closed.");
  }
  if (request.ugcDeadline && new Date() > request.ugcDeadline) {
    throw new Error("The 7-day UGC deadline has passed — the deposit was forfeited.");
  }

  const trimmedUrl = videoUrl.trim().slice(0, MAX_VIDEO_URL_LENGTH);
  if (!isPlausibleUrl(trimmedUrl)) {
    throw new Error("Enter a valid video URL.");
  }

  await prisma.sampleRequest.update({
    where: { id: sampleRequestId },
    data: { ugcVideoUrl: trimmedUrl, ugcSubmittedAt: new Date(), ugcStatus: "submitted" },
  });

  revalidatePath("/dashboard");
}

/** Merchant reviews a submitted UGC video — approve releases the deposit, reject sends it back for a resubmission (if still inside the deadline). */
export async function respondToUgcSubmission(sampleRequestId: string, action: "approve" | "reject") {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new Error("Only the owning merchant can review UGC submissions.");
  }

  const request = await prisma.sampleRequest.findUnique({ where: { id: sampleRequestId } });
  if (!request || request.merchantId !== viewer.merchantProfile.id) {
    throw new Error("Not your sample request.");
  }
  if (request.ugcStatus !== "submitted") {
    throw new Error("No pending UGC submission to review.");
  }

  await prisma.sampleRequest.update({
    where: { id: sampleRequestId },
    data: { ugcStatus: action === "approve" ? "approved" : "pending" },
  });

  revalidatePath("/dashboard");
}
