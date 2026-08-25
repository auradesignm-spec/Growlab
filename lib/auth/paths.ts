export type PartnerRole = "merchant" | "creator";

export const ENTER_HREF = "/enter";

/** Public enter / signup is merchant-only. */
export function enterHref(_role?: PartnerRole): string {
  return "/enter";
}

/** After login: buyer-marketers land on browse; merchants on their board. */
export function platformHomeHref(role?: string | null): string {
  return role === "creator" ? "/dashboard/browse" : "/dashboard";
}

export function signInHref(role?: PartnerRole): string {
  const dest = role === "creator" ? "/dashboard/browse" : "/dashboard?role=merchant";
  return `/sign-in?redirect_url=${encodeURIComponent(dest)}`;
}

export function signUpHref(_role?: PartnerRole): string {
  return `/sign-up?redirect_url=${encodeURIComponent("/dashboard?role=merchant")}`;
}

/** First merchant store setup (Odoo-style wizard). */
export const MERCHANT_STORE_SETUP_HREF = "/dashboard/store/edit?fresh=1";

export const SIGN_IN_HREF = signInHref("merchant");
