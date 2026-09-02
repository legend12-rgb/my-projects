"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/lib/DashboardContext";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/customers": "Customers",
  "/inventory": "Inventory & live",
  "/live-orders": "Live orders",
};

// Only these pages actually consume the global search term (they render
// filterable lists). Elsewhere the box would be a dead control, so we hide it.
const SEARCH_PAGES = new Set(["/inventory", "/live-orders"]);

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M13 9.5A5.5 5.5 0 0 1 6.5 3c0-.5.07-1 .2-1.45A5.5 5.5 0 1 0 14.45 8.8c-.45.13-.95.2-1.45.2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v9M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 13h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {}
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = saved === "dark" || (!saved && prefersDark) ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);
  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
      return next;
    });
  };
  return { theme, toggle };
}

function agoLabel(ts: number, now: number) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return `${m}m ago`;
}

export default function TopBar() {
  const { live, search, setSearch, lastUpdate, orders, idx, meta } = useDashboard();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const title = TITLES[pathname] ?? "Overview";
  const showSearch = SEARCH_PAGES.has(pathname);

  // Clear any lingering search term when leaving a searchable page, so a
  // hidden filter can't keep silently applying on pages with no search box.
  useEffect(() => {
    if (!showSearch && search) setSearch("");
  }, [showSearch, search, setSearch]);

  const exportCsv = () => {
    // Respect the active search so export matches what's on screen. When no
    // search is set (or we're on a page without one), this exports everything.
    const q = search.trim().toLowerCase();
    const selected = q
      ? orders.filter((o) => {
          const label = idx[o.product_id]?.label ?? o.product_id;
          const name = meta[o.customer_id]?.name ?? "";
          return label.toLowerCase().includes(q) || name.toLowerCase().includes(q);
        })
      : orders;

    const header = ["order_date", "customer", "product", "quantity", "total_amount", "loyalty_card_used"];
    const rows = selected.map((o) => [
      o.order_date,
      meta[o.customer_id]?.name ?? o.customer_id,
      idx[o.product_id]?.label ?? o.product_id,
      String(o.quantity),
      String(o.total_amount),
      String(o.loyalty_card_used),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const tag = q ? `-${q.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}` : "";
    a.download = `coffee-orders${tag}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="z-20 flex items-center gap-3 border-b border-[var(--hairline)] bg-[var(--background)]/85 px-5 py-3 backdrop-blur lg:sticky lg:top-0 lg:px-10">
      <div className="hidden items-center gap-1.5 text-sm text-foreground/45 sm:flex">
        <span>Mesh</span>
        <span className="text-foreground/25">/</span>
        <span className="font-medium text-foreground/75">{title}</span>
      </div>

      {/* search — only on pages that actually filter by it */}
      {showSearch ? (
        <label className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-lg border border-[var(--hairline)] bg-surface px-2.5 py-1.5 text-foreground/50 focus-within:border-foreground/25">
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={pathname === "/live-orders" ? "Search customers, products…" : "Search products…"}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-foreground/30 hover:text-foreground/60"
            >
              ✕
            </button>
          ) : null}
        </label>
      ) : (
        <div className="ml-auto" />
      )}

      {/* live status — amber + "Reconnecting…" when the realtime socket drops,
          so a silent disconnect (stale data) is visible rather than a quiet gray dot */}
      <div
        className={`hidden items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs md:flex ${
          live
            ? "border-[var(--hairline)] bg-surface"
            : "border-amber-500/40 bg-amber-500/10"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${
              live ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-amber-500"}`}
          />
        </span>
        <span className={live ? "text-foreground/55" : "font-medium text-amber-700 dark:text-amber-400"}>
          {live ? `Live · ${agoLabel(lastUpdate, now)}` : "Reconnecting…"}
        </span>
      </div>

      <button
        onClick={exportCsv}
        aria-label="Export orders as CSV"
        className="flex items-center gap-1.5 rounded-lg border border-[var(--hairline)] bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/5"
      >
        <DownloadIcon />
        <span className="hidden sm:inline">Export</span>
      </button>

      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="rounded-lg border border-[var(--hairline)] bg-surface p-2 text-foreground/60 transition-colors hover:bg-foreground/5"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
}
