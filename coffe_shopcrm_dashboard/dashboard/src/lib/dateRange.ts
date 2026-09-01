import type { AnalyticsOrder } from "./types";

export const RANGE_PRESETS = [
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
  { key: "180d", label: "Last 6 months", days: 180 },
  { key: "all", label: "All time", days: null },
] as const;

export type RangeKey = (typeof RANGE_PRESETS)[number]["key"] | "custom";

export type CustomRange = { from: string; to: string }; // yyyy-mm-dd

export function filterByRange(
  orders: AnalyticsOrder[],
  range: RangeKey,
  custom?: CustomRange,
): AnalyticsOrder[] {
  if (range === "all") return orders;

  if (range === "custom") {
    if (!custom?.from && !custom?.to) return orders;
    const from = custom?.from ? new Date(custom.from).getTime() : -Infinity;
    const to = custom?.to ? new Date(custom.to).getTime() + 86_400_000 - 1 : Infinity;
    return orders.filter((o) => {
      const t = new Date(o.order_date).getTime();
      return t >= from && t <= to;
    });
  }

  const preset = RANGE_PRESETS.find((p) => p.key === range);
  if (!preset?.days) return orders;
  const from = Date.now() - preset.days * 86_400_000;
  return orders.filter((o) => new Date(o.order_date).getTime() >= from);
}
