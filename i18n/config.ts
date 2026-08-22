export const LOCALES = ["ar", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_HEADER = "x-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ar" || value === "en";
}

export function dirForLocale(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage.split(",").map((part) => {
    const [tag, ...params] = part.trim().split(";");
    const q = params.find((param) => param.trim().startsWith("q="));
    const quality = q ? Number(q.split("=")[1]) : 1;
    const lang = tag?.slice(0, 2).toLowerCase();
    return { lang, quality: Number.isFinite(quality) ? quality : 0 };
  });

  ranked.sort((a, b) => b.quality - a.quality);

  for (const { lang } of ranked) {
    if (isLocale(lang)) return lang;
  }

  return DEFAULT_LOCALE;
}
