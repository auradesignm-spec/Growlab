export function KycPending({ title, lede }: { title: string; lede: string }) {
  return (
    <section className="px-5 py-16 sm:px-8">
      <p className="gl-eyebrow">KYC</p>
      <h2 className="mt-3 max-w-lg font-display text-display-md text-frost">{title}</h2>
      <p className="gl-lede mt-4">{lede}</p>
    </section>
  );
}

export function AccountBanned({ title, lede, reason }: { title: string; lede: string; reason?: string | null }) {
  return (
    <section className="px-5 py-16 sm:px-8">
      <p className="gl-eyebrow text-danger">Account</p>
      <h2 className="mt-3 max-w-lg font-display text-display-md text-frost">{title}</h2>
      <p className="gl-lede mt-4">{lede}</p>
      {reason && (
        <p className="mt-4 max-w-lg border border-danger/30 bg-danger/10 px-4 py-3 font-serif text-sm italic text-danger">
          {reason}
        </p>
      )}
    </section>
  );
}
