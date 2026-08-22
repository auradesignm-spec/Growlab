/**
 * Instant payout (earned wage access) math. A creator's balance is always
 * split into `availableBalance` (unheld, confirmed, spendable now) and
 * `heldBalance` (returns reserve — 10% for 14 days after collection).
 * Payout requests may only ever draw from `availableBalance`.
 * Returned / refunded lines drop out of payable balances.
 */

export interface LedgerBalanceLine {
  /** When the underlying order was created. */
  orderCreatedAt: Date;
  creatorShare: number;
  holdbackAmount: number;
  availableAmount: number;
  holdbackDays: number;
  /** Only confirmed/fulfilled orders contribute to payable balances. */
  orderStatus: string;
  /** Logical COD escrow — payouts wait until the merchant marks collection. */
  escrowStatus: string;
  /** Holdback clock starts when escrow is released, not at order create. */
  escrowReleasedAt?: Date | null;
}

export interface PayoutRequestLine {
  amount: number;
  status: string;
}

export interface CreatorBalances {
  totalEarned: number;
  availableBalance: number;
  heldBalance: number;
  totalPaidOut: number;
}

const PAYABLE_ORDER_STATUSES = new Set(["fulfilled"]);
/** Open and settled payouts occupy available balance so a second request cannot over-commit. */
const RESERVED_PAYOUT_STATUSES = new Set(["requested", "approved", "paid"]);
const SETTLED_PAYOUT_STATUSES = new Set(["paid", "approved"]);

export function computeCreatorBalances(
  ledgerLines: readonly LedgerBalanceLine[],
  payoutRequests: readonly PayoutRequestLine[],
  now: Date = new Date()
): CreatorBalances {
  let totalEarned = 0;
  let availableBalance = 0;
  let heldBalance = 0;

  for (const line of ledgerLines) {
    if (line.escrowStatus !== "released") continue;
    if (!PAYABLE_ORDER_STATUSES.has(line.orderStatus)) continue;

    totalEarned += line.creatorShare;
    availableBalance += line.availableAmount;

    const clockStart = line.escrowReleasedAt ?? line.orderCreatedAt;
    const releaseDate = new Date(clockStart);
    releaseDate.setDate(releaseDate.getDate() + line.holdbackDays);

    if (now >= releaseDate) {
      availableBalance += line.holdbackAmount;
    } else {
      heldBalance += line.holdbackAmount;
    }
  }

  const reserved = payoutRequests
    .filter((p) => RESERVED_PAYOUT_STATUSES.has(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPaidOut = payoutRequests
    .filter((p) => SETTLED_PAYOUT_STATUSES.has(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    totalEarned: round2(totalEarned),
    availableBalance: round2(Math.max(0, availableBalance - reserved)),
    heldBalance: round2(heldBalance),
    totalPaidOut: round2(totalPaidOut),
  };
}

/** Instant payout fee on the withdrawn amount. */
export const INSTANT_PAYOUT_FEE_PCT = 0.02;
export const INSTANT_PAYOUT_FEE_MIN = 0.2;

/** Minimum payout, instant or scheduled. 25 USD at 1 OMR ≈ 2.6008 USD. */
export const MIN_PAYOUT_OMR = 9.61;

export function computeInstantPayoutFee(amount: number): number {
  return round2(Math.max(INSTANT_PAYOUT_FEE_MIN, amount * INSTANT_PAYOUT_FEE_PCT));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
