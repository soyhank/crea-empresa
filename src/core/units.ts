/**
 * Catálogo de unidades de medida y conversión para Costeo.
 *
 * Cada insumo tiene:
 *  - una unidad de COMPRA (a la que se refiere el precio, ej. "kg"),
 *  - y el requerimiento se ingresa en una unidad cómoda de la misma dimensión
 *    (ej. "g"); el sistema convierte el requerimiento a la unidad de compra.
 *
 * `base` = cuántas unidades-base equivale (base de masa = kg, de volumen = L,
 * de conteo = unidad). El factor de conversión entre dos unidades de la misma
 * dimensión es base(desde) / base(hacia).
 */
export type Dimension = "masa" | "volumen" | "conteo";

export interface Unidad {
  clave: string;
  label: string;
  dim: Dimension;
  base: number;
}

export const UNIDADES: Record<string, Unidad> = {
  kg: { clave: "kg", label: "kg", dim: "masa", base: 1 },
  g: { clave: "g", label: "g", dim: "masa", base: 0.001 },
  L: { clave: "L", label: "L", dim: "volumen", base: 1 },
  ml: { clave: "ml", label: "ml", dim: "volumen", base: 0.001 },
  unidad: { clave: "unidad", label: "unidad", dim: "conteo", base: 1 },
  docena: { clave: "docena", label: "docena", dim: "conteo", base: 12 },
  millar: { clave: "millar", label: "millar", dim: "conteo", base: 1000 },
};

/** Sinónimos frecuentes → clave canónica (tolera datos antiguos y tipeos). */
const SINONIMOS: Record<string, string> = {
  kg: "kg", kilo: "kg", kilos: "kg", kilogramo: "kg", kilogramos: "kg",
  g: "g", gr: "g", grs: "g", gramo: "g", gramos: "g",
  l: "L", lt: "L", litro: "L", litros: "L",
  ml: "ml", mililitro: "ml", mililitros: "ml",
  unidad: "unidad", unidades: "unidad", unid: "unidad", und: "unidad", u: "unidad", uni: "unidad",
  docena: "docena", docenas: "docena",
  millar: "millar", millares: "millar",
};

/** Normaliza un texto de unidad a su clave del catálogo (o undefined). */
export function normalizeUnidad(u?: string | null): string | undefined {
  if (!u) return undefined;
  const key = u.trim().toLowerCase();
  const canon = SINONIMOS[key];
  return canon && UNIDADES[canon] ? canon : UNIDADES[u] ? u : undefined;
}

/**
 * Factor para convertir una cantidad de `desde` a `hacia`.
 * - Si alguna no se reconoce → 1 (se asume que ya están en la misma unidad).
 * - Si son de distinta dimensión → 1 (no se puede convertir; la UI lo evita).
 */
export function factorConversion(desde?: string | null, hacia?: string | null): number {
  const d = normalizeUnidad(desde);
  const h = normalizeUnidad(hacia);
  if (!d || !h) return 1;
  if (UNIDADES[d].dim !== UNIDADES[h].dim) return 1;
  return UNIDADES[d].base / UNIDADES[h].base;
}

/** Claves de unidades compatibles (misma dimensión) con la unidad dada. */
export function unidadesCompatibles(u?: string | null): string[] {
  const k = normalizeUnidad(u);
  if (!k) return Object.keys(UNIDADES);
  const dim = UNIDADES[k].dim;
  return Object.values(UNIDADES).filter((x) => x.dim === dim).map((x) => x.clave);
}

/** Sub-unidad cómoda por defecto para ingresar el requerimiento, por dimensión. */
export function subUnidadPorDefecto(u?: string | null): string {
  const k = normalizeUnidad(u);
  const dim = k ? UNIDADES[k].dim : "masa";
  return dim === "masa" ? "g" : dim === "volumen" ? "ml" : "unidad";
}
