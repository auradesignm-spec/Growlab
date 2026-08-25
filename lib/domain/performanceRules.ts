/**
 * Strict performance rules: pay on qualified buyer-reel views + collected
 * purchases only. Raw link clicks never earn — they are too easy to game.
 */
import type { DistributorRole, PerformanceEventType } from "@/lib/domain/enums";

/** Visit payouts are permanently off (anti-spam / fake traffic). */
export const VISIT_PAYOUTS_ENABLED = false;

/**
 * Views pay only for Origin (buyer who filmed an approved reel).
 * Clipper view CPM stays off until library clip verification exists.
 */
export const VIEW_PAYOUTS_REQUIRE_APPROVED_REEL = true;

/** Minimum incremental views between two paid reports for one reel. */
export const MIN_VIEW_DELTA = 500;

/** Hard ceiling per report — stops inflated screenshots in one shot. */
export const MAX_VIEW_DELTA_PER_REPORT = 50_000;

/** Hours between view reports on the same ContentAsset. */
export const VIEW_REPORT_COOLDOWN_HOURS = 24;

/** Max paid view reports per ContentAsset per calendar day (UTC). */
export const MAX_VIEW_REPORTS_PER_DAY = 2;

/** Default OMR per 1000 qualified Origin reel views (merchant can lower). */
export const DEFAULT_ORIGIN_VIEW_CPM = 2.5;

/** Purchase % still applies — real COD collection is hard to fake at scale. */
export const PURCHASE_PAYOUTS_ENABLED = true;

export type QualifyRejectReason =
  | "ok"
  | "visits_disabled"
  | "views_require_origin"
  | "views_require_approved_reel"
  | "view_delta_too_small"
  | "view_delta_too_large"
  | "view_cooldown"
  | "view_daily_cap"
  | "self_referral"
  | "purchase_disabled"
  | "invalid";

export interface ViewReportState {
  /** Last view count the merchant already paid against. */
  lastPaidViewCount: number;
  /** Newly attested total views on the social post. */
  attestedViewCount: number;
  lastViewReportAt: Date | null;
  reportsToday: number;
  now?: Date;
}

export function qualifyVisitEarn(): QualifyRejectReason {
  return VISIT_PAYOUTS_ENABLED ? "ok" : "visits_disabled";
}

export function qualifyPurchaseEarn(input: {
  selfReferral: boolean;
}): QualifyRejectReason {
  if (!PURCHASE_PAYOUTS_ENABLED) return "purchase_disabled";
  if (input.selfReferral) return "self_referral";
  return "ok";
}

export function qualifyViewEarn(input: {
  role: DistributorRole;
  contentApproved: boolean;
  hasSocialPostUrl: boolean;
  report: ViewReportState;
}): { reason: QualifyRejectReason; payableViews: number } {
  if (input.role !== "origin") {
    return { reason: "views_require_origin", payableViews: 0 };
  }
  if (VIEW_PAYOUTS_REQUIRE_APPROVED_REEL && (!input.contentApproved || !input.hasSocialPostUrl)) {
    return { reason: "views_require_approved_reel", payableViews: 0 };
  }

  const now = input.report.now ?? new Date();
  const delta = Math.floor(input.report.attestedViewCount - input.report.lastPaidViewCount);
  if (delta < MIN_VIEW_DELTA) {
    return { reason: "view_delta_too_small", payableViews: 0 };
  }
  if (delta > MAX_VIEW_DELTA_PER_REPORT) {
    return { reason: "view_delta_too_large", payableViews: 0 };
  }

  if (input.report.lastViewReportAt) {
    const hours =
      (now.getTime() - input.report.lastViewReportAt.getTime()) / (1000 * 60 * 60);
    if (hours < VIEW_REPORT_COOLDOWN_HOURS) {
      return { reason: "view_cooldown", payableViews: 0 };
    }
  }

  if (input.report.reportsToday >= MAX_VIEW_REPORTS_PER_DAY) {
    return { reason: "view_daily_cap", payableViews: 0 };
  }

  return { reason: "ok", payableViews: delta };
}

export function eventAllowedForStrictPolicy(eventType: PerformanceEventType): boolean {
  if (eventType === "visit") return VISIT_PAYOUTS_ENABLED;
  if (eventType === "purchase") return PURCHASE_PAYOUTS_ENABLED;
  if (eventType === "view") return true;
  if (eventType === "origin_bonus") return true;
  return false;
}

export const STRICT_RULES_COPY_AR = {
  visitsOff: "زيارات الرابط لا تُدفع — فقط مشاهدات ريلز المشتري المعتمد، أو شراء محصّل.",
  needReel: "ارفع ريل إنستغرام/تيك توك للمنتج وانتظر موافقة التاجر قبل أي أجر مشاهدات.",
  selfReferral: "لا يُدفع على طلبات ذاتية أو نفس رقم الجوال.",
  viewDelta: `الحد الأدنى للزيادة بين تقريرين: ${MIN_VIEW_DELTA} مشاهدة.`,
} as const;
