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
    <footer className="relative mt-4 border-t border-line pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-12">
      <div className="mx-auto max-w-wrap px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-[16px] font-semibold text-frost" aria-label={t("homeAria")}>
              Growlab
            </Link>
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-frost-dim">{footer("lede")}</p>
          </div>
          <FooterCol title={footer("colProduct")} links={product} />
          <FooterCol title={footer("colAccount")} links={account} />
          <FooterCol title={footer("colLegal")} links={legal} />
        </div>
        <p className="mt-12 border-t border-line pt-6 text-[13px] leading-relaxed text-frost-faint">
          © {year} Growlab. {footer("rights")}
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-[13px] font-semibold text-frost">{title}</p>
      <ul className="mt-3 space-y-0.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center text-[14px] text-frost-dim transition-colors duration-150 hover:text-frost"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
