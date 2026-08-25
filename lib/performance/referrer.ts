import { prisma } from "@/lib/db";
import { normalizeCreatorHandle } from "@/lib/shop/cookieNames";
import { readRefCookie } from "@/lib/shop/cookies";

/** Resolve first-touch creator id from affiliate ref cookie. */
export async function resolveReferrerCreatorId(): Promise<string | null> {
  const handle = readRefCookie();
  if (!handle) return null;
  const creator = await prisma.creatorProfile.findUnique({
    where: { username: handle },
    select: { id: true },
  });
  return creator?.id ?? null;
}

export async function creatorIdFromHandle(handleRaw: string | null | undefined): Promise<string | null> {
  const handle = handleRaw ? normalizeCreatorHandle(handleRaw) : "";
  if (!handle) return null;
  const creator = await prisma.creatorProfile.findUnique({
    where: { username: handle },
    select: { id: true },
  });
  return creator?.id ?? null;
}
