import { z } from "zod";

/**
 * MÓDULO 6 · Depreciación / Amortización
 * Deriva de Inversiones. Aquí solo se configuran parámetros del método.
 */

export const metodoDepreciacionSchema = z.enum(["lineal"]);
export type MetodoDepreciacion = z.infer<typeof metodoDepreciacionSchema>;

export const depreciacionInputSchema = z.object({
  metodo: metodoDepreciacionSchema.default("lineal"),
  /** Horizonte de evaluación en años (alinea con el flujo de caja). */
  horizonteAnios: z.number().int().min(1).max(10).default(3),
  /** Valor residual como fracción del costo (0 = sin residual). */
  valorResidual: z.number().min(0).max(1).default(0),
});
export type DepreciacionInput = z.infer<typeof depreciacionInputSchema>;
