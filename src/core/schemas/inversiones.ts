import { z } from "zod";
import { idSchema, montoSchema, positivoSchema } from "./common";

/**
 * MÓDULO 5 · Inversiones
 * Activos tangibles/intangibles + capital de trabajo + gastos preoperativos.
 */

export const categoriaActivoSchema = z.enum(["tangible", "intangible"]);
export type CategoriaActivo = z.infer<typeof categoriaActivoSchema>;

export const activoSchema = z.object({
  id: idSchema,
  nombre: z.string().min(1, "Nombre del activo"),
  categoria: categoriaActivoSchema,
  cantidad: z.number().int().min(1).default(1),
  costoUnitario: montoSchema,
  /** Vida útil en años (para depreciación / amortización). */
  vidaUtilAnios: positivoSchema,
});
export type Activo = z.infer<typeof activoSchema>;

export const inversionesInputSchema = z.object({
  activos: z.array(activoSchema),
  /** Capital de trabajo (meses de operación cubiertos). */
  capitalTrabajo: montoSchema.default(0),
  gastosPreoperativos: montoSchema.default(0),
});
export type InversionesInput = z.infer<typeof inversionesInputSchema>;
