const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const fmtMoney = (n: number) => money.format(n || 0);

export const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n || 0);

// Returns the correct word for a count ("1 order" vs "2 orders"); pair with
// fmtNum for the number itself: `${fmtNum(n)} ${plural(n, "order")}`.
export const plural = (n: number, singular: string, pluralForm = `${singular}s`) =>
  n === 1 ? singular : pluralForm;

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtDateTime = (iso: string) => `${fmtDate(iso)} ${fmtTime(iso)}`;

// YYYY-MM-DD in the viewer's local zone (used to bucket sales by day).
export const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const isToday = (iso: string) => dayKey(iso) === dayKey(new Date().toISOString());
