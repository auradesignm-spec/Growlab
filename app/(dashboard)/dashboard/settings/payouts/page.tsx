import { redirect } from "next/navigation";

export default function PayoutsSettingsPage() {
  redirect("/dashboard/settings?tab=payouts");
}
