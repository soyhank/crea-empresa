import { z } from "zod";
import { positivoSchema, fraccionSchema } from "./common";

/**
 * MÓDULO 8 · Proyección de ventas
 * Toma la demanda (módulo Mercado) y la proyecta a N años con crecimiento.
 */

export const ventasInputSchema = z.object({
  precioVenta: positivoSchema,
  /** Crecimiento anual de la demanda (fracción, p. ej. 0.02 = 2%). */
  crecimientoAnual: fraccionSchema.default(0.02),
  horizonteAnios: z.number().int().min(1).max(10).default(3),
  /** Crecimiento poblacional anual aplicado al universo. */
  crecimientoPoblacional: fraccionSchema.default(0.02),
});
export type VentasInput = z.infer<typeof ventasInputSchema>;
