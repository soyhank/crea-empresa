import { z } from "zod";
import { fraccionSchema } from "./common";

/**
 * MÓDULO 9 · Flujo de caja (3 escenarios + COK → VANE / TIRE / Payback)
 */

export const escenarioSchema = z.object({
  clave: z.enum(["optimista", "moderado", "pesimista"]),
  /** Factor sobre la demanda/ventas base (1 = igual al moderado). */
  factorVentas: z.number().min(0).default(1),
});
export type Escenario = z.infer<typeof escenarioSchema>;

export const flujoCajaInputSchema = z.object({
  /** Costo de oportunidad del capital (tasa de descuento). */
  cok: fraccionSchema.default(0.12),
  horizonteAnios: z.number().int().min(1).max(10).default(3),
  escenarios: z.array(escenarioSchema).length(3).default([
    { clave: "optimista", factorVentas: 1.15 },
    { clave: "moderado", factorVentas: 1 },
    { clave: "pesimista", factorVentas: 0.85 },
  ]),
  /** Tasa de impuesto a la renta (fracción). */
  tasaImpuesto: fraccionSchema.default(0.295),
});
export type FlujoCajaInput = z.infer<typeof flujoCajaInputSchema>;
