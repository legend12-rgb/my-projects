"use client";

import { marginColor } from "@/lib/colors";

type Row = { type: string; margin: number; revShare: number; profitShare: number };

export default function TypeMixChart({ data }: { data: Row[] }) {
  return (
    <div className="space-y-4 px-5 pb-5 pt-1">
      <div className="flex items-center gap-4 text-[11px] text-foreground/45">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-foreground/25" /> revenue share
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm" style={{ background: marginColor(11) }} /> profit share
        </span>
      </div>
      {data.map((r) => {
        const delta = r.profitShare - r.revShare;
        return (
          <div key={r.type}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{r.type}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-foreground/45">{r.margin}% margin</span>
                <span
                  className={`text-xs font-medium ${
                    delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(0)}pt
                </span>
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-2.5 rounded-full bg-foreground/8">
                <div
                  className="h-2.5 rounded-full bg-foreground/25"
                  style={{ width: `${r.revShare}%` }}
                />
              </div>
              <div className="h-2.5 rounded-full bg-foreground/8">
                <div
                  className="h-2.5 rounded-full"
                  style={{ width: `${r.profitShare}%`, background: marginColor(r.margin) }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
