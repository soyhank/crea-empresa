import { z } from "zod";
import { fraccionSchema } from "./common";

/**
 * MÓDULO 8 · Proyección de ventas (36 meses)
 * Inputs propios: crecimiento anual e IGV. Lo demás se hereda de Mercado
 * (demanda mes base) y Costeo (PV, CVU, CFU).
 */
export const proyeccionVentasInputSchema = z.object({
  pctCrecimientoAnual: fraccionSchema.default(0.05),
  igv: fraccionSchema.default(0.18),
});
export type ProyeccionVentasInput = z.infer<typeof proyeccionVentasInputSchema>;

/** Compatibilidad: alias usado por el registro de módulos. */
export const ventasInputSchema = proyeccionVentasInputSchema;

/** Datos heredados (no editables). */
export interface ProyeccionVentasContext {
  demandaMesBase: number;
  precioVenta: number;
  cvu: number;
  cfu: number;
}

export interface MesProyeccion {
  mes: number;
  cantidad: number;
  ingresos: number;
  igvVentas: number;
  cv: number;
  cf: number;
  ct: number;
  igvCompras: number;
  igvAPagar: number;
  saldo: number;
}

export interface ResumenAnualVentas {
  anio: number;
  totalCantidad: number;
  totalIngresos: number;
  totalCV: number;
  totalCF: number;
  totalCT: number;
  totalIgvVentas: number;
  totalIgvCompras: number;
  totalIgvAPagar: number;
  saldoOperativo: number;
}

export interface ProyeccionVentasResult {
  meses: MesProyeccion[];
  anios: ResumenAnualVentas[];
  pctCrecimientoMensual: number;
}
