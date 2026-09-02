"use client";

import { useMemo, useState } from "react";
import type { AnalyticsOrder } from "@/lib/types";
import { useDashboard } from "@/lib/DashboardContext";
import { dayKey, fmtMoney, fmtTime, plural } from "@/lib/format";
import { TypeAvatar, InitialAvatar } from "./ui";

/**
 * "Enter a date → that day's orders open up." Given a set of orders (already
 * range-filtered by the enclosing modal), the owner picks a single day and sees
 * every order rung up that day, enriched with product + customer names.
 */
export default function DayDrill({ orders }: { orders: AnalyticsOrder[] }) {
  const { meta, idx } = useDashboard();

  // Default to the most recent day present in the data.
  const defaultDay = useMemo(() => {
    let max = "";
    for (const o of orders) {
      const k = dayKey(o.order_date);
      if (k > max) max = k;
    }
    return max || dayKey(new Date().toISOString());
  }, [orders]);

  const [day, setDay] = useState(defaultDay);

  const rows = useMemo(
    () =>
      orders
        .filter((o) => dayKey(o.order_date) === day)
        .sort((a, b) => b.order_date.localeCompare(a.order_date)),
    [orders, day],
  );

  const total = rows.reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="border-t border-[var(--hairline)] px-5 pb-2 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-foreground/80">Look up a day</span>
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded-lg border border-[var(--hairline)] bg-surface px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-foreground/30"
          />
        </div>
        <div className="text-sm text-foreground/60">
          <span className="font-semibold tabular-nums text-foreground/85">{rows.length}</span>{" "}
          {plural(rows.length, "order")} ·{" "}
          <span className="font-semibold tabular-nums text-foreground/85">{fmtMoney(total)}</span>
        </div>
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-[var(--hairline)]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-[var(--hairline)] text-left text-[11px] uppercase tracking-wide text-foreground/45">
              <th className="px-4 py-2 font-semibold">Time</th>
              <th className="px-2 py-2 font-semibold">Product</th>
              <th className="px-2 py-2 font-semibold">Customer</th>
              <th className="px-2 py-2 text-right font-semibold">Qty</th>
              <th className="px-4 py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-foreground/45">
                  No orders on this day.
                </td>
              </tr>
            ) : null}
            {rows.map((o, i) => {
              const info = idx[o.product_id];
              const name = meta[o.customer_id]?.name ?? o.customer_id;
              return (
                <tr
                  key={`${o.order_date}-${o.product_id}-${o.customer_id}-${o.total_amount}-${i}`}
                  className="border-t border-black/5 dark:border-white/5"
                >
                  <td className="whitespace-nowrap px-4 py-2 tabular-nums text-foreground/60">
                    {fmtTime(o.order_date)}
                  </td>
                  <td className="px-2 py-2">
                    <span className="flex items-center gap-2">
                      {info ? <TypeAvatar type={info.type} /> : null}
                      <span className="text-foreground/80">{info?.label ?? o.product_id}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className="flex items-center gap-2">
                      <InitialAvatar name={name} />
                      <span className="truncate text-foreground/75">{name}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">{o.quantity}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">
                    {fmtMoney(o.total_amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
