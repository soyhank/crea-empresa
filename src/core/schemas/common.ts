import { z } from "zod";

/**
 * Helpers compartidos por los esquemas de módulo.
 * Zod es la única fuente de verdad: de aquí se derivan tipos, validación de
 * formularios y validación en el borde (API / persistencia).
 */

/** Identificador de fila para tablas editables ("+ Agregar fila"). */
export const idSchema = z.string().min(1);

/** Porcentaje almacenado como fracción 0..1 (la UI lo muestra como %). */
export const fraccionSchema = z
  .number({ invalid_type_error: "Debe ser un número" })
  .min(0, "No puede ser negativo")
  .max(1, "No puede superar 100%");

/** Monto en soles (no negativo). */
export const montoSchema = z
  .number({ invalid_type_error: "Debe ser un número" })
  .min(0, "No puede ser negativo");

/** Cantidad entera no negativa. */
export const enteroSchema = z
  .number({ invalid_type_error: "Debe ser un número" })
  .int("Debe ser entero")
  .min(0, "No puede ser negativo");

/** Número positivo (> 0). */
export const positivoSchema = z
  .number({ invalid_type_error: "Debe ser un número" })
  .gt(0, "Debe ser mayor que 0");

/**
 * Refinamiento reutilizable: una lista de fracciones debe sumar 1 (±tolerancia).
 * Ej.: "El NSE debe sumar 100%".
 */
export function sumaUno(getter: (val: number[]) => number = (v) => v.reduce((a, b) => a + b, 0)) {
  return (vals: number[]) => Math.abs(getter(vals) - 1) <= 0.0001;
}
