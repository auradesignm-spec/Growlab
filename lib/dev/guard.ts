/**
 * Local demo / impersonation of seeded users. Both conditions are required so a
 * network-exposed host cannot skip Clerk just because NODE_ENV=development.
 */
export function isDemoExperienceEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return (
    process.env.ALLOW_DEV_IMPERSONATION === "true" ||
    process.env.ALLOW_DEMO_MODE === "true"
  );
}

export function isDevImpersonationEnabled(): boolean {
  return isDemoExperienceEnabled();
}

export function isLoopbackHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/[\][]/g, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}
