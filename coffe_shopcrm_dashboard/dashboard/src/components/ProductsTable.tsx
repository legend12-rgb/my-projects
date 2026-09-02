"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { productLabel } from "@/lib/data";
import { fmtMoney } from "@/lib/format";
import { useDashboard } from "@/lib/DashboardContext";
import { Badge, TypeAvatar } from "./ui";

const LOW = 15;

function stockTone(n: number): "green" | "amber" | "red" {
  if (n <= 5) return "red";
  if (n <= LOW) return "amber";
  return "green";
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const prevStock = useRef<Record<string, number>>({});
  const [flash, setFlash] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    const changes: Record<string, "up" | "down"> = {};
    for (const p of products) {
      const prev = prevStock.current[p.product_id];
      if (prev !== undefined && prev !== p.stock_quantity)
        changes[p.product_id] = p.stock_quantity > prev ? "up" : "down";
      prevStock.current[p.product_id] = p.stock_quantity;
    }
    if (Object.keys(changes).length) {
      setFlash((f) => ({ ...f, ...changes }));
      const t = setTimeout(
        () =>
          setFlash((f) => {
            const next = { ...f };
            for (const k of Object.keys(changes)) delete next[k];
            return next;
          }),
        1300,
      );
      return () => clearTimeout(t);
    }
  }, [products]);

  const { search } = useDashboard();
  const q = search.trim().toLowerCase();
  const sorted = [...products]
    .filter((p) => !q || productLabel(p).toLowerCase().includes(q))
    .sort((a, b) => a.stock_quantity - b.stock_quantity);

  return (
    <div className="max-h-[620px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-[var(--hairline)] text-left text-[11px] uppercase tracking-wide text-foreground/40">
            <th className="px-5 py-2.5 font-semibold">Product</th>
            <th className="px-2 py-2.5 text-right font-semibold">Price</th>
            <th className="px-5 py-2.5 text-right font-semibold">Stock</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-10 text-center text-sm text-foreground/45">
                {q ? `No products match “${search}”.` : "No products yet."}
              </td>
            </tr>
          ) : null}
          {sorted.map((p) => (
            <tr key={p.product_id} className="border-t border-black/5 dark:border-white/5">
              <td className="px-5 py-2">
                <span className="flex items-center gap-2.5">
                  <TypeAvatar type={p.coffee_type_name} />
                  <span className="text-foreground/80">{productLabel(p)}</span>
                </span>
              </td>
              <td className="px-2 py-2 text-right tabular-nums text-foreground/70">
                {fmtMoney(p.unit_price)}
              </td>
              <td className="px-5 py-2 text-right">
                <span
                  className={`inline-flex items-center gap-2 rounded-md px-1.5 py-0.5 transition-colors ${
                    flash[p.product_id] === "down"
                      ? "bg-red-500/10"
                      : flash[p.product_id] === "up"
                        ? "bg-emerald-500/10"
                        : ""
                  }`}
                >
                  <span className="tabular-nums">{p.stock_quantity}</span>
                  <Badge tone={stockTone(p.stock_quantity)}>
                    {p.stock_quantity <= 5 ? "low" : p.stock_quantity <= LOW ? "watch" : "ok"}
                  </Badge>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
