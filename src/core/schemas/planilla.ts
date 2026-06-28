import { z } from "zod";
import { idSchema, montoSchema, fraccionSchema } from "./common";

/**
 * MÓDULO 4 · Planilla
 * Cuadro de remuneraciones. El gasto mensual total alimenta los costos fijos
 * del módulo Costeo.
 */

export const trabajadorSchema = z.object({
  id: idSchema,
  cargo: z.string().min(1, "Cargo"),
  baseMensual: montoSchema,
  bonificacion: montoSchema.default(0),
  /** Monto fijo de SIS (seguro). */
  sis: montoSchema.default(0),
  /** Contador externo / recibo por honorarios → false (sin cargas ni provisiones). */
  aplicaProvisiones: z.boolean().default(true),
});
export type Trabajador = z.infer<typeof trabajadorSchema>;

export const planillaInputSchema = z.object({
  trabajadores: z.array(trabajadorSchema).min(1, "Agrega al menos un trabajador"),
  /** Aporte a pensiones (AFP/ONP). */
  pctPensiones: fraccionSchema.default(0.13),
  /** Provisión de gratificación (1/24 ≈ 4.17%). */
  factorGratificacion: fraccionSchema.default(1 / 24),
  /** Provisión de vacaciones (1/12 ≈ 8.33%). */
  factorVacaciones: fraccionSchema.default(1 / 12),
  /** CTS: en K-KORI no aplica; reservado para cálculo futuro. */
  ctsAplica: z.boolean().default(false),
});
export type PlanillaInput = z.infer<typeof planillaInputSchema>;

/** Resultado derivado (nunca se persiste). */
export interface TrabajadorResult {
  id: string;
  remBruta: number;
  pensiones: number;
  remNeta: number;
  provGratificacion: number;
  provVacaciones: number;
  gastoMensual: number;
}

export interface PlanillaResult {
  trabajadores: TrabajadorResult[];
  nTrabajadores: number;
  totalBruta: number;
  totalPensiones: number;
  totalProvisiones: number;
  totalGastoMensual: number;
}
