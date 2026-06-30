import { z } from "zod";
import { idSchema, montoSchema, fraccionSchema, positivoSchema } from "./common";

/**
 * MÓDULO 3 · Costeo
 * MP (materia prima por caja) + MOD (mano de obra directa) = CVU.
 * CFU = costos fijos mensuales / demanda mensual (del módulo Mercado).
 * CTU = CVU + CFU → margen → valor venta → IGV → precio de venta.
 */

/** Insumo de materia prima (precio × requerimiento por unidad de producto). */
export const insumoSchema = z.object({
  id: idSchema,
  nombre: z.string().min(1, "Nombre del insumo"),
  /** Unidad de COMPRA: el precio se refiere a esta unidad (kg, L, unidad…). */
  medida: z.string().min(1, "Unidad (kg, unid)"),
  /**
   * Unidad en la que el alumno ingresa el requerimiento (g, ml, unidad…). Si se
   * omite, se asume que el requerimiento ya está en la unidad de compra (modo
   * legado). El cálculo convierte requerimiento → unidad de compra.
   */
  unidadRequerimiento: z.string().optional(),
  precioUnitario: montoSchema,
  /** Requerimiento por unidad de producto, en `unidadRequerimiento`. */
  requerimiento: montoSchema,
});
export type Insumo = z.infer<typeof insumoSchema>;

/** Proceso de mano de obra directa. */
export const procesoMODSchema = z.object({
  id: idSchema,
  proceso: z.string().min(1, "Nombre del proceso"),
  /** Sueldo mensual del operario. */
  sueldo: montoSchema,
  /** Minutos que toma producir una unidad. */
  minutos: montoSchema,
  /** Eficiencia (0..1). */
  eficiencia: fraccionSchema,
});
export type ProcesoMOD = z.infer<typeof procesoMODSchema>;

/** Costo fijo mensual. */
export const costoFijoSchema = z.object({
  id: idSchema,
  concepto: z.string().min(1, "Concepto"),
  monto: montoSchema,
});
export type CostoFijo = z.infer<typeof costoFijoSchema>;

export const costeoInputSchema = z.object({
  materiaPrima: z.array(insumoSchema).min(1, "Agrega al menos un insumo"),
  manoObra: z.array(procesoMODSchema).min(1, "Agrega al menos un proceso"),
  costosFijos: z.array(costoFijoSchema).min(1, "Agrega al menos un costo fijo"),
  /** Minutos productivos disponibles por operario al mes. */
  minutosDisponiblesMes: positivoSchema.default(11589.75),
  /** Margen de ganancia sobre el costo total unitario. */
  margen: fraccionSchema.default(0.3),
  /** IGV aplicado al valor de venta. */
  igv: fraccionSchema.default(0.18),
});
export type CosteoInput = z.infer<typeof costeoInputSchema>;

/** Resultado derivado (nunca se persiste). */
export interface CosteoResult {
  insumosTotales: Array<{ id: string; total: number }>;
  modPorProceso: Array<{ id: string; valor: number }>;
  mpUnitario: number;
  mod: number;
  costoVariableUnitario: number;
  costosFijosMensuales: number;
  costoFijoUnitario: number;
  costoTotalUnitario: number;
  margenValor: number;
  valorVenta: number;
  igvValor: number;
  precioVenta: number;
}
