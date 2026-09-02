"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";

/**
 * Operational "am I in control?" strip for the Overview — the dashboard skill
 * lists a low-stock alert as a core Overview question. Answers the restock
 * decision at a glance and links to the Inventory page to act.
 */
export default function OpsAlerts({ products }: { products: Product[] }) {
  const critical = products.filter((p) => p.stock_quantity <= 5);
  const watch = products.filter((p) => p.stock_quantity > 5 && p.stock_quantity <= 15);

  if (critical.length === 0 && watch.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[var(--hairline)] bg-surface px-4 py-2.5 text-sm">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d9f2e1] text-[#2f9257]">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-foreground/65">All stock levels healthy — nothing to restock.</span>
      </div>
    );
  }

  return (
    <Link
      href="/inventory"
      className="group flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-[#e6a23c]/30 bg-[#fbe8cf]/40 px-4 py-2.5 text-sm transition-colors hover:bg-[#fbe8cf]/70"
    >
      <span className="flex items-center gap-2 font-medium text-foreground/80">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="text-[#bd7524]">
          <path d="M8 1.5l6.5 11.5H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M8 6v3.5M8 11.2v.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Needs attention
      </span>
      {critical.length > 0 ? (
        <span className="text-foreground/70">
          <span className="font-semibold text-[#cf5257]">{critical.length}</span> critically low
          {critical.length <= 3 ? ` (${critical
            .map((p) => `${p.coffee_type_name[0]}·${p.roast_type_name[0]}·${p.size_kg}kg`)
            .join(", ")})` : ""}
        </span>
      ) : null}
      {watch.length > 0 ? (
        <span className="text-foreground/60">
          <span className="font-semibold text-[#bd7524]">{watch.length}</span> on watch
        </span>
      ) : null}
      <span className="ml-auto text-xs font-medium text-foreground/45 transition-colors group-hover:text-foreground/70">
        Review inventory →
      </span>
    </Link>
  );
}
