import { fmtMoney, fmtNum } from "@/lib/format";
import { Card } from "./ui";

function Kpi({
  label,
  value,
  sub,
  accent,
  big,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  big?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        {accent ? (
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
        ) : null}
        <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
          {label}
        </span>
      </div>
      <div
        className={`mt-2 font-semibold tabular-nums tracking-tight ${
          big ? "text-4xl" : "text-2xl"
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-foreground/45">{sub}</div> : null}
    </Card>
  );
}

export default function KpiHeader({
  revenue,
  profit,
  orders,
  aov,
  marginPct,
  todayRevenue,
  todayOrders,
}: {
  revenue: number;
  profit: number;
  orders: number;
  aov: number;
  marginPct: number;
  todayRevenue: number;
  todayOrders: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi label="Total Revenue" value={fmtMoney(revenue)} sub={`${fmtNum(orders)} orders`} accent="#c2703d" big />
      <Kpi
        label="Total Profit"
        value={fmtMoney(profit)}
        sub={`${marginPct.toFixed(1)}% blended margin`}
        accent="hsl(148,55%,45%)"
        big
      />
      <Kpi label="Avg Order Value" value={fmtMoney(aov)} sub="all history" />
      <Kpi
        label="Today (live)"
        value={fmtMoney(todayRevenue)}
        sub={`${fmtNum(todayOrders)} orders since midnight`}
      />
    </div>
  );
}
