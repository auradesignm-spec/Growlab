import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { enterHref, SIGN_IN_HREF } from "@/lib/auth/paths";

export default async function Footer() {
  const year = new Date().getFullYear();
  const t = await getTranslations("nav");
  const footer = await getTranslations("marketing.footer");

  const product = [
    { href: "/#how", label: t("method") },
    { href: "/#proof", label: t("proof") },
    { href: "/#pricing", label: t("pricing") },
    { href: "/#faq", label: t("faq") },
  ];
  const account = [
    { href: enterHref("merchant"), label: t("startEarning") },
    { href: SIGN_IN_HREF, label: t("signIn") },
    { href: "/dashboard", label: t("dashboard") },
  ];
  const legal = [
    { href: "/legal/terms", label: footer("terms") },
    { href: "/legal/privacy", label: footer("privacy") },
    { href: "/legal/merchant", label: footer("merchantTerms") },
  ];

  return (
    <footer className="relative mt-8 bg-[#111318] text-white md:mt-4">
      <div className="mx-auto max-w-wrap px-5 pb-10 pt-10 sm:px-8 md:pb-12 md:pt-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="text-[17px] font-semibold text-white" aria-label={t("homeAria")}>
              Growlab
            </Link>
            <p className="mt-3 max-w-sm text-[15px] leading-6 text-white/75">{footer("lede")}</p>
          </div>
          <FooterCol title={footer("colProduct")} links={product} />
          <FooterCol title={footer("colAccount")} links={account} />
          <FooterCol title={footer("colLegal")} links={legal} />
        </div>
        <p className="mt-10 border-t border-white/15 pt-5 text-[13px] leading-6 text-white/55">
          © {year} Growlab. {footer("rights")}
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-[13px] font-semibold text-white/55">{title}</p>
      <ul className="mt-3 space-y-0.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center text-[15px] leading-6 text-white/85"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
