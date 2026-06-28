import { z } from "zod";
import { fraccionSchema, positivoSchema } from "./common";

/**
 * MÓDULO 6 · Depreciación y amortización (línea recta).
 * Los activos (montos) se heredan de Inversiones; el usuario elige la vida útil.
 * Salida: depreciación + amortización mensual → costos fijos de Costeo.
 */

/** Activo depreciable (construido desde Inversiones + vida útil elegida). */
export interface ActivoDepreciable {
  id: string;
  nombre: string;
  monto: number;
  vidaUtil: number;
  grupo: string;
}

/** Gasto pre-operativo amortizable (desde Inversiones). */
export interface GastoPreOperativo {
  id: string;
  nombre: string;
  monto: number;
  pctAmortizacion: number;
}

/**
 * Datos PROPIOS guardados: la vida útil elegida por activo (id → años) y el %
 * de amortización. Los montos/nombres se heredan de Inversiones en tiempo real.
 */
export const depreciacionInputSchema = z.object({
  vidasUtiles: z.record(z.string(), positivoSchema).default({}),
  pctAmortizacion: fraccionSchema.default(0.1),
  horizonteAnios: z.number().int().min(1).max(10).default(3),
});
export type DepreciacionInput = z.infer<typeof depreciacionInputSchema>;

/** Tasas SUNAT de referencia (solo visual). */
export const TABLA_SUNAT = [
  { tipo: "Construcciones", anios: 20, pct: 0.05 },
  { tipo: "Maquinaria y equipo", anios: 10, pct: 0.1 },
  { tipo: "Muebles y equipos de oficina", anios: 10, pct: 0.1 },
  { tipo: "Equipos de cómputo", anios: 3, pct: 0.3333 },
] as const;

/** Vida útil sugerida por grupo de Inversiones. */
export const VIDA_UTIL_SUGERIDA: Record<string, number> = {
  maquinariaEquipos: 10,
  equiposUtensilios: 10,
  equiposOficinaAdmin: 10,
  mueblesEnseres: 10,
};

export interface FilaDepreciacion {
  id: string;
  nombre: string;
  grupo: string;
  monto: number;
  vidaUtil: number;
  pctAnual: number;
  deprecAnual: number;
  deprecMensual: number;
}

export interface FilaAmortizacion {
  id: string;
  nombre: string;
  monto: number;
  pctAmortizacion: number;
  amortAnual: number;
  amortMensual: number;
}

export interface DepreciacionResult {
  filasDeprec: FilaDepreciacion[];
  filasAmort: FilaAmortizacion[];
  porGrupo: Array<{ grupo: string; anual: number; mensual: number }>;
  totalDeprecAnual: number;
  totalDeprecMensual: number;
  totalAmortAnual: number;
  totalAmortMensual: number;
  combinadoMensual: number;
  /** Tabla acumulada por año (depreciación total) para el horizonte. */
  acumuladaPorAnio: Array<{ anio: number; depreciacion: number; acumulada: number; valorResidual: number }>;
}
