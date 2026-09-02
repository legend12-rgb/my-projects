"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Manrope, JetBrains_Mono } from "next/font/google";
import type { Product } from "@/lib/types";
import { productLabel } from "@/lib/data";
import { fmtMoney } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { TYPE_COLOR } from "@/lib/colors";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Card } from "./ui";

// Scoped to this board only (the "Bold Type Blocks" restock style) — the
// rest of the app stays on Plus Jakarta Sans.
const manrope = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-manrope" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-restock-mono" });

const LOW = 15;
const MAX_RESTOCK = 10000; // one delivery over 10k bags is a typo, not a restock
const ROAST_ORDER = ["Light", "Medium", "Dark"];
const TYPE_ORDER = Object.keys(TYPE_COLOR);

type SortMode = "grouped" | "stock-asc" | "stock-desc" | "price-asc" | "price-desc" | "name-az";

const SORT_LABELS: Record<SortMode, string> = {
  grouped: "Type & roast",
  "stock-asc": "Stock: low to high",
  "stock-desc": "Stock: high to low",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-az": "Name A–Z",
};

function stockTone(n: number): "green" | "amber" | "red" {
  if (n <= 5) return "red";
  if (n <= LOW) return "amber";
  return "green";
}
const stockToneClass: Record<string, string> = {
  green: "bg-[#d9f2e1] text-[#2f9257] dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-[#fbe8cf] text-[#bd7524] dark:bg-amber-500/15 dark:text-amber-400",
  red: "bg-[#f9dadd] text-[#cf5257] dark:bg-red-500/15 dark:text-red-400",
};

function PlusIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CloseIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * One product tile — "Bold Type Blocks" style: the tile is fully tinted with
 * the coffee-type color, headings in Manrope, all numbers in JetBrains Mono,
 * scale-up on hover. The "+" stages (does not save) a restock qty.
 */
function Tile({
  product,
  label,
  accent,
  pendingQty,
  onStage,
}: {
  product: Product;
  label: string;
  accent: string;
  pendingQty: number | undefined;
  onStage: (id: string, n: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(pendingQty ? String(pendingQty) : "");
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const confirm = () => {
    const n = Math.floor(Number(val));
    if (!Number.isFinite(n) || n <= 0) {
      setErr("Enter a positive whole number.");
      return;
    }
    if (n > MAX_RESTOCK) {
      setErr(`Max ${MAX_RESTOCK.toLocaleString()} per restock.`);
      return;
    }
    setErr(null);
    onStage(product.product_id, n);
    setEditing(false);
  };

  const tone = stockTone(product.stock_quantity);
  const queued = pendingQty && pendingQty > 0;

  return (
    <div
      className="group flex min-w-[152px] flex-1 flex-col gap-3 rounded-2xl border-[1.5px] p-4 transition-all duration-150 ease-out hover:scale-[1.035]"
      style={{
        background: queued
          ? `color-mix(in srgb, ${accent} 22%, var(--surface))`
          : `color-mix(in srgb, ${accent} 12%, var(--surface))`,
        borderColor: `color-mix(in srgb, ${accent} ${queued ? 40 : 22}%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="truncate text-lg font-extrabold tracking-tight"
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            color: `color-mix(in srgb, ${accent} 75%, var(--foreground))`,
          }}
        >
          {label}
        </span>
        {editing ? (
          <span className="flex shrink-0 items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              min={1}
              max={MAX_RESTOCK}
              inputMode="numeric"
              placeholder="qty"
              value={val}
              onChange={(e) => {
                setVal(e.target.value);
                if (err) setErr(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirm();
                if (e.key === "Escape") setEditing(false);
              }}
              style={{ fontFamily: "var(--font-restock-mono), monospace" }}
              className="w-14 rounded-md border border-[var(--hairline)] bg-surface px-1.5 py-0.5 text-right text-xs outline-none focus:border-foreground/30"
            />
            <button
              type="button"
              onClick={confirm}
              aria-label="Queue restock"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white hover:opacity-90"
              style={{ background: accent }}
            >
              <CheckIcon />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setVal(pendingQty ? String(pendingQty) : "");
              setEditing(true);
            }}
            aria-label={`Restock ${label}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white transition-transform duration-150 ease-out group-hover:rotate-90"
            style={{ background: accent }}
          >
            <PlusIcon size={14} />
          </button>
        )}
      </div>

      {err ? <div className="text-[11px] font-medium text-red-500">{err}</div> : null}

      <div className="flex items-center justify-between text-xs" style={{ fontFamily: "var(--font-restock-mono), monospace" }}>
        <span className="text-foreground/55">{fmtMoney(product.unit_price)}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground/75">{product.stock_quantity}</span>
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${stockToneClass[tone]}`}>
            {tone === "red" ? "low" : tone === "amber" ? "watch" : "ok"}
          </span>
        </span>
      </div>

      {queued ? (
        <div
          className="flex items-center justify-between rounded-lg px-2 py-1 text-[11px] font-semibold"
          style={{
            background: `color-mix(in srgb, ${accent} 30%, var(--surface))`,
            color: `color-mix(in srgb, ${accent} 80%, var(--foreground))`,
            fontFamily: "var(--font-restock-mono), monospace",
          }}
        >
          <span>
            +{pendingQty} &rarr; {product.stock_quantity + (pendingQty ?? 0)}
          </span>
          <button
            type="button"
            onClick={() => onStage(product.product_id, null)}
            aria-label="Remove queued restock"
            className="opacity-70 hover:opacity-100"
          >
            <CloseIcon size={11} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ProductRestockBoard({ products }: { products: Product[] }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>("grouped");
  const [pending, setPending] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const lowCount = products.filter((p) => p.stock_quantity <= LOW).length;

  const grouped = useMemo(() => {
    const byType = new Map<string, Map<string, Product[]>>();
    for (const p of products) {
      if (!byType.has(p.coffee_type_name)) byType.set(p.coffee_type_name, new Map());
      const byRoast = byType.get(p.coffee_type_name)!;
      if (!byRoast.has(p.roast_type_name)) byRoast.set(p.roast_type_name, []);
      byRoast.get(p.roast_type_name)!.push(p);
    }
    for (const byRoast of byType.values())
      for (const list of byRoast.values()) list.sort((a, b) => a.size_kg - b.size_kg);
    return TYPE_ORDER.filter((t) => byType.has(t)).map((type) => ({
      type,
      roasts: ROAST_ORDER.filter((r) => byType.get(type)!.has(r)).map((roast) => ({
        roast,
        items: byType.get(type)!.get(roast)!,
      })),
    }));
  }, [products]);

  const flat = useMemo(() => {
    if (sort === "grouped") return null;
    const arr = [...products];
    switch (sort) {
      case "stock-asc":
        arr.sort((a, b) => a.stock_quantity - b.stock_quantity);
        break;
      case "stock-desc":
        arr.sort((a, b) => b.stock_quantity - a.stock_quantity);
        break;
      case "price-asc":
        arr.sort((a, b) => a.unit_price - b.unit_price);
        break;
      case "price-desc":
        arr.sort((a, b) => b.unit_price - a.unit_price);
        break;
      case "name-az":
        arr.sort((a, b) => productLabel(a).localeCompare(productLabel(b)));
        break;
    }
    return arr;
  }, [products, sort]);

  const stage = (id: string, n: number | null) => {
    setPending((p) => {
      const next = { ...p };
      if (n === null) delete next[id];
      else next[id] = n;
      return next;
    });
  };

  const pendingIds = Object.keys(pending);
  const pendingTotal = Object.values(pending).reduce((s, n) => s + n, 0);

  const discard = () => {
    setPending({});
    setSaveErr(null);
  };

  const close = () => {
    setOpen(false);
    discard();
  };

  const save = async () => {
    if (pendingIds.length === 0) return;
    setSaving(true);
    setSaveErr(null);
    // One atomic server-side transaction: each row does
    // stock_quantity = stock_quantity + delta, so a concurrent sale can't be
    // lost the way a client-computed absolute value could.
    const { error } = await supabase.rpc("restock_products", {
      items: pendingIds.map((id) => ({ id, delta: pending[id] })),
    });
    setSaving(false);
    if (error) {
      setSaveErr("Couldn't save the restock — nothing was changed. Try again.");
      return;
    }
    setPending({});
    setOpen(false);
  };

  return (
    <>
      <Card>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex w-full items-center gap-4 px-5 py-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c2703d]/10 text-[#c2703d]">
            <PlusIcon size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground/85">Product restock</span>
            <span className="block text-xs text-foreground/45">
              {products.length} products
              {lowCount > 0 ? ` · ${lowCount} need restocking` : " · all stocked"}
            </span>
          </span>
          <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/45 transition-colors group-hover:bg-foreground/8 group-hover:text-foreground/70">
            Open board →
          </span>
        </button>
      </Card>

      {mounted && open
        ? createPortal(
            <div
              className={`fixed inset-0 z-50 bg-black/55 p-4 backdrop-blur-sm sm:p-8 lg:p-12 ${manrope.variable} ${mono.variable}`}
              onClick={close}
            >
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className="mx-auto flex h-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl outline-none dark:border-white/10 dark:bg-neutral-900"
              >
                {/* header */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-black/6 px-6 py-4 dark:border-white/8">
                  <div>
                    <div
                      id={titleId}
                      className="text-lg font-extrabold tracking-tight"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Restock products
                    </div>
                    <div className="text-xs text-foreground/45">
                      Queue additions across products, then save once.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortMode)}
                      className="rounded-lg border border-[var(--hairline)] bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground/70 outline-none focus:border-foreground/30"
                    >
                      {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => (
                        <option key={s} value={s}>
                          Sort: {SORT_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={close}
                      aria-label="Close"
                      className="rounded-md p-1.5 text-foreground/45 transition-colors hover:bg-foreground/8 hover:text-foreground/80"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>

                {/* body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {flat ? (
                    <div className="flex flex-wrap gap-3">
                      {flat.map((p) => (
                        <Tile
                          key={p.product_id}
                          product={p}
                          label={productLabel(p)}
                          accent={TYPE_COLOR[p.coffee_type_name] ?? "#8a7a6a"}
                          pendingQty={pending[p.product_id]}
                          onStage={stage}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-7">
                      {grouped.map(({ type, roasts }) => (
                        <div key={type}>
                          <div className="mb-3 flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: TYPE_COLOR[type] }}
                            />
                            <h3
                              className="text-sm font-bold text-foreground/80"
                              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                            >
                              {type}
                            </h3>
                          </div>
                          <div className="flex flex-col gap-3">
                            {roasts.map(({ roast, items }) => (
                              <div key={roast} className="flex flex-wrap items-stretch gap-3">
                                <div className="flex w-20 shrink-0 items-center text-xs font-medium text-foreground/45">
                                  {roast}
                                </div>
                                {items.map((p) => (
                                  <Tile
                                    key={p.product_id}
                                    product={p}
                                    label={`${p.size_kg}kg`}
                                    accent={TYPE_COLOR[type]}
                                    pendingQty={pending[p.product_id]}
                                    onStage={stage}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* footer */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-black/6 bg-surface px-6 py-4 dark:border-white/8">
                  <span
                    className="text-sm text-foreground/60"
                    style={{ fontFamily: "var(--font-restock-mono), monospace" }}
                  >
                    {pendingIds.length === 0
                      ? "No changes queued yet."
                      : `${pendingIds.length} product${pendingIds.length > 1 ? "s" : ""} queued · +${pendingTotal} bags total`}
                  </span>
                  <span className="flex items-center gap-2">
                    {saveErr ? <span className="text-xs text-red-500">{saveErr}</span> : null}
                    <button
                      type="button"
                      onClick={discard}
                      disabled={pendingIds.length === 0 || saving}
                      className="rounded-lg border border-[var(--hairline)] px-3.5 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/6 disabled:opacity-40"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={save}
                      disabled={pendingIds.length === 0 || saving}
                      className="rounded-lg bg-[#c2703d] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
