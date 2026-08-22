export type PartnerRole = "merchant" | "creator";

export function signUpHref(role: PartnerRole): string {
  return `/sign-up?redirect_url=${encodeURIComponent(`/dashboard?role=${role}`)}`;
}

export const SIGN_IN_HREF = "/sign-in?redirect_url=/dashboard";
