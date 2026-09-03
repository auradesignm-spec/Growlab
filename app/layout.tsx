import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal, IBM_Plex_Sans_Arabic, IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { dirForLocale, isLocale, type Locale } from "@/i18n/config";
import PwaRegister from "@/components/PwaRegister";
import FloatingAssistantChat from "@/components/assistant/FloatingAssistantChat";
import OfflineSyncStatus from "@/components/common/OfflineSyncStatus";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

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

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-brand",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F7F8FA",
};

export const metadata: Metadata = {
  title: "مساعد ريادة — وكيل امتثال ذكي بالذكاء الاصطناعي للمؤسسات العُمانية",
  description: "وكيل امتثال ذكي بالذكاء الاصطناعي للمؤسسات الصغيرة والمتوسطة في سلطنة عُمان لتتبع التراخيص، نسب التعمين، الضرائب، والتنبيه التلقائي قبل الغرامات عبر واتساب ولوحة التحكم.",
  metadataBase: new URL("https://riyada-assistant.om"),
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo-header.png", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/logo-header.png",
  },
  appleWebApp: {
    capable: true,
    title: "مساعد ريادة",
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
      <FloatingAssistantChat />
      <OfflineSyncStatus />
    </NextIntlClientProvider>
  );

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} ${tajawal.variable} ${plexArabic.variable} ${plexMono.variable} ${plusJakarta.variable}`}>
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
