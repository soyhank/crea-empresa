import { z } from "zod";

/**
 * MÓDULO 7 · Punto de equilibrio
 * No tiene inputs propios: CVU, PV y CFT se heredan de Costeo y la demanda de
 * Mercado. PE (unid) = CFT / (PV − CVU); PE (S/) = CFT / (1 − CVU/PV).
 */
export const puntoEquilibrioInputSchema = z.object({});
export type PuntoEquilibrioInput = z.infer<typeof puntoEquilibrioInputSchema>;
