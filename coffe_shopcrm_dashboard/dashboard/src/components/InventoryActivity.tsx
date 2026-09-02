"use client";

import type { StockMovement } from "@/lib/types";
import { productLabel } from "@/lib/data";
import type { Product } from "@/lib/types";
import { fmtTime } from "@/lib/format";
import { Badge } from "./ui";

export default function InventoryActivity({
  movements,
  products,
}: {
  movements: StockMovement[];
  products: Product[];
}) {
  const labels = new Map(products.map((p) => [p.product_id, productLabel(p)]));
  if (movements.length === 0)
    return (
      <div className="flex h-40 items-center justify-center px-5 pb-4 text-sm text-foreground/40">
        Waiting for live inventory changes…
      </div>
    );
  return (
    <ul className="max-h-[420px] space-y-1 overflow-y-auto px-3 pb-3">
      {movements.map((m) => (
        <li
          key={m.movement_id}
          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm"
        >
          <span className="flex items-center gap-2">
            <Badge tone={m.movement_type === "restock" ? "green" : "amber"}>
              {m.movement_type}
            </Badge>
            <span className="text-foreground/70">{labels.get(m.product_id) ?? m.product_id}</span>
          </span>
          <span className="flex items-center gap-3 tabular-nums text-foreground/55">
            <span className={m.delta < 0 ? "text-red-500" : "text-emerald-500"}>
              {m.delta > 0 ? `+${m.delta}` : m.delta}
            </span>
            <span className="text-foreground/40">→ {m.stock_after}</span>
            <span className="text-xs text-foreground/35">{fmtTime(m.created_at)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
