"""
Bulk seed the CRM tables from the committed CSVs.

Loads customers -> products -> (initial stock movements) -> orders, then
backfills customers.customer_since = MIN(order_date) per customer.

Order matters: orders reference both customers and products via FK, so those
must exist first. Historical orders do NOT decrement stock (current stock is a
present-day snapshot that is already below lifetime units sold) — so we import
stock as-is and seed one 'initial' ledger row per product equal to that stock.

Connection: a direct Postgres connection (psycopg2) using DATABASE_URL from
.env — NOT the REST API. Direct SQL is the right tool for a bulk one-shot load.

Re-runnable: truncates the four tables first (RESTART IDENTITY CASCADE), so
running it twice leaves the same clean state, never duplicates.

Usage:
    coffeeshopvenv/Scripts/python.exe scripts/import_data.py
"""
from __future__ import annotations
import csv
import os
import sys

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "data")

load_dotenv(os.path.join(ROOT, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    sys.exit("ERROR: DATABASE_URL is not set. Copy .env.example to .env and fill it in.")

COFFEE_TYPE_NAMES = {"Ara": "Arabica", "Rob": "Robusta", "Exc": "Excelsa", "Lib": "Liberica"}
ROAST_TYPE_NAMES = {"L": "Light", "M": "Medium", "D": "Dark"}


def _n(v):
    """Empty string -> None (SQL NULL); everything else unchanged."""
    return None if v is None or v == "" else v


def _b(v):
    return str(v).strip().lower() == "true"


def read_csv(name):
    with open(os.path.join(DATA, name), newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def main():
    customers = read_csv("customers.csv")
    products = read_csv("products.csv")
    orders = read_csv("orders.csv")

    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            # Clean slate. TRUNCATE does not fire row triggers, so seeding the
            # 'initial' stock movements by hand below is the only ledger source.
            cur.execute(
                "truncate stock_movements, orders, products, customers "
                "restart identity cascade;"
            )

            # ---- customers (customer_since backfilled after orders) ----
            execute_values(
                cur,
                """insert into customers
                   (customer_id, name, email, phone, address_line1,
                    city, country, postcode, loyalty_card)
                   values %s""",
                [(
                    r["customer_id"], r["name"], _n(r["email"]), _n(r["phone"]),
                    _n(r["address_line1"]), _n(r["city"]), _n(r["country"]),
                    _n(r["postcode"]), _b(r["loyalty_card"]),
                ) for r in customers],
            )
            print(f"customers: {len(customers)}")

            # ---- products ----
            execute_values(
                cur,
                """insert into products
                   (product_id, coffee_type, coffee_type_name, roast_type,
                    roast_type_name, size_kg, unit_price, price_per_100g,
                    profit, stock_quantity)
                   values %s""",
                [(
                    r["product_id"], r["coffee_type"], COFFEE_TYPE_NAMES[r["coffee_type"]],
                    r["roast_type"], ROAST_TYPE_NAMES[r["roast_type"]], r["size_kg"],
                    r["unit_price"], _n(r["price_per_100g"]), _n(r["profit"]),
                    int(r["stock_quantity"]),
                ) for r in products],
            )
            print(f"products: {len(products)}")

            # ---- initial stock ledger (one row per product) ----
            execute_values(
                cur,
                """insert into stock_movements
                   (product_id, delta, movement_type, stock_after)
                   values %s""",
                [(
                    r["product_id"], int(r["stock_quantity"]), "initial",
                    int(r["stock_quantity"]),
                ) for r in products],
            )
            print(f"stock_movements (initial): {len(products)}")

            # ---- orders ----
            bad = [r for r in orders if int(r["quantity"]) <= 0]
            if bad:
                raise ValueError(f"{len(bad)} order rows have quantity <= 0; aborting.")
            execute_values(
                cur,
                """insert into orders
                   (customer_id, product_id, quantity, unit_price_at_sale,
                    total_amount, loyalty_card_used, order_date)
                   values %s""",
                [(
                    r["customer_id"], r["product_id"], int(r["quantity"]),
                    r["unit_price_at_sale"], r["total_amount"],
                    _b(r["loyalty_card_used"]), r["order_date"],
                ) for r in orders],
            )
            print(f"orders: {len(orders)}")

            # ---- backfill customer_since = first order per customer ----
            cur.execute(
                """update customers c
                   set customer_since = sub.first_order
                   from (
                     select customer_id, min(order_date) as first_order
                     from orders group by customer_id
                   ) sub
                   where c.customer_id = sub.customer_id;"""
            )
            print(f"customer_since backfilled for {cur.rowcount} customers "
                  f"({len(customers) - cur.rowcount} never ordered -> NULL)")

        conn.commit()
        print("Import committed OK.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
