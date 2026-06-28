import { z } from "zod";
import { fraccionSchema } from "./common";

/**
 * MÓDULO 9 · Flujo de caja (3 escenarios + COK → VANE / TIRE / Payback)
 * Inputs por escenario: inflación, tasa de mercado, riesgo del inversionista.
 * Heredados: inversión inicial (Inversiones) y totales anuales (Ventas).
 */
export const escenarioFlujoSchema = z.object({
  clave: z.enum(["optimista", "moderado", "pesimista"]),
  inflacion: fraccionSchema,
  tasaMercado: fraccionSchema,
  riesgoInversionista: fraccionSchema,
});
export type EscenarioFlujo = z.infer<typeof escenarioFlujoSchema>;

export const flujoCajaInputSchema = z.object({
  escenarios: z.array(escenarioFlujoSchema).length(3),
  pctIR: fraccionSchema.default(0.295),
});
export type FlujoCajaInput = z.infer<typeof flujoCajaInputSchema>;

/** Totales anuales heredados de Proyección de ventas. */
export interface FlujoAnioInput {
  ingresos: number;
  costosFijos: number;
  costosVariables: number;
  igvAPagar: number;
}

export interface FlujoAnioResult {
  anio: number;
  ingresos: number;
  costosFijos: number;
  costosVariables: number;
  egresos: number;
  flujoOperativo: number;
  igvPagado: number;
  flujoAntesIR: number;
  impuestoRenta: number;
  flujoEconomico: number;
}

export interface FlujoEscenarioResult {
  clave: EscenarioFlujo["clave"];
  cok: number;
  anios: FlujoAnioResult[];
  flujos: number[]; // [año0 = -inversión, ...flujoEconomico]
  vane: number;
  tire: number;
  payback: number;
}

export interface FlujoCajaResult {
  inversionInicial: number;
  escenarios: FlujoEscenarioResult[];
}
