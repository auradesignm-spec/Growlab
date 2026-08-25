/**
 * Merchant store promotions — structured offers that affect cart pricing
 * until cancelled or endsAt passes.
 */

export const PROMO_KINDS = ["banner", "bxgy_free", "nth_percent", "cart_percent"] as const;
export type PromoKind = (typeof PROMO_KINDS)[number];

export interface StorePromo {
  kind: PromoKind;
  headline: string;
  body: string;
  active: boolean;
  /** ISO datetime; null = until merchant cancels */
  endsAt: string | null;
  /** bxgy_free: pay for buyQty, get getQty free (cheapest units) */
  buyQty: number;
  getQty: number;
  /** nth_percent / cart_percent */
  percentOff: number;
  /** null/empty = all products */
  productIds: string[] | null;
}

export const DEFAULT_PROMO: StorePromo = {
  kind: "banner",
  headline: "",
  body: "",
  active: false,
  endsAt: null,
  buyQty: 1,
  getQty: 1,
  percentOff: 20,
  productIds: null,
};

export function parsePromoJson(raw: string | null | undefined, fallback?: Partial<StorePromo>): StorePromo {
  const base: StorePromo = { ...DEFAULT_PROMO, ...fallback };
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<StorePromo>;
    const kind = PROMO_KINDS.includes(parsed.kind as PromoKind) ? (parsed.kind as PromoKind) : base.kind;
    return {
      kind,
      headline: String(parsed.headline ?? base.headline).slice(0, 120),
      body: String(parsed.body ?? base.body).slice(0, 500),
      active: Boolean(parsed.active ?? base.active),
      endsAt: typeof parsed.endsAt === "string" && parsed.endsAt ? parsed.endsAt : null,
      buyQty: clampInt(parsed.buyQty ?? base.buyQty, 1, 8),
      getQty: clampInt(parsed.getQty ?? base.getQty, 1, 8),
      percentOff: clampInt(parsed.percentOff ?? base.percentOff, 1, 90),
      productIds: Array.isArray(parsed.productIds)
        ? parsed.productIds.filter((id): id is string => typeof id === "string").slice(0, 40)
        : null,
    };
  } catch {
    return base;
  }
}

/** Merge legacy headline/body/active/endsAt columns into a promo when promoJson is empty. */
export function promoFromStoreFields(input: {
  promoJson?: string | null;
  offerHeadline: string;
  offerBody: string;
  offerActive: boolean;
  offerEndsAt?: Date | string | null;
}): StorePromo {
  const endsAtIso =
    input.offerEndsAt instanceof Date
      ? input.offerEndsAt.toISOString()
      : typeof input.offerEndsAt === "string" && input.offerEndsAt
        ? input.offerEndsAt
        : null;

  const fromJson = parsePromoJson(input.promoJson, {
    headline: input.offerHeadline,
    body: input.offerBody,
    active: input.offerActive,
    endsAt: endsAtIso,
  });

  if (!input.promoJson || input.promoJson === "{}") {
    return {
      ...fromJson,
      kind: fromJson.kind === "banner" && input.offerActive ? "banner" : fromJson.kind,
      headline: input.offerHeadline || fromJson.headline,
      body: input.offerBody || fromJson.body,
      active: input.offerActive,
      endsAt: endsAtIso ?? fromJson.endsAt,
    };
  }
  return fromJson;
}

export function isPromoLive(promo: StorePromo, now = new Date()): boolean {
  if (!promo.active || !promo.headline.trim()) return false;
  if (promo.endsAt) {
    const end = new Date(promo.endsAt);
    if (!Number.isFinite(end.getTime()) || end.getTime() <= now.getTime()) return false;
  }
  return true;
}

export function serializePromo(promo: StorePromo): string {
  return JSON.stringify({
    kind: promo.kind,
    headline: promo.headline.trim().slice(0, 120),
    body: promo.body.trim().slice(0, 500),
    active: Boolean(promo.active),
    endsAt: promo.endsAt,
    buyQty: clampInt(promo.buyQty, 1, 8),
    getQty: clampInt(promo.getQty, 1, 8),
    percentOff: clampInt(promo.percentOff, 1, 90),
    productIds: promo.productIds?.length ? promo.productIds : null,
  });
}

export interface PromoCartLine {
  dealId: string;
  size: string;
  title: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface PromoPricedLine extends PromoCartLine {
  /** Effective unit price after promo allocation */
  unitPriceCharged: number;
  lineDiscount: number;
}

export interface PromoPricingResult {
  lines: PromoPricedLine[];
  subtotal: number;
  discountTotal: number;
  total: number;
  applied: boolean;
}

export function applyStorePromo(
  promo: StorePromo,
  lines: PromoCartLine[],
  now = new Date()
): PromoPricingResult {
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0));
  const baseLines: PromoPricedLine[] = lines.map((l) => ({
    ...l,
    unitPriceCharged: l.unitPrice,
    lineDiscount: 0,
  }));

  if (!isPromoLive(promo, now) || promo.kind === "banner" || lines.length === 0) {
    return { lines: baseLines, subtotal, discountTotal: 0, total: subtotal, applied: false };
  }

  const eligible = (productId: string) =>
    !promo.productIds || promo.productIds.length === 0 || promo.productIds.includes(productId);

  if (promo.kind === "cart_percent") {
    const rate = promo.percentOff / 100;
    const priced = baseLines.map((l) => {
      if (!eligible(l.productId)) return l;
      const disc = round2(l.unitPrice * l.quantity * rate);
      const charged = l.quantity > 0 ? round2((l.unitPrice * l.quantity - disc) / l.quantity) : l.unitPrice;
      return { ...l, unitPriceCharged: charged, lineDiscount: disc };
    });
    const discountTotal = round2(priced.reduce((s, l) => s + l.lineDiscount, 0));
    return {
      lines: priced,
      subtotal,
      discountTotal,
      total: round2(subtotal - discountTotal),
      applied: discountTotal > 0,
    };
  }

  // Expand to unit slots (eligible only for discount logic)
  type Slot = { key: string; dealId: string; size: string; productId: string; unitPrice: number; index: number };
  const slots: Slot[] = [];
  let idx = 0;
  for (const line of lines) {
    for (let q = 0; q < line.quantity; q += 1) {
      slots.push({
        key: `${line.dealId}::${line.size}`,
        dealId: line.dealId,
        size: line.size,
        productId: line.productId,
        unitPrice: line.unitPrice,
        index: idx++,
      });
    }
  }

  const discountsByIndex = new Map<number, number>();

  if (promo.kind === "bxgy_free") {
    const group = promo.buyQty + promo.getQty;
    const eligibleSlots = slots.filter((s) => eligible(s.productId));
    const sorted = [...eligibleSlots].sort((a, b) => a.unitPrice - b.unitPrice);
    const freeCount = Math.floor(sorted.length / group) * promo.getQty;
    for (let i = 0; i < freeCount; i += 1) {
      discountsByIndex.set(sorted[i].index, sorted[i].unitPrice);
    }
  }

  if (promo.kind === "nth_percent") {
    const cycle = promo.buyQty + 1;
    const eligibleSlots = slots.filter((s) => eligible(s.productId));
    const ordered = [...eligibleSlots].sort((a, b) => b.unitPrice - a.unitPrice);
    ordered.forEach((slot, i) => {
      if ((i + 1) % cycle === 0) {
        discountsByIndex.set(slot.index, round2(slot.unitPrice * (promo.percentOff / 100)));
      }
    });
  }

  // Aggregate discounts back onto lines
  const discByKey = new Map<string, number>();
  for (const slot of slots) {
    const d = discountsByIndex.get(slot.index) ?? 0;
    if (d <= 0) continue;
    const key = slot.key;
    discByKey.set(key, round2((discByKey.get(key) ?? 0) + d));
  }

  const priced = baseLines.map((l) => {
    const key = `${l.dealId}::${l.size}`;
    const lineDiscount = discByKey.get(key) ?? 0;
    const charged =
      l.quantity > 0 ? round2((l.unitPrice * l.quantity - lineDiscount) / l.quantity) : l.unitPrice;
    return { ...l, unitPriceCharged: Math.max(0, charged), lineDiscount };
  });

  const discountTotal = round2(priced.reduce((s, l) => s + l.lineDiscount, 0));
  return {
    lines: priced,
    subtotal,
    discountTotal,
    total: round2(subtotal - discountTotal),
    applied: discountTotal > 0,
  };
}



/** Prefer a live per-product promo; otherwise fall back to the store promo. */
export function applyProductThenStorePromo(
  lines: PromoCartLine[],
  productPromos: Map<string, StorePromo | null>,
  storePromo: StorePromo,
  now = new Date()
): ReturnType<typeof applyStorePromo> {
  const withProduct: PromoCartLine[] = [];
  const withStore: PromoCartLine[] = [];
  for (const line of lines) {
    const pp = productPromos.get(line.productId);
    if (pp && isPromoLive(pp, now)) withProduct.push(line);
    else withStore.push(line);
  }

  type Priced = ReturnType<typeof applyStorePromo>["lines"][number];
  const pricedByKey = new Map<string, Priced>();
  let discountTotal = 0;
  let applied = false;

  const byProduct = new Map<string, PromoCartLine[]>();
  for (const line of withProduct) {
    const arr = byProduct.get(line.productId) ?? [];
    arr.push(line);
    byProduct.set(line.productId, arr);
  }
  for (const [productId, subset] of byProduct) {
    const promo = productPromos.get(productId)!;
    const result = applyStorePromo(promo, subset, now);
    discountTotal += result.discountTotal;
    if (result.applied) applied = true;
    for (const l of result.lines) {
      pricedByKey.set(`${l.dealId}::${l.size}`, l);
    }
  }

  const storeResult = applyStorePromo(storePromo, withStore, now);
  discountTotal += storeResult.discountTotal;
  if (storeResult.applied) applied = true;
  for (const l of storeResult.lines) {
    pricedByKey.set(`${l.dealId}::${l.size}`, l);
  }

  const ordered = lines.map((l) => pricedByKey.get(`${l.dealId}::${l.size}`)!);
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0));
  return {
    lines: ordered,
    subtotal,
    discountTotal: round2(discountTotal),
    total: round2(subtotal - discountTotal),
    applied,
  };
}

export function promoPreset(
  id: "second_free" | "second_20" | "cart_10" | "buy2_get1",
  locale: "ar" | "en"
): StorePromo {
  const ar = locale === "ar";
  if (id === "second_free") {
    return {
      ...DEFAULT_PROMO,
      kind: "bxgy_free",
      active: true,
      buyQty: 1,
      getQty: 1,
      headline: ar ? "اشتري واحد والثاني مجاناً" : "Buy one, get the second free",
      body: ar ? "على المنتجات المؤهلة — العرض حتى تاريخ الانتهاء." : "On eligible products — until the end date.",
    };
  }
  if (id === "buy2_get1") {
    return {
      ...DEFAULT_PROMO,
      kind: "bxgy_free",
      active: true,
      buyQty: 2,
      getQty: 1,
      headline: ar ? "اشتري 2 واحصل على الثالث مجاناً" : "Buy 2, get the 3rd free",
      body: ar ? "القطعة الأرخص مجاناً ضمن العرض." : "The cheapest item in the set is free.",
    };
  }
  if (id === "second_20") {
    return {
      ...DEFAULT_PROMO,
      kind: "nth_percent",
      active: true,
      buyQty: 1,
      percentOff: 20,
      headline: ar ? "خصم 20% على القطعة الثانية" : "20% off the second item",
      body: ar ? "أضف قطعتين واستفد من الخصم تلقائياً عند الدفع." : "Add two items — discount applies at checkout.",
    };
  }
  return {
    ...DEFAULT_PROMO,
    kind: "cart_percent",
    active: true,
    percentOff: 10,
    headline: ar ? "خصم 10% على سلة المشتريات" : "10% off your cart",
    body: ar ? "ينطبق على كل المنتجات في المتجر." : "Applies to every product in the store.",
  };
}

function clampInt(n: unknown, min: number, max: number): number {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function suggestPromoFromPrompt(prompt: string, locale: "ar" | "en"): StorePromo {
  const q = prompt.trim().toLowerCase();
  if (/مجانا|free|1\+1|واحد.*ثاني|buy.?one.?get|الثاني مجانا/.test(q)) {
    return promoPreset("second_free", locale);
  }
  if (/اشتري\s*2|buy\s*2|ثالث|3rd|get\s*1\s*free|get\s*the\s*third/.test(q)) {
    return promoPreset("buy2_get1", locale);
  }
  if (/20\s*%|خصم\s*20|second.*20|القطعة الثانية/.test(q)) {
    return promoPreset("second_20", locale);
  }
  if (/10\s*%|خصم\s*10|سلة|cart/.test(q)) {
    return promoPreset("cart_10", locale);
  }
  const pct = q.match(/(\d{1,2})\s*%/);
  if (pct) {
    const percentOff = Math.min(90, Math.max(1, Number(pct[1])));
    const ar = locale === "ar";
    return {
      ...DEFAULT_PROMO,
      kind: "cart_percent",
      active: true,
      percentOff,
      headline: ar ? `خصم ${percentOff}% على سلة المشتريات` : `${percentOff}% off your cart`,
      body: ar ? "ينطبق تلقائياً عند إتمام الطلب." : "Applies automatically at checkout.",
    };
  }
  return promoPreset("second_20", locale);
}
