"use client";

import { fmtNum } from "@/lib/format";

export default function CustomerMixChart({
  oneTime,
  repeat,
  dormant,
}: {
  oneTime: number;
  repeat: number;
  dormant: number;
}) {
  const total = oneTime + repeat + dormant || 1;
  const segs = [
    { key: "Repeat", n: repeat, color: "hsl(148,50%,45%)", desc: "2–6 orders" },
    { key: "One-time", n: oneTime, color: "#c2703d", desc: "single order" },
    { key: "Dormant", n: dormant, color: "hsl(0,0%,62%)", desc: "never ordered" },
  ];
  return (
    <div className="px-5 pb-5 pt-1">
      <div className="flex h-5 w-full overflow-hidden rounded-full">
        {segs.map((s) => (
          <div
            key={s.key}
            style={{ width: `${(s.n / total) * 100}%`, background: s.color }}
            title={`${s.key}: ${s.n}`}
          />
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {segs.map((s) => (
          <div key={s.key} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span className="font-medium">{s.key}</span>
              <span className="text-xs text-foreground/40">{s.desc}</span>
            </span>
            <span className="tabular-nums">
              {fmtNum(s.n)}
              <span className="ml-1.5 text-xs text-foreground/40">
                {((s.n / total) * 100).toFixed(0)}%
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-[#c2703d]/25 bg-[#c2703d]/5 p-3 text-xs leading-relaxed text-foreground/70">
        <span className="font-semibold text-[#c2703d]">{fmtNum(dormant)} dormant customers</span>{" "}
        ({((dormant / total) * 100).toFixed(0)}%) have never ordered — an invisible reactivation
        list, addressable now that customers are identifiable.
      </div>
    </div>
  );
}
