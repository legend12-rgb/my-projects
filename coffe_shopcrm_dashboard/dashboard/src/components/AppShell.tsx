"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import TopBar from "./TopBar";

const NAV = [
  { href: "/", label: "Overview", icon: "grid" },
  { href: "/customers", label: "Customers", icon: "users" },
  { href: "/inventory", label: "Inventory & live", icon: "box" },
  { href: "/live-orders", label: "Live orders", icon: "pulse" },
] as const;

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none" } as const;
  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="6" cy="5.5" r="2.3" stroke="currentColor" strokeWidth="1.4" />
          <path d="M1.8 14c.4-2.6 2.2-4 4.2-4s3.8 1.4 4.2 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="11.5" cy="5.8" r="1.7" stroke="currentColor" strokeWidth="1.3" />
          <path d="M10.3 14c.15-1.8 1.2-3.1 2.7-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="M2 5l6-3 6 3-6 3-6-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M2 5v6l6 3 6-3V5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M8 8v6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...common}>
          <path
            d="M1.5 8h2.7l1.5-4 2.2 8L9.6 6l1 2h3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function CupIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 7h10v5.5A3.5 3.5 0 0 1 10.5 16h-3A3.5 3.5 0 0 1 4 12.5V7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 8.5h1a2 2 0 0 1 0 4h-1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 4c0 .8-.7 1-.7 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9.5 4c0 .8-.7 1-.7 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DataStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-foreground/45">{label}</span>
      <span className="text-xs font-semibold tabular-nums text-foreground/75">{value}</span>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  live,
  stats,
}: {
  pathname: string;
  onNavigate: () => void;
  live: boolean;
  stats: { orders: number; products: number; customers: number };
}) {
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c2703d] text-white">
          <CupIcon />
        </span>
        <div>
          <div className="text-sm font-semibold leading-tight">Coffee Shop</div>
          <div className="text-xs text-foreground/45">Live CRM Analytics</div>
        </div>
      </div>

      <div className="mb-1 mt-5 px-5 text-[10px] font-semibold uppercase tracking-wider text-foreground/30">
        Workspace
      </div>
      <nav className="flex flex-col gap-0.5 px-3">
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ease-out ${
                isActive
                  ? "bg-[#c2703d]/10 text-[#c2703d]"
                  : "text-foreground/60 hover:bg-foreground/6 hover:text-foreground/85"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Honest dataset panel — real counts, fills the sidebar meaningfully. */}
      <div className="mx-3 mt-6 rounded-xl border border-[var(--hairline)] bg-foreground/[0.02] p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
            Dataset
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {live ? "synced" : "offline"}
          </span>
        </div>
        <div className="space-y-1.5">
          <DataStat label="Orders" value={fmt(stats.orders)} />
          <DataStat label="Products" value={fmt(stats.products)} />
          <DataStat label="Customers" value={fmt(stats.customers)} />
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--hairline)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/8 text-[11px] font-semibold text-foreground/60">
            SD
          </span>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-foreground/75">Supabase · Realtime</div>
            <div className="truncate text-[11px] text-foreground/40">anon key · read-only</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { live, orders, products, custCount } = useDashboard();
  const [mobileOpen, setMobileOpen] = useState(false);
  const stats = { orders: orders.length, products: products.length, customers: custCount };

  return (
    <div className="min-h-full">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 overflow-y-auto border-r border-[var(--hairline)] bg-surface lg:block">
        <SidebarContent pathname={pathname} onNavigate={() => {}} live={live} stats={stats} />
      </aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/6 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-white/8 dark:bg-neutral-950/90">
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#c2703d] text-white">
            <CupIcon />
          </span>
          <span className="text-sm font-semibold">Coffee Shop CRM</span>
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-foreground/60 hover:bg-foreground/8"
        >
          <MenuIcon />
        </button>
      </div>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-64 bg-white shadow-2xl transition-transform duration-200 ease-out dark:bg-neutral-950 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-end px-3 pt-3">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="rounded-md p-1.5 text-foreground/50 hover:bg-foreground/8"
            >
              <CloseIcon />
            </button>
          </div>
          <SidebarContent
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            live={live}
            stats={stats}
          />
        </div>
      </div>

      <main className="lg:pl-60">
        <TopBar />
        {children}
      </main>
    </div>
  );
}
