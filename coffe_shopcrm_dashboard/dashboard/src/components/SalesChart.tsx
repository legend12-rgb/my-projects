"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dayKey, fmtMoney } from "@/lib/format";

type SalesPoint = { order_date: string; total_amount: number };

export default function SalesChart({
  orders,
  height = 256,
}: {
  orders: SalesPoint[];
  height?: number;
}) {
  const data = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const o of orders) {
      const k = dayKey(o.order_date);
      byDay.set(k, (byDay.get(k) ?? 0) + o.total_amount);
    }
    return [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, revenue]) => ({ day, revenue: Math.round(revenue * 100) / 100 }));
  }, [orders]);

  return (
    <div className="w-full px-2 pb-3" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c2703d" stopOpacity={0.42} />
              <stop offset="100%" stopColor="#c2703d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-foreground/40"
            tickFormatter={(d: string) => d.slice(5)}
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-foreground/40"
            width={52}
            tickFormatter={(v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
          />
          <Tooltip
            formatter={(v) => [fmtMoney(Number(v)), "Revenue"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              fontSize: 12,
              padding: "8px 12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#c2703d"
            strokeWidth={2}
            fill="url(#rev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
