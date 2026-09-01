"use client";

import { fmtMoney } from "@/lib/format";

type Country = { country: string; revenue: number; share: number };
type City = { city: string; revenue: number };

export default function GeographyPanel({
  countries,
  usCities,
  topShare,
}: {
  countries: Country[];
  usCities: City[];
  topShare: number;
}) {
  const maxCity = usCities[0]?.revenue ?? 1;
  return (
    <div className="px-5 pb-5 pt-1">
      <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs leading-relaxed text-foreground/70">
        <span className="font-semibold text-red-500">Concentration risk: </span>
        {topShare.toFixed(0)}% of revenue comes from one country ({countries[0]?.country}).
      </div>
      <div className="space-y-2">
        {countries.slice(0, 4).map((c) => (
          <div key={c.country}>
            <div className="mb-0.5 flex justify-between text-sm">
              <span className="text-foreground/75">{c.country}</span>
              <span className="tabular-nums text-foreground/55">
                {fmtMoney(c.revenue)}
                <span className="ml-1.5 text-xs text-foreground/40">{c.share.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-foreground/8">
              <div
                className="h-2 rounded-full bg-[#c2703d]"
                style={{ width: `${c.share}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {usCities.length > 0 && (
        <>
          <div className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-foreground/40">
            Top US cities
          </div>
          <div className="space-y-1.5">
            {usCities.map((c) => (
              <div key={c.city} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 truncate text-foreground/65">{c.city}</span>
                <div className="h-2 flex-1 rounded-full bg-foreground/8">
                  <div
                    className="h-2 rounded-full bg-foreground/30"
                    style={{ width: `${(c.revenue / maxCity) * 100}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right tabular-nums text-foreground/50">
                  {fmtMoney(c.revenue)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
