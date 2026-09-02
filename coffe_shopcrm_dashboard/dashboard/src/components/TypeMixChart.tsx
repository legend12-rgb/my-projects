"use client";

import { typeColor } from "@/lib/colors";

type Row = { type: string; margin: number; revShare: number; profitShare: number };

export default function TypeMixChart({ data }: { data: Row[] }) {
  return (
    <div className="space-y-4 px-5 pb-5 pt-1">
      <div className="flex items-center gap-4 text-[11px] text-foreground/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-foreground/20" /> revenue share
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-foreground/45" /> profit share (colored by type)
        </span>
      </div>
      {data.map((r) => {
        const delta = r.profitShare - r.revShare;
        const color = typeColor(r.type);
        return (
          <div key={r.type}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
                {r.type}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-foreground/50">{r.margin}% margin</span>
                <span
                  className={`text-xs font-semibold ${
                    delta >= 0 ? "text-[#2f9257]" : "text-[#cf5257]"
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
                  className="h-2.5 rounded-full"
                  style={{ width: `${r.revShare}%`, background: color, opacity: 0.35 }}
                />
              </div>
              <div className="h-2.5 rounded-full bg-foreground/8">
                <div
                  className="h-2.5 rounded-full"
                  style={{ width: `${r.profitShare}%`, background: color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
