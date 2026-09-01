"use client";

import type { EnrichedOrder } from "@/lib/types";
import { fmtDateTime, fmtMoney } from "@/lib/format";
import { Badge } from "./ui";

export default function LiveOrders({
  orders,
  newestId,
}: {
  orders: EnrichedOrder[];
  newestId: string | null;
}) {
  return (
    <div className="max-h-[520px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white/80 backdrop-blur dark:bg-neutral-900/80">
          <tr className="text-left text-xs uppercase tracking-wide text-foreground/45">
            <th className="px-5 py-2 font-medium">When</th>
            <th className="px-2 py-2 font-medium">Customer</th>
            <th className="px-2 py-2 font-medium">Product</th>
            <th className="px-2 py-2 text-right font-medium">Qty</th>
            <th className="px-5 py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.order_id}
              className={`border-t border-black/5 dark:border-white/5 ${
                o.order_id === newestId ? "animate-[flash_1.4s_ease-out]" : ""
              }`}
            >
              <td className="whitespace-nowrap px-5 py-2 tabular-nums text-foreground/60">
                {fmtDateTime(o.order_date)}
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center gap-2">
                  <span className="truncate">{o.customer_name}</span>
                  {o.loyalty_card_used ? <Badge tone="green">loyalty</Badge> : null}
                </div>
              </td>
              <td className="px-2 py-2 text-foreground/70">{o.product_label}</td>
              <td className="px-2 py-2 text-right tabular-nums">{o.quantity}</td>
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
