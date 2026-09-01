"use client";

import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ACCENT } from "@/lib/colors";
import { fmtMoney } from "@/lib/format";

type Bin = { range: string; count: number; x0: number };

export default function OrderValueChart({
  bins,
  median,
  binWidth = 20,
  height = 256,
}: {
  bins: Bin[];
  median: number;
  binWidth?: number;
  height?: number;
}) {
  const medBin = `${Math.floor(median / binWidth) * binWidth}`;
  return (
    <div className="w-full px-2 pb-3" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="x0"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-foreground/40"
            tickFormatter={(v: number) => `$${v}`}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-foreground/40"
            width={34}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            formatter={(v) => [`${v} orders`, "Count"]}
            labelFormatter={(l) => `$${l}–${Number(l) + binWidth}`}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              fontSize: 12,
              padding: "8px 12px",
            }}
          />
          <ReferenceLine
            x={medBin}
            stroke={ACCENT}
            strokeDasharray="4 3"
            label={{ value: `median ${fmtMoney(median)}`, position: "top", fontSize: 11, fill: ACCENT }}
          />
          <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
