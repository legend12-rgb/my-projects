"use client";

import { fmtMoney } from "@/lib/format";

type Country = { country: string; revenue: number; share: number };
type City = { city: string; revenue: number };

// Two-letter country codes instead of emoji flags: regional-indicator flag
// emoji don't render on Windows (they show as "US"/"GB" letter pairs), so a
// styled code chip looks consistent for every viewer, on any OS.
const CODES: Record<string, string> = {
  "United States": "US",
  Ireland: "IE",
  "United Kingdom": "GB",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  India: "IN",
};

function CountryCode({ country }: { country: string }) {
  const code = CODES[country] ?? "??";
  return (
    <span className="inline-flex h-4 min-w-[1.6rem] items-center justify-center rounded-[4px] bg-foreground/8 px-1 text-[9px] font-bold tracking-wide text-foreground/55">
      {code}
    </span>
  );
}

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
      <div className="space-y-2.5">
        {countries.slice(0, 4).map((c, i) => (
          <div key={c.country}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-foreground/75">
                <span className="flex h-4 w-4 items-center justify-center text-[10px] font-semibold text-foreground/35">
                  {i + 1}
                </span>
                <CountryCode country={c.country} />
                {c.country}
              </span>
              <span className="tabular-nums text-foreground/55">
                {fmtMoney(c.revenue)}
                <span className="ml-1.5 text-xs text-foreground/40">{c.share.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-foreground/8">
              <div
                className="h-2 rounded-full bg-[#c2703d] transition-[width] duration-300 ease-out"
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
