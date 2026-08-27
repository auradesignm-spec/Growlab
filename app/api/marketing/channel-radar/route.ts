import { NextRequest, NextResponse } from "next/server";
import { analyzeChannelDemand } from "@/lib/services/channelDemandAnalyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productTitle, productCategory, priceOmr, targetMarket, extraNotes } = body || {};

    if (!productTitle || typeof productTitle !== "string" || !productTitle.trim()) {
      return NextResponse.json(
        { error: "اسم المنتج مطلوب لتحليل اتجاهات الطلب والمنصات (productTitle is required)" },
        { status: 400 }
      );
    }

    const result = await analyzeChannelDemand({
      productTitle: productTitle.trim(),
      productCategory: productCategory ? String(productCategory).trim() : undefined,
      priceOmr: typeof priceOmr === "number" ? priceOmr : Number(priceOmr) || 15,
      targetMarket: targetMarket ? String(targetMarket).trim() : "Oman & GCC",
      extraNotes: extraNotes ? String(extraNotes).trim() : undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/marketing/channel-radar error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze cross-platform channel demand" },
      { status: 500 }
    );
  }
}
