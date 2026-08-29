import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClerkEmail = { email_address: string; id: string };
type ClerkUserEvent = {
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email_addresses?: ClerkEmail[];
    primary_email_address_id?: string | null;
  };
  type: string;
};

/**
 * Sync Clerk user create/update into Growlab User rows (email/name).
 * Auth: Authorization Bearer CLERK_WEBHOOK_SECRET (or Svix-compatible headers
 * can be added later when the svix package is installed).
 */
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Clerk webhook not configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: ClerkUserEvent;
  try {
    event = (await req.json()) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const clerkUserId = event.data.id;
  const emails = event.data.email_addresses ?? [];
  const primary =
    emails.find((e) => e.id === event.data.primary_email_address_id)?.email_address ??
    emails[0]?.email_address ??
    "";
  const firstName = (event.data.first_name ?? "").trim();
  const lastName = (event.data.last_name ?? "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ") || primary || "User";

  const existing = await prisma.user.findUnique({ where: { clerkUserId } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: primary || existing.email,
        firstName: firstName || existing.firstName,
        lastName: lastName || existing.lastName,
        name: name || existing.name,
      },
    });
  } else if (primary) {
    const byInvite = await prisma.user.findFirst({
      where: { inviteEmail: primary.toLowerCase() },
    });
    if (byInvite) {
      await prisma.user.update({
        where: { id: byInvite.id },
        data: { clerkUserId, email: primary, firstName, lastName, name },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
