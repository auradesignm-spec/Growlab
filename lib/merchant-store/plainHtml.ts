/** Plain-text ↔ simple HTML for merchant WordPress-like editors. */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Merchant types paragraphs; we store safe HTML paragraphs. */
export function plainToHtml(plain: string): string {
  const blocks = plain
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return "";

  return blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => escapeHtml(line.trim())).filter(Boolean);
      return `<p>${lines.join("<br>")}</p>`;
    })
    .join("");
}

/** Strip tags for editing as plain text (best-effort). */
export function htmlToPlain(html: string): string {
  if (!html) return "";
  return html
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
