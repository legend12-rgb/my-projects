import { supabase } from "./supabase";
import type {
  AnalyticsOrder,
  CustomerMeta,
  EnrichedOrder,
  OrderRow,
  Product,
  StockMovement,
} from "./types";

export const productLabel = (p: {
  coffee_type_name: string;
  roast_type_name: string;
  size_kg: number;
}) => `${p.coffee_type_name} · ${p.roast_type_name} · ${p.size_kg}kg`;

// Short label without roast, for dense charts.
export const shortLabel = (p: { coffee_type_name: string; roast_type_name: string; size_kg: number }) =>
  `${p.coffee_type_name} ${p.roast_type_name[0]} ${p.size_kg}kg`;

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "product_id, coffee_type, coffee_type_name, roast_type, roast_type_name, size_kg, unit_price, profit, stock_quantity, active",
    )
    .order("product_id");
  if (error) throw error;
  return (data ?? []).map((p) => ({
    ...p,
    unit_price: Number(p.unit_price),
    profit: Number(p.profit),
    size_kg: Number(p.size_kg),
    stock_quantity: Number(p.stock_quantity),
  })) as Product[];
}

// Most-recent inventory movements (restocks + sales), so the "Inventory
// activity" ledger shows real history on load instead of only session-live rows.
export async function fetchRecentMovements(limit = 30): Promise<StockMovement[]> {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("movement_id, product_id, delta, movement_type, stock_after, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((m) => ({
    ...m,
    delta: Number(m.delta),
    stock_after: Number(m.stock_after),
  })) as StockMovement[];
}

export async function fetchCustomerCount(): Promise<number> {
  const { count, error } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

// customer_id -> metadata (name, loyalty, country, city) for enrichment + geo.
export async function fetchCustomerMeta(): Promise<Record<string, CustomerMeta>> {
  const map: Record<string, CustomerMeta> = {};
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from("customers")
      .select("customer_id, name, loyalty_card, country, city")
      .range(from, from + page - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const c of data)
      map[c.customer_id] = {
        name: c.name,
        loyalty_card: c.loyalty_card,
        country: c.country,
        city: c.city,
      };
    if (data.length < page) break;
  }
  return map;
}

export async function fetchRecentOrders(limit = 20): Promise<EnrichedOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_id, customer_id, product_id, quantity, unit_price_at_sale, total_amount, loyalty_card_used, order_date, customers(name), products(coffee_type_name, roast_type_name, size_kg)",
    )
    .order("order_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((o: Record<string, unknown>) => {
    const cust = o.customers as { name?: string } | null;
    const prod = o.products as
      | { coffee_type_name: string; roast_type_name: string; size_kg: number }
      | null;
    return {
      ...(o as unknown as OrderRow),
      total_amount: Number((o as OrderRow).total_amount),
      quantity: Number((o as OrderRow).quantity),
      customer_name: cust?.name ?? (o.customer_id as string),
      product_label: prod ? productLabel(prod) : (o.product_id as string),
    } as EnrichedOrder;
  });
}

// All orders (paginated) with the fields analytics needs.
export async function fetchAnalyticsOrders(): Promise<AnalyticsOrder[]> {
  const rows: AnalyticsOrder[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from("orders")
      .select("order_date, total_amount, quantity, product_id, customer_id, loyalty_card_used")
      .order("order_date", { ascending: true })
      .range(from, from + page - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data)
      rows.push({
        order_date: r.order_date as string,
        total_amount: Number(r.total_amount),
        quantity: Number(r.quantity),
        product_id: r.product_id as string,
        customer_id: r.customer_id as string,
        loyalty_card_used: r.loyalty_card_used as boolean,
      });
    if (data.length < page) break;
  }
  return rows;
}
