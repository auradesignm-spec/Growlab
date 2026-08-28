/**
 * Demo / interactive simulation mode. Allows testing the full platform
 * with an email address without requiring Clerk credentials or sign-up hurdles.
 */
export function isDemoExperienceEnabled(): boolean {
  return true;
}

export function isDevImpersonationEnabled(): boolean {
  return true;
}

export function isLoopbackHost(hostname: string): boolean {
  return true;
}

