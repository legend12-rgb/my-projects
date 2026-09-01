import type { AnalyticsOrder, CustomerMeta, Product } from "./types";
import { shortLabel } from "./data";

export type ProductIndex = Record<
  string,
  { label: string; short: string; profitPerBag: number; margin: number; type: string }
>;

export function indexProducts(products: Product[]): ProductIndex {
  const idx: ProductIndex = {};
  for (const p of products) {
    idx[p.product_id] = {
      label: `${p.coffee_type_name} · ${p.roast_type_name} · ${p.size_kg}kg`,
      short: shortLabel(p),
      profitPerBag: p.profit,
      margin: p.unit_price > 0 ? (p.profit / p.unit_price) * 100 : 0,
      type: p.coffee_type_name,
    };
  }
  return idx;
}

export function kpis(orders: AnalyticsOrder[], idx: ProductIndex) {
  let revenue = 0;
  let profit = 0;
  for (const o of orders) {
    revenue += o.total_amount;
    profit += o.quantity * (idx[o.product_id]?.profitPerBag ?? 0);
  }
  const n = orders.length;
  return {
    revenue,
    profit,
    orders: n,
    aov: n ? revenue / n : 0,
    marginPct: revenue ? (profit / revenue) * 100 : 0,
  };
}

export function profitByProduct(orders: AnalyticsOrder[], idx: ProductIndex, top = 10) {
  const acc = new Map<string, { revenue: number; profit: number }>();
  for (const o of orders) {
    const cur = acc.get(o.product_id) ?? { revenue: 0, profit: 0 };
    cur.revenue += o.total_amount;
    cur.profit += o.quantity * (idx[o.product_id]?.profitPerBag ?? 0);
    acc.set(o.product_id, cur);
  }
  return [...acc.entries()]
    .map(([id, v]) => ({
      label: idx[id]?.short ?? id,
      profit: Math.round(v.profit * 100) / 100,
      revenue: Math.round(v.revenue * 100) / 100,
      margin: idx[id]?.margin ?? 0,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, top);
}

export function typeMix(orders: AnalyticsOrder[], idx: ProductIndex) {
  const acc = new Map<string, { revenue: number; profit: number; margin: number }>();
  for (const o of orders) {
    const info = idx[o.product_id];
    if (!info) continue;
    const cur = acc.get(info.type) ?? { revenue: 0, profit: 0, margin: info.margin };
    cur.revenue += o.total_amount;
    cur.profit += o.quantity * info.profitPerBag;
    acc.set(info.type, cur);
  }
  const totRev = [...acc.values()].reduce((s, v) => s + v.revenue, 0) || 1;
  const totProf = [...acc.values()].reduce((s, v) => s + v.profit, 0) || 1;
  return [...acc.entries()]
    .map(([type, v]) => ({
      type,
      margin: Math.round(v.margin),
      revShare: (v.revenue / totRev) * 100,
      profitShare: (v.profit / totProf) * 100,
    }))
    .sort((a, b) => b.margin - a.margin);
}

export function loyaltyStats(orders: AnalyticsOrder[], meta: Record<string, CustomerMeta>) {
  let mSum = 0,
    mN = 0,
    nSum = 0,
    nN = 0;
  const ordersPerCust = new Map<string, number>();
  for (const o of orders) {
    if (o.loyalty_card_used) {
      mSum += o.total_amount;
      mN++;
    } else {
      nSum += o.total_amount;
      nN++;
    }
    ordersPerCust.set(o.customer_id, (ordersPerCust.get(o.customer_id) ?? 0) + 1);
  }
  let memberCustN = 0,
    memberOrders = 0,
    nonCustN = 0,
    nonOrders = 0,
    signup = 0,
    total = 0;
  for (const [, m] of Object.entries(meta)) {
    total++;
    if (m.loyalty_card) signup++;
  }
  for (const [cid, cnt] of ordersPerCust) {
    if (meta[cid]?.loyalty_card) {
      memberCustN++;
      memberOrders += cnt;
    } else {
      nonCustN++;
      nonOrders += cnt;
    }
  }
  return {
    memberAOV: mN ? mSum / mN : 0,
    nonAOV: nN ? nSum / nN : 0,
    memberFreq: memberCustN ? memberOrders / memberCustN : 0,
    nonFreq: nonCustN ? nonOrders / nonCustN : 0,
    signupRate: total ? (signup / total) * 100 : 0,
  };
}

export function customerMix(orders: AnalyticsOrder[], totalCustomers: number) {
  const perCust = new Map<string, number>();
  for (const o of orders) perCust.set(o.customer_id, (perCust.get(o.customer_id) ?? 0) + 1);
  let oneTime = 0,
    repeat = 0;
  for (const c of perCust.values()) c === 1 ? oneTime++ : repeat++;
  const dormant = Math.max(totalCustomers - perCust.size, 0);
  return { oneTime, repeat, dormant };
}

export function geography(orders: AnalyticsOrder[], meta: Record<string, CustomerMeta>) {
  const byCountry = new Map<string, number>();
  const byUsCity = new Map<string, number>();
  for (const o of orders) {
    const m = meta[o.customer_id];
    const country = m?.country ?? "Unknown";
    byCountry.set(country, (byCountry.get(country) ?? 0) + o.total_amount);
    if (country === "United States" && m?.city)
      byUsCity.set(m.city, (byUsCity.get(m.city) ?? 0) + o.total_amount);
  }
  const total = [...byCountry.values()].reduce((s, v) => s + v, 0) || 1;
  const countries = [...byCountry.entries()]
    .map(([country, revenue]) => ({ country, revenue, share: (revenue / total) * 100 }))
    .sort((a, b) => b.revenue - a.revenue);
  const usCities = [...byUsCity.entries()]
    .map(([city, revenue]) => ({ city, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
  return { countries, usCities, topShare: countries[0]?.share ?? 0 };
}

export function orderValueHistogram(orders: AnalyticsOrder[], binWidth = 20, maxV = 220) {
  const bins: { range: string; count: number; x0: number }[] = [];
  for (let x = 0; x < maxV; x += binWidth)
    bins.push({ range: `${x}`, count: 0, x0: x });
  for (const o of orders) {
    const i = Math.min(Math.floor(o.total_amount / binWidth), bins.length - 1);
    bins[i].count++;
  }
  const sorted = [...orders].map((o) => o.total_amount).sort((a, b) => a - b);
  const median = sorted.length
    ? sorted[Math.floor(sorted.length / 2)]
    : 0;
  return { bins, median };
}

export function hourly(orders: AnalyticsOrder[]) {
  const counts = new Array(24).fill(0);
  for (const o of orders) counts[new Date(o.order_date).getHours()]++;
  const out: { hour: string; count: number }[] = [];
  for (let h = 9; h <= 20; h++) out.push({ hour: `${h}`, count: counts[h] });
  return out;
}
