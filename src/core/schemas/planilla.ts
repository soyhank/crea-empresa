import { z } from "zod";
import { idSchema, montoSchema, fraccionSchema } from "./common";

/**
 * MÓDULO 4 · Planilla
 * Tabla editable de puestos con cargas sociales (Perú: ESSALUD, CTS, gratific.).
 */

export const puestoSchema = z.object({
  id: idSchema,
  cargo: z.string().min(1, "Cargo"),
  cantidad: z.number().int().min(1).default(1),
  sueldoBruto: montoSchema,
});
export type Puesto = z.infer<typeof puestoSchema>;

export const planillaInputSchema = z.object({
  puestos: z.array(puestoSchema),
  /** ESSALUD (9% típico). */
  tasaEssalud: fraccionSchema.default(0.09),
  /** Gratificaciones: 2 sueldos/año => factor mensual ~0.1667. */
  factorGratificaciones: fraccionSchema.default(0.1667),
  /** CTS: ~1 sueldo/año => factor mensual ~0.0833. */
  factorCts: fraccionSchema.default(0.0833),
});
export type PlanillaInput = z.infer<typeof planillaInputSchema>;
