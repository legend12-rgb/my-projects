"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import {
  fetchAnalyticsOrders,
  fetchCustomerCount,
  fetchCustomerMeta,
  fetchProducts,
  fetchRecentMovements,
  fetchRecentOrders,
  productLabel,
} from "./data";
import { indexProducts, type ProductIndex } from "./analytics";
import type {
  AnalyticsOrder,
  CustomerMeta,
  EnrichedOrder,
  OrderRow,
  Product,
  StockMovement,
} from "./types";

type DashboardData = {
  ready: boolean;
  error: string | null;
  live: boolean;
  products: Product[];
  orders: AnalyticsOrder[];
  meta: Record<string, CustomerMeta>;
  custCount: number;
  feed: EnrichedOrder[];
  movements: StockMovement[];
  newestId: string | null;
  idx: ProductIndex;
  lastUpdate: number;
  search: string;
  setSearch: (s: string) => void;
};

const DashboardCtx = createContext<DashboardData | null>(null);

/**
 * Owns the single realtime subscription and all fetched data for the whole
 * app. Lives in the root layout so it survives client-side navigation
 * between pages — each route just reads a slice of it instead of
 * re-subscribing to Supabase Realtime on every navigation.
 */
export function DashboardProvider({ children }: { children: ReactNode }) {
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
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [search, setSearch] = useState("");

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
        const [prods, count, m, recent, all, moves] = await Promise.all([
          fetchProducts(),
          fetchCustomerCount(),
          fetchCustomerMeta(),
          fetchRecentOrders(50),
          fetchAnalyticsOrders(),
          fetchRecentMovements(30),
        ]);
        if (cancelled) return;
        metaRef.current = m;
        setProducts(prods);
        setCustCount(count);
        setMeta(m);
        setFeed(recent);
        setOrders(all);
        setMovements(moves);
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
              setFeed((f) => [enriched, ...f].slice(0, 50));
              setNewestId(row.order_id);
              setLastUpdate(Date.now());
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
                [
                  { ...mv, delta: Number(mv.delta), stock_after: Number(mv.stock_after) },
                  ...ms,
                ].slice(0, 30),
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

  const value: DashboardData = {
    ready,
    error,
    live,
    products,
    orders,
    meta,
    custCount,
    feed,
    movements,
    newestId,
    idx,
    lastUpdate,
    search,
    setSearch,
  };

  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}

export function useDashboard(): DashboardData {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
