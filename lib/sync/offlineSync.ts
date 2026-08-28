/**
 * Growlab Offline Resilience & Data Sync System
 * Prevents data loss during network interruptions and synchronizes via webhook / sync API.
 */

export interface QueuedOfflineAction {
  id: string;
  actionType: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = "growlab_offline_sync_queue";
const CACHE_PREFIX = "growlab_cache_";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Check if device is currently online */
export function isOnline(): boolean {
  if (!isBrowser()) return true;
  return navigator.onLine;
}

/** Save an action into the local resilient offline queue */
export function queueOfflineAction(actionType: string, payload: Record<string, unknown>): QueuedOfflineAction {
  if (!isBrowser()) {
    return { id: "server", actionType, payload, timestamp: Date.now(), retryCount: 0 };
  }

  const existing = getOfflineQueue();
  const newAction: QueuedOfflineAction = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    actionType,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };

  const updated = [...existing, newAction];
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("growlab:offline-queue-changed", { detail: { count: updated.length } }));
  } catch (e) {
    console.warn("Unable to save to offline storage:", e);
  }

  return newAction;
}

/** Retrieve all queued actions waiting for sync */
export function getOfflineQueue(): QueuedOfflineAction[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedOfflineAction[];
  } catch {
    return [];
  }
}

/** Remove an item from the queue by ID */
export function removeFromOfflineQueue(actionId: string): void {
  if (!isBrowser()) return;
  const existing = getOfflineQueue();
  const filtered = existing.filter((item) => item.id !== actionId);
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("growlab:offline-queue-changed", { detail: { count: filtered.length } }));
  } catch {
    // ignore
  }
}

/** Clear the entire sync queue */
export function clearOfflineQueue(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("growlab:offline-queue-changed", { detail: { count: 0 } }));
  } catch {
    // ignore
  }
}

/**
 * Flush and replay offline queue to the server sync API
 */
export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (!isBrowser() || !navigator.onLine) return { synced: 0, failed: 0 };

  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  try {
    const res = await fetch("/api/sync/offline-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actions: queue }),
    });

    if (res.ok) {
      const data = (await res.json()) as { processedIds?: string[] };
      if (data.processedIds && Array.isArray(data.processedIds)) {
        for (const id of data.processedIds) {
          removeFromOfflineQueue(id);
          synced++;
        }
      } else {
        clearOfflineQueue();
        synced = queue.length;
      }
    } else {
      failed = queue.length;
    }
  } catch (err) {
    console.error("Offline sync error:", err);
    failed = queue.length;
  }

  return { synced, failed };
}

/** Fast memory / localStorage caching with expiration */
export function getLocalCache<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const item = JSON.parse(raw) as { value: T; expiresAt: number };
    if (Date.now() > item.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return item.value;
  } catch {
    return null;
  }
}

export function setLocalCache<T>(key: string, value: T, ttlMs: number = 1000 * 60 * 10): void {
  if (!isBrowser()) return;
  try {
    const item = {
      value,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch {
    // ignore
  }
}
