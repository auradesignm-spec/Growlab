/**
 * Shared dashboard primitives used by merchant, creator, and admin views.
 */
export function TableShell({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-start">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-start text-[12px] text-frost-dim">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-[14px] text-frost-dim">{text}</p>
  );
}

export function StatusPill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-medium ${
        ok ? "bg-ok/15 text-ok" : "bg-danger/10 text-danger"
      }`}
    >
      {children}
    </span>
  );
}

export function TierPill({ tier, size = "sm" }: { tier: string; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "px-3 py-1 text-[12px]" : "px-2 py-0.5 text-[12px]";
  const toneClass = tier === "ELITE" ? "border-line text-frost" : "border-line text-frost-dim";
  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClass} ${toneClass}`}>{tier}</span>
  );
}

export function Metric({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="gl-tile px-4 py-4">
      <p className="text-[12px] text-frost-dim">{label}</p>
      <p className={`mt-1 font-mono text-base font-medium ${warn ? "text-danger" : "text-frost"}`}>{value}</p>
    </div>
  );
}
