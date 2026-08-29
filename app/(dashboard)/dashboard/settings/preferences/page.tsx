import { redirect } from "next/navigation";

export default function PreferencesSettingsPage() {
  redirect("/dashboard/settings?tab=preferences");
}
