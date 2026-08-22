export interface OrderLedgerRow {
  orderId: string;
  dealId: string;
  productTitle: string;
  creatorUsername: string;
  merchantBusinessName: string;
  buyerName: string;
  /** Present on merchant (and admin) views only. Never sent to creator dashboards. */
  buyerPhone?: string;
  buyerAddress?: string;
  buyerCity?: string;
  escrowStatus?: string;
  quantity: number;
  unitPriceCharged: number;
  currency: string;
  attributionSource: string;
  status: string;
  createdAt: string;
  ledger: {
    attributedGmv: number;
    returnsReserve: number;
    netAttributedSales: number;
    paymentFee: number;
    cogs: number;
    adSpendAllocated: number;
    contributionPool: number;
    creatorFloorAmount: number;
    creatorProfitShare: number;
    creatorShare: number;
    merchantShare: number;
    platformShare: number;
    holdbackAmount: number;
    availableAmount: number;
    holdbackDays: number;
  } | null;
}
