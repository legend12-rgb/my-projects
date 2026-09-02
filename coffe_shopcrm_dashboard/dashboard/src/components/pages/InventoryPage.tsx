"use client";

import { useDashboard } from "@/lib/DashboardContext";
import { hourly, kpis } from "@/lib/analytics";
import { Card, CardHeader, PageHeader, PageSkeleton } from "../ui";
import ProductsTable from "../ProductsTable";
import ProductRestockBoard from "../ProductRestockBoard";
import InventoryActivity from "../InventoryActivity";
import HourlyChart from "../HourlyChart";
import ExpandableChart from "../ExpandableChart";
import RangeRecap from "../RangeRecap";

export default function InventoryPage() {
  const { ready, products, movements, orders, idx } = useDashboard();

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
      <PageHeader
        title="Inventory & live"
        description="Current stock, the restock/sale ledger, and order timing"
      />

      {!ready ? (
        <PageSkeleton tiles={3} />
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Products" hint="live stock · synthetic" />
            <ProductsTable products={products} />
          </Card>
          <ProductRestockBoard products={products} />
          <Card>
            <CardHeader title="Inventory activity" hint="live ledger" />
            <InventoryActivity movements={movements} products={products} />
          </Card>
          <ExpandableChart
            title="Orders by hour"
            hint="9am–8pm, no daypart signal"
            demoTag="uniform · synthetic"
            orders={orders}
            compute={(o) => hourly(o)}
            renderChart={(data) => <HourlyChart data={data} height={320} />}
            renderExpanded={(data) => <HourlyChart data={data} height={380} />}
            recap={(_, filtered) => {
              const rk = kpis(filtered, idx);
              return <RangeRecap revenue={rk.revenue} profit={rk.profit} orders={rk.orders} />;
            }}
          />
        </div>
      )}
    </div>
  );
}
