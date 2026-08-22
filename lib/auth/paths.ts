export type PartnerRole = "merchant" | "creator";

export const ENTER_HREF = "/enter";

export function enterHref(role?: PartnerRole): string {
  return role ? `${ENTER_HREF}?role=${role}` : ENTER_HREF;
}

/** After login: marketers land on the feed; merchants on their board. */
export function platformHomeHref(role?: string | null): string {
  return role === "creator" ? "/dashboard/browse" : "/dashboard";
}

export function signInHref(role?: PartnerRole): string {
  const dest = role ? `/dashboard?role=${role}` : "/dashboard";
  return `/sign-in?redirect_url=${encodeURIComponent(dest)}`;
}

export function signUpHref(role: PartnerRole): string {
  return `/sign-up?redirect_url=${encodeURIComponent(`/dashboard?role=${role}`)}`;
}

export const SIGN_IN_HREF = signInHref();
