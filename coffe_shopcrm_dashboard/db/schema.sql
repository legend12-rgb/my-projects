-- =====================================================================
--  Coffee Shop CRM — Postgres / Supabase schema
--  Single independent coffee shop. Real-time, read-only dashboard.
--
--  This file is a DROP/RECREATE migration: it is safe to re-run and it
--  fully rebuilds the CRM tables. It targets an EXISTING Supabase project,
--  so it drops the tables it owns first (in dependency order) before
--  recreating them. Apply via the Supabase SQL editor.
--
--  Design decisions baked in here (see README for the "why"):
--    * customers.customer_since  = first-order time (NULL if never ordered);
--      created_at stays as row-insert bookkeeping.
--    * orders money columns are numeric(10,3) — the source data has
--      3-decimal unit prices/sales; (10,2) would silently round them.
--    * stock_movements is an append-only ledger. A trigger on products
--      logs every change to stock_quantity (sale = negative, restock =
--      positive), so inventory history is captured DB-side with no
--      app-side bookkeeping.
--    * No daily_closes table — restock is ad-hoc via the Table Editor,
--      so the end-of-day "confirm product state" workflow is gone.
-- =====================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ---- drop in dependency order (children first) --------------------
drop trigger  if exists trg_products_stock_movement on products;
drop function if exists log_stock_movement();
drop table    if exists stock_movements cascade;
drop table    if exists orders          cascade;
drop table    if exists daily_closes    cascade;  -- retired
drop table    if exists products        cascade;
drop table    if exists customers       cascade;

-- =====================================================================
-- 1. customers
-- =====================================================================
create table customers (
  customer_id    text primary key,             -- natural key, e.g. 17670-51384-MA
  name           text not null,
  email          text,
  phone          text,
  address_line1  text,
  city           text,
  country        text,
  postcode       text,
  loyalty_card   boolean not null default false,
  customer_since timestamptz,                  -- MIN(order_date); NULL = never ordered
  created_at     timestamptz not null default now()  -- when the row entered the DB
);
create index idx_customers_loyalty_card  on customers (loyalty_card);
create index idx_customers_customer_since on customers (customer_since);

-- =====================================================================
-- 2. products
-- =====================================================================
create table products (
  product_id       text primary key,           -- e.g. A-L-0.2
  coffee_type      text not null check (coffee_type in ('Ara','Rob','Exc','Lib')),
  coffee_type_name text not null,               -- Arabica / Robusta / Excelsa / Liberica
  roast_type       text not null check (roast_type in ('L','M','D')),
  roast_type_name  text not null,               -- Light / Medium / Dark
  size_kg          numeric(3,1)  not null check (size_kg > 0),
  unit_price       numeric(10,4) not null check (unit_price >= 0),
  price_per_100g   numeric(10,4),
  profit           numeric(10,5),               -- source carries 5 decimals
  stock_quantity   integer not null default 0 check (stock_quantity >= 0),
  active           boolean not null default true,
  updated_at       timestamptz not null default now(),
  unique (coffee_type, roast_type, size_kg)
);

-- =====================================================================
-- 3. orders
-- =====================================================================
create table orders (
  order_id           uuid primary key default gen_random_uuid(),
  customer_id        text not null references customers(customer_id),
  product_id         text not null references products(product_id),
  quantity           integer       not null check (quantity > 0),
  unit_price_at_sale numeric(10,3) not null check (unit_price_at_sale >= 0),  -- price snapshot
  total_amount       numeric(10,3) not null check (total_amount >= 0),        -- = source Sales
  loyalty_card_used  boolean       not null default false,
  order_date         timestamptz   not null default now(),  -- business time (may be historical)
  created_at         timestamptz   not null default now()   -- system time (row write)
);
create index idx_orders_order_date  on orders (order_date desc);
create index idx_orders_customer_id on orders (customer_id);
create index idx_orders_product_id  on orders (product_id);

-- =====================================================================
-- 4. stock_movements  (append-only inventory ledger)
--    delta > 0 = restock / stock added ; delta < 0 = sale / stock removed.
--    Sum of a product's deltas == its current stock_quantity, because we
--    seed one 'initial' movement per product at import time.
-- =====================================================================
create table stock_movements (
  movement_id   bigint generated always as identity primary key,
  product_id    text not null references products(product_id),
  delta         integer not null,               -- signed change in units
  movement_type text not null check (movement_type in ('initial','sale','restock','adjustment')),
  stock_after   integer not null check (stock_after >= 0),
  created_at    timestamptz not null default now()
);
create index idx_stock_movements_product on stock_movements (product_id, created_at desc);

-- ---- trigger: auto-log every stock_quantity change -----------------
-- Fires only when stock_quantity actually changes. Classifies the change
-- by sign: negative => 'sale' (the POS decrement), positive => 'restock'
-- (the owner adding inventory in the Table Editor). The POS therefore only
-- updates products.stock_quantity; it must NOT also write a movement row,
-- or the sale would be double-counted.
create function log_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  d integer := new.stock_quantity - old.stock_quantity;
begin
  insert into stock_movements (product_id, delta, movement_type, stock_after)
  values (
    new.product_id,
    d,
    case when d < 0 then 'sale' else 'restock' end,
    new.stock_quantity
  );
  return new;
end;
$$;

create trigger trg_products_stock_movement
  after update of stock_quantity on products
  for each row
  when (old.stock_quantity is distinct from new.stock_quantity)
  execute function log_stock_movement();

-- =====================================================================
-- 5. Realtime, Row-Level Security, and Grants
--    Three stacked mechanisms — all required for the anon-key dashboard
--    to receive live events: publication membership, RLS + select policy,
--    and table grants (this project has "expose new tables" turned off).
-- =====================================================================
alter publication supabase_realtime add table customers;
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table stock_movements;

alter table customers       enable row level security;
alter table products        enable row level security;
alter table orders          enable row level security;
alter table stock_movements enable row level security;

create policy "public read customers"       on customers       for select using (true);
create policy "public read products"        on products        for select using (true);
create policy "public read orders"          on orders          for select using (true);
create policy "public read stock_movements" on stock_movements for select using (true);

grant usage on schema public to anon, authenticated, service_role;
grant select on customers, products, orders, stock_movements to anon, authenticated;
grant all    on customers, products, orders, stock_movements to service_role;
