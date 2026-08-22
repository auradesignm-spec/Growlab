import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";

export default getRequestConfig(async ({ requestLocale }) => {
  const fromPath = await requestLocale;
  const fromCookie = cookies().get(LOCALE_COOKIE)?.value;

  const locale: Locale = isLocale(fromPath)
    ? fromPath
    : isLocale(fromCookie)
      ? fromCookie
      : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Asia/Muscat",
  };
});
