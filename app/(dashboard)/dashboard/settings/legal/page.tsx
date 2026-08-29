import { redirect } from "next/navigation";

export default function LegalSettingsPage() {
  redirect("/dashboard/settings?tab=legal");
}
