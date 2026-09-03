/**
 * @file knowledgeBase.ts
 * @description Type definitions and metadata for Omani regulatory knowledge base files.
 */

export enum DocumentCategory {
  VAT_LAW = "VAT_LAW",
  LABOR_LAW = "LABOR_LAW",
  EXECUTIVE_REGULATIONS = "EXECUTIVE_REGULATIONS",
  COMMERCIAL_COMPANIES_LAW = "COMMERCIAL_COMPANIES_LAW",
  INCOME_TAX_LAW = "INCOME_TAX_LAW",
  SOCIAL_PROTECTION_LAW = "SOCIAL_PROTECTION_LAW",
  MUNICIPAL_REGULATIONS = "MUNICIPAL_REGULATIONS",
}

export interface DocumentCategoryMeta {
  id: DocumentCategory;
  nameAr: string;
  nameEn: string;
  decreeNumber: string;
  descriptionAr: string;
}

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, DocumentCategoryMeta> = {
  [DocumentCategory.VAT_LAW]: {
    id: DocumentCategory.VAT_LAW,
    nameAr: "قانون ضريبة القيمة المضافة",
    nameEn: "Value Added Tax (VAT) Law",
    decreeNumber: "المرسوم السلطاني رقم 121/2020",
    descriptionAr: "القواعد الأساسية لفرض ضريبة القيمة المضافة في سلطنة عُمان بنسبة 5%، الإعفاءات، والتسجيل.",
  },
  [DocumentCategory.LABOR_LAW]: {
    id: DocumentCategory.LABOR_LAW,
    nameAr: "قانون العمل العُماني الجديد",
    nameEn: "Oman New Labor Law",
    decreeNumber: "المرسوم السلطاني رقم 53/2023",
    descriptionAr: "تنظيم علاقات العمل، عقود التوظيف، ساعات العمل، ونسب التعمين الإلزامية للشركات.",
  },
  [DocumentCategory.EXECUTIVE_REGULATIONS]: {
    id: DocumentCategory.EXECUTIVE_REGULATIONS,
    nameAr: "اللوائح التنفيذية لضريبة القيمة المضافة",
    nameEn: "VAT Executive Regulations",
    decreeNumber: "القرار التنفيذي رقم 53/2021",
    descriptionAr: "الاشتراطات التفصيلية للفواتير الضريبية، الفحص الضريبي، وخصم ضريبة المدخلات.",
  },
  [DocumentCategory.COMMERCIAL_COMPANIES_LAW]: {
    id: DocumentCategory.COMMERCIAL_COMPANIES_LAW,
    nameAr: "قانون الشركات التجارية",
    nameEn: "Commercial Companies Law",
    decreeNumber: "المرسوم السلطاني رقم 18/2019",
    descriptionAr: "تأسيس المنشآت والشركات ذات المسؤولية المحدودة والشخص الواحد وحوكمتها.",
  },
  [DocumentCategory.INCOME_TAX_LAW]: {
    id: DocumentCategory.INCOME_TAX_LAW,
    nameAr: "قانون ضريبة الدخل",
    nameEn: "Income Tax Law",
    decreeNumber: "المرسوم السلطاني رقم 28/2009 وتعديلاته",
    descriptionAr: "الضريبة على أرباح الشركات والمنشآت والإقرارات السنوية والخصومات المعتمدة.",
  },
  [DocumentCategory.SOCIAL_PROTECTION_LAW]: {
    id: DocumentCategory.SOCIAL_PROTECTION_LAW,
    nameAr: "قانون الحماية الاجتماعية",
    nameEn: "Social Protection Law",
    decreeNumber: "المرسوم السلطاني رقم 52/2023",
    descriptionAr: "منظومة التأمين والاشتراكات الإلزامية للعاملين العمانيين وصناديق التقاعد الموحدة.",
  },
  [DocumentCategory.MUNICIPAL_REGULATIONS]: {
    id: DocumentCategory.MUNICIPAL_REGULATIONS,
    nameAr: "لوائح واشتراطات التراخيص البلدية",
    nameEn: "Municipal Licensing Regulations",
    decreeNumber: "قرارات وزارة الداخلية وبلدية مسقط",
    descriptionAr: "اشتراطات اللوحات التجارية، عقود الإيجار المعتمدة، والتراخيص البلدية للأنشطة.",
  },
};

export function getCategoryMeta(category: string): DocumentCategoryMeta {
  if (category in DOCUMENT_CATEGORIES) {
    return DOCUMENT_CATEGORIES[category as DocumentCategory];
  }
  return {
    id: DocumentCategory.VAT_LAW,
    nameAr: category,
    nameEn: category,
    decreeNumber: "لوائح تنظيمية",
    descriptionAr: "مستند تنظيمي",
  };
}
