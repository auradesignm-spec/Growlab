/**
 * Shared paper chrome. Light page, ink type. No decorative blobs.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ background: "#F5F5F7", color: "#111318" }}>
      {children}
    </div>
  );
}
