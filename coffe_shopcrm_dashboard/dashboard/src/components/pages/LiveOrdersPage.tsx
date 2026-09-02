"use client";

import { useMemo } from "react";
import { useDashboard } from "@/lib/DashboardContext";
import { fmtMoney, isToday, plural } from "@/lib/format";
import { Card, LivePill, PageHeader, PageSkeleton, StatCard } from "../ui";
import LiveOrders from "../LiveOrders";

export default function LiveOrdersPage() {
  const { ready, feed, orders, live, newestId } = useDashboard();

  const today = useMemo(() => {
    let rev = 0,
      n = 0;
    for (const o of orders)
      if (isToday(o.order_date)) {
        rev += o.total_amount;
        n++;
      }
    return { rev, n };
  }, [orders]);

  // Avg order value across the recent feed — a live signal you can act on,
  // unlike the feed's fixed size (which is just the fetch cap).
  const feedAov = useMemo(() => {
    if (feed.length === 0) return 0;
    const sum = feed.reduce((s, o) => s + Number(o.total_amount), 0);
    return sum / feed.length;
  }, [feed]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
      <PageHeader
        title="Live orders"
        description="Realtime feed — new sales prepend instantly, no polling"
        extra={live ? <LivePill /> : <span className="text-xs text-foreground/40">connecting…</span>}
      />

      {!ready ? (
        <PageSkeleton tiles={2} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Today's revenue"
              value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                today.rev,
              )}
              sub={`${today.n} ${plural(today.n, "order")} since midnight`}
            />
            <StatCard
              label="Avg order value"
              value={fmtMoney(feedAov)}
              sub={`across the last ${feed.length} ${plural(feed.length, "order")}`}
            />
          </div>

          <div className="mt-4">
            <Card>
              <LiveOrders orders={feed} newestId={newestId} maxHeight={720} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
