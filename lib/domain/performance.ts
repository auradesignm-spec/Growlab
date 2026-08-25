/**
 * Performance-distribution payouts (purchase / qualified reel view).
 * Pure math — no DB. Visit payouts are disabled by policy (see performanceRules).
 */
import type { DistributorRole, PerformanceEventType } from "@/lib/domain/enums";
import { DEFAULT_ORIGIN_VIEW_CPM } from "@/lib/domain/performanceRules";

export interface PerformanceRates {
  /** Flat OMR per visit — kept for schema compat; policy forces 0. */
  visitRateSharer: number;
  visitRateOrigin: number;
  visitRateClipper: number;
  /** Fraction of collected GMV (0.10 = 10%). */
  purchasePctSharer: number;
  purchasePctOrigin: number;
  purchasePctClipper: number;
  /** OMR per 1000 qualified Origin reel views. */
  viewCpmOrigin: number;
  viewCpmClipper: number;
  /** Extra fraction of GMV to Origin when a clipper closes a sale from their clip. */
  originBonusPct: number;
}

/** Pitch defaults — visits zeroed; Origin reel CPM on; purchase % kept. */
export const DEFAULT_PERFORMANCE_RATES: PerformanceRates = {
  visitRateSharer: 0,
  visitRateOrigin: 0,
  visitRateClipper: 0,
  purchasePctSharer: 0.1,
  purchasePctOrigin: 0.15,
  purchasePctClipper: 0.1,
  viewCpmOrigin: DEFAULT_ORIGIN_VIEW_CPM,
  viewCpmClipper: 0,
  originBonusPct: 0.03,
};

export interface BudgetState {
  budgetCap: number;
  budgetSpent: number;
}

export interface PerformancePayoutInput {
  eventType: PerformanceEventType;
  role: DistributorRole;
  rates: PerformanceRates;
  /** Collected GMV for purchase / origin_bonus. Ignored for visit/view. */
  attributedGmv?: number;
  /** Raw view count for view events. */
  viewCount?: number;
  budget: BudgetState;
  /** When false, view events always pay 0 (v1 default). */
  viewsEnabled?: boolean;
}

export interface PerformancePayoutResult {
  amount: number;
  capped: boolean;
  remainingBudget: number;
  reason: "ok" | "budget_exhausted" | "views_disabled" | "zero_rate" | "invalid";
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function visitRate(rates: PerformanceRates, role: DistributorRole): number {
  if (role === "origin") return rates.visitRateOrigin;
  if (role === "clipper") return rates.visitRateClipper;
  return rates.visitRateSharer;
}

function purchasePct(rates: PerformanceRates, role: DistributorRole): number {
  if (role === "origin") return rates.purchasePctOrigin;
  if (role === "clipper") return rates.purchasePctClipper;
  return rates.purchasePctSharer;
}

function viewCpm(rates: PerformanceRates, role: DistributorRole): number {
  if (role === "origin") return rates.viewCpmOrigin;
  if (role === "clipper") return rates.viewCpmClipper;
  return 0;
}

/**
 * Computes a single performance credit, never exceeding remaining budget.
 */
export function computePerformancePayout(input: PerformancePayoutInput): PerformancePayoutResult {
  const remaining = round2(Math.max(0, input.budget.budgetCap - input.budget.budgetSpent));
  if (remaining <= 0) {
    return { amount: 0, capped: true, remainingBudget: 0, reason: "budget_exhausted" };
  }

  let raw = 0;

  switch (input.eventType) {
    case "visit":
      raw = visitRate(input.rates, input.role);
      break;
    case "purchase": {
      const gmv = Math.max(0, input.attributedGmv ?? 0);
      raw = gmv * purchasePct(input.rates, input.role);
      break;
    }
    case "view": {
      if (!input.viewsEnabled) {
        return { amount: 0, capped: false, remainingBudget: remaining, reason: "views_disabled" };
      }
      const cpm = viewCpm(input.rates, input.role);
      const views = Math.max(0, input.viewCount ?? 0);
      raw = (views / 1000) * cpm;
      break;
    }
    case "origin_bonus": {
      if (input.role !== "origin") {
        return { amount: 0, capped: false, remainingBudget: remaining, reason: "invalid" };
      }
      const gmv = Math.max(0, input.attributedGmv ?? 0);
      raw = gmv * Math.max(0, input.rates.originBonusPct);
      break;
    }
    default:
      return { amount: 0, capped: false, remainingBudget: remaining, reason: "invalid" };
  }

  raw = round2(raw);
  if (raw <= 0) {
    return { amount: 0, capped: false, remainingBudget: remaining, reason: "zero_rate" };
  }

  const amount = round2(Math.min(raw, remaining));
  return {
    amount,
    capped: amount < raw,
    remainingBudget: round2(remaining - amount),
    reason: "ok",
  };
}

export function isCampaignSpendable(status: string, budget: BudgetState): boolean {
  if (status !== "active") return false;
  return budget.budgetCap - budget.budgetSpent > 1e-9;
}

/** Relative earn potential index for pitch/UI (sharer < clipper < origin). */
export function earnOpportunityIndex(role: DistributorRole): number {
  if (role === "origin") return 100;
  if (role === "clipper") return 85;
  return 70;
}
