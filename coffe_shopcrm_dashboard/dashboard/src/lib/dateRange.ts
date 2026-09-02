import type { AnalyticsOrder } from "./types";

export const RANGE_PRESETS = [
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
  { key: "180d", label: "Last 6 months", days: 180 },
  { key: "all", label: "All time", days: null },
] as const;

export type RangeKey = (typeof RANGE_PRESETS)[number]["key"] | "custom";

export type CustomRange = { from: string; to: string }; // yyyy-mm-dd

// Relative presets ("last 30 days") anchor to the most recent order in the
// data, not the wall clock. With live/continuous data the latest order ≈ now,
// so this behaves exactly as expected; with a historical export whose newest
// row is weeks old, it still lands the window on real data instead of an empty
// stretch of calendar after the export. Falls back to now when there's no data.
function latestOrderTime(orders: AnalyticsOrder[]): number {
  let max = 0;
  for (const o of orders) {
    const t = new Date(o.order_date).getTime();
    if (t > max) max = t;
  }
  return max || Date.now();
}

export function filterByRange(
  orders: AnalyticsOrder[],
  range: RangeKey,
  custom?: CustomRange,
): AnalyticsOrder[] {
  if (range === "all") return orders;

  if (range === "custom") {
    if (!custom?.from && !custom?.to) return orders;
    let from = custom?.from ? new Date(custom.from).getTime() : -Infinity;
    let to = custom?.to ? new Date(custom.to).getTime() + 86_400_000 - 1 : Infinity;
    // If the user picks an end date before the start date, swap them rather
    // than returning an empty (broken-looking) result.
    if (from > to) [from, to] = [to, from];
    return orders.filter((o) => {
      const t = new Date(o.order_date).getTime();
      return t >= from && t <= to;
    });
  }

  const preset = RANGE_PRESETS.find((p) => p.key === range);
  if (!preset?.days) return orders;
  const from = latestOrderTime(orders) - preset.days * 86_400_000;
  return orders.filter((o) => new Date(o.order_date).getTime() >= from);
}
