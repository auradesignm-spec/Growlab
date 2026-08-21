export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink py-9 text-onDarkSoft">
      <div className="container-wrap">
        <div className="tear tear-dark" />
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[13.5px]">
          <div className="font-display text-[17px] text-onDark">
            Growlab<span className="text-gold-soft">.</span> — شريك نمو رقمي
          </div>
          <div>© {year} Growlab. جميع الحقوق محفوظة.</div>
        </div>
      </div>
    </footer>
  );
}
