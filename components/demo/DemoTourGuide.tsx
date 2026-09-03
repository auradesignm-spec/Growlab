"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export interface InteractiveTourStep {
  id: string;
  titleAr: string;
  titleEn: string;
  explanationAr: string;
  explanationEn: string;
  badgeAr: string;
  badgeEn: string;
  options: Array<{
    labelAr: string;
    labelEn: string;
    descAr: string;
    descEn: string;
    actionType: "navigate" | "role_switch" | "tab_switch" | "finish";
    targetUrl?: string;
    targetTab?: string;
    targetRole?: "merchant" | "buyer";
  }>;
}

const TOUR_BRANCHES: Record<string, InteractiveTourStep> = {
  welcome: {
    id: "welcome",
    titleAr: "مرحباً بك في جولة مساعد ريادة التفاعلية",
    titleEn: "Welcome to Riyada Assistant Interactive Tour",
    explanationAr:
      "أنت الآن في البيئة الاستكشافية لمنصة مساعد ريادة للامتثال المؤسسي في سلطنة عُمان. نوجهك خطوة بخطوة لاستعراض أدوات الامتثال واللوحة التشغيلية:",
    explanationEn:
      "You are now in the live interactive sandbox of Riyada Assistant. We guide you step-by-step through our compliance and risk-prevention features:",
    badgeAr: "بداية الجولة",
    badgeEn: "Start Tour",
    options: [
      {
        labelAr: "1. محاكي رادار الامتثال ونسب التعمين والمخاطر",
        labelEn: "1. Compliance Radar & Omanisation Simulator",
        descAr: "حساب فوري لنسب التعمين، كشف المخاطر التنظيمية، ومحاكاة التنبيهات الاستباقية.",
        descEn: "Instant Omanisation quota calculations and fine-prevention simulation.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=simulator",
      },
      {
        labelAr: "2. فحص مواعيد السجل التجاري ورخص البلدية",
        labelEn: "2. CR & Municipal Permit Audit",
        descAr: "مراقبة تواريخ التجديد وتفادي غرامات التأخير وتجميد الحسابات البنكية.",
        descEn: "Track renewal deadlines and avoid late compounding penalties.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=command",
      },
      {
        labelAr: "3. استشارة مستشار اللوائح والأنظمة العمانية بالذكاء الاصطناعي",
        labelEn: "3. AI Regulatory & Labor Law Advisor",
        descAr: "إجابات فورية موثوقة حول قانون العمل العماني وإجراءات التراخيص.",
        descEn: "Instant verified answers on Oman labor laws and licensing procedures.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=ai",
      },
      {
        labelAr: "4. مسار التوثيق والتحقق من المنشأة (السجل التجاري)",
        labelEn: "4. Entity KYC & CR Verification",
        descAr: "معاينة متطلبات توثيق المنشأة، ربط السجل التجاري، والحصول على شارة الامتثال.",
        descEn: "Preview commercial registry verification and compliance badge.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
      {
        labelAr: "5. تدقيق الفوترة الإلكترونية وضريبة القيمة المضافة",
        labelEn: "5. VAT & E-Invoicing Compliance",
        descAr: "التأكد من مطابقة الفواتير لاشتراطات جهاز الضرائب وتفادي غرامات التدقيق.",
        descEn: "Ensure tax invoices comply with Tax Authority standards.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=leaks",
      },
      {
        labelAr: "6. إعدادات المنشأة وتنبيهات واتساب",
        labelEn: "6. Entity Settings & WhatsApp Alerts",
        descAr: "ضبط أرقام التنبيه الاستباقي ومواعيد الإشعار المبكر.",
        descEn: "Configure proactive WhatsApp alert numbers and notification milestones.",
        actionType: "navigate",
        targetUrl: "/dashboard/settings",
      },
    ],
  },

  brandstack_tour: {
    id: "brandstack_tour",
    titleAr: "مركز قيادة الأرباح الصافية",
    titleEn: "True Net Margin Hub",
    explanationAr:
      "رؤية صافي الأرباح الحقيقية بعد خصم تكلفة البضاعة (COGS)، مصاريف إعلانات المنصات، ورسوم الشحن المرتجع. اختر القسم للاستعراض:",
    explanationEn:
      "View true net profits after COGS, ad spend, and RTO losses. Choose below to navigate:",
    badgeAr: "محرك الربحية",
    badgeEn: "Profit Engine",
    options: [
      {
        labelAr: "تجربة محاكي المبيعات وتدفق الطلبات الحية",
        labelEn: "Test Live Order Stream Simulator",
        descAr: "شاهد كيف يتم تسجيل طلبات جديدة وتحديث الأرباح فوراً.",
        descEn: "See incoming simulated orders update profit metrics in real-time.",
        actionType: "tab_switch",
        targetTab: "simulator",
      },
      {
        labelAr: "التحدث مع المستشار المالي والتشغيلي",
        labelEn: "Financial & Operational Copilot",
        descAr: "استفسر عن حملاتك الإعلانية أو كيفية خفض المرتجعات.",
        descEn: "Ask real-time questions about ad campaigns or RTO reduction.",
        actionType: "tab_switch",
        targetTab: "ai",
      },
      {
        labelAr: "فحص توصيات إعلانات ميتا (تحسين الصرف)",
        labelEn: "Inspect Meta Ads Guard",
        descAr: "اكتشف كيف تمنع المنصة هدر الميزانية وتوجه الصرف للحملات الرابحة.",
        descEn: "See automated decisions preventing budget waste on low-ROAS campaigns.",
        actionType: "tab_switch",
        targetTab: "ads",
      },
      {
        labelAr: "فحص تنبيهات المخزون الراكد ومنع النفاد",
        labelEn: "Review Automated Inventory Alerts",
        descAr: "متابعة المنتجات التي توشك على النفاد والمنتجات الراكدة.",
        descEn: "Inspect velocity alerts and dead-stock clearance suggestions.",
        actionType: "tab_switch",
        targetTab: "inventory",
      },
      {
        labelAr: "معاينة متجر التاجر كعميل متسوق",
        labelEn: "View Storefront as Buyer",
        descAr: "تجربة واجهة المتجر السريعة والمحسنة للهاتف.",
        descEn: "Experience the customer-facing mobile-optimized shopping storefront.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
    ],
  },

  store_builder_tour: {
    id: "store_builder_tour",
    titleAr: "محرر المتجر الذكي — بناء الواجهة",
    titleEn: "Smart Store Builder & Block Editor",
    explanationAr:
      "إنشاء متجر كامل متوافق مع الهواتف دون الحاجة لأي برمجة. يمكنك تعديل البلوكات وإطلاق الحملة فوراً.",
    explanationEn:
      "Build high-converting storefronts with visual blocks. What would you like to explore next?",
    badgeAr: "محرر المتاجر",
    badgeEn: "Store Builder",
    options: [
      {
        labelAr: "تجربة طلب منتج كعميل (COD Checkout)",
        labelEn: "Make a Test COD Order as a Buyer",
        descAr: "وضع طلب تجريبي وملاحظة سرعة تسجيل الطلب في لوحة التاجر.",
        descEn: "Place a simulated order and watch it reflect live in the portal.",
        actionType: "navigate",
        targetUrl: "/m/muttrah-attars",
      },
      {
        labelAr: "الانتقال إلى لوحة قيادة التاجر الرئيسية",
        labelEn: "Go to Merchant Financial Dashboard",
        descAr: "استعراض إدارة الطلبات وأداء المبيعات ومحفظة الضمان المالي.",
        descEn: "View order management, financial escrow, and sales metrics.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=command",
      },
      {
        labelAr: "الانتقال إلى مركز التوثيق والشارة الزرقاء",
        labelEn: "Go to Verification Center",
        descAr: "اطلع على مسار التوثيق المخصص لمشروعك.",
        descEn: "Check identity verification tracks tailored for your business.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
    ],
  },

  storefront_buyer_tour: {
    id: "storefront_buyer_tour",
    titleAr: "واجهة متجر المشتري — طلب بالدفع عند الاستلام",
    titleEn: "Buyer Storefront — COD Checkout",
    explanationAr:
      "الصفحة السريعة التي يراها زبائنك من الإعلانات. تطلب الاسم، الهاتف، والعنوان فقط. جرب إتمام طلب ثم انتقل للخطوة التالية:",
    explanationEn:
      "This is what customers see from your ads. Fast one-click COD checkout with zero friction. Place an order then choose next step:",
    badgeAr: "تجربة المشتري",
    badgeEn: "Buyer Experience",
    options: [
      {
        labelAr: "العودة لمركز قيادة التاجر ورؤية انعكاس المبيعات",
        labelEn: "Return to Merchant Command Center",
        descAr: "متابعة تحديث صافي الأرباح والإحصائيات اللحظية.",
        descEn: "See your metrics and net profits update in real-time.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=brandstack",
      },
      {
        labelAr: "استكشاف بوابة المسوّقين وصناع المحتوى",
        labelEn: "Explore Creator & Marketer Portal",
        descAr: "مشاهدة كيفية مشاركة صناع المحتوى روابط المنتجات.",
        descEn: "See how creators earn by promoting products.",
        actionType: "navigate",
        targetUrl: "/dashboard/browse",
      },
      {
        labelAr: "الانتقال إلى مركز توثيق الحساب (KYC)",
        labelEn: "Go to Account KYC Verification",
        descAr: "استعراض خطوات توثيق الهوية والسجل التجاري.",
        descEn: "See ID & Commercial Register or Freelance verification flow.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification",
      },
    ],
  },

  verification_tour: {
    id: "verification_tour",
    titleAr: "مركز التوثيق والتحقق — KYC",
    titleEn: "Identity Verification Center",
    explanationAr:
      "نظام التحقق للحصول على شارة التوثيق الرسمية. مخصص لمسار السجل التجاري أو مسار المشاريع المنزلية.",
    explanationEn:
      "Get your verified badge. Tailored for both registered entities (CR) and home/freelance brands.",
    badgeAr: "التوثيق المعتمد",
    badgeEn: "KYC Center",
    options: [
      {
        labelAr: "مسار المنشآت بالسجل التجاري الرسمي (CR)",
        labelEn: "Commercial Registration (CR) Track",
        descAr: "رفع وثيقة السجل التجاري ورقم المنشأة.",
        descEn: "Upload CR certificate for corporate validation.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification?tab=cr",
      },
      {
        labelAr: "مسار المشاريع المنزلية والعمل الحر",
        labelEn: "Home Business Track",
        descAr: "رفع البطاقة الشخصية والتحقق البيومتري.",
        descEn: "Upload National ID and face verification.",
        actionType: "navigate",
        targetUrl: "/dashboard/verification?tab=home_business",
      },
      {
        labelAr: "العودة لمركز قيادة التاجر ومحاكي المبيعات",
        labelEn: "Return to Merchant Dashboard & Simulator",
        descAr: "متابعة المبيعات والأرباح والمخزون.",
        descEn: "Continue monitoring sales, inventory, and net margins.",
        actionType: "navigate",
        targetUrl: "/dashboard?tab=simulator",
      },
    ],
  },
};

export default function DemoTourGuide({ locale = "ar" }: { locale?: string }) {
  // Tour guidance is integrated directly into the bottom FloatingAssistantChat chatbot widget.
  return null;
}

