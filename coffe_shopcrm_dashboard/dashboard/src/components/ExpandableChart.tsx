"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { AnalyticsOrder } from "@/lib/types";
import { filterByRange, type CustomRange, type RangeKey } from "@/lib/dateRange";
import ChartModal, { ExpandIcon } from "./ChartModal";
import DateRangePills from "./DateRangePills";
import { Card, DemoTag } from "./ui";

const INLINE_PRESETS: { key: RangeKey; short: string }[] = [
  { key: "30d", short: "30D" },
  { key: "90d", short: "90D" },
  { key: "180d", short: "6M" },
  { key: "all", short: "ALL" },
];

export default function ExpandableChart<T>({
  title,
  hint,
  demoTag,
  orders,
  compute,
  renderChart,
  renderExpanded,
  recap,
  renderExtra,
  emptyLabel = "No orders in this range.",
  inlineRange = false,
}: {
  title: string;
  hint?: string;
  demoTag?: string;
  orders: AnalyticsOrder[];
  compute: (orders: AnalyticsOrder[]) => T;
  renderChart: (data: T) => ReactNode;
  renderExpanded?: (data: T) => ReactNode;
  recap?: (data: T, filtered: AnalyticsOrder[]) => ReactNode;
  /** Extra content rendered inside the modal, below the chart (gets the
   *  range-filtered raw orders) — e.g. a per-day order drill-down. */
  renderExtra?: (filtered: AnalyticsOrder[]) => ReactNode;
  emptyLabel?: string;
  /** Show a compact 30D/90D/6M/ALL segmented control in the card header itself,
   *  sharing range state with the modal (instead of only being changeable there). */
  inlineRange?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<RangeKey>("all");
  const [custom, setCustom] = useState<CustomRange>({ from: "", to: "" });

  const filtered = useMemo(() => filterByRange(orders, range, custom), [orders, range, custom]);
  const previewData = useMemo(() => compute(filtered), [filtered, compute]);

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-semibold tracking-tight text-foreground/80">
                  {title}
                </h2>
                {demoTag ? <DemoTag>{demoTag}</DemoTag> : null}
              </div>
              {hint ? <p className="mt-0.5 text-xs text-foreground/40">{hint}</p> : null}
            </div>
            <span className="hidden shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-foreground/35 opacity-0 transition-opacity duration-150 ease-out group-hover:bg-foreground/8 group-hover:text-foreground/65 group-hover:opacity-100 sm:flex">
              <ExpandIcon /> Expand
            </span>
          </button>
          {inlineRange ? (
            <div
              className="flex shrink-0 items-center gap-0.5 rounded-full bg-foreground/6 p-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {INLINE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setRange(p.key)}
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold transition-colors duration-150 ease-out ${
                    range === p.key
                      ? "bg-white text-foreground shadow-sm dark:bg-neutral-700"
                      : "text-foreground/45 hover:text-foreground/70"
                  }`}
                >
                  {p.short}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={`Expand ${title}`}
          onClick={() => setOpen(true)}
          className="block w-full cursor-pointer text-left transition-opacity duration-150 ease-out hover:opacity-90"
        >
          {filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center px-5 text-sm text-foreground/40">
              {emptyLabel}
            </div>
          ) : (
            renderChart(previewData)
          )}
        </button>
      </Card>

      <ChartModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        hint={hint}
        headerExtra={
          <DateRangePills
            value={range}
            onChange={setRange}
            custom={custom}
            onCustomChange={setCustom}
          />
        }
      >
        <div className="p-1">
          {filtered.length === 0 ? (
            <div className="flex h-56 items-center justify-center px-5 text-sm text-foreground/40">
              {emptyLabel}
            </div>
          ) : (
            <>
              {recap ? <div className="px-4 pt-4">{recap(previewData, filtered)}</div> : null}
              {(renderExpanded ?? renderChart)(previewData)}
              {renderExtra ? renderExtra(filtered) : null}
            </>
          )}
        </div>
      </ChartModal>
    </>
  );
}
