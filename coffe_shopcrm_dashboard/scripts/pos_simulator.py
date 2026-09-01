"""
Simulated POS terminal. Writes plausible sales into Supabase the way a real
POS webhook/API integration would — via the REST API using the service_role
key (bypasses RLS; the anon-key dashboard can only ever read).

Per simulated sale:
  1. 10% chance: invent a brand-new walk-in customer (customer_since set to
     THIS order's time, since it is their first order); else pick an existing
     customer at random.
  2. Pick a product (uniform), a quantity (1-5).
  3. unit_price = product's current price; total = unit_price * quantity.
  4. order_date = today, uniformly random within store hours (09:00-21:00).
  5. Insert the order, then decrement the product's stock_quantity. The DB
     trigger logs that decrement into stock_movements as a 'sale' — the
     simulator does NOT write the movement itself (that would double-count).

Modes:
    python scripts/pos_simulator.py           # infinite loop, 2-8s between sales
    python scripts/pos_simulator.py --once     # one sale, then exit
"""
from __future__ import annotations
import os
import random
import sys
import time
import uuid
from datetime import datetime, time as dtime, timedelta

from dotenv import load_dotenv
from supabase import create_client

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
load_dotenv(os.path.join(ROOT, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SERVICE_KEY:
    sys.exit("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")

NEW_CUSTOMER_CHANCE = 0.10
MIN_DELAY_SECONDS = 2
MAX_DELAY_SECONDS = 8
STORE_OPEN = dtime(9, 0, 0)
STORE_CLOSE = dtime(21, 0, 0)

WALKIN_FIRST_NAMES = ["Casey", "Jordan", "Riley", "Morgan", "Avery", "Quinn", "Skyler", "Rowan"]
WALKIN_LAST_NAMES = ["Doyle", "Nguyen", "Okafor", "Rossi", "Haas", "Petrov", "Sato", "Mercer"]


def random_store_datetime() -> datetime:
    """Today's date, uniformly-random time within store hours (inclusive)."""
    open_s = STORE_OPEN.hour * 3600 + STORE_OPEN.minute * 60 + STORE_OPEN.second
    close_s = STORE_CLOSE.hour * 3600 + STORE_CLOSE.minute * 60 + STORE_CLOSE.second
    secs = random.randint(open_s, close_s)
    return datetime.combine(datetime.now().date(), dtime()) + timedelta(seconds=secs)


def fetch_customers(client):
    rows = client.table("customers").select("customer_id, loyalty_card").execute().data
    return rows


def fetch_products(client):
    rows = client.table("products").select(
        "product_id, unit_price, stock_quantity"
    ).execute().data
    return rows


def create_walkin_customer(client, order_dt: datetime):
    cust = {
        "customer_id": f"WALK-{uuid.uuid4().hex[:8].upper()}",
        "name": f"{random.choice(WALKIN_FIRST_NAMES)} {random.choice(WALKIN_LAST_NAMES)}",
        "loyalty_card": False,
        # First order == this sale, so "customer since" is this order's time.
        "customer_since": order_dt.isoformat(),
    }
    client.table("customers").insert(cust).execute()
    return {"customer_id": cust["customer_id"], "loyalty_card": False}


def one_sale(client, customers, products) -> str:
    order_dt = random_store_datetime()

    if random.random() < NEW_CUSTOMER_CHANCE:
        customer = create_walkin_customer(client, order_dt)
        customers.append(customer)
        tag = "NEW "
    else:
        customer = random.choice(customers)
        tag = "    "

    product = random.choice(products)
    quantity = random.randint(1, 5)
    unit_price = round(float(product["unit_price"]), 3)
    total_amount = round(unit_price * quantity, 3)

    order = {
        "customer_id": customer["customer_id"],
        "product_id": product["product_id"],
        "quantity": quantity,
        "unit_price_at_sale": unit_price,
        "total_amount": total_amount,
        "loyalty_card_used": bool(customer["loyalty_card"]),
        "order_date": order_dt.isoformat(),
    }
    client.table("orders").insert(order).execute()

    # Decrement stock; the DB trigger records the 'sale' movement.
    new_stock = max(int(product["stock_quantity"]) - quantity, 0)
    client.table("products").update({"stock_quantity": new_stock}).eq(
        "product_id", product["product_id"]
    ).execute()
    product["stock_quantity"] = new_stock

    return (f"{tag}{order_dt:%H:%M:%S}  {customer['customer_id']:<16} "
            f"{product['product_id']:<9} x{quantity}  "
            f"= {total_amount:.3f}  stock->{new_stock}")


def main():
    once = "--once" in sys.argv
    client = create_client(SUPABASE_URL, SERVICE_KEY)

    customers = fetch_customers(client)
    products = fetch_products(client)
    if not customers or not products:
        sys.exit("ERROR: customers/products are empty. Run import_data.py first.")
    print(f"Loaded {len(customers)} customers, {len(products)} products. "
          f"{'Single sale.' if once else 'Looping (Ctrl+C to stop).'}")

    try:
        while True:
            print(one_sale(client, customers, products), flush=True)
            if once:
                break
            time.sleep(random.uniform(MIN_DELAY_SECONDS, MAX_DELAY_SECONDS))
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
