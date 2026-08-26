import AppShell from "@/components/AppShell";
import CloudMesh from "@/components/CloudMesh";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="relative isolate overflow-x-clip">
        <CloudMesh />
        <div className="relative z-10">{children}</div>
      </div>
    </AppShell>
  );
}
