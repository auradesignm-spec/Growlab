/**
 * Local impersonation of seeded users. Both conditions are required so a
 * network-exposed host cannot skip Clerk just because NODE_ENV=development.
 */
export function isDevImpersonationEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_IMPERSONATION === "true";
}
