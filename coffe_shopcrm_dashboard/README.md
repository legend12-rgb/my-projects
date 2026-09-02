# Coffee Shop CRM — real-time dashboard (portfolio project)

A single independent coffee shop. Every register sale shows up on a live,
read-only dashboard with no polling; the owner's manual catalog/stock edits
reflect live too. Postgres + Supabase Realtime do the heavy lifting.

**Status:** Phase 1 (backend) and Phase 2 (Next.js dashboard) both built and
verified live against Supabase.

## Architecture

- **Database:** Supabase (managed Postgres) — instant REST API + Realtime
  (logical replication over websockets).
- **Backend scripts:** Python 3.12 in `coffeeshopvenv/`
  (`psycopg2-binary`, `supabase`, `python-dotenv`).
- **Security:** anon/authenticated get **SELECT only** on the tables (safe to
  embed the anon key in the browser). The only writes the dashboard can make go
  through two narrow, validated `security definer` RPCs — `restock_products`
  (adds stock, capped) and `place_demo_order` (records a sale) — so the browser
  can never touch prices, margins, or arbitrary columns. Bulk/admin writes still
  run from trusted `service_role` scripts.
- **Live inventory:** placing an order decrements stock via a DB trigger, which
  in turn logs a `sale` row in the append-only ledger — so the "Restock" board,
  the live feed, KPIs, and the low-stock alerts all stay in sync in real time.

## Tables

| table | purpose |
|-------|---------|
| `customers` | natural-key CRM rows. `customer_since` = first-order time (NULL = never ordered); `created_at` = row-insert time. |
| `products` | 48 SKUs (coffee × roast × size). `stock_quantity` is a live on-hand count. |
| `orders` | one product line per order. Money in `numeric(10,3)` to match the 3-decimal source exactly. `order_date` = business time, `created_at` = write time. |
| `stock_movements` | append-only inventory ledger. A trigger on `products` logs every `stock_quantity` change: `sale` (−) / `restock` (+); seeded with one `initial` row per product so the running sum reconciles to current stock. |

### Notable design decisions
- **`customer_since` is a dedicated column**, not a repurposed `created_at` —
  366 of 1000 customers never ordered, so their `customer_since` is honestly
  `NULL` while `created_at` keeps its bookkeeping meaning.
- **Money is `numeric(10,3)`** on orders: the real data has 3-decimal unit
  prices (496/1000) and sales (219/1000); `numeric(10,2)` would silently round
  them.
- **Inventory is a real ledger via a DB trigger**, not app bookkeeping. The POS
  only updates `stock_quantity`; the trigger records the movement (so a sale is
  never double-counted).
- **Historical dates kept as-is** (Jan–Jun 2026); live POS orders are dated
  today, so expect a gap before live data appears.
- **No `daily_closes`** — the end-of-day "confirm stock" workflow is replaced by
  ad-hoc restocking in the Table Editor.

## Setup

```bash
# 1. deps (into the project venv)
coffeeshopvenv/Scripts/python.exe -m pip install -r requirements.txt

# 2. secrets
cp .env.example .env      # then fill in the four values

# 3. (only if regenerating) export the source xlsx -> CSVs
coffeeshopvenv/Scripts/python.exe scripts/export_xlsx_to_csv.py
```

Apply `db/schema.sql` in the Supabase SQL editor (it drops & recreates the CRM
tables), then:

```bash
# 4. seed
coffeeshopvenv/Scripts/python.exe scripts/import_data.py

# 5. prove realtime — run these in two terminals
coffeeshopvenv/Scripts/python.exe scripts/listen_realtime.py
coffeeshopvenv/Scripts/python.exe scripts/pos_simulator.py
```

## Repo layout

```
db/schema.sql                    full schema (drop/recreate migration)
data/source/*.xlsx               original source workbook (reference)
data/*.csv                       exported flat files the importer reads
scripts/export_xlsx_to_csv.py    one-time xlsx -> csv (stdlib only)
scripts/import_data.py           bulk seed via direct Postgres
scripts/pos_simulator.py         live POS traffic generator (service_role)
scripts/listen_realtime.py       realtime verification listener (anon key)
dashboard/                       Next.js + Tailwind + Recharts realtime dashboard
```

## Dashboard (Phase 2)

Read-only, real-time dashboard (Next.js App Router + TypeScript + Tailwind v4 +
Recharts) using `@supabase/supabase-js` from the browser with the anon key.
`dashboard/.env.local` holds only `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (never the service_role key).

**App shell, not a scroll page.** A sidebar (collapses to a mobile drawer)
routes between four real pages — no anchor-scrolling:

| route | content |
|---|---|
| `/` (Overview) | 3 counterintuitive findings, revenue/profit KPIs, profit-by-product (bar color = margin), revenue-vs-profit share by type, order-value distribution, sales-over-time — the two flagship charts carry inline `30D/90D/6M/ALL` range chips |
| `/customers` | one-time/repeat/dormant mix, loyalty scorecard (honest "no lift"), geography as concentration risk + ranked country/city list |
| `/inventory` | live products table (low-stock flags), live `stock_movements` ledger, orders-by-hour (labelled uniform/synthetic) |
| `/live-orders` | full-page realtime feed (50 rows), today's live stat cards |

A single Supabase Realtime channel and all fetched data live in one
`DashboardProvider` (`lib/DashboardContext.tsx`) mounted in the root layout —
it survives client-side navigation, so switching pages never re-subscribes or
re-fetches. Every chart is click-to-expand (`ExpandableChart` + `ChartModal`):
opens a larger view with its own date-range control and a live recap strip,
sharing range state with any inline chips on that same card. Colour encodes
data (margin scale, stock health) rather than decoration, and every synthetic
dimension (dates, times, stock) is labelled as demo data.

```bash
cd dashboard
npm install
npm run dev        # http://localhost:3000
```

Run `pos_simulator.py` alongside it to watch orders, stock, customers, and the
inventory ledger update live with no refresh.

