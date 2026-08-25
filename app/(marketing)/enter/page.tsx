import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import EnterGate from "@/components/EnterGate";
import DemoEnterGate from "@/components/demo/DemoEnterGate";
import { getCurrentUser } from "@/lib/auth/session";
import { platformHomeHref } from "@/lib/auth/paths";
import { isDemoExperienceEnabled } from "@/lib/dev/guard";
import { DEMO_STORE_SLUG } from "@/lib/dev/demo";

export const metadata: Metadata = {
  title: "Growlab — الدخول للمنصة",
  robots: { index: true, follow: true },
};

export default async function EnterPage() {
  const viewer = await getCurrentUser();
  if (viewer && viewer.role !== "unassigned") {
    redirect(platformHomeHref(viewer.role));
  }

  const demoEnabled = isDemoExperienceEnabled();

  return (
    <main className="flex min-h-dvh flex-col">
      <Header />
      <section className="flex flex-1 flex-col justify-center px-5 pb-12 pt-24 sm:px-8 sm:pb-16 sm:pt-28">
        <div className="mx-auto flex w-full max-w-wrap flex-col gap-16">
          <EnterGate />
          {demoEnabled ? (
            <div className="border-t border-line pt-12">
              <DemoEnterGate storeSlug={DEMO_STORE_SLUG} />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
