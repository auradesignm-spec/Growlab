import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { dirForLocale, isLocale, type Locale } from "@/i18n/config";
import PwaRegister from "@/components/PwaRegister";
import FloatingAssistantChat from "@/components/assistant/FloatingAssistantChat";
import OfflineSyncStatus from "@/components/common/OfflineSyncStatus";
import "./globals.css";

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
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap"
        />
      </head>
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
                fontFamily: "var(--font-cairo), sans-serif",
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
