/**
 * Instant payout (earned wage access) math. A creator's balance is always
 * split into `availableBalance` (unheld, confirmed, spendable now) and
 * `heldBalance` (in the return/fraud holdback window). Payout requests may
 * only ever draw from `availableBalance`, never from `heldBalance`.
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

  const totalPaidOut = payoutRequests
    .filter((p) => p.status === "paid" || p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    totalEarned: round2(totalEarned),
    availableBalance: round2(Math.max(0, availableBalance - totalPaidOut)),
    heldBalance: round2(heldBalance),
    totalPaidOut: round2(totalPaidOut),
  };
}

/** Small flat + percentage fee for instant (earned-wage-access) payouts. */
export const INSTANT_PAYOUT_FEE_PCT = 0.03;
export const INSTANT_PAYOUT_FEE_MIN = 1;

export function computeInstantPayoutFee(amount: number): number {
  return round2(Math.max(INSTANT_PAYOUT_FEE_MIN, amount * INSTANT_PAYOUT_FEE_PCT));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
