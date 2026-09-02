export const NEED_SURVEY_KEY = "riyada.complianceSurvey.v1";

export function surveyIsDone(): boolean {
  try {
    return localStorage.getItem(NEED_SURVEY_KEY) === "done";
  } catch {
    return false;
  }
}

export function markSurveyDone() {
  try {
    localStorage.setItem(NEED_SURVEY_KEY, "done");
  } catch {
    /* ignore */
  }
}

export function resetSurvey() {
  try {
    localStorage.removeItem(NEED_SURVEY_KEY);
    localStorage.removeItem("riyada.survey.answers");
    localStorage.removeItem("riyada.survey.result");
  } catch {
    /* ignore */
  }
}

export type SectorType = "retail" | "contracting" | "services" | "industry" | "other";
export type YesNoUnknown = "yes" | "no" | "unknown";

export interface ComplianceSurveyAnswers {
  sector: SectorType | null;
  totalEmployees: number;
  omaniEmployees: number;
  knowsCrExpiry: "yes" | "unknown" | null;
  crExpiryDate?: string;
  isRegisteredTawteen: YesNoUnknown | null;
  hasEInvoicing: YesNoUnknown | null;
}

export interface ComplianceDiagnosticResult {
  score: number; // 0 to 100
  status: "green" | "yellow" | "red";
  statusLabelAr: string;
  statusLabelEn: string;
  statusDescriptionAr: string;
  statusDescriptionEn: string;
  
  // Omanisation breakdown
  currentOmanisationRate: number; // percentage e.g. 25%
  requiredOmanisationRate: number; // target percentage e.g. 35%
  missingOmaniCount: number;
  isOmanisationCompliant: boolean;
  
  // Potential Fine Estimation in OMR
  estimatedFineOmanisation: number;
  estimatedFineCr: number;
  estimatedFineTawteen: number;
  estimatedFineVat: number;
  totalEstimatedFine: number; // in OMR (ر.ع.)
  
  // Sector info
  sectorLabelAr: string;
  
  // Recommendations
  recommendations: Array<{
    id: string;
    priority: "high" | "medium" | "low";
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
  }>;
}

export const SECTOR_OPTIONS = [
  {
    id: "retail" as const,
    ar: "تجارة وتجزئة",
    en: "Retail & Commerce",
    targetOmanisation: 35,
    descAr: "محلات، سوبرماركت، توزيع، وتجارة إلكترونية",
    icon: "ShoppingBag",
  },
  {
    id: "contracting" as const,
    ar: "مقاولات وبناء",
    en: "Contracting & Construction",
    targetOmanisation: 20,
    descAr: "مقاولات بناء، تشييد، صيانة، وأعمال كهربائية",
    icon: "Hammer",
  },
  {
    id: "services" as const,
    ar: "خدمات واستشارات",
    en: "Services & Consulting",
    targetOmanisation: 30,
    descAr: "مطاعم، مقاهي، لوجستيات، استشارات، وتقنية",
    icon: "Briefcase",
  },
  {
    id: "industry" as const,
    ar: "صناعة وورش",
    en: "Industry & Workshops",
    targetOmanisation: 25,
    descAr: "مصانع، ورش حدادة ونجارة، ومشاغل إنتاج",
    icon: "Factory",
  },
  {
    id: "other" as const,
    ar: "نشاط آخر",
    en: "Other Activities",
    targetOmanisation: 25,
    descAr: "أنشطة زراعية، سياحية، أو مهنية حرة",
    icon: "Layers",
  },
];

export function getSectorTarget(sector: SectorType | null): number {
  const match = SECTOR_OPTIONS.find((s) => s.id === sector);
  return match ? match.targetOmanisation : 25;
}

export function generateComplianceDiagnostic(
  answers: ComplianceSurveyAnswers
): ComplianceDiagnosticResult {
  const sector = answers.sector || "retail";
  const sectorInfo = SECTOR_OPTIONS.find((s) => s.id === sector) || SECTOR_OPTIONS[0];
  const requiredRate = sectorInfo.targetOmanisation;
  
  const total = Math.max(0, answers.totalEmployees || 0);
  const omanis = Math.max(0, Math.min(total, answers.omaniEmployees || 0));
  
  const currentRate = total > 0 ? Math.round((omanis / total) * 100) : 100;
  const targetOmanisNeeded = total > 0 ? Math.ceil((requiredRate / 100) * total) : 0;
  const missingOmanis = Math.max(0, targetOmanisNeeded - omanis);
  const isOmanisationCompliant = total === 0 || currentRate >= requiredRate;

  // Fines calculation logic based on typical Omani Ministry of Labour and Tax Authority regulations
  // Non-compliance with Omanisation: ~200 OMR per month per missing citizen = ~2400 OMR/yr
  const estimatedFineOmanisation = missingOmanis > 0 ? missingOmanis * 600 : 0;
  
  // CR Expiry unknown or expired fine: 100 OMR - 300 OMR
  const estimatedFineCr = answers.knowsCrExpiry === "unknown" ? 250 : 0;
  
  // Tawteen / Social Security registration missing: 500 OMR
  const estimatedFineTawteen = answers.isRegisteredTawteen === "no" ? 500 : answers.isRegisteredTawteen === "unknown" ? 200 : 0;
  
  // VAT / E-invoicing missing: 500 OMR - 1,000 OMR
  const estimatedFineVat = answers.hasEInvoicing === "no" ? 750 : answers.hasEInvoicing === "unknown" ? 300 : 0;

  const totalEstimatedFine = estimatedFineOmanisation + estimatedFineCr + estimatedFineTawteen + estimatedFineVat;

  // Calculate compliance score (0 - 100)
  let score = 100;
  if (!isOmanisationCompliant) {
    const gap = requiredRate - currentRate;
    score -= Math.min(45, Math.round(gap * 1.5));
  }
  if (answers.knowsCrExpiry === "unknown") score -= 15;
  if (answers.isRegisteredTawteen === "no") score -= 20;
  if (answers.isRegisteredTawteen === "unknown") score -= 10;
  if (answers.hasEInvoicing === "no") score -= 20;
  if (answers.hasEInvoicing === "unknown") score -= 10;

  score = Math.max(15, Math.min(98, score));

  let status: "green" | "yellow" | "red" = "green";
  let statusLabelAr = "امتثال ممتاز";
  let statusLabelEn = "High Compliance";
  let statusDescriptionAr = "مؤسستك في منطقة الأمان التنظيمي مع مخاطر غرامات منخفضة جداً.";
  let statusDescriptionEn = "Your entity is in a safe regulatory zone with minimal fine risk.";

  if (score < 50 || totalEstimatedFine >= 1200) {
    status = "red";
    statusLabelAr = "مخاطر غرامات عالية";
    statusLabelEn = "High Fine Risk";
    statusDescriptionAr = "توجد فجوات امتثال حرجة قد تعرض مؤسستك لغرامات مالية فورية أو إيقاف المعاملات.";
    statusDescriptionEn = "Critical compliance gaps detected that may expose you to immediate fines.";
  } else if (score < 80 || totalEstimatedFine > 0) {
    status = "yellow";
    statusLabelAr = "يحتاج معالجة استباقية";
    statusLabelEn = "Action Required";
    statusDescriptionAr = "وضعك جيد إجمالاً، لكن توجد بعض المتطلبات غير المكتملة التي تستوجب التدخل لتجنب المخالفات.";
    statusDescriptionEn = "Overall reasonable, but pending requirements need attention to avoid penalties.";
  }

  // Recommendations tailored
  const recommendations: ComplianceDiagnosticResult["recommendations"] = [];

  if (missingOmanis > 0) {
    recommendations.push({
      id: "omanisation",
      priority: "high",
      titleAr: `تعديل نسبة التعمين (مطلوب تعيين ${missingOmanis} موظف عُماني)`,
      titleEn: `Adjust Omanisation (Hire ${missingOmanis} Omani staff)`,
      descAr: `نسبة التعمين الحالية (${currentRate}%) أقل من الحد الإلزامي لنشاط ${sectorInfo.ar} (${requiredRate}%). تعيين الكوادر العمانية يحميك من حظر تصاريح العمل وغرامات تصل لـ ${estimatedFineOmanisation} ر.ع.`,
      descEn: `Current rate (${currentRate}%) is below mandatory target (${requiredRate}%). Hiring Omanis protects you from blockages and fines.`,
    });
  } else {
    recommendations.push({
      id: "omanisation_ok",
      priority: "low",
      titleAr: `نسبة التعمين ممتازة ومطابقة للمعايير (${currentRate}%)`,
      titleEn: `Omanisation rate compliant (${currentRate}%)`,
      descAr: `أنت محقق للنسبة الإلزامية لنشاط ${sectorInfo.ar} (${requiredRate}%). احرص على تجديد عقود العمل في التأمينات.`,
      descEn: `You meet the mandatory quota. Keep social security contracts up to date.`,
    });
  }

  if (answers.knowsCrExpiry === "unknown") {
    recommendations.push({
      id: "cr_check",
      priority: "high",
      titleAr: "تدقيق تاريخ انتهاء السجل التجاري والتراخيص البلدية",
      titleEn: "Audit Commercial Registry & Municipal Permits",
      descAr: "التأخر في تجديد السجل ورخص البلدية يترتب عليه غرامات شهرية متراكمة وتوقف السجل في بوابة 'استثمر بسهولة'.",
      descEn: "Late renewals incur compounding fines and suspension in Invest Easy.",
    });
  }

  if (answers.isRegisteredTawteen !== "yes") {
    recommendations.push({
      id: "tawteen_reg",
      priority: "medium",
      titleAr: "توثيق بيانات المنشأة في منصة توطين وصندوق الحماية الاجتماعية",
      titleEn: "Register on Tawteen & Social Protection Fund",
      descAr: "التسجيل يضمن توثيق نسب التعمين بدقة ويجنبك غرامات عدم تسجيل القوى العاملة الوطنية.",
      descEn: "Registration ensures official tracking and avoids failure-to-register fines.",
    });
  }

  if (answers.hasEInvoicing !== "yes") {
    recommendations.push({
      id: "einvoicing",
      priority: "medium",
      titleAr: "تفعيل نظام الفوترة الإلكترونية المتوافق مع جهاز الضرائب",
      titleEn: "Enable Tax Authority E-Invoicing",
      descAr: "إصدار فواتير ضريبية نظامية يضمن الامتثال لضريبة القيمة المضافة (VAT) ويتفادى غرامات الفحص الضريبي.",
      descEn: "Issuing compliant tax invoices prevents VAT audit penalties.",
    });
  }

  return {
    score,
    status,
    statusLabelAr,
    statusLabelEn,
    statusDescriptionAr,
    statusDescriptionEn,
    currentOmanisationRate: currentRate,
    requiredOmanisationRate: requiredRate,
    missingOmaniCount: missingOmanis,
    isOmanisationCompliant,
    estimatedFineOmanisation,
    estimatedFineCr,
    estimatedFineTawteen,
    estimatedFineVat,
    totalEstimatedFine,
    sectorLabelAr: sectorInfo.ar,
    recommendations,
  };
}

export function saveQuizResult(answers: ComplianceSurveyAnswers, result: ComplianceDiagnosticResult) {
  try {
    localStorage.setItem("riyada.survey.answers", JSON.stringify(answers));
    localStorage.setItem("riyada.survey.result", JSON.stringify(result));
    localStorage.setItem(NEED_SURVEY_KEY, "done");
  } catch {
    /* ignore */
  }
}

export function getSavedQuizData(): {
  answers: ComplianceSurveyAnswers | null;
  result: ComplianceDiagnosticResult | null;
} {
  try {
    const rawAnswers = localStorage.getItem("riyada.survey.answers");
    const rawResult = localStorage.getItem("riyada.survey.result");
    return {
      answers: rawAnswers ? JSON.parse(rawAnswers) : null,
      result: rawResult ? JSON.parse(rawResult) : null,
    };
  } catch {
    return { answers: null, result: null };
  }
}
