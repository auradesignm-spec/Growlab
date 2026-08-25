/**
 * Merchant store page layout — ordered, toggleable blocks.
 * Stored inside themeJson.layout (backward-compatible).
 */

export const STORE_BLOCK_TYPES = [
  "offer",
  "intro",
  "hero",
  "catalog",
  "contact",
] as const;

export type StoreBlockType = (typeof STORE_BLOCK_TYPES)[number];

export interface StoreBlock {
  id: string;
  type: StoreBlockType;
  enabled: boolean;
}

export interface StoreLayout {
  blocks: StoreBlock[];
}

const DEFAULT_ORDER: StoreBlockType[] = ["offer", "intro", "hero", "catalog", "contact"];

export function defaultStoreLayout(): StoreLayout {
  return {
    blocks: DEFAULT_ORDER.map((type) => ({
      id: type,
      type,
      enabled: type !== "offer",
    })),
  };
}

export function normalizeStoreLayout(raw: unknown): StoreLayout {
  if (!raw || typeof raw !== "object") return defaultStoreLayout();
  const blocksRaw = (raw as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocksRaw) || blocksRaw.length === 0) return defaultStoreLayout();

  const seenTypes = new Set<StoreBlockType>();
  const blocks: StoreBlock[] = [];
  for (const item of blocksRaw) {
    if (!item || typeof item !== "object") continue;
    const type = (item as StoreBlock).type;
    if (!STORE_BLOCK_TYPES.includes(type as StoreBlockType)) continue;
    if (seenTypes.has(type as StoreBlockType)) continue;
    seenTypes.add(type as StoreBlockType);
    blocks.push({
      id: String((item as StoreBlock).id || type),
      type: type as StoreBlockType,
      enabled: (item as StoreBlock).enabled !== false,
    });
  }

  for (const type of DEFAULT_ORDER) {
    if (!seenTypes.has(type)) {
      blocks.push({ id: type, type, enabled: type !== "offer" });
    }
  }

  return { blocks };
}

export function enabledBlocks(layout: StoreLayout): StoreBlock[] {
  return layout.blocks.filter((b) => b.enabled);
}

export function setBlockEnabled(layout: StoreLayout, type: StoreBlockType, enabled: boolean): StoreLayout {
  if (!layout.blocks.some((b) => b.type === type)) {
    return { blocks: [...layout.blocks, { id: type, type, enabled }] };
  }
  return {
    blocks: layout.blocks.map((b) => (b.type === type ? { ...b, enabled } : b)),
  };
}

export function moveBlock(layout: StoreLayout, type: StoreBlockType, dir: -1 | 1): StoreLayout {
  const idx = layout.blocks.findIndex((b) => b.type === type);
  if (idx < 0) return layout;
  const next = idx + dir;
  if (next < 0 || next >= layout.blocks.length) return layout;
  const blocks = [...layout.blocks];
  const [item] = blocks.splice(idx, 1);
  blocks.splice(next, 0, item);
  return { blocks };
}
