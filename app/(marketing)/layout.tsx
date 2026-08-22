import AppShell from "@/components/AppShell";
import CloudMesh from "@/components/CloudMesh";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="relative">
        <CloudMesh />
        {children}
      </div>
    </AppShell>
  );
}
