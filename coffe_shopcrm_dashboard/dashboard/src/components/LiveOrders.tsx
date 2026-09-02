"use client";

import type { EnrichedOrder } from "@/lib/types";
import { fmtDateTime, fmtMoney, fmtTime } from "@/lib/format";
import { useDashboard } from "@/lib/DashboardContext";
import { Badge, InitialAvatar } from "./ui";

export default function LiveOrders({
  orders,
  newestId,
  maxHeight = 520,
}: {
  orders: EnrichedOrder[];
  newestId: string | null;
  maxHeight?: number;
}) {
  const { search } = useDashboard();
  const q = search.trim().toLowerCase();
  const rows = q
    ? orders.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.product_label.toLowerCase().includes(q),
      )
    : orders;
  return (
    <div className="overflow-y-auto" style={{ maxHeight }}>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-[var(--hairline)] text-left text-[11px] uppercase tracking-wide text-foreground/40">
            <th className="px-5 py-2.5 font-semibold">When</th>
            <th className="px-2 py-2.5 font-semibold">Customer</th>
            <th className="px-2 py-2.5 font-semibold">Product</th>
            <th className="hidden px-2 py-2.5 text-right font-semibold sm:table-cell">Qty</th>
            <th className="px-5 py-2.5 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-10 text-center text-sm text-foreground/45">
                {q ? `No orders match “${search}”.` : "Waiting for the first order…"}
              </td>
            </tr>
          ) : null}
          {rows.map((o) => (
            <tr
              key={o.order_id}
              className={`border-t border-black/5 dark:border-white/5 ${
                o.order_id === newestId ? "animate-[flash_1.4s_ease-out]" : ""
              }`}
            >
              <td className="whitespace-nowrap px-5 py-2 tabular-nums text-foreground/60">
                <span className="sm:hidden">{fmtTime(o.order_date)}</span>
                <span className="hidden sm:inline">{fmtDateTime(o.order_date)}</span>
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center gap-2">
                  <InitialAvatar name={o.customer_name} />
                  <span className="hidden max-w-[10rem] truncate sm:inline sm:max-w-none">
                    {o.customer_name}
                  </span>
                  {o.loyalty_card_used ? (
                    <span className="hidden sm:inline-flex">
                      <Badge tone="green">loyalty</Badge>
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-2 py-2 text-foreground/70">{o.product_label}</td>
              <td className="hidden px-2 py-2 text-right tabular-nums sm:table-cell">{o.quantity}</td>
              <td className="px-5 py-2 text-right font-medium tabular-nums">
                {fmtMoney(o.total_amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
