import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { readKycFile } from "@/lib/kyc/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const doc = await prisma.kycDocument.findUnique({ where: { id: params.id } });
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const admin = await isCurrentUserAdmin();
  if (doc.userId !== viewer.id && !admin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const bytes = await readKycFile(doc.storagePath);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Missing file", { status: 404 });
  }
}
