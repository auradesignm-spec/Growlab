import { redirect } from "next/navigation";

export default function UsageSettingsPage() {
  redirect("/dashboard/settings?tab=usage");
}
