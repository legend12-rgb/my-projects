"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { AnalyticsOrder } from "@/lib/types";
import { filterByRange, type CustomRange, type RangeKey } from "@/lib/dateRange";
import ChartModal, { ExpandIcon } from "./ChartModal";
import DateRangePills from "./DateRangePills";
import { Card, DemoTag } from "./ui";

export default function ExpandableChart<T>({
  title,
  hint,
  demoTag,
  orders,
  compute,
  renderChart,
  renderExpanded,
  recap,
  emptyLabel = "No orders in this range.",
}: {
  title: string;
  hint?: string;
  demoTag?: string;
  orders: AnalyticsOrder[];
  compute: (orders: AnalyticsOrder[]) => T;
  renderChart: (data: T) => ReactNode;
  renderExpanded?: (data: T) => ReactNode;
  recap?: (data: T, filtered: AnalyticsOrder[]) => ReactNode;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<RangeKey>("all");
  const [custom, setCustom] = useState<CustomRange>({ from: "", to: "" });

  const previewData = useMemo(() => compute(orders), [orders, compute]);
  const filtered = useMemo(() => filterByRange(orders, range, custom), [orders, range, custom]);
  const expandedData = useMemo(() => compute(filtered), [filtered, compute]);

  return (
    <>
      <Card>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex w-full items-start justify-between gap-3 px-5 pt-4 text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground/80">{title}</h2>
              {demoTag ? <DemoTag>{demoTag}</DemoTag> : null}
            </div>
            {hint ? <p className="mt-0.5 text-xs text-foreground/40">{hint}</p> : null}
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-foreground/35 opacity-0 transition-opacity group-hover:bg-foreground/8 group-hover:text-foreground/65 group-hover:opacity-100">
            <ExpandIcon /> Expand
          </span>
        </button>
        <button
          type="button"
          aria-label={`Expand ${title}`}
          onClick={() => setOpen(true)}
          className="block w-full cursor-pointer text-left transition-opacity hover:opacity-90"
        >
          {renderChart(previewData)}
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
              {recap ? <div className="px-4 pt-4">{recap(expandedData, filtered)}</div> : null}
              {(renderExpanded ?? renderChart)(expandedData)}
            </>
          )}
        </div>
      </ChartModal>
    </>
  );
}
