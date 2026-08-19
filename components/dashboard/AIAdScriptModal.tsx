"use client";

import { useState } from "react";
import { Product } from "./types";
import {
  X,
  Sparkles,
  Copy,
  Check,
  Video,
  Play,
  Share2,
  Download,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface AIAdScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function AIAdScriptModal({
  isOpen,
  onClose,
  product,
}: AIAdScriptModalProps) {
  const [scriptText, setScriptText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  if (!isOpen || !product) return null;

  const handleGenerateScript = async () => {
    setIsLoading(true);
    setScriptText("");
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          category: product.category,
          price: `${product.price}$`,
          sellingPoints: product.sellingPoints,
          targetAudience: "الجمهور الخليجي وسيدات ورجال الأعمال في سلطنة عُمان والخليج",
          adFormat: "Instagram Reels & TikTok UGC Video (9:16)",
        }),
      });
      const data = await res.json();
      setScriptText(data.script || "تم توليد السكريبت بنجاح!");
      setHasGenerated(true);
    } catch (e: any) {
      setScriptText("حدث خطأ أثناء توليد السكريبت: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gold/40 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-ink px-6 py-5 text-onDark">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-[#241A08] shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-onDark">
                توليد سكريبت فيديو إعلاني UGC بالذكاء الاصطناعي
              </h3>
              <p className="text-xs text-gold-soft font-mono">
                للمنتج: {product.name} • {product.price}$
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-onDarkSoft hover:bg-onDark/10 hover:text-onDark transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {!hasGenerated && !isLoading && (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/30">
                <Video className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-ink">
                  جاهز لصناعة إعلان ريلز عالي التحويل لـ {product.name}؟
                </h4>
                <p className="text-xs text-muted max-w-md mx-auto mt-1 leading-relaxed">
                  يقوم الذكاء الاصطناعي بتحليل مميزات المنتج وصياغة 3 خطافات بصرية، سيناريو تصوير دقيقة بدقيقة لمؤثري UGC، ونص إعلاني جاهز للنشر على إنستغرام وتيك توك.
                </p>
              </div>

              <button
                onClick={handleGenerateScript}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-bold text-[#241A08] shadow-lg shadow-gold/20 hover:bg-gold-soft transition-all active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>توليد سكريبت الإعلان الآن عبر Gemini AI</span>
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-gold border border-gold/40 animate-pulse">
                <Sparkles className="h-8 w-8 animate-spin" />
              </div>
              <h4 className="font-display text-base font-bold text-ink">
                جاري إعداد سكريبت الفيديو والخطافات الإعلانية...
              </h4>
              <p className="text-xs text-muted">
                يتم صياغة السيناريو باللهجة الخليجية وتحديد زوايا التصوير المناسبة لميتا وتيك توك
              </p>
            </div>
          )}

          {hasGenerated && scriptText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-teal font-mono">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تم تجهيز سكريبت الإعلان الاحترافي بنجاح!</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateScript}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-xs text-muted hover:text-ink px-2.5 py-1 rounded-lg border border-line"
                  >
                    <span>إعادة التوليد</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg bg-gold px-3.5 py-1 text-xs font-bold text-[#241A08] shadow-sm hover:bg-gold-soft transition-all"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "تم النسخ!" : "نسخ السكريبت بالكامل"}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-5 font-mono text-xs text-ink leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto">
                {scriptText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
