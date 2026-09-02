import type { Metadata } from "next";
import ComplianceDashboard from "@/components/dashboard/ComplianceDashboard";

export const metadata: Metadata = {
  title: "لوحة تحكم الامتثال — مساعد ريادة",
  description: "لوحة تحكم ذكية لمتابعة السجلات والتراخيص ونسب التعمين والضرائب في سلطنة عُمان.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#080B13]">
      <ComplianceDashboard />
    </main>
  );
}
