export type CoffeeCode = "Ara" | "Rob" | "Exc" | "Lib";

export type Customer = {
  customer_id: string;
  name: string;
  loyalty_card: boolean;
  customer_since: string | null;
  city: string | null;
  country: string | null;
};

// Lightweight per-customer metadata used for enrichment & segmentation.
export type CustomerMeta = {
  name: string;
  loyalty_card: boolean;
  country: string | null;
  city: string | null;
};

export type Product = {
  product_id: string;
  coffee_type: CoffeeCode;
  coffee_type_name: string;
  roast_type: string;
  roast_type_name: string;
  size_kg: number;
  unit_price: number;
  profit: number; // profit per bag (unit_price * type margin)
  stock_quantity: number;
  active: boolean;
};

// Raw order row as it arrives from Postgres / realtime (IDs only).
export type OrderRow = {
  order_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  unit_price_at_sale: number;
  total_amount: number;
  loyalty_card_used: boolean;
  order_date: string;
};

// Slim order shape used for analytics aggregation.
export type AnalyticsOrder = {
  order_date: string;
  total_amount: number;
  quantity: number;
  product_id: string;
  customer_id: string;
  loyalty_card_used: boolean;
};

export type EnrichedOrder = OrderRow & {
  customer_name: string;
  product_label: string;
};

export type StockMovement = {
  movement_id: number;
  product_id: string;
  delta: number;
  movement_type: "initial" | "sale" | "restock" | "adjustment";
  stock_after: number;
  created_at: string;
};
