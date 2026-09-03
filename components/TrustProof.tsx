"use client";

import { useLocale } from "next-intl";
import {
  ShieldCheck,
  TrendingUp,
  Building2,
  Users,
  Award,
  Star,
  Quote,
  CheckCircle,
  MapPin,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import StageGlow from "@/components/StageGlow";

export default function TrustProof() {
  const locale = useLocale();
  const isAr = locale !== "en";

  const stats = [
    {
      value: "450+",
      labelAr: "مؤسسة عُمانية مسجلة",
      labelEn: "Omani SMEs Protected",
      subAr: "في مسقط وصحار وصلالة ومختلف المحافظات",
      subEn: "Across Muscat, Sohar, Salalah & Nizwa",
      icon: Building2,
    },
    {
      value: "185,000+",
      labelAr: "ر.ع إجمالي الغرامات المتفادية",
      labelEn: "OMR Fines Successfully Prevented",
      subAr: "تم توفيرها بفضل التنبيهات المبكرة",
      subEn: "Saved through proactive WhatsApp alerts",
      icon: TrendingUp,
    },
    {
      value: "99.4%",
      labelAr: "نسبة الامتثال التنظيمي",
      labelEn: "Compliance Success Rate",
      subAr: "سجلات وتراخيص ونسب تعمين مطابقة 100%",
      subEn: "100% compliant active entities",
      icon: ShieldCheck,
    },
    {
      value: "24/7",
      labelAr: "مراقبة ذكية مستمرة",
      labelEn: "24/7 AI Regulatory Watch",
      subAr: "تحديث دائم لقرارات وزارة العمل والبلديات",
      subEn: "Live sync with Omani regulations",
      icon: Award,
    },
  ];

  const testimonials = [
    {
      id: "t1",
      nameAr: "خالد المعمري",
      nameEn: "Khalid Al-Maamari",
      roleAr: "مالك مؤسسة المعمري للتجارة والمقاولات",
      roleEn: "Owner, Al-Maamari Trading & Contracting",
      cityAr: "صحار",
      cityEn: "Sohar",
      quoteAr:
        "وكيل ريادة نبهني على واتساب قبل موعد تجديد ترخيص البلدية بأسبوعين، ونبهني أيضاً لنقص موظف عُماني لتعديل النسبة قبل صدور غرامة الـ 600 ر.ع. المنصة وفرت علي مبالغ حقيقية.",
      quoteEn:
        "Riyada Assistant alerted me on WhatsApp 2 weeks before my municipal permit expiry and flagged an Omanisation shortfall. It saved me over 600 OMR.",
      rating: 5,
    },
    {
      id: "t2",
      nameAr: "مريم البلوشية",
      nameEn: "Maryam Al-Balushi",
      roleAr: "مؤسسة مشروع 'أطايب' للأغذية والمقاهي",
      roleEn: "Founder, Atayeb Food & Cafes",
      cityAr: "مسقط (الخوض)",
      cityEn: "Muscat (Al-Khoudh)",
      quoteAr:
        "كنت أضيع بين مواعيد الفوترة الضريبية، السجل التجاري، ورخص البلدية. الآن كل شيء منظم في لوحة تحكم واحدة وتصلني الإشعارات بوضوح قبل أي استحقاق.",
      quoteEn:
        "I used to get lost between VAT filings, CR renewals, and municipal permits. Now everything is consolidated in one dashboard.",
      rating: 5,
    },
    {
      id: "t3",
      nameAr: "سالم الشنفري",
      nameEn: "Salim Al-Shanfari",
      roleAr: "المدير التنفيذي لشركة الجنوب للخدمات اللوجستية",
      roleEn: "CEO, South Logistics Co.",
      cityAr: "صلالة",
      cityEn: "Salalah",
      quoteAr:
        "خدمة الاستشارة الفورية بالذكاء الاصطناعي تفهمني في قوانين العمل العمانية بدقة أفضل من البحث لساعات في القرارات الوزارية. خدمة لا غنى عنها لأي رائد أعمال.",
      quoteEn:
        "The AI advisor answers my labor law questions with pinpoint accuracy. Essential tool for every entrepreneur in Oman.",
      rating: 5,
    },
  ];

  return (
    <section id="proof" className="relative scroll-mt-16 py-section">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 md:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="gl-eyebrow text-emerald-700 font-semibold">
              {isAr ? "أرقام وإنجازات حقيقية" : "Proven Track Record"}
            </p>
            <h2 className="gl-heading text-display-lg font-bold text-slate-900">
              {isAr ? "موثوق من أكثر من ٤٥٠ مؤسسة في سلطنة عُمان" : "Trusted by 450+ Omani Enterprises"}
            </h2>
            <p className="gl-lede text-slate-600 text-sm sm:text-base">
              {isAr
                ? "نساعد رواد الأعمال في كافة المحافظات على حماية أعمالهم والتركيز على النمو دون القلق من الغرامات."
                : "Helping businesses across all governorates thrive with complete peace of mind."}
            </p>
          </div>
        </Reveal>

        {/* Stats Grid */}
        <StageGlow className="mt-8 sm:mt-12" tone="cyan" place="center">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Reveal key={stat.labelAr} delay={idx * 60}>
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-2xl border border-slate-200/90 bg-white text-center space-y-1 sm:space-y-2 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 block">
                      {stat.value}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 block">
                      {isAr ? stat.labelAr : stat.labelEn}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {isAr ? stat.subAr : stat.subEn}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </StageGlow>

        {/* Testimonials */}
        <div className="mt-10 sm:mt-16">
          <Reveal>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-slate-900">
                {isAr ? "ماذا يقول أصحاب الأعمال عن مساعد ريادة؟" : "What Business Owners Say"}
              </h3>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {testimonials.map((t, idx) => (
              <Reveal key={t.id} delay={idx * 60}>
                <div className="flex flex-col justify-between p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-shadow space-y-3 sm:space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        <span>{isAr ? t.cityAr : t.cityEn}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                      &ldquo;{isAr ? t.quoteAr : t.quoteEn}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {t.nameAr.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{isAr ? t.nameAr : t.nameEn}</span>
                      <span className="text-xs text-slate-500 block">{isAr ? t.roleAr : t.roleEn}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
