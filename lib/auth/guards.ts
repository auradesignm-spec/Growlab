import { getCurrentUser } from "@/lib/auth/session";

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export async function requireActiveUser() {
  const viewer = await getCurrentUser();
  if (!viewer) throw new AccessDeniedError("Sign in required.");
  if (viewer.accountStatus === "banned") {
    throw new AccessDeniedError("This account has been suspended.");
  }
  return viewer;
}

export async function requireVerifiedMerchant() {
  const viewer = await requireActiveUser();
  if (viewer.role !== "merchant" || !viewer.merchantProfile) {
    throw new AccessDeniedError("Only a merchant can do this.");
  }
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    throw new AccessDeniedError("Your business must be verified before you can operate on Growlab.");
  }
  return viewer;
}

export async function requireVerifiedCreator() {
  const viewer = await requireActiveUser();
  if (viewer.role !== "creator" || !viewer.creatorProfile) {
    throw new AccessDeniedError("Only a marketer can do this.");
  }
  if (viewer.creatorProfile.verificationStatus !== "verified") {
    throw new AccessDeniedError("Complete identity verification before promoting products.");
  }
  return viewer;
}
