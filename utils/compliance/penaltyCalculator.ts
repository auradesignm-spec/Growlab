/**
 * @file penaltyCalculator.ts
 * @description Core calculation engine for Omani VAT penalties and delay interest.
 * Implements statutory penalty logic based on Oman Royal Decree No. 121/2020 (VAT Law).
 */

/**
 * Enumeration of recognized tax compliance violation categories under Omani VAT Law.
 */
export enum TaxViolationType {
  /**
   * Late filing of tax return (إقرار ضريبة القيمة المضافة)
   * Governed by Article (100) of Royal Decree 121/2020.
   */
  LATE_FILING = "LATE_FILING",

  /**
   * Delay in settling due tax amounts (تأخير سداد الضريبة المستحقة)
   * Governed by Article (51) of Royal Decree 121/2020.
   */
  LATE_PAYMENT = "LATE_PAYMENT",

  /**
   * Failure to register for VAT within statutory deadlines (التخلف عن التسجيل الضريبي الإلزامي)
   * Governed by Article (101) of Royal Decree 121/2020.
   */
  NON_REGISTRATION = "NON_REGISTRATION",
}

/**
 * Parameters required to calculate statutory VAT penalty and late interest.
 */
export interface PenaltyParams {
  /**
   * Unpaid or overdue tax balance in Omani Rials (OMR).
   * Must be a non-negative number.
   */
  taxAmount: number;

  /**
   * Duration of delay in months.
   * Under Article 51, any fraction of a month is counted as a full month.
   */
  delayMonths: number;

  /**
   * The specific category of violation.
   */
  violationType: TaxViolationType;
}

/**
 * Breakdown of the calculated penalty result.
 */
export interface PenaltyResult {
  /**
   * Fixed administrative statutory fine in OMR.
   */
  baseFine: number;

  /**
   * Cumulative delay interest calculated on the unpaid tax amount in OMR.
   */
  interestAmount: number;

  /**
   * Total liability (baseFine + interestAmount) in OMR.
   */
  totalPenalty: number;

  /**
   * Detailed statutory reference and explanation in Arabic & English citing RD 121/2020.
   */
  legalCitation: string;
}

/**
 * Computes statutory tax penalties and monthly late payment charges according to
 * the Sultanate of Oman Value Added Tax Law (Royal Decree No. 121/2020).
 *
 * Statutory References:
 * - Article (100): Administrative fine of not less than 500 OMR and not exceeding 5,000 OMR
 *   for failure to submit the tax return within the statutory period (Default base fine: 500 OMR).
 * - Article (101): Administrative fine of not less than 1,000 OMR up to 10,000 OMR
 *   for failure to register for tax within the specified period (Default base fine: 5,000 OMR).
 * - Article (51): Late payment interest rate of 1% per month (or fraction of a month)
 *   accruing on the unpaid tax liability starting from the day following the statutory due date.
 *
 * @param {PenaltyParams} params - The calculation inputs.
 * @returns {PenaltyResult} Structured penalty and interest calculation breakdown.
 * @throws {TypeError} If input values are non-numeric or violationType is invalid.
 * @throws {RangeError} If taxAmount or delayMonths is negative.
 */
export function calculateTaxPenalty(params: PenaltyParams): PenaltyResult {
  // 1. Strict input validation
  if (!params || typeof params !== "object") {
    throw new TypeError("Invalid parameters: Expected a non-null PenaltyParams object.");
  }

  const { taxAmount, delayMonths, violationType } = params;

  if (typeof taxAmount !== "number" || !Number.isFinite(taxAmount)) {
    throw new TypeError(`Invalid taxAmount: Expected a finite number, received ${typeof taxAmount}.`);
  }

  if (taxAmount < 0) {
    throw new RangeError(`Invalid taxAmount: Value cannot be negative (received ${taxAmount} OMR).`);
  }

  if (typeof delayMonths !== "number" || !Number.isFinite(delayMonths)) {
    throw new TypeError(`Invalid delayMonths: Expected a finite number, received ${typeof delayMonths}.`);
  }

  if (delayMonths < 0) {
    throw new RangeError(`Invalid delayMonths: Value cannot be negative (received ${delayMonths}).`);
  }

  if (!Object.values(TaxViolationType).includes(violationType)) {
    throw new TypeError(`Invalid violationType: Unknown type "${violationType}".`);
  }

  // Under Article 51, any fraction of a month is assessed as a whole month
  const effectiveMonths = delayMonths > 0 ? Math.ceil(delayMonths) : 0;

  // 2. Determine base administrative fine per violation type
  let baseFine = 0;
  let citationSection = "";

  switch (violationType) {
    case TaxViolationType.LATE_FILING:
      baseFine = 500;
      citationSection = "المادة (100) من المرسوم السلطاني 121/2020: غرامة إدارية ثابتة قدرها 500 ر.ع لعدم تقديم الإقرار في الموعد المحدد";
      break;

    case TaxViolationType.NON_REGISTRATION:
      baseFine = 5000;
      citationSection = "المادة (101) من المرسوم السلطاني 121/2020: غرامة إدارية قدرها 5,000 ر.ع لعدم التسجيل في ضريبة القيمة المضافة ضمن المهل القانونية";
      break;

    case TaxViolationType.LATE_PAYMENT:
      baseFine = 0;
      citationSection = "المادة (51) من المرسوم السلطاني 121/2020: لا تُفرض غرامة تسجيل ثابتة، وإنما تُحتسب فائدة تأخير شهرية بنسبة 1%";
      break;
  }

  // 3. Compute 1% per month delay interest (Article 51) on unpaid tax amount
  // 1% per month = taxAmount * 0.01 * effectiveMonths
  const rawInterest = taxAmount * 0.01 * effectiveMonths;
  // Round to 3 decimal places (Standard Omani Baisa precision)
  const interestAmount = Math.round(rawInterest * 1000) / 1000;
  const totalPenalty = Math.round((baseFine + interestAmount) * 1000) / 1000;

  // 4. Construct comprehensive legal citation note
  const interestNote = effectiveMonths > 0 && taxAmount > 0
    ? ` + ضريبة إضافية بنسبة 1% شهرياً بموجب المادة (51) بواقع ${interestAmount.toFixed(3)} ر.ع عن تأخير قدره ${effectiveMonths} شهر`
    : "";

  const legalCitation = `${citationSection}${interestNote}. الإجمالي المستحق: ${totalPenalty.toFixed(3)} ر.ع.`;

  return {
    baseFine,
    interestAmount,
    totalPenalty,
    legalCitation,
  };
}
