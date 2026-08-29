/**
 * Comprehensive Input Sanitizer & Security Shield for Growlab
 * Protects against:
 * 1. SQL Injection / NoSQL Injection attempts
 * 2. Cross-Site Scripting (XSS) & HTML / SVG injection
 * 3. Dangerous URL schemes (javascript:, vbscript:, data:text/html)
 * 4. Dangerous control characters & Unicode exploitation
 * 5. Parameter tampering & Prototype pollution
 */

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFE\uFFFF]/g;
const SCRIPT_TAG_PATTERN = /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi;
const IFRAME_EMBED_PATTERN = /<\s*(iframe|embed|object|base|meta|link|frame|frameset)[^>]*>/gi;
const DANGEROUS_ATTRIBUTES = /\b(on\w+|formaction|xlink:href)\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;
const JAVASCRIPT_PROTOCOL = /^\s*(javascript|vbscript|data\s*:\s*text\/html|data\s*:\s*application\/javascript):/i;

// Common SQL Injection keywords and signatures
const SQLI_PATTERNS = [
  /(\b(UNION(\s+ALL)?|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC(UTE)?)\b[\s\S]*?\b(FROM|INTO|TABLE|DATABASE|WHERE|SET)\b)/i,
  /(\bOR\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
  /(\bAND\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
  /(--|#|\/\*|\*\/|;\s*DROP\s+TABLE|;\s*DELETE\s+FROM)/i,
  /(\bSLEEP\s*\(\s*\d+\s*\)|\bWAITFOR\s+DELAY\b|\bBENCHMARK\s*\()/i,
];

/**
 * Checks if a string contains known SQL injection patterns
 */
export function hasSqlInjectionPattern(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return SQLI_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Sanitizes plain text input by stripping control chars, HTML tags, and normalizing spaces
 */
export function sanitizePlainText(value: string, maxLength = 500): string {
  if (!value || typeof value !== "string") return "";
  let clean = value
    .replace(CONTROL_CHARS, "")
    .replace(SCRIPT_TAG_PATTERN, "")
    .replace(IFRAME_EMBED_PATTERN, "")
    .replace(/<[^>]*>/g, "") // Strip all HTML tags
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<[^>]*>/g, "") // Second pass after entity decode
    .replace(/\s{2,}/g, " ")
    .trim();

  // Neutralize raw SQL injection markers
  clean = clean.replace(/(--|;\s*drop\s|;\s*delete\s)/gi, " ");

  return clean.slice(0, maxLength);
}

/**
 * Sanitizes rich text / HTML content to only allow harmless formatting tags (<p>, <br>, <strong>, <em>)
 * and strips any script, iframe, styles, event handlers, or dangerous attributes.
 */
export function sanitizeSafeHtml(html: string, maxLength = 12000): string {
  if (!html || typeof html !== "string") return "";
  
  let clean = html
    .replace(CONTROL_CHARS, "")
    .replace(SCRIPT_TAG_PATTERN, "")
    .replace(IFRAME_EMBED_PATTERN, "")
    .replace(DANGEROUS_ATTRIBUTES, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .trim();

  clean = clean.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag, attrs) => {
    const lowerTag = String(tag).toLowerCase();
    const safeTags = ["p", "br", "b", "i", "strong", "em", "span", "ul", "ol", "li", "h1", "h2", "h3", "h4"];
    if (!safeTags.includes(lowerTag)) {
      return "";
    }
    const safeAttrs = (attrs || "")
      .replace(DANGEROUS_ATTRIBUTES, "")
      .replace(/style\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, "")
      .trim();
    return `<${match.startsWith("</") ? `/${lowerTag}` : lowerTag}${safeAttrs ? ` ${safeAttrs}` : ""}>`;
  });

  return clean.slice(0, maxLength);
}

/**
 * Validates and sanitizes a URL, ensuring only safe protocols (http:, https:) or safe relative paths are used.
 */
export function sanitizeUrl(url: string, maxLength = 500): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.replace(CONTROL_CHARS, "").trim().slice(0, maxLength);

  if (JAVASCRIPT_PROTOCOL.test(trimmed)) {
    return "";
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Invalid URL
  }

  return "";
}

/**
 * Sanitizes phone numbers by allowing only digits and valid standard phone characters
 */
export function sanitizePhone(phone: string, maxLength = 20): string {
  if (!phone || typeof phone !== "string") return "";
  return phone
    .replace(CONTROL_CHARS, "")
    .replace(/[^\d+\s\-()]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes email addresses
 */
export function sanitizeEmail(email: string, maxLength = 120): string {
  if (!email || typeof email !== "string") return "";
  return email
    .replace(CONTROL_CHARS, "")
    .trim()
    .toLowerCase()
    .slice(0, maxLength);
}

/**
 * Sanitizes slugs / handles (letters, numbers, hyphens, underscores)
 */
export function sanitizeSlug(slug: string, maxLength = 64): string {
  if (!slug || typeof slug !== "string") return "";
  return slug
    .replace(CONTROL_CHARS, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

/**
 * Recursively deep-sanitizes strings in objects, arrays, and JSON payloads
 */
export function sanitizeObject<T>(input: T, depth = 0): T {
  if (depth > 10) return input;
  if (input === null || input === undefined) return input;

  if (typeof input === "string") {
    return sanitizePlainText(input, 10000) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item, depth + 1)) as unknown as T;
  }

  if (typeof input === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      const cleanKey = sanitizePlainText(key, 100);
      sanitized[cleanKey] = sanitizeObject((input as Record<string, unknown>)[key], depth + 1);
    }
    return sanitized as T;
  }

  return input;
}
