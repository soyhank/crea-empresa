import { z } from "zod";
import { fraccionSchema, montoSchema } from "./common";

/**
 * MÓDULO 10 · Estados financieros (EERR + Estado de Situación + Ratios)
 * Mayormente derivado; aquí van supuestos contables.
 */

export const estadosFinancierosInputSchema = z.object({
  tasaImpuesto: fraccionSchema.default(0.295),
  /** Capital aportado por los socios (patrimonio inicial). */
  capitalSocial: montoSchema.default(0),
  /** Deuda / financiamiento externo inicial. */
  deudaInicial: montoSchema.default(0),
  tasaInteresDeuda: fraccionSchema.default(0),
});
export type EstadosFinancierosInput = z.infer<typeof estadosFinancierosInputSchema>;
