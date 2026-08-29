import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { publicMetaClientConfig } from "@/lib/meta/config";
import {
  encryptAdsToken,
  exchangeLongLivedUserToken,
  listAdAccounts,
  listManagedPages,
  metaAdsDryRun,
  metaAdsLoginConfigured,
} from "@/lib/meta/marketing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ...publicMetaClientConfig(),
    adsLoginReady: metaAdsLoginConfigured(),
    dryRun: metaAdsDryRun(),
  });
}

/**
 * Connect Meta Ads account for Wave C launch.
 * Body: { accessToken, adAccountId?, pageId? }
 * If adAccountId omitted, picks the first active account; pages similarly.
 */
export async function POST(req: Request) {
  if (!metaAdsLoginConfigured() && !metaAdsDryRun()) {
    return NextResponse.json({ error: "Meta Ads login is not configured." }, { status: 503 });
  }

  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    return NextResponse.json({ error: "Merchant only." }, { status: 401 });
  }
  if (viewer.accountStatus === "banned") {
    return NextResponse.json({ error: "Account suspended." }, { status: 403 });
  }
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your merchant account first." }, { status: 403 });
  }

  let body: { accessToken?: string; adAccountId?: string; pageId?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const shortToken = body.accessToken?.trim();
  if (!shortToken && !metaAdsDryRun()) {
    return NextResponse.json({ error: "accessToken is required." }, { status: 400 });
  }

  try {
    if (metaAdsDryRun() && !shortToken) {
      const wa = await prisma.metaConnection.findUnique({
        where: { merchantId: viewer.merchantProfile.id },
        select: { pageId: true },
      });
      const row = await prisma.metaAdAccount.upsert({
        where: { merchantId: viewer.merchantProfile.id },
        create: {
          merchantId: viewer.merchantProfile.id,
          adAccountId: "dry_account",
          adAccountName: "Dry-run Ad Account",
          currency: "OMR",
          currencyOffset: 1000,
          pageId: body.pageId?.trim() || wa?.pageId || "dry_page",
          accessTokenEnc: encryptAdsToken("dry_token"),
          status: "active",
          lastError: "",
          connectedAt: new Date(),
        },
        update: {
          adAccountId: "dry_account",
          adAccountName: "Dry-run Ad Account",
          currency: "OMR",
          currencyOffset: 1000,
          pageId: body.pageId?.trim() || wa?.pageId || "dry_page",
          accessTokenEnc: encryptAdsToken("dry_token"),
          status: "active",
          lastError: "",
          connectedAt: new Date(),
        },
      });
      return NextResponse.json({
        ok: true,
        dryRun: true,
        account: {
          adAccountId: row.adAccountId,
          adAccountName: row.adAccountName,
          currency: row.currency,
          pageId: row.pageId,
          status: row.status,
        },
        options: [],
      });
    }

    const longLived = await exchangeLongLivedUserToken(shortToken!);
    const [accounts, pages] = await Promise.all([
      listAdAccounts(longLived),
      listManagedPages(longLived),
    ]);
    const active = accounts.filter((a) => a.accountStatus === 1);
    const pool = active.length ? active : accounts;
    if (!pool.length) {
      return NextResponse.json(
        { error: "No Meta ad accounts found for this user. Create one in Meta Business Suite." },
        { status: 400 },
      );
    }

    const preferredId = body.adAccountId?.replace(/^act_/, "").trim();
    const chosen = preferredId ? pool.find((a) => a.id === preferredId) ?? pool[0] : pool[0];

    const wa = await prisma.metaConnection.findUnique({
      where: { merchantId: viewer.merchantProfile.id },
      select: { pageId: true },
    });
    const pageId =
      body.pageId?.trim() ||
      wa?.pageId?.trim() ||
      pages[0]?.id ||
      "";

    if (!pageId) {
      return NextResponse.json(
        {
          error: "No Facebook Page found. Connect a Page (or finish WhatsApp Embedded Signup with a Page).",
          options: { accounts: pool, pages },
        },
        { status: 400 },
      );
    }

    const row = await prisma.metaAdAccount.upsert({
      where: { merchantId: viewer.merchantProfile.id },
      create: {
        merchantId: viewer.merchantProfile.id,
        adAccountId: chosen.id,
        adAccountName: chosen.name,
        currency: chosen.currency,
        currencyOffset: chosen.currencyOffset,
        pageId,
        accessTokenEnc: encryptAdsToken(longLived),
        status: "active",
        lastError: "",
        connectedAt: new Date(),
      },
      update: {
        adAccountId: chosen.id,
        adAccountName: chosen.name,
        currency: chosen.currency,
        currencyOffset: chosen.currencyOffset,
        pageId,
        accessTokenEnc: encryptAdsToken(longLived),
        status: "active",
        lastError: "",
        connectedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      dryRun: false,
      account: {
        adAccountId: row.adAccountId,
        adAccountName: row.adAccountName,
        currency: row.currency,
        pageId: row.pageId,
        status: row.status,
      },
      options: { accounts: pool, pages },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ads connect failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
