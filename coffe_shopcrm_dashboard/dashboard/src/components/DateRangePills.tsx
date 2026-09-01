"use client";

import { RANGE_PRESETS, type CustomRange, type RangeKey } from "@/lib/dateRange";

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path
        d="M3 8.5L6.2 11.5L13 4.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DateRangePills({
  value,
  onChange,
  custom,
  onCustomChange,
}: {
  value: RangeKey;
  onChange: (r: RangeKey) => void;
  custom: CustomRange;
  onCustomChange: (c: CustomRange) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {RANGE_PRESETS.map((p) => {
        const active = value === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-foreground/60 hover:bg-foreground/8"
            }`}
          >
            {active ? <CheckIcon /> : null}
            {p.label}
          </button>
        );
      })}
      <span className="mx-1 h-4 w-px bg-foreground/15" />
      <button
        onClick={() => onChange("custom")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          value === "custom"
            ? "bg-foreground text-background"
            : "text-foreground/60 hover:bg-foreground/8"
        }`}
      >
        {value === "custom" ? <CheckIcon /> : null}
        Custom
      </button>
      {value === "custom" ? (
        <span className="flex items-center gap-1.5">
          <input
            type="date"
            value={custom.from}
            onChange={(e) => onCustomChange({ ...custom, from: e.target.value })}
            className="rounded-md border border-foreground/15 bg-transparent px-2 py-1 text-xs text-foreground/75 outline-none focus:border-foreground/40"
          />
          <span className="text-foreground/30">→</span>
          <input
            type="date"
            value={custom.to}
            onChange={(e) => onCustomChange({ ...custom, to: e.target.value })}
            className="rounded-md border border-foreground/15 bg-transparent px-2 py-1 text-xs text-foreground/75 outline-none focus:border-foreground/40"
          />
        </span>
      ) : null}
    </div>
  );
}
