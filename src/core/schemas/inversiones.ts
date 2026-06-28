import { z } from "zod";
import { idSchema, montoSchema } from "./common";

/**
 * MÓDULO 5 · Inversiones
 * Pre-operativos + activo fijo (4 grupos) + capital de trabajo (heredado de
 * Costeo) → inversión total y aporte por socio. Alimenta Depreciación, Flujo
 * de caja y Situación financiera.
 */

export const itemInversionSchema = z.object({
  id: idSchema,
  rubro: z.string().min(1, "Rubro"),
  cantidad: z.number().min(0, "No puede ser negativo").default(1),
  precio: montoSchema,
});
export type ItemInversion = z.infer<typeof itemInversionSchema>;

export const activoFijoSchema = z.object({
  maquinariaEquipos: z.array(itemInversionSchema).default([]),
  equiposUtensilios: z.array(itemInversionSchema).default([]),
  equiposOficinaAdmin: z.array(itemInversionSchema).default([]),
  mueblesEnseres: z.array(itemInversionSchema).default([]),
});
export type ActivoFijo = z.infer<typeof activoFijoSchema>;

/** Campos PROPIOS (editados aquí). El capital de trabajo se hereda de Costeo. */
export const inversionesInputSchema = z.object({
  preOperativos: z.array(itemInversionSchema).default([]),
  activoFijo: activoFijoSchema,
  numSocios: z.number().int("Debe ser entero").min(1, "Al menos un socio").default(1),
  nombresSocios: z.array(z.string()).default([]),
});
export type InversionesInput = z.infer<typeof inversionesInputSchema>;

/** Capital de trabajo heredado de Costeo (mensual). */
export interface CapitalTrabajo {
  costoVariable: number;
  costoFijo: number;
}

export interface InversionesResult {
  totalPreOperativos: number;
  totalMaquinaria: number;
  totalUtensilios: number;
  totalOficina: number;
  totalMuebles: number;
  totalActivoFijo: number;
  totalCapitalTrabajo: number;
  inversionTotal: number;
  aportePorSocio: number;
  /** Agrupación para Depreciación / Situación financiera. */
  grupoMaquinariaEquipo: number;
  grupoMueblesEnseres: number;
}
