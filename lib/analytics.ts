type EventProps = Record<string, string | number | boolean | undefined>;

/** Local analytics helper. Amplitude SDK is not installed yet; events stay in the console until a key is wired. */
export function track(eventName: string, properties?: EventProps) {
  if (typeof window === "undefined") return;
  const payload = { eventName, properties, ts: Date.now() };
  window.dispatchEvent(new CustomEvent("growlab:track", { detail: payload }));
  if (process.env.NODE_ENV === "development") {
    console.debug("[growlab:track]", eventName, properties ?? {});
  }
}

/** Funnel milestones — use consistently across signup → KYC → publish → order → share. */
export const FUNNEL = {
  signupStarted: "Sign Up Started",
  kycSubmitted: "KYC Submitted",
  storePublished: "Store Published",
  productCreated: "Product Created",
  campaignActivated: "Campaign Activated",
  orderPlaced: "Order Placed",
  shareClaimed: "Share Claimed",
  reelSubmitted: "Reel Submitted",
} as const;
