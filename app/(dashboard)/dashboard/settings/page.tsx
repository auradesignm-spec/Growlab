import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ENTER_HREF } from "@/lib/auth/paths";
import { loadAccountSettings } from "../settings-actions";
import SettingsClientHub from "./SettingsClientHub";

export const metadata: Metadata = {
  title: "إعدادات الحساب والمنشأة | Growlab Settings",
  description: "إدارة الحساب، الاشتراك والباقات، بيانات المنشأة، مؤشرات الامتثال وتفضيلات الذكاء الاصطناعي",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    redirect(ENTER_HREF);
  }

  const initialData = await loadAccountSettings();
  const activeTab = (searchParams.tab as any) || "profile";

  return <SettingsClientHub initialData={initialData} initialTab={activeTab} />;
}
