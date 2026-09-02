"use client";

import type { TypeSegment } from "@/lib/analytics";
import { typeColor } from "@/lib/colors";
import { fmtMoney } from "@/lib/format";
import { Card, InfoPill } from "./ui";

/**
 * The reference's "Cust. Acquisition Cost" segmented card, re-cast for coffee:
 * one column per coffee type with a colored bullet, a headline metric, the
 * profit-share line, and a colored magnitude bar along the bottom. The bar is
 * margin-colored (our honest red→green encoding), and the highest-margin type
 * wears the "Most profitable" tag — the reference's "Most Effective".
 */
export default function TypeSegmentsCard({ segments }: { segments: TypeSegment[] }) {
  const maxRev = Math.max(...segments.map((s) => s.revenue), 1);
  const totalRev = segments.reduce((s, v) => s + v.revenue, 0);
  const totalProfit = segments.reduce((s, v) => s + v.profit, 0);
  const blended = totalRev ? (totalProfit / totalRev) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground/80">
            Revenue &amp; margin by coffee type
          </h2>
          <InfoPill>{blended.toFixed(1)}% blended</InfoPill>
        </div>
        <span className="text-xs text-foreground/45">bar length = revenue · color = coffee type</span>
      </div>

      <div className="mt-3 grid grid-cols-2 divide-y divide-[var(--hairline)] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {segments.map((s) => (
          <div key={s.type} className="relative flex flex-col px-5 pb-6 pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ background: typeColor(s.type) }}
                />
                <span className="text-sm font-medium text-foreground/80">{s.type}</span>
              </span>
              {s.mostProfitable ? <InfoPill tone="green">Top margin</InfoPill> : null}
            </div>

            <div className="mt-3 text-lg font-semibold tabular-nums tracking-tight">
              {fmtMoney(s.revenue)}
            </div>
            <div className="mt-0.5 text-xs text-foreground/45">
              <span className="font-medium text-foreground/60">{s.margin}%</span> margin ·{" "}
              {s.profitShare.toFixed(0)}% of profit
            </div>

            {/* magnitude bar pinned to the bottom edge, like the reference */}
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-foreground/6">
              <div
                className="h-full origin-left"
                style={{
                  width: `${(s.revenue / maxRev) * 100}%`,
                  background: typeColor(s.type),
                  animation: "barGrow 600ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
