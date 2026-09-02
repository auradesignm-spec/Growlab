import type { Metadata } from "next";
import { NeedSurveyDialog } from "@/components/NeedSurvey";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CloudMesh from "@/components/CloudMesh";

export const metadata: Metadata = {
  title: "فحص الامتثال التنظيمي الذكي — مساعد ريادة",
  description: "افحص وضع مؤسستك في سلطنة عُمان خلال دقيقة: نسب التعمين، التراخيص، الضرائب، وتقدير الغرامات المحتملة.",
};

export default function QuizStandalonePage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col justify-between relative overflow-hidden">
      <CloudMesh />
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full flex flex-col items-center justify-center">
        <div className="w-full">
          <NeedSurveyDialog standalone={true} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
