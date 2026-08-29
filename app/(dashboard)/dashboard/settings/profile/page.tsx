import { redirect } from "next/navigation";

export default function ProfileSettingsPage() {
  redirect("/dashboard/settings?tab=profile");
}
