import type { ReactNode } from "react";
import { fmtNum, plural } from "@/lib/format";
import { Card } from "./ui";

const usd2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const usd0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/**
 * Number treatment: bold near-black value, de-emphasized "$".
 * `cents` controls precision — per the dashboard skill's data-ink rule, exact
 * cents only appear where they drive a decision (AOV, small live numbers);
 * aggregate totals round to whole dollars so the decimals aren't noise.
 */
function Money({ n, cents = false }: { n: number; cents?: boolean }) {
  if (!cents) {
    return (
      <span className="tabular-nums tracking-tight">
        <span className="text-foreground/45">$</span>
        <span className="font-semibold text-foreground">{usd0.format(n)}</span>
      </span>
    );
  }
  const [whole, dec] = usd2.format(n).split(".");
  return (
    <span className="tabular-nums tracking-tight">
      <span className="text-foreground/45">$</span>
      <span className="font-semibold text-foreground">{whole}</span>
      <span className="font-semibold text-foreground/40">.{dec}</span>
    </span>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
  pill,
  big,
  labelTitle,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: string;
  pill?: ReactNode;
  big?: boolean;
  labelTitle?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          {accent ? (
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
          ) : null}
          <span
            className={`text-[13px] font-medium text-foreground/60 ${labelTitle ? "cursor-help decoration-dotted underline-offset-2 hover:underline" : ""}`}
            title={labelTitle}
          >
            {label}
          </span>
        </span>
        {pill}
      </div>
      <div className={`mt-2.5 ${big ? "text-[27px] leading-none" : "text-[22px]"}`}>{value}</div>
      {sub ? <div className="mt-2 text-xs text-foreground/55">{sub}</div> : null}
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
      <Kpi
        label="Total Revenue"
        value={<Money n={revenue} />}
        sub={`${fmtNum(orders)} ${plural(orders, "order")}, all history`}
        accent="var(--coffee-3)"
        big
      />
      <Kpi
        label="Total Profit"
        value={<Money n={profit} />}
        sub="after cost of goods"
        accent="#2f9257"
        big
        pill={
          <span className="inline-flex items-center rounded-full bg-[#d9f2e1] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#2f9257]">
            {marginPct.toFixed(1)}% margin
          </span>
        }
      />
      <Kpi label="Avg Order Value" value={<Money n={aov} cents />} sub="per transaction" />
      <Kpi
        label="Today (live)"
        labelTitle="Realtime orders received since midnight — separate from, and not comparable in scale to, the all-history totals shown here."
        value={<Money n={todayRevenue} cents />}
        sub={`${fmtNum(todayOrders)} ${plural(todayOrders, "order")} since midnight`}
      />
    </div>
  );
}
