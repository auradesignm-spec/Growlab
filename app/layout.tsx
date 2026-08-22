import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { dirForLocale, isLocale, type Locale } from "@/i18n/config";
import PwaRegister from "@/components/PwaRegister";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F8FA",
};

export const metadata: Metadata = {
  title: "Growlab",
  description: "سوق يربط التجار بالمسوّقين. كل بيعة تُقسم في دفتر مفتوح.",
  metadataBase: new URL("https://growlab.om"),
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Growlab",
    statusBarStyle: "default",
  },
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
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const app = (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Muscat">
      {children}
    </NextIntlClientProvider>
  );

  return (
    <html lang={locale} dir={dir} className={`${plexArabic.variable} ${plexMono.variable}`}>
      <body className="font-body antialiased">
        <PwaRegister />
        {clerkPublishableKey ? (
          <ClerkProvider
            publishableKey={clerkPublishableKey}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: "#111318",
                colorBackground: "#FFFFFF",
                colorText: "#111318",
                colorInputBackground: "#F7F8FA",
                colorInputText: "#111318",
                colorTextSecondary: "#5C6573",
                borderRadius: "24px",
                fontFamily: "var(--font-plex-arabic), sans-serif",
              },
              elements: {
                card: {
                  boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 16px 40px rgba(15,23,42,0.06)",
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
                  boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 16px 40px rgba(15,23,42,0.06)",
                  border: "1px solid rgba(17,19,24,0.08)",
                },
              },
            }}
          >
            {app}
          </ClerkProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
