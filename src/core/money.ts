/**
 * Utilidades numéricas del dominio.
 *
 * Principio: el motor calcula SIEMPRE con doble precisión (sin redondear en
 * pasos intermedios) para reproducir exactamente la cadena del Excel K-KORI.
 * El redondeo es una decisión de PRESENTACIÓN, nunca de cálculo ni persistencia.
 */

/** Redondea a `decimales` posiciones (por defecto 2). Solo para mostrar. */
export function round(value: number, decimales = 2): number {
  if (!Number.isFinite(value)) return 0;
  const f = 10 ** decimales;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Suma segura de una lista de números (ignora NaN/undefined). */
export function sum(values: Array<number | undefined | null>): number {
  return values.reduce<number>((acc, v) => acc + (Number.isFinite(v as number) ? (v as number) : 0), 0);
}

/** Producto de fracciones; vacío => 1 (elemento neutro). */
export function product(values: number[]): number {
  return values.reduce((acc, v) => acc * v, 1);
}

/**
 * Fracción exacta a partir de conteos enteros de una encuesta (fi/total).
 * Devuelve 0 si total es 0. Mantiene plena precisión (no redondea).
 */
export function fraccion(seleccionadas: number, total: number): number {
  if (!total) return 0;
  return seleccionadas / total;
}

const fmtPEN = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtNum = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const fmtPct = new Intl.NumberFormat("es-PE", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

/** S/ 1,234.50 */
export function formatPEN(value: number): string {
  return fmtPEN.format(Number.isFinite(value) ? value : 0);
}

/** 1,234.5 (sin símbolo) */
export function formatNumber(value: number, decimales = 2): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  }).format(value);
}

/** Entero con separador de miles: 1,255,300 */
export function formatInteger(value: number): string {
  return fmtNum.format(Math.round(Number.isFinite(value) ? value : 0));
}

/** 0.62 -> "62.0 %" */
export function formatPercent(fraction: number): string {
  return fmtPct.format(Number.isFinite(fraction) ? fraction : 0);
}
