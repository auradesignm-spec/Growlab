/**
 * Smoke checklist for merchant onboarding path.
 * Run: npm run smoke:onboarding
 * Does not hit the network — documents the expected flow for QA.
 */
const steps = [
  "1. /enter → sign-up (merchant) → /dashboard?role=merchant",
  "2. ProfileDetailsForm completes first/last/phone/email",
  "3. RoleOnboarding claimRole → MerchantProfile verificationStatus=unsubmitted",
  "4. MerchantKycForm submit → pending → admin approve → verified",
  "5. /dashboard/store/edit?fresh=1 → Odoo Start Now → config → build → publish",
  "6. /dashboard/products/new → product + auto draft PerformanceCampaign",
  "7. /dashboard?tab=campaign → activate (wallet ≥ 5 OMR)",
  "8. Buyer COD /m/[slug] → order → share claim → fulfill → PerformanceEarn + wallet debit",
];

console.log("Growlab onboarding smoke checklist\n");
for (const s of steps) console.log(s);
console.log("\nOK — verify manually or with agent-browser against localhost.");
process.exit(0);
