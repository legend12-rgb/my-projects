"use client";

import { fmtMoney } from "@/lib/format";

type Props = {
  memberAOV: number;
  nonAOV: number;
  memberFreq: number;
  nonFreq: number;
  signupRate: number;
};

function Compare({
  label,
  member,
  non,
  fmt,
}: {
  label: string;
  member: number;
  non: number;
  fmt: (n: number) => string;
}) {
  const lift = non ? ((member - non) / non) * 100 : 0;
  const flat = Math.abs(lift) < 8;
  return (
    <div className="rounded-lg bg-foreground/4 p-3">
      <div className="text-[11px] uppercase tracking-wide text-foreground/45">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums">{fmt(member)}</span>
        <span className="text-xs text-foreground/40">member</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums text-foreground/60">{fmt(non)}</span>
        <span className="text-xs text-foreground/40">non-member</span>
      </div>
      <div
        className={`mt-1 text-xs font-medium ${
          flat ? "text-foreground/45" : lift > 0 ? "text-emerald-600" : "text-red-500"
        }`}
      >
        {flat ? "≈ no difference" : `${lift > 0 ? "+" : ""}${lift.toFixed(0)}%`}
      </div>
    </div>
  );
}

export default function LoyaltyScorecard({
  memberAOV,
  nonAOV,
  memberFreq,
  nonFreq,
  signupRate,
}: Props) {
  return (
    <div className="px-5 pb-5 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <Compare label="Avg order value" member={memberAOV} non={nonAOV} fmt={fmtMoney} />
        <Compare
          label="Orders / customer"
          member={memberFreq}
          non={nonFreq}
          fmt={(n) => n.toFixed(2)}
        />
      </div>
      <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-foreground/70">
        <span className="font-semibold text-amber-600 dark:text-amber-400">Finding: </span>
        {signupRate.toFixed(0)}% of customers hold a card, but they spend and order at
        essentially the same rate as non-members. The program isn&apos;t driving bigger or more
        frequent baskets — its value, if any, is retention, not lift.
      </div>
    </div>
  );
}
