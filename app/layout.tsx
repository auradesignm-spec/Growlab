import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { dirForLocale, isLocale, type Locale } from "@/i18n/config";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Growlab",
  description: "سوق يربط التجار بصنّاع المحتوى. كل بيعة تُقسم في دفتر مفتوح.",
  metadataBase: new URL("https://growlab.om"),
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeValue = await getLocale();
  const locale: Locale = isLocale(localeValue) ? localeValue : "ar";
  const messages = await getMessages();
  const dir = dirForLocale(locale);

  return (
    <html lang={locale} dir={dir} className={`${plexArabic.variable} ${plexMono.variable}`}>
      <body className="font-body antialiased">
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#111318",
              colorBackground: "#FFFFFF",
              colorText: "#111318",
              colorInputBackground: "#F4F5F7",
              colorInputText: "#111318",
              colorTextSecondary: "#5C6573",
              borderRadius: "24px",
              fontFamily: "var(--font-plex-arabic), sans-serif",
            },
            elements: {
              card: {
                boxShadow: "0 1px 2px rgba(17,19,24,0.06), 0 8px 24px rgba(17,19,24,0.04)",
                border: "1px solid rgba(17,19,24,0.08)",
              },
              formButtonPrimary: {
                boxShadow: "none",
                backgroundColor: "#111318",
                color: "#FFFFFF",
                borderRadius: "999px",
                "&:hover": { backgroundColor: "#000000" },
              },
              footerActionLink: { color: "#2563C4" },
              userButtonPopoverCard: {
                boxShadow: "0 1px 2px rgba(17,19,24,0.08)",
                border: "1px solid rgba(17,19,24,0.08)",
              },
            },
          }}
        >
          <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Muscat">
            {children}
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
