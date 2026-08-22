/** OMR conventionally displays 3 decimal places (baisa subunit). */
export function formatMoney(amount: number, currency = "OMR"): string {
  const decimals = currency === "OMR" ? 3 : 2;
  return `${amount.toFixed(decimals)} ${currency}`;
}

export function formatPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDate(date: Date | string, locale: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
