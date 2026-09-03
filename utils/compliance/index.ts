/**
 * @file index.ts
 * @description Central barrel export for the Omani Financial & Tax Compliance Engine ("مساعد ريادة").
 * Framework-agnostic pure TypeScript utilities with zero external runtime dependencies.
 */

// 1. Penalty Calculation Algorithm
export {
  calculateTaxPenalty,
  TaxViolationType,
  type PenaltyParams,
  type PenaltyResult,
} from "./penaltyCalculator";

// 2. Invoice Scoring & Evaluation Algorithm
export {
  evaluateInvoiceCompliance,
  InvoiceComplianceStatus,
  type InvoiceData,
  type InvoiceScore,
} from "./invoiceScorer";

// 3. Tax Classification Logic
export {
  getTaxClassification,
  TaxTreatment,
  type TaxCategory,
} from "./taxClassifier";
