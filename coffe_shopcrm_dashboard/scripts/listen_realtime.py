"""
Realtime verification listener.

Subscribes to Postgres change events on customers, products, orders, and
stock_movements using the ANON key specifically — to prove that the same
public-safe credential the browser dashboard will use really does receive
live events (RLS + publication membership + grants all wired correctly).

Run this in one terminal, then run pos_simulator.py in another: new orders,
stock decrements, stock_movements rows, and new walk-in customers should all
print here within about a second, with zero polling.

Targets realtime v2 (bundled with supabase-py 2.9.x).

Usage:
    coffeeshopvenv/Scripts/python.exe scripts/listen_realtime.py
"""
from __future__ import annotations
import asyncio
import os
import sys

from dotenv import load_dotenv
from realtime import AsyncRealtimeClient

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
load_dotenv(os.path.join(ROOT, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
if not SUPABASE_URL or not ANON_KEY:
    sys.exit("ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")

WS_URL = SUPABASE_URL.replace("https://", "wss://").rstrip("/") + "/realtime/v1"


def _record(payload):
    data = payload.get("data", payload)
    return data.get("record") or data.get("new") or data


def on_order(payload):
    r = _record(payload)
    print(f"[ORDER]    {r.get('order_date')}  cust={r.get('customer_id')}  "
          f"prod={r.get('product_id')}  qty={r.get('quantity')}  "
          f"total={r.get('total_amount')}", flush=True)


def on_product(payload):
    r = _record(payload)
    print(f"[PRODUCT]  {r.get('product_id')}  stock={r.get('stock_quantity')}  "
          f"price={r.get('unit_price')}", flush=True)


def on_customer(payload):
    r = _record(payload)
    print(f"[CUSTOMER] NEW {r.get('customer_id')}  {r.get('name')}  "
          f"since={r.get('customer_since')}", flush=True)


def on_movement(payload):
    r = _record(payload)
    print(f"[STOCK]    {r.get('product_id')}  {r.get('movement_type')}  "
          f"delta={r.get('delta')}  after={r.get('stock_after')}", flush=True)


async def main():
    client = AsyncRealtimeClient(WS_URL, ANON_KEY, auto_reconnect=True)
    await client.connect()

    channel = client.channel("crm-changes")
    channel.on_postgres_changes("INSERT", schema="public", table="orders", callback=on_order)
    channel.on_postgres_changes("*", schema="public", table="products", callback=on_product)
    channel.on_postgres_changes("INSERT", schema="public", table="customers", callback=on_customer)
    channel.on_postgres_changes("INSERT", schema="public", table="stock_movements", callback=on_movement)
    await channel.subscribe()

    print("Listening on customers, products, orders, stock_movements "
          "(anon key). Ctrl+C to stop.", flush=True)

    # connect() runs the socket pump in a background task, so just keep this
    # coroutine alive. (client.listen() is a deprecated no-op in realtime 2.x.)
    try:
        while True:
            await asyncio.sleep(3600)
    except asyncio.CancelledError:
        pass
    finally:
        await client.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nStopped.")
