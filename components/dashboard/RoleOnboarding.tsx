import StoreBriefSurvey from "@/components/dashboard/StoreBriefSurvey";

/** Public registration is merchant-only. Buyer→marketer happens via share-claim after purchase. */
export default function RoleOnboarding({ initialRole: _initialRole }: { readonly initialRole?: "merchant" | "creator" }) {
  return <StoreBriefSurvey />;
}
