import type { StoreLayout } from "@/lib/merchant-store/layout";
import { defaultStoreLayout, normalizeStoreLayout } from "@/lib/merchant-store/layout";

export interface MerchantStoreTheme {
  accent: string;
  heroStyle: "center" | "split";
  fontTone: "modern" | "classic";
  layout: StoreLayout;
}

export const DEFAULT_THEME: MerchantStoreTheme = {
  accent: "#1F6FEB",
  heroStyle: "split",
  fontTone: "modern",
  layout: defaultStoreLayout(),
};

/** WordPress-style theme color chips — merchant picks, no hex typing. */
export const ACCENT_PRESETS = [
  { id: "ocean", hex: "#1F6FEB" },
  { id: "ink", hex: "#111318" },
  { id: "forest", hex: "#1B7A4E" },
  { id: "copper", hex: "#B45309" },
  { id: "rose", hex: "#BE185D" },
] as const;

export function parseThemeJson(raw: string | null | undefined): MerchantStoreTheme {
  if (!raw) return { ...DEFAULT_THEME, layout: defaultStoreLayout() };
  try {
    const parsed = JSON.parse(raw) as Partial<MerchantStoreTheme> & { blocks?: unknown };
    return {
      accent:
        typeof parsed.accent === "string" && /^#[0-9A-Fa-f]{6}$/.test(parsed.accent)
          ? parsed.accent
          : DEFAULT_THEME.accent,
      heroStyle: parsed.heroStyle === "center" ? "center" : "split",
      fontTone: parsed.fontTone === "classic" ? "classic" : "modern",
      layout: normalizeStoreLayout(parsed.layout ?? { blocks: parsed.blocks }),
    };
  } catch {
    return { ...DEFAULT_THEME, layout: defaultStoreLayout() };
  }
}

export function serializeTheme(theme: MerchantStoreTheme): string {
  return JSON.stringify({
    accent: theme.accent,
    heroStyle: theme.heroStyle,
    fontTone: theme.fontTone,
    layout: theme.layout,
  });
}
