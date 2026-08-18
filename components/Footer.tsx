import { MessageCircle, ShieldCheck, ArrowUp, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-onDark/10 py-12 text-onDarkSoft relative">
      <div className="mx-auto max-w-wrap px-5 md:px-6">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 pb-10 border-b border-onDark/10">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold font-display font-black text-ink text-lg shadow-sm">
                G
              </span>
              <span className="font-display text-2xl font-black text-onDark tracking-tight">
                Growlab<span className="text-gold">.</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-onDarkSoft max-w-sm leading-relaxed">
              شريك النمو الرقمي الأول للمتاجر والمشاريع في الخليج وعُمان. نجمع بين الإعلانات الممولة الذكية ووكلاء الذكاء الاصطناعي لإغلاق المبيعات على مدار الساعة.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-soft font-mono">
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
              <span>متاحون الآن لاستقبال شركاء جدد لهذا الشهر</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display text-sm font-bold text-onDark">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-gold transition-colors">الرئيسية</a>
              </li>
              <li>
                <a href="#how" className="hover:text-gold transition-colors">آلية العمل والذكاء الاصطناعي</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-gold transition-colors">باقات الاستثمار وحاسبة الأرباح</a>
              </li>
              <li>
                <a href="#compare" className="hover:text-gold transition-colors">مقارنة الخدمات</a>
              </li>
              <li>
                <a href="#founders" className="hover:text-gold transition-colors">قصتنا ونهجنا</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display text-sm font-bold text-onDark">تواصل فوري</h4>
            <p className="text-xs text-onDarkSoft">
              تحدث مباشرة مع فريق المؤسسين لبدء تحليل متجرك دون التزام:
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-[#241A08] hover:bg-gold-soft transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span>احجز استشارتك المجانية</span>
            </a>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-onDarkSoft/70">
          <div>
            © {new Date().getFullYear()} Growlab. جميع الحقوق محفوظة. شراكة نمو رقمية قائمة على النتائج.
          </div>
          <div className="flex items-center gap-4">
            <a href="#hero" className="flex items-center gap-1 hover:text-onDark transition-colors">
              <span>العودة للأعلى</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

