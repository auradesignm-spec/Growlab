/** Shared page chrome. Marketing mesh lives in the marketing layout. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-screen text-frost">{children}</div>;
}
