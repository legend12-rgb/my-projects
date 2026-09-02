"use client";

import { useId } from "react";
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
import { TYPE_COLOR, typeColor } from "@/lib/colors";

type Row = { label: string; profit: number; revenue: number; margin: number; type: string };

export default function ProfitByProduct({
  data,
  height = 320,
}: {
  data: Row[];
  height?: number;
}) {
  // Unique per instance — the card preview and the expanded modal both mount
  // this chart at once, so a shared static gradient id would collide in the DOM.
  const uid = useId().replace(/[:]/g, "");
  const gradId = (type: string) => `pg-${uid}-${type}`;
  return (
    <div className="w-full px-2 pb-3" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 18, left: 8, bottom: 0 }}>
          <defs>
            {Object.entries(TYPE_COLOR).map(([type, color]) => (
              <linearGradient key={type} id={gradId(type)} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={color} stopOpacity={1} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-foreground/40"
            tickFormatter={(v: number) => `$${v}`}
            tickLine={false}
            axisLine={{ stroke: "currentColor", strokeOpacity: 0.12, strokeDasharray: "3 3" }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-foreground/55"
            width={112}
            tickLine={false}
            axisLine={false}
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
          <Bar dataKey="profit" radius={[0, 6, 6, 0]}>
            {data.map((d) => (
              <Cell
                key={d.label}
                fill={TYPE_COLOR[d.type] ? `url(#${gradId(d.type)})` : typeColor(d.type)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
