import { z } from "zod";
import { idSchema, montoSchema, positivoSchema } from "./common";

/**
 * MÓDULO 3 · Costeo (MP, costos fijos y variables, costo unitario)
 * Tablas editables: nunca rangos fijos.
 */

export const insumoSchema = z.object({
  id: idSchema,
  nombre: z.string().min(1, "Nombre del insumo"),
  unidad: z.string().min(1, "Unidad (kg, L, unid)"),
  /** Cantidad por unidad de producto. */
  cantidadPorUnidad: montoSchema,
  precioUnitario: montoSchema,
});
export type Insumo = z.infer<typeof insumoSchema>;

export const costoFijoSchema = z.object({
  id: idSchema,
  concepto: z.string().min(1),
  montoMensual: montoSchema,
});
export type CostoFijo = z.infer<typeof costoFijoSchema>;

export const costoVariableSchema = z.object({
  id: idSchema,
  concepto: z.string().min(1),
  /** Costo por unidad de producto. */
  costoPorUnidad: montoSchema,
});
export type CostoVariable = z.infer<typeof costoVariableSchema>;

export const costeoInputSchema = z.object({
  /** Materia prima por unidad de producto. */
  materiaPrima: z.array(insumoSchema),
  costosFijos: z.array(costoFijoSchema),
  costosVariables: z.array(costoVariableSchema),
  /** Margen de ganancia objetivo sobre el costo (fracción). */
  margenGanancia: z.number().min(0).default(0.3),
  /** Unidades producidas al mes (para prorratear costos fijos). */
  unidadesMensuales: positivoSchema.optional(),
  /** Servicio de terceros / maquila por unidad (escenario "con tercero"). */
  costoTerceroPorUnidad: montoSchema.optional(),
});
export type CosteoInput = z.infer<typeof costeoInputSchema>;
