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
  shippingRef?: string | null;
  trackingToken?: string;
  deliveryBucket?: "not_delivered" | "awaiting_buyer" | "delivered" | "closed";
  buyerNotifyHref?: string | null;
  createdAt: string;
  ledger: {
    attributedGmv: number;
    paymentFee: number;
    creatorShare: number;
    merchantShare: number;
    platformShare: number;
    holdbackAmount: number;
    availableAmount: number;
    holdbackDays: number;
  } | null;
}
