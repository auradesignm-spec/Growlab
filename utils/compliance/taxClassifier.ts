/**
 * @file taxClassifier.ts
 * @description Product and service VAT rate classification engine according to the Sultanate of Oman
 * Value Added Tax Law (Royal Decree No. 121/2020) and Executive Decision No. 53/2021.
 */

/**
 * Recognized VAT treatments under Omani Tax Authority regulations.
 */
export enum TaxTreatment {
  /**
   * Standard Rate: 5% VAT applied; Input tax is fully deductible.
   * Governed by Article (34) & Article (40) of Royal Decree 121/2020.
   */
  STANDARD = "STANDARD",

  /**
   * Zero Rate: 0% VAT applied; Input tax is fully deductible and refundable.
   * Governed by Articles (51-54) of Royal Decree 121/2020.
   */
  ZERO_RATED = "ZERO_RATED",

  /**
   * Exempt: No VAT applied; Input tax is strictly NON-DEDUCTIBLE.
   * Governed by Article (47) of Royal Decree 121/2020.
   */
  EXEMPT = "EXEMPT",
}

/**
 * Detailed tax classification record for a given product or service.
 */
export interface TaxCategory {
  /**
   * Original keyword queried.
   */
  keyword: string;

  /**
   * Matched dictionary entry or canonical descriptor.
   */
  matchedItem: string;

  /**
   * Statutory tax treatment category.
   */
  category: TaxTreatment;

  /**
   * Numeric tax rate (0.05 for standard 5%, 0 for zero-rated and exempt).
   */
  rate: number;

  /**
   * Localized display string of the tax rate (e.g., "5%", "0%", "معفى (0%)").
   */
  rateDisplay: string;

  /**
   * Whether the business can claim and deduct input VAT incurred on purchases related to this item.
   * True for Standard (5%) and Zero-Rated (0%); False for Exempt items (Article 47).
   */
  isInputTaxDeductible: boolean;

  /**
   * Legal and procedural note explaining the VAT treatment and accounting impact.
   */
  officialLegalNote: string;

  /**
   * Legal citation of Omani VAT decrees or ministerial decisions.
   */
  legalCitation: string;
}

/**
 * Internal mapping definition for predefined commodities and services in Oman.
 */
interface TaxDefinition {
  canonicalName: string;
  category: TaxTreatment;
  rate: number;
  rateDisplay: string;
  isInputTaxDeductible: boolean;
  officialLegalNote: string;
  legalCitation: string;
  aliases: string[];
}

/**
 * Predefined dictionary of items based on Royal Decree 121/2020,
 * Executive Regulations (Decision 53/2021), and the Oman Tax Authority basic food commodities schedule.
 */
const OMANI_TAX_DICTIONARY: TaxDefinition[] = [
  // ---------------- ZERO-RATED ITEMS (0% with Input Deduction) ----------------
  {
    canonicalName: "أدوية ومستحضرات طبية",
    category: TaxTreatment.ZERO_RATED,
    rate: 0,
    rateDisplay: "0% (خاضع للنسبة الصفرية)",
    isInputTaxDeductible: true,
    officialLegalNote: "الأدوية والمستلزمات الطبية المعتمدة بقرار وزاري تخضع لنسبة الصفر (0%)؛ يحق للمنشأة استرداد وخصم ضريبة المدخلات بالكامل.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (54) البند (2) وقرار رئيس جهاز الضرائب رقم 59/2021",
    aliases: ["أدوية", "ادوية", "دواء", "علاج", "مستحضرات طبية", "صيدلية", "medical drugs", "medicine", "pharmaceuticals"],
  },
  {
    canonicalName: "معدات وتجهيزات طبية",
    category: TaxTreatment.ZERO_RATED,
    rate: 0,
    rateDisplay: "0% (خاضع للنسبة الصفرية)",
    isInputTaxDeductible: true,
    officialLegalNote: "المعدات والأجهزة الطبية المخصصة للاستخدام البشري المعتمدة من وزارة الصحة تخضع لنسبة الصفر مع حق استرداد ضريبة المدخلات.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (54) واللائحة التنفيذية - المادة (93)",
    aliases: ["معدات طبية", "اجهزة طبية", "أجهزة طبية", "مستلزمات طبية", "medical equipment"],
  },
  {
    canonicalName: "ذهب استثماري وسبائك ومعادن ثمينة",
    category: TaxTreatment.ZERO_RATED,
    rate: 0,
    rateDisplay: "0% (خاضع للنسبة الصفرية)",
    isInputTaxDeductible: true,
    officialLegalNote: "الذهب والفضة والبلاتين الاستثماري بنقاء لا يقل عن 99% والمستخدم لأغراض الاستثمار المالي يخضع لنسبة الصفر (0%).",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (54) البند (4) واللائحة التنفيذية - المادة (94)",
    aliases: ["ذهب استثماري", "سبائك ذهب", "سبيكة ذهب", "ذهب نقي", "فضة استثمارية", "بلاتين استثماري", "investment gold", "gold bullion"],
  },
  {
    canonicalName: "سلع غذائية أساسية (قائمة الـ 488 سلعة)",
    category: TaxTreatment.ZERO_RATED,
    rate: 0,
    rateDisplay: "0% (خاضع للنسبة الصفرية)",
    isInputTaxDeductible: true,
    officialLegalNote: "السلع الغذائية الأساسية الواردة بقائمة جهاز الضرائب (أرز، طحين، سكر، حليب، شاي، أسماك ولحوم طازجة، تمور عُمانية) خاضعة لنسبة الصفر.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (54) وقرار جهاز الضرائب رقم 2/2021 وتعديلاته",
    aliases: [
      "تمور", "تمور عمانية", "أرز", "ارز", "حليب طازج", "حليب", "لحوم طازجة", "لحم", 
      "اسماك طازجة", "سمك", "طحين", "دقيق", "سكر", "شاي", "زيت طعام", "زيت نباتي",
      "بيض", "مياه شرب معبأة", "خضروات طازجة", "فواكه طازجة", "basic food", "dates", "milk", "rice"
    ],
  },
  {
    canonicalName: "خدمات التصدير خارج دول الاتفاقية",
    category: TaxTreatment.ZERO_RATED,
    rate: 0,
    rateDisplay: "0% (خاضع للنسبة الصفرية)",
    isInputTaxDeductible: true,
    officialLegalNote: "تصدير السلع والخدمات إلى خارج دول مجلس التعاون يخضع لنسبة الصفر دعماً للصادرات العُمانية مع الاحتفاظ بحق استرداد الضريبة.",
    legalCitation: "المرسوم السلطاني 121/2020 - المواد (51-53)",
    aliases: ["تصدير", "صادرات", "خدمات تصدير", "تصدير سلع", "export", "exports"],
  },
  {
    canonicalName: "خدمات النقل الدولي للركاب والبضائع",
    category: TaxTreatment.ZERO_RATED,
    rate: 0,
    rateDisplay: "0% (خاضع للنسبة الصفرية)",
    isInputTaxDeductible: true,
    officialLegalNote: "النقل الدولي للركاب والبضائع وتوريد وسائل النقل الدولية المرخصة يخضع لنسبة الصفر.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (54) البند (3)",
    aliases: ["نقل دولي", "شحن دولي", "طيران دولي", "شحن بحري دولي", "international transport"],
  },

  // ---------------- EXEMPT ITEMS (Exempt from VAT, No Input Deduction) ----------------
  {
    canonicalName: "تأجير العقارات السكنية",
    category: TaxTreatment.EXEMPT,
    rate: 0,
    rateDisplay: "معفى (0%)",
    isInputTaxDeductible: false,
    officialLegalNote: "تأجير العقارات لغايات السكن معفى من ضريبة القيمة المضافة؛ لا تُفرض ضريبة مخرجات، وفي المقابل لا يجوز استرداد أو خصم ضريبة المدخلات المتعلقة بها.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (47) البند (3) واللائحة التنفيذية - المادة (79)",
    aliases: [
      "تأجير عقارات سكنية", "تاجير عقارات سكنية", "ايجار سكني", "إيجار سكني", 
      "شقة سكنية", "فيلا سكنية", "ايجار شقق", "residential rent", "residential lease"
    ],
  },
  {
    canonicalName: "خدمات النقل المحلي للركاب",
    category: TaxTreatment.EXEMPT,
    rate: 0,
    rateDisplay: "معفى (0%)",
    isInputTaxDeductible: false,
    officialLegalNote: "نقل الركاب المحلي داخل سلطنة عُمان (الحافلات، سيارات الأجرة) معفى من الضريبة؛ لا يحق للناقل استرداد ضريبة مدخلات الوقود أو الصيانة.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (47) البند (4) واللائحة التنفيذية - المادة (80)",
    aliases: ["نقل محلي", "نقل ركاب محلي", "مواصلات داخلية", "تاكسي", "اجرة", "باصات محلية", "local transport", "passenger transport"],
  },
  {
    canonicalName: "الخدمات المالية والمصرفية الأساسية",
    category: TaxTreatment.EXEMPT,
    rate: 0,
    rateDisplay: "معفى (0%)",
    isInputTaxDeductible: false,
    officialLegalNote: "الخدمات المالية المصرفية التي تقدم مقابل هوامش ربح أو فوائد (القروض، الودائع، العملات) معفاة من الضريبة، باستثناء الخدمات مقابل رسوم صريحة.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (47) البند (1) واللائحة التنفيذية - المادة (77)",
    aliases: ["خدمات مالية", "فوائد بنكية", "قروض", "تمويل مصرفي", "تحويل عملات", "financial services", "banking loans"],
  },
  {
    canonicalName: "خدمات الرعاية الصحية والتعليم الأساسي",
    category: TaxTreatment.EXEMPT,
    rate: 0,
    rateDisplay: "معفى (0%)",
    isInputTaxDeductible: false,
    officialLegalNote: "خدمات الرعاية الصحية المؤهلة والتعليم الحكومي والخاص المعتمد معفاة من الضريبة وفق الضوابط المحددة باللائحة.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (47) البندين (2 و 5)",
    aliases: ["رعاية صحية", "خدمات طبية علاجية", "تعليم", "مدارس", "جامعات معتمدة", "education", "healthcare"],
  },
  {
    canonicalName: "الأراضي الفضاء غير المطورة",
    category: TaxTreatment.EXEMPT,
    rate: 0,
    rateDisplay: "معفى (0%)",
    isInputTaxDeductible: false,
    officialLegalNote: "توريد الأراضي الفضاء غير المطورة (البيضاء) معفى من ضريبة القيمة المضافة.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (47) البند (3) واللائحة التنفيذية - المادة (78)",
    aliases: ["اراضي فضاء", "أراضي فضاء", "أرض بيضاء", "ارض فضاء", "bare land", "undeveloped land"],
  },
];

/**
 * Normalizes Arabic text for tolerant keyword matching:
 * Removes tashkeel/diacritics, normalizes alefs and taa-marbuta, and strips redundant punctuation.
 */
function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Normalize Alefs (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, "ا")
    // Normalize Taa Marbuta and Haa (ة -> ه)
    .replace(/ة/g, "ه")
    // Normalize Yaa (ى -> ي)
    .replace(/ى/g, "ي")
    // Strip multi-spaces
    .replace(/\s+/g, " ");
}

/**
 * Retrieves the VAT classification, tax rate, input deductibility, and legal citation
 * for any given commercial product or service keyword in the Omani market.
 *
 * Treatment Rules:
 * - Zero-Rated (0%): Basic foodstuffs, human medicines, medical equipment, investment gold (RD 121/2020 Art. 54). Input tax is DEDUCTIBLE.
 * - Exempt: Residential rent, local passenger transport, basic financial services, bare land (RD 121/2020 Art. 47). Input tax is NON-DEDUCTIBLE.
 * - Standard (5%): Default fallback for all standard commercial supplies (RD 121/2020 Art. 34). Input tax is DEDUCTIBLE.
 *
 * @param {string} keyword - Name or query string of the product/service (Arabic or English).
 * @returns {TaxCategory} Detailed statutory classification and deductibility metadata.
 * @throws {TypeError} If keyword is null, undefined, or not a string.
 */
export function getTaxClassification(keyword: string): TaxCategory {
  if (typeof keyword !== "string") {
    throw new TypeError(`Invalid keyword: Expected a string, received ${typeof keyword}.`);
  }

  const cleanKeyword = keyword.trim();
  if (cleanKeyword.length === 0) {
    // Empty keyword defaults cleanly to Standard 5%
    return createStandardDefault(cleanKeyword);
  }

  const normalizedInput = normalizeText(cleanKeyword);

  // Search in predefined dictionary
  for (const entry of OMANI_TAX_DICTIONARY) {
    // Check direct aliases
    const matchedAlias = entry.aliases.find((alias) => {
      const normalizedAlias = normalizeText(alias);
      return (
        normalizedInput === normalizedAlias ||
        normalizedInput.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedInput)
      );
    });

    if (matchedAlias) {
      return {
        keyword: cleanKeyword,
        matchedItem: entry.canonicalName,
        category: entry.category,
        rate: entry.rate,
        rateDisplay: entry.rateDisplay,
        isInputTaxDeductible: entry.isInputTaxDeductible,
        officialLegalNote: entry.officialLegalNote,
        legalCitation: entry.legalCitation,
      };
    }
  }

  // Fallback to Standard 5% Commercial Rate
  return createStandardDefault(cleanKeyword);
}

/**
 * Helper to construct the default Standard (5%) VAT response.
 */
function createStandardDefault(keyword: string): TaxCategory {
  return {
    keyword,
    matchedItem: "سلع وخدمات تجارية عامة خاضعة للنسبة القياسية",
    category: TaxTreatment.STANDARD,
    rate: 0.05,
    rateDisplay: "5% (النسبة الأساسية القياسية)",
    isInputTaxDeductible: true,
    officialLegalNote: "سلعة/خدمة تجارية عامة خاضعة للنسبة القياسية 5%؛ يحق للمنشأة خصم ضريبة المدخلات المدفوعة للموردين عند تقديم الإقرار الضريبي.",
    legalCitation: "المرسوم السلطاني 121/2020 - المادة (34) والمادة (40)",
  };
}
