import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-black/8 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between px-5 pt-4">
      <h2 className="text-sm font-semibold tracking-tight text-foreground/80">{title}</h2>
      {hint ? <span className="text-xs text-foreground/40">{hint}</span> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
      {sub ? <div className="mt-1 text-xs text-foreground/45">{sub}</div> : null}
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-foreground/8 text-foreground/70",
    green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/15 text-red-600 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function SectionHeader({ label, note }: { label: string; note?: string }) {
  return (
    <div className="mb-3 mt-8 flex items-baseline gap-3 first:mt-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground/45">
        {label}
      </h2>
      <div className="h-px flex-1 bg-foreground/10" />
      {note ? <span className="text-xs text-foreground/35">{note}</span> : null}
    </div>
  );
}

export function DemoTag({ children = "demo data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
      {children}
    </span>
  );
}

export function Finding({
  kicker,
  headline,
  detail,
}: {
  kicker: string;
  headline: string;
  detail: string;
}) {
  return (
    <Card className="border-l-2 border-l-[#c2703d] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#c2703d]">
        {kicker}
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug">{headline}</div>
      <div className="mt-1.5 text-xs leading-relaxed text-foreground/55">{detail}</div>
    </Card>
  );
}

export function LivePill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  );
}
