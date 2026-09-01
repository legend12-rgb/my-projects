import { fmtMoney, fmtNum } from "@/lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-foreground/4 px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-foreground/40">
        {label}
      </div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export default function RangeRecap({
  revenue,
  profit,
  orders,
}: {
  revenue: number;
  profit: number;
  orders: number;
}) {
  return (
    <div className="mb-1 grid grid-cols-3 gap-2.5">
      <Stat label="Revenue" value={fmtMoney(revenue)} />
      <Stat label="Profit" value={fmtMoney(profit)} />
      <Stat label="Orders" value={fmtNum(orders)} />
    </div>
  );
}
