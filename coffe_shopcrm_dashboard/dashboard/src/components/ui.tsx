import type { ReactNode } from "react";
import { typeColor } from "@/lib/colors";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--hairline)] bg-surface shadow-[0_1px_2px_rgba(28,26,23,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 px-5 pt-4">
      <h2 className="text-sm font-semibold tracking-tight text-foreground/85">{title}</h2>
      {hint ? <span className="text-xs text-foreground/50">{hint}</span> : null}
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

// Soft-bg + saturated-text status pills, matched to the reference's palette.
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "purple";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[#f1f0ed] text-[#6b6660] dark:bg-white/8 dark:text-foreground/70",
    green: "bg-[#d9f2e1] text-[#2f9257] dark:bg-emerald-500/15 dark:text-emerald-400",
    amber: "bg-[#fbe8cf] text-[#bd7524] dark:bg-amber-500/15 dark:text-amber-400",
    red: "bg-[#f9dadd] text-[#cf5257] dark:bg-red-500/15 dark:text-red-400",
    purple: "bg-[#ece9fe] text-[#6a5ae0] dark:bg-violet-500/15 dark:text-violet-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Directional delta pill (▲/▲) as seen on the reference's stat cards.
export function DeltaPill({
  value,
  positiveIsGood = true,
  suffix = "%",
}: {
  value: number;
  positiveIsGood?: boolean;
  suffix?: string;
}) {
  const up = value >= 0;
  const good = up === positiveIsGood;
  const tone = good ? "bg-[#d9f2e1] text-[#2f9257]" : "bg-[#f9dadd] text-[#cf5257]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${tone}`}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden>
        {up ? <path d="M4 1l3 5H1z" /> : <path d="M4 7L1 2h6z" />}
      </svg>
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

// A neutral info pill (label-style), no direction.
export function InfoPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" }) {
  const tones: Record<string, string> = {
    neutral: "bg-[#f1f0ed] text-[#6b6660] dark:bg-white/8 dark:text-foreground/70",
    green: "bg-[#d9f2e1] text-[#2f9257] dark:bg-emerald-500/15 dark:text-emerald-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function SectionHeader({
  label,
  note,
  id,
}: {
  label: string;
  note?: string;
  id?: string;
}) {
  return (
    <div id={id} className="mb-3 mt-8 flex scroll-mt-20 items-baseline gap-3 first:mt-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground/55">
        {label}
      </h2>
      <div className="h-px flex-1 bg-foreground/10" />
      {note ? <span className="text-xs text-foreground/45">{note}</span> : null}
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
    <div className="rounded-xl bg-[#c2703d]/6 p-4 dark:bg-[#c2703d]/10">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#c2703d]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c2703d]" />
        {kicker}
      </div>
      <div className="mt-1.5 text-sm font-semibold leading-snug">{headline}</div>
      <div className="mt-1.5 text-xs leading-relaxed text-foreground/55">{detail}</div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  extra,
}: {
  title: string;
  description?: string;
  extra?: ReactNode;
}) {
  return (
    <header className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-foreground/50">{description}</p> : null}
      </div>
      {extra}
    </header>
  );
}

export function PageSkeleton({ tiles = 4 }: { tiles?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: tiles }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-foreground/5" />
      ))}
    </div>
  );
}

// Distinct per-coffee-type colors — brings the tables to life like the
// reference's colored brand icons, without pretending to be real logos.
export function TypeAvatar({ type }: { type: string }) {
  const color = typeColor(type);
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] text-[11px] font-bold text-white"
      style={{ background: color }}
      title={type}
    >
      {type.slice(0, 1)}
    </span>
  );
}

// Deterministic soft-tinted initial avatar for customer names.
const AVATAR_HUES = [18, 152, 262, 200, 340, 96];
export function InitialAvatar({ name }: { name: string }) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  const hue = AVATAR_HUES[h % AVATAR_HUES.length];
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
      style={{
        background: `hsl(${hue} 55% 92%)`,
        color: `hsl(${hue} 55% 38%)`,
      }}
    >
      {initials}
    </span>
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
