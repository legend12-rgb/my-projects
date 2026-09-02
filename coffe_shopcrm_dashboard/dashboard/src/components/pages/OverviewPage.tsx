"use client";

import { useMemo } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import {
  kpis,
  loyaltyStats,
  orderValueHistogram,
  profitByProduct,
  typeMix,
  typeSegments,
} from "@/lib/analytics";
import dynamic from "next/dynamic";
import { isToday } from "@/lib/format";
import { Finding, PageHeader, PageSkeleton } from "../ui";

// Demo-only "Place test order" control — git-ignored + env-gated.
// The dynamic import lives INSIDE the env-literal branch so that when
// NEXT_PUBLIC_DEMO isn't "1" (production / GitHub), the whole import is
// dead-code-eliminated and the git-ignored file is never required to build.
// It's only pulled in on a machine that has set NEXT_PUBLIC_DEMO=1 locally.
const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
const DemoOrderButton = DEMO
  ? dynamic(
      // @ts-ignore — optional git-ignored demo module; absent (and DCE'd) in production builds
      () => import("../DemoOrderButton"),
      { ssr: false, loading: () => null },
    )
  : () => null;
import KpiHeader from "../KpiHeader";
import ProfitByProduct from "../ProfitByProduct";
import TypeMixChart from "../TypeMixChart";
import OrderValueChart from "../OrderValueChart";
import SalesChart from "../SalesChart";
import ExpandableChart from "../ExpandableChart";
import RangeRecap from "../RangeRecap";
import TypeSegmentsCard from "../TypeSegmentsCard";
import OpsAlerts from "../OpsAlerts";
import DayDrill from "../DayDrill";

export default function OverviewPage() {
  const { ready, error, orders, idx, meta, products } = useDashboard();

  const k = useMemo(() => kpis(orders, idx), [orders, idx]);
  const today = useMemo(() => {
    let rev = 0,
      n = 0;
    for (const o of orders)
      if (isToday(o.order_date)) {
        rev += o.total_amount;
        n++;
      }
    return { rev, n };
  }, [orders]);
  const typeData = useMemo(() => typeMix(orders, idx), [orders, idx]);
  const segments = useMemo(() => typeSegments(orders, idx), [orders, idx]);
  const loyalty = useMemo(() => loyaltyStats(orders, meta), [orders, meta]);

  const findings = useMemo(() => {
    const rev = new Map<string, number>();
    const prof = new Map<string, number>();
    for (const o of orders) {
      rev.set(o.product_id, (rev.get(o.product_id) ?? 0) + o.total_amount);
      prof.set(
        o.product_id,
        (prof.get(o.product_id) ?? 0) + o.quantity * (idx[o.product_id]?.profitPerBag ?? 0),
      );
    }
    const byRev = [...rev.entries()].sort((a, b) => b[1] - a[1]);
    const byProf = [...prof.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
    const topRevId = byRev[0]?.[0];
    const profRank = topRevId ? byProf.indexOf(topRevId) + 1 : 0;
    const robusta = typeData.find((t) => t.type === "Robusta");
    const aovDelta = loyalty.nonAOV ? ((loyalty.memberAOV - loyalty.nonAOV) / loyalty.nonAOV) * 100 : 0;
    return {
      topRevLabel: topRevId ? idx[topRevId]?.short ?? topRevId : "—",
      profRank,
      robusta,
      aovDelta,
    };
  }, [orders, idx, typeData, loyalty]);

  if (error)
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-500">
        Failed to load: {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
      <PageHeader
        title="Overview"
        description="Where the money actually comes from · all-history + live"
        extra={DEMO ? <DemoOrderButton /> : undefined}
      />

      {!ready ? (
        <PageSkeleton />
      ) : (
        <>
          <div className="mb-5">
            <OpsAlerts products={products} />
          </div>

          <section className="grid gap-3 md:grid-cols-3">
            <Finding
              kicker="Revenue ≠ Profit"
              headline={`Your #1 seller (${findings.topRevLabel}) is only #${findings.profRank} by profit`}
              detail="Ranking the menu by revenue promotes big-bag volume that earns the least relative money. Profit tells a different story."
            />
            <Finding
              kicker="The volume trap"
              headline={`Robusta = ${(findings.robusta?.revShare ?? 0).toFixed(0)}% of revenue but ${(findings.robusta?.profitShare ?? 0).toFixed(0)}% of profit`}
              detail="Coffee type is the real lever. Liberica is the hidden engine; Robusta sells but barely pays. Margin is fixed by type."
            />
            <Finding
              kicker="Loyalty ≠ lift"
              headline={`Members spend ${findings.aovDelta >= 0 ? "+" : ""}${findings.aovDelta.toFixed(0)}% per order — i.e. no real difference`}
              detail="The program isn't driving bigger baskets. Full comparison on the Customers page."
            />
          </section>

          <div className="mt-8">
            <KpiHeader
              revenue={k.revenue}
              profit={k.profit}
              orders={k.orders}
              aov={k.aov}
              marginPct={k.marginPct}
              todayRevenue={today.rev}
              todayOrders={today.n}
            />
          </div>

          <div className="mt-4">
            <TypeSegmentsCard segments={segments} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ExpandableChart
                title="Profit contribution by product"
                hint="colored by coffee type"
                inlineRange
                orders={orders}
                compute={(o) => profitByProduct(o, idx, 10)}
                renderChart={(data) => <ProfitByProduct data={data} />}
                renderExpanded={(data) => <ProfitByProduct data={data} height={440} />}
                recap={(_, filtered) => {
                  const rk = kpis(filtered, idx);
                  return <RangeRecap revenue={rk.revenue} profit={rk.profit} orders={rk.orders} />;
                }}
              />
            </div>
            <ExpandableChart
              title="Revenue vs profit share by type"
              orders={orders}
              compute={(o) => typeMix(o, idx)}
              renderChart={(data) => <TypeMixChart data={data} />}
              recap={(_, filtered) => {
                const rk = kpis(filtered, idx);
                return <RangeRecap revenue={rk.revenue} profit={rk.profit} orders={rk.orders} />;
              }}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExpandableChart
              title="Order-value distribution"
              hint="median marked"
              orders={orders}
              compute={(o) => orderValueHistogram(o)}
              renderChart={(data) => <OrderValueChart bins={data.bins} median={data.median} />}
              renderExpanded={(data) => (
                <OrderValueChart bins={data.bins} median={data.median} height={360} />
              )}
              recap={(_, filtered) => {
                const rk = kpis(filtered, idx);
                return <RangeRecap revenue={rk.revenue} profit={rk.profit} orders={rk.orders} />;
              }}
            />
            <ExpandableChart
              title="Sales over time"
              hint="expand to look up a day's orders"
              demoTag="synthetic dates"
              inlineRange
              orders={orders}
              compute={(o) => o}
              renderChart={(data) => <SalesChart orders={data} />}
              renderExpanded={(data) => <SalesChart orders={data} height={360} />}
              recap={(_, filtered) => {
                const rk = kpis(filtered, idx);
                return <RangeRecap revenue={rk.revenue} profit={rk.profit} orders={rk.orders} />;
              }}
              renderExtra={(filtered) => <DayDrill orders={filtered} />}
            />
          </div>
        </>
      )}
    </div>
  );
}
