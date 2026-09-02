import { NextRequest, NextResponse } from "next/server";
import { generateComplianceDiagnostic, type ComplianceSurveyAnswers } from "@/lib/needSurvey";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint to receive quiz submissions from the frontend or external webhooks (e.g. n8n).
 * Generates an instant compliance audit score, calculated fine exposure in OMR, and returns recommendations.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const answers: ComplianceSurveyAnswers = {
      sector: body.sector || "retail",
      totalEmployees: Number(body.totalEmployees) || 0,
      omaniEmployees: Number(body.omaniEmployees) || 0,
      knowsCrExpiry: body.knowsCrExpiry || "unknown",
      crExpiryDate: body.crExpiryDate || undefined,
      isRegisteredTawteen: body.isRegisteredTawteen || "unknown",
      hasEInvoicing: body.hasEInvoicing || "unknown",
    };

    const diagnostic = generateComplianceDiagnostic(answers);

    // Optional webhook forward to n8n if environment variable is configured
    const webhookUrl = process.env.N8N_WEBHOOK_QUIZ_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            contact: {
              name: body.name || null,
              phone: body.phone || null,
              email: body.email || null,
            },
            answers,
            diagnostic,
          }),
        });
      } catch (webhookErr) {
        console.warn("[Webhook] Optional n8n forward failed:", webhookErr);
      }
    }

    return NextResponse.json({
      success: true,
      diagnostic,
      receivedAt: new Date().toISOString(),
      meta: {
        platform: "مساعد ريادة — وكيل الامتثال الذكي",
        jurisdiction: "سلطنة عُمان",
        currency: "OMR",
      },
    });
  } catch (error: unknown) {
    console.error("[QuizSubmitAPI] Error processing submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process compliance submission",
      },
      { status: 400 }
    );
  }
}
