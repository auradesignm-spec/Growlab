import { auth, currentUser } from "@clerk/nextjs/server";
import { getCurrentDevUser, isActiveDevImpersonation } from "@/lib/dev/session";

function adminUserIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_CLERK_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

function adminEmails(): Set<string> {
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (emails.length === 0 && process.env.NODE_ENV === "development") {
    emails.push("qusay@growlab.local");
  }
  return new Set(emails);
}

function emailIsAdmin(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase();
  return Boolean(normalized && adminEmails().has(normalized));
}

/**
 * Platform admin is env-config only — never a self-serve User.role.
 * Grant via ADMIN_CLERK_USER_IDS and/or ADMIN_EMAILS.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (userId && adminUserIds().has(userId)) return true;

  if (userId) {
    const clerk = await currentUser();
    const email = clerk?.emailAddresses[0]?.emailAddress;
    if (emailIsAdmin(email)) return true;
  }

  if (isActiveDevImpersonation()) {
    const viewer = await getCurrentDevUser();
    if (emailIsAdmin(viewer?.email) || emailIsAdmin(viewer?.inviteEmail)) return true;
  }

  return false;
}
