// Single warm accent for revenue / neutral money bars (espresso amber).
export const ACCENT = "#c2703d";
export const ACCENT_SOFT = "rgba(194, 112, 61, 0.85)";

// Distinct per-coffee-type palette — the chart identity color for each type.
// Deliberately NOT green-dominant: caramel / red-brown / teal-blue / violet.
export const TYPE_COLOR: Record<string, string> = {
  Arabica: "#c2703d", // caramel
  Robusta: "#b5524a", // red-brown
  Excelsa: "#2f8fa3", // teal-blue
  Liberica: "#7a5cc4", // violet
};
export const typeColor = (t: string) => TYPE_COLOR[t] ?? "#8a7a6a";

// Margin color scale: low margin -> red, high margin -> green.
// The four coffee types span 6% (Robusta) to 13% (Liberica).
export function marginColor(marginPct: number, lo = 6, hi = 13): string {
  const t = Math.max(0, Math.min(1, (marginPct - lo) / (hi - lo)));
  const hue = 8 + t * (148 - 8); // 8 = red, 148 = green
  return `hsl(${hue}, 62%, 46%)`;
}

// Stock health color (matches the products table tone logic).
export function stockColor(n: number): string {
  if (n <= 5) return "hsl(8, 62%, 50%)";
  if (n <= 15) return "hsl(38, 85%, 50%)";
  return "hsl(148, 45%, 46%)";
}
