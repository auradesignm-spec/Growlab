/**
 * MER (Media Efficiency Ratio) = net attributed sales ÷ ad spend for a given
 * calendar day, at the AdWallet/deal level. If MER stays below the wallet's
 * threshold for `merKillConsecutiveDays` days in a row, the campaign
 * auto-flags for pause (docs/prd-ad-budget.md §5.4 / §11.1).
 *
 * This only sets/reads the flag + state — no real Meta Ads API integration.
 * That remains out of scope and is stubbed.
 */

export interface DailySpendPoint {
  date: Date;
  netAttributedSales: number;
  adSpend: number;
}

export interface MerDayResult extends DailySpendPoint {
  mer: number;
  belowThreshold: boolean;
}

/**
 * A day with zero ad spend is not counted against (or for) the streak — no
 * penalty for a day the merchant simply didn't spend (see PRD §11.1).
 */
export function computeMerDay(point: DailySpendPoint, threshold: number): MerDayResult {
  if (point.adSpend <= 0) {
    return { ...point, mer: 0, belowThreshold: false };
  }
  const mer = point.netAttributedSales / point.adSpend;
  return { ...point, mer, belowThreshold: mer < threshold };
}

export interface AutoPauseEvaluation {
  autoPauseFlag: boolean;
  autoPauseReason: string | null;
  consecutiveDaysBelow: number;
}

/**
 * Evaluates a chronologically-ordered list of MER days (most recent last) for
 * the trailing consecutive-day-below-threshold streak. A day with zero spend
 * breaks the streak (it is neither below nor above threshold).
 */
export function evaluateAutoPause(
  merDays: readonly MerDayResult[],
  consecutiveDaysRequired: number,
  threshold: number
): AutoPauseEvaluation {
  let streak = 0;
  for (let i = merDays.length - 1; i >= 0; i -= 1) {
    const day = merDays[i];
    if (day.adSpend <= 0) break;
    if (day.belowThreshold) {
      streak += 1;
    } else {
      break;
    }
  }

  const autoPauseFlag = streak >= consecutiveDaysRequired;
  return {
    autoPauseFlag,
    autoPauseReason: autoPauseFlag
      ? `MER below ${threshold.toFixed(1)}x for ${streak} consecutive day(s)`
      : null,
    consecutiveDaysBelow: streak,
  };
}
