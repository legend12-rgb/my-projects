"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type Row = { hour: string; count: number };

// 24h hour string ("9".."20") -> plain 12h number ("9".."12","1".."8") — no
// am/pm suffix on the axis itself, per the "keep it simple" request.
function to12h(h: string): string {
  const n = Number(h) % 12;
  return String(n === 0 ? 12 : n);
}
function to12hLabel(h: string): string {
  const n = Number(h);
  const period = n < 12 ? "AM" : "PM";
  return `${to12h(h)}:00 ${period}`;
}

export default function HourlyChart({
  data,
  height = 160,
}: {
  data: Row[];
  height?: number;
}) {
  return (
    <div className="w-full px-2" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "currentColor" }}
            className="text-foreground/40"
            tickFormatter={to12h}
            interval={1}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            formatter={(v) => [`${v} orders`, "Count"]}
            labelFormatter={(l) => to12hLabel(String(l))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              fontSize: 12,
              padding: "8px 12px",
            }}
          />
          <Bar dataKey="count" fill="rgba(120,120,120,0.5)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
