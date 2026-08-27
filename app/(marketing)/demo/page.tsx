import type { Metadata } from "next";
import Header from "@/components/Header";
import DemoEnterGate from "@/components/demo/DemoEnterGate";
import DemoTourGuide from "@/components/demo/DemoTourGuide";
import { DEMO_STORE_SLUG } from "@/lib/dev/demo";

export const metadata: Metadata = {
  title: "Growlab — تجربة ديمو",
  robots: { index: true, follow: true },
};

export default function DemoPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-gradient-to-b from-[#fbfcfd] to-[#f4f7fb]">
      <Header />
      <section className="flex flex-1 flex-col justify-center px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
          <div className="w-full rounded-3xl border border-line bg-white/90 p-8 shadow-sm backdrop-blur sm:p-12">
            <div className="mb-8 flex items-center justify-between border-b border-line pb-6">
              <div className="flex items-center gap-2">
                <span className="flex size-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-west text-xs uppercase tracking-widest text-emerald-700 font-bold">
                  Live Interactive Sandbox
                </span>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                بيئة افتراضية متكاملة 100%
              </span>
            </div>

            <DemoEnterGate storeSlug={DEMO_STORE_SLUG} />
          </div>
        </div>
      </section>

      {/* Interactive Branching Guide */}
      <DemoTourGuide />
    </main>
  );
}
