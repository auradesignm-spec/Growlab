/**
 * @file invoiceScorer.ts
 * @description Pure evaluation engine for Tax Invoice compliance based on the Executive Regulations
 * of the Oman Value Added Tax Law (Executive Decision No. 53/2021, Articles 67 & 68).
 */

/**
 * Compliance status classification for tax invoices.
 */
export enum InvoiceComplianceStatus {
  /**
   * Fully compliant invoice meeting all mandatory regulatory conditions (Score: 100).
   */
  COMPLIANT = "COMPLIANT",

  /**
   * Conditionally acceptable invoice missing secondary elements but retaining critical items (Score: 70-99).
   */
  WARNING = "WARNING",

  /**
   * Rejected or non-deductible invoice lacking critical items (TIN / Math) or failing minimum score (< 70).
   */
  NON_COMPLIANT = "NON_COMPLIANT",
}

/**
 * Extracted structural data flags from an automated vision or OCR invoice inspection.
 */
export interface InvoiceData {
  /**
   * Presence of the supplier's valid Omani Tax Identification Number (TIN).
   * Critical weighted element: 35 points (Article 67/2).
   */
  hasTIN: boolean;

  /**
   * Verification that the tax amount mathematically equals exactly 5% of taxable value.
   * Critical weighted element: 35 points (Article 67/8).
   */
  isMathCorrect: boolean;

  /**
   * Presence of the registered supplier's commercial or legal name.
   * Secondary element: 10 points (Article 67/1).
   */
  hasSupplierName: boolean;

  /**
   * Presence of invoice date or date of supply.
   * Secondary element: 10 points (Article 67/3).
   */
  hasDate: boolean;

  /**
   * Presence of a sequential unique tax invoice number.
   * Secondary element: 10 points (Article 67/4).
   */
  hasInvoiceNumber: boolean;
}

/**
 * Result structure of the invoice compliance evaluation.
 */
export interface InvoiceScore {
  /**
   * Weighted aggregate compliance score from 0 to 100.
   */
  totalScore: number;

  /**
   * Final compliance tier.
   */
  status: InvoiceComplianceStatus;

  /**
   * Strictly tailored actionable corrections for any missing fields.
   */
  actionableRecommendations: string[];

  /**
   * Detailed breakdown of earned points per inspected criterion.
   */
  breakdown: {
    hasTIN: number;
    isMathCorrect: number;
    hasSupplierName: number;
    hasDate: number;
    hasInvoiceNumber: number;
  };
}

/**
 * Evaluates the compliance of an invoice against Omani VAT Executive Regulations
 * (Executive Decision No. 53/2021, Articles 67 and 68).
 *
 * Scoring Weights:
 * - hasTIN: 35 points (Critical - mandatory for input tax deduction per Article 67)
 * - isMathCorrect: 35 points (Critical - 5% rate computation validity)
 * - hasSupplierName: 10 points
 * - hasDate: 10 points
 * - hasInvoiceNumber: 10 points
 *
 * Status Determination:
 * - COMPLIANT: 100 points.
 * - WARNING: 70 - 99 points (provided both critical items TIN and Math are satisfied).
 * - NON_COMPLIANT: Less than 70 points OR failure in either critical condition (hasTIN or isMathCorrect).
 *
 * @param {InvoiceData} extractedData - The verification flags extracted from the invoice.
 * @returns {InvoiceScore} Total score, status category, and actionable recommendations for missing items.
 * @throws {TypeError} If extractedData is invalid or contains non-boolean values.
 */
export function evaluateInvoiceCompliance(extractedData: InvoiceData): InvoiceScore {
  if (!extractedData || typeof extractedData !== "object") {
    throw new TypeError("Invalid extractedData: Expected a valid InvoiceData object.");
  }

  const { hasTIN, isMathCorrect, hasSupplierName, hasDate, hasInvoiceNumber } = extractedData;

  // Validate boolean flags strictly
  const fields: Array<keyof InvoiceData> = [
    "hasTIN",
    "isMathCorrect",
    "hasSupplierName",
    "hasDate",
    "hasInvoiceNumber",
  ];

  for (const field of fields) {
    if (typeof extractedData[field] !== "boolean") {
      throw new TypeError(`Invalid value for "${field}": Expected boolean, received ${typeof extractedData[field]}.`);
    }
  }

  let totalScore = 0;
  const actionableRecommendations: string[] = [];

  const breakdown = {
    hasTIN: 0,
    isMathCorrect: 0,
    hasSupplierName: 0,
    hasDate: 0,
    hasInvoiceNumber: 0,
  };

  // 1. Critical Criterion: Supplier TIN (35 pts)
  if (hasTIN) {
    totalScore += 35;
    breakdown.hasTIN = 35;
  } else {
    actionableRecommendations.push(
      "إضافة الرقم التعريفي الضريبي (TIN) للمورد: يلزم قانوناً ذكر الرقم الضريبي المكون من 10 أرقام؛ لا يحق لشركتك خصم ضريبة المدخلات بدون رقم ضريبي سليم (اللائحة التنفيذية - المادة 67)."
    );
  }

  // 2. Critical Criterion: 5% Math Correctness (35 pts)
  if (isMathCorrect) {
    totalScore += 35;
    breakdown.isMathCorrect = 35;
  } else {
    actionableRecommendations.push(
      "تصحيح الاحتساب الرياضي للضريبة بنسبة 5%: قيمة ضريبة القيمة المضافة غير مطابقة للحسبة النظامية (5% من القيمة الخاضعة للضريبة)، مما يعرض الفاتورة للرفض التدقيقي (اللائحة التنفيذية - المادة 68)."
    );
  }

  // 3. Secondary Criterion: Supplier Legal Name (10 pts)
  if (hasSupplierName) {
    totalScore += 10;
    breakdown.hasSupplierName = 10;
  } else {
    actionableRecommendations.push(
      "إدراج اسم المورد المسجل: يجب توضيح الاسم التجاري أو القانوني للمورد كما هو مقيد في السجل التجاري وجهاز الضرائب (اللائحة التنفيذية - المادة 67)."
    );
  }

  // 4. Secondary Criterion: Invoice / Supply Date (10 pts)
  if (hasDate) {
    totalScore += 10;
    breakdown.hasDate = 10;
  } else {
    actionableRecommendations.push(
      "تدوين تاريخ إصدار الفاتورة أو التوريد: التاريخ إلزامي لإثبات استحقاق الضريبة ضمن الربع الضريبي الصحيح (اللائحة التنفيذية - المادة 67)."
    );
  }

  // 5. Secondary Criterion: Sequential Invoice Number (10 pts)
  if (hasInvoiceNumber) {
    totalScore += 10;
    breakdown.hasInvoiceNumber = 10;
  } else {
    actionableRecommendations.push(
      "تضمين الرقم التسلسلي للفاتورة: يجب أن تحتوي الفاتورة على رقم تسلسلي تصاعدي فريد يميزها لغايات التدقيق المحاسبي (اللائحة التنفيذية - المادة 67)."
    );
  }

  // Determine compliance status
  let status: InvoiceComplianceStatus;

  if (totalScore === 100) {
    status = InvoiceComplianceStatus.COMPLIANT;
  } else if (!hasTIN || !isMathCorrect || totalScore < 70) {
    // Missing critical items immediately downgrades invoice to NON_COMPLIANT
    status = InvoiceComplianceStatus.NON_COMPLIANT;
  } else {
    // Score is between 70 and 99 with both critical items present
    status = InvoiceComplianceStatus.WARNING;
  }

  return {
    totalScore,
    status,
    actionableRecommendations,
    breakdown,
  };
}
