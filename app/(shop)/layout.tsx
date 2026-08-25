import AppShell from "@/components/AppShell";
import DemoExperienceBar from "@/components/demo/DemoExperienceBar";
import { getCurrentUser } from "@/lib/auth/session";
import { isActiveDevImpersonation } from "@/lib/dev/session";
import { isDemoExperienceEnabled } from "@/lib/dev/guard";
import { resolveDemoPersonas, DEMO_MERCHANT_EMAIL, DEMO_BUYER_EMAIL } from "@/lib/dev/demo";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const demoEnabled = isDemoExperienceEnabled() && isActiveDevImpersonation();
  const viewer = demoEnabled ? await getCurrentUser() : null;
  const demoPersonas = demoEnabled ? await resolveDemoPersonas() : null;
  const demoRole =
    viewer?.email === DEMO_MERCHANT_EMAIL
      ? ("merchant" as const)
      : viewer?.email === DEMO_BUYER_EMAIL
        ? ("buyer" as const)
        : ("other" as const);

  return (
    <AppShell>
      {demoEnabled && demoPersonas ? (
        <DemoExperienceBar
          role={demoRole}
          storeSlug={demoPersonas.storeSlug}
          orderToken={demoPersonas.orderToken}
          shareClaimToken={demoPersonas.shareClaimToken}
        />
      ) : null}
      {children}
    </AppShell>
  );
}
