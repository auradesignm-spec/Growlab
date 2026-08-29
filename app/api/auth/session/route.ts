import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        locale: user.locale,
        merchantProfile: user.merchantProfile
          ? {
              id: user.merchantProfile.id,
              businessName: user.merchantProfile.businessName,
              plan: user.merchantProfile.plan,
              verificationStatus: user.merchantProfile.verificationStatus,
              city: user.merchantProfile.city,
            }
          : null,
        creatorProfile: user.creatorProfile
          ? {
              id: user.creatorProfile.id,
              username: user.creatorProfile.username,
              verificationStatus: user.creatorProfile.verificationStatus,
              avatarUrl: (user.creatorProfile as any).avatarUrl || null,
            }
          : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null, error: String(error) });
  }
}
