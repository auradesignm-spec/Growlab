export default function Footer() {
  return (
    <footer className="bg-ink py-9 text-onDarkSoft">
      <div className="mx-auto max-w-wrap px-6">
        <div className="tear tear-dark" />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-[13.5px]">
          <div className="font-display text-[17px] text-onDark">
            Growlab<span style={{ color: "#E7CFA0" }}>.</span> — شريك نمو رقمي
          </div>
          <div>© 2026 Growlab. جميع الحقوق محفوظة.</div>
        </div>
      </div>
    </footer>
  );
}
