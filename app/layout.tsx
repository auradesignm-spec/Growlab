import type { Metadata } from "next";
import { Amiri, Archivo, IBM_Plex_Sans_Arabic, IBM_Plex_Mono, Newsreader } from "next/font/google";
import Grain from "@/components/Grain";
import MagneticCursor from "@/components/MagneticCursor";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["100", "400", "700", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Growlab — Issue 01",
  description:
    "نادي نمو خاص لصنّاع النخبة والتجار. نشاركك نتيجتك — لا نبيعك خدمة.",
  metadataBase: new URL("https://growlab.om"),
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${plexArabic.variable} ${archivo.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <body className="font-body antialiased">
        <Grain />
        <MagneticCursor />
        {children}
      </body>
    </html>
  );
}
