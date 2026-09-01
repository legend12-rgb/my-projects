"""
One-time converter: Coffee Shop Data final.xlsx  ->  three flat CSVs.

Why this exists
---------------
The source data ships as an .xlsx. Parsing xlsx at runtime would need a
third-party library (openpyxl/pandas). To keep the import pipeline
dependency-free, we do a single, reproducible export here using ONLY the
Python standard library (an .xlsx is just a zip of XML parts), commit the
resulting CSVs, and let import_data.py read them with the built-in csv module.

Outputs (written next to this repo's data/ folder):
    data/customers.csv
    data/products.csv
    data/orders.csv

Run once:
    coffeeshopvenv/Scripts/python.exe scripts/export_xlsx_to_csv.py
"""
from __future__ import annotations
import csv
import os
import re
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from decimal import Decimal

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
XLSX = os.path.join(ROOT, "data", "source", "Coffee Shop Data final.xlsx")
OUT_DIR = os.path.join(ROOT, "data")

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
# Excel's day 0 is 1899-12-30 (accounts for the 1900 leap-year bug offset).
EXCEL_EPOCH = datetime(1899, 12, 30)


def _load(zf: zipfile.ZipFile):
    shared = []
    if "xl/sharedStrings.xml" in zf.namelist():
        for si in ET.fromstring(zf.read("xl/sharedStrings.xml")):
            shared.append("".join(t.text or "" for t in si.iter(NS + "t")))

    wb = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rid_to_target = {r.get("Id"): r.get("Target") for r in rels}
    sheets = {}
    for s in wb.iter(NS + "sheet"):
        target = rid_to_target[s.get(REL_NS + "id")]
        if not target.startswith("xl/"):
            target = "xl/" + target
        sheets[s.get("name")] = target
    return shared, sheets


def _cell(c, shared):
    t = c.get("t")
    v = c.find(NS + "v")
    if t == "s" and v is not None:
        return shared[int(v.text)]
    if t == "inlineStr":
        isv = c.find(NS + "is")
        if isv is not None:
            return "".join(x.text or "" for x in isv.iter(NS + "t"))
    return v.text if v is not None else None


def _rows(zf, target, shared):
    root = ET.fromstring(zf.read(target))
    out = []
    for row in root.find(NS + "sheetData").findall(NS + "row"):
        d = {}
        for c in row.findall(NS + "c"):
            col = re.match(r"[A-Z]+", c.get("r")).group()
            d[col] = _cell(c, shared)
        out.append(d)
    return out


def _hmap(header_row):
    """Header label -> column letter."""
    return {label: col for col, label in header_row.items()}


def _num(x):
    """Kill float-repr noise, return a trimmed decimal string (e.g. '4.125')."""
    if x is None or x == "":
        return ""
    d = Decimal(str(round(float(x), 6))).normalize()
    # normalize() can yield exponent form for integers; force plain notation.
    return format(d, "f")


def _blank(x):
    return "" if x is None else str(x).strip()


def main():
    with zipfile.ZipFile(XLSX) as zf:
        shared, sheets = _load(zf)
        orders = _rows(zf, sheets["Orders"], shared)
        customers = _rows(zf, sheets["Customers"], shared)
        products = _rows(zf, sheets["Products"], shared)

    os.makedirs(OUT_DIR, exist_ok=True)

    # ---- customers.csv ----
    ch = _hmap(customers[0])
    with open(os.path.join(OUT_DIR, "customers.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["customer_id", "name", "email", "phone",
                    "address_line1", "city", "country", "postcode", "loyalty_card"])
        for r in customers[1:]:
            w.writerow([
                _blank(r.get(ch["Customer ID"])),
                _blank(r.get(ch["Customer Name"])),
                _blank(r.get(ch["Email"])),
                _blank(r.get(ch["Phone Number"])),
                _blank(r.get(ch["Address Line 1"])),
                _blank(r.get(ch["City"])),
                _blank(r.get(ch["Country"])),
                _blank(r.get(ch["Postcode"])),
                "true" if _blank(r.get(ch["Loyalty Card"])).lower() == "yes" else "false",
            ])

    # ---- products.csv ----
    ph = _hmap(products[0])
    with open(os.path.join(OUT_DIR, "products.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["product_id", "coffee_type", "roast_type", "size_kg",
                    "unit_price", "price_per_100g", "profit", "stock_quantity"])
        for r in products[1:]:
            w.writerow([
                _blank(r.get(ph["Product ID"])),
                _blank(r.get(ph["Coffee Type"])),
                _blank(r.get(ph["Roast Type"])),
                _num(r.get(ph["Size"])),
                _num(r.get(ph["Unit Price"])),
                _num(r.get(ph["Price per 100g"])),
                _num(r.get(ph["Profit"])),
                _blank(r.get(ph["stock_quantity"])),
            ])

    # ---- orders.csv ----
    oh = _hmap(orders[0])
    with open(os.path.join(OUT_DIR, "orders.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["customer_id", "product_id", "quantity",
                    "unit_price_at_sale", "total_amount", "loyalty_card_used", "order_date"])
        for r in orders[1:]:
            unit_price = float(r.get(oh["Unit Price"]))
            sales = float(r.get(oh["Sales"]))
            quantity = round(sales / unit_price) if unit_price else 0
            # Combine Excel date serial + time fraction into one wall-clock timestamp.
            date_serial = float(r.get(oh["Order Date"]))
            time_frac = float(r.get(oh["Order Time"]))
            ts = EXCEL_EPOCH + timedelta(days=date_serial + time_frac)
            # second resolution is plenty; drop microseconds
            ts = ts.replace(microsecond=0)
            w.writerow([
                _blank(r.get(oh["customer_id"])),
                _blank(r.get(oh["product_id"])),
                quantity,
                _num(unit_price),
                _num(sales),
                "true" if _blank(r.get(oh["Loyalty Card"])).lower() == "yes" else "false",
                ts.isoformat(sep=" "),
            ])

    print("Wrote:")
    for name in ("customers.csv", "products.csv", "orders.csv"):
        p = os.path.join(OUT_DIR, name)
        with open(p, encoding="utf-8") as f:
            n = sum(1 for _ in f) - 1
        print(f"  data/{name}  ({n} data rows)")


if __name__ == "__main__":
    main()
