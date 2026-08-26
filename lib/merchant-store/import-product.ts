/**
 * Universal product-page importer for any storefront engine.
 *
 * Pipeline:
 *  1. Normalize URL (https + Arabic path encoding)
 *  2. Fetch HTML with a browser-like UA
 *  3. Detect the storefront engine from the page HTML
 *  4. Merge structured extractors by confidence score
 *  5. Optional OpenAI pass when the page is incomplete/JS-heavy
 */

export type StoreEngine =
  | "shopify"
  | "woocommerce"
  | "salla"
  | "zid"
  | "magento"
  | "youcan"
  | "wix"
  | "generic";

export interface ImportedProductDraft {
  sourceUrl: string;
  title: string;
  shortDescription: string;
  descriptionHtml: string;
  descriptionPlain: string;
  imageUrl: string | null;
  imageUrls: string[];
  priceHint: number | null;
  currencyHint: string | null;
  brand: string | null;
  category: string | null;
  sizes: string[];
  colors: string[];
  materials: string[];
  features: string[];
  engine: StoreEngine;
  extractionMethod: string;
}

type PartialDraft = {
  title?: string;
  shortDescription?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  priceHint?: number | null;
  currencyHint?: string | null;
  brand?: string | null;
  category?: string | null;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  features?: string[];
  _score?: number;
  _method?: string;
};

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripTags(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function metaContent(html: string, property: string): string | null {
  const a = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const b = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const m = html.match(a) || html.match(b);
  return m?.[1]?.trim() ? decodeHtml(m[1].trim()) : null;
}

function absoluteUrl(base: string, maybeRelative: string | null | undefined): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

function uniqueStrings(values: Array<string | null | undefined>, max = 24): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = (v ?? "").trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t.slice(0, 120));
    if (out.length >= max) break;
  }
  return out;
}

function parseMoney(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) && raw > 0 ? raw : null;
  const cleaned = String(raw)
    .replace(/[^\d.,]/g, "")
    .replace(/,(?=\d{3}\b)/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Accept bare domains and Arabic paths; always return a fetchable https URL. */
export function normalizeProductImportUrl(raw: string): string {
  let value = raw.trim();
  if (!value) throw new Error("Enter a product page URL.");
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;

  let u: URL;
  try {
    u = new URL(value);
  } catch {
    throw new Error("Enter a valid product page URL (https://…).");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Enter a valid product page URL (https://…).");
  }

  u.pathname = u.pathname
    .split("/")
    .map((segment) => {
      if (!segment) return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");

  return u.toString();
}

export function detectStoreEngine(html: string, url: string): StoreEngine {
  const h = html.toLowerCase();
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    /* ignore */
  }

  if (
    h.includes("cdn.shopify.com") ||
    h.includes("shopify.theme") ||
    h.includes("shopify-section") ||
    host.includes("myshopify.com")
  ) {
    return "shopify";
  }
  if (
    h.includes("woocommerce") ||
    h.includes("wp-content/plugins/woocommerce") ||
    h.includes("wc-add-to-cart")
  ) {
    return "woocommerce";
  }
  if (h.includes("salla.sa") || h.includes("salla.cloud") || host.endsWith("salla.sa")) {
    return "salla";
  }
  if (h.includes("zid.store") || h.includes("zid.sa") || host.includes("zid.")) {
    return "zid";
  }
  if (h.includes("mage/cookies") || h.includes("magento") || h.includes("mage-init")) {
    return "magento";
  }
  if (h.includes("youcan.shop") || host.includes("youcan")) return "youcan";
  if (h.includes("wix.com") || h.includes("wixstatic.com")) return "wix";
  return "generic";
}

function mergePartials(parts: PartialDraft[]): PartialDraft {
  const ranked = [...parts].sort((a, b) => (b._score ?? 0) - (a._score ?? 0));
  const out: PartialDraft = {
    imageUrls: [],
    sizes: [],
    colors: [],
    materials: [],
    features: [],
  };
  const methods: string[] = [];

  for (const p of ranked) {
    if (p._method) methods.push(p._method);
    if (!out.title && p.title) out.title = p.title;
    if (!out.shortDescription && p.shortDescription) out.shortDescription = p.shortDescription;
    if (!out.descriptionHtml && p.descriptionHtml) out.descriptionHtml = p.descriptionHtml;
    if (!out.descriptionPlain && p.descriptionPlain) out.descriptionPlain = p.descriptionPlain;
    if (!out.imageUrl && p.imageUrl) out.imageUrl = p.imageUrl;
    if (!out.priceHint && p.priceHint) out.priceHint = p.priceHint;
    if (!out.currencyHint && p.currencyHint) out.currencyHint = p.currencyHint;
    if (!out.brand && p.brand) out.brand = p.brand;
    if (!out.category && p.category) out.category = p.category;
    out.imageUrls = uniqueStrings([...(out.imageUrls ?? []), ...(p.imageUrls ?? []), p.imageUrl]);
    out.sizes = uniqueStrings([...(out.sizes ?? []), ...(p.sizes ?? [])]);
    out.colors = uniqueStrings([...(out.colors ?? []), ...(p.colors ?? [])]);
    out.materials = uniqueStrings([...(out.materials ?? []), ...(p.materials ?? [])]);
    out.features = uniqueStrings([...(out.features ?? []), ...(p.features ?? [])], 20);
  }
  out._method = methods.join("+") || "none";
  return out;
}

function extractJsonLd(html: string): PartialDraft | null {
  const scripts = [
    ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  for (const match of scripts) {
    try {
      const raw = JSON.parse(match[1]!) as unknown;
      const nodes = Array.isArray(raw) ? raw : [raw];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const obj = node as Record<string, unknown>;
        const graph = Array.isArray(obj["@graph"])
          ? (obj["@graph"] as Record<string, unknown>[])
          : [obj];
        for (const item of graph) {
          const type = item["@type"];
          const isProduct =
            type === "Product" ||
            type === "ProductGroup" ||
            (Array.isArray(type) &&
              (type.includes("Product") || type.includes("ProductGroup")));
          if (!isProduct) continue;

          const name = typeof item.name === "string" ? item.name : "";
          const description = typeof item.description === "string" ? item.description : "";
          const brand =
            typeof item.brand === "string"
              ? item.brand
              : item.brand && typeof item.brand === "object"
                ? String((item.brand as { name?: string }).name ?? "")
                : "";
          const category = typeof item.category === "string" ? item.category : "";

          const images: string[] = [];
          const pushImg = (v: unknown) => {
            if (typeof v === "string") images.push(v);
            else if (v && typeof v === "object" && typeof (v as { url?: string }).url === "string") {
              images.push((v as { url: string }).url);
            }
          };
          if (Array.isArray(item.image)) item.image.forEach(pushImg);
          else pushImg(item.image);

          let priceHint: number | null = null;
          let currencyHint: string | null = null;
          const offers = item.offers;
          const offerList = Array.isArray(offers) ? offers : offers ? [offers] : [];
          for (const offer of offerList) {
            if (!offer || typeof offer !== "object") continue;
            const price = parseMoney((offer as { price?: unknown }).price as string | number);
            if (price) {
              priceHint = price;
              const cur = (offer as { priceCurrency?: unknown }).priceCurrency;
              if (typeof cur === "string") currencyHint = cur;
              break;
            }
          }

          const sizes: string[] = [];
          const colors: string[] = [];
          const materials: string[] = [];
          const props = item.additionalProperty;
          const propList = Array.isArray(props) ? props : props ? [props] : [];
          for (const prop of propList) {
            if (!prop || typeof prop !== "object") continue;
            const pname = String((prop as { name?: string }).name ?? "").toLowerCase();
            const pval = String((prop as { value?: string }).value ?? "").trim();
            if (!pval) continue;
            if (/size|مقاس|قياس/.test(pname)) sizes.push(pval);
            else if (/color|لون|colour/.test(pname)) colors.push(pval);
            else if (/material|خامة|قماش/.test(pname)) materials.push(pval);
          }

          return {
            _score: 90,
            _method: "jsonld",
            title: name.slice(0, 120),
            shortDescription: stripTags(description).slice(0, 280),
            descriptionPlain: stripTags(description).slice(0, 4000),
            descriptionHtml: description
              ? `<p>${stripTags(description).slice(0, 4000)}</p>`
              : "",
            imageUrl: images[0] ?? null,
            imageUrls: images,
            priceHint,
            currencyHint,
            brand: brand || null,
            category: category || null,
            sizes,
            colors,
            materials,
          };
        }
      }
    } catch {
      /* next */
    }
  }
  return null;
}

function extractOpenGraph(html: string): PartialDraft {
  const title = metaContent(html, "og:title") || metaContent(html, "twitter:title") || "";
  const desc = metaContent(html, "og:description") || metaContent(html, "description") || "";
  const image = metaContent(html, "og:image") || metaContent(html, "twitter:image");
  const price =
    parseMoney(metaContent(html, "product:price:amount")) ||
    parseMoney(metaContent(html, "og:price:amount"));
  const currency =
    metaContent(html, "product:price:currency") || metaContent(html, "og:price:currency");
  const brand = metaContent(html, "product:brand") || metaContent(html, "og:brand");
  return {
    _score: 70,
    _method: "opengraph",
    title: title.slice(0, 120),
    shortDescription: stripTags(desc).slice(0, 280),
    descriptionPlain: stripTags(desc).slice(0, 4000),
    descriptionHtml: desc ? `<p>${stripTags(desc).slice(0, 4000)}</p>` : "",
    imageUrl: image,
    imageUrls: image ? [image] : [],
    priceHint: price,
    currencyHint: currency,
    brand,
  };
}

function extractMicrodata(html: string): PartialDraft {
  const name =
    html.match(/itemprop=["']name["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<[^>]+itemprop=["']name["'][^>]*>([^<]+)</i)?.[1] ||
    "";
  const desc =
    html.match(/itemprop=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<[^>]+itemprop=["']description["'][^>]*>([\s\S]*?)<\//i)?.[1] ||
    "";
  const image =
    html.match(/itemprop=["']image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/itemprop=["']image["'][^>]*src=["']([^"']+)["']/i)?.[1] ||
    null;
  const price = parseMoney(
    html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
      html.match(/content=["']([^"']+)["'][^>]*itemprop=["']price["']/i)?.[1]
  );
  const currency =
    html.match(/itemprop=["']priceCurrency["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]*itemprop=["']priceCurrency["']/i)?.[1] ||
    null;
  return {
    _score: 60,
    _method: "microdata",
    title: stripTags(name).slice(0, 120),
    shortDescription: stripTags(desc).slice(0, 280),
    descriptionPlain: stripTags(desc).slice(0, 4000),
    descriptionHtml: desc ? `<p>${stripTags(desc).slice(0, 4000)}</p>` : "",
    imageUrl: image,
    imageUrls: image ? [image] : [],
    priceHint: price,
    currencyHint: currency,
  };
}

function extractShopifyEmbedded(html: string): PartialDraft | null {
  const candidates = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/json["'][^>]*data-product-json[^>]*>([\s\S]*?)<\/script>/gi
    ),
    ...html.matchAll(/<script[^>]*id=["']ProductJson-[^"']+["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  for (const m of candidates) {
    try {
      const raw = JSON.parse(m[1]!) as Record<string, unknown>;
      const title = String(raw.title ?? raw.name ?? "");
      if (!title) continue;
      const description = String(raw.description ?? "");
      const variants = Array.isArray(raw.variants) ? raw.variants : [];
      const options = Array.isArray(raw.options) ? raw.options : [];
      const images = Array.isArray(raw.images)
        ? raw.images.map((img) =>
            typeof img === "string" ? img : String((img as { src?: string }).src ?? "")
          )
        : typeof raw.featured_image === "string"
          ? [raw.featured_image]
          : [];

      let priceHint: number | null = null;
      if (variants[0] && typeof variants[0] === "object") {
        const p = parseMoney((variants[0] as { price?: string | number }).price);
        priceHint = p && p >= 100 && Number.isInteger(p) ? p / 100 : p;
      }

      const sizes: string[] = [];
      const colors: string[] = [];
      for (const opt of options) {
        if (!opt || typeof opt !== "object") continue;
        const name = String((opt as { name?: string }).name ?? "").toLowerCase();
        const values = Array.isArray((opt as { values?: unknown }).values)
          ? ((opt as { values: unknown[] }).values as unknown[]).map(String)
          : [];
        if (/size|مقاس/.test(name)) sizes.push(...values);
        if (/color|لون|colour/.test(name)) colors.push(...values);
      }

      return {
        _score: 95,
        _method: "shopify-json",
        title: title.slice(0, 120),
        shortDescription: stripTags(description).slice(0, 280),
        descriptionPlain: stripTags(description).slice(0, 4000),
        descriptionHtml: description ? `<div>${description.slice(0, 8000)}</div>` : "",
        imageUrl: images[0] ?? null,
        imageUrls: images.filter(Boolean),
        priceHint,
        sizes: uniqueStrings(sizes),
        colors: uniqueStrings(colors),
      };
    } catch {
      /* next */
    }
  }
  return null;
}

async function extractShopifyRemote(pageUrl: string): Promise<PartialDraft | null> {
  try {
    const u = new URL(pageUrl);
    const m = u.pathname.match(/\/products\/([^/.]+)/i);
    if (!m) return null;
    const jsUrl = `${u.origin}/products/${m[1]}.js`;
    const res = await fetch(jsUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as Record<string, unknown>;
    const title = String(raw.title ?? "");
    if (!title) return null;
    const description = String(raw.description ?? "");
    const images = Array.isArray(raw.images) ? raw.images.map(String) : [];
    const variants = Array.isArray(raw.variants) ? raw.variants : [];
    let priceHint: number | null = null;
    if (variants[0] && typeof variants[0] === "object") {
      const p = parseMoney((variants[0] as { price?: string | number }).price);
      priceHint = p && p >= 100 && Number.isInteger(p) ? p / 100 : p;
    }
    const optionNames = Array.isArray(raw.options) ? raw.options.map(String) : [];
    const sizes: string[] = [];
    const colors: string[] = [];
    for (const v of variants) {
      if (!v || typeof v !== "object") continue;
      const opts = [
        (v as { option1?: string }).option1,
        (v as { option2?: string }).option2,
        (v as { option3?: string }).option3,
      ];
      optionNames.forEach((optName, i) => {
        const val = opts[i];
        if (!val) return;
        if (/size|مقاس/i.test(optName)) sizes.push(val);
        if (/color|لون|colour/i.test(optName)) colors.push(val);
      });
    }
    return {
      _score: 96,
      _method: "shopify-js",
      title: title.slice(0, 120),
      shortDescription: stripTags(description).slice(0, 280),
      descriptionPlain: stripTags(description).slice(0, 4000),
      descriptionHtml: description ? `<div>${description.slice(0, 8000)}</div>` : "",
      imageUrl: images[0]
        ? images[0].startsWith("//")
          ? `https:${images[0]}`
          : images[0]
        : null,
      imageUrls: images.map((img) => (img.startsWith("//") ? `https:${img}` : img)),
      priceHint,
      sizes: uniqueStrings(sizes),
      colors: uniqueStrings(colors),
    };
  } catch {
    return null;
  }
}

function extractWooCommerce(html: string): PartialDraft | null {
  if (!/woocommerce/i.test(html)) return null;
  const title =
    html.match(/<h1[^>]*class=["'][^"']*product_title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)?.[1] ||
    "";
  const price =
    parseMoney(
      html.match(/<p[^>]*class=["'][^"']*price[^"']*["'][^>]*>[\s\S]*?<bdi[^>]*>.*?([\d.,]+)/i)?.[1]
    ) || parseMoney(html.match(/woocommerce-Price-amount[^>]*>.*?([\d.,]+)/i)?.[1]);
  const images = [
    ...html.matchAll(
      /<img[^>]+(?:data-large_image|data-src|src)=["']([^"']+)["'][^>]*class=["'][^"']*wp-post-image/gi
    ),
    ...html.matchAll(
      /<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*woocommerce-product-gallery__image/gi
    ),
  ].map((m) => m[1]!);

  const sizes: string[] = [];
  const colors: string[] = [];
  for (const m of html.matchAll(
    /<select[^>]*id=["']?(?:pa_)?size["']?[^>]*>([\s\S]*?)<\/select>/gi
  )) {
    for (const o of m[1]!.matchAll(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]*)/gi)) {
      if (o[1]) sizes.push(stripTags(o[2] || o[1]));
    }
  }
  for (const m of html.matchAll(
    /<select[^>]*id=["']?(?:pa_)?colou?r["']?[^>]*>([\s\S]*?)<\/select>/gi
  )) {
    for (const o of m[1]!.matchAll(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]*)/gi)) {
      if (o[1]) colors.push(stripTags(o[2] || o[1]));
    }
  }

  const short =
    html.match(
      /<div[^>]*class=["'][^"']*woocommerce-product-details__short-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    )?.[1] || "";
  const long =
    html.match(/<div[^>]*id=["']tab-description["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ||
    html.match(
      /<div[^>]*class=["'][^"']*woocommerce-Tabs-panel--description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    )?.[1] ||
    "";

  if (!title && !price && images.length === 0) return null;
  return {
    _score: 88,
    _method: "woocommerce",
    title: stripTags(title).slice(0, 120),
    shortDescription: stripTags(short).slice(0, 280),
    descriptionPlain: stripTags(long || short).slice(0, 4000),
    descriptionHtml: long || (short ? `<div>${short}</div>` : ""),
    imageUrl: images[0] ?? null,
    imageUrls: uniqueStrings(images),
    priceHint: price,
    sizes: uniqueStrings(sizes),
    colors: uniqueStrings(colors),
  };
}

function extractHeuristics(html: string): PartialDraft {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "";
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  const price =
    parseMoney(html.match(/(?:ر\.?\s*ع\.?|OMR|USD|SAR|AED)\s*([\d.,]+)/i)?.[1]) ||
    parseMoney(html.match(/([\d.,]+)\s*(?:ر\.?\s*ع\.?|OMR|USD|SAR|AED)/i)?.[1]);
  const features = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => stripTags(m[1]!))
    .filter((t) => t.length > 8 && t.length < 120)
    .slice(0, 10);
  return {
    _score: 30,
    _method: "heuristic",
    title: stripTags(h1 || titleTag).slice(0, 120),
    priceHint: price,
    features: uniqueStrings(features, 10),
  };
}

function needsAiFill(draft: PartialDraft): boolean {
  const missingTitle = !draft.title?.trim();
  const missingMedia = !draft.imageUrl && !(draft.imageUrls && draft.imageUrls.length);
  const missingPrice = !draft.priceHint;
  const missingCopy = !draft.shortDescription && !draft.descriptionPlain;
  return missingTitle || (missingMedia && missingPrice) || (missingCopy && missingPrice);
}

async function extractWithOpenAi(
  pageUrl: string,
  html: string,
  engine: StoreEngine,
  seed: PartialDraft
): Promise<PartialDraft | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const snippet = stripTags(html).slice(0, 12000);
  const prompt = `Extract ecommerce product fields from this storefront page.
Return JSON only with keys:
title, shortDescription, descriptionPlain, brand, category, priceHint (number|null), currencyHint (string|null),
imageUrls (string[]), sizes (string[]), colors (string[]), materials (string[]), features (string[]).
Engine hint: ${engine}. Page URL: ${pageUrl}.
Prefer Arabic text when the page is Arabic. Ignore nav/footer/cookie noise.
Never invent a price if none is present.
Known so far: ${JSON.stringify({
    title: seed.title ?? null,
    priceHint: seed.priceHint ?? null,
    imageUrl: seed.imageUrl ?? null,
  })}
PAGE TEXT:
${snippet}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You extract structured product data from storefront HTML text. Return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const imageUrls = Array.isArray(parsed.imageUrls)
      ? parsed.imageUrls.map(String)
      : typeof parsed.imageUrl === "string"
        ? [parsed.imageUrl]
        : [];
    return {
      _score: 80,
      _method: "openai",
      title: typeof parsed.title === "string" ? parsed.title.slice(0, 120) : "",
      shortDescription:
        typeof parsed.shortDescription === "string"
          ? parsed.shortDescription.slice(0, 280)
          : "",
      descriptionPlain:
        typeof parsed.descriptionPlain === "string"
          ? parsed.descriptionPlain.slice(0, 4000)
          : "",
      descriptionHtml:
        typeof parsed.descriptionPlain === "string"
          ? `<p>${String(parsed.descriptionPlain).slice(0, 4000)}</p>`
          : "",
      imageUrl: imageUrls[0] ?? null,
      imageUrls,
      priceHint: parseMoney(parsed.priceHint as string | number | null),
      currencyHint:
        typeof parsed.currencyHint === "string" ? parsed.currencyHint.slice(0, 8) : null,
      brand: typeof parsed.brand === "string" ? parsed.brand.slice(0, 80) : null,
      category: typeof parsed.category === "string" ? parsed.category.slice(0, 60) : null,
      sizes: uniqueStrings(Array.isArray(parsed.sizes) ? parsed.sizes.map(String) : []),
      colors: uniqueStrings(Array.isArray(parsed.colors) ? parsed.colors.map(String) : []),
      materials: uniqueStrings(
        Array.isArray(parsed.materials) ? parsed.materials.map(String) : []
      ),
      features: uniqueStrings(
        Array.isArray(parsed.features) ? parsed.features.map(String) : [],
        20
      ),
    };
  } catch {
    return null;
  }
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Could not fetch that page (${res.status}).`);
    let html = await res.text();
    if (html.length > 2_000_000) html = html.slice(0, 2_000_000);
    return html;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("The product page took too long to respond.");
    }
    throw e instanceof Error ? e : new Error("Could not fetch that page.");
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchProductFromUrl(sourceUrlRaw: string): Promise<ImportedProductDraft> {
  const sourceUrl = normalizeProductImportUrl(sourceUrlRaw);
  const html = await fetchHtml(sourceUrl);
  const engine = detectStoreEngine(html, sourceUrl);

  const parts: PartialDraft[] = [
    extractJsonLd(html),
    extractOpenGraph(html),
    extractMicrodata(html),
    extractShopifyEmbedded(html),
    extractWooCommerce(html),
    extractHeuristics(html),
  ].filter((p): p is PartialDraft => Boolean(p && (p.title || p.imageUrl || p.priceHint)));

  if (engine === "shopify") {
    const remote = await extractShopifyRemote(sourceUrl);
    if (remote) parts.push(remote);
  }

  let merged = mergePartials(parts);

  if (needsAiFill(merged)) {
    const ai = await extractWithOpenAi(sourceUrl, html, engine, merged);
    if (ai) merged = mergePartials([merged, ai]);
  }

  const imageUrls = uniqueStrings(
    (merged.imageUrls ?? [])
      .map((u) => absoluteUrl(sourceUrl, u))
      .concat(absoluteUrl(sourceUrl, merged.imageUrl))
  );
  const imageUrl = imageUrls[0] ?? null;

  const title = (merged.title || "").trim().slice(0, 120);
  if (!title) {
    throw new Error("Could not find a product title on that page. Fill the form manually.");
  }

  const descriptionPlain = (merged.descriptionPlain || merged.shortDescription || "").slice(0, 4000);
  const shortDescription = (merged.shortDescription || descriptionPlain).slice(0, 280);
  const descriptionHtml =
    merged.descriptionHtml || (descriptionPlain ? `<p>${descriptionPlain}</p>` : "");

  return {
    sourceUrl,
    title,
    shortDescription,
    descriptionHtml,
    descriptionPlain,
    imageUrl,
    imageUrls,
    priceHint: merged.priceHint ?? null,
    currencyHint: merged.currencyHint ?? null,
    brand: merged.brand ?? null,
    category: merged.category ?? null,
    sizes: merged.sizes ?? [],
    colors: merged.colors ?? [],
    materials: merged.materials ?? [],
    features: merged.features ?? [],
    engine,
    extractionMethod: merged._method || "merged",
  };
}

/** @deprecated alias kept for older call sites */
export const normalizeProductImportUrlAlias = normalizeProductImportUrl;
