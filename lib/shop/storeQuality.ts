export interface StoreQualityRow {
  username: string;
  orders: number;
  returned: number;
  cancelled: number;
  flag: boolean;
}

const MIN_ORDERS = 3;
const WATCH_RATE = 0.25;

/** Flag a micro-store when returns + cancels are high enough to watch. */
export function storeQualityFromOrders(
  rows: readonly { username: string; status: string }[],
): StoreQualityRow[] {
  const map = new Map<string, { orders: number; returned: number; cancelled: number }>();
  for (const row of rows) {
    const current = map.get(row.username) ?? { orders: 0, returned: 0, cancelled: 0 };
    current.orders += 1;
    if (row.status === "returned") current.returned += 1;
    if (row.status === "cancelled") current.cancelled += 1;
    map.set(row.username, current);
  }

  return [...map.entries()]
    .map(([username, stats]) => {
      const bad = stats.returned + stats.cancelled;
      const rate = stats.orders === 0 ? 0 : bad / stats.orders;
      return {
        username,
        ...stats,
        flag: stats.orders >= MIN_ORDERS && rate >= WATCH_RATE,
      };
    })
    .sort((a, b) => Number(b.flag) - Number(a.flag) || b.orders - a.orders);
}
