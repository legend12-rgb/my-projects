"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchAnalyticsOrders,
  fetchCustomerCount,
  fetchCustomerMeta,
  fetchProducts,
  fetchRecentOrders,
  productLabel,
} from "@/lib/data";
import {
  customerMix,
  geography,
  hourly,
  indexProducts,
  kpis,
  loyaltyStats,
  orderValueHistogram,
  profitByProduct,
  typeMix,
} from "@/lib/analytics";
import type {
  AnalyticsOrder,
  CustomerMeta,
  EnrichedOrder,
  OrderRow,
  Product,
  StockMovement,
} from "@/lib/types";
import { fmtMoney, isToday } from "@/lib/format";
import { Card, CardHeader, SectionHeader, Finding, DemoTag, LivePill } from "./ui";
import KpiHeader from "./KpiHeader";
import ProfitByProduct from "./ProfitByProduct";
import TypeMixChart from "./TypeMixChart";
import OrderValueChart from "./OrderValueChart";
import SalesChart from "./SalesChart";
import CustomerMixChart from "./CustomerMixChart";
import LoyaltyScorecard from "./LoyaltyScorecard";
import GeographyPanel from "./GeographyPanel";
import HourlyChart from "./HourlyChart";
import ProductsTable from "./ProductsTable";
import InventoryActivity from "./InventoryActivity";
import LiveOrders from "./LiveOrders";
import ExpandableChart from "./ExpandableChart";
import RangeRecap from "./RangeRecap";

export default function Dashboard() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AnalyticsOrder[]>([]);
  const [meta, setMeta] = useState<Record<string, CustomerMeta>>({});
  const [custCount, setCustCount] = useState(0);
  const [feed, setFeed] = useState<EnrichedOrder[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [newestId, setNewestId] = useState<string | null>(null);

  const metaRef = useRef<Record<string, CustomerMeta>>({});
  const labelRef = useRef<Record<string, string>>({});
  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);
  useEffect(() => {
    labelRef.current = Object.fromEntries(products.map((p) => [p.product_id, productLabel(p)]));
  }, [products]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    (async () => {
      try {
        const [prods, count, m, recent, all] = await Promise.all([
          fetchProducts(),
          fetchCustomerCount(),
          fetchCustomerMeta(),
          fetchRecentOrders(20),
          fetchAnalyticsOrders(),
        ]);
        if (cancelled) return;
        metaRef.current = m;
        setProducts(prods);
        setCustCount(count);
        setMeta(m);
        setFeed(recent);
        setOrders(all);
        setReady(true);

        channel = supabase
          .channel("dashboard")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "orders" },
            (payload) => {
              const row = payload.new as OrderRow;
              const enriched: EnrichedOrder = {
                ...row,
                total_amount: Number(row.total_amount),
                quantity: Number(row.quantity),
                customer_name: metaRef.current[row.customer_id]?.name ?? row.customer_id,
                product_label: labelRef.current[row.product_id] ?? row.product_id,
              };
              setFeed((f) => [enriched, ...f].slice(0, 20));
              setNewestId(row.order_id);
              setOrders((o) => [
                ...o,
                {
                  order_date: row.order_date,
                  total_amount: Number(row.total_amount),
                  quantity: Number(row.quantity),
                  product_id: row.product_id,
                  customer_id: row.customer_id,
                  loyalty_card_used: row.loyalty_card_used,
                },
              ]);
            },
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "products" },
            (payload) => {
              const np = payload.new as Product;
              setProducts((ps) =>
                ps.map((p) =>
                  p.product_id === np.product_id
                    ? {
                        ...p,
                        ...np,
                        unit_price: Number(np.unit_price),
                        profit: Number(np.profit),
                        size_kg: Number(np.size_kg),
                        stock_quantity: Number(np.stock_quantity),
                      }
                    : p,
                ),
              );
            },
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "customers" },
            (payload) => {
              const nc = payload.new as {
                customer_id: string;
                name: string;
                loyalty_card: boolean;
                country: string | null;
                city: string | null;
              };
              setMeta((mm) => ({
                ...mm,
                [nc.customer_id]: {
                  name: nc.name,
                  loyalty_card: nc.loyalty_card,
                  country: nc.country,
                  city: nc.city,
                },
              }));
              setCustCount((c) => c + 1);
            },
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "stock_movements" },
            (payload) => {
              const mv = payload.new as StockMovement;
              setMovements((ms) =>
                [{ ...mv, delta: Number(mv.delta), stock_after: Number(mv.stock_after) }, ...ms].slice(
                  0,
                  8,
                ),
              );
            },
          )
          .subscribe((status) => setLive(status === "SUBSCRIBED"));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const idx = useMemo(() => indexProducts(products), [products]);
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
  const loyalty = useMemo(() => loyaltyStats(orders, meta), [orders, meta]);
  const mix = useMemo(() => customerMix(orders, custCount), [orders, custCount]);
  const geo = useMemo(() => geography(orders, meta), [orders, meta]);

  const findings = useMemo(() => {
    const rev = new Map<string, number>();
    const prof = new Map<string, number>();
    for (const o of orders) {
      rev.set(o.product_id, (rev.get(o.product_id) ?? 0) + o.total_amount);
      prof.set(o.product_id, (prof.get(o.product_id) ?? 0) + o.quantity * (idx[o.product_id]?.profitPerBag ?? 0));
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
      robustaRev: robusta?.revShare ?? 0,
      robustaProfit: robusta?.profitShare ?? 0,
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
    <div className="mx-auto max-w-7xl px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Coffee Shop · CRM Analytics</h1>
          <p className="text-sm text-foreground/50">
            Where the money actually comes from · read-only (anon key)
          </p>
        </div>
        {live ? <LivePill /> : <span className="text-xs text-foreground/40">connecting…</span>}
      </header>

      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-foreground/5" />
          ))}
        </div>
      ) : (
        <>
          {/* Lead with the counterintuitive findings */}
          <section className="grid gap-3 md:grid-cols-3">
            <Finding
              kicker="Revenue ≠ Profit"
              headline={`Your #1 seller (${findings.topRevLabel}) is only #${findings.profRank} by profit`}
              detail="Ranking the menu by revenue promotes big-bag volume that earns the least relative money. Profit tells a different story."
            />
            <Finding
              kicker="The volume trap"
              headline={`Robusta = ${findings.robustaRev.toFixed(0)}% of revenue but ${findings.robustaProfit.toFixed(0)}% of profit`}
              detail="Coffee type is the real lever. Liberica is the hidden engine; Robusta sells but barely pays. Margin is fixed by type."
            />
            <Finding
              kicker="Loyalty ≠ lift"
              headline={`Members spend ${findings.aovDelta >= 0 ? "+" : ""}${findings.aovDelta.toFixed(0)}% per order — i.e. no real difference`}
              detail="The program isn't driving bigger baskets. That's the honest result; its value would have to be retention, not spend."
            />
          </section>

          {/* MONEY */}
          <SectionHeader label="Money — where profit comes from" />
          <KpiHeader
            revenue={k.revenue}
            profit={k.profit}
            orders={k.orders}
            aov={k.aov}
            marginPct={k.marginPct}
            todayRevenue={today.rev}
            todayOrders={today.n}
          />
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ExpandableChart
                title="Profit contribution by product"
                hint="bar color = margin %"
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
              demoTag="synthetic dates"
              orders={orders}
              compute={(o) => o}
              renderChart={(data) => <SalesChart orders={data} />}
              renderExpanded={(data) => <SalesChart orders={data} height={420} />}
              recap={(_, filtered) => {
                const rk = kpis(filtered, idx);
                return <RangeRecap revenue={rk.revenue} profit={rk.profit} orders={rk.orders} />;
              }}
            />
          </div>

          {/* CUSTOMERS */}
          <SectionHeader label="Customers" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="Customer mix" />
              <CustomerMixChart oneTime={mix.oneTime} repeat={mix.repeat} dormant={mix.dormant} />
            </Card>
            <Card>
              <CardHeader title="Loyalty scorecard" />
              <LoyaltyScorecard
                memberAOV={loyalty.memberAOV}
                nonAOV={loyalty.nonAOV}
                memberFreq={loyalty.memberFreq}
                nonFreq={loyalty.nonFreq}
                signupRate={loyalty.signupRate}
              />
            </Card>
            <Card>
              <CardHeader title="Geography" hint="concentration risk" />
              <GeographyPanel
                countries={geo.countries}
                usCities={geo.usCities}
                topShare={geo.topShare}
              />
            </Card>
          </div>

          {/* INVENTORY & LIVE */}
          <SectionHeader label="Inventory & live activity" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="Products" hint="live stock · synthetic" />
              <ProductsTable products={products} />
            </Card>
            <Card>
              <CardHeader title="Inventory activity" hint="live ledger" />
              <InventoryActivity movements={movements} products={products} />
            </Card>
            <ExpandableChart
              title="Orders by hour"
              hint="9am–8pm, no daypart signal"
              demoTag="uniform · synthetic"
              orders={orders}
              compute={(o) => hourly(o)}
              renderChart={(data) => <HourlyChart data={data} />}
              renderExpanded={(data) => <HourlyChart data={data} height={240} />}
              recap={(_, filtered) => {
                const rk = kpis(filtered, idx);
                return <RangeRecap revenue={rk.revenue} profit={rk.profit} orders={rk.orders} />;
              }}
            />
          </div>

          <SectionHeader label="Live orders" note="newest first · last 20" />
          <Card>
            <div className="flex items-center justify-end px-5 pt-3">
              {live ? <LivePill /> : null}
            </div>
            <LiveOrders orders={feed} newestId={newestId} />
          </Card>
        </>
      )}
    </div>
  );
}
