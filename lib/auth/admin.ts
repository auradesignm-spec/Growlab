import { auth } from "@clerk/nextjs/server";

function adminUserIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_CLERK_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

/**
 * Platform admin is an env-config allowlist of Clerk user IDs, NOT a role
 * stored on the User row. The self-serve onboarding flow (claimRole in
 * onboarding-actions.ts) can only ever write "merchant" or "creator" — this
 * keeps admin access impossible to self-grant through the app itself.
 * Set ADMIN_CLERK_USER_IDS="user_abc,user_def" in the environment to grant it.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  return adminUserIds().has(userId);
}
