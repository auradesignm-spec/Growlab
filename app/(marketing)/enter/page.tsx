import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import EnterGate from "@/components/EnterGate";
import { getCurrentUser } from "@/lib/auth/session";
import { platformHomeHref, type PartnerRole } from "@/lib/auth/paths";

export const metadata: Metadata = {
  title: "Growlab — الدخول للمنصة",
  robots: { index: true, follow: true },
};

export default async function EnterPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const viewer = await getCurrentUser();
  if (viewer && viewer.role !== "unassigned") {
    redirect(platformHomeHref(viewer.role));
  }

  const initialRole: PartnerRole | undefined =
    searchParams.role === "merchant" || searchParams.role === "creator" ? searchParams.role : undefined;

  return (
    <main>
      <Header />
      <section className="px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <div className="mx-auto max-w-wrap">
          <EnterGate initialRole={initialRole} />
        </div>
      </section>
    </main>
  );
}
