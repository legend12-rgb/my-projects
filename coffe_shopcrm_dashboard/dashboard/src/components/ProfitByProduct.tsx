"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtMoney } from "@/lib/format";
import { marginColor } from "@/lib/colors";

type Row = { label: string; profit: number; revenue: number; margin: number };

export default function ProfitByProduct({
  data,
  height = 320,
}: {
  data: Row[];
  height?: number;
}) {
  return (
    <div className="w-full px-2 pb-3" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 18, left: 8, bottom: 0 }}>
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-foreground/40"
            tickFormatter={(v: number) => `$${v}`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-foreground/55"
            width={112}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            formatter={(v, _n, item) => {
              const r = item?.payload as Row;
              return [`${fmtMoney(Number(v))} · ${r.margin.toFixed(0)}% margin`, "Profit"];
            }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              fontSize: 12,
              padding: "8px 12px",
            }}
          />
          <Bar dataKey="profit" radius={[0, 5, 5, 0]}>
            {data.map((d) => (
              <Cell key={d.label} fill={marginColor(d.margin)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
